import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_TOKEN,
});

export const openaiClient = new OpenAIApi(configuration);

export const completions = async (message: string) => {
  const response = await openaiClient.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: "あなたは有能なアシスタントです。",
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message,
      },
    ],
  });
  return response.data.choices[0].message?.content;
};
