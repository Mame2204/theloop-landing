(function () {
  var SUPABASE_URL = "https://eeyhtulpixvftvhppinz.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_l78zClzs1ldqOElbaLVT0w__KrKrlZv";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function linkify(escaped) {
    escaped = escaped.replace(
      /\b(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi,
      function (m) {
        var href = /^https?:\/\//i.test(m) ? m : "https://" + m;
        return '<a href="' + href + '">' + m + "</a>";
      }
    );
    escaped = escaped.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>'
    );
    escaped = escaped.replace(
      /(\+224(?:[\s.-]?\d){8,12})/g,
      function (m) {
        return '<a href="tel:' + m.replace(/[\s.-]/g, "") + '">' + m + "</a>";
      }
    );
    return escaped;
  }

  function isSectionTitle(line, blockLines) {
    if (!line) return false;
    if (/^\d+\.\s+\S/.test(line)) return true;
    if (
      /^(Éditeur|Hébergement|Paiement|Données|Propriété|Contact|Coordonnées|Site web)\b/i.test(
        line
      )
    ) {
      return true;
    }
    return blockLines.length > 1 && line.length <= 72 && !/[.!?]$/.test(line);
  }

  function formatLegalBody(raw) {
    var text = String(raw || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
    if (!text) return "<p></p>";

    return text
      .split(/\n{2,}/)
      .map(function (block) {
        var lines = block.split("\n");
        var html = lines
          .map(function (line, i) {
            var e = linkify(escapeHtml(line));
            if (i === 0 && isSectionTitle(line.trim(), lines)) {
              e = "<strong>" + e + "</strong>";
            }
            return e;
          })
          .join("<br/>");
        return "<p>" + html + "</p>";
      })
      .join("");
  }

  function formatUpdatedAt(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return "";
    }
  }

  function setBusy(el, busy) {
    if (!el) return;
    el.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function loadLegalDocument() {
    var root = document.body;
    var key = root.getAttribute("data-legal-key");
    if (!key) return;

    var titleEl = document.getElementById("legal-title");
    var updatedEl = document.getElementById("legal-updated");
    var bodyEl = document.getElementById("legal-body");
    if (!titleEl || !bodyEl) return;

    setBusy(bodyEl, true);

    if (!window.supabase || !window.supabase.createClient) {
      bodyEl.innerHTML =
        '<p class="msg-err">Impossible de charger le document (bibliothèque indisponible).</p>';
      setBusy(bodyEl, false);
      return;
    }

    var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    client
      .from("app_legal_content")
      .select("key,title,body,updated_at")
      .eq("key", key)
      .maybeSingle()
      .then(function (res) {
        setBusy(bodyEl, false);
        if (res.error) {
          console.error("app_legal_content:", res.error);
          bodyEl.innerHTML =
            '<p class="msg-err">Document temporairement indisponible. Réessaie plus tard.</p>';
          return;
        }
        if (!res.data) {
          bodyEl.innerHTML =
            '<p class="msg-err">Document introuvable.</p>';
          return;
        }

        var doc = res.data;
        if (doc.title) {
          titleEl.textContent = doc.title;
          document.title = doc.title + " — THE LOOP";
          var ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute("content", doc.title + " — THE LOOP");
        }
        if (updatedEl) {
          var label = formatUpdatedAt(doc.updated_at);
          updatedEl.textContent = label
            ? "Dernière mise à jour : " + label
            : "";
        }
        bodyEl.innerHTML = formatLegalBody(doc.body);
      })
      .catch(function (err) {
        console.error("app_legal_content network:", err);
        setBusy(bodyEl, false);
        bodyEl.innerHTML =
          '<p class="msg-err">Réseau indisponible. Réessaie plus tard.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadLegalDocument);
  } else {
    loadLegalDocument();
  }
})();
