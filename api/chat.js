export default async function handler(req, res) {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Missing message in request body." });
    }

    if (!process.env.OPENAI_API_KEY || !process.env.ASSISTANT_ID) {
      return res.status(500).json({ 
        error: "Missing environment variables. Make sure OPENAI_API_KEY and ASSISTANT_ID are set in Vercel." 
      });
    }

    const response = await fetch(
      `https://api.openai.com/v1/assistants/${process.env.ASSISTANT_ID}/responses`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: [{ role: "user", content: message }]
        })
      }
    );

    // Parse JSON safely
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return res.status(response.status).json({
        error: "OpenAI API returned an error.",
        details: data
      });
    }

    const reply =
      data.output?.[0]?.content?.[0]?.text?.value ||
      "Sorry, I couldn’t get a response from the assistant.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Handler Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
