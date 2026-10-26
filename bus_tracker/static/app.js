const directionEl = document.querySelector('#direction');
const stopEl = document.querySelector('#stop');
const messageEl = document.querySelector('#message');
const vehiclesEl = document.querySelector('#vehicles');
const voiceEl = document.querySelector('#voice');
const voiceTestEl = document.querySelector('#voice-test');
const voicePreviewEl = document.querySelector('#voice-preview');
const thresholdEl = document.querySelector('#threshold');
const customThresholdEl = document.querySelector('#custom-threshold');
const customThresholdWrapEl = document.querySelector('.custom-threshold-label');
const voiceModeEl = document.querySelector('#voice-mode');
const voiceFormatEl = document.querySelector('#voice-format');
const voiceLanguageEl = document.querySelector('#voice-language');
const briefingIntervalEl = document.querySelector('#briefing-interval');
const voiceStateEl = document.querySelector('#voice-state');
const voiceSettingsEl = document.querySelector('#voice-settings');
const voiceSettingsSummaryEl = document.querySelector('#voice-settings > summary');
const voiceModelEl = document.querySelector('#voice-model');
const apiModelEl = document.querySelector('#api-model');
const apiVoiceEl = document.querySelector('#api-voice');
const apiVoiceSettingsEl = document.querySelector('#api-voice-settings');
const walkMinutesEl = document.querySelector('#walk-minutes');
const leaveAdviceEl = document.querySelector('#leave-advice');
const locationStateEl = document.querySelector('#location-state');
const dataFreshnessEl = document.querySelector('#data-freshness');
const savedTripsEl = document.querySelector('#saved-trips');
const pushStateEl = document.querySelector('#push-state');
const scheduleTimeEl = document.querySelector('#schedule-time');
const scheduleDurationEl = document.querySelector('#schedule-duration');
const scheduleEnabledEl = document.querySelector('#schedule-enabled');
const scheduleStateEl = document.querySelector('#schedule-state');
const closedEl = document.querySelector('#closed-loop');
const routeColumnsEl = document.querySelector('#route-columns');
const mobileLegButtons = [...document.querySelectorAll('[data-mobile-leg]')];
const routePanelEl = document.querySelector('.route-panel');
const routeBodyEl = document.querySelector('#route-body');
const routeToggleEl = document.querySelector('#route-toggle');
const routeSearchEl = document.querySelector('#route-search');
const routeSearchStatusEl = document.querySelector('#route-search-status');
const mapDetailEl = document.querySelector('#map-detail');
const resultsStatusEl = document.querySelector('#results-status');
const routeMapEl = document.querySelector('#route-map');
const routeMapStatusEl = document.querySelector('#route-map-status');
const mapZoomInEl = document.querySelector('#map-zoom-in');
const mapZoomOutEl = document.querySelector('#map-zoom-out');
const mapZoomResetEl = document.querySelector('#map-zoom-reset');
const publicMode = window.BUS_TRACKER_PUBLIC === true;
const routes = {
  16405: {name: '橘5', spoken: '橘五', english: 'Orange Five', heads: ['往捷運景安站', '往板橋'], headsEn: ['toward Jingan MRT Station', 'toward Banqiao'], terminalDirection: 1},
  16585: {name: '908', spoken: '九零八', english: 'Route 908', heads: ['往捷運景安站', '往三峽'], headsEn: ['toward Jingan MRT Station', 'toward Sanxia'], terminalDirection: 0},
  16664: {name: '921', spoken: '九二一', english: 'Route 921', heads: ['往捷運景安站', '往三峽'], headsEn: ['toward Jingan MRT Station', 'toward Sanxia'], terminalDirection: 0}
};
let activeRoute = Number(localStorage.getItem('bus-tracker-route'));
if (!routes[activeRoute]) activeRoute = 16405;
const routeTabs = [...document.querySelectorAll('.route-tabs [role="tab"]')];
const routeStorage = suffix => `bus-tracker-${activeRoute}-${suffix}`;
closedEl.checked = (localStorage.getItem(routeStorage('closed-loop')) ??
  (activeRoute === 16405 ? localStorage.getItem('orange5-closed-loop') : null)) !== '0';
voiceModeEl.value = localStorage.getItem('orange5-voice-mode') === 'briefing' ? 'briefing' : 'alert';
voiceFormatEl.value = localStorage.getItem('orange5-voice-format') === 'verbose' ? 'verbose' : 'short';
const storedThreshold = Number(localStorage.getItem('orange5-alert-threshold'));
const initialThreshold = Number.isInteger(storedThreshold) && storedThreshold >= 1 && storedThreshold <= 60
  ? storedThreshold : 5;
thresholdEl.value = [1, 3, 5, 10].includes(initialThreshold) ? String(initialThreshold) : 'custom';
customThresholdEl.value = String(thresholdEl.value === 'custom' ? initialThreshold : 7);
customThresholdWrapEl.hidden = thresholdEl.value !== 'custom';
voiceLanguageEl.value = localStorage.getItem('orange5-voice-language') === 'en' ? 'en' : 'zh';
briefingIntervalEl.value = localStorage.getItem('orange5-briefing-interval') || '5';
walkMinutesEl.value = localStorage.getItem('orange5-walk-minutes') || '5';
apiModelEl.value = localStorage.getItem('orange5-api-model') || 'tts-1';
apiVoiceEl.value = localStorage.getItem('orange5-api-voice') || 'alloy';
let stops = [];
let voiceEnabled = false;
let latestSnapshot = null;
let activeUtterance = null;
let activeAudio = null;
let pendingAudio = false;
let audioUrl = null;
let playbackGeneration = 0;
let voiceError = null;
let lastAnnouncement = '';
let alertScope = '';
const announcedVehicles = new Map();
let lastBriefingAt = 0;
let lastBriefingKey = '';
let generation = 0;
let arrivalsControllers = [];
let arrivalsPending = false;
let routeGeneration = 0;
let savedSchedule = null;
let mobileRouteDirection = 0;
let lastA11yKey = '';
let locationWalkMinutes = null;
let locationStopKey = '';
let locationRequestKey = '';
let savedTrips = [];
try {
  const storedTrips = JSON.parse(localStorage.getItem('bus-tracker-saved-trips') || '[]');
  if (Array.isArray(storedTrips)) savedTrips = storedTrips.filter(trip => routes[trip.routeId]);
} catch (_) { /* Ignore damaged browser storage. */ }
let preferredVoiceModel = localStorage.getItem(`orange5-voice-model-${voiceLanguageEl.value}`) ||
  (voiceLanguageEl.value === 'zh' ? localStorage.getItem('orange5-voice-model') : null) || 'api';
if (preferredVoiceModel === 'local') preferredVoiceModel = 'espeak:cmn';
if (publicMode) {
  document.querySelector('.schedule-settings').hidden = true;
  apiModelEl.value = 'tts-1';
  apiVoiceEl.value = 'alloy';
  apiModelEl.readOnly = true;
  apiVoiceEl.readOnly = true;
  document.querySelector('#api-voice-settings small').textContent =
    '公共版使用本機 TTS 伺服器 tts-1 / alloy；也可選 eSpeak 或瀏覽器語音。';
}
document.querySelector('.push-card').hidden = !publicMode;
const pushToggleEl = document.querySelector('#push-toggle');
let pushRegistration = null;
let pushApplicationKey = null;
const pushEnabledKey = 'bus-tracker-push-enabled';
const pushEndpointKey = 'bus-tracker-push-endpoint';
const pushPendingRemoveKey = 'bus-tracker-push-pending-remove';
function pushNeedsRemoval() {
  return localStorage.getItem(pushEnabledKey) === '1' || localStorage.getItem(pushPendingRemoveKey) === '1';
}
if (publicMode) {
  if (!window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window) || !window.Notification) {
    pushToggleEl.disabled = !pushNeedsRemoval();
    if (!pushNeedsRemoval()) pushStateEl.textContent = '此裝置尚不支援背景通知。iPhone／iPad 請先將網站加入主畫面。';
  } else {
    Promise.all([request('api/push-key'), navigator.serviceWorker.register('sw.js')]).then(([data, registration]) => {
      if (!data.key) throw new Error('伺服器未啟用推播');
      const key = data.key;
      pushApplicationKey = Uint8Array.from(atob(key.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - key.length % 4) % 4)), c => c.charCodeAt(0));
      pushRegistration = registration;
      if (!pushNeedsRemoval() && pushStateEl.textContent !== '已關閉手機通知') pushStateEl.textContent = '尚未啟用';
    }).catch(error => {
      if (!pushNeedsRemoval() && pushStateEl.textContent !== '已關閉手機通知')
        pushStateEl.textContent = `通知服務無法載入：${error.message}`;
    });
  }
}
let pushSyncRevision = 0;
let pushSyncChain = Promise.resolve();
let pushSyncAbort = null;

function withPushTimeout(promise, milliseconds, message) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), milliseconds);
  })]).finally(() => clearTimeout(timer));
}

async function postPush(payload, controller = new AbortController()) {
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await request('api/push-subscription', {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload), signal: controller.signal});
  } finally { clearTimeout(timer); }
}

async function currentPushSubscription() {
  const registration = pushRegistration || await withPushTimeout(
    navigator.serviceWorker.getRegistration(), 5000, '無法讀取手機通知服務');
  if (!registration) return null;
  return withPushTimeout(registration.pushManager.getSubscription(), 5000, '無法讀取手機通知訂閱');
}

function currentStopKey() { return `${activeRoute}:${directionEl.value}:${stopEl.value}`; }
function currentWalkMinutes() {
  return Math.max(0, Math.min(60, Math.round((locationWalkMinutes ?? Number(walkMinutesEl.value)) || 0)));
}
function pushPayload(subscription) {
  return {action: 'save', subscription: subscription.toJSON(), route_id: activeRoute,
    direction: Number(directionEl.value), stop_id: Number(stopEl.value),
    closed_loop: closedEl.checked, walk_minutes: currentWalkMinutes()};
}
function syncPushSettings() {
  if (!publicMode || localStorage.getItem('bus-tracker-push-enabled') !== '1' || !stopEl.value) return;
  const revision = ++pushSyncRevision;
  pushSyncChain = withPushTimeout(pushSyncChain.catch(() => {}), 6000, '通知同步逾時')
    .catch(() => {}).then(async () => {
    if (revision !== pushSyncRevision) return;
    try {
    const subscription = await currentPushSubscription();
    if (revision !== pushSyncRevision) return;
    if (!subscription) {
      localStorage.removeItem(pushEnabledKey);
      pushStateEl.textContent = '通知訂閱已失效，請重新啟用。';
      pushToggleEl.textContent = '啟用手機通知';
      return;
    }
    localStorage.setItem(pushEndpointKey, subscription.endpoint);
    const controller = new AbortController();
    pushSyncAbort = controller;
    await postPush(pushPayload(subscription), controller);
    if (revision !== pushSyncRevision) return;
    pushStateEl.textContent = `已設定 ${routes[activeRoute].name} ${stopEl.selectedOptions?.[0]?.textContent || ''} · 步行 ${currentWalkMinutes()} 分鐘；關閉頁面仍可通知。`;
    pushToggleEl.textContent = '關閉手機通知';
    } catch (error) { if (revision === pushSyncRevision) pushStateEl.textContent = `通知設定未儲存：${error.message}`; }
    finally { if (revision === pushSyncRevision) pushSyncAbort = null; }
  });
  return pushSyncChain;
}

document.querySelector('#push-toggle').addEventListener('click', async () => {
  const button = document.querySelector('#push-toggle');
  if (!publicMode || (!pushNeedsRemoval() && !stopEl.value)) return;
  button.disabled = true;
  try {
    if (pushNeedsRemoval()) {
      ++pushSyncRevision;
      pushSyncAbort?.abort();
      pushSyncAbort = null;
      localStorage.removeItem(pushEnabledKey);
      localStorage.setItem(pushPendingRemoveKey, '1');
      pushStateEl.textContent = '正在關閉手機通知…';
      const endpoint = localStorage.getItem(pushEndpointKey);
      const subscription = endpoint ? null : await currentPushSubscription();
      const removeEndpoint = endpoint || subscription?.endpoint;
      if (removeEndpoint) {
        await postPush({action: 'remove', subscription: {endpoint: removeEndpoint}});
      }
      localStorage.removeItem(pushPendingRemoveKey);
      localStorage.removeItem(pushEndpointKey);
      button.textContent = '啟用手機通知';
      pushStateEl.textContent = '已關閉手機通知';
      const finishLocal = localSubscription => {
        if (localSubscription) withPushTimeout(localSubscription.unsubscribe(), 3000, '手機取消訂閱逾時').catch(() => {});
      };
      if (subscription) finishLocal(subscription);
      else currentPushSubscription().then(finishLocal).catch(() => {});
      return;
    }
    if (!pushRegistration || !pushApplicationKey) throw new Error('通知服務尚未準備好');
    // Begin subscription in the click's user gesture, as required by iOS web apps.
    const subscriptionPromise = pushRegistration.pushManager.subscribe({userVisibleOnly: true,
      applicationServerKey: pushApplicationKey});
    const subscription = await subscriptionPromise;
    await postPush(pushPayload(subscription));
    localStorage.setItem(pushEndpointKey, subscription.endpoint);
    localStorage.setItem(pushEnabledKey, '1');
    button.textContent = '關閉手機通知';
    pushStateEl.textContent = `已設定 ${routes[activeRoute].name} ${stopEl.selectedOptions?.[0]?.textContent || ''} · 步行 ${currentWalkMinutes()} 分鐘。`;
  } catch (error) {
    if (localStorage.getItem(pushPendingRemoveKey) === '1') {
      button.textContent = '重試關閉手機通知';
      pushStateEl.textContent = `關閉未完成，請重試：${error.message}`;
    } else pushStateEl.textContent = `無法啟用通知：${error.message}`;
  }
  finally { button.disabled = false; }
});

function resetAlertState() {
  lastAnnouncement = '';
  alertScope = '';
  announcedVehicles.clear();
}
const espeakStyles = [['', '標準'], ['+f1', '女聲 1'], ['+f2', '女聲 2'],
  ['+f3', '女聲 3'], ['+m1', '男聲 1'], ['+m2', '男聲 2'],
  ['+m3', '男聲 3'], ['+whisper', '耳語']];

function fallbackEspeakVoice() { return voiceLanguageEl.value === 'en' ? 'en' : 'cmn'; }

function alertThresholdMinutes() {
  const raw = Number(thresholdEl.value === 'custom' ? customThresholdEl.value : thresholdEl.value);
  return Number.isFinite(raw) && raw >= 1 ? Math.max(1, Math.min(60, Math.round(raw))) : 5;
}

function selectedVoice() {
  const key = voiceModelEl.value;
  return key.startsWith('browser:')
    ? speechSynthesis.getVoices().find(v => `browser:${encodeURIComponent(v.voiceURI || v.name)}` === key)
    : null;
}

function populateVoices() {
  const language = voiceLanguageEl.value;
  const prefix = language === 'en' ? 'en' : 'cmn';
  const choices = [['api', '本機 TTS 伺服器'], ['auto', '瀏覽器自動選擇'],
    ...espeakStyles.map(([suffix, label]) => [`espeak:${prefix}${suffix}`, `eSpeak · ${language === 'en' ? 'English' : '中文'} ${label}`])];
  const voices = 'speechSynthesis' in window ? speechSynthesis.getVoices() : [];
  for (const voice of voices.filter(v => language === 'en' ? /^en/i.test(v.lang) : /^(zh|cmn)/i.test(v.lang))) {
    choices.push([`browser:${encodeURIComponent(voice.voiceURI || voice.name)}`, `${voice.name} · ${voice.lang}`]);
  }
  voiceModelEl.replaceChildren(...choices.map(([value, label]) => {
    const option = document.createElement('option'); option.value = value; option.textContent = label; return option;
  }));
  voiceModelEl.value = choices.some(([value]) => value === preferredVoiceModel) ? preferredVoiceModel : 'api';
  apiVoiceSettingsEl.hidden = voiceModelEl.value !== 'api';
  syncVoiceMode();
}

async function request(url, options = {}) {
  const response = await fetch(url, {cache: 'no-store', ...options});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '資料無法取得');
  return data;
}

function selectRouteStop(direction, id) {
  if (!stops.some(s => s.direction === direction && s.id === id && s.selectable !== false)) return;
  directionEl.value = String(direction);
  setStops(false);
  stopEl.value = String(id);
  resetAlertState();
  lastBriefingAt = 0;
  renderRoute();
  update({selected: true, fresh: true});
}

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}

const mapBounds = {width: 800, height: 390};
let mapView = {x: 0, y: 0, width: mapBounds.width, height: mapBounds.height};
let mapPanStart = null;

function applyMapView() {
  const width = Math.max(mapBounds.width / 5, Math.min(mapBounds.width, mapView.width));
  const height = width * mapBounds.height / mapBounds.width;
  mapView = {
    x: Math.max(0, Math.min(mapBounds.width - width, mapView.x)),
    y: Math.max(0, Math.min(mapBounds.height - height, mapView.y)),
    width, height
  };
  routeMapEl.setAttribute('viewBox', `${mapView.x} ${mapView.y} ${width} ${height}`);
  mapZoomInEl.disabled = width <= mapBounds.width / 5 + .01;
  mapZoomOutEl.disabled = width >= mapBounds.width - .01;
}

function zoomMap(factor, centerX = 400, centerY = 195) {
  if (!stops.length) return;
  const scale = Math.max(.2, Math.min(1, mapView.width / mapBounds.width * factor));
  const width = mapBounds.width * scale;
  const height = mapBounds.height * scale;
  const xRatio = (centerX - mapView.x) / mapView.width;
  const yRatio = (centerY - mapView.y) / mapView.height;
  mapView = {x: centerX - xRatio * width, y: centerY - yRatio * height, width, height};
  applyMapView();
}

function mapEventPoint(event) {
  const rect = routeMapEl.getBoundingClientRect();
  return {x: mapView.x + (event.clientX - rect.left) / rect.width * mapView.width,
    y: mapView.y + (event.clientY - rect.top) / rect.height * mapView.height};
}

mapZoomInEl.addEventListener('click', () => zoomMap(1 / 1.6, mapView.x + mapView.width / 2, mapView.y + mapView.height / 2));
mapZoomOutEl.addEventListener('click', () => zoomMap(1.6, mapView.x + mapView.width / 2, mapView.y + mapView.height / 2));
mapZoomResetEl.addEventListener('click', () => {
  mapView = {x: 0, y: 0, width: mapBounds.width, height: mapBounds.height};
  applyMapView();
});
routeMapEl.addEventListener('wheel', event => {
  if (!stops.length) return;
  event.preventDefault();
  const center = mapEventPoint(event);
  zoomMap(event.deltaY < 0 ? 1 / 1.25 : 1.25, center.x, center.y);
}, {passive: false});
routeMapEl.addEventListener('pointerdown', event => {
  if (!stops.length || event.target.closest?.('.map-stop')) return;
  mapPanStart = {pointerId: event.pointerId, x: event.clientX, y: event.clientY,
    viewX: mapView.x, viewY: mapView.y};
  routeMapEl.setPointerCapture?.(event.pointerId);
  routeMapEl.classList.add('panning');
});
routeMapEl.addEventListener('pointermove', event => {
  if (!mapPanStart || event.pointerId !== mapPanStart.pointerId) return;
  const rect = routeMapEl.getBoundingClientRect();
  mapView.x = mapPanStart.viewX - (event.clientX - mapPanStart.x) / rect.width * mapView.width;
  mapView.y = mapPanStart.viewY - (event.clientY - mapPanStart.y) / rect.height * mapView.height;
  applyMapView();
});
function endMapPan(event) {
  if (mapPanStart?.pointerId !== event.pointerId) return;
  mapPanStart = null;
  routeMapEl.classList.remove('panning');
}
routeMapEl.addEventListener('pointerup', endMapPan);
routeMapEl.addEventListener('pointercancel', endMapPan);

function renderRouteMap(snapshot) {
  routeMapEl.replaceChildren();
  const all = stops.filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lon));
  const mapWrap = routeMapEl.parentElement;
  if (all.length !== stops.length || !all.length) {
    mapWrap.classList.add('unavailable');
    routeMapStatusEl.textContent = '站牌座標未載入；請重新啟動伺服器。下方路線與動態仍可使用。';
    return;
  }
  mapWrap.classList.remove('unavailable');
  routeMapStatusEl.textContent = '點站牌追蹤 · 拖曳、滾輪或按鈕縮放';
  const cos = Math.cos(all.reduce((sum, s) => sum + s.lat, 0) / all.length * Math.PI / 180);
  const xs = all.map(s => s.lon * cos), ys = all.map(s => s.lat);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min(700 / Math.max(maxX - minX, .0001), 300 / Math.max(maxY - minY, .0001));
  const xMid = (minX + maxX) / 2, yMid = (minY + maxY) / 2;
  const point = s => ({x: 400 + (s.lon * cos - xMid) * scale, y: 195 - (s.lat - yMid) * scale});
  const background = svgElement('rect', {x: 0, y: 0, width: 800, height: 390, fill: '#f8faf7'});
  routeMapEl.append(background);
  const legs = [stops.filter(s => s.direction === 0), stops.filter(s => s.direction === 1)];
  legs.forEach((leg, direction) => {
    const coords = leg.map(point);
    const line = svgElement('polyline', {
      points: coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
      fill: 'none', stroke: direction === 0 ? '#ed754d' : '#3a9873',
      'stroke-width': direction === 0 ? 4 : 3, 'stroke-opacity': direction === 0 ? .9 : .72,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    routeMapEl.append(line);
    leg.forEach(station => {
      const p = point(station);
      const terminal = station.name === '捷運景安站(景平路)';
      const dot = svgElement('circle', {
        class: 'map-stop',
        cx: p.x, cy: p.y, r: terminal && closedEl.checked ? 6 : 3,
        fill: '#fff',
        stroke: direction === 0 ? '#ed754d' : '#3a9873',
        'stroke-width': 2,
        style: station.selectable === false ? 'cursor:default;opacity:.4' : 'cursor:pointer'
      });
      const title = svgElement('title'); title.textContent = `${direction === 0 ? '去程' : '返程'}：${station.name}`;
      dot.append(title);
      if (station.selectable !== false) dot.addEventListener('click', () => selectRouteStop(direction, station.id));
      routeMapEl.append(dot);
    });
  });
  const labels = [
    [legs[0][0], legs[0][0]?.name, -4, -13],
    [legs[0][legs[0].length - 1], '景安站 ↪', 12, -13],
    [legs[1][legs[1].length - 1], legs[1][legs[1].length - 1]?.name, 10, 20]
  ];
  for (const [station, text, dx, dy] of labels) {
    if (!station) continue;
    const p = point(station);
    const label = svgElement('text', {x: p.x + dx, y: p.y + dy, fill: '#34493e',
      'font-size': 13, 'font-weight': 700, 'paint-order': 'stroke', stroke: '#f8faf7', 'stroke-width': 4});
    label.textContent = text; routeMapEl.append(label);
  }
  if (snapshot && snapshot.routeVehicles) {
    const grouped = new Map();
    for (const bus of snapshot.routeVehicles) {
      const key = `${bus.direction}:${bus.stopId}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(bus);
    }
    for (const [key, buses] of grouped) {
      const [direction, stopId] = key.split(':').map(Number);
      const station = legs[direction] && legs[direction].find(s => s.id === stopId);
      if (!station) continue;
      const p = point(station);
      const x = p.x + (direction === 0 ? -15 : 15);
      const y = p.y + (direction === 0 ? -15 : 15);
      const marker = svgElement('g', {class: 'map-bus-marker', role: 'img',
        'aria-label': `${direction === 0 ? '去程' : '返程'}${station.name}：${buses.length} 輛公車，${buses.map(b => b.id).join('、')}`});
      marker.append(svgElement('circle', {cx: x, cy: y, r: 15,
        fill: direction === 0 ? '#ed754d' : '#3a9873', stroke: '#fff', 'stroke-width': 3}));
      const label = svgElement('text', {x, y: y + 4.5, 'text-anchor': 'middle', fill: '#173d32',
        'font-size': 14, 'font-weight': 900});
      label.textContent = String(buses.length);
      marker.append(label);
      const title = svgElement('title'); title.textContent = buses.map(b => `${b.id} · ${b.atStop ? '進站中' : '已離站'}`).join('、');
      marker.append(title);
      routeMapEl.append(marker);
    }
  }
  const selected = stops.find(s => s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value));
  if (selected) {
    const p = point(selected);
    const text = svgElement('text', {x: 0, y: 0, fill: '#254681',
      'font-size': 12, 'font-weight': 800});
    text.textContent = selected.name;
    routeMapEl.append(text);
    let textWidth = text.getComputedTextLength?.() || 0;
    if (!textWidth) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext?.('2d');
      if (context) {
        context.font = '800 12px "Noto Sans TC", system-ui, sans-serif';
        textWidth = context.measureText(selected.name).width;
      } else textWidth = [...selected.name].reduce((sum, char) => sum + (/[^\x00-\x7f]/.test(char) ? 12 : 7), 0);
    }
    const width = Math.min(784, Math.ceil(textWidth) + 20);
    const left = Math.max(8, Math.min(792 - width, p.x - width / 2));
    const top = p.y > 75 ? p.y - 45 : p.y + 18;
    const anchorX = Math.max(left + 12, Math.min(left + width - 12, p.x));
    const edgeY = p.y > 75 ? top + 29 : top;
    const pointer = svgElement('g', {class: 'selected-stop-pointer', role: 'img',
      'aria-label': `目前選擇站牌：${selected.name}`});
    pointer.append(svgElement('line', {x1: anchorX, y1: edgeY, x2: p.x, y2: p.y,
      stroke: '#3158a2', 'stroke-width': 2}));
    pointer.append(svgElement('circle', {cx: p.x, cy: p.y, r: 5, fill: '#fff',
      stroke: '#3158a2', 'stroke-width': 2.5}));
    pointer.append(svgElement('rect', {x: left, y: top, width, height: 29, rx: 7,
      fill: '#fff', stroke: '#3158a2', 'stroke-width': 1.5}));
    text.setAttribute('x', left + 10);
    text.setAttribute('y', top + 19);
    pointer.append(text);
    routeMapEl.append(pointer);
  }
  applyMapView();
}

function matchingRouteStops(direction, query = '') {
  const text = query.trim().toLocaleLowerCase();
  return stops.filter(s => s.direction === direction &&
    (!text || `${s.name} ${s.nameEn || ''}`.toLocaleLowerCase().includes(text)));
}

function renderRoute(snapshot = null, loading = false) {
  if (!stops.length) return;
  const query = routeSearchEl.value.trim().toLocaleLowerCase();
  let matchCount = 0;
  routeColumnsEl.dataset.mobileDirection = String(mobileRouteDirection);
  const previousScroll = [...routeColumnsEl.querySelectorAll('.route-scroll')].map(el => el.scrollTop);
  routeColumnsEl.replaceChildren();
  routePanelEl.classList.toggle('closed', closedEl.checked);
  const connection = document.querySelector('#loop-explanation');
  connection.classList.toggle('separate', !closedEl.checked);
  const selectedName = stopEl.selectedOptions?.[0]?.textContent?.trim() || '所選站牌';
  const otherLeg = Number(directionEl.value) === 0 ? '返程' : '去程';
  connection.textContent = closedEl.checked
    ? `↪ ${otherLeg}公車若在端點折返續行，也可能在下一輪抵達${selectedName}；這些時間較不確定。`
    : `⇢ 目前只列出本方向往${selectedName}行駛的公車。`;
  const statuses = new Map((snapshot?.routeStatuses || []).map(s => [`${s.direction}:${s.id}`, s]));
  const routeBuses = new Map();
  for (const bus of snapshot?.routeVehicles || []) {
    const key = `${bus.direction}:${bus.stopId}`;
    if (!routeBuses.has(key)) routeBuses.set(key, []);
    routeBuses.get(key).push(bus);
    if (closedEl.checked && bus.atStop && stops.some(s =>
      s.direction === 1 - bus.direction && s.id === bus.stopId)) {
      const otherKey = `${1 - bus.direction}:${bus.stopId}`;
      if (!routeBuses.has(otherKey)) routeBuses.set(otherKey, []);
      routeBuses.get(otherKey).push(bus);
    }
  }
  for (const direction of [0, 1]) {
    const allLeg = matchingRouteStops(direction);
    const leg = matchingRouteStops(direction, query);
    matchCount += leg.length;
    const column = document.createElement('div'); column.className = 'route-column';
    column.dataset.direction = String(direction);
    const heading = document.createElement('div'); heading.className = 'route-column-head';
    const name = document.createElement('span'); name.textContent = `${direction === 0 ? '去程' : '返程'} · ${routes[activeRoute].heads[direction]} ↓`;
    const total = document.createElement('span'); total.textContent = query ? `${leg.length}/${allLeg.length} 站` : `${leg.length} 站`;
    heading.append(name, total);
    const scroll = document.createElement('div'); scroll.className = 'route-scroll';
    if (query && !leg.length) {
      const empty = document.createElement('p'); empty.className = 'route-search-empty';
      empty.textContent = '此方向沒有符合的站牌'; scroll.append(empty);
    }
    for (const station of leg) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'route-stop';
      if (station.selectable === false) { button.disabled = true; button.title = '此站不提供上車'; }
      if (Number(directionEl.value) === direction && String(stopEl.value) === String(station.id)) {
        button.classList.add('active'); button.setAttribute('aria-current', 'location');
      }
      const node = document.createElement('span'); node.className = 'route-node'; node.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.className = 'route-stop-name'; label.textContent = station.name;
      const main = document.createElement('span'); main.className = 'route-stop-main'; main.append(label);
      const key = `${direction}:${station.id}`;
      const buses = routeBuses.get(key) || [];
      if (buses.length) {
        const busLine = document.createElement('span'); busLine.className = 'route-buses';
        for (const bus of buses) {
          const marker = document.createElement('span'); marker.className = 'route-bus-marker';
          marker.textContent = `🚌 ${bus.id} ${bus.atStop ? '進站' : '離站'}`;
          busLine.append(marker);
        }
        main.append(busLine);
      }
      const statusData = statuses.get(key);
      const status = document.createElement('span'); status.className = 'route-status';
      status.textContent = loading ? '更新中…' : statusData?.label || '資料暫缺';
      if (statusData && statusData.seconds !== null && statusData.seconds >= 0 && statusData.seconds < 180) status.classList.add('soon');
      if (!statusData || statusData.seconds === null || statusData.seconds < 0) status.classList.add('waiting');
      button.append(node, main, status);
      if (station.selectable !== false) button.addEventListener('click', () => selectRouteStop(direction, station.id));
      scroll.append(button);
    }
    column.append(heading, scroll);
    routeColumnsEl.append(column);
    scroll.scrollTop = previousScroll[direction] || 0;
    mobileLegButtons[direction].textContent = `${direction === 0 ? '去程' : '返程'} · ${leg.length} 站`;
    mobileLegButtons[direction].setAttribute('aria-pressed', String(direction === mobileRouteDirection));
  }
  routeSearchStatusEl.textContent = query ? `找到 ${matchCount} 個站牌` : '';
  renderRouteMap(snapshot);
}

function setStops(shouldUpdate = true) {
  const direction = Number(directionEl.value);
  mobileRouteDirection = direction;
  const available = stops.filter(s => s.direction === direction && s.selectable !== false);
  const previous = localStorage.getItem(routeStorage('stop-' + direction)) ??
    (activeRoute === 16405 ? localStorage.getItem('orange5-stop-' + direction) : null);
  stopEl.replaceChildren(...available.map(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.name;
    return option;
  }));
  if (available.some(s => String(s.id) === previous)) stopEl.value = previous;
  resetAlertState();
  lastBriefingAt = 0;
  renderRoute();
  if (shouldUpdate) update({selected: true, fresh: true});
}

function showRoute() {
  const route = routes[activeRoute];
  routeTabs.forEach(tab => {
    const selected = Number(tab.dataset.route) === activeRoute;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.title = `${route.name} · 公車追蹤`;
  document.querySelector('.route-badge').textContent = route.name;
  document.querySelector('#hero-route-id').textContent = `NEW TAIPEI · ROUTE ${activeRoute}`;
  document.querySelector('#route-heading').textContent = `${route.name} 路線`;
  document.querySelector('#route-map').setAttribute('aria-label', `${route.name}去程與返程站點位置示意圖`);
  const link = document.querySelector('#official-route-link');
  link.href = `https://pda5284.gov.taipei/MQS/route.jsp?rid=${activeRoute}`;
  link.textContent = `原始${route.name}路線`;
  directionEl.options[0].textContent = route.heads[0];
  directionEl.options[1].textContent = route.heads[1];
}

function renderSavedTrips() {
  savedTripsEl.replaceChildren();
  for (const trip of savedTrips) {
    const group = document.createElement('span'); group.className = 'saved-trip';
    const open = document.createElement('button'); open.type = 'button';
    open.textContent = `${routes[trip.routeId]?.name || trip.routeId} · ${trip.stopName}`;
    open.title = `${trip.direction === 0 ? '去程' : '返程'}，${trip.stopName}`;
    open.addEventListener('click', () => {
      if (activeRoute === trip.routeId && stops.length) {
        closedEl.checked = trip.closedLoop;
        localStorage.setItem(routeStorage('closed-loop'), trip.closedLoop ? '1' : '0');
        selectRouteStop(trip.direction, trip.stopId);
      } else switchRoute(trip.routeId, trip);
    });
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-trip';
    remove.setAttribute('aria-label', `移除 ${routes[trip.routeId]?.name || trip.routeId} ${trip.stopName}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      savedTrips = savedTrips.filter(item => !(item.routeId === trip.routeId && item.direction === trip.direction && item.stopId === trip.stopId));
      localStorage.setItem('bus-tracker-saved-trips', JSON.stringify(savedTrips));
      renderSavedTrips();
    });
    group.append(open, remove); savedTripsEl.append(group);
  }
  document.querySelector('.trip-bar').hidden = !savedTrips.length;
}

document.querySelector('#save-trip').addEventListener('click', () => {
  const station = stops.find(s => s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value));
  if (!station) return;
  savedTrips = savedTrips.filter(item => !(item.routeId === activeRoute && item.direction === station.direction && item.stopId === station.id));
  savedTrips.unshift({routeId: activeRoute, direction: station.direction, stopId: station.id,
    stopName: station.name, closedLoop: closedEl.checked});
  savedTrips = savedTrips.slice(0, 8);
  localStorage.setItem('bus-tracker-saved-trips', JSON.stringify(savedTrips));
  renderSavedTrips();
});
renderSavedTrips();

async function switchRoute(routeId, trip = null) {
  if (!routes[routeId]) return;
  const current = ++routeGeneration;
  ++generation;
  for (const controller of arrivalsControllers) controller.abort();
  arrivalsControllers = [];
  arrivalsPending = false;
  if (activeAudio || pendingAudio || activeUtterance) {
    ++playbackGeneration;
    stopAudio();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    activeUtterance = null;
  }
  activeRoute = routeId;
  localStorage.setItem('bus-tracker-route', String(routeId));
  closedEl.checked = (localStorage.getItem(routeStorage('closed-loop')) ??
    (routeId === 16405 ? localStorage.getItem('orange5-closed-loop') : null)) !== '0';
  if (trip) closedEl.checked = trip.closedLoop;
  directionEl.value = String(trip?.direction ?? localStorage.getItem(routeStorage('direction')) ?? '0');
  stops = [];
  latestSnapshot = null;
  voiceEl.disabled = true;
  stopEl.replaceChildren();
  vehiclesEl.replaceChildren();
  document.querySelector('#eta-card').hidden = true;
  document.querySelector('#vehicle-summary').textContent = '';
  document.querySelector('#vehicle-count').textContent = '—';
  document.querySelector('.approach-board').classList.add('is-empty');
  document.querySelector('#stop-title').textContent = '選擇站牌';
  document.querySelector('#updated').textContent = '—';
  dataFreshnessEl.textContent = '正在讀取資料時間…';
  leaveAdviceEl.textContent = '載入到站預估後顯示';
  routeColumnsEl.textContent = '正在載入路線…';
  routeSearchEl.value = '';
  routeSearchStatusEl.textContent = '';
  routeMapEl.replaceChildren();
  mapView = {x: 0, y: 0, width: mapBounds.width, height: mapBounds.height};
  applyMapView();
  messageEl.hidden = false;
  messageEl.textContent = `正在取得${routes[routeId].name}公車資訊…`;
  resetAlertState();
  lastBriefingAt = 0;
  lastBriefingKey = '';
  showRoute();
  try {
    const data = await request(`api/stops?route_id=${routeId}`);
    if (current !== routeGeneration) return;
    stops = data;
    if (trip) localStorage.setItem(routeStorage('stop-' + trip.direction), String(trip.stopId));
    setStops();
    if (savedSchedule) scheduleStatus();
  } catch (error) {
    if (current === routeGeneration) showError(error.message);
  }
}

function showError(text) {
  messageEl.hidden = false;
  messageEl.classList.add('error');
  messageEl.textContent = text;
  resultsStatusEl.textContent = text;
  dataFreshnessEl.textContent = '資料暫不可用';
  document.querySelector('#eta-card').hidden = true;
  document.querySelector('#vehicle-count').textContent = '—';
  document.querySelector('#vehicle-summary').textContent = '沿線車輛資料暫不可用。';
  document.querySelector('.approach-board').classList.add('is-empty');
  leaveAdviceEl.textContent = '資料暫不可用，無法建議出發時間。';
  vehiclesEl.replaceChildren();
  renderRoute();
}

function voiceErrorMessage(code) {
  if (code === 'not-allowed') return '瀏覽器禁止播放。請按「試播目前資訊」，並檢查網站音效權限。';
  if (code === 'language-unavailable' || code === 'voice-unavailable') return '找不到可用的中文語音。請啟用系統中文語音後再試播。';
  if (code === 'audio-blocked') return '瀏覽器封鎖音訊播放。請按「試播目前資訊」，並允許此網站播放音效。';
  if (code === 'api-unavailable') return '本機 TTS 伺服器無法產生語音。請檢查 localhost:8001、模型與聲音名稱。';
  if (code === 'rate-limit') return '語音服務忙碌，請稍後重試。';
  if (code === 'audio-unavailable') return '本機語音檔無法產生。請確認伺服器已重新啟動，且系統已安裝 libespeak-ng。';
  return `語音播放失敗（${code || '未知原因'}）。請按「試播目前資訊」重試。`;
}

function stopAudio() {
  pendingAudio = false;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute('src');
    activeAudio.load();
    activeAudio = null;
  }
  if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl = null; }
}

function playbackError(code) {
  lastBriefingAt = 0;
  resetAlertState();
  voiceError = code;
  voiceStateEl.className = 'voice-state error';
  voiceStateEl.textContent = voiceErrorMessage(code);
}

async function playLocalAudio(text, generation, config, fallback = false) {
  pendingAudio = true;
  voiceStateEl.className = 'voice-state';
  voiceStateEl.textContent = fallback ? '瀏覽器語音失敗，正在準備本機語音…'
    : config.engine === 'api' ? '正在向本機 TTS 伺服器取得語音…' : '正在準備 eSpeak 語音…';
  try {
    const response = await fetch('api/voice', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text, ...config}), cache: 'no-store'
    });
    if (response.status === 429) throw new Error('rate-limit');
    if (!response.ok) throw new Error(config.engine === 'api' ? 'api-unavailable' : 'audio-unavailable');
    const blob = await response.blob();
    if (generation !== playbackGeneration) return;
    pendingAudio = false;
    audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    activeAudio = audio;
    audio.onplaying = () => {
      if (generation === playbackGeneration) {
        voiceStateEl.className = 'voice-state speaking';
        voiceStateEl.textContent = config.engine === 'api'
          ? `正在朗讀 · ${config.model} / ${config.voice}` : `正在朗讀 · eSpeak ${config.voice}`;
      }
    };
    audio.onended = () => {
      if (generation === playbackGeneration) {
        voiceStateEl.className = 'voice-state';
        voiceStateEl.textContent = '語音播放完成';
        stopAudio();
      }
    };
    audio.onerror = () => {
      if (generation === playbackGeneration) { stopAudio(); playbackError('audio-unavailable'); }
    };
    await audio.play();
  } catch (error) {
    if (generation !== playbackGeneration) return;
    stopAudio();
    playbackError(error?.name === 'NotAllowedError' ? 'audio-blocked'
      : error?.message === 'rate-limit' ? 'rate-limit'
        : error?.message === 'api-unavailable' ? 'api-unavailable' : 'audio-unavailable');
  }
}

function speak(text) {
  voiceError = null;
  const currentGeneration = ++playbackGeneration;
  const fallbackVoice = fallbackEspeakVoice();
  stopAudio();
  if (voiceModelEl.value === 'api' || voiceModelEl.value.startsWith('espeak:') ||
      !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    activeUtterance = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    voicePreviewEl.textContent = `播報內容：${text}`;
    const config = voiceModelEl.value === 'api'
      ? {engine: 'api', model: apiModelEl.value.trim() || 'tts-1', voice: apiVoiceEl.value.trim() || 'alloy'}
      : {engine: 'espeak', voice: voiceModelEl.value.startsWith('espeak:') ? voiceModelEl.value.slice(7) : fallbackVoice};
    playLocalAudio(text, currentGeneration, config);
    return true;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const english = voiceLanguageEl.value === 'en';
  const chosenVoice = selectedVoice() || (english
    ? voices.find(v => /^en[-_]?us/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang))
    : voices.find(v => /^zh[-_]?tw/i.test(v.lang)) || voices.find(v => /^(zh|cmn)/i.test(v.lang)));
  if (chosenVoice) utterance.voice = chosenVoice;
  utterance.lang = chosenVoice?.lang || (english ? 'en-US' : 'zh-TW');
  utterance.rate = .95;
  utterance.volume = 1;
  utterance.onstart = () => {
    if (activeUtterance === utterance) {
      voiceStateEl.className = 'voice-state speaking';
      voiceStateEl.textContent = `正在朗讀 · ${chosenVoice?.name || '系統語音'}`;
    }
  };
  utterance.onend = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
      voiceStateEl.className = 'voice-state';
      voiceStateEl.textContent = '語音播放完成';
    }
  };
  utterance.onerror = event => {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    if (event.error === 'synthesis-failed') {
      playLocalAudio(text, currentGeneration, {engine: 'espeak', voice: fallbackVoice}, true);
      return;
    }
    lastBriefingAt = 0;
    resetAlertState();
    voiceError = event.error || 'unknown';
    voiceStateEl.className = 'voice-state error';
    voiceStateEl.textContent = voiceErrorMessage(voiceError);
    if (['not-allowed', 'language-unavailable', 'voice-unavailable'].includes(voiceError)) {
      voiceEnabled = false;
      voiceEl.setAttribute('aria-pressed', 'false');
      voiceEl.textContent = '啟用語音';
    }
  };
  activeUtterance = utterance;
  voicePreviewEl.textContent = `播報內容：${text}`;
  voiceStateEl.className = 'voice-state';
  voiceStateEl.textContent = '正在準備語音…';
  try {
    speechSynthesis.cancel();
    if (speechSynthesis.paused) speechSynthesis.resume();
    speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    activeUtterance = null;
    playLocalAudio(text, currentGeneration, {engine: 'espeak', voice: fallbackVoice}, true);
    return true;
  }
}

function englishStopName(name) {
  return (name || 'unknown stop').replace(/\bSta\./g, 'Station')
    .replace(/\bRd\./g, 'Road').replace(/\bSt\./g, 'Street')
    .replace(/(\S)\(/g, '$1 (');
}

function englishStatus(status) {
  return ({'未發車': 'The next bus has not departed', '末班已過': 'The last bus has passed',
    '今日未營運': 'This route is not operating today', '交管不停': 'Buses are skipping this stop',
    '資料暫缺': 'The official arrival status is unavailable'})[status] || 'The official arrival status is unavailable';
}

function briefingText(snapshot) {
  const eta = snapshot.officialEtaSeconds;
  const direct = snapshot.vehicles.filter(bus => !bus.crossDirection || bus.atStop);
  const nextCircuit = snapshot.vehicles.filter(bus => bus.crossDirection && !bus.atStop);
  const statusConflict = snapshot.officialStatus === '今日未營運' && direct.length > 0;
  const short = voiceFormatEl.value !== 'verbose';
  if (voiceLanguageEl.value === 'en') {
    const direction = snapshot.directionLabelEn || routes[activeRoute].headsEn[snapshot.direction];
    const stop = englishStopName(snapshot.stop.nameEn || snapshot.stop.name);
    const official = eta !== null
      ? (eta < 60 ? 'The official next bus is arriving now'
        : `The official next bus is expected in ${Math.ceil(eta / 60)} minutes`)
      : statusConflict ? (short ? 'The official status and bus positions disagree'
        : 'The official feed says the route is not operating today, but live bus data is present; the sources disagree')
        : englishStatus(snapshot.officialStatus);
    const sections = [];
    if (direct.length) sections.push(short
      ? `Buses for this stop: ${direct.map((bus, index) =>
          `bus ${index + 1}, ${bus.atStop ? 'at the stop' : englishEtaRange(bus)}`).join('; ')}`
      : `${direct.length} bus${direct.length === 1 ? '' : 'es'} can be confirmed approaching this stop. ` +
        direct.map((bus, index) => `Bus ${index + 1}, ${bus.id}, is ${bus.atStop ? 'at this stop' :
          `estimated to arrive in ${englishEtaRange(bus)}, about ${bus.stopsAway} stops away`}. ` +
          `Its next stop is ${englishStopName(bus.nextStopEn || bus.nextStop)}`).join('. '));
    if (nextCircuit.length) sections.push(
      'If buses on the other direction continue service after the terminal, next-circuit estimates: ' +
      nextCircuit.map((bus, index) => short
        ? `bus ${index + 1}, ${englishEtaRange(bus)}`
        : `bus ${index + 1}, ${bus.id}, ${englishEtaRange(bus)}, next stop ${englishStopName(bus.nextStopEn || bus.nextStop)}`
      ).join('; '));
    if (!sections.length) sections.push('No approaching buses can currently be confirmed');
    return `${snapshot.routeNameEn || routes[activeRoute].english}, ${direction}, ${stop}. ${short && (direct.length || nextCircuit.length) ? '' : `${official}. `}${sections.join('. ')}.`;
  }
  const official = eta !== null
    ? (eta < 60 ? '官方預估下一班進站中' : `官方預估下一班約 ${Math.ceil(eta / 60)} 分鐘後抵達`)
    : statusConflict ? (short ? '官方狀態與沿線車輛資料不一致'
      : '官方資料顯示今日未營運，但沿線有公車動態；兩筆資料不一致')
      : `官方狀態是${snapshot.officialStatus || '資料暫缺'}`;
  const sections = [];
  if (direct.length) sections.push(short
    ? `本方向：${direct.map((bus, index) =>
        `第${index + 1}輛${bus.atStop ? '已到站' : `推估${etaRangeLabel(bus)}`}`).join('，')}`
    : `本方向可追蹤${direct.length}輛公車。` + direct.map((bus, index) =>
        `第${index + 1}輛${bus.id}${bus.atStop ? '在本站' :
          `推估${etaRangeLabel(bus)}抵達，約在${bus.stopsAway}站前`}，下一站${bus.nextStop || '不明'}`).join('。'));
  if (nextCircuit.length) sections.push(
    '另一方向公車若在終點折返續行，下一輪推估：' + nextCircuit.map((bus, index) => short
      ? `第${index + 1}輛${etaRangeLabel(bus)}`
      : `第${index + 1}輛${bus.id}${etaRangeLabel(bus)}抵達，下一站${bus.nextStop || '不明'}`
    ).join('，'));
  if (!sections.length) sections.push('目前沒有可確認接近本站的車輛');
  return `${routes[snapshot.routeId]?.spoken || snapshot.route}，${snapshot.directionLabel}，${snapshot.stop.name}。${short && (direct.length || nextCircuit.length) ? '' : `${official}。`}${sections.join('。')}。`;
}

function alertText(snapshot) {
  const minutes = Math.max(1, Math.ceil(snapshot.officialEtaSeconds / 60));
  if (voiceLanguageEl.value === 'en') {
    return `${snapshot.routeNameEn || routes[activeRoute].english} at ${englishStopName(snapshot.stop.nameEn || snapshot.stop.name)}. ` +
      `The official next bus is expected in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }
  return `${routes[snapshot.routeId]?.spoken || snapshot.route}，${snapshot.stop.name}，官方下一班約 ${minutes} 分鐘抵達。`;
}

function vehicleAlertText(snapshot, bus) {
  if (voiceFormatEl.value !== 'verbose') {
    const number = snapshot.vehicles.filter(vehicle => !vehicle.crossDirection)
      .findIndex(vehicle => vehicle.id === bus.id) + 1;
    if (voiceLanguageEl.value === 'en') return `${snapshot.routeNameEn || routes[activeRoute].english}, ${englishStopName(snapshot.stop.nameEn || snapshot.stop.name)}. ` +
      `Bus ${number || 1} is ${bus.atStop ? 'at the stop' : `estimated in ${englishEtaRange(bus)}`}.`;
    return `${routes[snapshot.routeId]?.spoken || snapshot.route}，${snapshot.stop.name}。` +
      `第${number || 1}輛公車${bus.atStop ? '已到站' : `推估${etaRangeLabel(bus)}抵達`}。`;
  }
  if (voiceLanguageEl.value === 'en') return `${snapshot.routeNameEn || routes[activeRoute].english}, ${englishStopName(snapshot.stop.nameEn || snapshot.stop.name)}. ` +
    `${bus.id} is ${bus.atStop ? 'at the stop' : `estimated in ${englishEtaRange(bus)}`}.`;
  return `${routes[snapshot.routeId]?.spoken || snapshot.route}，${snapshot.stop.name}。${bus.id}${bus.atStop ? '已在本站' : `推估${etaRangeLabel(bus)}抵達`}。`;
}

function etaWindow(vehicle) {
  return vehicle.estimatedEtaWindowSeconds || [vehicle.estimatedEtaSeconds, vehicle.estimatedEtaSeconds];
}

function elapsedSeconds(value) {
  if (!value) return 0;
  const stamp = value.includes('T') ? value : value.replace(' ', 'T') + '+08:00';
  const parsed = Date.parse(stamp);
  return Number.isFinite(parsed) ? Math.max(0, (Date.now() - parsed) / 1000) : 0;
}

function remainingVehicleWindow(vehicle) {
  const age = elapsedSeconds(vehicle.lastSeen);
  return etaWindow(vehicle).map(seconds => Math.max(0, seconds - age));
}

function etaRangeLabel(vehicle) {
  const [lower, upper] = remainingVehicleWindow(vehicle);
  const low = Math.max(0, Math.floor(lower / 60));
  const high = Math.max(1, Math.ceil(upper / 60));
  return low === high ? `約 ${high} 分鐘` : `約 ${low}–${high} 分鐘`;
}

function englishEtaRange(vehicle) {
  const [lower, upper] = remainingVehicleWindow(vehicle);
  const low = Math.max(0, Math.floor(lower / 60));
  const high = Math.max(1, Math.ceil(upper / 60));
  return low === high ? `about ${high} minutes` : `about ${low} to ${high} minutes`;
}

function renderLeaveAdvice(snapshot) {
  const walk = locationWalkMinutes ?? Math.max(0, Math.min(60, Number(walkMinutesEl.value) || 0));
  const eta = snapshot.officialEtaSeconds;
  const feedAges = Object.values(snapshot.feedFetchedAt || {}).filter(Boolean).map(elapsedSeconds);
  if (elapsedSeconds(snapshot.updatedAt) > 240 || feedAges.some(age => age > 240)) {
    leaveAdviceEl.textContent = '公車資料已過時；請更新後再查看出發建議。';
    return;
  }
  const needed = walk * 60 + 120;
  const officialRemaining = eta === null ? null : Math.max(0, eta - elapsedSeconds(
    snapshot.feedFetchedAt?.EstimateTime || snapshot.updatedAt));
  let selected = null;
  if (officialRemaining !== null && officialRemaining > needed) {
    selected = {remaining: officialRemaining, description: '官方下一班', tentative: false};
  } else {
    const candidates = snapshot.vehicles.filter(bus => !bus.atStop &&
      remainingVehicleWindow(bus)[0] > needed)
      .sort((a, b) => Number(a.crossDirection) - Number(b.crossDirection) ||
        remainingVehicleWindow(a)[0] - remainingVehicleWindow(b)[0]);
    if (candidates.length) {
      const bus = candidates[0];
      selected = {remaining: remainingVehicleWindow(bus)[0],
        description: `${bus.id}（${bus.crossDirection ? '下一輪' : '逐車'}推估${etaRangeLabel(bus)}）`,
        tentative: true, conditional: Boolean(bus.crossDirection)};
    }
  }
  if (!selected && officialRemaining !== null && officialRemaining > walk * 60) {
    selected = {remaining: officialRemaining, description: '官方下一班', tentative: true};
  }
  if (!selected) {
    leaveAdviceEl.textContent = eta === null
      ? '目前沒有可確認來得及搭乘的車輛；請查看各車推估範圍。'
      : '官方下一班可能趕不上；目前沒有可確認來得及搭乘的後續車輛。';
    return;
  }
  const leaveIn = selected.remaining - needed;
  const clock = new Date(Date.now() + leaveIn * 1000).toLocaleTimeString('zh-TW',
    {hour: '2-digit', minute: '2-digit', hour12: false});
  leaveAdviceEl.textContent = `${selected.conditional ? '若此車在終點折返續行，可參考 ' : selected.tentative ? '可考慮 ' : ''}` +
    `${selected.description}：${selected.conditional ? '約' : '建議'} ${clock} 前出發` +
    `${leaveIn < 60 ? '（現在）' : `（約 ${Math.floor(leaveIn / 60)} 分鐘後）`}` +
    (selected.conditional ? '；可能在終點停駛，請再確認班次。' : '');
}

document.querySelector('#use-location').addEventListener('click', () => {
  if (!navigator.geolocation || !window.isSecureContext) {
    locationStateEl.textContent = '此瀏覽器需要 HTTPS 與定位功能；目前使用手動步行時間。';
    return;
  }
  const station = stops.find(s => s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value));
  if (!station?.lat || !station?.lon) return;
  const requestedStop = currentStopKey();
  locationRequestKey = requestedStop;
  locationStateEl.textContent = '正在取得位置…';
  navigator.geolocation.getCurrentPosition(position => {
    if (currentStopKey() !== requestedStop) return;
    locationRequestKey = '';
    const p = position.coords;
    const lat = (station.lat - p.latitude) * Math.PI / 180;
    const lon = (station.lon - p.longitude) * Math.PI / 180;
    const a = Math.sin(lat / 2) ** 2 + Math.cos(p.latitude * Math.PI / 180) *
      Math.cos(station.lat * Math.PI / 180) * Math.sin(lon / 2) ** 2;
    const metres = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    locationWalkMinutes = Math.min(60, Math.ceil((metres * 1.35 + Math.min(200, p.accuracy || 0)) / 1.2 / 60));
    locationStopKey = currentStopKey();
    locationStateEl.textContent = `直線約 ${Math.round(metres)} 公尺；含繞路與定位誤差，步行約 ${locationWalkMinutes} 分鐘。非導航路線。`;
    if (latestSnapshot) renderLeaveAdvice(latestSnapshot);
    syncPushSettings();
  }, () => {
    if (currentStopKey() === requestedStop) locationStateEl.textContent = '無法取得位置；仍使用手動步行時間。';
    locationRequestKey = '';
  },
  {enableHighAccuracy: false, timeout: 10000, maximumAge: 60000});
});

function scheduleStatus() {
  const routeId = savedSchedule?.route_id || 16405;
  const stop = savedSchedule && activeRoute === routeId && stops.find(s => s.direction === savedSchedule.direction && s.id === savedSchedule.stop_id);
  const voice = savedSchedule?.voice_engine === 'api'
    ? `${savedSchedule.voice_model || 'tts-1'} / ${savedSchedule.voice_name || 'alloy'}`
    : `eSpeak ${savedSchedule?.voice_name || 'cmn'}`;
  const language = savedSchedule?.voice_language === 'en' ? 'English' : '中文';
  const format = savedSchedule?.voice_format === 'verbose' ? '詳細播報' : '簡短播報';
  scheduleStateEl.textContent = savedSchedule?.enabled
    ? `已設定 ${routes[routeId]?.name || routeId} 每天 ${savedSchedule.time} 開始，在${stop?.name || `站牌 ${savedSchedule.stop_id}`}持續 ${savedSchedule.duration_minutes || 60} 分鐘 · ${savedSchedule.mode === 'alert' ? `到站提醒 ${savedSchedule.alert_threshold_minutes || 5} 分鐘門檻` : `每 ${savedSchedule.briefing_interval_minutes || 5} 分鐘播報`} · ${format} · ${language} · ${voice}。`
    : '排程未啟用';
}

function announce(snapshot) {
  if (!voiceEnabled) return;
  if (voiceModeEl.value === 'briefing') {
    const interval = Math.max(1, Math.min(60, Number(briefingIntervalEl.value) || 5)) * 60_000;
    const key = `${snapshot.routeId}:${snapshot.direction}:${snapshot.stop.id}:${snapshot.closedLoop}`;
    if (lastBriefingKey === key && Date.now() - lastBriefingAt < interval) return;
    if (speak(briefingText(snapshot))) {
      lastBriefingAt = Date.now();
      lastBriefingKey = key;
    }
    return;
  }
  const eta = snapshot.officialEtaSeconds;
  const threshold = alertThresholdMinutes() * 60;
  const key = `${snapshot.routeId}:${snapshot.direction}:${snapshot.stop.id}:${snapshot.closedLoop}:${threshold}`;
  if (alertScope !== key) { resetAlertState(); alertScope = key; }
  const now = Date.now();
  for (const [id, seen] of announcedVehicles) {
    if (now - seen > 10 * 60_000) announcedVehicles.delete(id);
  }
  for (const bus of snapshot.vehicles) {
    if (announcedVehicles.has(bus.id)) announcedVehicles.set(bus.id, now);
  }
  const newlyClose = snapshot.vehicles.filter(bus => !bus.crossDirection &&
    (bus.atStop || bus.estimatedEtaSeconds <= threshold) && !announcedVehicles.has(bus.id));
  const officialDue = eta !== null && eta <= threshold && lastAnnouncement !== key;
  if (!officialDue && !newlyClose.length) return;
  const words = [officialDue && alertText(snapshot), ...newlyClose.map(bus => vehicleAlertText(snapshot, bus))].filter(Boolean).join(' ');
  if (speak(words)) {
    if (officialDue) lastAnnouncement = key;
    for (const bus of newlyClose) announcedVehicles.set(bus.id, now);
  }
}

function syncVoiceMode() {
  const briefing = voiceModeEl.value === 'briefing';
  voiceSettingsSummaryEl.textContent = `語音設定 · ${briefing ? '定時播報' : `到站提醒 ${alertThresholdMinutes()} 分鐘`} / ${voiceFormatEl.value === 'verbose' ? '詳細' : '簡短'} / ${voiceLanguageEl.value === 'en' ? 'English' : '中文'}`;
  document.querySelector('#alert-settings').hidden = briefing;
  document.querySelector('#briefing-settings').hidden = !briefing;
  if (voiceError || activeUtterance || activeAudio || pendingAudio) return;
  const voices = 'speechSynthesis' in window ? speechSynthesis.getVoices() : [];
  const hasLanguageVoice = voices.some(v => voiceLanguageEl.value === 'en'
    ? /^en/i.test(v.lang) : /^(zh|cmn)/i.test(v.lang));
  const localChoice = voiceModelEl.value === 'api' || voiceModelEl.value.startsWith('espeak:');
  voiceStateEl.className = 'voice-state';
  voiceStateEl.textContent = !latestSnapshot ? '正在載入目前站牌資訊；可先按「試播」檢查聲音'
    : voiceEnabled ? (briefing ? '已啟用；依設定間隔播報' : '已啟用；每輛車進入門檻時提醒')
    : localChoice ? '尚未啟用 · 可按「試播」檢查本機語音'
        : voices.length ? `尚未啟用 · ${hasLanguageVoice ? '所選語言語音可用' : '未找到對應語音，請先試播'}`
          : '尚未偵測到系統語音，請先試播';
}

function speakCurrentMode() {
  if (!latestSnapshot) return;
  if (voiceModeEl.value === 'briefing') {
    if (speak(briefingText(latestSnapshot))) {
      lastBriefingAt = Date.now();
      lastBriefingKey = `${latestSnapshot.routeId}:${latestSnapshot.direction}:${latestSnapshot.stop.id}:${latestSnapshot.closedLoop}`;
    }
    return;
  }
  const eta = latestSnapshot.officialEtaSeconds;
  const threshold = alertThresholdMinutes() * 60;
  if ((eta !== null && eta <= threshold) || latestSnapshot.vehicles.some(bus =>
    !bus.crossDirection && (bus.atStop || bus.estimatedEtaSeconds <= threshold))) {
    announce(latestSnapshot);
  } else {
    speak(voiceLanguageEl.value === 'en'
      ? `${latestSnapshot.routeNameEn || routes[activeRoute].english} voice alerts are enabled. I will speak when the next bus approaches.`
      : `${routes[activeRoute].spoken}語音提醒已啟用。接近設定時間時會再提醒您。`);
  }
}

function render(data, {preview = false} = {}) {
  latestSnapshot = data;
  const approaching = [...data.vehicles].sort((a, b) =>
    Number(b.atStop) - Number(a.atStop) || a.estimatedEtaSeconds - b.estimatedEtaSeconds || a.id.localeCompare(b.id));
  voiceEl.disabled = false;
  renderRoute(data);
  const fetched = data.feedFetchedAt || {};
  const feedAges = Object.values(fetched).filter(Boolean).map(value => Math.max(0, Math.round((Date.now() - Date.parse(value)) / 1000)));
  const oldestFeed = feedAges.length ? Math.max(...feedAges) : null;
  dataFreshnessEl.classList.toggle('stale', oldestFeed === null || oldestFeed > 90);
  dataFreshnessEl.textContent = oldestFeed === null ? '尚無資料來源時間；請留意車輛最後回報時間。'
    : `公車位置、事件與官方預估：最久於 ${oldestFeed} 秒前取得` +
      (oldestFeed > 90 ? ' · 資料可能過時' : ' · 車輛回報時間見下方');
  document.querySelector('#stop-title').textContent = data.stop.name;
  document.querySelector('#updated').textContent = preview ? '最近資料 · 正在取得最新資訊…'
    : `查詢於 ${new Date(data.updatedAt).toLocaleTimeString('zh-TW')}`;
  messageEl.hidden = !preview;
  messageEl.classList.remove('error');
  if (preview) messageEl.textContent = '已顯示所選站牌的最近資料，正在取得最新公車動態…';
  const etaCard = document.querySelector('#eta-card');
  etaCard.hidden = false;
  const eta = data.officialEtaSeconds;
  const directlyApproaching = approaching.filter(bus => !bus.crossDirection || bus.atStop);
  const nextCircuit = approaching.length - directlyApproaching.length;
  const statusConflict = eta === null && data.officialStatus === '今日未營運' && directlyApproaching.length > 0;
  document.querySelector('#eta').textContent = statusConflict ? '官方暫無到站時間'
    : eta !== null ? (eta < 60 ? '即將進站' : `${Math.ceil(eta / 60)} 分鐘`) : (data.officialStatus || '暫無預估');
  document.querySelector('#eta-detail').textContent = statusConflict
    ? `官方資料顯示「今日未營運」，但本方向偵測到 ${directlyApproaching.length} 輛公車。資料不一致，無法據此判斷本站是否停駛；下方逐車時間為推估。`
    : eta !== null ? '此時間只代表下一班，由官方預估'
      : data.officialStatus ? `官方回報「${data.officialStatus}」，目前沒有本站的官方到站時間。`
        : '官方目前未提供本站到站時間。';
  renderLeaveAdvice(data);
  document.querySelector('#vehicle-count').textContent = `本方向 ${directlyApproaching.length} · 下一輪 ${nextCircuit}`;
  const bucket = statusConflict ? '官方狀態與沿線車輛資料不一致'
    : data.officialEtaSeconds === null ? data.officialStatus || '未知'
    : data.officialEtaSeconds <= 60 ? '即將到站' : data.officialEtaSeconds <= 180 ? '3分鐘內'
      : data.officialEtaSeconds <= 300 ? '5分鐘內' : '5分鐘以上';
  const a11yKey = `${data.routeId}:${data.direction}:${data.stop.id}:${data.vehicles.length}:${bucket}`;
  if (a11yKey !== lastA11yKey) {
    resultsStatusEl.textContent = `${data.stop.name}：${bucket}，可追蹤 ${data.vehicles.length} 輛公車。`;
    lastA11yKey = a11yKey;
  }
  document.querySelector('#vehicle-summary').textContent = approaching.length
    ? `本方向 ${directlyApproaching.length} 輛接近本站` +
      (nextCircuit ? `；另有 ${nextCircuit} 輛在另一方向，只有折返續行才可能在下一輪抵達。` : '。') +
      '下方依推估時間排序；車牌與官方下一班時間不一定能一一對應。'
    : '目前沒有可確認位置、正在接近本站的車輛。這不代表沒有班次；仍可參考上方官方下一班狀態。';
  document.querySelector('.approach-board').classList.toggle('is-empty', !approaching.length);
  vehiclesEl.replaceChildren();
  for (const [index, vehicle] of approaching.entries()) {
    const row = document.createElement('article'); row.className = 'vehicle';
    row.dataset.busId = vehicle.id;
    if (index === 0) row.classList.add('first');
    const left = document.createElement('div'); left.className = 'vehicle-main';
    const heading = document.createElement('div'); heading.className = 'vehicle-heading';
    const number = document.createElement('span'); number.className = 'index'; number.textContent = `第 ${index + 1} 輛`;
    const plate = document.createElement('strong'); plate.textContent = vehicle.id;
    heading.append(number, plate);
    const next = document.createElement('p'); next.className = 'vehicle-location';
    next.textContent = vehicle.atStop ? '已抵達所選站牌'
      : vehicle.crossDirection
        ? `目前在${vehicle.originDirection === 0 ? '去程' : '返程'} · 下一站 ${vehicle.nextStop || '不明'} · 折返後才可能抵達`
        : `下一站 ${vehicle.nextStop || '不明'} · 約 ${vehicle.stopsAway} 站前`;
    left.append(heading, next);
    const away = document.createElement('div'); away.className = 'away';
    const vehicleEta = document.createElement('strong');
    vehicleEta.textContent = vehicle.atStop ? '本站停靠中' : etaRangeLabel(vehicle);
    const estimateTag = document.createElement('small');
    estimateTag.textContent = vehicle.atStop ? '車輛定位'
      : vehicle.crossDirection ? '下一輪推估 · 不保證續行'
        : vehicle.confidence === 'low' ? '逐車推估 · 信心較低' : '逐車推估';
    away.append(vehicleEta, estimateTag);
    const details = document.createElement('details'); details.className = 'vehicle-detail';
    const summary = document.createElement('summary'); summary.textContent = '定位與推估依據';
    const detailText = document.createElement('p');
    const basis = vehicle.etaBasis || {};
    const sources = [basis.observed && `${basis.observed} 段實測`,
      basis['official-gap'] && `${basis['official-gap']} 段官方站間差`,
      basis.distance && `${basis.distance} 段站距補足`].filter(Boolean).join(' · ');
    const seen = Math.max(0, Math.round((Date.now() - Date.parse(vehicle.lastSeen?.replace(' ', 'T') + '+08:00')) / 1000) || vehicle.dataAgeSeconds || 0);
    detailText.textContent = `${vehicle.locationLabel || '位置估計'} · 回報約 ${seen} 秒前` +
      (vehicle.mapErrorMeters === null ? ' · 依站位事件定位' : ` · GPS 偏離路線約 ${vehicle.mapErrorMeters} 公尺`) +
      (vehicle.atStop ? '' : ` · 中心約 ${Math.max(1, Math.ceil(vehicle.estimatedEtaSeconds / 60))} 分鐘 · ${sources || '站間時間推估'}` +
        (vehicle.calibrationSamples >= 5 ? ` · 參照 ${vehicle.calibrationSamples} 次實際到站` : '') +
        ` · 推估信心${{high: '較高', medium: '中等', low: '較低'}[vehicle.confidence] || '未知'}`);
    details.append(summary, detailText);
    row.append(left, away, details); vehiclesEl.append(row);
  }
  if (!activeUtterance && !activeAudio && !pendingAudio) voicePreviewEl.textContent = `播報內容：${briefingText(data)}`;
  if (!preview) announce(data);
  if (!voiceEnabled) syncVoiceMode();
}

function beginSelection() {
  const station = stops.find(s => s.direction === Number(directionEl.value) &&
    String(s.id) === String(stopEl.value));
  const name = station?.name || '所選站牌';
  if ((locationStopKey && locationStopKey !== currentStopKey()) ||
      (locationRequestKey && locationRequestKey !== currentStopKey())) {
    locationWalkMinutes = null;
    locationStopKey = '';
    locationRequestKey = '';
    locationStateEl.textContent = '站牌已變更；請重新取得位置，或使用手動步行時間。';
  }
  latestSnapshot = null;
  lastA11yKey = '';
  resetAlertState();
  lastBriefingAt = 0;
  lastBriefingKey = '';
  ++playbackGeneration;
  stopAudio();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  activeUtterance = null;
  voiceError = null;
  document.querySelector('#stop-title').textContent = name;
  document.querySelector('#updated').textContent = '正在更新…';
  document.querySelector('#eta-card').hidden = true;
  document.querySelector('#vehicle-count').textContent = '更新中…';
  document.querySelector('#vehicle-summary').textContent = '正在確認沿線公車…';
  document.querySelector('.approach-board').classList.add('is-empty');
  leaveAdviceEl.textContent = '正在計算建議出發時間…';
  dataFreshnessEl.textContent = '正在讀取資料時間…';
  vehiclesEl.replaceChildren();
  messageEl.hidden = false;
  messageEl.classList.remove('error');
  messageEl.textContent = `正在更新${name}的官方到站資訊與沿線公車…`;
  resultsStatusEl.textContent = `${name}：正在更新到站資訊與沿線公車。`;
  renderRoute(null, true);
  syncVoiceMode();
  syncPushSettings();
}

async function update({selected = false, fresh = false} = {}) {
  if (!stopEl.value) return;
  if (arrivalsPending && !selected && !fresh) return;
  const current = ++generation;
  const direction = directionEl.value, stop = stopEl.value;
  for (const controller of arrivalsControllers) controller.abort();
  arrivalsControllers = [];
  arrivalsPending = true;
  if (selected) beginSelection();
  localStorage.setItem(routeStorage('stop-' + direction), stop);
  const routeId = activeRoute;
  const url = `api/arrivals?route_id=${routeId}&direction=${direction}&stop_id=${encodeURIComponent(stop)}&closed_loop=${closedEl.checked ? 1 : 0}`;
  const fetchArrival = live => {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    if (controller) arrivalsControllers.push(controller);
    return request(url + (live ? '&fresh=1' : ''), controller ? {signal: controller.signal} : {});
  };
  try {
    if (selected && fresh) {
      let displayed = false;
      let liveDisplayed = false;
      let liveError = null;
      const recent = fetchArrival(false).then(data => {
        if (current === generation && routeId === activeRoute && !liveDisplayed) {
          render(data, {preview: true});
          displayed = true;
        }
      }).catch(() => {});
      const live = fetchArrival(true).then(data => {
        if (current === generation && routeId === activeRoute) {
          render(data);
          displayed = true;
          liveDisplayed = true;
        }
      }).catch(error => { if (error.name !== 'AbortError') liveError = error; });
      await Promise.all([recent, live]);
      if (current === generation && routeId === activeRoute) {
        if (!displayed) showError(liveError?.message || '資料無法取得');
        else if (!liveDisplayed) {
          messageEl.hidden = false;
          messageEl.textContent = '即時更新暫不可用；目前顯示最近可用的公車資料。';
          document.querySelector('#updated').textContent = '最近資料 · 即時更新失敗';
          if (voiceEnabled && latestSnapshot) announce(latestSnapshot);
        }
      }
    } else {
      const data = await fetchArrival(fresh);
      if (current === generation && routeId === activeRoute) render(data);
    }
  } catch (error) {
    if (current === generation && error.name !== 'AbortError') showError(error.message);
  } finally {
    if (current === generation) {
      arrivalsPending = false;
      arrivalsControllers = [];
    }
  }
}

directionEl.addEventListener('change', () => {localStorage.setItem(routeStorage('direction'), directionEl.value); setStops();});
routeSearchEl.addEventListener('input', () => {
  const query = routeSearchEl.value;
  if (query && !matchingRouteStops(mobileRouteDirection, query).length &&
      matchingRouteStops(1 - mobileRouteDirection, query).length) mobileRouteDirection = 1 - mobileRouteDirection;
  renderRoute(latestSnapshot);
  for (const scroll of routeColumnsEl.querySelectorAll('.route-scroll')) scroll.scrollTop = 0;
});
for (const button of mobileLegButtons) button.addEventListener('click', () => {
  mobileRouteDirection = Number(button.dataset.mobileLeg);
  renderRoute(latestSnapshot);
});
document.querySelector('#jump-to-stop').addEventListener('click', () => {
  if (!stops.length) return;
  routeSearchEl.value = '';
  mobileRouteDirection = Number(directionEl.value);
  setRouteExpanded(true);
  renderRoute(latestSnapshot);
  const scroll = routeColumnsEl.querySelectorAll('.route-scroll')[Number(directionEl.value)];
  const selected = scroll?.querySelector('.route-stop.active');
  selected?.scrollIntoView?.({block: 'center', behavior: 'smooth'});
  selected?.focus?.({preventScroll: true});
});
stopEl.addEventListener('change', () => update({selected: true, fresh: true}));
closedEl.addEventListener('change', () => {
  localStorage.setItem(routeStorage('closed-loop'), closedEl.checked ? '1' : '0');
  lastBriefingAt = 0;
  resetAlertState();
  update({selected: true, fresh: true});
});
function saveAlertThreshold() {
  const minutes = alertThresholdMinutes();
  if (thresholdEl.value === 'custom') customThresholdEl.value = String(minutes);
  localStorage.setItem('orange5-alert-threshold', String(minutes));
  resetAlertState();
  syncVoiceMode();
  if (voiceEnabled && voiceModeEl.value === 'alert') speakCurrentMode();
}
thresholdEl.addEventListener('change', () => {
  customThresholdWrapEl.hidden = thresholdEl.value !== 'custom';
  saveAlertThreshold();
  if (thresholdEl.value === 'custom') customThresholdEl.focus?.();
});
customThresholdEl.addEventListener('change', saveAlertThreshold);
voiceModeEl.addEventListener('change', () => {
  localStorage.setItem('orange5-voice-mode', voiceModeEl.value);
  resetAlertState(); lastBriefingAt = 0;
  syncVoiceMode();
  if (voiceEnabled) { speakCurrentMode(); update(); }
});
voiceFormatEl.addEventListener('change', () => {
  localStorage.setItem('orange5-voice-format', voiceFormatEl.value);
  resetAlertState(); lastBriefingAt = 0; lastBriefingKey = '';
  syncVoiceMode();
  if (latestSnapshot) voicePreviewEl.textContent = `播報內容：${briefingText(latestSnapshot)}`;
});
voiceLanguageEl.addEventListener('change', () => {
  const language = voiceLanguageEl.value;
  const previous = voiceModelEl.value;
  localStorage.setItem('orange5-voice-language', language);
  preferredVoiceModel = localStorage.getItem(`orange5-voice-model-${language}`) ||
    (previous.startsWith('espeak:') ? `espeak:${language === 'en' ? 'en' : 'cmn'}${previous.split('+')[1] ? '+' + previous.split('+')[1] : ''}`
      : previous.startsWith('browser:') ? 'auto' : previous);
  localStorage.setItem(`orange5-voice-model-${language}`, preferredVoiceModel);
  populateVoices();
  resetAlertState(); lastBriefingAt = 0;
  if (voiceEnabled) speakCurrentMode();
});
briefingIntervalEl.addEventListener('change', () => {
  const minutes = Math.max(1, Math.min(60, Math.round(Number(briefingIntervalEl.value) || 5)));
  briefingIntervalEl.value = String(minutes);
  localStorage.setItem('orange5-briefing-interval', String(minutes));
  lastBriefingAt = 0;
  if (voiceEnabled && voiceModeEl.value === 'briefing') { speakCurrentMode(); update(); }
});
walkMinutesEl.addEventListener('change', () => {
  const minutes = Math.max(0, Math.min(60, Math.round(Number(walkMinutesEl.value) || 0)));
  walkMinutesEl.value = String(minutes);
  localStorage.setItem('orange5-walk-minutes', String(minutes));
  locationWalkMinutes = null;
  locationStopKey = '';
  locationStateEl.textContent = '使用手動步行時間。';
  if (latestSnapshot) renderLeaveAdvice(latestSnapshot);
  syncPushSettings();
});
voiceModelEl.addEventListener('change', () => {
  preferredVoiceModel = voiceModelEl.value;
  localStorage.setItem(`orange5-voice-model-${voiceLanguageEl.value}`, preferredVoiceModel);
  apiVoiceSettingsEl.hidden = preferredVoiceModel !== 'api';
  voiceError = null;
  syncVoiceMode();
});
apiModelEl.addEventListener('change', () => localStorage.setItem('orange5-api-model', apiModelEl.value.trim() || 'tts-1'));
apiVoiceEl.addEventListener('change', () => localStorage.setItem('orange5-api-voice', apiVoiceEl.value.trim() || 'alloy'));
if (!publicMode) document.querySelector('#schedule-save').addEventListener('click', async () => {
  const selected = voiceModelEl.value;
  const payload = {enabled: scheduleEnabledEl.checked, time: scheduleTimeEl.value, route_id: activeRoute,
    direction: Number(directionEl.value), stop_id: Number(stopEl.value), closed_loop: closedEl.checked,
    mode: voiceModeEl.value, duration_minutes: Math.max(1, Math.min(720, Math.round(Number(scheduleDurationEl.value) || 60))),
    briefing_interval_minutes: Math.max(1, Math.min(60, Math.round(Number(briefingIntervalEl.value) || 5))),
    alert_threshold_minutes: alertThresholdMinutes(),
    voice_format: voiceFormatEl.value,
    voice_language: voiceLanguageEl.value,
    voice_engine: selected === 'api' ? 'api' : 'espeak',
    voice_model: apiModelEl.value.trim() || 'tts-1',
    voice_name: selected === 'api' ? (apiVoiceEl.value.trim() || 'alloy')
      : selected.startsWith('espeak:') ? selected.slice(7) : fallbackEspeakVoice()};
  scheduleStateEl.textContent = '正在儲存排程…';
  try {
    const response = await fetch('api/schedule', {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '排程無法儲存');
    savedSchedule = data;
    scheduleStatus();
  } catch (error) { scheduleStateEl.textContent = `排程儲存失敗：${error.message}`; }
});
document.querySelector('#refresh').addEventListener('click', () => update({selected: true, fresh: true}));
function setRouteExpanded(expanded) {
  routeBodyEl.hidden = !expanded;
  routeToggleEl.setAttribute('aria-expanded', String(expanded));
  routeToggleEl.textContent = expanded ? '收合路線' : '展開路線與沿線公車';
}
setRouteExpanded(true);
const compactScreen = window.matchMedia?.('(max-width:650px)');
mapDetailEl.open = !compactScreen?.matches;
voiceSettingsEl.open = !compactScreen?.matches;
let wasCompact = Boolean(compactScreen?.matches);
function applyScreenSize(compact) {
  if (compact === wasCompact) return;
  wasCompact = compact;
  mapDetailEl.open = !compact;
  voiceSettingsEl.open = !compact;
}
compactScreen?.addEventListener?.('change', event => applyScreenSize(event.matches));
window.addEventListener?.('resize', () => applyScreenSize(Boolean(compactScreen?.matches)));
routeToggleEl.addEventListener('click', () => setRouteExpanded(routeBodyEl.hidden));
document.addEventListener?.('visibilitychange', () => { if (!document.hidden) update(); });
voiceTestEl.addEventListener('click', () => {
  speak(latestSnapshot ? briefingText(latestSnapshot)
    : voiceLanguageEl.value === 'en' ? `${routes[activeRoute].english} voice test.` : `${routes[activeRoute].spoken}語音測試。`);
});
voiceEl.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voiceEl.setAttribute('aria-pressed', String(voiceEnabled));
  voiceEl.textContent = voiceEnabled ? '停止語音' : '啟用語音';
  voiceError = null;
  if (!voiceEnabled) {
    playbackGeneration++;
    activeUtterance = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    stopAudio();
    resetAlertState();
    syncVoiceMode();
    return;
  }
  syncVoiceMode();
  speakCurrentMode();
  update();
});
if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
  voiceStateEl.textContent = '瀏覽器無內建朗讀；可選本機 TTS 或 eSpeak';
} else {
  speechSynthesis.addEventListener('voiceschanged', populateVoices);
}
populateVoices();
for (const tab of routeTabs) {
  tab.addEventListener('click', () => switchRoute(Number(tab.dataset.route)));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = routeTabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? routeTabs.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + routeTabs.length) % routeTabs.length;
    routeTabs[next].focus();
    routeTabs[next].click();
  });
}
switchRoute(activeRoute);
if (publicMode && pushNeedsRemoval()) {
  pushToggleEl.textContent = localStorage.getItem(pushPendingRemoveKey) === '1' ? '重試關閉手機通知' : '關閉手機通知';
  pushStateEl.textContent = localStorage.getItem(pushPendingRemoveKey) === '1'
    ? '上次關閉尚未完成；可重試。' : '正在同步手機通知設定…';
}
if (!publicMode) request('api/schedule').then(data => {
  savedSchedule = data;
  scheduleEnabledEl.checked = data.enabled;
  scheduleTimeEl.value = data.time;
  scheduleDurationEl.value = data.duration_minutes || 60;
  scheduleStatus();
}).catch(error => {scheduleStateEl.textContent = `無法讀取排程：${error.message}`;});
setInterval(update, 30_000);
setInterval(() => {
  if (!latestSnapshot) return;
  renderLeaveAdvice(latestSnapshot);
  const buses = new Map(latestSnapshot.vehicles.map(bus => [bus.id, bus]));
  for (const row of vehiclesEl.querySelectorAll('.vehicle')) {
    const bus = buses.get(row.dataset.busId);
    if (bus && !bus.atStop) row.querySelector('.away strong').textContent = etaRangeLabel(bus);
  }
}, 10_000);
