// chat.js
const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = document.getElementById("user-input").value;

  chatBox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
  document.getElementById("user-input").value = "";

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userInput }),
  });

  const data = await response.json();
  const botReply = data.reply || "⚠️ No response from server.";

  chatBox.innerHTML += `<p><strong>Bot:</strong> ${botReply}</p>`;
});
