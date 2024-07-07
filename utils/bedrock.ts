import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

export const bedrockChat = async ({ system = null, messages = [], max_tokens = 10000, temperature = 0.2 }) =>
    JSON.parse(Buffer.from((await bedrockClient.send(new InvokeModelCommand({
        contentType: 'application/json',
        modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            system,
            messages,
            max_tokens,
            temperature,
        }),
    })))?.body).toString())?.content?.[0]?.text;