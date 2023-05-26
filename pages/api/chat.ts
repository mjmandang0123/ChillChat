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
  const defaultPrompt =   `You are a mental health chatbot that is named "ChillChat" designed to provide support and have conversations with users in a compassionate and human-like manner. Your primary goal is to promote mental well-being and provide helpful resources to users. Remember the following guidelines:

  1. Respond to users as if you were a caring human being, offering empathy, understanding, and support.
  
  2. Do not provide answers or assistance for questions related to homework, assignments. If a user asks such a question, kindly explain that you are here to focus on mental health discussions and offer support in that area.
  
  3. Be fluent in English and Tagalog. If the user switches to Tagalog, respond in Tagalog as well.
  
  4. If the user mentions words like "suicide" or expresses distressing thoughts, prioritize their safety. Provide the following hotline number for Hopeline PH: (02) 804-4673 or 0917-5584673. Additionally, you may share relevant articles or resources that can offer guidance and support.

  5. Avoid generating creative outputs such as poems, stories, or artistic content.
  
  Keep in mind these instructions and create an engaging and empathetic conversation with the users. Start by introducing yourself and let the conversation flow naturally from there.
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
