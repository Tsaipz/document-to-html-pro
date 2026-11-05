# 文轉網 PRO — 文件轉 CMS HTML

**版本：2、3、4 合併版／靜態網站 + 可選 PHP AI 代理。**

## 快速使用

1. 將整個資料夾上傳至 HTTPS 網站空間，例如 `https://example.com/html-converter/`。
2. 透過 `index.html` 開啟；Word / Excel / PPT / PDF 的轉檔依賴第三方 CDN，首次載入需要網路。
3. 上傳檔案（25 MB 以下），選擇「可編輯內容」或 PDF「頁面視覺保留模式」。
4. 到「視覺編輯」「HTML 原始碼」調整內容，執行「CMS 檢查」。
5. 點「複製 HTML」或「下載 HTML」，貼入 CMS 的 HTML 原始碼編輯模式。

## 功能及限制

| 功能 | 說明 |
|---|---|
| Word DOCX | Mammoth 解析文章、表格、圖片；無法完整還原 Word 每一個視覺細節 |
| Excel XLSX/XLS | SheetJS 產生 HTML 表格；複雜圖表、公式視覺樣式不保證還原 |
| PPTX | JSZip 擷取逐頁文字，按投影片關聯擷取支援的圖片；不還原任意圖形座標及動畫 |
| PDF | PDF.js 擷取文字；掃描/無文字頁可啟用 Tesseract 繁體中文+英文 OCR（首次下載語言模型） |
| PDF 視覺保留 | 將 PDF 每頁轉為 JPEG 並放入 HTML；保留外觀但不能逐字編輯，圖片可能很大 |
| 圖片管理 | 圖片預覽、單張/整包下載、替換圖片路徑，選配 CMS 圖庫 API |
| CMS 相容檢查 | HTML 安全清理、圖片/連結/表格/標題等靜態檢查。**不能代替在目標 CMS 實際儲存/預覽驗收** |
| SEO | 標題、摘要草稿、基本提示、SEO JSON 匯出；實際 meta 要在 CMS 頁面設定 |
| AI | 部署 `api/ai.php` 並在主機設 `OPENAI_API_KEY` 後可使用；預設不會送文件到外部 AI |

## 資料隱私

- 一般文件處理在瀏覽器內完成，不會主動將文件上傳到文轉網伺服器。
- CDN 加載 JS/OCR 模型，會對 CDN 發出請求。使用「CMS 圖庫上傳」會把圖片傳到指定 API；使用 AI 才會將文章內容傳到自己配置的代理，再轉送 AI 提供商。
- 瀏覽器 `localStorage` 只儲存偏好、API 端點，不儲存文件內容及金鑰。
- HTML 在前端經 DOMPurify 淨化；**服務端 CMS 仍需再次清理 HTML**，並限制可接受的標籤及 CSS。

## 可選：啟用 AI

1. 主機需有 PHP 8.1+、`curl` 和 `mbstring` 擴充套件。
2. 將 `api/ai.php` 上傳至相同網站來源。
3. **在伺服器環境變數** 設定 `OPENAI_API_KEY`。可選 `OPENAI_MODEL`；不要將金鑰寫在 HTML、JS 或任何前端可讀檔案。
4. 到「圖片上傳與 AI 設定」填寫 `api/ai.php`（預設值）。
5. 正式公開上線前，必須加入登入權限、CSRF 防護、用戶級配額、監控及費用上限。範例代理程式只有基本的同來源檢查與 session 限流，**不是公開營運的完整安全方案**。

> 如果沒有設置 API 金鑰，SEO 規則建議仍可使用，但 AI 重寫按鈕會明確報錯。

## CMS 圖片 API 契約

- URL 可透過設定視窗輸入。
- `POST` `multipart/form-data`，欄位名稱預設 `file`。
- JSON 回傳：`{"url":"https://example.com/uploads/123.jpg"}`。
- 如果 CMS API 與轉換工具不在同一網域，CMS API 必須有明確 CORS 設定及驗證機制。
- 範例未提供真實 CMS API，因為各網站認證及上傳流程不同。沒有填 API 時，圖片可下載並由客戶手動上傳到網站圖庫，再替換網址。

## 部署與驗收

- 請用 HTTPS 網站打開，避免瀏覽器對剪貼簿功能設限。
- 用目標 CMS 實際確認 `h2/h3/p/ul/table/img`、`style` 屬性和圖片外連 URL 在「儲存後」不被清掉。
- PDF 頁數多或 PPT 圖片大時可能耗費大量記憶體；目前 25 MB 是檔案大小限制，不代表一定能順利處理所有大型文件。
- 本專案是可自行部署的完整原始碼，不含網站主機、API 密鑰、真實 CMS 權限或已部署的線上服務。
