import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { Context, completionWithContext } from "../infra/openai_client";

const LOADING_TEXT = `:loading: 回答を生成中（長文を生成する場合は時間がかかります）`;

// https://zenn.dev/yukiueda/articles/ef0f085f2bef8e
export const aiDialogueHandler = async ({
  event,
  client,
  say,
}: SlackEventMiddlewareArgs<"app_mention"> &
  AllMiddlewareArgs<Record<string, unknown>>) => {
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

  if (res.ts && res.channel) {
    await client.chat.update({
      channel: res.channel,
      ts: res.ts,
      text: `${result}`,
    });
  }
};
