export default async function handler(req, res) {
  const { message } = req.body;

  try {
    // Step 1: Create a thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const thread = await threadRes.json();

    // Step 2: Send the user's message to the thread
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user",
        content: message
      })
    });

    // Step 3: Run the assistant on the thread
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assistant_id: process.env.ASSISTANT_ID
      })
    });

    const run = await runRes.json();

    // Step 4: Poll until the run completes
    let completed = false;
    let reply = "No response received.";
    while (!completed) {
      const checkRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      const check = await checkRes.json();

      if (check.status === "completed") {
        completed = true;
        // Step 5: Get the assistant's reply
        const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });
        const messages = await messagesRes.json();
        const assistantMessage = messages.data.find(m => m.role === "assistant");
        reply = assistantMessage?.content?.[0]?.text?.value || "No reply text.";
      } else if (check.status === "failed") {
        completed = true;
        reply = "Assistant failed to respond.";
      } else {
        await new Promise(r => setTimeout(r, 1000)); // wait 1s before checking again
      }
    }

    res.status(200).json({ reply });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ reply: "Error talking to the assistant." });
  }
}
