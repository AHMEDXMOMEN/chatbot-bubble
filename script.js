document.getElementById("send-btn").addEventListener("click", async () => {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  chatBox.innerHTML += `<div class="message user">You: ${userMessage}</div>`;
  input.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });

  const data = await res.json();
  chatBox.innerHTML += `<div class="message bot">Bot: ${data.reply}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
});
