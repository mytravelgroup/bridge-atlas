(function () {
  "use strict";

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

  function resolveFromHere(relativePath) {
    var base = siteBasePath();
    var clean = relativePath.replace(/^\//, "");
    return (base ? base + "/" : "/") + clean;
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function renderInventory(data) {
    var root = document.getElementById("inventory-root");
    if (!root) {
      return;
    }

    var table = el("table", { class: "inventory-table" });
    var thead = el("thead");
    var headRow = el("tr");
    ["Triệu chứng", "Bằng chứng", "Bridge @", "Trạng thái", "Scenario"].forEach(function (h) {
      headRow.appendChild(el("th", null, h));
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = el("tbody");
    data.items.forEach(function (item) {
      var row = el("tr");
      row.appendChild(el("td", null, item.symptom));
      row.appendChild(
        el(
          "td",
          null,
          (item.evidence || []).slice(0, 2).join(" · ") +
            (item.evidence && item.evidence.length > 2 ? " …" : ""),
        ),
      );
      row.appendChild(el("td", null, item.revision || "Chưa xác định"));
      row.appendChild(el("td", null, item.fixStatus || "unknown"));
      var scenarioCell = el("td");
      if (item.scenarioReady && item.scenarioHtml) {
        var link = el(
          "a",
          {
            class: "status-ready",
            href: resolveFromHere(item.scenarioHtml),
          },
          "Mở kịch bản",
        );
        scenarioCell.appendChild(link);
      } else {
        scenarioCell.textContent = "Chưa có";
      }
      row.appendChild(scenarioCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    root.appendChild(table);

    var ready = data.items.filter(function (i) {
      return i.scenarioReady && i.scenarioHtml;
    });
    var featured = document.getElementById("featured-scenario");
    if (featured && ready.length > 0) {
      var first = ready[0];
      featured.appendChild(el("h2", null, first.symptom));
      featured.appendChild(el("p", null, first.notes || ""));
      featured.appendChild(
        el(
          "a",
          {
            class: "open-link",
            href: resolveFromHere(first.scenarioHtml),
          },
          "Mở diagram kịch bản",
        ),
      );
      featured.appendChild(
        el(
          "p",
          { class: "viewer-hint" },
          "Trong viewer Archify: mở Presentation Stage (nếu có), chọn Guided views (1–5) để focus từng bước; dùng Live/Still cho motion — đây là diễn giải, không phải simulator Bridge.",
        ),
      );
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch(resolveFromHere("inventory.json"))
      .then(function (r) {
        if (!r.ok) {
          throw new Error("Không tải inventory.json");
        }
        return r.json();
      })
      .then(renderInventory)
      .catch(function (err) {
        var root = document.getElementById("inventory-root");
        if (root) {
          root.textContent = err.message || "Lỗi tải inventory.";
        }
      });
  });
})();
