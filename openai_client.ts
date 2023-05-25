import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_TOKEN,
});

const CHAT_GPT_SYSTEM_PROMPT = `
You are an excellent AI assistant Slack Bot.
Please output your response message according to following format.

- bold: "*bold*"
- italic: "_italic_"
- strikethrough: "~strikethrough~"
- code: " \`code\` "
- link: "<https://slack.com|link text>"
- block: "\`\`\` code block \`\`\`"
- bulleted list: "* item1"

Be sure to include a space before and after the single quote in the sentence.
ex) word\`code\`word -> word \`code\` word

Let's begin.
`;

export const openaiClient = new OpenAIApi(configuration);

export const completions = async (message: string) => {
// ref. https://zenn.dev/ryo_kawamata/articles/56ea2484320def
export const completionWithContext = async (
  context: Context,
  message: string
) => {
  const response = await openaiClient.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: CHAT_GPT_SYSTEM_PROMPT,
      },
      ...context,
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message,
      },
    ],
  });
  return response.data.choices[0].message?.content;
};
