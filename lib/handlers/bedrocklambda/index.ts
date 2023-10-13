import { AppSyncResolverEvent } from "aws-lambda";
import { BedrockRuntime } from "@aws-sdk/client-bedrock-runtime";

type AppSyncEvent = {
  msg: string;
};

export const handler = async (event: AppSyncResolverEvent<AppSyncEvent>) => {
  const prompt = `Take the following string and summarize it into one sentence, make sure to only return the summary only, no other text please. "${event.arguments.msg}"`;
  const claudePrompt = `\n\nHuman: ${prompt} \n\nAssistant:`;
  const config = {
    prompt: claudePrompt,
    max_tokens_to_sample: 2048,
    temperature: 0.5,
    top_k: 250,
    top_p: 1,
    stop_sequences: ["\n\nHuman:"],
  };
  const bedrock = new BedrockRuntime({ region: "us-east-1" });
  try {
    const response = await bedrock.invokeModel({
      body: JSON.stringify(config),
      modelId: "anthropic.claude-v2",
      accept: "application/json",
      contentType: "application/json",
    });
    const value = JSON.parse(response.body.transformToString());
    return value.completion;
  } catch (err) {
    console.log(err);
    return err;
  }
};
