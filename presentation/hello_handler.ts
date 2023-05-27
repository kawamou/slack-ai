import { SlackEventMiddlewareArgs, App, AllMiddlewareArgs } from "@slack/bolt";
import { ExampleBlock } from "./example_block";

export const helloHandler = async ({
  message,
  say,
  client,
}: SlackEventMiddlewareArgs<"message"> &
  AllMiddlewareArgs<Record<string, unknown>>) => {
  if (
    message.subtype !== "message_deleted" &&
    message.subtype !== "message_replied" &&
    message.subtype !== "message_changed"
  ) {
    await say({
      blocks: ExampleBlock(`@${message.user}`),
      text: `Hey there <@${message.user}>!`,
    });
  }
};
