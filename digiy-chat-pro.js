// digiy-chat-pro.js
(function () {
  // ⚙️ CONFIG PAR DÉFAUT (surchargée par window.DIGIY_CHAT_OPTIONS)
  const defaultConfig = {
    proChatUrl: "https://beauville.github.io/digiy-chat-pro/",
    whatsappNumber: "+221770000000",
    callNumber: "+221770000000",
    businessName: "DIGIY PRO CHAT",
    primaryColor: "#f97316",
    darkBg: "#020617"
  };

  const userConfig = (window.DIGIY_CHAT_OPTIONS || {});
  const config = Object.assign({}, defaultConfig, userConfig);

  let panel = null;
  let backdrop = null;
  let fab = null;

  // 🧼 CSS PREMIUM
  function injectStyles() {
    if (document.getElementById("digiy-chat-pro-style")) return;

    const style = document.createElement("style");
    style.id = "digiy-chat-pro-style";
    style.textContent = `
      .digiy-chat-fab {
        position: fixed;
        right: 18px;
        top: 18px;
        z-index: 99999;
        background: ${config.primaryColor};
        color: #0b1120;
        border-radius: 999px;
        padding: 10px 18px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 18px 40px rgba(15,23,42,0.65);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease;
        opacity: 0.98;
      }
      .digiy-chat-fab:hover {
        transform: translateY(-1px);
        box-shadow: 0 20px 50px rgba(15,23,42,0.85);
        opacity: 1;
      }
      .digiy-chat-fab:active {
        transform: translateY(0);
        box-shadow: 0 14px 30px rgba(15,23,42,0.75);
      }
      .digiy-chat-fab-icon {
        width: 22px;
        height: 22px;
        border-radius: 999px;
        border: 2px solid rgba(0,0,0,0.25);
        display:flex;
        align-items:center;
        justify-content:center;
        background:#0b1120;
        color:${config.primaryColor};
        font-size: 13px;
      }
      .digiy-chat-fab-label-main {
        line-height: 1.1;
      }
      .digiy-chat-fab-label-sub {
        font-size: 10px;
        opacity: 0.85;
        white-space: nowrap;
      }

      .digiy-chat-panel-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15,23,42,0.55);
        backdrop-filter: blur(4px);
        z-index: 99998;
        display: none;
        opacity: 0;
        transition: opacity 0.18s ease;
      }

      .digiy-chat-panel-backdrop.digiy-open {
        display: block;
        opacity: 1;
      }

      .digiy-chat-panel {
        position: fixed;
        right: 10px;
        top: 70px;
        bottom: auto;
        width: 360px;
        max-width: calc(100% - 20px);
        max-height: 80vh;
        background: radial-gradient(circle at top, #111827, ${config.darkBg});
        border-radius: 18px;
        box-shadow: 0 22px 55px rgba(0,0,0,0.85);
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        display: none;
        flex-direction: column;
        overflow: hidden;
        transform: translateY(8px);
        opacity: 0;
        transition: opacity 0.18s ease, transform 0.18s ease;
        z-index: 99999;
      }

      .digiy-chat-panel.digiy-open {
        display: flex;
        opacity: 1;
        transform: translateY(0);
      }

      .digiy-chat-panel-header {
        padding: 12px 14px;
        border-bottom: 1px solid rgba(148,163,184,0.4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .digiy-chat-panel-title-block {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .digiy-chat-panel-title {
        font-size: 14px;
        font-weight: 700;
      }

      .digiy-chat-panel-badge {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #fed7aa;
      }

      .digiy-chat-panel-close {
        border: none;
        background: transparent;
        color: #9ca3af;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 6px;
        line-height: 1;
      }

      .digiy-chat-panel-body {
        padding: 10px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-size: 13px;
      }

      .digiy-chat-panel-hint {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 4px;
      }

      .digiy-chat-panel-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }

      .digiy-chat-btn {
        border-radius: 999px;
        padding: 9px 12px;
        border: 1px solid rgba(148,163,184,0.5);
        background: #020617;
        color: #f9fafb;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
      }

      .digiy-chat-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 30px rgba(15,23,42,0.85);
        background: #020712;
      }

      .digiy-chat-btn-main {
        background: linear-gradient(135deg, ${config.primaryColor}, #fed7aa);
        color: #0b1120;
        border-color: transparent;
        font-weight: 700;
      }

      .digiy-chat-btn-main:hover {
        background: linear-gradient(135deg, ${config.primaryColor}, #fde68a);
      }

      .digiy-chat-btn-label {
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: left;
      }

      .digiy-chat-btn-title {
        font-size: 13px;
      }

      .digiy-chat-btn-sub {
        font-size: 11px;
        opacity: 0.85;
      }

      .digiy-chat-btn-pill {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(15,23,42,0.85);
        border: 1px solid rgba(15,23,42,0.8);
        white-space: nowrap;
      }

      .digiy-chat-panel-footer {
        padding: 6px 10px 10px;
        font-size: 11px;
        color: #6b7280;
        text-align: center;
      }
      .digiy-chat-panel-footer span {
        color: ${config.primaryColor};
        font-weight: 600;
      }

      @media (max-width: 640px) {
        .digiy-chat-fab {
          top: auto;
          bottom: 18px;
          right: 16px;
        }
        .digiy-chat-panel {
          left: 10px;
          right: 10px;
          top: auto;
          bottom: 90px;
          width: auto;
          max-height: 60vh;
        }
        .digiy-chat-fab-label-sub {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 🎛 BOUTON FLOTTANT
  function createFab() {
    if (fab) return fab;

    fab = document.createElement("button");
    fab.className = "digiy-chat-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "Ouvrir DIGIY PRO CHAT");

    fab.innerHTML = `
      <div class="digiy-chat-fab-icon">D</div>
      <div>
        <div class="digiy-chat-fab-label-main">PRO CHAT</div>
        <div class="digiy-chat-fab-label-sub">Clients • WhatsApp • Appel</div>
      </div>
    `;

    fab.addEventListener("click", togglePanel);

    document.body.appendChild(fab);
    return fab;
  }

  // 🪟 PANEL
  function createPanel() {
    if (panel && backdrop) return;

    backdrop = document.createElement("div");
    backdrop.className = "digiy-chat-panel-backdrop";
    backdrop.addEventListener("click", closePanel);

    panel = document.createElement("div");
    panel.className = "digiy-chat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "DIGIY PRO CHAT");

    panel.innerHTML = `
      <div class="digiy-chat-panel-header">
        <div class="digiy-chat-panel-title-block">
          <div class="digiy-chat-panel-title">${config.businessName}</div>
          <div class="digiy-chat-panel-badge">DIGIY PRO CHAT — 0% com, instantané</div>
        </div>
        <button class="digiy-chat-panel-close" aria-label="Fermer PRO CHAT">&times;</button>
      </div>
      <div class="digiy-chat-panel-body">
        <div>
          <div><strong>Centralise les demandes clients</strong> dans DIGIY, puis finalise en direct sur WhatsApp ou par appel.</div>
          <div class="digiy-chat-panel-hint">
            Notes internes éphémères (24h max) côté DIGIY, conversations longues côté WhatsApp / email.
          </div>
        </div>
        <div class="digiy-chat-panel-actions">
          <button type="button" class="digiy-chat-btn digiy-chat-btn-main" data-action="pro-chat">
            <div class="digiy-chat-btn-label">
              <span class="digiy-chat-btn-title">Ouvrir le tableau PRO CHAT</span>
              <span class="digiy-chat-btn-sub">Voir les demandes récentes, statut, suivi en temps réel</span>
            </div>
            <span class="digiy-chat-btn-pill">Vue complète</span>
          </button>

          <button type="button" class="digiy-chat-btn" data-action="whatsapp">
            <div class="digiy-chat-btn-label">
              <span class="digiy-chat-btn-title">Continuer sur WhatsApp</span>
              <span class="digiy-chat-btn-sub">Message direct au client (conversation longue)</span>
            </div>
            <span class="digiy-chat-btn-pill">WhatsApp</span>
          </button>

          <button type="button" class="digiy-chat-btn" data-action="call">
            <div class="digiy-chat-btn-label">
              <span class="digiy-chat-btn-title">Appeler le client / le chauffeur</span>
              <span class="digiy-chat-btn-sub">Pour confirmer une course ou une réservation</span>
            </div>
            <span class="digiy-chat-btn-pill">Téléphone</span>
          </button>
        </div>
      </div>
      <div class="digiy-chat-panel-footer">
        Propulsé par <span>DIGIYLYFE</span> — local, direct, souverain.
      </div>
    `;

    panel.querySelector(".digiy-chat-panel-close").addEventListener("click", closePanel);

    panel.querySelectorAll(".digiy-chat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        handleAction(action);
      });
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
  }

  function openPanel() {
    if (!panel || !backdrop) {
      createPanel();
    }
    backdrop.classList.add("digiy-open");
    panel.classList.add("digiy-open");
  }

  function closePanel() {
    if (backdrop) backdrop.classList.remove("digiy-open");
    if (panel) panel.classList.remove("digiy-open");
  }

  function togglePanel() {
    if (!panel || !backdrop || !panel.classList.contains("digiy-open")) {
      openPanel();
    } else {
      closePanel();
    }
  }

  // 🎯 ACTIONS
  function handleAction(action) {
    if (action === "pro-chat") {
      if (!config.proChatUrl) {
        alert("URL du tableau PRO CHAT non configurée (proChatUrl).");
        return;
      }
      window.open(config.proChatUrl, "_blank", "noopener,noreferrer");
    } else if (action === "whatsapp") {
      const phone = (config.whatsappNumber || "").replace(/\D/g, "");
      if (!phone) {
        alert("Numéro WhatsApp non configuré dans DIGIY_CHAT_OPTIONS.whatsappNumber");
        return;
      }
      const text = encodeURIComponent("Salam, je viens du site DIGIY, j’ai une demande à traiter.");
      const url = `https://wa.me/${phone}?text=${text}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (action === "call") {
      const phoneRaw = config.callNumber || "";
      if (!phoneRaw) {
        alert("Numéro d’appel non configuré dans DIGIY_CHAT_OPTIONS.callNumber");
        return;
      }
      const telUrl = `tel:${phoneRaw.replace(/\s/g, "")}`;
      window.location.href = telUrl;
    }
  }

  // 🚀 INIT
  function init() {
    if (document.body.dataset.digiyChatProInit === "1") return;
    document.body.dataset.digiyChatProInit = "1";

    injectStyles();
    createFab();
    createPanel();

    // ESC pour fermer
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closePanel();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
