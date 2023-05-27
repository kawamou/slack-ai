import { App, CustomRoute } from "@slack/bolt";
import * as dotenv from "dotenv";
import { checkChannelNameMiddleware } from "./presentation/middleware";

dotenv.config();

import { pingHandler } from "./presentation/ping_handler";
import { helloHandler } from "./presentation/hello_handler";
import { aiDialogueHandler } from "./presentation/ai_dialogue_handler";
import { buttonClickHandler } from "./presentation/button_click_handler";

const registerWebAPIHandler = (): CustomRoute[] => {
  return [
    {
      path: "/ping",
      method: "GET",
      handler: pingHandler,
    },
  ];
};

const registerSlackHandler = () => {
  app.message("hello", helloHandler);
  app.action("button_click", buttonClickHandler);
  app.event("app_mention", aiDialogueHandler);
};

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: (process.env.PORT || 3000) as number,
  customRoutes: registerWebAPIHandler(),
});

app.use(checkChannelNameMiddleware);

(async () => {
  registerSlackHandler();
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
