const socket = io();
let room = "";
let username = "";

// エラーメッセージ
function showError(id, message) {
  document.getElementById(id).textContent = message;
}

function clearError(id) {
  document.getElementById(id).textContent = "";
}

// 表示の切り替え
function showChatScreen() {
  document.getElementById("chat").style.display = "block";
  document.getElementById("create-form").style.display = "none";
  document.getElementById("join-form").style.display = "none";
  document.getElementById("chat-room-title").textContent = `ルーム: ${room}`;
  document.getElementById("user-info").textContent = `ユーザー名: ${username}`;
  document.getElementById("main-title").style.display = "none";
  document.getElementById("show-create").style.display = "none";
  document.getElementById("show-join").style.display = "none";
  document.getElementById("messages").innerHTML = "";
}

function showFormScreen() {
  document.getElementById("chat").style.display = "none";
  document.getElementById("create-form").style.display = "none";
  document.getElementById("join-form").style.display = "none";
  document.getElementById("main-title").style.display = "block";
  document.getElementById("show-create").style.display = "inline-block";
  document.getElementById("show-join").style.display = "inline-block";
  username = "";
  room = "";
}

// ボタンでフォーム表示切替
document.getElementById("show-create").onclick = () => {
  showFormScreen();
  document.getElementById("create-form").style.display = "block";
};

document.getElementById("show-join").onclick = () => {
  showFormScreen();
  document.getElementById("join-form").style.display = "block";
};

// ルーム作成
document.getElementById("createBtn").onclick = () => {
  username = document.getElementById("create-username").value.trim();
  room = document.getElementById("create-room").value.trim();
  const password = document.getElementById("create-password").value;

  if (!username || !room) {
    showError("create-error", "ユーザー名とルーム名を入力してください");
    return;
  }

  socket.emit("createRoom", { room, password }, (res) => {
    if (res.success) {
      clearError("create-error");
      showChatScreen();
    } else {
      showError("create-error", res.message);
    }
  });
};

// ルーム入室
document.getElementById("joinBtn").onclick = () => {
  username = document.getElementById("join-username").value.trim();
  room = document.getElementById("join-room").value.trim();
  const password = document.getElementById("join-password").value;

  if (!username || !room) {
    showError("join-error", "ユーザー名とルーム名を入力してください");
    return;
  }

  socket.emit("joinRoom", { room, password }, (res) => {
    if (res.success) {
      clearError("join-error");
      showChatScreen();
    } else {
      showError("join-error", res.message);
    }
  });
};

// 退出
document.getElementById("leaveBtn").onclick = () => {
  socket.emit("leaveRoom", { room });
  showFormScreen();
  document.getElementById("create-form").style.display = "block";
};

// メッセージ送信
document.getElementById("sendBtn").onclick = () => {
  const msg = document.getElementById("messageInput").value;
  if (!msg) return;
  socket.emit("chatMessage", `${username}: ${msg}`);
  document.getElementById("messageInput").value = "";
};

document.getElementById("messageInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("sendBtn").click();
  }
});

// メッセージ受信
socket.on("chatMessage", (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");

  const separatorIndex = msg.indexOf(":");
  const sender = msg.substring(0, separatorIndex);
  const content = msg.substring(separatorIndex + 1).trim();

  if (sender === username) {
    div.classList.add("self");
    div.textContent = content;
  } else {
    div.classList.add("other");
    div.textContent = `${sender}: ${content}`;
  }

  document.getElementById("messages").appendChild(div);

  // 自動スクロール
  const messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
