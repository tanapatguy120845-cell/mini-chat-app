import axios from "axios";

export async function askOllama(messages) {
  const res = await axios.post(
    "http://localhost:11434/api/chat",
    {
      model: "llama3",
      messages,
      stream: false
    }
  );

  return res.data.message.content;
}
