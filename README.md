# Bridge Atlas

Website tĩnh (GitHub Pages) để xem các diagram Archify về **Didinhe Bridge**: kiến trúc, thực thi task và Git workspace.

Diagram mô tả implementation tại revision Bridge ghi trong mục lục — **không** tự cập nhật theo `master` hiện tại.

## Chạy local

Cần HTTP server (fetch manifest). Ví dụ từ thư mục gốc project:

```bash
# Python 3
python -m http.server 8080

# hoặc Node
npx --yes serve -l 8080
```

Mở `http://127.0.0.1:8080/` — link diagram dùng đường dẫn tương đối, tương thích subpath Pages `https://<owner>.github.io/bridge-atlas/`.

## Cấu trúc

| Thư mục / file | Vai trò |
|----------------|---------|
| `index.html` | Mục lục |
| `assets/` | CSS, JS, `diagrams.json` (metadata) |
| `diagrams/` | HTML Archify đã finalize (deploy) |
| `incident-lab/` | Inventory sự cố + scenario HTML (deploy; `sources/` vẫn không deploy) |
| `sources/` | `*.candidate.json` Archify (repo Git, **không** deploy Pages) |
| `.github/workflows/pages.yml` | Deploy GitHub Pages |

## Thêm hoặc cập nhật diagram

1. Tạo hoặc sửa diagram trong monorepo (`didinhe-mono/.archify/...`), chạy Archify `finalize` đến khi pass.
2. Copy HTML vào `diagrams/` với **tên ổn định** (ví dụ `workflow-task-lifecycle.html`).
3. Copy `candidate.json` tương ứng vào `sources/` (đặt tên khớp manifest).
4. Cập nhật mục trong `assets/diagrams.json`: tiêu đề, mô tả, `updatedAt`, `bridgeRevision` (chỉ ghi nếu có bằng chứng từ `meta.repository.revision` — không đoán).
5. Kiểm tra HTML: không path máy local, token, PII; chỉ tham chiếu repo path tương đối như trong evidence Archify.
6. Chạy local HTTP server, kiểm tra mục lục và mở diagram.
7. Commit và push `main` — workflow deploy tự chạy (hoặc `workflow_dispatch`).

### Incident Lab

1. Finalize scenario trong monorepo `.archify/`, copy HTML vào `incident-lab/scenarios/`, candidate vào `sources/`.
2. Cập nhật `incident-lab/inventory.json` (`scenarioReady`, `scenarioHtml`, `notes`, revision có bằng chứng).
3. Trong viewer Archify, dùng **Guided views** (1–5) trên diagram workflow để đi từng bước; không thay core viewer.

## Publish (GitHub Pages)

- Repository: public `bridge-atlas` (cùng org với monorepo nếu có quyền).
- Settings → Pages → Source: **GitHub Actions**.
- Artifact deploy chỉ gồm `index.html`, `.nojekyll`, `assets/`, `diagrams/`.

## Bản sao trong monorepo

File gốc Archify vẫn nằm trong `didinhe-mono/.archify/` — Bridge Atlas chỉ **copy**, không thay thế.
