import {
  App,
  Middleware,
  SlackEventMiddlewareArgs,
  AnyMiddlewareArgs,
} from "@slack/bolt";
import * as dotenv from "dotenv";
import { ExampleBlock } from "./example_block";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

dotenv.config();

import { completions } from "./openai_client";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: (process.env.PORT || 3000) as number,
});

// これ必要じゃないかも. Appへのメンションのみが反応するようになっている？
const mentionToSelfMiddleware: Middleware<
  SlackEventMiddlewareArgs<"app_mention">
> = async ({ event, next }) => {
  console.log(event.text);
  if (event.text.includes(`${process.env.BOT_ID}`)) {
    next();
  }
};

// グローバルミドルウェア
// // ミドルウェアのサンプル
// const middleware: Middleware<AnyMiddlewareArgs> = async ({ next }) => {
//     next();
//   };

// app.use(middleware);

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

// メンションで答える
// ref. https://zenn.dev/yukiueda/articles/ef0f085f2bef8e
app.event(
  "app_mention",
  mentionToSelfMiddleware,
  async ({ event, client, say }) => {
    const res = await say({
      text: `:loading: 回答を生成中（長文を生成する場合は時間がかかります）`,
    });

    console.log(res);

    const result = await completions(event.text);

    console.log(result);

    if (res.ts && res.channel) {
      await client.chat.update({
        channel: res.channel,
        ts: res.ts,
        text: `<@${event.user}>\n ${result}`,
      });
    }
  }
);

(async () => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
