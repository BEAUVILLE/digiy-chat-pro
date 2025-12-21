// 🦅 DIGIY PRO CHAT — Supabase (coffre-fort token + realtime)
// Fichier unique: digiy-supa-chat.js

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* 🔐 SUPABASE */
const SUPABASE_URL = "https://wesqmwjjtsefyjnluosj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA";

const TABLE = "digiy_chat_messages";
const LS_KEY = "digiy_chat_identity_v2";

/* DOM */
const messagesList = document.getElementById("messagesList");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendDigiyBtn");

const connDot = document.getElementById("connDot");
const connText = document.getElementById("connText");

const modeSelect = document.getElementById("modeSelect");
const nameInput = document.getElementById("nameInput");

const roomPill = document.getElementById("roomPill");
const btnCopyLink = document.getElementById("btnCopyLink");
const btnResetRoom = document.getElementById("btnResetRoom");

/* URL params */
const qs = new URLSearchParams(location.search);
let CHAT_ID = (qs.get("chat") || "exemple-chat-1").trim();
let ROOM_TOKEN = (qs.get("token") || "").trim();

/* Identity */
function safeJson(s){ try { return JSON.parse(s); } catch { return null; } }
function randomId(prefix="u_"){
  return prefix + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const saved = safeJson(localStorage.getItem(LS_KEY)) || {};
let sender_type = saved.sender_type || (qs.get("mode") || "pro");
let sender_name = saved.sender_name || (qs.get("name") || "");
let sender_id   = saved.sender_id   || randomId("u_");

if(modeSelect) modeSelect.value = sender_type === "client" ? "client" : "pro";
if(nameInput) nameInput.value = sender_name;

/* Client Supabase + coffre-fort */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: {
    headers: {
      // 🔐 utilisé par ta RLS / fonctions pour valider l’accès à la room
      ...(ROOM_TOKEN ? { "x-digiy-room-token": ROOM_TOKEN } : {})
    }
  }
});

let channel = null;

/* UI helpers */
function setConn(ok, text){
  if(!connDot || !connText) return;
  connDot.classList.remove("ok","bad");
  connDot.classList.add(ok ? "ok" : "bad");
  connText.textContent = text || (ok ? "OK" : "OFF");
}

function setRoomUI(){
  if(roomPill){
    const b = roomPill.querySelector("b");
    if(b) b.textContent = CHAT_ID;
    else roomPill.textContent = `Room: ${CHAT_ID}`;
  }
  document.title = `DIGIY CHAT PRO — ${CHAT_ID}`;
}

function scrollDown(){
  if(!messagesList) return;
  messagesList.scrollTop = messagesList.scrollHeight;
}

function saveIdentity(){
  sender_type = modeSelect?.value === "client" ? "client" : "pro";
  sender_name = (nameInput?.value || "").trim();
  localStorage.setItem(LS_KEY, JSON.stringify({ sender_type, sender_name, sender_id }));
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* Render */
function renderMessage(msg){
  if(!msg || !messagesList) return;

  // ✅ Filtre 24h (si expires_at existe)
  if(msg.expires_at){
    const exp = new Date(msg.expires_at);
    if(exp < new Date()) return;
  }

  const row = document.createElement("div");
  row.className = "msg-row " + (msg.sender_type === "pro" ? "pro" : "client");

  const bubble = document.createElement("div");
  bubble.className = "msg " + (msg.sender_type === "pro" ? "pro" : "client");
  bubble.textContent = (msg.text || "").toString();

  const meta = document.createElement("div");
  meta.className = "msg-meta";
  const who = msg.sender_name || (msg.sender_type === "pro" ? "PRO" : "CLIENT");
  const time = msg.created_at ? new Date(msg.created_at).toLocaleString("fr-FR") : "";
  meta.textContent = time ? `${who} • ${time}` : who;

  row.appendChild(bubble);
  row.appendChild(meta);
  messagesList.appendChild(row);
  scrollDown();
}

/* Load + realtime */
async function loadMessages(){
  setConn(false, "Chargement…");
  if(messagesList) messagesList.innerHTML = "";

  // Message clair si token requis chez toi
  if(!ROOM_TOKEN){
    // On ne bloque pas, mais on avertit (si ta RLS nécessite token)
    console.warn("⚠️ ROOM_TOKEN absent. Si ta RLS exige token, la lecture/écriture sera bloquée.");
  }

  try{
    // ✅ Si expires_at existe -> filtre "non expiré"
    // Si la colonne n'existe pas, Supabase renvoie error => on refait sans filtre.
    const nowIso = new Date().toISOString();

    let q = supabase
      .from(TABLE)
      .select("*")
      .eq("chat_id", CHAT_ID)
      .order("created_at", { ascending: true })
      .limit(500);

    // tentative filtre expires_at (si colonne présente)
    q = q.gte("expires_at", nowIso);

    let { data, error } = await q;

    if(error){
      // fallback (si expires_at n'existe pas)
      const { data: data2, error: error2 } = await supabase
        .from(TABLE)
        .select("*")
        .eq("chat_id", CHAT_ID)
        .order("created_at", { ascending: true })
        .limit(500);

      data = data2;
      error = error2;
    }

    if(error){
      console.error("loadMessages error:", error);
      setConn(false, "Erreur accès (token/RLS)");
      if(messagesList){
        messagesList.innerHTML =
          `<div class="hint">⚠️ Lecture bloquée. Vérifie le token (URL) + RLS sur <code>${escapeHtml(TABLE)}</code>.</div>`;
      }
      return;
    }

    (data || []).forEach(renderMessage);
    setConn(true, "Connecté");
  }catch(err){
    console.error("loadMessages catch:", err);
    setConn(false, "Erreur réseau");
  }
}

function startRealtime(){
  if(channel){
    try{ supabase.removeChannel(channel); }catch(e){}
    channel = null;
  }

  // ✅ Realtime filtré côté serveur sur chat_id
  channel = supabase
    .channel("room_" + CHAT_ID)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: TABLE,
        filter: `chat_id=eq.${CHAT_ID}`
      },
      (payload) => {
        const msg = payload.new;
        renderMessage(msg);
      }
    )
    .subscribe((status) => {
      if(status === "SUBSCRIBED"){
        console.log(`Canal temps réel ${CHAT_ID} → SUBSCRIBED`);
        setConn(true, "Temps réel actif");
      } else if(status === "TIMED_OUT"){
        console.warn(`Canal temps réel ${CHAT_ID} → TIMED_OUT`);
        setConn(false, "Realtime timeout");
      } else if(status === "CLOSED"){
        console.warn(`Canal temps réel ${CHAT_ID} → CLOSED`);
        setConn(false, "Realtime fermé");
      } else if(status === "CHANNEL_ERROR"){
        console.warn(`Canal temps réel ${CHAT_ID} → CHANNEL_ERROR`);
        setConn(false, "Realtime erreur");
      }
    });
}

/* Send */
async function sendMessage(){
  const text = (chatInput?.value || "").trim();
  if(!text) return;

  saveIdentity();
  if(sendBtn) sendBtn.disabled = true;

  try{
    const { error } = await supabase
      .from(TABLE)
      .insert({
        chat_id: CHAT_ID,
        sender_id,
        sender_type,
        sender_name,
        text
        // created_at: default DB
        // expires_at: default DB (now() + 24h) si tu l’as mis
      });

    if(error){
      console.error("send error:", error);
      alert("Envoi bloqué. Vérifie token + RLS + colonnes table.");
      return;
    }

    chatInput.value = "";
    chatInput.focus();
  } finally {
    if(sendBtn) sendBtn.disabled = false;
  }
}

/* Buttons */
sendBtn?.addEventListener("click", sendMessage);

// ✅ Enter envoie, Shift+Enter = nouvelle ligne
chatInput?.addEventListener("keydown", (e) => {
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});

modeSelect?.addEventListener("change", saveIdentity);
nameInput?.addEventListener("change", saveIdentity);

btnCopyLink?.addEventListener("click", async () => {
  saveIdentity();
  const url = new URL(location.href);
  url.searchParams.set("chat", CHAT_ID);
  url.searchParams.set("mode", sender_type);
  if(sender_name) url.searchParams.set("name", sender_name);
  if(ROOM_TOKEN) url.searchParams.set("token", ROOM_TOKEN);

  try{
    await navigator.clipboard.writeText(url.toString());
    alert("Lien copié ✅");
  } catch {
    prompt("Copie le lien :", url.toString());
  }
});

btnResetRoom?.addEventListener("click", () => {
  const next = prompt("Nouvelle room (chat_id) :", CHAT_ID);
  if(!next) return;

  CHAT_ID = next.trim();

  const url = new URL(location.href);
  url.searchParams.set("chat", CHAT_ID);
  if(ROOM_TOKEN) url.searchParams.set("token", ROOM_TOKEN);
  history.replaceState({}, "", url.toString());

  setRoomUI();
  loadMessages();
  startRealtime();
});

/* BOOT */
(function boot(){
  console.log("🦅 DIGIY PRO CHAT — Supabase ready");
  setRoomUI();
  saveIdentity();
  loadMessages();
  startRealtime();
})();

