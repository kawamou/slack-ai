import { Middleware, AnyMiddlewareArgs } from "@slack/bolt";

export const checkChannelNameMiddleware: Middleware<
  AnyMiddlewareArgs
> = async ({ payload, next }) => {
  if (!("channel" in payload)) {
    return;
  }
  const channelId = (payload as any).channel;
  console.log(`Channel ID: ${channelId}`);
  if (channelId == process.env.CHANNEL_ID) {
    await next();
  } else {
    console.log("Ignore message from the same channel");
    return;
  }
};
