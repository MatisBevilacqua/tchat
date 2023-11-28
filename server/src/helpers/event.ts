import { IdToTokens, UsersMap } from "../events/schema";

export function sendFactory(idToTokens: IdToTokens, users: UsersMap) {
  return function sendToIds(ids: (number | string)[], event: any, payload: any) {
    for (const user of ids) {
      const tokens = idToTokens.get(user.toString());

      if (!tokens) continue;

      for (const token of tokens) {
        users.get(token)?.ws.send(
          JSON.stringify({
            event,
            payload,
          }),
          (e) => {
            if (e) console.error(e)
          }
        );
      }
    }
  }
}
