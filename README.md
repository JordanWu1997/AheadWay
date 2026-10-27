<div align="center">
  <img src="bus_tracker/static/LOGO.jpeg" alt="AheadWay 標誌" width="112" />
  <h1>AheadWay</h1>
  <p><strong>下一班，還有下幾班。</strong><br />掌握臺北與新北公車即時動態，不只看下一班。</p>
  <p>
    <a href="README.md">繁體中文</a> · <a href="README_en.md">English</a> ·
    <a href="docs/learning-guide.md">程式入門教學（英文）</a> ·
    <a href="bus_tracker/static/technical-report.md">技術報告</a> ·
    <a href="https://pda5284.gov.taipei/MQS/routelist.jsp">臺北市官方公車路線</a>
  </p>
</div>

<p align="center"><a href="LICENSE">Apache-2.0 授權</a></p>

<p align="center">
  <img src="bus_tracker/static/BANNER.jpeg" alt="AheadWay 臺北城市、公車與到站資訊" width="100%" />
</p>

## 解決什麼問題？

多數公車資訊只回答「下一班幾分鐘到？」乘客仍不知道後面還有沒有車、資料是否夠新，以及現在該不該出門去站牌。

AheadWay 是臺北與新北公車追蹤儀表板。它將官方下一班狀態與系統辨識到的後續公車推估分開呈現，並在同一個頁面查看路線、站牌、資料更新時間與建議出發時間。

## 畫面預覽

以下桌面與手機截圖由 Playwright 從執行中的本機網站擷取，示範 **橘5 → 往板橋 → 捷運景安站(景平路)**。畫面同時顯示官方下一班、已辨識的本方向公車與可能折返的下一輪公車。截圖擷取於 2026-10-27；到站時間與車輛位置是當時的快照，開啟網站時會以最新資料重新計算。

<details open>
  <summary>桌面版 · 橘5往板橋／捷運景安站</summary>
  <p align="center"><img src="docs/aheadway-dashboard-desktop.png" alt="AheadWay 桌面版：橘5往板橋、捷運景安站(景平路)的到站資訊、後續公車、路線圖與語音控制" width="100%" /></p>
</details>

<details>
  <summary>手機版 · 橘5往板橋／捷運景安站</summary>
  <p align="center"><img src="docs/aheadway-dashboard-mobile.png" alt="AheadWay 手機版：橘5往板橋、捷運景安站(景平路)的到站資訊、後續公車與出發建議" width="390" /></p>
</details>

## 功能

- **不只顯示下一班。** 官方下一班預估與逐車推估分開呈現。後續公車根據近期車輛位置、停靠事件與站間行車時間計算，並標示推估範圍和資料年齡。
- **支援不同方向與迴圈路線。** 可切換路線、方向和站牌，也可選擇納入另一方向完成行程、折返後可能繼續行駛的車輛；這類下一輪車會清楚標示為條件式推估。
- **看得到整條路線。** 逐站查看官方狀態與近期公車事件、搜尋站名、跳至目前選取站牌，並透過可縮放路線示意圖查看方向及公車數量。
- **估算何時出門。** 將到站資訊與手動輸入的步行時間或瀏覽器位置粗估搭配，並預留兩分鐘緩衝。
- **語音播報即時資訊。** 可使用中文或英文語音提醒、定時播報；語音來源包含瀏覽器語音、eSpeak 或本機 OpenAI 相容 TTS。擁有者儀表板也可設定每日語音排程。
- **手機出發通知。** 在支援的 HTTPS 部署環境中，可透過 Web Push 在關閉頁面後接收文字通知；此功能不會在背景播放語音。
- **從自己的路線開始。** 初次開啟會顯示簡短指引與空白路線清單；搜尋臺北／新北市路線，或貼上官方路線網址即可加入。路線、常用行程與偏好儲存在目前瀏覽器。

## 為什麼使用 AheadWay？

當單一「下一班」數字不足以決定何時出門時，AheadWay 能補上更多可用資訊。介面明確區分**官方資料**與**系統推估**、顯示資料更新時間，也能查看第一班之後已辨識的公車。路線檢視協助了解「車目前在路線哪裡？」步行時間與出發建議則協助判斷「我現在該不該前往站牌？」

手機版適合快速查詢站牌，桌面版則保留完整路線細節與語音控制。本機儀表板不需要帳號。

## 快速開始

需要 Python 3.10 以上版本，並可連線至臺北／新北公開公車資料來源。

```bash
git clone <your-repository-url>
cd <repository-directory>
python3 -m bus_tracker.server 8000
```

開啟 <http://127.0.0.1:8000>，選擇路線、方向和站牌。畫面會定期更新；改選站牌時會立即要求較新的資料。

選用功能另有需求：

- 安裝 **eSpeak NG**，以便在瀏覽器語音不可用時由伺服器合成語音。
- 若要使用 OpenAI 相容語音 API，請啟動相容的本機 TTS 服務。
- 若要遠端 HTTPS 存取和手機 Web Push，請依照專案中的擁有者／公開服務設定及 Tailscale Funnel 部署說明。請勿將僅供擁有者使用的排程控制公開。

完整安裝方式、Tailscale Funnel、API 與資料來源、到站推估、語音設定、通知及已知限制，請參閱[技術報告](bus_tracker/static/technical-report.md)。

想從零開始學 Python、JavaScript、HTML、CSS 與 UI／UX？閱讀[英文程式入門教學](docs/learning-guide.md)，跟著一次路線搜尋理解從伺服器到畫面的完整流程，並動手做小練習。

## 資料來源與限制

系統讀取臺北與新北公開的路線、站牌、車輛、停靠事件及官方到站時間資料，不會從路線網頁憑空推算車輛位置。官方資料提供下一班預估，並未提供每一輛後續公車的到站時間；後續班次時間是根據新鮮且可辨識的車輛資料推估。

上游資料或車輛位置可能延遲。若車輛沒有新位置或停靠事件，系統可能無法列出該車。路線迴圈、端點折返、交通狀況與 GPS 品質也會影響估算。路線圖以站牌座標連線，並非道路導航；根據目前位置估算的步行時間也不是逐路導航。請一併參考畫面上的資料時間與不確定範圍。

本專案目前**未將 Hugging Face [`speech-to-speech`](https://github.com/huggingface/speech-to-speech) 整合為即時語音對話管線**。現有播報使用瀏覽器語音、eSpeak 或設定好的本機 TTS；完整語音對話可作為後續擴充方向。

網站右上角的 **中／EN** 按鈕可直接切換**繁體中文／English**；繁體中文是預設語言，選擇會保存在此瀏覽器。介面語言與語音播報語言分開設定。新增語言的字表結構與動態資料處理方式見[技術報告](bus_tracker/static/technical-report.md)。

## 專案結構

| 路徑 | 用途 |
| --- | --- |
| `bus_tracker/static/` | 儀表板、響應式樣式、瀏覽器互動、標誌、橫幅與技術報告 |
| `bus_tracker/static/i18n.js` | 繁體中文／英文介面字表與語言切換；可依字表新增語言 |
| `bus_tracker/server.py` | 本機擁有者儀表板、公開檢視服務與 JSON API |
| `bus_tracker/tracker.py` | 公車資料快取、路線追蹤與逐車到站推估 |
| `bus_tracker/feeds.py`、`catalog.py` | 市府資料來源與路線搜尋 |
| `bus_tracker/speech_audio.py`、`schedule.py`、`scheduled_voice.py` | 語音合成與擁有者語音排程 |
| `bus_tracker/push.py`、`bus_tracker/static/sw.js` | 選用的手機 Web Push 通知 |
| `deploy/` | 擁有者與公開服務的範例 user service |
| `docs/` | 程式入門教學與 Playwright 儀表板截圖 |

## 致謝

由 Jordan 開發，並在 [Codex](https://openai.com/codex/) 中獲 GPT-6-Sol 協助設計與實作。AheadWay 標誌與橫幅使用 Google Imagen 3，透過 Gemini 3.6 Flash 生成。資料來自臺北市與新北市公車公開資訊。資料來源與實作細節請見[技術報告](bus_tracker/static/technical-report.md)。

## 授權條款

除另有註明外，本專案採用 [Apache License 2.0](LICENSE)。第三方資料與服務仍適用各自的授權及使用條款。
