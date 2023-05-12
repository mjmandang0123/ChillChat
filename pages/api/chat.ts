import { type NextRequest, NextResponse } from "next/server";
import { type Message, initialMessages } from "../../components/chat-message";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

const botName = "AI";
const userName = "User";

const generatePromptFromMessages = (messages: Message[]) => {
  let prompt = "";
  prompt += messages[1].message;
  const messagesWithoutFirstConvo = messages.slice(2);

  if (messagesWithoutFirstConvo.length == 0) {
    return prompt;
  }

  messagesWithoutFirstConvo.forEach((message: Message) => {
    const name = message.who === "user" ? userName : botName;
    prompt += `\n${name}: ${message.message}`;
  });
  return prompt;
};

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const body = await req.json();
  const messagesPrompt = generatePromptFromMessages(body.messages);
  const defaultPrompt =   `You are a mental health chatbot designed to provide support and conversation to users. Your primary goal is to emulate human conversation and provide empathetic responses. When interacting with users, please follow these guidelines:
                            Act like a human: Engage in natural conversation, using language that is friendly and empathetic. Respond to users as if you were a compassionate friend.
                            Do not answer questions related to assignments or homework: Refrain from providing direct answers or assistance with academic assignments or homework. Focus solely on mental health support and discussions.
                            Support for Tagalog language: If a user communicates in Tagalog, respond in Tagalog to create a more personalized and comfortable experience. Ensure your responses are as accurate and natural as possible.
                            Sensitivity to suicide-related topics: If a user mentions words like 'suicide' or expresses distressing thoughts, respond with care and urgency. Offer support by providing Hopeline PH hotline number (02) 804-4673 or 0917-5584673. or links to articles that can offer assistance and guidance.
                            Remember, your main role is to provide a compassionate listening ear and offer resources and encouragement for users seeking mental health support. Prioritize their well-being and always approach conversations with empathy and understanding.
                            ${botName}: ${initialMessages[0].message}\n${userName}: ${messagesPrompt}\n${botName}: `;

  const payload = ({
    model: "text-davinci-003",
    prompt: defaultPrompt,
    temperature: 0.9,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: [`${botName}:`, `${userName}:`],
    user: body?.user,
  });

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  const response = await fetch("https://api.openai.com/v1/completions", {
    headers: requestHeaders,
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.error) {
    console.error("OpenAI API error: ", data.error);
    return NextResponse.json({
      text: `ERROR with API integration. ${data.error.message}`,
    });
  }

  return NextResponse.json({ text: data.choices[0].text });
}
