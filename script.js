const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// 🚫 Prevent multiple messages while bot typing
let isBotResponding = false;

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  // ✅ Stop user from sending new message if bot still typing
  if (isBotResponding) return;

  const msg = userInput.value.trim();
  if (!msg) return;

  appendMessage("user", msg);
  userInput.value = "";

  const typingDiv = document.createElement("div");
  typingDiv.classList.add("bot-msg");
  typingDiv.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
  chatBox.appendChild(typingDiv);
  scrollToBottom();

  // 🚫 Lock sending and disable input
  isBotResponding = true;
  userInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();
    typingDiv.remove();

    const reply = data.reply || "⚠️ Sorry, something went wrong.";
    await streamMessage(reply);
  } catch {
    typingDiv.remove();
    appendMessage("bot", "⚠️ Server Error. Try again later.");
  }

  // ✅ Unlock sending and enable input again
  isBotResponding = false;
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// 🧠 Fake Streaming Effect
async function streamMessage(text) {
  const botDiv = document.createElement("div");
  botDiv.classList.add("bot-msg");
  chatBox.appendChild(botDiv);

  let current = "";
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    current += words[i] + " ";
    botDiv.innerHTML = marked.parse(current);
    scrollToBottom();
    await delay(50 + Math.random() * 40);
  }
}

// 🔽 Auto-scroll always to bottom
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  div.innerHTML = marked.parse(text);
  chatBox.appendChild(div);
  scrollToBottom();
}
