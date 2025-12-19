<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0A0E1A" />
  <title>DIGIY CHAT PRO</title>
  <link rel="stylesheet" href="./styles.css" />
</head>

<body>
  <div class="app">
    <header class="top">
      <a class="brand" href="https://digiylyfe.com" target="_blank" rel="noopener">
        <span class="logo">∞</span>
        <span class="titles">
          <span class="t1">DIGIY CHAT PRO</span>
          <span class="t2">Assistance & Clients • 0% commission</span>
        </span>
      </a>

      <div class="right">
        <div id="roomPill" class="pill">Room: <b>—</b></div>
        <button id="btnCopyLink" class="btn ghost" type="button" title="Copier le lien de la room">🔗</button>
        <button id="btnResetRoom" class="btn danger" type="button" title="Changer de room">♻️</button>
      </div>
    </header>

    <main class="main">
      <section class="panel">
        <div class="panel-top">
          <div class="status">
            <span id="connDot" class="dot"></span>
            <span id="connText">Connexion…</span>
          </div>

          <div class="who">
            <span class="tag">Mode</span>
            <select id="modeSelect" class="select">
              <option value="pro" selected>PRO</option>
              <option value="client">CLIENT</option>
            </select>

            <span class="tag">Nom</span>
            <input id="nameInput" class="input" placeholder="Ex: Astou Boutique" maxlength="40" />
          </div>
        </div>

        <div id="messagesList" class="messages" aria-live="polite"></div>

        <div class="composer">
          <input id="chatInput" class="input grow" placeholder="Écris ton message…" autocomplete="off" />
          <button id="sendDigiyBtn" class="btn primary" type="button">Envoyer →</button>
        </div>

        <div class="hint">
          Astuce : ajoute <code>?chat=resto-chez-baptiste</code> dans l’URL pour une room dédiée.
        </div>
      </section>
    </main>

    <footer class="foot">
      <a class="link" href="https://wa.me/221771342889" target="_blank" rel="noopener">WhatsApp</a>
      <span class="sep">•</span>
      <a class="link" href="https://beauville.github.io/digiy-hub/" target="_blank" rel="noopener">Retour HUB</a>
      <span class="sep">•</span>
      <span class="muted">DIGIYLYFE — Made in Sénégal 🦅</span>
    </footer>
  </div>

  <script type="module" src="./digiy-supa-chat.js"></script>
</body>
</html>
