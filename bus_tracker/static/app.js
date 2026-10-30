const uiI18n = window.AheadWayI18n;
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
const voiceSettingsSummaryEl = document.querySelector('#voice-settings-label');
const voiceSettingsEngineEl = document.querySelector('#voice-settings-engine');
const voiceModelEl = document.querySelector('#voice-model');
const apiModelEl = document.querySelector('#api-model');
const apiVoiceEl = document.querySelector('#api-voice');
const apiVoiceSettingsEl = document.querySelector('#api-voice-settings');
const walkMinutesEl = document.querySelector('#walk-minutes');
const planBufferEl = document.querySelector('#plan-buffer');
const useLocationEl = document.querySelector('#use-location');
const walkSourceEl = document.querySelector('#walk-source');
const walkSettingsEl = document.querySelector('.walk-settings');
const leaveAdviceEl = document.querySelector('#leave-advice');
const leaveBriefEl = document.querySelector('#leave-brief');
const trackAdviceOnlyEl = document.querySelector('#track-advice-only');
const trackedBusEl = document.querySelector('#tracked-bus');
const trackedBusTitleEl = document.querySelector('#tracked-bus-title');
const trackedBusDetailEl = document.querySelector('#tracked-bus-detail');
const trackedBusClearEl = document.querySelector('#tracked-bus-clear');
const locationStateEl = document.querySelector('#location-state');
const dataFreshnessEl = document.querySelector('#data-freshness');
const liveStatusEl = document.querySelector('#live-status');
const liveStatusTextEl = document.querySelector('#live-status-text');
const stopSelectionHintEl = document.querySelector('#stop-selection-hint');
const textSizeToggleEl = document.querySelector('#text-size-toggle');
const savedTripsEl = document.querySelector('#saved-trips');
const tripsMoreEl = document.querySelector('#trips-more');
const savedTripsBarEl = document.querySelector('.quick-trips');
const savedTripsPhoneMedia = window.matchMedia('(max-width: 650px)');
let tripsExpanded = false;
let pendingSavedTripKey = null;
const queryTripEl = document.querySelector('#query-trip');
const pushStateEl = document.querySelector('#push-state');
const pushPanelEl = document.querySelector('#mobile-reminder');
const mobileModeSummaryEl = document.querySelector('#mobile-mode-summary');
const mobilePlanEl = document.querySelector('#mobile-plan');
const mobileTravelEl = document.querySelector('#mobile-travel');
const planPanelEl = document.querySelector('#plan-panel');
const planHelpEl = planPanelEl.querySelector('p');
const travelPanelEl = document.querySelector('#travel-panel');
const travelResultEl = document.querySelector('#travel-result');
const travelHeadEl = document.querySelector('#travel-head');
const travelDetailEl = document.querySelector('#travel-detail');
const travelReturnReferenceEl = document.querySelector('#travel-return-reference');
const travelReturnResultEl = document.querySelector('#travel-return-result');
const travelActionEl = document.querySelector('#travel-action');
const travelFloatEl = document.querySelector('#travel-float');
let mobileMode = 'plan';
let travelWatchId = null;
let travelWatchVersion = 0;
let travelActive = false;
let lastTravelPosition = null;
let lastTravelPositionAt = 0;
let lastTravelAlertKey = '';
const scheduleTimeEl = document.querySelector('#schedule-time');
const scheduleDurationEl = document.querySelector('#schedule-duration');
const scheduleEnabledEl = document.querySelector('#schedule-enabled');
const scheduleStateEl = document.querySelector('#schedule-state');
const closedEl = document.querySelector('#closed-loop');
const scopeEffectEl = document.querySelector('#scope-effect');
const arrivalScopeHelpEl = document.querySelector('#arrival-scope');
const scopeHelpToggleEl = document.querySelector('#scope-help-toggle');
const trackingContextEl = document.querySelector('#tracking-context');
const routeColumnsEl = document.querySelector('#route-columns');
const mobileLegButtons = [...document.querySelectorAll('[data-mobile-leg]')];
const routePanelEl = document.querySelector('.route-panel');
const routeSearchEl = document.querySelector('#route-search');
const routeSearchStatusEl = document.querySelector('#route-search-status');
const mapDetailEl = document.querySelector('#map-detail');
const resultsStatusEl = document.querySelector('#results-status');
const routeMapEl = document.querySelector('#route-map');
const routeMapStatusEl = document.querySelector('#route-map-status');
const mapSelectedStopNameEl = document.querySelector('#map-selected-stop-name');
const mapZoomInEl = document.querySelector('#map-zoom-in');
const mapZoomOutEl = document.querySelector('#map-zoom-out');
const mapZoomResetEl = document.querySelector('#map-zoom-reset');
const publicMode = window.BUS_TRACKER_PUBLIC === true;
const knownLoopRouteIds = [16405, 16585, 16664];
const routes = {
  16405: {name: '橘5', spoken: '橘五', english: 'Orange Five', heads: ['往捷運景安站', '往板橋'], headsEn: ['toward Jingan MRT Station', 'toward Banqiao'], terminalDirection: 1, turnaroundStop: '捷運景安站(景平路)', source: 'new-taipei'},
  16585: {name: '908', spoken: '九零八', english: 'Route 908', heads: ['往捷運景安站', '往三峽'], headsEn: ['toward Jingan MRT Station', 'toward Sanxia'], terminalDirection: 0, turnaroundStop: '捷運景安站(景平路)', source: 'new-taipei'},
  16664: {name: '921', spoken: '九二一', english: 'Route 921', heads: ['往捷運景安站', '往三峽'], headsEn: ['toward Jingan MRT Station', 'toward Sanxia'], terminalDirection: 0, turnaroundStop: '捷運景安站(景平路)', source: 'new-taipei'}
};
let addedRouteIds = [];
try {
  const stored = JSON.parse(localStorage.getItem('bus-tracker-added-routes') || '[]');
  if (Array.isArray(stored)) addedRouteIds = [...new Set(stored.filter(id => Number.isInteger(id) && id > 0))].slice(0, 20);
} catch (_) { /* Ignore damaged browser storage. */ }
const requestedRoute = Number(localStorage.getItem('bus-tracker-route'));
let activeRoute = null;
let routeTabs = [...document.querySelectorAll('.route-tabs [role="tab"]')];
const routeTabsEl = document.querySelector('.route-tabs');
const routeBackEl = document.querySelector('#route-back');
const routeMoreEl = document.querySelector('#route-more');
const disclosureToggleEl = document.querySelector('#disclosure-toggle');
const tripStopToggleEl = document.querySelector('#trip-stop-toggle');
const selectionSummaryEl = document.querySelector('#selection-summary');
const selectionCardEl = document.querySelector('#selection-card');
let catalogSearchVersion = 0;
let catalogMatches = [];
const routePickerEl = document.querySelector('#route-picker');
const routeAddEl = document.querySelector('#route-add');
const routeQueryEl = document.querySelector('#route-query');
const routeResultsEl = document.querySelector('#route-results');
const routePickerStatusEl = document.querySelector('#route-picker-status');
const routeRemoveEl = document.querySelector('#route-remove');
const routeRemoveConfirmEl = document.querySelector('#route-remove-confirm');
const routeRemoveTitleEl = document.querySelector('#route-remove-title');
const routeRemoveDescriptionEl = document.querySelector('#route-remove-description');
function setEmptyRouteState() {
  const empty = addedRouteIds.length === 0;
  document.body.classList.toggle('no-route', empty);
  if (empty) {
    activeRoute = null;
    stops = [];
    stopEl.replaceChildren();
    latestSnapshot = null;
    trackingContextEl.hidden = true;
    localStorage.removeItem('bus-tracker-route');
    document.title = 'AheadWay';
  }
  return empty;
}
function closeRouteRemoval() {
  routeRemoveConfirmEl.hidden = true;
  document.querySelector('#route-current-actions').hidden = true;
  routeRemoveEl.setAttribute('aria-expanded', 'false');
}
function setRouteRemoveLabel(route) {
  if (!route) return;
  const label = `移除 ${route.name} 路線`;
  routeRemoveEl.setAttribute('aria-label', label);
  routeRemoveEl.title = label;
}
function openRoutePicker() {
  closeRouteRemoval();
  routePickerEl.open = true;
  syncRouteAddButton();
  routePickerEl.scrollIntoView({behavior: 'smooth', block: 'center'});
  routeQueryEl.focus();
}
document.querySelector('#first-route-add').addEventListener('click', openRoutePicker);
function syncRouteAddButton() {
  routeAddEl.setAttribute('aria-expanded', String(routePickerEl.open));
  routeAddEl.setAttribute('aria-label', routePickerEl.open ? '關閉加入路線' : '加入路線');
  routeAddEl.title = routeAddEl.getAttribute('aria-label');
  const label = routeAddEl.querySelector?.('.route-add-label');
  if (label) label.textContent = routePickerEl.open ? '關閉' : '加入路線';
}
syncRouteAddButton();
routeAddEl.addEventListener('click', () => {
  closeRouteRemoval();
  routePickerEl.open = !routePickerEl.open;
  syncRouteAddButton();
  if (routePickerEl.open) routeQueryEl.focus();
});
routePickerEl.addEventListener('toggle', syncRouteAddButton);
routePickerEl.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  routePickerEl.open = false;
  syncRouteAddButton();
  (document.body.classList.contains('no-route') ? document.querySelector('#first-route-add') : routeAddEl).focus();
});
const routeStorage = suffix => `bus-tracker-${activeRoute}-${suffix}`;
closedEl.checked = (localStorage.getItem(routeStorage('closed-loop')) ??
  (activeRoute === 16405 ? localStorage.getItem('orange5-closed-loop') : null) ??
  (knownLoopRouteIds.includes(activeRoute) ? '1' : '0')) === '1';
travelReturnReferenceEl.checked = (localStorage.getItem(routeStorage('return-reference')) ??
  (closedEl.checked ? '1' : '0')) === '1';
voiceModeEl.value = localStorage.getItem('orange5-voice-mode') === 'briefing' ? 'briefing' : 'alert';
voiceFormatEl.value = ['verbose', 'track'].includes(localStorage.getItem('orange5-voice-format'))
  ? localStorage.getItem('orange5-voice-format') : 'short';
const storedThreshold = Number(localStorage.getItem('orange5-alert-threshold'));
const initialThreshold = Number.isInteger(storedThreshold) && storedThreshold >= 1 && storedThreshold <= 60
  ? storedThreshold : 5;
thresholdEl.value = [1, 3, 5, 10].includes(initialThreshold) ? String(initialThreshold) : 'custom';
customThresholdEl.value = String(thresholdEl.value === 'custom' ? initialThreshold : 7);
customThresholdWrapEl.hidden = thresholdEl.value !== 'custom';
voiceLanguageEl.value = localStorage.getItem('orange5-voice-language') === 'en' ? 'en' : 'zh';
briefingIntervalEl.value = localStorage.getItem('orange5-briefing-interval') || '5';
walkMinutesEl.value = localStorage.getItem('orange5-walk-minutes') || '5';
planBufferEl.value = localStorage.getItem('bus-tracker-plan-buffer') || '2';
let manualWalkMinutes = walkMinutesEl.value;
const WALK_MODE_KEY = 'aheadway-walk-mode';
useLocationEl.checked = localStorage.getItem(WALK_MODE_KEY) !== 'manual';
apiModelEl.value = localStorage.getItem('orange5-api-model') || 'tts-1';
const storedApiVoice = localStorage.getItem('orange5-api-voice');
apiVoiceEl.value = storedApiVoice && storedApiVoice !== 'alloy' ? storedApiVoice : 'anne';
if (storedApiVoice === 'alloy') localStorage.setItem('orange5-api-voice', 'anne');
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
let locationRequestVersion = 0;
let savedTrips = [];
try {
  const storedTrips = JSON.parse(localStorage.getItem('bus-tracker-saved-trips') || '[]');
  if (Array.isArray(storedTrips)) savedTrips = storedTrips.filter(trip => trip &&
    Number.isInteger(trip.routeId) && trip.routeId > 0 && Number.isInteger(trip.stopId) &&
    [0, 1].includes(trip.direction)).slice(0, 8);
} catch (_) { /* Ignore damaged browser storage. */ }
let preferredVoiceModel = localStorage.getItem(`orange5-voice-model-${voiceLanguageEl.value}`) ||
  (voiceLanguageEl.value === 'zh' ? localStorage.getItem('orange5-voice-model') : null) || 'api';
if (preferredVoiceModel === 'local') preferredVoiceModel = 'espeak:cmn';
if (publicMode) {
  document.querySelector('.schedule-settings').hidden = true;
  apiModelEl.value = 'tts-1';
  apiVoiceEl.value = 'anne';
  apiModelEl.readOnly = true;
  apiVoiceEl.readOnly = true;
  document.querySelector('#api-voice-settings small').textContent =
    '公共版使用本機 TTS 伺服器 tts-1 / anne；也可選 eSpeak 或瀏覽器語音。';
}
const phoneViewport = window.matchMedia?.('(max-width:650px)');
pushPanelEl.hidden = false;
const phonePushControlsEl = document.querySelector('.phone-push-controls');
phonePushControlsEl.hidden = !publicMode || !phoneViewport?.matches;
const pushToggleEl = document.querySelector('#push-toggle');
const pushRetryEl = document.querySelector('#push-retry');
const pushTargetEl = document.querySelector('#push-target');
const pushTargetRowEl = document.querySelector('.push-target-row');
const pushTargetSwitchEl = document.querySelector('#push-target-switch');
let pushRegistration = null;
let pushApplicationKey = null;
const pushEnabledKey = 'bus-tracker-push-enabled';
const pushEndpointKey = 'bus-tracker-push-endpoint';
const pushPendingRemoveKey = 'bus-tracker-push-pending-remove';
const pushRevisionKey = 'bus-tracker-push-revision';
const pushTargetKey = 'bus-tracker-push-target';
let pushTarget = null;
try {
  const saved = JSON.parse(localStorage.getItem(pushTargetKey) || 'null');
  if (saved && Number.isInteger(saved.routeId) && saved.routeId > 0 &&
      [0, 1].includes(saved.direction) && Number.isInteger(saved.stopId) && saved.stopId > 0 &&
      Number.isInteger(saved.walkMinutes) && saved.walkMinutes >= 0 && saved.walkMinutes <= 60)
    pushTarget = saved;
} catch (_) { /* Ignore damaged browser storage. */ }
function nextPushRevision() {
  const next = Math.max(Date.now() * 1000, (Number(localStorage.getItem(pushRevisionKey)) || 0) + 1);
  localStorage.setItem(pushRevisionKey, String(next));
  return next;
}
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
    const response = await request('api/push-subscription', {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload), signal: controller.signal});
    if (response.applied === false) throw new Error('此裝置已有更新的提醒設定，請重試');
    return response;
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
  return Math.max(0, Math.min(60, Math.round((locationWalkMinutes ?? Number(manualWalkMinutes)) || 0)));
}
function planBufferMinutes() {
  return Math.max(0, Math.min(30, Math.round(Number(planBufferEl.value) || 0)));
}
function selectedPushTarget() {
  const station = stops.find(item => item.direction === Number(directionEl.value) &&
    String(item.id) === String(stopEl.value));
  if (!station) return null;
  return {routeId: activeRoute, routeName: routes[activeRoute]?.name || String(activeRoute),
    direction: Number(station.direction), stopId: Number(station.id), stopName: station.name,
    closedLoop: closedEl.checked || Boolean(trackAdviceOnlyEl.checked && trackedBusId()), walkMinutes: currentWalkMinutes(),
    trackedBusId: trackAdviceOnlyEl.checked ? trackedBusId() : ''};
}
function pushTargetMatchesSelection() {
  return pushTarget && pushTarget.routeId === activeRoute &&
    pushTarget.direction === Number(directionEl.value) &&
    String(pushTarget.stopId) === String(stopEl.value);
}
function savePushTarget(target) {
  pushTarget = target;
  localStorage.setItem(pushTargetKey, JSON.stringify(target));
  renderPushTarget();
}
function pushFilterLabel(target) { return target?.trackedBusId ? `只追蹤 ${target.trackedBusId}` : '本站所有符合條件來車'; }
const PLAN_DEPARTURE_KEY = 'aheadway-plan-departure-v1';
const PLAN_MATCH_CONTEXT_KEY = 'aheadway-plan-match-context-v1';
const PLAN_NOTIFIED_KEY = 'aheadway-plan-notified-v1';
const planDateFieldEl = document.querySelector('#plan-date-field');
const planTimerFieldEl = document.querySelector('#plan-timer-field');
const planDateEl = document.querySelector('#plan-departure-date');
const planClockEl = document.querySelector('#plan-departure-clock');
const planTimerHoursEl = document.querySelector('#plan-timer-hours');
const planTimerMinutesEl = document.querySelector('#plan-timer-minutes');
const planStatusEl = document.querySelector('#plan-time-status');
const planMatchStatusEl = document.querySelector('#plan-match-status');
const planMatchResultEl = document.querySelector('#plan-match-result');
const planMatchHeadEl = document.querySelector('#plan-match-head');
const planMatchToastEl = document.querySelector('#plan-match-toast');
const planSetEl = document.querySelector('#plan-time-set');
const planActionLabelEl = planSetEl.querySelector('.plan-action-label');
const planPurposeLeaveEl = document.querySelector('#plan-purpose-leave');
const planPurposeArriveEl = document.querySelector('#plan-purpose-arrive');
const planPurposeHelpEl = document.querySelector('#plan-purpose-help');
const planDateLabelEl = document.querySelector('#plan-date-label');
const planClockLabelEl = document.querySelector('#plan-clock-label');
const planAlternativesEl = document.querySelector('#plan-alternatives');
const planAlternativesDetailEl = document.querySelector('#plan-alternatives-detail');
const planAlternativeActionsEl = document.querySelector('#plan-alternative-actions');
const planEarlierOptionEl = document.querySelector('#plan-earlier-option');
const planLaterOptionEl = document.querySelector('#plan-later-option');
let recommendedLeaveAt = null;
let planDepartureAt = Number(localStorage.getItem(PLAN_DEPARTURE_KEY)) || null;
let planMatchContext = null;
try { planMatchContext = JSON.parse(localStorage.getItem(PLAN_MATCH_CONTEXT_KEY) || 'null'); } catch (_) {}
let planPermissionPending = false;
let planInputMode = 'datetime';
let planTimePurpose = planMatchContext?.timePurpose === 'arrive' ? 'arrive' : 'leave';
const planText = (zh, en) => uiI18n?.language === 'en' ? en : zh;
function setPlanMatchStatus(level, heading, detail) {
  planMatchResultEl.hidden = !heading && !detail;
  planMatchResultEl.dataset.level = level;
  planMatchHeadEl.textContent = heading;
  planMatchStatusEl.textContent = detail;
}
function savedPlanPurpose() {
  return planMatchContext?.timePurpose === 'arrive' ? 'arrive' : 'leave';
}
function planPurposeLabel(purpose = planDepartureAt && planMatchContext ? savedPlanPurpose() : planTimePurpose) {
  return purpose === 'arrive'
    ? planText('預計到達站牌時間', 'Planned arrival at stop')
    : planText('離開去搭車時間', 'Time to leave for the bus');
}
function renderPlanPurpose() {
  planPurposeLeaveEl.setAttribute('aria-pressed', String(planTimePurpose === 'leave'));
  planPurposeArriveEl.setAttribute('aria-pressed', String(planTimePurpose === 'arrive'));
  const arriving = planTimePurpose === 'arrive';
  const buffer = planBufferMinutes();
  const walk = currentWalkMinutes();
  planPurposeHelpEl.textContent = arriving
    ? planText(`目前：到站時間 · 再預留 ${buffer} 分鐘緩衝，不重複計算走路時間。`,
      `Selected: arrival time · adds ${buffer} min buffer without counting walking again.`)
    : planText(`目前：離開時間 · 加上走路 ${walk} 分鐘與緩衝 ${buffer} 分鐘後開始配對來車。`,
      `Selected: leave time · matching starts after ${walk} min walking and ${buffer} min buffer.`);
  planDateLabelEl.textContent = arriving ? planText('到站日期', 'Arrival date') : planText('離開日期', 'Leave date');
  planClockLabelEl.textContent = arriving ? planText('到站時間', 'Arrival time') : planText('離開時間', 'Leave time');
}
function renderPlanDepartureStatus() {
  planSetEl.setAttribute('aria-pressed', String(Boolean(planDepartureAt)));
  planActionLabelEl.textContent = planDepartureAt
    ? planText('取消計畫時間', 'Cancel plan time')
    : planText('設定計畫時間', 'Set plan time');
  if (!planDepartureAt) {
    planStatusEl.textContent = planText('尚未設定計畫時間。', 'No plan time set.');
    return;
  }
  const remaining = planDepartureAt - Date.now();
  const date = new Date(planDepartureAt);
  const when = date.toLocaleString(uiI18n?.language === 'en' ? 'en-US' : 'zh-TW',
    {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false});
  if (remaining <= 0) {
    planStatusEl.textContent = `${planPurposeLabel()}${planText('已到', ' has arrived')}（${when}）。`;
    return;
  }
  const minutes = Math.ceil(remaining / 60000);
  const countdown = `${String(Math.floor(minutes / 60)).padStart(2,'0')}:${String(minutes % 60).padStart(2,'0')}`;
  let comparison = '';
  if (savedPlanPurpose() === 'leave' && recommendedLeaveAt !== null) {
    const difference = Math.ceil((planDepartureAt - recommendedLeaveAt) / 60000);
    comparison = difference > 0
      ? planText(`；比建議時間晚約 ${difference} 分鐘`, `; about ${difference} min later than advised`)
      : planText('；不晚於建議時間', '; no later than advised');
  }
  planStatusEl.textContent = `${planPurposeLabel()}：${when}，${planText('倒數', 'countdown')} ${countdown}${comparison}。`;
}
function localDateValue(date) {
  const part = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}`;
}
function localTimeValue(date) {
  const part = number => String(number).padStart(2, '0');
  return `${part(date.getHours())}:${part(date.getMinutes())}`;
}
const initialPlanTime = planDepartureAt && planDepartureAt > Date.now()
  ? new Date(planDepartureAt) : new Date(Date.now() + 60 * 60000);
planDateEl.min = localDateValue(new Date());
planDateEl.value = localDateValue(initialPlanTime);
planClockEl.value = localTimeValue(initialPlanTime);
function parsePlanDate() {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(planDateEl.value);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(planClockEl.value);
  if (!dateMatch || !timeMatch) return null;
  const year = Number(dateMatch[1]), month = Number(dateMatch[2]), day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]), minute = Number(timeMatch[2]);
  const candidate = new Date(year, month - 1, day, hour, minute);
  return candidate.getFullYear() === year && candidate.getMonth() === month - 1 &&
    candidate.getDate() === day && candidate.getHours() === hour &&
    candidate.getMinutes() === minute && candidate.getTime() > Date.now()
    ? candidate.getTime() : null;
}
function parsePlanTimer() {
  const hours = Number(planTimerHoursEl.value), minutes = Number(planTimerMinutesEl.value);
  if (!planTimerHoursEl.value || !planTimerMinutesEl.value ||
      !Number.isInteger(hours) || !Number.isInteger(minutes) ||
      hours < 0 || hours > 99 || minutes < 0 || minutes > 59 || hours * 60 + minutes === 0) return null;
  return Date.now() + (hours * 60 + minutes) * 60000;
}
document.querySelectorAll('[data-plan-adjust]').forEach(button => button.addEventListener('click', () => {
  const [unit, amountText] = button.dataset.planAdjust.split(':');
  const amount = Number(amountText);
  let hours = Math.min(99, Math.max(0, Number(planTimerHoursEl.value) || 0));
  let minutes = Math.min(59, Math.max(0, Number(planTimerMinutesEl.value) || 0));
  if (unit === 'hours') hours = Math.min(99, Math.max(0, hours + amount));
  else {
    const total = Math.min(99 * 60 + 59, Math.max(0, hours * 60 + minutes + amount));
    hours = Math.floor(total / 60);
    minutes = total % 60;
  }
  planTimerHoursEl.value = String(hours).padStart(2, '0');
  planTimerMinutesEl.value = String(minutes).padStart(2, '0');
}));
for (const input of [planTimerHoursEl, planTimerMinutesEl]) input.addEventListener('change', () => {
  if (input.value !== '' && input.validity.valid) input.value = String(Number(input.value)).padStart(2, '0');
});
function setPlanInputMode(mode) {
  planInputMode = mode;
  document.querySelectorAll('[data-plan-time-mode]').forEach(option =>
    option.setAttribute('aria-pressed', String(option.dataset.planTimeMode === mode)));
  planDateFieldEl.hidden = planInputMode !== 'datetime';
  planTimerFieldEl.hidden = planInputMode !== 'timer';
}
document.querySelectorAll('[data-plan-time-mode]').forEach(button => button.addEventListener('click', () =>
  setPlanInputMode(button.dataset.planTimeMode)));
function setPlanPurpose(purpose) {
  planTimePurpose = purpose === 'arrive' ? 'arrive' : 'leave';
  renderPlanPurpose();
  renderPlanDepartureStatus();
}
planPurposeLeaveEl.addEventListener('click', () => setPlanPurpose('leave'));
planPurposeArriveEl.addEventListener('click', () => setPlanPurpose('arrive'));
renderPlanPurpose();
planSetEl.addEventListener('click', () => {
  if (planDepartureAt) {
    planDepartureAt = null;
    planMatchContext = null;
    localStorage.removeItem(PLAN_DEPARTURE_KEY);
    localStorage.removeItem(PLAN_MATCH_CONTEXT_KEY);
    localStorage.removeItem(PLAN_NOTIFIED_KEY);
    planMatchToastEl.hidden = true;
    setPlanMatchStatus('waiting', '', '');
    planAlternativesEl.hidden = true;
    renderPlanDepartureStatus();
    return;
  }
  const value = planInputMode === 'datetime' ? parsePlanDate() : parsePlanTimer();
  if (!value) {
    planStatusEl.textContent = planInputMode === 'datetime'
      ? planText('請選擇未來的日期與時間。', 'Choose a future date and time.')
      : planText('請輸入有效的 HH:MM 倒數時間。', 'Enter a valid HH:MM countdown.');
    (planInputMode === 'datetime' ? planDateEl : planTimerHoursEl).focus();
    return;
  }
  if (!activeRoute || !stopEl.value) {
    setPlanMatchStatus('waiting', planText('請先選擇站牌', 'Choose a stop'),
      planText('請先選擇路線與上車站牌。', 'Choose a route and boarding stop first.'));
    return;
  }
  planDepartureAt = value;
  planMatchContext = {routeId: activeRoute, direction: Number(directionEl.value), stopId: String(stopEl.value),
    timePurpose: planTimePurpose,
    walkMinutes: currentWalkMinutes(), bufferMinutes: planBufferMinutes(),
    referenceReturn: travelReturnReferenceEl.checked, trackedBusId: trackedBusId(),
    trackOnly: trackAdviceOnlyEl.checked && Boolean(trackedBusId())};
  localStorage.setItem(PLAN_DEPARTURE_KEY, String(value));
  localStorage.setItem(PLAN_MATCH_CONTEXT_KEY, JSON.stringify(planMatchContext));
  localStorage.removeItem(PLAN_NOTIFIED_KEY);
  renderPlanDepartureStatus();
  planPermissionPending = window.isSecureContext && window.Notification?.permission === 'default';
  if (planPermissionPending) {
    Promise.resolve(window.Notification.requestPermission()).catch(() => {}).finally(() => {
      planPermissionPending = false;
      refreshPlanMatch();
    });
  } else refreshPlanMatch();
});
window.addEventListener('aheadway:languagechange', () => {
  renderPlanPurpose();
  renderPlanDepartureStatus();
});
setInterval(renderPlanDepartureStatus, 30000);
setInterval(refreshPlanMatch, 30000);
renderPlanDepartureStatus();
queueMicrotask(refreshPlanMatch);
function renderMobileReminderSummary() {
  const mode = mobileMode === 'plan' ? '計畫模式' : '前往站牌模式';
  let notification = '背景通知未啟用';
  if (localStorage.getItem(pushPendingRemoveKey) === '1') notification = '正在關閉通知';
  else if (!pushRetryEl.hidden) notification = '通知同步需重試';
  else if (localStorage.getItem(pushEnabledKey) === '1' && pushTarget)
    notification = `通知：${pushTarget.routeName || pushTarget.routeId} ${pushTarget.stopName || ''} · ${pushFilterLabel(pushTarget)}`;
  else if (pushToggleEl.disabled) notification = '背景通知不可用';
  mobileModeSummaryEl.textContent = publicMode && phoneViewport?.matches ? `${mode} / ${notification}` : mode;
}
function renderPushTarget() {
  pushTargetRowEl.hidden = !pushTarget || localStorage.getItem(pushEnabledKey) !== '1';
  pushTargetEl.textContent = pushTarget
    ? `提醒目標：${pushTarget.routeName || pushTarget.routeId}・${pushTarget.stopName || `站牌 ${pushTarget.stopId}`} · ${pushFilterLabel(pushTarget)} · 步行 ${pushTarget.walkMinutes} 分鐘` +
      (!addedRouteIds.includes(pushTarget.routeId)
        ? '（此路線分頁已移除，通知仍會發送）' : '')
    : '尚未啟用；啟用後會固定目前選擇的站牌。';
  pushTargetSwitchEl.hidden = !pushTarget || !selectedPushTarget() || Boolean(pushTargetMatchesSelection()) ||
    localStorage.getItem(pushEnabledKey) !== '1';
  renderMobileReminderSummary();
}
function pushPayload(subscription, revision, target = pushTarget) {
  return {action: 'save', subscription: subscription.toJSON(), route_id: target.routeId,
    direction: target.direction, stop_id: target.stopId,
    closed_loop: target.closedLoop, walk_minutes: target.walkMinutes,
    tracked_bus_id: target.trackedBusId || '', revision};
}
function syncPushSettings(force = false) {
  if (!publicMode || localStorage.getItem(pushEnabledKey) !== '1') return;
  if (!pushTarget) {
    const selected = selectedPushTarget();
    if (!selected) return;
    savePushTarget(selected); // Migrate an existing subscription to an explicit target.
  }
  if (pushTargetMatchesSelection()) {
    const walkMinutes = currentWalkMinutes();
    const trackedBusId = trackAdviceOnlyEl.checked ? window.localStorage.getItem(trackedBusKey()) || '' : '';
    const closedLoop = closedEl.checked || Boolean(trackedBusId);
    if (pushTarget.walkMinutes !== walkMinutes || pushTarget.closedLoop !== closedLoop ||
        (pushTarget.trackedBusId || '') !== trackedBusId)
      savePushTarget({...pushTarget, walkMinutes, closedLoop, trackedBusId});
  } else if (!force) {
    renderPushTarget();
    return;
  }
  const revision = ++pushSyncRevision;
  const serverRevision = nextPushRevision();
  pushSyncAbort?.abort();
  pushRetryEl.hidden = true;
  pushStateEl.textContent = '正在同步固定站牌的手機提醒…';
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
      pushTarget = null;
      localStorage.removeItem(pushTargetKey);
      renderPushTarget();
      return;
    }
    localStorage.setItem(pushEndpointKey, subscription.endpoint);
    const controller = new AbortController();
    pushSyncAbort = controller;
    await postPush(pushPayload(subscription, serverRevision), controller);
    if (revision !== pushSyncRevision) return;
      pushStateEl.textContent = '已啟用；關閉頁面仍可通知。';
    pushRetryEl.hidden = true;
    pushToggleEl.textContent = '關閉手機通知';
    renderMobileReminderSummary();
    } catch (error) { if (revision === pushSyncRevision) {
      pushStateEl.textContent = `同步失敗：${error.message}。手機可能仍追蹤上次成功設定的站牌。`;
      pushRetryEl.hidden = false;
      renderMobileReminderSummary();
    } }
    finally { if (revision === pushSyncRevision) pushSyncAbort = null; }
  });
  return pushSyncChain;
}
pushRetryEl.addEventListener('click', () => syncPushSettings(true));
pushTargetSwitchEl.addEventListener('click', () => {
  const target = selectedPushTarget();
  if (!target || localStorage.getItem(pushEnabledKey) !== '1') return;
  savePushTarget(target);
  return syncPushSettings();
});
renderPushTarget();

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
      pushRetryEl.hidden = true;
      pushStateEl.textContent = '正在關閉手機通知…';
      const endpoint = localStorage.getItem(pushEndpointKey);
      const subscription = endpoint ? null : await currentPushSubscription();
      const removeEndpoint = endpoint || subscription?.endpoint;
      if (removeEndpoint) {
        await postPush({action: 'remove', subscription: {endpoint: removeEndpoint},
          revision: nextPushRevision()});
      }
      localStorage.removeItem(pushPendingRemoveKey);
      localStorage.removeItem(pushEndpointKey);
      localStorage.removeItem(pushTargetKey);
      pushTarget = null;
      renderPushTarget();
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
    const target = selectedPushTarget();
    if (!target) throw new Error('請先選擇可追蹤站牌');
    // Begin subscription in the click's user gesture, as required by iOS web apps.
    const subscriptionPromise = pushRegistration.pushManager.subscribe({userVisibleOnly: true,
      applicationServerKey: pushApplicationKey});
    const subscription = await subscriptionPromise;
    const payload = pushPayload(subscription, nextPushRevision(), target);
    await postPush(payload);
    localStorage.setItem(pushEndpointKey, subscription.endpoint);
    localStorage.setItem(pushEnabledKey, '1');
    savePushTarget(target);
    button.textContent = '關閉手機通知';
    pushStateEl.textContent = '已啟用；關閉頁面仍可通知。';
    if (pushTargetMatchesSelection() && (target.walkMinutes !== currentWalkMinutes() ||
        target.closedLoop !== (closedEl.checked || Boolean(trackAdviceOnlyEl.checked && trackedBusId())) ||
        target.trackedBusId !== (trackAdviceOnlyEl.checked ? trackedBusId() : ''))) syncPushSettings();
  } catch (error) {
    if (localStorage.getItem(pushPendingRemoveKey) === '1') {
      button.textContent = '重試關閉手機通知';
      pushStateEl.textContent = `關閉未完成，請重試：${error.message}`;
    } else pushStateEl.textContent = `無法啟用通知：${error.message}`;
  }
  finally { button.disabled = false; renderMobileReminderSummary(); }
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

function hasSelectedStop() {
  return Boolean(activeRoute && stops.some(item =>
    Number(item.direction) === Number(directionEl.value) && String(item.id) === String(stopEl.value)));
}

const textSizeStorageKey = 'aheadway-large-text';
let largeTextEnabled = false;
try { largeTextEnabled = localStorage.getItem(textSizeStorageKey) === '1'; } catch (_) {}
function syncTextSizeControl() {
  document.body.classList.toggle('large-text', largeTextEnabled);
  textSizeToggleEl.setAttribute('aria-pressed', String(largeTextEnabled));
  const label = largeTextEnabled
    ? (uiI18n?.language === 'en' ? 'Use standard text size' : '恢復標準字體')
    : (uiI18n?.language === 'en' ? 'Use larger text' : '放大文字');
  textSizeToggleEl.setAttribute('aria-label', label);
  textSizeToggleEl.title = label;
}
textSizeToggleEl.addEventListener('click', () => {
  largeTextEnabled = !largeTextEnabled;
  try { localStorage.setItem(textSizeStorageKey, largeTextEnabled ? '1' : '0'); } catch (_) {}
  syncTextSizeControl();
  if (activeRoute) renderRouteMap(latestSnapshot);
});
window.addEventListener('aheadway:languagechange', syncTextSizeControl);
syncTextSizeControl();

let currentLiveStatus = 'idle';
function setLiveStatus(state) {
  if (!hasSelectedStop()) state = 'idle';
  currentLiveStatus = state;
  const english = uiI18n?.language === 'en';
  const labels = {
    idle: activeRoute ? (english ? 'Choose a stop' : '選擇站牌') : (english ? 'Add a route' : '先加入路線'),
    updating: english ? 'Updating' : '更新中',
    live: english ? 'Live data' : '即時資料',
    stale: english ? 'Data may be stale' : '資料可能過時',
    error: english ? 'Data unavailable' : '資料暫不可用'
  };
  const label = labels[state] || labels.error;
  const compactLabels = english
    ? {idle: activeRoute ? 'Stop' : 'Add', updating: 'Sync', live: 'Live', stale: 'Stale', error: 'Offline'}
    : {idle: activeRoute ? '選站' : '加路線', updating: '更新', live: '即時', stale: '過時', error: '無資料'};
  if (liveStatusTextEl.textContent !== label) liveStatusTextEl.textContent = label;
  liveStatusEl.dataset.short = compactLabels[state] || compactLabels.error;
  liveStatusEl.dataset.state = state;
  liveStatusEl.setAttribute('aria-label', label);
}
window.addEventListener('aheadway:languagechange', () => setLiveStatus(currentLiveStatus));
setLiveStatus('idle');

async function request(url, options = {}) {
  const response = await fetch(url, {cache: 'no-store', ...options});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '資料無法取得');
  return data;
}

function englishRouteName(name, nameEn) {
  const source = String(nameEn || '').trim();
  const shuttle = source.match(/^(\d+)\s*shuttle$/i);
  return shuttle ? `${shuttle[1]} Shuttle` : source || `Route ${name}`;
}

function rememberRoute(meta) {
  const englishName = englishRouteName(meta.name, meta.nameEn);
  uiI18n?.registerNames([[meta.name, englishName], ...(meta.heads || []).map((head, i) => [head, meta.headsEn?.[i]])]);
  routes[meta.id] = {name: meta.name, spoken: meta.spoken || meta.name,
    english: englishName, heads: meta.heads,
    headsEn: meta.headsEn, source: meta.source,
    terminalDirection: meta.terminalDirection, turnaroundStop: meta.turnaroundStop};
}

function updateRouteTabActionLabels() {
  const english = uiI18n?.language === 'en';
  for (const tab of routeTabs) {
    const route = routes[Number(tab.dataset.route)];
    const name = english ? (route?.name === '橘5' ? 'Orange 5' : route?.english || route?.name || tab.textContent) : (route?.name || tab.textContent);
    const selected = Number(tab.dataset.route) === activeRoute;
    const action = selected
      ? (english ? 'Current route' : '目前路線')
      : (english ? 'Switch to route' : '切換至路線');
    tab.removeAttribute('aria-controls');
    tab.removeAttribute('aria-expanded');
    tab.setAttribute('aria-label', `${action} ${name}`);
    tab.title = `${action} ${name}`;
  }
}
window.addEventListener('aheadway:languagechange', updateRouteTabActionLabels);

function bindHoldToReorder(handle, item, container, selector, commit, suppressClick) {
  let timer = null, active = false, pointerId = null, ghost = null;
  let startX = 0, startY = 0, lastX = 0, lastY = 0, originalOrder = [];
  const children = () => [...container.children].filter(child => child.matches(selector));
  const clearTimer = () => { clearTimeout(timer); timer = null; };
  const placeGhost = () => {
    if (!ghost) return;
    ghost.style.left = `${lastX}px`;
    ghost.style.top = `${lastY}px`;
  };
  const removeListeners = () => {
    window.removeEventListener('pointermove', move, true);
    window.removeEventListener('pointerup', end, true);
    window.removeEventListener('pointercancel', cancel, true);
  };
  const finish = cancelled => {
    clearTimer();
    removeListeners();
    if (active) {
      suppressClick();
      if (cancelled) originalOrder.forEach(child => container.append(child));
      item.classList.remove('is-reordering');
      ghost?.remove();
      if (!cancelled && children().some((child, index) => child !== originalOrder[index])) commit();
    }
    active = false;
    pointerId = null;
    ghost = null;
  };
  function move(event) {
    if (event.pointerId !== pointerId) return;
    lastX = event.clientX; lastY = event.clientY;
    if (!active) {
      if (Math.hypot(lastX - startX, lastY - startY) > 10) clearTimer();
      return;
    }
    if (event.cancelable) event.preventDefault();
    placeGhost();
    const target = document.elementFromPoint(lastX, lastY)?.closest(selector);
    if (target && target !== item && target.parentElement === container) {
      const order = children();
      if (order.indexOf(item) < order.indexOf(target)) target.after(item);
      else target.before(item);
    }
    if (container === routeTabsEl) {
      const bounds = container.getBoundingClientRect();
      if (lastX < bounds.left + 28) container.scrollLeft -= 14;
      else if (lastX > bounds.right - 28) container.scrollLeft += 14;
    }
  }
  function end(event) { if (event.pointerId === pointerId) finish(false); }
  function cancel(event) { if (event.pointerId === pointerId) finish(true); }
  handle.addEventListener('pointerdown', event => {
    if (pointerId !== null || event.button !== 0 || handle.disabled) return;
    pointerId = event.pointerId;
    startX = lastX = event.clientX;
    startY = lastY = event.clientY;
    originalOrder = children();
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', cancel, true);
    timer = setTimeout(() => {
      if (!item.isConnected) return finish(true);
      active = true;
      suppressClick();
      item.classList.add('is-reordering');
      ghost = document.createElement('div');
      ghost.className = 'route-drag-ghost';
      ghost.textContent = handle.textContent;
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.minWidth = `${Math.min(handle.getBoundingClientRect().width, 230)}px`;
      document.body.append(ghost);
      placeGhost();
    }, 550);
  });
  handle.addEventListener('contextmenu', event => event.preventDefault());
}

function announceRouteOrder() {
  document.querySelector('#route-order-status').textContent = uiI18n?.language === 'en'
    ? 'Route order updated.' : '路線順序已更新。';
}

function persistRouteTabOrder() {
  routeTabs = [...routeTabsEl.querySelectorAll('[role="tab"]')];
  addedRouteIds = routeTabs.map(tab => Number(tab.dataset.route));
  localStorage.setItem('bus-tracker-added-routes', JSON.stringify(addedRouteIds));
  updateRouteOverflow();
  announceRouteOrder();
}

function bindRouteTab(tab) {
  let suppressClickUntil = 0;
  bindHoldToReorder(tab, tab, routeTabsEl, '[role="tab"]', persistRouteTabOrder,
    () => { suppressClickUntil = Date.now() + 1000; });
  tab.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); return; }
    const routeId = Number(tab.dataset.route);
    if (routeId !== activeRoute) {
      selectionCardEl.open = false;
      switchRoute(routeId);
    }
  });
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = routeTabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? routeTabs.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + routeTabs.length) % routeTabs.length;
    routeTabs[next].focus();
    if (routeTabs[next] !== tab) routeTabs[next].click();
  });
}

function updateRouteOverflow() {
  if (!routeTabsEl.clientWidth) return;
  const shell = routeTabsEl.parentElement;
  const shellStyle = window.getComputedStyle(shell);
  const tabStyle = window.getComputedStyle(routeTabsEl);
  const shellGap = parseFloat(shellStyle.columnGap) || 0;
  const tabGap = parseFloat(tabStyle.columnGap) || 0;
  const tabWidth = routeTabs.reduce((width, tab) => width + tab.getBoundingClientRect().width, 0) +
    Math.max(0, routeTabs.length - 1) * tabGap;
  const padding = (parseFloat(shellStyle.paddingLeft) || 0) + (parseFloat(shellStyle.paddingRight) || 0);
  const controlsWidth = controls => controls.reduce((sum, control) => sum + control.offsetWidth, 0) +
    shellGap * controls.length;
  const fixedControls = [routeRemoveEl, routeAddEl, disclosureToggleEl].filter(control => control && !control.hidden);
  const availableWithoutArrows = shell.clientWidth - padding - controlsWidth(fixedControls);
  const overflow = tabWidth > availableWithoutArrows + 2;
  routeBackEl.hidden = !overflow;
  routeMoreEl.hidden = !overflow;
  const visibleControls = overflow ? [routeBackEl, routeMoreEl, ...fixedControls] : fixedControls;
  const spaceForTabs = shell.clientWidth - padding - controlsWidth(visibleControls);
  routeTabsEl.style.flexBasis = `${Math.max(0, spaceForTabs)}px`;
  if (!overflow) routeTabsEl.scrollLeft = 0;
  const atStart = routeTabsEl.scrollLeft <= 2;
  const atEnd = routeTabsEl.scrollLeft + routeTabsEl.clientWidth >= routeTabsEl.scrollWidth - 3;
  routeBackEl.disabled = !overflow || atStart;
  routeMoreEl.disabled = !overflow || atEnd;
}
function keepActiveRouteTabVisible() {
  const selected = routeTabs.find(tab => Number(tab.dataset.route) === activeRoute);
  if (!selected || !routeTabsEl.clientWidth) return;
  const tabBounds = selected.getBoundingClientRect();
  const listBounds = routeTabsEl.getBoundingClientRect();
  if (tabBounds.left < listBounds.left) routeTabsEl.scrollLeft -= listBounds.left - tabBounds.left;
  else if (tabBounds.right > listBounds.right) routeTabsEl.scrollLeft += tabBounds.right - listBounds.right;
}
routeTabsEl.addEventListener('scroll', updateRouteOverflow);
routeBackEl.addEventListener('click', () => {
  routeTabsEl.scrollBy({left: -Math.max(180, routeTabsEl.clientWidth * .7), behavior: 'smooth'});
});
routeMoreEl.addEventListener('click', () => {
  routeTabsEl.scrollBy({left: Math.max(180, routeTabsEl.clientWidth * .7), behavior: 'smooth'});
});
function refreshRouteTabLayout() {
  updateRouteOverflow();
  requestAnimationFrame(keepActiveRouteTabVisible);
}
if (window.addEventListener) window.addEventListener('resize', refreshRouteTabLayout);
window.addEventListener('aheadway:languagechange', refreshRouteTabLayout);

function renderRouteTabs() {
  const tablist = document.querySelector('.route-tabs');
  const ids = addedRouteIds.filter(id => routes[id]);
  for (const id of ids) {
    if (routeTabs.some(tab => Number(tab.dataset.route) === id)) continue;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.dataset.route = String(id);
    tab.textContent = routes[id].name;
    tablist.append(tab);
    routeTabs.push(tab);
    bindRouteTab(tab);
  }
  for (const tab of [...routeTabs]) {
    if (ids.includes(Number(tab.dataset.route))) {
      tab.textContent = routes[Number(tab.dataset.route)]?.name || tab.textContent;
    } else {
      tab.remove();
      routeTabs.splice(routeTabs.indexOf(tab), 1);
    }
  }
  setEmptyRouteState();
  routeRemoveEl.hidden = !activeRoute || !addedRouteIds.includes(activeRoute);
  if (!routeRemoveEl.hidden) setRouteRemoveLabel(routes[activeRoute]);
  updateRouteOverflow();
}

async function hydrateSavedTripStopNames() {
  const routeIds = [...new Set(savedTrips.filter(trip => !trip.stopNameEn).map(trip => trip.routeId))];
  await Promise.all(routeIds.map(async routeId => {
    try {
      const routeStops = await request(`api/stops?route_id=${routeId}`);
      uiI18n?.registerNames(routeStops.map(stop => [stop.name, stop.nameEn]));
      for (const trip of savedTrips) {
        if (trip.routeId !== routeId) continue;
        const matched = routeStops.find(stop => stop.direction === trip.direction &&
          String(stop.id) === String(trip.stopId));
        if (matched) {
          trip.stopName = matched.name;
          trip.stopNameEn = matched.nameEn || trip.stopNameEn;
        }
      }
      localStorage.setItem('bus-tracker-saved-trips', JSON.stringify(savedTrips));
    } catch (_) { /* Keep the locally saved stop name if the route feed is unavailable. */ }
  }));
  renderSavedTrips();
}

async function hydrateRoutes() {
  const ids = [...new Set([...addedRouteIds, ...savedTrips.map(trip => trip.routeId)])];
  if (!ids.length) { renderRouteTabs(); renderSavedTrips(); return; }
  try {
    const found = await request(`api/routes?ids=${ids.join(',')}`);
    for (const meta of found) rememberRoute(meta);
    renderRouteTabs();
    renderSavedTrips();
    const selected = addedRouteIds.includes(requestedRoute) && routes[requestedRoute]
      ? requestedRoute : addedRouteIds.find(id => routes[id]);
    if (selected) switchRoute(selected);
    else if (addedRouteIds.length) routePickerStatusEl.textContent = '儲存的路線暫時無法載入；請稍後重新整理。';
  } catch (_) {
    routePickerStatusEl.textContent = '路線資料暫時無法載入；已保留偏好，重新開啟頁面可重試。';
    renderRouteTabs();
    const fallback = addedRouteIds.find(id => routes[id]);
    if (fallback) switchRoute(fallback);
    else document.body.classList.add('no-route');
  }
}

function renderCatalogMatches(results) {
  routeResultsEl.replaceChildren();
  for (const meta of results) {
      const button = document.createElement('button'); button.type = 'button';
      button.dataset.noI18n = '';
      const english = uiI18n?.language === 'en';
      button.textContent = english ? (meta.nameEn || meta.name) : meta.name;
      const detail = document.createElement('span');
      detail.textContent = `${english ? meta.name : (meta.nameEn || meta.name)} · ` +
        `${(english ? (meta.headsEn || meta.heads) : meta.heads).join(' · ')} · ` +
        `${english ? (meta.source === 'taipei' ? 'Taipei' : 'New Taipei') :
          (meta.source === 'taipei' ? '臺北市' : '新北市')}`;
      button.append(detail);
      button.addEventListener('click', () => {
        rememberRoute(meta);
        if (!addedRouteIds.includes(meta.id)) {
          if (addedRouteIds.length >= 20) {
            routePickerStatusEl.textContent = '最多可加入 20 條路線；請先移除一條已加入的路線。';
            return;
          }
          // A route being added needs an explicit stop choice, even if this
          // browser still has a stop from a route removed earlier.
          for (const direction of [0, 1]) {
            localStorage.removeItem(`bus-tracker-${meta.id}-stop-${direction}`);
            if (meta.id === 16405) localStorage.removeItem(`orange5-stop-${direction}`);
          }
          addedRouteIds.push(meta.id);
          localStorage.setItem('bus-tracker-added-routes', JSON.stringify(addedRouteIds));
        }
        renderRouteTabs();
        routePickerEl.open = false;
        switchRoute(meta.id);
      });
    routeResultsEl.append(button);
  }
}

async function searchRouteCatalog() {
  const version = ++catalogSearchVersion;
  const query = routeQueryEl.value.trim();
  catalogMatches = [];
  routeResultsEl.replaceChildren();
  if (!query) { routePickerStatusEl.textContent = '請輸入路線名稱或貼上官方路線連結。'; return; }
  routePickerStatusEl.textContent = '正在搜尋可追蹤路線…';
  try {
    const results = await request(`api/catalog?q=${encodeURIComponent(query)}`);
    if (version !== catalogSearchVersion) return;
    catalogMatches = results;
    routePickerStatusEl.textContent = results.length ? `找到 ${results.length} 條路線。` :
      '找不到符合的路線。請試另一種中文或英文寫法，或貼上官方 route.jsp 連結。';
    renderCatalogMatches(results);
  } catch (error) {
    if (version === catalogSearchVersion) routePickerStatusEl.textContent = `搜尋失敗：${error.message}`;
  }
}

function selectRouteStop(direction, id) {
  if (!stops.some(s => s.direction === direction && String(s.id) === String(id) && s.selectable !== false)) return false;
  directionEl.value = String(direction);
  setStops(false);
  stopEl.value = String(id);
  syncStopSelection();
  renderSelectionSummary();
  syncSavedTripCurrentState();
  resetAlertState();
  lastBriefingAt = 0;
  renderRoute();
  update({selected: true, fresh: true});
  return true;
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

function mapStopName(station) {
  return uiI18n?.language === 'en' && station.nameEn ? station.nameEn : station.name;
}

function mapLabelLayout(name, maxWidth, fontSize, weight = 700) {
  const context = document.createElement('canvas').getContext?.('2d');
  if (context) context.font = `${weight} ${fontSize}px Inter, "Noto Sans TC", system-ui, sans-serif`;
  const measure = value => context ? context.measureText(value).width :
    [...value].reduce((sum, char) => sum + (/[^\x00-\x7f]/.test(char) ? fontSize : fontSize * .65), 0);
  const lines = [];
  let line = '';
  for (const word of name.trim().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= maxWidth) { line = candidate; continue; }
    if (line) lines.push(line);
    line = '';
    for (const char of word) {
      if (line && measure(line + char) > maxWidth) { lines.push(line); line = ''; }
      line += char;
    }
  }
  if (line) lines.push(line);
  return {lines: lines.length ? lines : [name], width: Math.ceil(Math.max(...lines.map(measure), 0))};
}

function renderRouteMap(snapshot) {
  routeMapEl.replaceChildren();
  const selected = stops.find(s => s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value));
  mapSelectedStopNameEl.textContent = selected ? mapStopName(selected) :
    (uiI18n?.language === 'en' ? 'Choose a stop' : '選擇站牌');
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
      const terminal = station.name === routes[activeRoute]?.turnaroundStop;
      const dot = svgElement('circle', {
        class: 'map-stop',
        cx: p.x, cy: p.y, r: terminal && closedEl.checked ? 6 : 3,
        fill: '#fff',
        stroke: direction === 0 ? '#ed754d' : '#3a9873',
        'stroke-width': 2,
        style: station.selectable === false ? 'cursor:default;opacity:.4' : 'cursor:pointer'
      });
      const english = uiI18n?.language === 'en';
      const title = svgElement('title'); title.textContent = english
        ? `${direction === 0 ? 'Outbound' : 'Inbound'}: ${mapStopName(station)}`
        : `${direction === 0 ? '去程' : '返程'}：${station.name}`;
      dot.append(title);
      if (station.selectable !== false) dot.addEventListener('click', () => selectRouteStop(direction, station.id));
      routeMapEl.append(dot);
    });
  });
  const mapFontSize = largeTextEnabled ? 16 : 13;
  const mapLineHeight = largeTextEnabled ? 19 : 16;
  const labels = [[legs[0][0], -4, -13],
    [legs[0][legs[0].length - 1], 12, -13],
    [legs[1][legs[1].length - 1], 10, 20]];
  for (const [station, dx, dy] of labels) {
    if (!station || station === selected) continue;
    const p = point(station);
    const name = mapStopName(station);
    const layout = mapLabelLayout(name, 180, mapFontSize);
    const left = Math.max(8, Math.min(792 - layout.width, p.x + dx));
    const firstLineY = Math.max(mapFontSize + 3, Math.min(382 - (layout.lines.length - 1) * mapLineHeight, p.y + dy));
    const label = svgElement('text', {'data-no-i18n': '', fill: '#34493e',
      'font-size': mapFontSize, 'font-weight': 700, 'paint-order': 'stroke', stroke: '#f8faf7', 'stroke-width': 4});
    for (const [index, line] of layout.lines.entries()) {
      const span = svgElement('tspan', {x: left, y: firstLineY + index * mapLineHeight});
      span.textContent = line;
      label.append(span);
    }
    routeMapEl.append(label);
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
      const english = uiI18n?.language === 'en';
      const marker = svgElement('g', {class: 'map-bus-marker', role: 'img',
        'aria-label': english
          ? `${direction === 0 ? 'Outbound' : 'Inbound'} ${mapStopName(station)}: ${buses.length} ${buses.length === 1 ? 'bus' : 'buses'}, ${buses.map(b => b.id).join(', ')}`
          : `${direction === 0 ? '去程' : '返程'}${station.name}：${buses.length} 輛公車，${buses.map(b => b.id).join('、')}`});
      marker.append(svgElement('circle', {cx: x, cy: y, r: 15,
        fill: direction === 0 ? '#ed754d' : '#3a9873', stroke: '#fff', 'stroke-width': 3}));
      const label = svgElement('text', {x, y: y + 4.5, 'text-anchor': 'middle', fill: '#173d32',
        'font-size': largeTextEnabled ? 16 : 14, 'font-weight': 900});
      label.textContent = String(buses.length);
      marker.append(label);
      const title = svgElement('title'); title.textContent = buses.map(b => english
        ? `${b.id} · ${b.atStop ? 'arriving' : 'departed'}`
        : `${b.id} · ${b.atStop ? '進站中' : '已離站'}`).join(english ? ', ' : '、');
      marker.append(title);
      routeMapEl.append(marker);
    }
  }
  if (selected) {
    const p = point(selected);
    const name = mapStopName(selected);
    const selectedFontSize = largeTextEnabled ? 16 : 12;
    const layout = mapLabelLayout(name, 270, selectedFontSize, 800);
    const width = Math.max(60, layout.width + 22);
    const height = selectedFontSize + 5 + layout.lines.length * mapLineHeight;
    const left = Math.max(8, Math.min(792 - width, p.x - width / 2));
    const above = p.y > height + 24;
    const top = Math.max(8, Math.min(382 - height, above ? p.y - height - 16 : p.y + 18));
    const anchorX = Math.max(left + 12, Math.min(left + width - 12, p.x));
    const edgeY = above ? top + height : top;
    const pointer = svgElement('g', {class: 'selected-stop-pointer', role: 'img',
      'data-no-i18n': '',
      'aria-label': `${uiI18n?.language === 'en' ? 'Selected stop: ' : '目前選擇站牌：'}${name}`});
    pointer.append(svgElement('line', {x1: anchorX, y1: edgeY, x2: p.x, y2: p.y,
      stroke: '#3158a2', 'stroke-width': 2}));
    pointer.append(svgElement('circle', {cx: p.x, cy: p.y, r: 5, fill: '#fff',
      stroke: '#3158a2', 'stroke-width': 2.5}));
    pointer.append(svgElement('rect', {x: left, y: top, width, height, rx: 7,
      fill: '#fff', stroke: '#3158a2', 'stroke-width': 1.5}));
    const text = svgElement('text', {fill: '#254681', 'font-size': selectedFontSize, 'font-weight': 800});
    for (const [index, line] of layout.lines.entries()) {
      const span = svgElement('tspan', {x: left + 11, y: top + selectedFontSize + 8 + index * mapLineHeight});
      span.textContent = line;
      text.append(span);
    }
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
  const selectedName = stops.find(item => item.direction === Number(directionEl.value) && String(item.id) === String(stopEl.value))?.name || '所選站牌';
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
  uiI18n?.registerNames(stops.map(s => [s.name, s.nameEn]));
  let tripsUpdated = false;
  for (const trip of savedTrips) {
    if (trip.routeId !== activeRoute) continue;
    const matched = stops.find(s => s.direction === trip.direction && String(s.id) === String(trip.stopId));
    if (matched) {
      if (trip.stopName !== matched.name || trip.stopNameEn !== (matched.nameEn || trip.stopNameEn))
        tripsUpdated = true;
      trip.stopName = matched.name; trip.stopNameEn = matched.nameEn || trip.stopNameEn;
    }
  }
  if (tripsUpdated) localStorage.setItem('bus-tracker-saved-trips', JSON.stringify(savedTrips));
  renderSavedTrips();
  const available = stops.filter(s => s.direction === direction && s.selectable !== false);
  const previous = localStorage.getItem(routeStorage('stop-' + direction)) ??
    (activeRoute === 16405 ? localStorage.getItem('orange5-stop-' + direction) : null);
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '請選擇上車站牌';
  placeholder.disabled = true;
  stopEl.replaceChildren(placeholder, ...available.map(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.name;
    return option;
  }));
  renderScope();
  if (!available.length) {
    syncStopSelection();
    showError('這個方向目前沒有可上車的站牌資料。請選另一方向或稍後重試。');
    return;
  }
  if (available.some(s => String(s.id) === previous)) stopEl.value = previous;
  else stopEl.value = '';
  syncStopSelection();
  renderSelectionSummary();
  renderScope();
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
  updateRouteTabActionLabels();
  updateRouteOverflow();
  requestAnimationFrame(keepActiveRouteTabVisible);
  document.title = `${route.name} · AheadWay`;
  document.querySelector('.route-badge').textContent = route.name;
  document.querySelector('#hero-route-id').textContent = `${route.source === 'taipei' ? 'TAIPEI' : 'NEW TAIPEI'} · ROUTE ${activeRoute}`;
  document.querySelector('#route-heading').textContent = `${route.name} 路線`;
  syncRouteMapAccessibleName(route);
  const link = document.querySelector('#official-route-link');
  link.href = `https://pda5284.gov.taipei/MQS/route.jsp?rid=${activeRoute}`;
  link.textContent = `原始${route.name}路線`;
  directionEl.options[0].textContent = route.heads[0];
  directionEl.options[1].textContent = route.heads[1];
  renderStopDirection();
  renderSelectionSummary();
  routeRemoveEl.hidden = false;
  setRouteRemoveLabel(route);
  updateRouteOverflow();
  requestAnimationFrame(keepActiveRouteTabVisible);
  renderPushTarget();
  renderScope();
}

function syncRouteMapAccessibleName(route = routes[activeRoute]) {
  if (!route) return;
  const english = uiI18n?.language === 'en';
  routeMapEl.setAttribute('aria-label', english
    ? `${route.english} outbound and inbound stops map`
    : `${route.name}去程與返程站點位置示意圖`);
}
function renderSelectionSummary() {
  if (!selectionSummaryEl) return;
  const direction = Number(directionEl.value);
  const station = stops.find(item => item.direction === direction && String(item.id) === String(stopEl.value));
  const head = routes[activeRoute]?.heads[direction];
  selectionSummaryEl.textContent = [routes[activeRoute]?.name, head, station?.name || '選擇站牌']
    .filter(Boolean).join(' · ') || '選擇路線與站牌';
  window.dispatchEvent(new Event('aheadway:tripchange'));
}
function renderStopDirection() {
  document.querySelector('#stop-direction').textContent = routes[activeRoute]?.heads[Number(directionEl.value)] || '';
}

function syncStopSelection() {
  const chosen = hasSelectedStop();
  document.body.classList.toggle('awaiting-stop', Boolean(activeRoute) && !chosen);
  stopSelectionHintEl.hidden = !activeRoute || chosen;
  queryTripEl.disabled = !chosen;
  if (!chosen) setLiveStatus('idle');
  syncSaveTripAction();
  if (!chosen && activeRoute && stops.length) selectionCardEl.open = true;
  syncTrackingContext();
  syncDisclosureToggle();
}

function renderScope() {
  const selected = stops.find(item => item.direction === Number(directionEl.value) && String(item.id) === String(stopEl.value))?.name || '所選站牌';
  scopeEffectEl.textContent = closedEl.checked
    ? `將估算本方向及另一方向下一輪抵達${selected}的公車。`
    : `只列出本方向抵達${selected}的公車；已追蹤的車輛仍會納入出發建議。`;
  trackingContextEl.textContent = `${routes[activeRoute]?.name || ''} · ${routes[activeRoute]?.heads[Number(directionEl.value)] || ''} · ${selected} ↑`;
}
function syncTrackingContext() {
  const controls = document.querySelector('.controls');
  if (!activeRoute || document.body.classList.contains('no-route') || !stops.length || !stopEl.value) {
    trackingContextEl.hidden = true;
    return;
  }
  if (!controls.getBoundingClientRect || !window.matchMedia) return;
  const anchor = selectionCardEl.open ? controls : document.querySelector('.route-tabs-shell');
  trackingContextEl.hidden = !window.matchMedia('(max-width:650px)').matches ||
    anchor.getBoundingClientRect().bottom > 0;
}
trackingContextEl.addEventListener('click', () => {
  document.querySelector('#arrival-summary').open = true;
  selectionCardEl.open = true;
  selectionCardEl.scrollIntoView({behavior: 'smooth', block: 'start'});
});
function syncTripStopToggle() {
  const english = uiI18n?.language === 'en';
  const label = english ? 'Route and stop' : '路線與站牌';
  tripStopToggleEl.setAttribute('aria-expanded', String(selectionCardEl.open));
  tripStopToggleEl.setAttribute('aria-label', label);
  tripStopToggleEl.title = label;
}
tripStopToggleEl.addEventListener('click', () => {
  document.querySelector('#arrival-summary').open = true;
  selectionCardEl.open = !selectionCardEl.open;
  if (selectionCardEl.open) {
    document.querySelector('#display-settings').open = false;
    selectionCardEl.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  syncTripStopToggle();
});
selectionCardEl.addEventListener('toggle', () => {
  if (selectionCardEl.open) document.querySelector('#arrival-summary').open = true;
  syncTrackingContext();
  syncTripStopToggle();
});
window.addEventListener('aheadway:languagechange', syncTripStopToggle);
syncTripStopToggle();
if (window.addEventListener) {
  window.addEventListener('scroll', syncTrackingContext, {passive: true});
  window.addEventListener('resize', syncTrackingContext);
}

function savedTripKey(trip) {
  return `${trip.routeId}:${trip.direction}:${trip.stopId}`;
}

function syncSaveTripAction() {
  const button = document.querySelector('#save-trip');
  const station = stops.find(s => s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value));
  const saved = Boolean(station && savedTrips.some(item => item.routeId === activeRoute &&
    item.direction === station.direction && item.stopId === station.id && item.closedLoop === closedEl.checked));
  const english = uiI18n?.language === 'en';
  button.disabled = !station;
  button.classList.toggle('is-saved', saved);
  button.setAttribute('aria-pressed', String(saved));
  const label = saved ? (english ? 'Remove this saved route, direction, and stop' : '從常用行程移除目前路線、方向與站牌')
    : (english ? 'Save this route, direction, and boarding stop' : '儲存目前路線、方向與上車站牌為常用行程');
  button.title = label;
  button.setAttribute('aria-label', label);
}

function syncSavedTripCurrentState() {
  for (const group of savedTripsEl.querySelectorAll('.saved-trip')) {
    const trip = savedTrips.find(item => savedTripKey(item) === group.dataset.tripKey);
    const current = Boolean(trip && activeRoute === trip.routeId &&
      Number(directionEl.value) === trip.direction && String(stopEl.value) === String(trip.stopId));
    group.classList.toggle('is-current', current);
    group.querySelector('button')?.setAttribute('aria-pressed', String(current));
  }
}

function persistSavedTripOrder() {
  const order = [...savedTripsEl.querySelectorAll(':scope > .saved-trip')].map(item => item.dataset.tripKey);
  const byKey = new Map(savedTrips.map(trip => [savedTripKey(trip), trip]));
  savedTrips = order.map(key => byKey.get(key)).filter(Boolean);
  localStorage.setItem('bus-tracker-saved-trips', JSON.stringify(savedTrips));
  announceRouteOrder();
}

function renderSavedTrips() {
  const english = uiI18n?.language === 'en';
  savedTripsEl.replaceChildren();
  savedTripsBarEl.hidden = savedTrips.length === 0;
  if (!savedTrips.length) {
    tripsExpanded = false;
    pendingSavedTripKey = null;
    tripsMoreEl.hidden = true;
    tripsMoreEl.setAttribute('aria-expanded', 'false');
    syncSaveTripAction();
    return;
  }
  for (const trip of savedTrips) {
    const key = savedTripKey(trip);
    const group = document.createElement('span'); group.className = 'saved-trip';
    group.dataset.tripKey = key;
    const open = document.createElement('button'); open.type = 'button';
    open.disabled = Boolean(pendingSavedTripKey);
    const route = routes[trip.routeId];
    const matchedStop = trip.routeId === activeRoute
      ? stops.find(s => s.direction === trip.direction && String(s.id) === String(trip.stopId)) : null;
    const routeName = english ? (route?.name === '橘5' ? 'Orange 5' : route?.english || `Route ${trip.routeId}`)
      : route?.name || trip.routeId;
    const stopName = english ? (trip.stopNameEn || matchedStop?.nameEn || uiI18n?.nameFor?.(trip.stopName) || trip.stopName)
      : matchedStop?.name || trip.stopName;
    open.textContent = `${routeName} · ${stopName}`;
    open.title = `${english ? 'Hold and drag to reorder' : '長按拖曳排序'} · ${stopName}`;
    const isCurrent = activeRoute === trip.routeId && Number(directionEl.value) === trip.direction &&
      String(stopEl.value) === String(trip.stopId);
    group.classList.toggle('is-current', isCurrent);
    group.classList.toggle('is-pending', pendingSavedTripKey === key);
    open.setAttribute('aria-pressed', String(isCurrent));
    let suppressClickUntil = 0;
    bindHoldToReorder(open, group, savedTripsEl, '.saved-trip', persistSavedTripOrder,
      () => { suppressClickUntil = Date.now() + 1000; });
    open.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil) { event.preventDefault(); return; }
      pendingSavedTripKey = key;
      for (const button of savedTripsEl.querySelectorAll('.saved-trip button')) button.disabled = true;
      group.classList.add('is-pending');
      const finish = applied => {
        if (pendingSavedTripKey !== key) return;
        pendingSavedTripKey = null;
        for (const item of savedTripsEl.querySelectorAll('.saved-trip')) {
          item.classList.remove('is-pending');
          for (const button of item.querySelectorAll('button')) button.disabled = false;
        }
        syncSavedTripCurrentState();
      };
      if (activeRoute === trip.routeId && stops.length) {
        closedEl.checked = trip.closedLoop;
        localStorage.setItem(routeStorage('closed-loop'), trip.closedLoop ? '1' : '0');
        finish(selectRouteStop(trip.direction, trip.stopId));
      } else switchRoute(trip.routeId, trip).then(finish);
    });
    group.append(open); savedTripsEl.append(group);
  }
  const previewLimit = savedTripsPhoneMedia.matches ? 5 : 8;
  if (savedTrips.length <= previewLimit) tripsExpanded = false;
  document.querySelector('.trip-bar').classList.toggle('expanded', tripsExpanded);
  tripsMoreEl.hidden = savedTrips.length <= previewLimit;
  tripsMoreEl.setAttribute('aria-expanded', String(tripsExpanded));
  const remainingTrips = savedTrips.length - previewLimit;
  tripsMoreEl.textContent = tripsExpanded
    ? (english ? 'Show fewer trips' : '收合其他行程')
    : english ? `Show ${remainingTrips} more ${remainingTrips === 1 ? 'trip' : 'trips'}`
      : `顯示其餘 ${remainingTrips} 筆`;
  syncSaveTripAction();
}
tripsMoreEl.addEventListener('click', () => { tripsExpanded = !tripsExpanded; renderSavedTrips(); });
const resetTripsPreviewForViewport = () => { tripsExpanded = false; renderSavedTrips(); };
if (savedTripsPhoneMedia.addEventListener) savedTripsPhoneMedia.addEventListener('change', resetTripsPreviewForViewport);
else savedTripsPhoneMedia.addListener(resetTripsPreviewForViewport);
window.addEventListener('aheadway:languagechange', renderSavedTrips);
window.addEventListener('aheadway:languagechange', () => {
  syncRouteMapAccessibleName();
  renderRouteMap(latestSnapshot);
});

queryTripEl.addEventListener('click', () => {
  if (!hasSelectedStop()) { stopEl.focus(); return; }
  selectionCardEl.open = false;
  const arrival = document.querySelector('#arrival-summary');
  arrival.open = true;
  requestAnimationFrame(() => {
    arrival.querySelector('summary').focus({preventScroll: true});
    arrival.scrollIntoView({behavior: 'smooth', block: 'start'});
  });
  update({selected: true, fresh: true});
});

document.querySelector('#save-trip').addEventListener('click', event => {
  event.preventDefault();
  event.stopPropagation();
  const station = stops.find(s => s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value));
  if (!station) return;
  const alreadySaved = savedTrips.some(item => item.routeId === activeRoute && item.direction === station.direction &&
    item.stopId === station.id && item.closedLoop === closedEl.checked);
  savedTrips = savedTrips.filter(item => !(item.routeId === activeRoute && item.direction === station.direction && item.stopId === station.id));
  if (!alreadySaved) savedTrips.unshift({routeId: activeRoute, direction: station.direction, stopId: station.id,
    stopName: station.name, stopNameEn: station.nameEn || null, closedLoop: closedEl.checked});
  savedTrips = savedTrips.slice(0, 8);
  localStorage.setItem('bus-tracker-saved-trips', JSON.stringify(savedTrips));
  renderSavedTrips();
});
renderSavedTrips();

async function switchRoute(routeId, trip = null, openSetup = false) {
  if (!routes[routeId]) return false;
  const newlyAdded = !addedRouteIds.includes(routeId);
  if (newlyAdded) {
    if (addedRouteIds.length >= 20) return;
    addedRouteIds.push(routeId);
    localStorage.setItem('bus-tracker-added-routes', JSON.stringify(addedRouteIds));
    renderRouteTabs();
  }
  closeRouteRemoval();
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
  applyRouteDisclosureState(routeId);
  localStorage.setItem('bus-tracker-route', String(routeId));
  closedEl.checked = (localStorage.getItem(routeStorage('closed-loop')) ??
    (routeId === 16405 ? localStorage.getItem('orange5-closed-loop') : null) ??
    (knownLoopRouteIds.includes(routeId) ? '1' : '0')) === '1';
  if (trip) closedEl.checked = trip.closedLoop;
  travelReturnReferenceEl.checked = (localStorage.getItem(routeStorage('return-reference')) ??
    (closedEl.checked ? '1' : '0')) === '1';
  directionEl.value = String(trip?.direction ?? localStorage.getItem(routeStorage('direction')) ?? '0');
  stops = [];
  latestSnapshot = null;
  voiceEl.disabled = true;
  stopEl.replaceChildren();
  syncStopSelection();
  vehiclesEl.replaceChildren();
  document.querySelector('#eta-card').hidden = true;
  document.querySelector('#vehicle-summary').textContent = '';
  document.querySelector('#vehicle-count').textContent = '—';
  document.querySelector('.approach-board').classList.add('is-empty');
  document.querySelector('#stop-title').textContent = '選擇站牌';
  document.querySelector('#updated').textContent = '—';
  dataFreshnessEl.textContent = '正在讀取資料時間…';
  setLeaveAdvice('載入到站預估後顯示', '等待到站預估');
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
    if (current !== routeGeneration) return false;
    stops = data;
    for (const direction of [0, 1])
      directionEl.options[direction].disabled = !stops.some(s => s.direction === direction && s.selectable !== false);
    if (directionEl.options[Number(directionEl.value)].disabled &&
        !directionEl.options[1 - Number(directionEl.value)].disabled)
      directionEl.value = String(1 - Number(directionEl.value));
    if (trip) localStorage.setItem(routeStorage('stop-' + trip.direction), String(trip.stopId));
    setStops();
    syncStopSelection();
    selectionCardEl.open = Boolean(openSetup || newlyAdded || !hasSelectedStop());
    if (savedSchedule) scheduleStatus();
    return !trip || (Number(directionEl.value) === trip.direction &&
      String(stopEl.value) === String(trip.stopId) && hasSelectedStop());
  } catch (error) {
    if (current === routeGeneration) showError(error.message);
    return false;
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
  setLeaveAdvice('資料暫不可用，無法建議出發時間。', '資料暫不可用');
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
      ? {engine: 'api', model: apiModelEl.value.trim() || 'tts-1', voice: apiVoiceEl.value.trim() || 'anne'}
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

function trackedBusKey() { return `bus-tracker-tracked-${currentStopKey()}`; }
function trackedBusId() { return localStorage.getItem(trackedBusKey()) || ''; }
function trackedVehicle(snapshot) {
  return snapshot?.vehicles?.find(bus => bus.id === trackedBusId()) || null;
}
function includeVehicleInAdvice(bus) {
  return !bus.crossDirection || travelReturnReferenceEl.checked || bus.id === trackedBusId();
}
function trackedVoiceText(snapshot) {
  const bus = trackedVehicle(snapshot);
  const route = voiceLanguageEl.value === 'en'
    ? (snapshot.routeNameEn || routes[activeRoute]?.english || snapshot.route)
    : (routes[snapshot.routeId]?.spoken || snapshot.route);
  const stop = voiceLanguageEl.value === 'en'
    ? englishStopName(snapshot.stop.nameEn || snapshot.stop.name) : snapshot.stop.name;
  if (!trackedBusId()) return voiceLanguageEl.value === 'en'
    ? 'Choose a bus in Approaching and following buses to use tracking voice mode.'
    : '請先在本方向來車與後續車選擇要追蹤的車輛。';
  if (!bus) return voiceLanguageEl.value === 'en'
    ? `${route}, ${stop}. Tracked bus ${trackedBusId()} is no longer in the live vehicle list. Check the route before leaving.`
    : `${route}，${stop}。追蹤車輛${trackedBusId()}目前未出現在即時車輛清單，出發前請再確認。`;
  const uncertain = bus.crossDirection && !bus.atStop;
  if (voiceLanguageEl.value === 'en') return `${route}, ${stop}. Tracked bus ${bus.id} is ${bus.atStop ? 'at the stop' : `estimated in ${englishEtaRange(bus)}`}.` +
    (uncertain ? ' It must turn back at the terminal and may end service there.' : '');
  return `${route}，${stop}。追蹤車輛${bus.id}${bus.atStop ? '已在本站' : `推估${etaRangeLabel(bus)}抵達`}。` +
    (uncertain ? '此車須在終點折返續行，也可能在終點停駛。' : '');
}
function renderTrackedBus(snapshot) {
  const id = trackedBusId();
  trackedBusEl.hidden = !id;
  trackAdviceOnlyEl.closest('.track-advice-toggle').hidden = !id;
  trackAdviceOnlyEl.checked = Boolean(id) && localStorage.getItem(`${trackedBusKey()}-advice`) === '1';
  document.querySelector('#track-advice-note').hidden = !id || !trackAdviceOnlyEl.checked;
  if (!id) return;
  const bus = snapshot?.vehicles?.find(vehicle => vehicle.id === id);
  trackedBusTitleEl.textContent = id;
  trackedBusDetailEl.textContent = !bus ? '目前未在沿線車輛清單中；可能離線、已離站或已結束營運。請勿依舊資料出發。'
    : bus.atStop ? '已抵達所選站牌 · 逐車位置，非官方下一班時間'
      : `逐車推估 ${etaRangeLabel(bus)} · 下一站 ${bus.nextStop || '不明'}` +
        (bus.crossDirection ? ' · 須折返續行，不保證繼續載客' : ' · 非官方下一班時間');
}
function selectTrackedBus(id) {
  if (trackedBusId() === id) {
    localStorage.removeItem(trackedBusKey());
    trackAdviceOnlyEl.checked = false;
    localStorage.removeItem(`${trackedBusKey()}-advice`);
  }
  else {
    localStorage.setItem(trackedBusKey(), id);
    trackAdviceOnlyEl.checked = true;
    localStorage.setItem(`${trackedBusKey()}-advice`, '1');
    document.querySelector('#arrival-summary').open = true;
  }
  resetAlertState(); lastBriefingAt = 0; lastBriefingKey = '';
  for (const button of vehiclesEl.querySelectorAll('.vehicle-track')) {
    const selected = button.closest('.vehicle')?.dataset.busId === trackedBusId();
    button.querySelector('span').textContent = selected ? '追蹤中' : '追蹤';
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? '停止追蹤' : '追蹤'} ${button.closest('.vehicle')?.dataset.busId}`);
  }
  renderTrackedBus(latestSnapshot);
  if (latestSnapshot) {
    renderLeaveAdvice(latestSnapshot);
    renderTravelGuidance();
    if (!activeUtterance && !activeAudio && !pendingAudio)
      voicePreviewEl.textContent = `播報內容：${briefingText(latestSnapshot)}`;
  }
  syncVoiceMode();
  syncPushSettings();
  if (!closedEl.checked) update({selected: true, fresh: true});
}
trackedBusClearEl.addEventListener('click', () => selectTrackedBus(trackedBusId()));
trackAdviceOnlyEl.addEventListener('change', () => {
  localStorage.setItem(`${trackedBusKey()}-advice`, trackAdviceOnlyEl.checked ? '1' : '0');
  document.querySelector('#track-advice-note').hidden = !trackAdviceOnlyEl.checked;
  if (latestSnapshot) { renderLeaveAdvice(latestSnapshot); renderTravelGuidance(); }
  syncPushSettings();
});

function briefingText(snapshot) {
  if (voiceFormatEl.value === 'track') return trackedVoiceText(snapshot);
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

function setLeaveAdvice(message, brief = message, departureAt = null) {
  leaveAdviceEl.textContent = message;
  leaveBriefEl.textContent = brief;
  recommendedLeaveAt = departureAt;
  renderPlanDepartureStatus();
}

function renderLeaveAdvice(snapshot) {
  const walk = currentWalkMinutes();
  const buffer = planBufferMinutes();
  const eta = snapshot.officialEtaSeconds;
  const feedAges = Object.values(snapshot.feedFetchedAt || {}).filter(Boolean).map(elapsedSeconds);
  if (elapsedSeconds(snapshot.updatedAt) > 240 || feedAges.some(age => age > 240)) {
    setLeaveAdvice('公車資料已過時；請更新後再查看出發建議。', '資料已過時');
    return;
  }
  if (trackAdviceOnlyEl.checked && trackedBusId()) {
    const bus = trackedVehicle(snapshot);
    if (!bus) { setLeaveAdvice('追蹤車輛目前未出現在即時車輛清單；無法建議出發時間。', '追蹤車輛暫無資料'); return; }
    if (bus.atStop) { setLeaveAdvice('追蹤車輛已抵達所選站牌；請確認是否還能搭乘。', '已抵達站牌'); return; }
  }
  const needed = (walk + buffer) * 60;
  const officialRemaining = eta === null ? null : Math.max(0, eta - elapsedSeconds(
    snapshot.feedFetchedAt?.EstimateTime || snapshot.updatedAt));
  let selected = null;
  if (trackAdviceOnlyEl.checked && trackedBusId()) {
    const bus = trackedVehicle(snapshot);
    const [lower] = remainingVehicleWindow(bus);
    if (lower <= walk * 60) { setLeaveAdvice('追蹤車輛可能趕不上；請查看逐車到站範圍。', '可能趕不上'); return; }
    selected = {remaining: lower, description: `${bus.id}（逐車推估${etaRangeLabel(bus)}）`,
      tentative: true, conditional: Boolean(bus.crossDirection)};
  }
  if (!selected && !trackAdviceOnlyEl.checked && officialRemaining !== null && officialRemaining > needed) {
    selected = {remaining: officialRemaining, description: '官方下一班', tentative: false};
  } else if (!selected && !trackAdviceOnlyEl.checked) {
    const candidates = snapshot.vehicles.filter(bus => !bus.atStop && includeVehicleInAdvice(bus) &&
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
  if (!selected && !trackAdviceOnlyEl.checked && officialRemaining !== null && officialRemaining > walk * 60) {
    selected = {remaining: officialRemaining, description: '官方下一班', tentative: true};
  }
  if (!selected) {
    setLeaveAdvice(eta === null
      ? '目前沒有可確認來得及搭乘的車輛；請查看各車推估範圍。'
      : '官方下一班可能趕不上；目前沒有可確認來得及搭乘的後續車輛。', '暫無可確認班次');
    return;
  }
  const leaveIn = selected.remaining - needed;
  if (leaveIn <= 0) {
    setLeaveAdvice(`${selected.description}：現在出發；預留的 ${buffer} 分鐘緩衝已不足，可能趕不上這班。` +
      (selected.conditional ? ' 此車可能在終點停駛，請再確認班次。' : ''), '可能趕不上');
    return;
  }
  if (leaveIn < 60) {
    setLeaveAdvice(`${selected.description}：現在出發，剩餘緩衝不足 1 分鐘。` +
      (selected.conditional ? ' 此車可能在終點停駛，請再確認班次。' : ''), '現在出發', Date.now());
    return;
  }
  const clock = new Date(Date.now() + leaveIn * 1000).toLocaleTimeString('zh-TW',
    {hour: '2-digit', minute: '2-digit', hour12: false});
  setLeaveAdvice(`${selected.conditional ? '若此車在終點折返續行，可參考 ' : selected.tentative ? '可考慮 ' : ''}` +
    `${selected.description}：${selected.conditional ? '約' : '建議'} ${clock} 前出發` +
    `${leaveIn < 60 ? '（現在）' : `（約 ${Math.floor(leaveIn / 60)} 分鐘後）`}` +
    (selected.conditional ? '；可能在終點停駛，請再確認班次。' : ''),
  `${selected.conditional ? '折返參考 · ' : ''}${leaveIn < 60 ? '現在出發' : `${clock} 前出發`}`, Date.now() + leaveIn * 1000);
}

const PLAN_MATCH_WINDOW_SECONDS = 3 * 60;
const PLAN_MONITOR_WINDOW_SECONDS = 90 * 60;
function renderDeferredPlanStatus() {
  const startsAt = new Date(planReadyAt(planDepartureAt, planMatchContext) - PLAN_MONITOR_WINDOW_SECONDS * 1000)
    .toLocaleString(uiI18n?.language === 'en' ? 'en-US' : 'zh-TW',
      {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false});
  setPlanMatchStatus('waiting', planText('計畫已儲存', 'Plan saved'),
    planText(`目前來車不代表明日路況。將於 ${startsAt} 起比對即時來車；早上請保持此頁開啟。`,
      `Current buses do not predict tomorrow's traffic; live matching starts at ${startsAt}. Keep this page open in the morning.`));
  planAlternativesEl.hidden = true;
}
function planReadyAt(planAt, context = planMatchContext) {
  const walk = Number.isFinite(Number(context?.walkMinutes)) ? Number(context.walkMinutes) : currentWalkMinutes();
  const buffer = Number.isFinite(Number(context?.bufferMinutes)) ? Number(context.bufferMinutes) : planBufferMinutes();
  const leadMinutes = (context?.timePurpose === 'arrive' ? 0 : walk) + buffer;
  return planAt + leadMinutes * 60000;
}
function planCandidate(snapshot, planAt, now = Date.now(), context = planMatchContext) {
  const readyIn = Math.max(0, (planReadyAt(planAt, context) - now) / 1000);
  if (readyIn > PLAN_MONITOR_WINDOW_SECONDS)
    return {deferred: true, match: null, earlier: null, later: null, readyIn, candidates: []};
  const feeds = Object.values(snapshot.feedFetchedAt || {}).filter(Boolean);
  if (!feeds.length || elapsedSeconds(snapshot.updatedAt) > 120 || feeds.some(stamp => elapsedSeconds(stamp) > 120)) return null;
  const tracked = context?.trackedBusId || '';
  const onlyTracked = Boolean(context?.trackOnly && tracked);
  const allowReturn = Boolean(context?.referenceReturn);
  const candidates = [];
  const busCandidates = (snapshot.vehicles || []).filter(bus => !bus.atStop &&
    (!onlyTracked || bus.id === tracked) &&
    (!bus.crossDirection || allowReturn || bus.id === tracked) &&
    elapsedSeconds(bus.lastSeen) <= 90 &&
    (bus.confidence !== 'low' || (bus.crossDirection && allowReturn) || bus.id === tracked));
  for (const bus of busCandidates) {
    const seconds = remainingVehicleWindow(bus)[0];
    if (seconds > 0) candidates.push({key: bus.id, label: bus.id, seconds,
      conditional: Boolean(bus.crossDirection), official: false});
  }
  const official = snapshot.officialEtaSeconds;
  const officialRemaining = official == null ? 0 : Math.max(0, official - elapsedSeconds(
    snapshot.feedFetchedAt?.EstimateTime || snapshot.updatedAt));
  if (!onlyTracked && officialRemaining > 0)
    candidates.push({key: 'official', label: planText('官方下一班', 'Official next bus'),
      seconds: officialRemaining, conditional: false, official: true});
  candidates.sort((a, b) => a.seconds - b.seconds || Number(b.official) - Number(a.official) ||
    Number(a.conditional) - Number(b.conditional));
  const match = candidates.find(candidate => candidate.seconds >= readyIn &&
    candidate.seconds <= readyIn + PLAN_MATCH_WINDOW_SECONDS) || null;
  const earlier = candidates.filter(candidate => candidate.seconds < readyIn).at(-1) || null;
  const later = candidates.find(candidate => candidate.seconds > readyIn + PLAN_MATCH_WINDOW_SECONDS) || null;
  return {match, earlier, later, readyIn, candidates};
}
function orderedPlanAlternatives(result, planAt, now = Date.now()) {
  if (!result || !planAt) return [];
  return [
    {candidate: result.earlier, direction: 'earlier'},
    {candidate: result.later, direction: 'later'}
  ].map(choice => ({...choice,
    adjustment: choice.candidate ? choice.candidate.seconds - result.readyIn : 0}))
    .filter(choice => choice.candidate && planAt + choice.adjustment * 1000 > now)
    .sort((a, b) => Math.abs(a.adjustment) - Math.abs(b.adjustment) ||
      Number(a.direction === 'later') - Number(b.direction === 'later'));
}
function planCandidateClock(candidate, now = Date.now()) {
  return new Date(now + candidate.seconds * 1000).toLocaleTimeString(
    uiI18n?.language === 'en' ? 'en-US' : 'zh-TW', {hour:'2-digit', minute:'2-digit', hour12:false});
}
function renderPlanAlternatives(result, now = Date.now()) {
  const buttons = {earlier: planEarlierOptionEl, later: planLaterOptionEl};
  for (const button of Object.values(buttons)) {
    button.hidden = false;
    button.disabled = true;
    delete button.dataset.adjustSeconds;
    delete button.dataset.recommended;
    delete button.dataset.recommendedLabel;
  }
  const choices = orderedPlanAlternatives(result, planDepartureAt, now);
  const available = new Set(choices.map(choice => choice.direction));
  if (!available.has('earlier')) planEarlierOptionEl.textContent = planText('較早班次 · 暫無可靠來車', 'Earlier bus · none confirmed yet');
  if (!available.has('later')) planLaterOptionEl.textContent = planText('較晚班次 · 暫無可靠來車', 'Later bus · none confirmed yet');
  choices.forEach((choice, index) => {
    const button = buttons[choice.direction];
    button.disabled = false;
    button.dataset.adjustSeconds = String(choice.adjustment);
    if (index === 0) {
      button.dataset.recommended = 'true';
      button.dataset.recommendedLabel = planText('最接近目前計畫', 'Closest to your plan');
    }
    const minutes = Math.max(1, Math.round(Math.abs(choice.adjustment) / 60));
    const action = choice.direction === 'earlier'
      ? planText(`提早約 ${minutes} 分鐘`, `Move the plan about ${minutes} min earlier`)
      : planText(`延後約 ${minutes} 分鐘`, `Move the plan about ${minutes} min later`);
    button.textContent = `${action} · ${choice.candidate.label} ${planCandidateClock(choice.candidate, now)}`;
    planAlternativeActionsEl.append(button);
  });
  planAlternativesEl.hidden = false;
  planAlternativesDetailEl.textContent = choices.length
    ? planText('預定到站後 3 分鐘內沒有合適來車；最接近原計畫的調整排在最前面。',
      'No suitable bus is due within three minutes after your planned stop-ready time. The closest adjustment is shown first.')
    : planText('目前沒有可靠的較早或較晚班次；每 30 秒更新來車後會顯示可用選項。',
      'No reliable earlier or later bus is confirmed yet. Available options will appear as live buses update every 30 seconds.');
}
function applyPlanAlternative(event) {
  if (event.currentTarget.disabled) return;
  const adjustment = Number(event.currentTarget.dataset.adjustSeconds);
  if (!Number.isFinite(adjustment) || !planDepartureAt) return;
  const adjusted = planDepartureAt + adjustment * 1000;
  if (adjusted <= Date.now()) return;
  planDepartureAt = adjusted;
  localStorage.setItem(PLAN_DEPARTURE_KEY, String(adjusted));
  localStorage.removeItem(PLAN_NOTIFIED_KEY);
  const date = new Date(adjusted);
  planDateEl.value = localDateValue(date);
  planClockEl.value = localTimeValue(date);
  setPlanInputMode('datetime');
  planAlternativesEl.hidden = true;
  renderPlanDepartureStatus();
  refreshPlanMatch();
}
planEarlierOptionEl.addEventListener('click', applyPlanAlternative);
planLaterOptionEl.addEventListener('click', applyPlanAlternative);
function showPlanMatchNotification(candidate, detail) {
  planMatchToastEl.hidden = false;
  document.querySelector('#plan-match-toast-title').textContent = planText('找到可搭乘來車', 'Catchable bus found');
  document.querySelector('#plan-match-toast-detail').textContent = detail;
  if (window.Notification?.permission !== 'granted') return;
  const title = planText('AheadWay · 找到可搭乘來車', 'AheadWay · Catchable bus found');
  const options = {body: detail, tag: 'bus-plan-match', icon: new URL('icon.svg', location.href).href};
  if (navigator.serviceWorker?.getRegistration) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) return registration.showNotification(title, options);
      if (typeof window.Notification === 'function') new window.Notification(title, options);
    }).catch(() => {});
  } else if (typeof window.Notification === 'function') {
    try { new window.Notification(title, options); } catch (_) {}
  }
}
document.querySelector('#plan-match-toast-close').addEventListener('click', () => {planMatchToastEl.hidden = true;});
function evaluatePlanMatch(snapshot) {
  if (!planDepartureAt || !planMatchContext) {
    if (planDepartureAt) setPlanMatchStatus('waiting', planText('請重新設定計畫', 'Set the plan again'),
      planText('請重新設定出發時間，以選定比對的路線與站牌。', 'Set the departure time again to choose a route and stop for matching.'));
    else setPlanMatchStatus('waiting', '', '');
    planAlternativesEl.hidden = true;
    return;
  }
  const now = Date.now();
  if (now > planReadyAt(planDepartureAt, planMatchContext) + 30 * 60000) {
    setPlanMatchStatus('waiting', planText('比對時間已結束', 'Matching ended'),
      planText('請設定新的出發時間。', 'Set a new departure time.'));
    planAlternativesEl.hidden = true;
    return;
  }
  const {routeId, direction, stopId} = planMatchContext;
  if (!snapshotMatchesPlan(snapshot, planMatchContext)) {
    setPlanMatchStatus('waiting', planText('正在比對來車', 'Checking buses'),
      planText('正在更新已固定路線與站牌的即時來車…', 'Updating live buses for the pinned route and stop…'));
    planAlternativesEl.hidden = true;
    return;
  }
  const result = planCandidate(snapshot, planDepartureAt, now);
  if (!result) {
    setPlanMatchStatus('waiting', planText('等待可靠的即時資料', 'Waiting for reliable live data'),
      planText('持續比對即時來車；請保持此頁開啟，找到足夠步行與緩衝時間的班次時提醒。',
        'Checking live buses; keep this page open and you will be alerted when one allows enough walking and buffer time.'));
    renderPlanAlternatives(null, now);
    return;
  }
  const candidate = result.match;
  if (result.deferred) {
    renderDeferredPlanStatus();
    return;
  }
  if (!candidate) {
    const hasAlternative = Boolean(result.earlier || result.later);
    const detail = hasAlternative
      ? planText('預定到站時間後 3 分鐘內暫無合適來車；系統會持續更新，你也可以套用下方較早或較晚選項。',
        'No suitable bus is within three minutes after your planned stop-ready time. Matching continues, or you can apply an earlier or later option below.')
      : planText('目前沒有可靠的鄰近班次；系統會每 30 秒持續比對。',
        'There is no reliable nearby bus yet; matching continues every 30 seconds.');
    setPlanMatchStatus('miss', planText('目前沒有符合計畫的來車', 'No bus fits your plan yet'), detail);
    renderPlanAlternatives(result, now);
    return;
  }
  planAlternativesEl.hidden = true;
  const minutes = Math.max(1, Math.ceil(candidate.seconds / 60));
  const detail = planText(`${candidate.label} 約 ${minutes} 分鐘後抵達，是你按計畫到站後的下一班合適來車。` +
      (candidate.conditional ? ' 折返車可能在終點停駛，僅供參考。' : ''),
    `${candidate.label} arrives in about ${minutes} min and is the next suitable bus after you reach the stop as planned.` +
      (candidate.conditional ? ' Returning service is uncertain.' : ''));
  setPlanMatchStatus('ok', planText('找到符合計畫的來車', 'Bus matches your plan'), detail);
  const key = `${planDepartureAt}:${routeId}:${direction}:${stopId}`;
  if (localStorage.getItem(PLAN_NOTIFIED_KEY) === key || planPermissionPending) return;
  localStorage.setItem(PLAN_NOTIFIED_KEY, key);
  showPlanMatchNotification(candidate, detail);
}
let planMatchRequestVersion = 0;
function snapshotMatchesPlan(snapshot, context) {
  return Boolean(snapshot && context && snapshot.routeId === context.routeId &&
    snapshot.direction === context.direction && String(snapshot.stop?.id) === context.stopId &&
    (!(context.referenceReturn || context.trackedBusId) || snapshot.closedLoop === true));
}
async function refreshPlanMatch() {
  if (!planDepartureAt || !planMatchContext ||
      Date.now() > planReadyAt(planDepartureAt, planMatchContext) + 30 * 60000) {
    evaluatePlanMatch(latestSnapshot);
    return;
  }
  if (planReadyAt(planDepartureAt, planMatchContext) - Date.now() > PLAN_MONITOR_WINDOW_SECONDS * 1000) {
    renderDeferredPlanStatus();
    return;
  }
  const context = planMatchContext;
  if (snapshotMatchesPlan(latestSnapshot, context) && elapsedSeconds(latestSnapshot.updatedAt) <= 120) {
    evaluatePlanMatch(latestSnapshot);
    return;
  }
  const version = ++planMatchRequestVersion;
  setPlanMatchStatus('waiting', planText('正在比對來車', 'Checking buses'),
    planText('正在更新已固定路線與站牌的即時來車…', 'Updating live buses for the pinned route and stop…'));
  try {
    const closedLoop = context.referenceReturn || context.trackedBusId ? 1 : 0;
    const snapshot = await request(`api/arrivals?route_id=${context.routeId}&direction=${context.direction}` +
      `&stop_id=${encodeURIComponent(context.stopId)}&closed_loop=${closedLoop}&fresh=1`);
    if (version === planMatchRequestVersion && planDepartureAt && planMatchContext === context)
      evaluatePlanMatch(snapshot);
  } catch (_) {
    if (version === planMatchRequestVersion) {
      setPlanMatchStatus('waiting', planText('即時資料暫時無法更新', 'Live data unavailable'),
        planText('30 秒後自動重試。', 'Retrying in 30 seconds.'));
      renderPlanAlternatives(null);
    }
  }
}

function syncLocationUI() {
  const active = useLocationEl.checked;
  walkSettingsEl.dataset.mode = active ? (locationWalkMinutes === null ? 'loading' : 'gps') : 'manual';
  walkMinutesEl.readOnly = active;
  walkMinutesEl.value = active && locationWalkMinutes !== null ? String(locationWalkMinutes) : manualWalkMinutes;
  walkSourceEl.textContent = active ? (locationWalkMinutes === null ? (locationRequestKey ? '定位中 · 暫用手動' : '選站後定位') : '依目前位置') : '手動設定';
  planHelpEl.textContent = active
    ? '上方建議依步行時間與你設定的緩衝更新；位置每 30 秒重新取得。'
    : '上方建議依手動步行時間與你設定的緩衝更新。';
  renderPlanPurpose();
}

function stopUsingLocation(message) {
  ++locationRequestVersion;
  useLocationEl.checked = false;
  localStorage.setItem(WALK_MODE_KEY, 'manual');
  locationWalkMinutes = null;
  locationStopKey = '';
  locationRequestKey = '';
  locationStateEl.textContent = message;
  syncLocationUI();
  if (latestSnapshot) renderLeaveAdvice(latestSnapshot);
  syncPushSettings();
}

function applyLocationPosition(position, station = stops.find(s =>
  s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value)), syncPush = true) {
  if (!station || !Number.isFinite(Number(station.lat)) || !Number.isFinite(Number(station.lon))) return false;
  const previous = currentWalkMinutes();
  const p = position.coords;
  if (!Number.isFinite(p?.latitude) || !Number.isFinite(p?.longitude)) return false;
  const lat = (station.lat - p.latitude) * Math.PI / 180;
  const lon = (station.lon - p.longitude) * Math.PI / 180;
  const a = Math.sin(lat / 2) ** 2 + Math.cos(p.latitude * Math.PI / 180) *
    Math.cos(station.lat * Math.PI / 180) * Math.sin(lon / 2) ** 2;
  const metres = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  locationWalkMinutes = Math.min(60, Math.ceil((metres * 1.35 + Math.min(200, p.accuracy || 0)) / 1.2 / 60));
  locationStopKey = currentStopKey();
  const acquiredAt = new Date().toLocaleTimeString('zh-TW', {hour: '2-digit', minute: '2-digit'});
  locationStateEl.textContent = `${acquiredAt} 定位 · 直線約 ${Math.round(metres)} 公尺；含繞路與定位誤差，步行約 ${locationWalkMinutes} 分鐘。非導航路線。`;
  syncLocationUI();
  if (latestSnapshot) renderLeaveAdvice(latestSnapshot);
  renderTravelGuidance();
  if (syncPush && currentWalkMinutes() !== previous) syncPushSettings();
  return true;
}

function requestLocation() {
  if (!navigator.geolocation || !window.isSecureContext) {
    stopUsingLocation('此瀏覽器需要安全連線（HTTPS 或 localhost）與定位功能；已改用手動步行時間。');
    return;
  }
  const station = stops.find(s => s.direction === Number(directionEl.value) && String(s.id) === String(stopEl.value));
  if (station?.lat == null || station?.lon == null ||
      !Number.isFinite(Number(station.lat)) || !Number.isFinite(Number(station.lon))) {
    stopUsingLocation('此站缺少座標；已改用手動步行時間。');
    return;
  }
  const requestedStop = currentStopKey();
  if (locationRequestKey === requestedStop) return;
  const hadEstimate = locationStopKey === requestedStop && locationWalkMinutes !== null;
  const version = ++locationRequestVersion;
  locationRequestKey = requestedStop;
  if (!hadEstimate) locationWalkMinutes = null;
  locationStateEl.textContent = hadEstimate ? '正在更新位置；暫用上次步行估算。' : '正在取得位置…';
  syncLocationUI();
  try { navigator.geolocation.getCurrentPosition(position => {
    if (!useLocationEl.checked || version !== locationRequestVersion || currentStopKey() !== requestedStop) return;
    locationRequestKey = '';
    if (!applyLocationPosition(position, station)) {
      if (hadEstimate) { locationStateEl.textContent = '本次定位資料無效；沿用上次步行估算，30 秒後重試。'; syncLocationUI(); }
      else stopUsingLocation('位置資料無效；已改用手動步行時間。');
    }
  }, error => {
    if (!useLocationEl.checked || version !== locationRequestVersion || currentStopKey() !== requestedStop) return;
    locationRequestKey = '';
    if (error?.code === 1) stopUsingLocation('定位權限未開啟；已改用手動步行時間。');
    else if (hadEstimate) { locationStateEl.textContent = '本次定位失敗；沿用上次步行估算，30 秒後重試。'; syncLocationUI(); }
    else { locationStateEl.textContent = '定位暫時失敗；30 秒後重試。也可改填步行分鐘。'; syncLocationUI(); }
  },
  {enableHighAccuracy: false, timeout: 10000, maximumAge: 0}); }
  catch (_) { stopUsingLocation('無法取得位置；已改用手動步行時間。'); }
}

useLocationEl.addEventListener('change', () => {
  if (useLocationEl.checked) {
    localStorage.setItem(WALK_MODE_KEY, 'gps');
    if (stopEl.value) requestLocation();
    else { locationStateEl.textContent = '選好站牌後會詢問定位；定位失敗時可手動輸入分鐘。'; syncLocationUI(); }
  }
  else {
    if (mobileMode === 'travel') setMobileMode('plan');
    stopUsingLocation('已改用手動步行時間。');
  }
});
syncLocationUI();

function stopTravelTracking() {
  ++travelWatchVersion;
  if (travelWatchId !== null) navigator.geolocation?.clearWatch?.(travelWatchId);
  travelWatchId = null;
  travelActive = false;
  travelActionEl.classList.remove('is-stop-action');
}

function setTravelResult(level, heading, detail, targetKey = '') {
  travelResultEl.dataset.level = level;
  travelHeadEl.textContent = heading;
  travelDetailEl.textContent = detail;
  travelFloatEl.hidden = mobileMode !== 'travel' || !['hurry', 'miss'].includes(level);
  travelFloatEl.dataset.level = level;
  travelFloatEl.textContent = `${heading} · 點此查看行程`;
  if (!travelActive || !['hurry', 'miss'].includes(level)) {
    lastTravelAlertKey = '';
    return;
  }
  const alertKey = `${currentStopKey()}:${targetKey}:${level}`;
  if (alertKey === lastTravelAlertKey) return;
  lastTravelAlertKey = alertKey;
  navigator.vibrate?.(level === 'miss' ? [220, 100, 220] : [160]);
  if (window.Notification?.permission === 'granted' && navigator.serviceWorker?.ready) {
    navigator.serviceWorker.ready.then(registration => registration.showNotification(
      `${routes[activeRoute]?.name || '公車'} · ${heading}`, {body: detail,
        icon: new URL('icon.svg', registration.scope).href, tag: 'bus-travel-alert',
        data: {url: registration.scope}})).catch(() => {});
  }
}

function travelCandidates(snapshot) {
  const candidates = [];
  const officialAge = elapsedSeconds(snapshot.feedFetchedAt?.EstimateTime || snapshot.updatedAt);
  if (!trackAdviceOnlyEl.checked && Number.isFinite(snapshot.officialEtaSeconds)) {
    const seconds = Math.max(0, snapshot.officialEtaSeconds - officialAge);
    if (seconds > 0) candidates.push({seconds, label: '官方下一班', key: 'official'});
  }
  for (const bus of snapshot.vehicles || []) {
    if (trackAdviceOnlyEl.checked && trackedBusId() && bus.id !== trackedBusId()) continue;
    // Return estimates are marked low confidence by the tracker because the bus
    // may end service at the terminal. Keep them as tentative candidates when
    // the rider opted in or explicitly tracked that vehicle.
    if (bus.atStop || !includeVehicleInAdvice(bus) || (!bus.crossDirection && bus.confidence === 'low') ||
        elapsedSeconds(bus.lastSeen) > 90) continue;
    const seconds = remainingVehicleWindow(bus)[0];
    if (seconds > 0) candidates.push({seconds, label: `${bus.id} ${bus.crossDirection ? '折返參考' : '逐車推估'}`,
      key: bus.id, conditional: Boolean(bus.crossDirection)});
  }
  return candidates.sort((a, b) => a.seconds - b.seconds);
}

function renderTravelReturnReference(snapshot) {
  travelReturnResultEl.hidden = !travelReturnReferenceEl.checked || !snapshot;
  if (travelReturnResultEl.hidden) return;
  const buses = (snapshot.vehicles || []).filter(bus => bus.crossDirection && !bus.atStop &&
    elapsedSeconds(bus.lastSeen) <= 90 &&
    (!trackAdviceOnlyEl.checked || !trackedBusId() || bus.id === trackedBusId()))
    .sort((a, b) => remainingVehicleWindow(a)[0] - remainingVehicleWindow(b)[0]);
  const bus = buses[0];
  travelReturnResultEl.textContent = bus
    ? `折返車參考 · ${bus.id} 推估 ${etaRangeLabel(bus)}抵達。須在終點折返續行，可能停駛；請確認最新班次。`
    : '折返車參考 · 目前沒有可參考的反方向車輛。';
}

function renderTravelGuidance() {
  if (mobileMode !== 'travel' || !travelActive) return;
  travelReturnResultEl.hidden = true;
  if (!lastTravelPosition || locationWalkMinutes === null) {
    setTravelResult('waiting', '正在取得目前位置…', '取得位置後會比較步行與公車到站時間。');
    return;
  }
  if (Date.now() - lastTravelPositionAt > 90_000) {
    setTravelResult('waiting', '位置已過時', '正在重新取得位置；請確認手機定位權限。暫不判斷能否趕上。');
    return;
  }
  const snapshot = latestSnapshot;
  if (!snapshot || snapshot.routeId !== activeRoute || snapshot.direction !== Number(directionEl.value) ||
      String(snapshot.stop.id) !== String(stopEl.value)) {
    setTravelResult('waiting', '正在更新所選站牌…', '取得這一站的最新公車資料後會重新判斷。');
    return;
  }
  const feedTimes = Object.values(snapshot.feedFetchedAt || {}).filter(Boolean);
  if (!feedTimes.length || elapsedSeconds(snapshot.updatedAt) > 120 ||
      feedTimes.some(stamp => elapsedSeconds(stamp) > 120)) {
    setTravelResult('waiting', '公車資料過時', '目前不顯示趕車警告；請等資料更新或參考官方站牌資訊。');
    return;
  }
  renderTravelReturnReference(snapshot);
  const candidates = travelCandidates(snapshot);
  if (!candidates.length) {
    const id = trackedBusId();
    const tracked = id && trackedVehicle(snapshot);
    if (id && !tracked) {
      setTravelResult('waiting', '追蹤車輛暫無即時資料', `${id} 目前不在沿線車輛清單；請確認是否仍在行駛。`);
      return;
    }
    if (tracked?.atStop) {
      setTravelResult('waiting', '追蹤車輛已到站', `${id} 已抵達所選站牌；請確認是否還能搭乘。`);
      return;
    }
    if (tracked && elapsedSeconds(tracked.lastSeen) > 90) {
      setTravelResult('waiting', '追蹤車輛回報過時', `${id} 的位置資料已超過 90 秒；請等候更新，暫不判斷能否趕上。`);
      return;
    }
    if (tracked) {
      setTravelResult('waiting', '追蹤車輛暫無可用推估', `${id} 目前沒有可用的到站時間；請查看逐車資訊及官方狀態。`);
      return;
    }
    setTravelResult('waiting', '暫無可靠的候選來車', '持續追蹤位置與公車資料；可在建議出發時間調整反方向折返車的參考設定。');
    return;
  }
  // The official next ETA and a vehicle estimate may describe the same bus.
  // Use the official value as the next arrival when it is available.
  const target = candidates.find(item => item.key === 'official') || candidates[0];
  const walkSeconds = currentWalkMinutes() * 60;
  const slack = target.seconds - walkSeconds - 120;
  const basics = `步行約 ${currentWalkMinutes()} 分鐘；${target.label}約 ${Math.max(1, Math.ceil(target.seconds / 60))} 分鐘後到站；預留 2 分鐘緩衝。` +
    (target.conditional ? '此車須在終點折返續行，可能停駛；時間僅供參考。' : '');
  if (target.seconds <= walkSeconds) {
    const following = candidates.find(item => item.key !== 'official' &&
      item.seconds > Math.max(walkSeconds + 120, target.seconds + 180));
    setTravelResult('miss', '這班可能趕不上', basics +
      (following ? `較晚的 ${following.label} 約 ${Math.ceil(following.seconds / 60)} 分鐘後到站，請確認是否為另一班車。` :
        '請查看後續車或官方最新狀態。'), target.key);
  } else if (slack < 120) {
    setTravelResult('hurry', '請加快腳步', basics +
      `目前緩衝只剩約 ${Math.max(0, Math.floor((target.seconds - walkSeconds) / 60))} 分鐘。`, target.key);
  } else {
    setTravelResult('ok', '依估算步行時間可趕上', basics +
      `扣除緩衝後，尚有約 ${Math.floor(slack / 60)} 分鐘餘裕。`, target.key);
  }
}

function refreshTravelPosition() {
  if (!travelActive || !navigator.geolocation?.getCurrentPosition) return;
  const version = travelWatchVersion;
  navigator.geolocation.getCurrentPosition(position => {
    if (version !== travelWatchVersion || mobileMode !== 'travel') return;
    if ((position.coords?.accuracy || 0) > 250) {
      lastTravelPosition = null;
      setTravelResult('waiting', '定位精度不足', '請移到較開闊處；系統會自動重試定位，暫不判斷能否趕上。');
      return;
    }
    lastTravelPosition = position;
    lastTravelPositionAt = Date.now();
    applyLocationPosition(position);
  }, () => {
    if (version === travelWatchVersion)
      setTravelResult('waiting', '定位更新失敗', '持續定位仍在運作；請檢查權限，系統會自動重試。');
  }, {enableHighAccuracy: true, timeout: 15000, maximumAge: 0});
}

function startTravelTracking() {
  stopTravelTracking();
  if (!window.isSecureContext || !navigator.geolocation?.watchPosition) {
    travelActionEl.textContent = '重試定位';
    setTravelResult('waiting', '此裝置無法持續定位', '請使用安全連線與支援定位的手機。');
    return;
  }
  travelActive = true;
  travelActionEl.classList.add('is-stop-action');
  lastTravelPosition = null;
  lastTravelPositionAt = 0;
  lastTravelAlertKey = '';
  ++locationRequestVersion;
  locationRequestKey = '';
  locationWalkMinutes = null;
  useLocationEl.checked = true;
  locationStateEl.textContent = '前往站牌模式正在持續定位…';
  syncLocationUI();
  travelActionEl.textContent = '停止前往模式';
  setTravelResult('waiting', '正在取得目前位置…', '請允許定位，並保持此頁開啟。');
  const version = ++travelWatchVersion;
  try {
    travelWatchId = navigator.geolocation.watchPosition(position => {
      if (version !== travelWatchVersion || mobileMode !== 'travel') return;
      if ((position.coords?.accuracy || 0) > 250) {
        lastTravelPosition = null;
        setTravelResult('waiting', '定位精度不足', '請移到較開闊處；暫不判斷能否趕上。');
        return;
      }
      lastTravelPosition = position;
      lastTravelPositionAt = Date.now();
      if (!applyLocationPosition(position))
        setTravelResult('waiting', '站牌座標不可用', '此站目前無法估算步行時間；請選其他站牌。');
    }, error => {
      if (version !== travelWatchVersion) return;
      stopTravelTracking();
      stopUsingLocation('持續定位已停止；已改用手動步行時間。');
      travelActionEl.textContent = '重試定位';
      setTravelResult('waiting', '定位已中斷',
        `${error?.message || '無法取得位置'}。請檢查定位權限後按「重試定位」。`);
    }, {enableHighAccuracy: true, timeout: 20000, maximumAge: 15000});
  } catch (error) {
    stopTravelTracking();
    stopUsingLocation('持續定位無法啟動；已改用手動步行時間。');
    travelActionEl.textContent = '重試定位';
    setTravelResult('waiting', '無法啟動定位', error.message || '請檢查定位權限。');
  }
}

function setMobileMode(mode) {
  if (mode === mobileMode && (mode === 'plan' || travelActive)) return;
  if (mode === 'plan' && mobileMode === 'travel') {
    stopTravelTracking();
    travelFloatEl.hidden = true;
    if (lastTravelPosition && useLocationEl.checked)
      locationStateEl.textContent = '已停止持續定位；保留最後步行估算。下次開啟時會重新取得位置。';
  }
  mobileMode = mode;
  mobilePlanEl.setAttribute('aria-pressed', String(mode === 'plan'));
  mobileTravelEl.setAttribute('aria-pressed', String(mode === 'travel'));
  planPanelEl.hidden = mode !== 'plan';
  travelPanelEl.hidden = mode !== 'travel';
  walkSettingsEl.hidden = mode === 'travel' && phoneViewport?.matches;
  renderMobileReminderSummary();
  if (mode === 'travel') startTravelTracking();
}
mobilePlanEl.addEventListener('click', () => setMobileMode('plan'));
mobileTravelEl.addEventListener('click', () => setMobileMode('travel'));
function syncPlanReturnReference(refresh = false) {
  if (planDepartureAt && planMatchContext?.routeId === activeRoute) {
    planMatchContext = {...planMatchContext, referenceReturn: travelReturnReferenceEl.checked};
    localStorage.setItem(PLAN_MATCH_CONTEXT_KEY, JSON.stringify(planMatchContext));
    localStorage.removeItem(PLAN_NOTIFIED_KEY);
    if (refresh) refreshPlanMatch();
  }
}
travelReturnReferenceEl.addEventListener('change', () => {
  localStorage.setItem(routeStorage('return-reference'), travelReturnReferenceEl.checked ? '1' : '0');
  syncPlanReturnReference(closedEl.checked);
  if (!closedEl.checked) update({selected: true, fresh: true});
  if (latestSnapshot) renderLeaveAdvice(latestSnapshot);
  renderTravelGuidance();
});
function syncPhoneReminderViewport() {
  if (!phoneViewport?.matches && mobileMode === 'travel') setMobileMode('plan');
  walkSettingsEl.hidden = mobileMode === 'travel' && phoneViewport?.matches;
  phonePushControlsEl.hidden = !publicMode || !phoneViewport?.matches;
  renderMobileReminderSummary();
}
phoneViewport?.addEventListener?.('change', syncPhoneReminderViewport);
window.addEventListener?.('resize', syncPhoneReminderViewport);
travelActionEl.addEventListener('click', () => {
  if (travelActive) setMobileMode('plan');
  else startTravelTracking();
});
travelFloatEl.addEventListener('click', () => {
  travelPanelEl.scrollIntoView?.({behavior: 'smooth', block: 'center'});
});
if (window.addEventListener) window.addEventListener('pagehide', () => {
  if (mobileMode !== 'travel') return;
  stopTravelTracking();
  travelActionEl.textContent = '重新開始定位';
  setTravelResult('waiting', '定位已暫停', '返回頁面後請按「重新開始定位」，才能繼續取得前往警告。');
});

function scheduleStatus() {
  const routeId = savedSchedule?.route_id || 16405;
  const stop = savedSchedule && activeRoute === routeId && stops.find(s => s.direction === savedSchedule.direction && s.id === savedSchedule.stop_id);
  const voice = savedSchedule?.voice_engine === 'api'
    ? `${savedSchedule.voice_model || 'tts-1'} / ${savedSchedule.voice_name || 'anne'}`
    : `eSpeak ${savedSchedule?.voice_name || 'cmn'}`;
  const language = savedSchedule?.voice_language === 'en' ? 'English' : '中文';
  const format = savedSchedule?.voice_format === 'track' ? `追蹤 ${savedSchedule.tracked_bus_id || '未選車輛'}`
    : savedSchedule?.voice_format === 'verbose' ? '詳細播報' : '簡短播報';
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
  if (voiceFormatEl.value === 'track') {
    const bus = trackedVehicle(snapshot);
    if (!bus || bus.crossDirection && !bus.atStop ||
        !(bus.atStop || remainingVehicleWindow(bus)[0] <= threshold) || announcedVehicles.has(bus.id)) return;
    if (speak(trackedVoiceText(snapshot))) announcedVehicles.set(bus.id, Date.now());
    return;
  }
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
  const schedule = briefing ? `每 ${briefingIntervalEl.value || '5'} 分鐘播報`
    : `到站提醒 ${alertThresholdMinutes()} 分鐘`;
  const engine = voiceModelEl.value === 'api' ? '本機 TTS'
    : voiceModelEl.value.startsWith('espeak:') ? 'eSpeak' : '瀏覽器語音';
  voiceSettingsSummaryEl.textContent = `${schedule} · ${voiceLanguageEl.value === 'en' ? 'English' : '中文'}`;
  voiceSettingsEngineEl.textContent = `${voiceFormatEl.value === 'track' ? '追蹤車輛' : voiceFormatEl.value === 'verbose' ? '詳細' : '簡短'} · ${engine}`;
  document.querySelector('#alert-settings').hidden = briefing;
  document.querySelector('#briefing-settings').hidden = !briefing;
  if (voiceError || activeUtterance || activeAudio || pendingAudio) return;
  const voices = 'speechSynthesis' in window ? speechSynthesis.getVoices() : [];
  const hasLanguageVoice = voices.some(v => voiceLanguageEl.value === 'en'
    ? /^en/i.test(v.lang) : /^(zh|cmn)/i.test(v.lang));
  const localChoice = voiceModelEl.value === 'api' || voiceModelEl.value.startsWith('espeak:');
  voiceStateEl.className = 'voice-state';
  voiceStateEl.textContent = voiceFormatEl.value === 'track' && !trackedBusId() ? '請先從來車清單選擇追蹤車輛'
    : !latestSnapshot ? '正在載入站牌 · 可先試播'
    : voiceEnabled ? (briefing ? '已啟用；依設定間隔播報' : '已啟用；每輛車進入門檻時提醒')
    : localChoice ? '尚未啟用 · 可按「試播」檢查本機語音'
        : voices.length ? `尚未啟用 · ${hasLanguageVoice ? '所選語言語音可用' : '未找到對應語音，請先試播'}`
          : '尚未偵測到系統語音，請先試播';
}

function speakCurrentMode() {
  if (!latestSnapshot) return;
  if (voiceFormatEl.value === 'track' && voiceModeEl.value !== 'briefing') {
    if (speak(trackedVoiceText(latestSnapshot))) {
      const bus = trackedVehicle(latestSnapshot);
      if (bus && (!bus.crossDirection || bus.atStop) &&
          (bus.atStop || remainingVehicleWindow(bus)[0] <= alertThresholdMinutes() * 60))
        announcedVehicles.set(bus.id, Date.now());
    }
    return;
  }
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
  const visibleVehicles = data.vehicles.filter(bus => closedEl.checked || !bus.crossDirection || bus.id === trackedBusId());
  const approaching = [...visibleVehicles].sort((a, b) =>
    Number(b.atStop) - Number(a.atStop) || a.estimatedEtaSeconds - b.estimatedEtaSeconds || a.id.localeCompare(b.id));
  voiceEl.disabled = false;
  renderRoute({...data, vehicles: visibleVehicles});
  const fetched = data.feedFetchedAt || {};
  const feedAges = Object.values(fetched).filter(Boolean).map(value => Math.max(0, Math.round((Date.now() - Date.parse(value)) / 1000)));
  const oldestFeed = feedAges.length ? Math.max(...feedAges) : null;
  dataFreshnessEl.classList.toggle('stale', oldestFeed === null || oldestFeed > 90);
  setLiveStatus(oldestFeed === null || oldestFeed > 90 ? 'stale' : 'live');
  dataFreshnessEl.textContent = oldestFeed === null ? '尚無資料更新時間 · 請留意車輛回報'
    : `資料源最久 ${oldestFeed} 秒前更新` +
      (oldestFeed > 90 ? ' · 資料可能過時' : ' · 車輛回報見下方');
  uiI18n?.registerNames([[data.stop.name, data.stop.nameEn], ...(data.vehicles || []).map(bus => [bus.nextStop, bus.nextStopEn])]);
  document.querySelector('#stop-title').textContent = data.stop.name;
  renderStopDirection();
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
  syncEtaDisclosure();
  renderTrackedBus(data);
  renderLeaveAdvice(data);
  if (!preview) refreshPlanMatch();
  renderTravelGuidance();
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
      '各組依推估時間排序；車牌與官方下一班時間不一定能一一對應。'
    : '目前沒有可確認位置、正在接近本站的車輛。這不代表沒有班次；仍可參考上方官方下一班狀態。';
  document.querySelector('.approach-board').classList.toggle('is-empty', !approaching.length);
  vehiclesEl.replaceChildren();
  const groups = new Map();
  for (const [key, title, hint, buses] of [
    ['direct', `本方向接近本站 · ${directlyApproaching.length} 輛`, '依推估到站時間排列', directlyApproaching],
    ['next', `可能折返續行 · ${nextCircuit} 輛`, '另一方向須跑完並接續下一輪；不保證繼續載客',
      approaching.filter(bus => bus.crossDirection && !bus.atStop)]
  ]) {
    if (!buses.length) continue;
    const section = document.createElement('section'); section.className = `vehicle-group ${key}`;
    const heading = document.createElement('h4'); heading.textContent = title;
    const note = document.createElement('p'); note.textContent = hint;
    section.append(heading, note);
    vehiclesEl.append(section);
    groups.set(key, section);
  }
  let directIndex = 0, nextIndex = 0;
  for (const vehicle of approaching) {
    const nextGroup = vehicle.crossDirection && !vehicle.atStop;
    const row = document.createElement('article'); row.className = 'vehicle';
    row.dataset.busId = vehicle.id;
    if (!nextGroup && directIndex === 0) row.classList.add('first');
    const left = document.createElement('div'); left.className = 'vehicle-main';
    const heading = document.createElement('div'); heading.className = 'vehicle-heading';
    const number = document.createElement('span'); number.className = 'index';
    number.textContent = `第 ${nextGroup ? ++nextIndex : ++directIndex} 輛`;
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
    const track = document.createElement('button'); track.type = 'button'; track.className = 'vehicle-track';
    track.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg><span></span>';
    track.querySelector('span').textContent = trackedBusId() === vehicle.id ? '追蹤中' : '追蹤';
    track.setAttribute('aria-pressed', String(trackedBusId() === vehicle.id));
    track.setAttribute('aria-label', `${trackedBusId() === vehicle.id ? '停止追蹤' : '追蹤'} ${vehicle.id}`);
    track.addEventListener('click', () => selectTrackedBus(vehicle.id));
    row.append(left, away, track, details); groups.get(nextGroup ? 'next' : 'direct').append(row);
  }
  if (!activeUtterance && !activeAudio && !pendingAudio) voicePreviewEl.textContent = `播報內容：${briefingText(data)}`;
  if (!preview) announce(data);
  if (!voiceEnabled) syncVoiceMode();
}

function beginSelection() {
  const station = stops.find(s => s.direction === Number(directionEl.value) &&
    String(s.id) === String(stopEl.value));
  const name = station?.name || '所選站牌';
  renderStopDirection();
  renderScope();
  latestSnapshot = null;
  renderTrackedBus(null);
  if ((locationStopKey && locationStopKey !== currentStopKey()) ||
      (locationRequestKey && locationRequestKey !== currentStopKey())) {
    locationWalkMinutes = null;
    locationStopKey = '';
    locationRequestKey = '';
    ++locationRequestVersion;
    if (travelActive && lastTravelPosition && Date.now() - lastTravelPositionAt < 90_000)
      applyLocationPosition(lastTravelPosition, station, false);
    else if (useLocationEl.checked && !travelActive) requestLocation();
  }
  else if (useLocationEl.checked && !travelActive && !locationRequestKey && !locationStopKey && station) requestLocation();
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
  setLeaveAdvice('正在計算建議出發時間…', '正在計算…');
  renderTravelGuidance();
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
  if (!activeRoute || !stopEl.value) return;
  if (arrivalsPending && !selected && !fresh) return;
  const current = ++generation;
  const direction = directionEl.value, stop = stopEl.value;
  for (const controller of arrivalsControllers) controller.abort();
  arrivalsControllers = [];
  arrivalsPending = true;
  setLiveStatus('updating');
  if (selected) beginSelection();
  localStorage.setItem(routeStorage('stop-' + direction), stop);
  const routeId = activeRoute;
  const url = `api/arrivals?route_id=${routeId}&direction=${direction}&stop_id=${encodeURIComponent(stop)}&closed_loop=${closedEl.checked || travelReturnReferenceEl.checked || Boolean(trackedBusId()) ? 1 : 0}`;
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
        if (!displayed) { setLiveStatus('error'); showError(liveError?.message || '資料無法取得'); }
        else if (!liveDisplayed) {
          setLiveStatus('stale');
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
    if (current === generation && error.name !== 'AbortError') { setLiveStatus('error'); showError(error.message); }
  } finally {
    if (current === generation) {
      arrivalsPending = false;
      arrivalsControllers = [];
    }
  }
}

directionEl.addEventListener('change', () => {
  localStorage.setItem(routeStorage('direction'), directionEl.value);
  renderStopDirection();
  setStops();
});
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
stopEl.addEventListener('change', () => {
  syncStopSelection();
  renderSelectionSummary();
  renderScope();
  syncSavedTripCurrentState();
  update({selected: true, fresh: true});
});
function syncScopeHelpButton() {
  if (!arrivalScopeHelpEl || !scopeHelpToggleEl) return;
  scopeHelpToggleEl.setAttribute('aria-expanded', String(arrivalScopeHelpEl.open));
  const action = arrivalScopeHelpEl.open
    ? (uiI18n?.language === 'en' ? 'Hide why this option is needed' : '收合選項說明')
    : (uiI18n?.language === 'en' ? 'Show why this option is needed' : '顯示為什麼需要這個選項');
  scopeHelpToggleEl.setAttribute('aria-label', action);
  scopeHelpToggleEl.title = action;
}
scopeHelpToggleEl?.addEventListener('click', () => {
  arrivalScopeHelpEl.open = !arrivalScopeHelpEl.open;
  syncScopeHelpButton();
});
arrivalScopeHelpEl?.addEventListener('toggle', syncScopeHelpButton);
window.addEventListener('aheadway:languagechange', syncScopeHelpButton);
syncScopeHelpButton();
closedEl.addEventListener('change', () => {
  if (closedEl.checked) {
    travelReturnReferenceEl.checked = true;
    localStorage.setItem(routeStorage('return-reference'), '1');
    syncPlanReturnReference();
  }
  localStorage.setItem(routeStorage('closed-loop'), closedEl.checked ? '1' : '0');
  syncSaveTripAction();
  renderScope();
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
  syncVoiceMode();
  if (voiceEnabled && voiceModeEl.value === 'briefing') { speakCurrentMode(); update(); }
});
walkMinutesEl.addEventListener('change', () => {
  if (useLocationEl.checked) return;
  const minutes = Math.max(0, Math.min(60, Math.round(Number(walkMinutesEl.value) || 0)));
  walkMinutesEl.value = String(minutes);
  manualWalkMinutes = String(minutes);
  localStorage.setItem('orange5-walk-minutes', String(minutes));
  locationStateEl.textContent = '使用手動步行時間。';
  if (latestSnapshot) renderLeaveAdvice(latestSnapshot);
  renderPlanPurpose();
  syncPushSettings();
});
planBufferEl.addEventListener('change', () => {
  const minutes = planBufferMinutes();
  planBufferEl.value = String(minutes);
  localStorage.setItem('bus-tracker-plan-buffer', String(minutes));
  if (latestSnapshot) renderLeaveAdvice(latestSnapshot);
  renderPlanPurpose();
});
voiceModelEl.addEventListener('change', () => {
  preferredVoiceModel = voiceModelEl.value;
  localStorage.setItem(`orange5-voice-model-${voiceLanguageEl.value}`, preferredVoiceModel);
  apiVoiceSettingsEl.hidden = preferredVoiceModel !== 'api';
  voiceError = null;
  syncVoiceMode();
});
apiModelEl.addEventListener('change', () => localStorage.setItem('orange5-api-model', apiModelEl.value.trim() || 'tts-1'));
apiVoiceEl.addEventListener('change', () => localStorage.setItem('orange5-api-voice', apiVoiceEl.value.trim() || 'anne'));
if (!publicMode) document.querySelector('#schedule-save').addEventListener('click', async () => {
  if (scheduleEnabledEl.checked && voiceFormatEl.value === 'track' && !trackedBusId()) {
    scheduleStateEl.textContent = '請先從來車清單選擇追蹤車輛。'; return;
  }
  const selected = voiceModelEl.value;
  const payload = {enabled: scheduleEnabledEl.checked, time: scheduleTimeEl.value, route_id: activeRoute,
    direction: Number(directionEl.value), stop_id: Number(stopEl.value), closed_loop: closedEl.checked,
    mode: voiceModeEl.value, duration_minutes: Math.max(1, Math.min(720, Math.round(Number(scheduleDurationEl.value) || 60))),
    briefing_interval_minutes: Math.max(1, Math.min(60, Math.round(Number(briefingIntervalEl.value) || 5))),
    alert_threshold_minutes: alertThresholdMinutes(),
    voice_format: voiceFormatEl.value, tracked_bus_id: voiceFormatEl.value === 'track' ? trackedBusId() : '',
    voice_language: voiceLanguageEl.value,
    voice_engine: selected === 'api' ? 'api' : 'espeak',
    voice_model: apiModelEl.value.trim() || 'tts-1',
    voice_name: selected === 'api' ? (apiVoiceEl.value.trim() || 'anne')
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
const disclosureCards = [...document.querySelectorAll('#arrival-summary, #approach-board, #departure-card, #route-view, #voice-card')];
const departureMoreEl = document.querySelector('#departure-more');
const approachBoardEl = document.querySelector('#approach-board');
const approachPanelEl = document.querySelector('#approach-panel');
const etaCardEl = document.querySelector('#eta-card');
const voiceCardEl = document.querySelector('#voice-card');
const arrivalVoiceShortcutEl = document.querySelector('#arrival-voice-shortcut');
function syncEtaDisclosure() {
  const english = uiI18n?.language === 'en';
  etaCardEl.setAttribute('aria-expanded', String(!approachPanelEl.hidden));
  const estimate = document.querySelector('#eta').textContent;
  etaCardEl.setAttribute('aria-label', english
    ? `Official next bus: ${estimate}. ${approachPanelEl.hidden ? 'Show' : 'Hide'} all detected buses`
    : `官方下一班預估：${estimate}。${approachPanelEl.hidden ? '顯示' : '收合'}所有來車`);
}
function toggleArrivalBuses() {
  approachPanelEl.hidden = !approachPanelEl.hidden;
  if (approachPanelEl.hidden) approachBoardEl.open = false;
  saveRouteDisclosureState();
  syncEtaDisclosure();
  syncDisclosureToggle();
}
etaCardEl.addEventListener('click', toggleArrivalBuses);
etaCardEl.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  toggleArrivalBuses();
});
approachBoardEl.addEventListener('toggle', syncEtaDisclosure);
arrivalVoiceShortcutEl.addEventListener('click', () => {
  voiceCardEl.open = true;
  voiceSettingsEl.open = true;
  saveRouteDisclosureState();
  requestAnimationFrame(() => {
    voiceCardEl.scrollIntoView({behavior: 'smooth', block: 'start'});
    voiceSettingsEl.querySelector('summary').focus({preventScroll: true});
  });
});
window.addEventListener('aheadway:languagechange', () => {
  const label = uiI18n?.language === 'en' ? 'Go to voice settings' : '前往語音設定';
  arrivalVoiceShortcutEl.setAttribute('aria-label', label);
  arrivalVoiceShortcutEl.title = label;
  syncEtaDisclosure();
});
syncEtaDisclosure();

const visibleDisclosureCards = () => disclosureCards.filter(card => !card.hidden &&
  getComputedStyle(card).display !== 'none' &&
  (card.id !== 'approach-board' || (!approachPanelEl.hidden &&
    getComputedStyle(document.querySelector('#arrival-summary')).display !== 'none')));
const routeDisclosureKey = 'aheadway-route-disclosures-v1';
const disclosureProfile = () => window.matchMedia('(max-width:650px)').matches ? 'phone' : 'desktop';
let routeDisclosureState = {};
try {
  const stored = JSON.parse(localStorage.getItem(routeDisclosureKey) || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) routeDisclosureState = stored;
} catch (_) { /* Ignore damaged disclosure preferences. */ }
function saveRouteDisclosureState() {
  if (!activeRoute) return;
  routeDisclosureState[`${activeRoute}:${disclosureProfile()}`] = {
    ...Object.fromEntries(disclosureCards.map(card => [card.id, card.open])),
    'departure-more': departureMoreEl.open,
    'approach-panel': !approachPanelEl.hidden
  };
  try { localStorage.setItem(routeDisclosureKey, JSON.stringify(routeDisclosureState)); } catch (_) {}
}
function applyRouteDisclosureState(routeId) {
  const saved = routeDisclosureState[`${routeId}:${disclosureProfile()}`] ||
    (disclosureProfile() === 'phone' ? routeDisclosureState[String(routeId)] : null) || {};
  const desktop = !window.matchMedia('(max-width:650px)').matches;
  const hasPanelState = typeof saved['approach-panel'] === 'boolean';
  approachPanelEl.hidden = hasPanelState ? !saved['approach-panel'] : !desktop;
  for (const card of disclosureCards) {
    const defaultOpen = desktop || card.id === 'arrival-summary' || card.id === 'departure-card';
    const useSaved = typeof saved[card.id] === 'boolean' && (card.id !== 'approach-board' || hasPanelState);
    card.open = useSaved ? saved[card.id] : defaultOpen;
  }
  departureMoreEl.open = saved['departure-more'] === true;
  syncEtaDisclosure();
  syncDisclosureToggle();
}
function syncDisclosureToggle() {
  const expanded = visibleDisclosureCards().every(card => card.open) &&
    (document.body.classList.contains('display-hide-following') || !approachPanelEl.hidden);
  const english = uiI18n?.language === 'en';
  const action = expanded
    ? (english ? 'Collapse all sections' : '全部收合')
    : (english ? 'Expand all sections' : '全部展開');
  disclosureToggleEl.querySelector('.disclosure-toggle-label').textContent = expanded
    ? (english ? 'Collapse all' : '全部收合')
    : (english ? 'Expand all' : '全部展開');
  disclosureToggleEl.setAttribute('aria-label', action);
  disclosureToggleEl.title = action;
  disclosureToggleEl.setAttribute('aria-pressed', String(expanded));
  disclosureToggleEl.dataset.state = expanded ? 'expanded' : 'collapsed';
  updateRouteOverflow();
  requestAnimationFrame(keepActiveRouteTabVisible);
}
disclosureCards.forEach(card => {
  card.addEventListener('toggle', syncDisclosureToggle);
  card.addEventListener('click', event => {
    if (event.target.closest('summary')?.parentElement === card)
      setTimeout(saveRouteDisclosureState, 0);
  });
});
departureMoreEl.addEventListener('click', event => {
  if (event.target.closest('summary')?.parentElement === departureMoreEl)
    setTimeout(saveRouteDisclosureState, 0);
});
disclosureToggleEl.addEventListener('click', () => {
  const expanded = visibleDisclosureCards().every(card => card.open) &&
    (document.body.classList.contains('display-hide-following') || !approachPanelEl.hidden);
  if (!document.body.classList.contains('display-hide-following')) approachPanelEl.hidden = expanded;
  visibleDisclosureCards().forEach(card => { card.open = !expanded; });
  if (expanded) approachBoardEl.open = false;
  else if (!approachPanelEl.hidden) approachBoardEl.open = true;
  saveRouteDisclosureState();
  syncEtaDisclosure();
  syncDisclosureToggle();
});
window.addEventListener('aheadway:languagechange', syncDisclosureToggle);
syncDisclosureToggle();
function setRouteExpanded(expanded) {
  routePanelEl.open = expanded;
  saveRouteDisclosureState();
}
const compactScreen = window.matchMedia?.('(max-width:650px)');
mapDetailEl.open = !compactScreen?.matches;
let wasCompact = Boolean(compactScreen?.matches);
function applyScreenSize(compact) {
  if (compact === wasCompact) return;
  wasCompact = compact;
  mapDetailEl.open = !compact;
  if (activeRoute) applyRouteDisclosureState(activeRoute);
}
compactScreen?.addEventListener?.('change', event => applyScreenSize(event.matches));
window.addEventListener?.('resize', () => applyScreenSize(Boolean(compactScreen?.matches)));
document.addEventListener?.('visibilitychange', () => {
  if (document.hidden) return;
  update();
  if (mobileMode === 'travel' && travelActive && Date.now() - lastTravelPositionAt > 30_000)
    refreshTravelPosition();
});
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
for (const tab of routeTabs) bindRouteTab(tab);
document.querySelector('#route-find').addEventListener('click', () => {
  if (document.querySelector('#search-by-stop').getAttribute('aria-pressed') === 'true')
    document.dispatchEvent(new Event('aheadway:search-stop'));
  else searchRouteCatalog();
});
window.addEventListener('aheadway:languagechange', () => renderCatalogMatches(catalogMatches));
window.addEventListener('aheadway:languagechange', () => {
  if (stops.length) renderRoute(latestSnapshot);
});
routeQueryEl.addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); document.querySelector('#route-find').click(); }
});
routeRemoveEl.addEventListener('click', () => {
  if (!activeRoute) return;
  const opening = routeRemoveConfirmEl.hidden;
  closeRouteRemoval();
  if (!opening) return;
  routePickerEl.open = false;
  syncRouteAddButton();
  const name = routes[activeRoute].name;
  const tripCount = savedTrips.filter(trip => trip.routeId === activeRoute).length;
  const hasPhoneAlert = pushTarget?.routeId === activeRoute && localStorage.getItem(pushEnabledKey) === '1';
  const hasSchedule = savedSchedule?.enabled && savedSchedule.route_id === activeRoute;
  routeRemoveTitleEl.textContent = hasPhoneAlert ? '請先關閉手機通知'
    : hasSchedule ? '請先關閉語音排程' : `移除 ${name} 路線？`;
  routeRemoveDescriptionEl.textContent = `這會移除本瀏覽器的路線分頁${tripCount ? `及 ${tripCount} 筆常用行程` : ''}；日後可再次搜尋加入。` +
    (hasPhoneAlert ? ' 已啟用的手機通知仍會繼續；請先在下方關閉通知。' : '') +
    (hasSchedule ? ' 已啟用的語音排程仍會繼續；請先在語音設定中關閉排程。' : '');
  document.querySelector('#route-remove-accept').hidden = hasPhoneAlert || hasSchedule;
  routeRemoveConfirmEl.hidden = false;
  document.querySelector('#route-current-actions').hidden = false;
  routeRemoveEl.setAttribute('aria-expanded', 'true');
  document.querySelector('#route-remove-cancel').focus();
});
document.querySelector('#route-remove-cancel').addEventListener('click', () => {
  closeRouteRemoval(); routeRemoveEl.focus();
});
document.querySelector('#route-remove-accept').addEventListener('click', () => {
  if (!activeRoute) return;
  if (pushTarget?.routeId === activeRoute && localStorage.getItem(pushEnabledKey) === '1') return;
  if (savedSchedule?.enabled && savedSchedule.route_id === activeRoute) return;
  const index = addedRouteIds.indexOf(activeRoute);
  if (index < 0) return;
  ++routeGeneration;
  ++generation;
  for (const controller of arrivalsControllers) controller.abort();
  arrivalsControllers = [];
  const removed = activeRoute;
  delete routeDisclosureState[String(removed)];
  try { localStorage.setItem(routeDisclosureKey, JSON.stringify(routeDisclosureState)); } catch (_) {}
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(`bus-tracker-tracked-${removed}:`)) localStorage.removeItem(key);
  }
  addedRouteIds.splice(index, 1);
  localStorage.setItem('bus-tracker-added-routes', JSON.stringify(addedRouteIds));
  savedTrips = savedTrips.filter(trip => trip.routeId !== removed);
  localStorage.setItem('bus-tracker-saved-trips', JSON.stringify(savedTrips));
  closeRouteRemoval();
  renderSavedTrips();
  if (addedRouteIds.length) {
    activeRoute = null;
    renderRouteTabs();
    switchRoute(addedRouteIds[Math.min(index, addedRouteIds.length - 1)]);
  } else {
    stopTravelTracking();
    travelFloatEl.hidden = true;
    if (voiceEnabled) { voiceEnabled = false; voiceEl.setAttribute('aria-pressed', 'false'); }
    ++playbackGeneration;
    stopAudio();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    renderRouteTabs();
    document.querySelector('#first-route-add').focus();
  }
});
setEmptyRouteState();
hydrateRoutes().then(hydrateSavedTripStopNames);
if (publicMode && pushNeedsRemoval()) {
  pushToggleEl.textContent = localStorage.getItem(pushPendingRemoveKey) === '1' ? '重試關閉手機通知' : '關閉手機通知';
  pushStateEl.textContent = localStorage.getItem(pushPendingRemoveKey) === '1'
    ? '上次關閉尚未完成；可重試。'
    : pushTarget ? '已啟用；關閉頁面仍可通知。'
      : '正在確認手機通知目標…';
}
if (!publicMode) request('api/schedule').then(data => {
  savedSchedule = data;
  scheduleEnabledEl.checked = data.enabled;
  scheduleTimeEl.value = data.time;
  scheduleDurationEl.value = data.duration_minutes || 60;
  scheduleStatus();
}).catch(error => {scheduleStateEl.textContent = `無法讀取排程：${error.message}`;});
uiI18n?.registerNames(Object.values(routes).flatMap(route => [[route.name, route.english], ...route.heads.map((head, i) => [head, route.headsEn?.[i]])]));
setInterval(() => {
  update();
  if (mobileMode === 'travel' && travelActive) {
    if (Date.now() - lastTravelPositionAt >= 30_000) refreshTravelPosition();
  } else if (useLocationEl.checked && stopEl.value) requestLocation();
}, 30_000);
setInterval(() => {
  if (!latestSnapshot) return;
  renderLeaveAdvice(latestSnapshot);
  refreshPlanMatch();
  renderTravelGuidance();
  const buses = new Map(latestSnapshot.vehicles.map(bus => [bus.id, bus]));
  for (const row of vehiclesEl.querySelectorAll('.vehicle')) {
    const bus = buses.get(row.dataset.busId);
    if (bus && !bus.atStop) row.querySelector('.away strong').textContent = etaRangeLabel(bus);
  }
}, 10_000);

/* Preferences: language and the visible sections of the main page. */
(() => {
  const keys = ['official', 'following', 'leave', 'tracked', 'route', 'voice'];
  const labels = {
    'zh-TW': {official:'官方下一班', following:'後續來車', leave:'建議出發', tracked:'追蹤車輛', route:'路線圖', voice:'語音提醒', count:n=>`顯示 ${n} 項`, one:'至少保留一項資訊。'},
    en: {official:'Official next bus', following:'Following buses', leave:'When to leave', tracked:'Tracked bus', route:'Route view', voice:'Voice alerts', count:n=>`${n} shown`, one:'Keep at least one item visible.'}
  };
  const storageKey = 'aheadway-main-display-widgets-v2';
  const settings = document.querySelector('#display-settings');
  const toggle = document.querySelector('#display-settings-toggle');
  const choices = document.querySelector('#display-choices');
  const message = document.querySelector('#display-message');
  const words = () => labels[uiI18n?.language === 'en' ? 'en' : 'zh-TW'];
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (Array.isArray(saved)) return [...new Set(saved.filter(id => keys.includes(id)))];
      const old = JSON.parse(localStorage.getItem('aheadway-main-display-widgets-v1') || 'null');
      if (Array.isArray(old)) return [...new Set([...old, 'route', 'voice'].filter(id => keys.includes(id)))];
    } catch (_) { /* Use all sections when browser storage is unavailable. */ }
    return [...keys];
  }
  let selected = read();
  if (!selected.length) selected = [...keys];
  function apply() {
    for (const id of keys) document.body.classList.toggle(`display-hide-${id}`, !selected.includes(id));
    document.body.classList.remove('display-hide-data');
    document.body.classList.toggle('display-hide-arrival', !['official','following','tracked'].some(id => selected.includes(id)));
    document.querySelector('#display-count').textContent = words().count(selected.length);
    for (const button of choices.querySelectorAll('button')) button.setAttribute('aria-pressed', String(selected.includes(button.dataset.widget)));
  }
  function render() {
    choices.replaceChildren();
    for (const id of keys) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'display-choice'; button.dataset.widget = id;
      const mark = document.createElement('span'); mark.className = 'display-choice-mark';
      mark.setAttribute('aria-hidden', 'true'); mark.textContent = '✓';
      button.append(mark, document.createTextNode(words()[id]));
      button.addEventListener('click', () => {
        if (selected.includes(id)) {
          if (selected.length === 1) { message.textContent = words().one; return; }
          selected = selected.filter(item => item !== id);
        } else selected.push(id);
        try { localStorage.setItem(storageKey, JSON.stringify(selected)); } catch (_) { /* Apply for this session. */ }
        message.textContent = ''; apply();
      });
      choices.append(button);
    }
    apply();
  }
  function syncToggle() { toggle.setAttribute('aria-expanded', String(settings.open)); }
  toggle.addEventListener('click', () => {
    settings.open = !settings.open;
    if (settings.open && hasSelectedStop()) selectionCardEl.open = false;
    syncToggle();
    if (settings.open) settings.scrollIntoView({behavior:'smooth', block:'start'});
  });
  settings.addEventListener('toggle', syncToggle);
  document.querySelector('.route-tabs').addEventListener('click', event => {
    if (event.target.closest('[role=tab]')) settings.open = false;
  });
  routeAddEl.addEventListener('click', () => { settings.open = false; });
  window.addEventListener('aheadway:languagechange', () => { message.textContent = ''; render(); });
  window.addEventListener('storage', event => { if (event.key === storageKey) { selected = read(); render(); } });
  syncToggle(); render();
})();

/* Search by route name or by one boarding stop inside the same route finder. */
(() => {
  const picker = document.querySelector('#route-picker');
  const routeMode = document.querySelector('#search-by-route');
  const stopMode = document.querySelector('#search-by-stop');
  const routePanel = document.querySelector('#route-search-panel');
  const stopPanel = document.querySelector('#stop-search-panel');
  const query = routeQueryEl;
  const queryLabel = document.querySelector('#search-query-label');
  const status = document.querySelector('#stop-search-status');
  const suggestions = document.querySelector('#stop-search-suggestions');
  const results = document.querySelector('#stop-search-results');
  let version = 0;
  const english = () => uiI18n?.language === 'en';
  const local = (zh, en) => english() ? (en || zh) : zh;
  function mode(byStop) {
    routeMode.setAttribute('aria-pressed', String(!byStop));
    stopMode.setAttribute('aria-pressed', String(byStop));
    routePanel.hidden = byStop;
    stopPanel.hidden = !byStop;
    query.value = '';
    queryLabel.textContent = byStop ? local('站牌名稱','Stop name') : local('路線名稱或官方連結','Route name or official link');
    query.placeholder = byStop ? local('例如 捷運景安站','e.g. Jingan MRT Station')
      : local('例如 橘5、Orange 5、908，或貼上 route.jsp 連結','e.g. 908, Orange 5, or a route.jsp link');
    query.focus();
  }
  routeMode.addEventListener('click', () => mode(false));
  stopMode.addEventListener('click', () => mode(true));
  async function search() {
    const current = ++version;
    const needle = query.value.trim();
    results.replaceChildren(); suggestions.replaceChildren();
    if (!needle) { status.textContent = local('請輸入站牌名稱。','Enter a stop name.'); query.focus(); return; }
    status.textContent = local('正在尋找站牌與路線…','Finding stops and routes…');
    try {
      const data = await request(`api/stop-routes?q=${encodeURIComponent(needle)}`);
      if (current !== version) return;
      if (data.suggestions.length) {
        const label = document.createElement('strong');
        label.textContent = local('相近站牌：','Matching stops:'); suggestions.append(label);
      }
      for (const stop of data.suggestions) {
        const button = document.createElement('button'); button.type = 'button'; button.dataset.noI18n = '';
        button.textContent = local(stop.name,stop.nameEn);
        button.addEventListener('click', () => { query.value = stop.name; search(); });
        suggestions.append(button);
      }
      status.textContent = data.routes.length
        ? local(`找到 ${data.routes.length} 個路線與方向，請選擇要查看的上車站。`,
                `${data.routes.length} route and direction matches. Choose one to see arrivals.`)
        : local('找不到經過此站的路線。請試試相近站名。','No routes found at this stop. Try a suggested stop name.');
      for (const item of data.routes) {
        const card = document.createElement('button'); card.type = 'button';
        card.className = 'stop-route-result'; card.dataset.noI18n = '';
        const title = document.createElement('strong');
        title.textContent = `${local(item.routeName,item.routeNameEn)} · ${local(item.head,item.headEn)}`;
        const stop = document.createElement('span'); stop.textContent = local(item.stopName,item.stopNameEn);
        const eta = document.createElement('span'); eta.textContent = item.officialMinutes == null
          ? local('本站下一班：暫無可靠官方預估','Next bus here: no reliable official estimate')
          : local(`本站官方下一班：約 ${item.officialMinutes} 分鐘`,`Official next bus here: about ${item.officialMinutes} min`);
        card.addEventListener('click', async () => {
          card.disabled = true;
          status.textContent = local('正在開啟路線與站牌…','Opening route and stop…');
          try {
            if (!routes[item.routeId]) {
              const [meta] = await request(`api/routes?ids=${item.routeId}`);
              if (!meta) throw new Error(local('路線資料暫不可用。','Route information is unavailable.'));
              rememberRoute(meta);
            }
            const applied = await switchRoute(item.routeId, {direction:item.direction, stopId:item.stopId,
              closedLoop:knownLoopRouteIds.includes(item.routeId)});
            if (!applied) throw new Error(local('此站牌暫時無法選擇。','This stop cannot be selected right now.'));
            picker.open = false; selectionCardEl.open = false;
            const arrival = document.querySelector('#arrival-summary');
            arrival.open = true;
            arrival.scrollIntoView({behavior:'smooth',block:'start'});
            status.textContent = local('已選擇路線與站牌。','Route and stop selected.');
            await update({selected:true,fresh:true});
          } catch (error) { status.textContent = error.message; card.disabled = false; }
        });
        card.append(title,stop,eta); results.append(card);
      }
    } catch (error) { if (current === version) status.textContent = error.message; }
  }
  document.addEventListener('aheadway:search-stop', search);
  window.addEventListener('aheadway:languagechange', () => {
    const byStop = stopMode.getAttribute('aria-pressed') === 'true';
    queryLabel.textContent = byStop ? local('站牌名稱','Stop name') : local('路線名稱或官方連結','Route name or official link');
    query.placeholder = byStop ? local('例如 捷運景安站','e.g. Jingan MRT Station')
      : local('例如 橘5、Orange 5、908，或貼上 route.jsp 連結','e.g. 908, Orange 5, or a route.jsp link');
  });
})();
