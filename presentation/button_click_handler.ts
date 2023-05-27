import {
  App,
  SlackActionMiddlewareArgs,
  SlackAction,
  AllMiddlewareArgs,
} from "@slack/bolt";

export const buttonClickHandler = async ({
  body,
  ack,
  say,
}: SlackActionMiddlewareArgs<SlackAction> &
  AllMiddlewareArgs<Record<string, unknown>>) => {
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
};
