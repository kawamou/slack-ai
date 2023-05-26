import {
  App,
  Middleware,
  SlackEventMiddlewareArgs,
  AnyMiddlewareArgs,
} from "@slack/bolt";
import * as dotenv from "dotenv";
import { ExampleBlock } from "./example_block";
import {
  checkChannelNameMiddleware,
  mentionToSelfMiddleware,
} from "./middleware";

dotenv.config();

import { Context, completion, completionWithContext } from "./openai_client";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: (process.env.PORT || 3000) as number,
  customRoutes: [
    {
      path: "/ping",
      method: "GET",
      handler: async (req, res) => {
        res.writeHead(200);
        res.end("pong");
      },
    },
  ],
});

app.use(checkChannelNameMiddleware);

// hello というメッセージが送られてきたら返信する（サンプルコード寄せ集め）
app.message("hello", async ({ message, say, client }) => {
  // 現状下記の型ガードを書かなくてはエラーが発生する
  // ref. https://github.com/slackapi/bolt-js/issues/904#issuecomment-1200453256
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
});

// ボタンクリックに反応する
app.action("button_click", async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

const LOADING_TEXT = `:loading: 回答を生成中（長文を生成する場合は時間がかかります）`;

// メンションで答える ref. https://zenn.dev/yukiueda/articles/ef0f085f2bef8e
app.event(
  "app_mention",
  mentionToSelfMiddleware,
  async ({ event, client, say }) => {
    const timestamp = event.thread_ts || event.ts;

    const res = await say({
      thread_ts: timestamp,
      text: LOADING_TEXT,
    });

    const messagesResponse = await client.conversations.replies({
      channel: event.channel,
      ts: timestamp,
    });
    const messages = messagesResponse.messages?.sort(
      (a, b) => Number(a.ts) - Number(b.ts)
    );

    const context: Context = messages!
      .slice(1)
      .slice(-20)
      .filter((m) => !m.text?.includes(LOADING_TEXT))
      .map((m) => {
        const role = m.bot_id ? "assistant" : "user";
        return { role: role, content: m.text ?? "" };
      });

    const result = await completionWithContext(context, event.text);

    console.log(result);

    if (res.ts && res.channel) {
      await client.chat.update({
        channel: res.channel,
        ts: res.ts,
        text: `${result}`,
      });
    }
  }
);

(async () => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
