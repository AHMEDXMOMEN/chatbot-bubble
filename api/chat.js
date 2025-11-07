// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ do NOT hardcode your key
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;
    const assistantId = process.env.ASSISTANT_ID; // ✅ use environment variable

    // Create thread
    const thread = await client.beta.threads.create();

    // Add user message
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    // Run assistant
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // Wait for response
    let status;
    do {
      status = await client.beta.threads.runs.retrieve(thread.id, run.id);
      if (status.status !== "completed") {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } while (status.status !== "completed");

    // Get assistant reply
    const messages = await client.beta.threads.messages.list(thread.id);
    const reply =
      messages.data[0]?.content?.[0]?.text?.value || "No response received.";

    res.status(200).json({ reply }); // ✅ must return { reply: ... }
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
}
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // CORS (fallback بجانب vercel.json)
  const origin = req.headers.origin || "";
  const allowList = ["https://www.ghalirealty.com"]; // أضِف "https://ghalirealty.com" لو لازم
  if (allowList.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ دعم OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" }); // كان كده أصلاً:contentReference[oaicite:1]{index=1}
    }

    const { message } = req.body;
    const assistantId = process.env.ASSISTANT_ID;

    const thread = await client.beta.threads.create();
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let status;
    do {
      status = await client.beta.threads.runs.retrieve(thread.id, run.id);
      if (status.status !== "completed") {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } while (status.status !== "completed");

    const messages = await client.beta.threads.messages.list(thread.id);
    const reply =
      messages.data[0]?.content?.[0]?.text?.value || "No response received.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
