import { prisma } from './db';
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import { Payload, verifyJwtToken } from './jwt';
import { decode } from 'jsonwebtoken';
import z from "zod"

export const createContext = async ({ req }: CreateFastifyContextOptions) => {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      const user = decode(token) as Payload;

      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          hashedPassword: true,
          admin: true,
        },
      });

      if (!dbUser || !verifyJwtToken(token, dbUser.hashedPassword)) {
        return null;
      }

      return {
        ...user,
        admin: dbUser.admin,
      };
    }

    return null;
  }

  const user = await getUserFromHeader();

  console.log(req.url);

  return {
    prisma,
    user,
  };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error, path }) {
    return {
      path,
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

const userIsAuthed = t.middleware(({ ctx, next }) => {
  if (ctx.user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      prisma,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(userIsAuthed);

export const userIsInChannel = protectedProcedure
  .input(
    z.object({
      channelId: z.number().or(z.string()),
    })
  )
  .use(async ({ ctx, input, next, path }) => {
    const channel = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId,
      },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      }
    })

    console.log(path, channel?.id);
    if (!channel) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  

    if (!channel.users.find(user => user.id === ctx.user.id)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        prisma,
        user: ctx.user,
      },
    });
  })

const userIsAuthorOrSuperAdminCheck = userIsInChannel
  .use(async ({ ctx, input, next }) => {
    if (ctx.user.admin) {
      return next({
        ctx: {
          prisma,
          user: ctx.user,
          channel: undefined
        },
      });
    }

    const channel = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId,
      },
      select: {
        group: {
          select: {
            authorId: true,
            Admin: {
              where: {
                id: ctx.user.id
              },
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!channel) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (channel.group?.authorId !== ctx.user.id) {
      return next({
        ctx: {
          prisma,
          user: ctx.user,
          channel
        },
      });
    }

    return next({
      ctx: {
        prisma,
        user: ctx.user,
        channel: undefined
      },
    });
  });

export const userIsAuthorOrSuperAdmin = userIsAuthorOrSuperAdminCheck.use(async ({ ctx, input, next }) => {
  if (ctx.channel !== undefined) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      prisma,
      user: ctx.user,
    },
  });
});

export const userIsAuthorOrSuperAdminOrAdmin = userIsAuthorOrSuperAdminCheck.use(
  async ({ ctx, input, next }) => {
    if (ctx.channel === undefined) {
      return next({
        ctx: {
          prisma,
          user: ctx.user,
        },
      });
    }

    if (ctx.channel && (ctx.channel as any).group?.Admin[0].id === ctx.user.id) {
      return next({
        ctx: {
          prisma,
          user: ctx.user,
        },
      });
    }

    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
);

export const userHasAdminRights = userIsInChannel.use(async ({ ctx, input, next }) => {
  if (ctx.user.admin) {
    return next({
      ctx: {
        prisma,
        user: ctx.user,
      },
    });
  }

  const channel = await ctx.prisma.channel.findUnique({
    where: {
      id: +input.channelId,
    },
    select: {
      group: {
        select: {
          authorId: true,
        },
      },
    },
  });

  if (!channel) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  if (channel.group?.authorId !== ctx.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      prisma,
      user: ctx.user,
    },
  });
});

const groupVisibility = protectedProcedure
  .input(z.object({
    channelId: z.number()
  }))
  .use(async ({ ctx, input, next }) => {
    const group = await ctx.prisma.channel.findUnique({
      where: {
        id: +input.channelId
      },
      select: {
        group: {
          select: {
            visibility: true
          }
        }
      }
    })

    if (!group || !group.group) throw new TRPCError({ code: "NOT_FOUND" });

    return next({
      ctx: {
        prisma,
        user: ctx.user,
        visibility: group.group.visibility,
      },
    });
  })

export const groupIsPublic = groupVisibility.use(async ({ ctx, next }) => {
  if (ctx.visibility === 0) {
    return next({
      ctx: {
        prisma,
        user: ctx.user,
      },
    });
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
})

export const groupIsPrivate = groupVisibility.use(async ({ ctx, next }) => {
  if (ctx.visibility === 0) {
    return next({
      ctx: {
        prisma,
        user: ctx.user,
      },
    });
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
});


