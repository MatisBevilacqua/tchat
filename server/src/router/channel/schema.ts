import { z } from "zod";

export const createChannelInput = z.number().or(z.array(z.number()));

export function isPrivateOrGroup(
  input: z.infer<typeof createChannelInput>
): input is number {
  return typeof input === "number" ? true : false;
}

const privateChannel = z.object({
  type: z.literal("private"),
  id: z.number(),
  users: z.array(z.number()),
});

const groupChannel = z.object({
  type: z.literal("group"),
  id: z.number(),
  users: z.array(z.number()),
  title: z.string(),
  description: z.string(),
  authorId: z.number(),
  visibility: z.number(),
  admins: z.array(z.number()),
});

export const createChannelOutput = privateChannel.or(groupChannel);

export const diffChannels = z.union([privateChannel, groupChannel]);

export const channelsList = z.array(diffChannels);
