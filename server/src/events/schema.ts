import type { Message } from "../../../schema"
import { WebSocket } from "ws";
import z from "zod"
import { sendFactory } from "../helpers/event";

export const messageSchema = z.custom<Message>()
export const newGroupTitleSchema = z.object({
  title: z.string().trim().min(2).max(50),
  channelId: z.number(),
})
export const removeMemberSchema = z.object({
  channelId: z.string(),
  memberId: z.number()
})
export const addMemberSchema = z.object({
  channelId: z.string(),
  membersIds: z.array(z.number())
})
export const deleteGroupSchema = z.object({
  channelId: z.number(),
  users: z.array(z.number()),
})
export const changeVisibilitySchema = z.object({
  channelId: z.number(),
  visibility: z.number(),
})
export const memberJoinSchema = z.object({
  channelId: z.number(),
  userId: z.number(),
})
export const putAdminSchema = removeMemberSchema;
export const newGroupPicture = z.object({
  channelId: z.number(),
  profilePicture: z.string(),
})
export const newProfilePicture = z.object({
  userId: z.number(),
  profilePicture: z.string(),
})

const allSchema = z.union([
  messageSchema,
  newGroupTitleSchema,
  removeMemberSchema,
  addMemberSchema,
  deleteGroupSchema,
  changeVisibilitySchema,
  memberJoinSchema,
  putAdminSchema,
  newGroupPicture,
  newProfilePicture,
]);

export interface IMapUser {
  id: number;
  ws: WebSocket;
}

type AllSchema = z.infer<typeof allSchema>;

export type IdToTokens = Map<string, Set<string>>;
export type UsersMap = Map<string, IMapUser>;

export interface Args<Schema extends AllSchema> {
  payload: Schema;
  users: UsersMap;
  idToTokens: IdToTokens;
  sendToIds: ReturnType<typeof sendFactory>;
}
