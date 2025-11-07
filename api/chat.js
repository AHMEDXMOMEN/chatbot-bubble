// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 🔒 من Vercel env
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    const assistantId = process.env.ASSISTANT_ID;

    if (!assistantId || !process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Missing environment variables (ASSISTANT_ID or OPENAI_API_KEY)",
      });
    }

    console.log("🧠 Incoming message:", message);

    // 1️⃣ Create new thread
    const thread = await client.beta.threads.create();
    console.log("📎 Created thread:", thread.id);

    // 2️⃣ Add user's message
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });
    console.log("💬 Message added to thread");

    // 3️⃣ Run the assistant
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });
    console.log("🚀 Run started:", run.id);

    // 4️⃣ Wait until run finishes
    let status = "queued";
    while (status !== "completed" && status !== "failed") {
      await new Promise((r) => setTimeout(r, 1500));
      const check = await client.beta.threads.runs.retrieve(thread.id, run.id);
      status = check.status;
      console.log("⏳ Run status:", status);
    }

    // 5️⃣ Get assistant messages
    const messages = await client.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(
      (msg) => msg.role === "assistant"
    );

    const reply =
      assistantMessage?.content?.[0]?.text?.value ||
      "⚠️ No response received from assistant.";

    console.log("✅ Assistant reply:", reply);

    res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: error.message || "Something went wrong",
      details: error.response ? await error.response.json() : null,
    });
  }
}
