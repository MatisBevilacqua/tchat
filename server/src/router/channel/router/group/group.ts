import { putAdmin } from './function/putAdmin';
import { getInfo } from './function/getInfo';
import { quit } from './function/quit';
import { turnTheWheel } from './function/turnTheWheel';
import { createJoinRequest } from './function/createJoinRequest';
import { join } from './function/join';
import { changeVisibility } from './function/changeVisibility';
import { search } from './function/search';
import { removeMember } from './function/removeMember';
import { editTitle } from './function/editTitle';
import { router } from "../../../../trpc";
import { deleteGroup } from './function/delete';

export const groupRouter = router({
  editTitle,
  removeMember,
  // addMembers: userIsAuthorOrSuperAdmin
  //   .input(z.object({
  //     channelId: z.number(),
  //     membersIds: z.array(z.number())
  //   }))
  //   .mutation(async ({ ctx, input }) => {
  //     const group = await ctx.prisma.channel.findUnique({
  //       where: {
  //         id: input.channelId,
  //       },
  //       select: {
  //         id: true,
  //         group: {
  //           select: {
  //             id: true,
  //             authorId: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!group?.group) throw new TRPCError({ code: "NOT_FOUND" });

  //     await ctx.prisma.channel.update({
  //       where: {
  //         id: group.id,
  //       },
  //       data: {
  //         users: {
  //           connect: input.membersIds.map((id) => ({ id })),
  //         },
  //       },
  //     });

  //     ev.emit("addMembers", {
  //       channelId: input.channelId,
  //       membersIds: input.membersIds
  //     })

  //     return undefined
  //   }),
  delete: deleteGroup,
  search,
  changeVisibility,
  join,
  createJoinRequest,
  turnTheWheel,
  quit,
  getInfo,
  putAdmin,
})
