/* AheadWay UI locales. Chinese in index.html/app.js is the source language.
   Add a locale by copying the `en` catalog, translating its entries, and adding it
   to `locales`. Dynamic text is localized as it is rendered, including live data. */
(() => {
  const storageKey = 'aheadway-ui-language';
  const en = {
    label: 'English', short: 'EN', htmlLang: 'en',
    exact: {
      '放大文字':'Use larger text','恢復標準字體':'Use standard text size','即時資料':'Live data','作者 Jordan ·':'By Jordan ·','下一班，':'The next bus, ','還有下幾班。':'and the ones after.',
      '先加入你要搭的公車路線':'Add your first bus route',
      '搜尋臺北／新北市公車路線，再選擇方向與上車站牌。AheadWay 會顯示下一班、後續來車與建議出發時間。':'Search for a Taipei or New Taipei bus route, then choose a direction and stop. AheadWay shows the next bus, following buses, and when to leave.',
      '找路線':'Find a route','輸入路線名稱，或貼上官方 route.jsp 連結。':'Enter a route name or paste an official route.jsp link.',
      '輸入中文或英文路線名稱，或貼上官方 route.jsp 連結。':'Enter a Chinese or English route name, or paste an official route.jsp link.',
      '選站牌':'Choose a stop','選擇行車方向與上車站牌。':'Choose the direction and boarding stop.',
      '看來車':'See arrivals','查看即時到站與後續車輛，按需要開啟提醒。':'See live arrivals and following buses, then turn on alerts if useful.',
      '＋ 加入第一條路線':'+ Add your first route','路線與常用行程只儲存在此瀏覽器。':'Routes and saved trips are stored only in this browser.',
      '取消':'Cancel','確認移除':'Remove route',
      '請先關閉手機通知':'Turn off phone alerts first','請先關閉語音排程':'Turn off the voice schedule first',
      '已啟用的手機通知仍會繼續；請先在下方關閉通知。':'Phone alerts would continue; turn them off below first.',
      '已啟用的語音排程仍會繼續；請先在語音設定中關閉排程。':'The voice schedule would continue; turn it off in Voice settings first.',
      '加入路線':'Add route','關閉加入路線':'Close route picker','關閉':'Close','搜尋公車路線':'Find a bus route',
      '路線名稱或官方連結':'Route name or official link','搜尋':'Search',
      '輸入路線名稱或貼上官方連結後搜尋。':'Enter a route name or paste an official link to search.',
      '如何新增路線？':'How do I add a route?','可在':'Choose a route from the',
      '官方路線清單 ↗':'official route list ↗','選擇路線，複製 route.jsp 連結並貼上搜尋。':'then copy its route.jsp link and paste it above.',
      '新增的路線只儲存在此瀏覽器；不同裝置不會自動同步。':'Added routes are saved in this browser and do not sync across devices.',
      '移除路線':'Remove route',
      '下一步：確認行車方向，再選擇上車站牌，即可查看下一班與後續來車。':'Next: confirm the direction and choose a boarding stop to see upcoming buses.',
      '移除目前路線分頁':'Remove current route tab','路線與站牌':'Route & stop','載入中…':'Loading…',
      '常用行程':'Saved trips','顯示其餘行程':'Show more trips','行車方向':'Direction',
      '往捷運景安站':'To Jingan MRT Station','往板橋':'To Banqiao','往三峽':'To Sanxia',
      '上車站牌':'Boarding stop','☆ 儲存常用':'☆ Save trip','載入站牌中…':'Loading stops…','更新':'Refresh',
      '計算哪些來車？':'Which buses are included?','正在載入所選站牌…':'Loading the selected stop…',
      '也估算另一方向的下一輪公車':'Include buses returning from the other direction',
      '須跑完原方向並折返續行；到站時間較不確定':'They must finish their trip and turn around, so arrivals are less certain.',
      '影響逐車到站、出發建議與定時語音；官方下一班時間不變。下一輪車不觸發到站提醒或手機通知。':'Applies to vehicle arrivals, departure advice, and scheduled briefings. The official next arrival stays the same. Returning buses do not trigger arrival alerts or phone notifications.',
      '選擇站牌':'Choose a stop','正在讀取資料時間…':'Checking data age…','資料說明 ↗':'About the data ↗',
      '正在取得公車資訊…':'Loading bus information…','官方下一班預估':'Official next arrival',
      '本方向來車與後續車':'Approaching & following buses','正在確認沿線公車…':'Checking buses along the route…',
      '官方只提供下一班預估；每輛車的到站範圍由沿線位置推估。另一方向的車須折返續行才會抵達所選站牌，可能在端點停駛；下一輪出發時間僅供參考，不觸發手機或語音到站提醒。':'The official source estimates only the next arrival. Arrival ranges for other buses are estimated from their positions. Buses in the other direction may end service at the terminal; their return estimates are for reference and do not trigger alerts.',
      '建議出發時間':'When to leave','等待到站預估':'Waiting for arrivals','載入到站預估後顯示':'Shown after arrival data loads',
      '預留步行時間與 2 分鐘緩衝；另一方向下一輪僅供參考，須確認仍繼續行駛。':'Includes walking time and a two-minute buffer. Check that returning buses continue in service.',
      '步行估算方式':'Walking time method','使用目前位置':'Use current location','步行到站（分鐘）':'Walk to stop (minutes)',
      '目前以手動分鐘估算步行時間。':'Using the manual walking-time estimate.','手動設定':'Set manually','使用目前位置只取得一次座標來估算步行時間；換站時重新取得。座標留在瀏覽器，不會傳到伺服器。持續定位只在「前往站牌模式」啟用。':'Use current location to get one position for the walking estimate; it is refreshed when you change stops. Coordinates stay in this browser and are not sent to the server. Continuous tracking is used only in Walking to stop mode.',
      '重新定位':'Update location','手機出發提醒':'Phone departure alerts','計畫模式 · 出發建議':'Plan mode · departure advice',
      '計畫模式':'Plan mode','前往站牌模式':'Walking to stop',
      '上方建議隨公車更新；移動後請按「重新定位」。':'The advice above updates with buses. Tap “Update location” after moving.',
      '持續取得此手機位置，比對所選站牌與最新公車時間。請保持此頁開啟；關閉或背景執行時無法保證持續定位與即時警告。':'Continuously checks this phone’s location against the selected stop and live arrivals. Keep this page open for reliable warnings.',
      '正在取得目前位置…':'Getting current location…','取得位置後顯示步行時間與可趕上公車的餘裕。':'Walking time and the time left to catch the bus appear after locating you.',
      '停止前往模式':'Stop walking mode','前往警告只在此頁運作；下方背景通知仍可獨立使用。':'Walking warnings work only while this page is open. Background notifications can work separately.',
      '關頁後的出發通知（選用）':'Departure alerts after closing this page (optional)',
      '提醒目標會固定；瀏覽其他路線不會切換。啟用時瀏覽器會詢問通知權限，可隨時關閉。iPhone／iPad 請先加入主畫面。':'The alert stays linked to this stop when you browse other routes. Your browser will ask permission when you enable it; you can turn it off anytime. On iPhone or iPad, first add the site to your Home Screen.',
      '尚未設定提醒目標':'No alert target set','改為提醒目前站牌':'Use current stop','尚未啟用':'Off','重試同步':'Retry sync','啟用手機通知':'Enable phone alerts',
      '點站牌即可追蹤':'Tap a stop to track it',
      '↪ 計算另一方向公車折返後抵達所選站牌的時間；這些車可能在終點停駛。':'↪ Estimates when buses from the other direction could reach your stop after turning around. They may stop service at the terminal.',
      '搜尋沿線站牌':'Find a stop on this route','跳至所選站牌':'Jump to selected stop',
      '去程':'Outbound','返程':'Inbound','正在載入路線…':'Loading route…',
      '顯示路線圖與公車位置':'Show route map and bus positions','收合路線圖':'Hide route map',
      '藍色箭頭與站名＝目前選擇':'Blue arrow and stop name = selected stop','去程公車數':'Outbound bus count','返程公車數':'Inbound bus count',
      '正在載入站牌座標，路線圖稍後顯示…':'Loading stop coordinates; the map will appear shortly…','重設':'Reset',
      '可拖曳路線圖、用滾輪或上方按鈕縮放。站牌座標連線僅為位置示意，並非實際道路軌跡。':'Drag the map, scroll, or use the buttons to zoom. Lines connect stop coordinates and do not show actual roads.',
      '每站右側為官方到站狀態；車牌標記是最近的進站或離站事件，包含尚未接近所選站牌的沿線公車。點站牌即可切換追蹤。':'Each stop shows its official arrival status. Vehicle labels show recent stop arrivals or departures, including buses still far from your stop. Tap a stop to track it.',
      '語音提醒':'Voice alerts','可選到站提醒或定時播報；手動播放需保持頁面開啟。':'Choose arrival alerts or scheduled briefings. Keep this page open for manual playback.',
      '啟用語音':'Enable voice','停止語音':'Stop voice','試播目前資訊':'Play current update','語音設定':'Voice settings',
      '語音模式':'Voice mode','到站提醒':'Arrival alert','定時播報':'Scheduled briefing','播報語言':'Spoken language',
      '中文':'Chinese','接近門檻':'Alert threshold','其他／自訂分鐘':'Other / custom minutes',
      '自訂接近門檻（1–60 分鐘）':'Custom threshold (1–60 minutes)','播報間隔（分鐘）':'Briefing interval (minutes)',
      '播報內容':'Briefing detail','簡短 · 只報各車到站時間':'Short · arrival times only','詳細 · 車牌與下一站':'Detailed · vehicle IDs and next stops',
      '朗讀語音':'Voice engine','本機 TTS 伺服器':'Local TTS server','瀏覽器自動選擇':'Browser default','eSpeak · 標準中文':'eSpeak · standard Chinese',
      '進階語音設定':'Advanced voice settings','TTS 模型':'TTS model','聲音名稱':'Voice name',
      '連接 localhost:8001；已測試 anne，可輸入此伺服器支援的其他聲音名稱。':'Connects to localhost:8001. Voice “anne” has been tested; you can enter another voice supported by this server.',
      '每日語音排程':'Daily voice schedule','每天啟動時間':'Start time each day','持續播報（分鐘）':'Duration (minutes)',
      '每天定時啟動':'Start every day','儲存排程':'Save schedule','尚未設定排程':'No schedule set',
      '儲存時的站牌、模式、間隔或接近門檻、語言與語音會寫入此電腦的 cron。開始後依模式持續播報，即使關閉頁面也會繼續。選瀏覽器語音時，cron 使用對應語言的 eSpeak 標準語音。':'Saving writes the selected stop, mode, interval or threshold, language, and voice to this computer’s cron. It continues after you close the page. Browser voice uses the matching eSpeak voice in cron.',
      'AheadWay · 形象視覺':'AheadWay · brand artwork','完整標誌 ↗':'Full logo ↗','完整橫幅 ↗':'Full banner ↗',
      '資料：臺北市／新北市公車開放資料 ·':'Data: Taipei / New Taipei open bus data ·',
      '技術報告／運作說明':'Technical report / how it works','（':'(', '） · 每 30 秒檢查一次':') · checked every 30 seconds',
      '致謝：本網站由 Jordan 開發，並在':'Acknowledgements: Built by Jordan with',
      '中獲 GPT-6-Sol 協助設計與實作。':'and GPT-6-Sol for design and implementation assistance.',
      '查看完整 AheadWay 標誌':'View full AheadWay logo','用 Gmail 寄信給 Jordan：jordankhwu@gmail.com':'Email Jordan: jordankhwu@gmail.com',
      'Jordan 的 GitHub 個人頁面':'Jordan’s GitHub profile','AheadWay 專案 GitHub 儲存庫':'AheadWay project repository',
      '返回目前追蹤站牌選擇':'Back to the tracked stop','顯示前面的公車路線':'Show previous routes','公車路線':'Bus routes',
      '顯示更多公車路線':'Show more routes','例如 0東、紅2，或貼上 route.jsp 連結':'e.g. 0 East, Red 2, or paste a route.jsp link',
      '儲存目前站牌為常用行程':'Save this stop as a trip','重新整理':'Refresh','手機出發提醒模式':'Phone departure alert mode',
      '收合路線':'Collapse route','展開路線與沿線公車':'Expand route and buses','輸入站名，例如景安站':'Enter a stop, e.g. Jingan Station',
      '查看沿線站牌方向':'Choose route direction','路線圖圖例':'Route map legend','路線圖縮放':'Route map zoom',
      '放大路線圖':'Zoom in on route map','放大':'Zoom in','縮小路線圖':'Zoom out of route map','縮小':'Zoom out','重設路線圖縮放':'Reset route map zoom',
      '查看完整 AheadWay 形象橫幅':'View full AheadWay banner','AheadWay 橫幅：臺北城市天際線、兩輛公車與不只下一班的標語':'AheadWay banner with Taipei skyline, two buses, and the next buses slogan',
      '未發車':'Not departed','末班已過':'Last bus has passed','今日未營運':'Not operating today','交管不停':'Skipping this stop','資料暫缺':'Data unavailable',
      '已到站':'At stop','進站':'Arriving','離站':'Departed','進站中':'Arriving','已離站':'Departed',
      '不明':'Unknown','未知':'Unknown','所選站牌':'selected stop','位置估計':'Estimated position','站間時間推估':'Estimated from time between stops',
      '官方下一班':'Official next bus','下一輪':'Next circuit','逐車':'Vehicle','資料暫不可用':'Data unavailable',
      '收合其他行程':'Hide other trips','此方向沒有符合的站牌':'No matching stops in this direction','此站不提供上車':'Boarding unavailable at this stop',
      '更新中…':'Updating…','找到':'Found','站':'stops','輛':'buses','分鐘':'min','秒':'sec','公尺':'m',
      '正在更新…':'Updating…','正在計算…':'Calculating…','正在計算建議出發時間…':'Calculating when to leave…',
      '即將進站':'Arriving now','即將到站':'Arriving soon','暫無預估':'No estimate','官方暫無到站時間':'No official arrival time',
      '此時間只代表下一班，由官方預估':'The official estimate covers only the next bus.',
      '官方目前未提供本站到站時間。':'No official arrival time is available for this stop.',
      '依推估到站時間排列':'Sorted by estimated arrival','另一方向須跑完並接續下一輪；不保證繼續載客':'Must finish the other direction and continue; service is not guaranteed',
      '已抵達所選站牌':'At selected stop','本站停靠中':'At this stop','車輛定位':'Vehicle position',
      '下一輪推估 · 不保證續行':'Next circuit estimate · service not guaranteed','逐車推估 · 信心較低':'Vehicle estimate · low confidence',
      '逐車推估':'Vehicle estimate','定位與推估依據':'Position and estimate details','依站位事件定位':'Position from stop event',
      '較高':'High','中等':'Medium','較低':'Low','播報內容：':'Spoken update: ',
      '排程未啟用':'Schedule off','簡短':'Short','詳細':'Detailed','本機 TTS':'Local TTS','瀏覽器語音':'Browser speech',
      '語音播放完成':'Voice playback complete','正在準備語音…':'Preparing audio…',
      '現在出發':'Leave now','資料已過時':'Data is stale','暫無可確認班次':'No confirmed bus',
      '計畫模式 · 出發建議':'Plan mode · departure advice','背景通知未啟用':'Background alerts off',
      '正在關閉通知':'Turning off alerts','通知同步需重試':'Alert sync needs retry','背景通知不可用':'Background alerts unavailable',
      '新北市':'New Taipei','臺北市':'Taipei','橘5':'Orange 5','橘五':'Orange Five',
      '請先選擇可追蹤站牌':'Choose a trackable stop first','通知服務尚未準備好':'Notification service is not ready',
      '資料無法取得':'Data could not be loaded','語音播放失敗':'Voice playback failed',
      '原始橘5路線':'Original Orange 5 route',
      '尚無常用行程 · 選站後按「☆ 儲存常用」':'No saved trips · choose a stop and tap “☆ Save trip”',
      '路線':'route','將到站':'Arriving soon','3分':'3 min','4分':'4 min','5分':'5 min',
      '3分鐘內':'Within 3 min','5分鐘內':'Within 5 min','5分鐘以上':'Over 5 min',
      '本方向':'This direction','下一輪':'Returning','推估':'estimated','沿線':'on route',
      '需折返續行後抵達':'must turn around to reach this stop',
      '可追蹤':'Tracking','公車。':'buses.','正在更新到站資訊與沿線公車。':'updating arrivals and buses along the route.',
      '到站資訊與沿線公車。':'arrivals and buses along the route.',
      '不保證續行':'may end service','路線與動態':'route and live data'
    },
    phrases: {
      '移除 ':'Remove ',' 路線？':' route?',' 路線':' route',
      '這會移除本瀏覽器的路線分頁':'This removes the route tab from this browser',
      '及 ':' and ',' 筆常用行程':' saved trips',
      '；日後可再次搜尋加入。':'. You can search for it and add it again later.',
      '官方資料顯示「今日未營運」，但本方向偵測到 ':'The official feed says “Not operating today,” but ',
      ' 輛公車。資料不一致，無法據此判斷本站是否停駛；下方逐車時間為推估。':' buses were detected in this direction. The feeds disagree, so stop service cannot be determined from this status. Vehicle times below are estimates.',
      '官方回報「':'The official feed reports “','」，目前沒有本站的官方到站時間。':'”; no official arrival time is available for this stop.',
      '本方向 ':'This direction: ',' · 下一輪 ':' · returning: ',' 輛接近本站':' approaching buses',
      '；另有 ':'; another ',' 輛在另一方向，只有折返續行才可能在下一輪抵達。':' buses in the other direction may arrive only if they turn around and continue.',
      '各組依推估時間排序；車牌與官方下一班時間不一定能一一對應。':'Groups are sorted by estimated arrival. Vehicle IDs may not match the official next-bus time.',
      '目前沒有可確認位置、正在接近本站的車輛。這不代表沒有班次；仍可參考上方官方下一班狀態。':'No positioned buses are confirmed to be approaching this stop. This does not mean there is no service; check the official next-bus status above.',
      '本方向接近本站 · ':'Approaching this stop · ',
      '第 ':'Bus #',' 輛':' buses',
      '下一輪推估':'returning bus estimate',
      '逐車推估':'vehicle estimate',
      '目前在':'Currently on the ',
      ' · 下一站 ':' · next stop: ',
      ' · 需折返續行後抵達':' · may arrive after turning around',
      ' 沿線 · ':' on route · ',
      '將到站':'Arriving soon','分鐘後到站':' min to arrival',
      '每輛車進入門檻時提醒':'alerts when buses enter threshold','可能折返續行 · ':'May return · ',
      '下一站 ':'Next stop: ',
      '輪推估':' circuit estimate','輛公車':'buses',
      '在本站':'at this stop','到站':'arriving',
      '資料不一致':'data conflict',' · 約 ':' · about ',' 站前':' stops away',
      '目前在':'Currently ',' · 折返後才可能抵達':' · may arrive after turning around',
      ' · 回報約 ':' · last seen about ',' 秒前':' sec ago',' · GPS 偏離路線約 ':' · GPS offset about ',
      ' 公尺':' m',' · 中心約 ':' · central estimate about ',' 分鐘':' min',' · 參照 ':' · based on ',
      ' 次實際到站':' actual arrivals',' · 推估信心':' · confidence: ',
      ' 段實測':' measured segments',' 段官方站間差':' official interstop segments',' 段站距補足':' distance-based segments',
      '資料源最久 ':'Oldest feed updated ',' 秒前更新':' sec ago',' · 資料可能過時':' · data may be stale',
      ' · 車輛回報見下方':' · vehicle reports below','查詢於 ':'Checked at ',
      '最近資料 · 正在取得最新資訊…':'Recent data · checking for updates…',
      '將估算本方向及另一方向下一輪抵達':'Estimate buses in this direction and those returning to ',
      '只估算本方向抵達':'Estimate only buses in this direction arriving at ',
      '的公車。':' .','的公車':' buses',
      '點站牌追蹤 · 拖曳、滾輪或按鈕縮放':'Tap a stop to track · drag, scroll, or use buttons to zoom',
      '站牌座標未載入；請重新啟動伺服器。下方路線與動態仍可使用。':'Stop coordinates are unavailable. Restart the server; the route list and live data still work.',
      '目前只列出本方向往':'Showing buses in this direction approaching ',
      '行駛的公車。':'.','公車若在端點折返續行，也可能在下一輪抵達':' buses may reach ',
      '；這些時間較不確定。':' on the next circuit after turning around; these times are less certain.',
      '正在取得':'Loading ','公車資訊…':' bus information…',
      '正在更新':'Updating ','的官方到站資訊與沿線公車…':' official arrivals and buses along the route…',
      '路線資料暫時無法載入；已保留偏好，重新開啟頁面可重試。':'Route data is temporarily unavailable. Your preferences were kept; reopen the page to retry.',
      '儲存的路線暫時無法載入；保留偏好，重新開啟頁面可重試。':'Saved routes are temporarily unavailable. Your preferences were kept; reopen the page to retry.',
      '請輸入路線名稱或貼上官方路線連結。':'Enter a route name or paste an official route link.',
      '正在搜尋可追蹤路線…':'Searching trackable routes…',
      '目前的臺北／新北市即時資料中找不到這條路線；公路客運與特殊路線可能尚未支援。':'No match in the current Taipei / New Taipei live data. Intercity and special routes may not be supported.',
      '找不到符合的路線。請試另一種中文或英文寫法，或貼上官方 route.jsp 連結。':'No matching route. Try another Chinese or English spelling, or paste an official route.jsp link.',
      '例如 橘5、Orange 5、908，或貼上 route.jsp 連結':'e.g. Orange 5, 908, or paste a route.jsp link',
      '請選擇上車站牌':'Choose a boarding stop',
      '可能趕不上':'You may miss this bus',
      '最多可加入 20 條路線；請先移除一條已加入的路線。':'You can add up to 20 routes. Remove one before adding another.',
      '搜尋失敗：':'Search failed: ','已顯示所選站牌的最近資料，正在取得最新公車動態…':'Showing recent data for this stop while loading the latest vehicle positions…',
      '即時更新暫不可用；目前顯示最近可用的公車資料。':'Live updates are unavailable; showing the most recent available bus data.',
      '最近資料 · 即時更新失敗':'Recent data · live update failed',
      '公車資料已過時；請更新後再查看出發建議。':'Bus data is stale. Refresh before checking when to leave.',
      '目前沒有可確認來得及搭乘的車輛；請查看各車推估範圍。':'No bus can be confirmed catchable. Check each estimated arrival range.',
      '官方下一班可能趕不上；目前沒有可確認來得及搭乘的後續車輛。':'You may miss the official next bus; no following bus can be confirmed catchable.',
      '若此車在終點折返續行，可參考 ':'If this bus turns around and continues, consider ',
      '可考慮 ':'Consider ','前出發':'leave by ','建議 ':'recommended ','約 ':'about ',
      '（現在）':'(now)','分鐘後）':'min from now)','；可能在終點停駛，請再確認班次。':'; it may end service at the terminal. Check the trip again.',
      '折返參考 · ':'Possible return · ','官方下一班可能':'The official next bus may',
      '正在載入站牌 · 可先試播':'Loading stop · test playback is available',
      '已啟用；依設定間隔播報':'On · briefings at the selected interval',
      '已啟用；每輛車進入門檻時提醒':'On · alerts when buses enter the threshold',
      '尚未啟用 · 可按「試播」檢查本機語音':'Off · test local speech with “Play current update”',
      '尚未啟用 · ':'Off · ','所選語言語音可用':'voice available for selected language',
      '未找到對應語音，請先試播':'no matching voice found; test playback',
      '尚未偵測到系統語音，請先試播':'No system voice detected; test playback',
      '正在向本機 TTS 伺服器取得語音…':'Getting audio from the local TTS server…',
      '正在準備 eSpeak 語音…':'Preparing eSpeak audio…','瀏覽器語音失敗，正在準備本機語音…':'Browser speech failed; preparing local audio…',
      '正在朗讀 · ':'Speaking · ','系統語音':'system voice',
      '正在儲存排程…':'Saving schedule…','排程儲存失敗：':'Could not save schedule: ',
      '無法讀取排程：':'Could not load schedule: ',
      '到站提醒 ':'Arrival alert · ','每 ':'Every ',' 分鐘播報':' min briefing',
      '簡短播報':'Short briefing','詳細播報':'Detailed briefing',
      '步行約 ':'Walk about ','預留 2 分鐘緩衝。':'Includes a 2 min buffer.',
      '這班可能趕不上':'You may miss this bus','請加快腳步':'Walk faster',
      '依估算步行時間可趕上':'You can likely catch this bus',
      '定位精度不足':'Location accuracy is too low','重新定位失敗':'Location update failed',
      '此裝置無法持續定位':'This device cannot track location continuously',
      '位置已過時':'Location is stale','公車資料過時':'Bus data is stale',
      '暫無可靠的本方向來車':'No reliable approaching bus yet',
      '停止前往模式':'Stop walking mode','重試定位':'Retry location','重新開始定位':'Resume location tracking',
      '點此查看行程':'Tap to view trip','已改用手動步行時間。':'Using manual walking time.',
      '定位中 · 暫用手動':'Locating · using manual time','依目前位置':'From current location',
      '尚未啟用；啟用後會固定目前選擇的站牌。':'Off; enabling will pin the currently selected stop.',
      '此路線分頁已移除，通知仍會發送':'This route tab was removed; alerts will continue',
      '正在同步固定站牌的手機提醒…':'Syncing phone alerts for the pinned stop…',
      '已關閉手機通知':'Phone alerts turned off','關閉手機通知':'Turn off phone alerts',
      '重試關閉手機通知':'Retry turning off phone alerts',
      '上次關閉尚未完成；可重試。':'The previous attempt to turn off alerts was incomplete; retry.',
      '正在確認手機通知目標…':'Checking phone alert target…',
      '通知訂閱已失效，請重新啟用。':'Alert subscription expired; enable it again.',
      '正在關閉手機通知…':'Turning off phone alerts…'
    }
  };
  Object.assign(en.exact, {
    '標準':'Standard','女聲 1':'Female 1','女聲 2':'Female 2','女聲 3':'Female 3',
    '男聲 1':'Male 1','男聲 2':'Male 2','男聲 3':'Male 3','耳語':'Whisper',
    '位置已過時':'Location is stale','正在更新所選站牌…':'Updating selected stop…',
    '公車資料過時':'Bus data is stale','暫無可靠的本方向來車':'No reliable bus in this direction',
    '定位精度不足':'Location accuracy is too low','重新定位失敗':'Location update failed',
    '此裝置無法持續定位':'This device cannot track location continuously',
    '站牌座標不可用':'Stop coordinates unavailable','定位已中斷':'Location interrupted',
    '無法啟動定位':'Could not start location tracking','定位已暫停':'Location tracking paused',
    '此方向沒有符合的站牌':'No matching stops in this direction',
    '正在取得位置…':'Getting location…','已改用手動步行時間。':'Using manual walking time.',
    '使用手動步行時間。':'Using manual walking time.',
    '已停止持續定位；保留最後步行估算。可按「重新定位」更新。':'Continuous location stopped. The last walking estimate is kept; tap “Update location” to refresh.',
    '請允許定位，並保持此頁開啟。':'Allow location access and keep this page open.',
    '持續定位已停止；已改用手動步行時間。':'Continuous location stopped; using manual walking time.',
    '位置資料無效；已改用手動步行時間。':'Location data was invalid; using manual walking time.',
    '無法取得位置；已改用手動步行時間。':'Could not get your location; using manual walking time.',
    '無法取得位置；已改用手動步行時間。請檢查定位權限。':'Could not get your location; using manual walking time. Check location permission.',
    '此站缺少座標；已改用手動步行時間。':'No coordinates for this stop; using manual walking time.',
    '此瀏覽器需要安全連線（HTTPS 或 localhost）與定位功能；已改用手動步行時間。':'Location needs HTTPS or localhost and a compatible browser; using manual walking time.',
    '通知服務無法載入':'Notification service could not load',
    '通知同步逾時':'Notification sync timed out','通知訂閱已失效，請重新啟用。':'Alert subscription expired; enable it again.',
    '此裝置尚不支援背景通知。iPhone／iPad 請先將網站加入主畫面。':'Background notifications are unavailable on this device. On iPhone or iPad, add the site to your Home Screen first.',
    '伺服器未啟用推播':'Push notifications are not enabled on the server',
    '此裝置已有更新的提醒設定，請重試':'This device has newer alert settings; retry',
    '無法讀取手機通知服務':'Could not access the phone notification service',
    '無法讀取手機通知訂閱':'Could not read the phone alert subscription',
    '手機取消訂閱逾時':'Phone alert unsubscribe timed out',
    '瀏覽器禁止播放。請按「試播目前資訊」，並檢查網站音效權限。':'Browser blocked playback. Tap “Play current update” and check sound permission.',
    '找不到可用的中文語音。請啟用系統中文語音後再試播。':'No Chinese voice was found. Enable a Chinese system voice, then retry playback.',
    '瀏覽器封鎖音訊播放。請按「試播目前資訊」，並允許此網站播放音效。':'Browser blocked audio. Tap “Play current update” and allow sound for this site.',
    '本機 TTS 伺服器無法產生語音。請檢查 localhost:8001、模型與聲音名稱。':'The local TTS server could not generate audio. Check localhost:8001, the model, and the voice name.',
    '語音服務忙碌，請稍後重試。':'Voice service is busy. Try again shortly.',
    '本機語音檔無法產生。請確認伺服器已重新啟動，且系統已安裝 libespeak-ng。':'Local audio could not be generated. Restart the server and check that libespeak-ng is installed.',
    '瀏覽器無內建朗讀；可選本機 TTS 或 eSpeak':'Browser speech is unavailable; select local TTS or eSpeak',
    '正在儲存排程…':'Saving schedule…','排程無法儲存':'Could not save schedule',
    '已關閉手機通知':'Phone alerts turned off',
  });
  Object.assign(en.phrases, {
    '目前在':'Currently on the ','沿線 · ':'route · ',
    '需折返續行後抵達':'may arrive after turning around',
    '官方狀態與沿線車輛資料不一致':'The official status conflicts with vehicle positions',
    '官方資料顯示今日未營運，但沿線有公車動態；兩筆資料不一致':'The official feed says service is closed, but live vehicles are present; the feeds disagree',
    '正在更新所選站牌…':'Updating selected stop…',
    '回報約 ':'reported about ','開始，在':' starts at ',
    '到站提醒 ':'Arrival alert · ','分鐘門檻':'min threshold',
    '持續 ':'for ','分鐘 · ':'min · ',
    '前往站牌模式正在持續定位…':'Walking mode is tracking location…',
    '持續定位無法啟動；已改用手動步行時間。':'Continuous location could not start; using manual walking time.',
    '前往站牌模式':'Walking to stop',
    '已固定 ':'Pinned ','步行 ':'walk ','關閉頁面仍可通知。':'alerts continue after closing the page.',
    '通知：':'Alert: ','提醒目標：':'Alert target: ',
    '正在確認手機通知目標…':'Checking phone alert target…',
    '通知服務無法載入：':'Notification service could not load: ',
    '同步失敗：':'Sync failed: ','無法啟用通知：':'Could not enable alerts: ',
    '關閉未完成，請重試：':'Could not finish turning off alerts; retry: ',
    '已到站':'at the stop','約在':'about ',
  });
  // Numeric/live templates and punctuation are locale-owned too. A new locale
  // supplies its own patterns and fallback instead of inheriting English syntax.
  const arrivalLabelEn = label => label === '官方下一班'
    ? 'The official next bus' : `Bus ${label.replace(/\s*逐車推估$/, '')}`;
  const laterArrivalLabelEn = label => label === '官方下一班'
    ? 'a later official bus' : `bus ${label.replace(/\s*逐車推估$/, '')}`;
  const timeLabelEn = value => {
    const match = value.match(/^(上午|下午)\s*(.+)$/);
    return match ? `${match[2]} ${match[1] === '上午' ? 'AM' : 'PM'}` : value;
  };
  en.patterns = [
      [/^(.+?) 定位 · 直線約 (\d+) 公尺；含繞路與定位誤差，步行約 (\d+) 分鐘。非導航路線。$/,
        (_, time, metres, minutes) => `${timeLabelEn(time)} location · ${metres} m straight-line distance. Walking estimate: ${minutes} min, including detours and GPS error. Not a navigation route.`],
      [/^步行約 (\d+) 分鐘；(.+?)約 (\d+) 分鐘後到站；預留 2 分鐘緩衝。請查看後續車或官方最新狀態。$/,
        (_, walk, target, eta) => `Walk about ${walk} min. ${arrivalLabelEn(target)} is expected in about ${eta} min. Allow a 2-minute buffer. Check following buses or the latest official status.`],
      [/^步行約 (\d+) 分鐘；(.+?)約 (\d+) 分鐘後到站；預留 2 分鐘緩衝。較晚的 (.+?) 約 (\d+) 分鐘後到站，請確認是否為另一班車。$/,
        (_, walk, target, eta, following, nextEta) => `Walk about ${walk} min. ${arrivalLabelEn(target)} is expected in about ${eta} min. Allow a 2-minute buffer. ${laterArrivalLabelEn(following)} is estimated in about ${nextEta} min; check that it is a different bus.`],
      [/^步行約 (\d+) 分鐘；(.+?)約 (\d+) 分鐘後到站；預留 2 分鐘緩衝。目前緩衝只剩約 (\d+) 分鐘。$/,
        (_, walk, target, eta, remaining) => `Walk about ${walk} min. ${arrivalLabelEn(target)} is expected in about ${eta} min. Allow a 2-minute buffer. Only about ${remaining} min remain before the bus arrives.`],
      [/^步行約 (\d+) 分鐘；(.+?)約 (\d+) 分鐘後到站；預留 2 分鐘緩衝。扣除緩衝後，尚有約 (\d+) 分鐘餘裕。$/,
        (_, walk, target, eta, spare) => `Walk about ${walk} min. ${arrivalLabelEn(target)} is expected in about ${eta} min. Allow a 2-minute buffer. About ${spare} min remain after the buffer.`],
      [/^第 (\d+) 輛$/, (_, n) => `Bus ${n}`],
      [/^(\d+)分$/, (_, n) => `${n} min`],
      [/^(\d+) 分鐘$/, (_, n) => `${n} min`],
      [/^找到 (\d+) 個站牌$/, (_, n) => `${n} stops found`],
      [/^找到 (\d+) 條路線。$/, (_, n) => `${n} routes found.`],
      [/^本方向 (\d+) · 下一輪 (\d+)$/, (_, a, b) => `This direction ${a} · returning ${b}`],
      [/^本方向接近本站 · (\d+) 輛$/, (_, n) => `Approaching this stop · ${n} buses`],
      [/^可能折返續行 · (\d+) 輛$/, (_, n) => `May return · ${n} buses`],
      [/^(.+) 路線$/, (_, route) => `${message(route)} route`],
      [/^(.+?)：現在出發；預留的 2 分鐘緩衝已不足，可能趕不上這班。(.*)$/, (_, bus, tail) => `${message(bus)}: leave now. The 2-minute buffer is gone; you may miss this bus.${message(tail)}`],
      [/^(.+?)：現在出發，剩餘緩衝不足 1 分鐘。(.*)$/, (_, bus, tail) => `${message(bus)}: leave now; less than 1 minute of buffer remains.${message(tail)}`],
      [/^原始(.+)路線$/, (_, route) => `Original ${message(route)} route`],
      [/^移除 (.+) 分頁$/, (_, route) => `Remove ${message(route)} tab`],
      [/^(.+)：(.+)，可追蹤 (\d+) 輛公車。$/, (_, stop, status, n) => `${message(stop)}: ${message(status)}; tracking ${n} buses.`],
      [/^(.+)：正在更新到站資訊與沿線公車。$/, (_, stop) => `${message(stop)}: updating arrivals and buses along the route.`],
      [/^約 (\d+(?:–\d+)?) 分鐘$/, (_, time) => `about ${time} min`],
      [/^(.+)（(下一輪|逐車)推估(約 .+ 分鐘)）$/, (_, id, circuit, eta) => `${message(id)} (${circuit === '下一輪' ? 'returning bus' : 'vehicle'} estimate: ${message(eta)})`],
      [/^(.*?)：(?:約|建議) (\d{2}:\d{2}) 前出發（現在）(.*)$/, (_, lead, time, tail) => `${message(lead)}: leave now (by ${time})${message(tail)}`],
      [/^(.*?)：(?:約|建議) (\d{2}:\d{2}) 前出發（約 (\d+) 分鐘後）(.*)$/, (_, lead, time, mins, tail) => `${message(lead)}: leave by ${time} (about ${mins} min from now)${message(tail)}`],
      [/^(\d{2}:\d{2}) 前出發$/, (_, time) => `Leave by ${time}`],
  ];
  en.fallback = value => {
    return value.replace(/上午(\d{1,2}:\d{2}(?::\d{2})?)/g, '$1 AM')
      .replace(/下午(\d{1,2}:\d{2}(?::\d{2})?)/g, '$1 PM')
      .replaceAll('輛', ' buses').replaceAll('站', ' stops').replaceAll('分鐘', ' min')
      .replaceAll('秒', ' sec').replaceAll('：', ': ').replaceAll('；', '; ').replaceAll('，', ', ')
      .replaceAll('。', '.').replaceAll('（', ' (').replaceAll('）', ')').replaceAll('／', '/');
  };
  const locales = {'zh-TW': {label:'繁體中文', short:'繁中', htmlLang:'zh-Hant', exact:{}, phrases:{}}, en};
  const names = new Map([['捷運景安站(景平路)','Jingan MRT Station (Jingping Rd.)']]);
  let locale = 'zh-TW';
  try { if (localStorage.getItem(storageKey) in locales) locale = localStorage.getItem(storageKey); } catch (_) {}
  const sourceText = new WeakMap(), sourceAttributes = new WeakMap();
  const attributes = ['aria-label','title','placeholder','alt'];
  let observer;
  const hasChinese = text => /[\u3400-\u9fff]/u.test(text);
  function message(source) {
    if (locale === 'zh-TW' || !source || !hasChinese(source)) return source;
    const catalog = locales[locale];
    const trim = source.trim();
    const pad = source.match(/^\s*/)[0], end = source.match(/\s*$/)[0];
    if (Object.hasOwn(catalog.exact, trim)) return pad + catalog.exact[trim] + end;
    // Structured live messages need their own patterns; word substitution would
    // put units and time in the wrong order.
    const dynamic = catalog.patterns || [];
    for (const [pattern, format] of dynamic) {
      if (pattern.test(trim)) return pad + trim.replace(pattern, format) + end;
    }
    let value = trim;
    // Proper names come from the route catalog's nameEn / stop nameEn fields.
    for (const [zh, translated] of [...names].sort((a,b) => b[0].length-a[0].length)) value = value.split(zh).join(translated);
    for (const [zh, translated] of Object.entries(catalog.phrases).sort((a,b) => b[0].length-a[0].length))
      value = value.split(zh).join(translated);
    for (const [zh, translated] of Object.entries(catalog.exact).sort((a,b) => b[0].length-a[0].length))
      value = value.split(zh).join(translated);
    return pad + (catalog.fallback ? catalog.fallback(value) : value) + end;
  }
  function localizeText(node) {
    const current = node.nodeValue;
    const old = sourceText.get(node);
    if (old !== undefined && current === (node.parentElement?.id === 'voice-preview' && old.startsWith('播報內容：') && locale !== 'zh-TW'
      ? 'Spoken update: ' + old.slice('播報內容：'.length) : message(old))) return;
    const original = current;
    sourceText.set(node, original);
    if (locale !== 'zh-TW') {
      // The preview displays the actual spoken sentence, which can be Chinese
      // even when the surrounding interface is English.
      const next = node.parentElement?.id === 'voice-preview' && original.startsWith('播報內容：')
        ? 'Spoken update: ' + original.slice('播報內容：'.length) : message(original);
      if (next !== original) node.nodeValue = next;
    }
  }
  function localizeElement(el) {
    if (el.closest('script,style,.language-toggle,[data-no-i18n]')) return;
    for (const attr of attributes) {
      const current = el.getAttribute(attr);
      if (current === null) continue;
      let saved = sourceAttributes.get(el);
      if (!saved) { saved = {}; sourceAttributes.set(el, saved); }
      if (saved[attr] !== undefined && current === message(saved[attr])) continue;
      saved[attr] = current;
      const next = message(current);
      if (next !== current) el.setAttribute(attr, next);
    }
    for (const child of el.childNodes) {
      if (child.nodeType === 3) localizeText(child);
      else if (child.nodeType === 1) localizeElement(child);
    }
  }
  function refresh() {
    observer?.disconnect();
    localizeElement(document.documentElement);
    document.documentElement.lang = locales[locale].htmlLang;
    updateLanguageControl();
    observer?.observe(document.documentElement, {subtree:true, childList:true, characterData:true,
      attributes:true, attributeFilter:attributes});
  }
  function setLanguage(next) {
    if (!(next in locales)) return;
    if (next === locale) return;
    observer?.disconnect();
    locale = next;
    // Restore source strings, then render them using the newly selected locale.
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, source = sourceText.get(node);
      if (source !== undefined) node.nodeValue = source;
    }
    for (const el of document.querySelectorAll('*')) {
      const saved = sourceAttributes.get(el);
      if (saved) for (const [attr, source] of Object.entries(saved)) el.setAttribute(attr, source);
    }
    try { localStorage.setItem(storageKey, locale); } catch (_) {}
    refresh();
    window.dispatchEvent(new Event('aheadway:languagechange'));
  }
  function registerNames(items) {
    for (const [source, translated] of items) if (source && translated && source !== translated) names.set(source, source === '橘5' ? 'Orange 5' : translated);
    if (locale !== 'zh-TW') refresh();
  }
  observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'characterData') localizeText(record.target);
      else if (record.type === 'attributes') localizeElement(record.target);
      else for (const node of record.addedNodes) {
        if (node.nodeType === 3) localizeText(node);
        else if (node.nodeType === 1) localizeElement(node);
      }
    }
    observer.observe(document.documentElement, {subtree:true, childList:true, characterData:true,
      attributes:true, attributeFilter:attributes});
  });
  const languageToggle = document.querySelector('.language-toggle');
  function updateLanguageControl() {
    if (!languageToggle) return;
    languageToggle.setAttribute('aria-label', locale === 'en' ? 'Website language' : '網站語言');
    for (const option of languageToggle.querySelectorAll('[data-language]'))
      option.setAttribute('aria-pressed', String(option.dataset.language === locale));
  }
  languageToggle?.querySelectorAll('[data-language]').forEach(option => {
    option.addEventListener('click', () => setLanguage(option.dataset.language));
  });
  refresh();
  window.AheadWayI18n = {get language(){return locale;}, setLanguage, registerNames, message, locales};
})();
