import OpenAI from 'openai';

export const openai = new OpenAI();

export const openaiEmbedding = async (input) => {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input,
    });
    return response?.data?.[0]?.embedding;
}