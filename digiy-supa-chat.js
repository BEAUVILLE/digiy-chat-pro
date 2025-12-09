// 🔥 DIGIY CHAT PRO — SUPABASE EDITION

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://wesqmwjjtsefyjnluosj.supabase.co",
  "sb_publishable_2KVRayr3oWcewu0Y7xMkOQ_D6522h1E"
);

const CHAT_ID = "exemple-chat-1";  // Tu vas changer ça plus tard

const messagesList = document.getElementById("messagesList");
const input     = document.getElementById("chatInput");
const sendBtn   = document.getElementById("sendDigiyBtn");

// ⏳ Charger les messages existants
async function loadMessages() {
  const { data, error } = await supabase
    .from("digiy_chat_messages")
    .select("*")
    .eq("chat_id", CHAT_ID)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Erreur chargement messages :", error);
    return;
  }

  messagesList.innerHTML = "";

  data.forEach(renderMessage);
}

// 🟢 Écoute temps réel
supabase.channel("room_" + CHAT_ID)
  .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "digiy_chat_messages" },
      (payload) => {
        const msg = payload.new;
        if (msg.chat_id === CHAT_ID) {
          renderMessage(msg);
        }
      })
  .subscribe();

// ✉️ Envoi d’un message DIGIY
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const { error } = await supabase
    .from("digiy_chat_messages")
    .insert({
      chat_id: CHAT_ID,
      sender_id: "PRO_UID_001",
      sender_type: "pro",
      text: text
    });

  if (error) {
    console.error("Erreur envoi message :", error);
    return;
  }

  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);

function renderMessage(msg) {
  const row = document.createElement("div");
  row.className = "msg-row " + (msg.sender_type === "pro" ? "pro" : "client");

  const bubble = document.createElement("div");
  bubble.className = "msg " + (msg.sender_type === "pro" ? "pro" : "client");
  bubble.textContent = msg.text;

  const meta = document.createElement("div");
  meta.className = "msg-meta" + (msg.sender_type === "pro" ? " right" : "");
  meta.textContent = msg.sender_type === "pro" ? "Vous" : "Client";

  row.appendChild(bubble);
  row.appendChild(meta);
  messagesList.appendChild(row);

  messagesList.scrollTop = messagesList.scrollHeight;
}

// 🚀 Charger tout au démarrage
loadMessages();
