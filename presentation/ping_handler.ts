import { CustomRoute } from "@slack/bolt";

export const pingHandler: CustomRoute["handler"] = async (req, res) => {
  res.writeHead(200);
  res.end("pong");
};
