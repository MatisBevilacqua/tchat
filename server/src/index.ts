import { createContext, router } from "./trpc";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import dotenv from "dotenv";
import { userRouter } from "./router/user/user";
import { channelRouter } from "./router/channel/channel";
import { EventEmitter } from "ws";
import { prisma } from "./db";
import { decode } from "jsonwebtoken";
import { Payload, verifyJwtToken } from "./jwt";
import { createMessageEvent } from "./events/message";
import {
  IMapUser,
  addMemberSchema,
  changeVisibilitySchema,
  deleteGroupSchema,
  memberJoinSchema,
  messageSchema,
  newGroupPicture,
  newGroupTitleSchema,
  removeMemberSchema,
} from "./events/schema";
import z from "zod";
import { sendFactory } from "./helpers/event";
import {
  addMembersEvent,
  changeVisibilityEvent,
  deleteGroupEvent,
  memberJoinEvent,
  newGroupPictureEvent,
  newGroupTitleEvent,
  putAdminEvent,
  removeMemberEvent,
} from "./events/channel";
import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { pipeline } from "stream";
import util from "util";
import fs from "fs";

dotenv.config();

const pump = util.promisify(pipeline);

const appRouter = router({
  user: userRouter,
  channel: channelRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc/",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

server.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "Authorization"],
  strictPreflight: false,
  // credentials: true,
  maxAge: 86400,
})

server.register(require("@fastify/multipart"))

const users = new Map<string, IMapUser>();
const idToTokens = new Map<string, Set<string>>();

server.register(fastifyWebsocket, {
  options: {
    maxPayload: 1048576,
  },
});

server.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, async (connection, req) => {
    connection.socket.on("message", async (message) => {
      (connection.socket as any).isAlive = true;
      
      if (message.toString() === "ping") {
        connection.socket.send(JSON.stringify({ event: "pong" }));
        heartbeat.bind(connection.socket as any)();
        return;
      }
      let parse = z
        .object({
          event: z.literal("init"),
          payload: z.string(),
        })
        .safeParse(JSON.parse(message.toString()));

      if (!parse.success) return;

      const event = parse.data;
      const token = event.payload;

      if (!token) {
        connection.socket.send(JSON.stringify({ error: "No token provided" }));
        connection.socket.terminate();
        return;
      }

      const jwt = decode(token) as Payload;

      if (!jwt) {
        connection.socket.send(JSON.stringify({ error: "Invalid token" }));
        connection.socket.terminate();
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: jwt.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          hashedPassword: true,
        },
      });

      if (!user) {
        connection.socket.send(JSON.stringify({ error: "Invalid token" }));
        connection.socket.terminate();
        return;
      }

      if (!verifyJwtToken(token, user.hashedPassword)) {
        connection.socket.send(JSON.stringify({ error: "Invalid token" }));
        connection.socket.terminate();
        return;
      }

      const tokens = idToTokens.get(user.id.toString());

      if (!tokens) {
        idToTokens.set(user.id.toString(), new Set([token]));
      } else {
        idToTokens.set(user.id.toString(), tokens.add(token));
      }

      connection.socket.once("close", (e, a) => {
        console.log(e, a.toString());

        users.delete(token);

        const tokens = idToTokens.get(user.id.toString());

        if (!tokens) return;

        tokens.delete(token);

        if (tokens.size === 0) {
          return idToTokens.delete(user.id.toString());
        }

        idToTokens.set(user.id.toString(), tokens);
        console.log(`➖ Connection (${users.size})`);
      });

      users.set(token, {
        id: user.id,
        ws: connection.socket,
      });

      console.log(`➕ Connection (${users.size})`);
    });
  });
});

// post audio message
server.post("/create/audioMessage/:channelId", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }

  const jwt = decode(token) as Payload;
  const channelId = (req.params as any).channelId;

  if (!jwt) {
    return res.status(401).send({ error: "Invalid token" });
  } else if (!channelId) {
    return res.status(400).send({ error: "No channel id provided" });
  }

  const channel = await prisma.channel.findUnique({
    where: {
      id: +channelId,
    },
    select: {
      id: true,
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!channel) {
    return res.status(404).send({ error: "Channel not found" });
  } else if (!channel.users.some((user) => user.id === jwt.id)) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const data = await (req as any).file();

  console.time("upload");
  const message = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        authorId: jwt.id,
        channelId: channel.id,
        content: "",
      },
    });

    fs.mkdirSync(`./uploads/channels/${channel.id}/audios/`, { recursive: true });
    await pump(
      data.file,
      fs.createWriteStream(`./uploads/channels/${channel.id}/audios/${message.id}.m4a`)
    );
    
    return tx.message.update({
      where: {
        id: message.id,
      },
      data: {
        audioFile: `${message.id}.m4a`
      }
    })
  })
  console.timeEnd("upload");

  ev.emit("createMessage", message)

  res.send({ ok: true });
});

// get audio message
server.get("/audioMessage/:channelId/:messageId", async (req, res) => {
  const channelId = (req.params as any).channelId;
  const messageId = (req.params as any).messageId;

  if (!channelId) {
    return res.status(400).send({ error: "No channel id provided" });
  } else if (!messageId) {
    return res.status(400).send({ error: "No message id provided" });
  }

  // const token = req.headers.authorization?.split(" ")[1];

  // if (!token) {
  //   return res.status(401).send({ error: "No token provided" });
  // }

  // const jwt = decode(token) as Payload;

  // if (!jwt) {
  //   return res.status(401).send({ error: "Invalid token" });
  // }

  const channel = await prisma.channel.findUnique({
    where: {
      id: +channelId,
    },
    select: {
      id: true,
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  // if (!channel) {
  //   return res.status(404).send({ error: "Channel not found" });
  // } else if (!channel.users.some((user) => user.id === jwt.id)) {
  //   return res.status(403).send({ error: "Forbidden" });
  // }
  
  res.header("Content-Type", "audio/m4a");
  return res.send(fs.createReadStream(`./uploads/channels/${channel.id}/audios/${messageId}`));
});

server.post("/profilePicture/:channelId", async (req, res) => {
  const channelId = (req.params as any).channelId;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }

  const jwt = decode(token) as Payload;

  if (!jwt) {
    return res.status(401).send({ error: "Invalid token" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: jwt.id,
    },
    select: {
      id: true,
      admin: true,
    },
  });

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  if (channelId) {

    let authorized = false;

    const channel = await prisma.channel.findUnique({
      where: {
        id: +channelId,
      },
      select: {
        id: true,
        group: {
          select: {
            authorId: true,
            Admin: {
              where: {
                id: user.id,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!channel?.group) {
      return res.status(404).send({ error: "Channel not found" });
    }

    if (user.admin) {
      authorized = true;
    } else if (!authorized && channel.group.authorId === user.id) {
      authorized = true;
    } else if (!authorized && channel.group.Admin.some((admin) => admin.id === user.id)) {
      authorized = true;
    } else {
      return res.status(403).send({ error: "Forbidden" });
    }

    const data = await (req as any).file();

    fs.rmdirSync(`./uploads/channels/${channel.id}/profilePicture/`, { recursive: true });
    fs.mkdirSync(`./uploads/channels/${channel.id}/profilePicture/`, {
      recursive: true,
    });
    await pump(
      data.file,
      fs.createWriteStream(`./uploads/channels/${channel.id}/profilePicture/picture.${data.filename.split(".").at(-1)}`)
    );

    await prisma.channel.update({
      where: {
        id: channel.id,
      },
      data: {
        group: {
          update: {
            profilePicture: `picture.${data.filename.split(".").at(-1)}`,
          }
        }
      },
    });

    ev.emit("newGroupPicture", {
      channelId: channel.id,
      profilePicture: `picture.${data.filename.split(".").at(-1)}`
    })

    return res.send({ ok: true });
  }

  const data = await (req as any).file();

  fs.rmdirSync(`./uploads/users/${user.id}/profilePicture/`, { recursive: true });
  fs.mkdirSync(`./uploads/users/${user.id}/profilePicture/`, {
    recursive: true,
  });
  await pump(
    data.file,
    fs.createWriteStream(`./uploads/users/${user.id}/profilePicture/picture.${data.filename.split(".").at(-1)}`)
  );

  ev.emit("newProfilePicture", {
    userId: user.id,
    profilePicture: `picture.${data.filename.split(".").at(-1)}`
  })

  return res.send({ ok: true });
});

server.get("/profilePicture/:channelOrUser/:id", async (req, res) => {
  const id = (req.params as any).id;
  const channelOrUser = (req.params as any).channelOrUser;

  if (!id) {
    return res.status(400).send({ error: "No id provided" });
  }

  if (!channelOrUser) {
    return res.status(400).send({ error: "No channel or user provided" });
  }

  if (channelOrUser === "channel") {
    const channel = await prisma.channel.findUnique({
      where: {
        id: +id,
      },
      select: {
        id: true,
        group: {
          select: {
            profilePicture: true,
          },
        },
      },
    });

    if (!channel?.group) {
      return res.status(404).send({ error: "Channel not found" });
    } else if (!channel.group.profilePicture) {
      return res.status(404).send({ error: "Profile picture not found" });
    }

    res.header("Content-Type", `image/${channel.group.profilePicture.split(".").at(-1)}`);
    return res.send(fs.createReadStream(`./uploads/channels/${channel.id}/profilePicture/${channel.group?.profilePicture}`));
  }

  const user = await prisma.user.findUnique({
    where: {
      id: +id,
    },
    select: {
      id: true,
      profilePicture: true,
    },
  });

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  } else if (!user.profilePicture) {
    return res.status(404).send({ error: "Profile picture not found" });
  }

  res.header("Content-Type", `image/${user.profilePicture.split(".").at(-1)}`);
  return res.send(fs.createReadStream(`./uploads/users/${user.id}/profilePicture/${user.profilePicture}`));
});

function heartbeat(this: { isAlive: boolean }) {
  this.isAlive = true;
}

console.log("✅ WebSocket Server listening on ws://localhost:3000");

const sendToIds = sendFactory(idToTokens, users);

export const ev = new EventEmitter();

ev.on("createMessage", (message: z.infer<typeof messageSchema>) =>
  createMessageEvent({
    payload: message,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("newGroupTitle", (payload: z.infer<typeof newGroupTitleSchema>) =>
  newGroupTitleEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("removeMember", (payload: z.infer<typeof removeMemberSchema>) =>
  removeMemberEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("addMembers", (payload: z.infer<typeof addMemberSchema>) =>
  addMembersEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  })
);

ev.on("deleteGroup", (payload: z.infer<typeof deleteGroupSchema>) => {
  deleteGroupEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("changeVisibility", (payload: z.infer<typeof changeVisibilitySchema>) => {
  changeVisibilityEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("memberJoin", (payload: z.infer<typeof memberJoinSchema>) => {
  memberJoinEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("putAdmin", (payload: z.infer<typeof memberJoinSchema>) => {
  putAdminEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

ev.on("newGroupPicture", (payload: z.infer<typeof newGroupPicture>) => {
  newGroupPictureEvent({
    payload,
    users,
    idToTokens,
    sendToIds,
  });
});

(async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server started");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
