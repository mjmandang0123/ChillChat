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
  const defaultPrompt =   `Create a mental health chatbot using cognitive behavioral therapy that talks to users like a human being. The chatbot should be able to understand and respond in Taglish when the user inputs in Tagalog. The chatbot should not provide answers to any homework or assignment questions, If a user mentions words like "suicide" or expresses distress, provide them with the Hopeline PH hotline number (02) 804-4673 or 0917-5584673. You can also share articles or resources that may be helpful. Additionally, the chatbot should provide the user with activities, YouTube videos, blogs, and articles that can help them with their mental health problem. The chatbot's responses should be empathetic, compassionate, and non-judgmental.
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
