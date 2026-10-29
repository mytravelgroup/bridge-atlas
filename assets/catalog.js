(function () {
  "use strict";

  /** Base path for GitHub Pages project sites (/repo-name/) or "/" locally. */
  function siteBasePath() {
    var path = window.location.pathname.replace(/\\/g, "/");
    if (path.endsWith("/index.html")) {
      path = path.slice(0, -"/index.html".length);
    } else if (!path.endsWith("/")) {
      path = path.slice(0, path.lastIndexOf("/") + 1);
    }
    if (path === "/") {
      return "";
    }
    return path.endsWith("/") ? path.slice(0, -1) : path;
  }

  function resolveFromSite(relativePath) {
    var base = siteBasePath();
    var clean = relativePath.replace(/^\//, "");
    return (base ? base + "/" : "/") + clean;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") {
          node.textContent = attrs.text;
        } else if (key === "html") {
          node.innerHTML = attrs.html;
        } else {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    (children || []).forEach(function (child) {
      if (child) {
        node.appendChild(child);
      }
    });
    return node;
  }

  function renderFilters(topics, activeTopic, onSelect) {
    var container = document.getElementById("topic-filters");
    if (!container) {
      return;
    }
    container.innerHTML = "";
    var allBtn = el("button", {
      type: "button",
      class: "filter-btn",
      "aria-pressed": activeTopic === "all" ? "true" : "false",
      text: "Tất cả",
    });
    allBtn.addEventListener("click", function () {
      onSelect("all");
    });
    container.appendChild(allBtn);
    topics.forEach(function (topic) {
      var btn = el("button", {
        type: "button",
        class: "filter-btn",
        "aria-pressed": activeTopic === topic.id ? "true" : "false",
        text: topic.label,
      });
      btn.addEventListener("click", function () {
        onSelect(topic.id);
      });
      container.appendChild(btn);
    });
  }

  function renderDiagrams(data, activeTopic) {
    var list = document.getElementById("diagram-list");
    if (!list) {
      return;
    }
    list.innerHTML = "";
    var items = data.diagrams.filter(function (d) {
      return activeTopic === "all" || d.topic === activeTopic;
    });
    if (items.length === 0) {
      list.appendChild(
        el("li", { class: "empty-state", text: "Không có diagram cho bộ lọc này." })
      );
      return;
    }
    items.forEach(function (diagram) {
      var href = resolveFromSite(diagram.htmlPath);
      var revision =
        diagram.bridgeRevisionShort || diagram.bridgeRevision || "Chưa xác định";
      var updated = diagram.updatedAt || "Chưa xác định";
      var card = el("article", { class: "diagram-card" });
      card.appendChild(el("h2", { text: diagram.title }));
      card.appendChild(el("p", { text: diagram.description }));
      var meta = el("div", { class: "meta" });
      meta.appendChild(
        el("span", {
          class: "chip",
          html: "Loại: <strong>" + diagram.typeLabel + "</strong>",
        })
      );
      meta.appendChild(
        el("span", {
          class: "chip",
          html: "Chủ đề: <strong>" + diagram.topicLabel + "</strong>",
        })
      );
      meta.appendChild(
        el("span", {
          class: "chip",
          html: "Cập nhật: <strong>" + updated + "</strong>",
        })
      );
      meta.appendChild(
        el("span", {
          class: "chip",
          html: "Bridge @ <strong>" + revision + "</strong>",
        })
      );
      card.appendChild(meta);
      card.appendChild(
        el("a", {
          class: "open-link",
          href: href,
          text: "Mở diagram",
        })
      );
      list.appendChild(el("li", null, [card]));
    });
  }

  function showError(message) {
    var root = document.getElementById("catalog-root");
    if (!root) {
      return;
    }
    root.innerHTML = "";
    root.appendChild(el("div", { class: "error-state", text: message }));
  }

  function init(data) {
    var headerDesc = document.getElementById("site-description");
    if (headerDesc && data.siteDescription) {
      headerDesc.textContent = data.siteDescription;
    }
    var missing = document.getElementById("missing-topics");
    if (missing && data.missingTopicsNote) {
      missing.textContent = data.missingTopicsNote;
    }
    var activeTopic = "all";
    function selectTopic(topic) {
      activeTopic = topic;
      renderFilters(data.topics || [], activeTopic, selectTopic);
      renderDiagrams(data, activeTopic);
    }
    renderFilters(data.topics || [], activeTopic, selectTopic);
    renderDiagrams(data, activeTopic);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var manifestUrl = resolveFromSite("assets/diagrams.json");
    fetch(manifestUrl)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Không tải được assets/diagrams.json (" + res.status + ").");
        }
        return res.json();
      })
      .then(init)
      .catch(function (err) {
        showError(
          (err && err.message ? err.message : "Lỗi không xác định.") +
            " Chạy site qua local HTTP server (xem README.md), không mở index.html trực tiếp bằng file://."
        );
      });
  });
})();
