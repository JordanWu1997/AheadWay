const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(error = null, publicMode = false, mobile = false) {
  const elements = new Map();
  const spoken = [];
  const audioPlayed = [];
  const voiceRequests = [];
  const pageRequests = [];
  const pageResponses = [];
  let createdNode = 0;
  const tabs = [16405, 16585, 16664].map(id => ({dataset: {route: String(id)},
    events: {}, setAttribute() {}, addEventListener(name, fn) {this.events[name] = fn;}, focus() {}, click() {this.events.click();}}));
  function svgNode(tagName) {
    return {tagName, attributes: {}, children: [], textContent: '',
      setAttribute(name, value) {this.attributes[name] = value;},
      append(...children) {this.children.push(...children);},
      addEventListener() {}};
  }
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', checked: false, textContent: '', disabled: false, hidden: false, options: [{textContent: ''}, {textContent: ''}],
      events: {}, dataset: {}, classList: {add() {}, remove() {}, toggle() {}},
      children: [], attributes: {},
      addEventListener(name, fn) {this.events[name] = fn;}, focus() {},
      setAttribute(name, value) {this.attributes[name] = value;},
      replaceChildren(...children) {this.children = children;},
      append(...children) {this.children.push(...children);}, querySelectorAll() {return [];}
    });
    return elements.get(id);
  }
  const synth = {
    paused: false,
    getVoices: () => [{lang: 'zh-TW', name: 'Mandarin'}, {lang: 'en-US', name: 'English'}],
    addEventListener() {}, cancel() {},
    speak(utterance) {
      spoken.push(utterance);
      if (error) utterance.onerror({error});
      else { utterance.onstart(); utterance.onend(); }
    }
  };
  class Utterance { constructor(text) {this.text = text;} }
  class Audio {
    constructor(url) {this.url = url;}
    play() {audioPlayed.push(this.url); this.onplaying(); return Promise.resolve();}
    pause() {}
    removeAttribute() {}
    load() {}
  }
  const fetch = (url, options) => {
    if (url === 'api/voice') {
      voiceRequests.push(JSON.parse(options.body));
      return Promise.resolve({ok: true, blob: () => Promise.resolve({type: 'audio/wav'})});
    }
    pageRequests.push(url);
    return new Promise((resolve, reject) => pageResponses.push({url, options, resolve, reject}));
  };
  const mobileButtons = [0, 1].map(direction => {
    const button = element(`#mobile-leg-${direction}`);
    button.dataset.mobileLeg = String(direction);
    return button;
  });
  const context = vm.createContext({
    document: {querySelector: element, querySelectorAll: selector => selector === '.route-tabs [role="tab"]' ? tabs :
      selector === '[data-mobile-leg]' ? mobileButtons : [],
      createElement: () => element(`created-${++createdNode}`), createElementNS: (_namespace, tag) => svgNode(tag)},
    window: {speechSynthesis: synth, SpeechSynthesisUtterance: Utterance, BUS_TRACKER_PUBLIC: publicMode,
      matchMedia: () => ({matches: mobile})},
    speechSynthesis: synth, SpeechSynthesisUtterance: Utterance,
    localStorage: {getItem: () => null, setItem() {}},
    fetch, Audio, URL: {createObjectURL: () => 'blob:test-audio', revokeObjectURL() {}},
    setInterval() {}, console,
  });
  const code = fs.readFileSync(path.join(__dirname, 'static/app.js'), 'utf8');
  vm.runInContext(code, context);
  const snapshot = {
    direction: 0, directionLabel: '往捷運景安站', closedLoop: true,
    stop: {id: 122402, name: '捷運景安站(景平路)', nameEn: 'MRT Jingan Sta.(Jingping Rd.)'},
    officialEtaSeconds: 360, officialStatus: null,
    vehicles: [{id: 'EAA-109', stopsAway: 3, estimatedEtaSeconds: 420, estimatedEtaWindowSeconds: [330, 540],
      nextStop: '中興街口', nextStopEn: 'Zhongxing Rd. Intersection', atStop: false},
    {id: 'EAA-121', stopsAway: 7, estimatedEtaSeconds: 840, estimatedEtaWindowSeconds: [720, 960],
      nextStop: '新海橋頭', nextStopEn: 'Xinhai Bridge', atStop: false}]
  };
  vm.runInContext(`latestSnapshot = ${JSON.stringify(snapshot)}`, context);
  return {elements, spoken, audioPlayed, voiceRequests, pageRequests, pageResponses, tabs, context, snapshot, element};
}

{
  const h = harness(null, false, true);
  assert.equal(h.element('#route-body').hidden, false, 'mobile stop lists start expanded');
  assert.equal(h.element('#map-detail').open, false, 'mobile route map starts collapsed');
  const html = fs.readFileSync(path.join(__dirname, 'static/index.html'), 'utf8');
  assert.match(html, /<details id="api-voice-settings"/);
  assert.match(html, /id="route-search"/);
  assert.match(html, /id="jump-to-stop"/);
  assert.ok(html.indexOf('class="arrival-scope"') > html.indexOf('class="controls"') &&
    html.indexOf('class="arrival-scope"') < html.indexOf('class="results"'),
  'arrival scope is visible before the arrival estimates');
  const ordered = ['class="route-tabs"', 'class="route-picker"', 'class="trip-bar"',
    'class="controls"', 'class="arrival-scope"'];
  assert.ok(ordered.every((part, index) => index === 0 || html.indexOf(ordered[index - 1]) < html.indexOf(part)),
    'route tabs, route picker, saved trips, stop selector, and arrival scope appear in order');
  assert.equal((html.match(/id="closed-loop"/g) || []).length, 1);
  assert.match(h.element('#saved-trips').children[0].textContent, /尚無常用行程/);
}

{
  const h = harness();
  const requests = [];
  h.context.navigator = {geolocation: {getCurrentPosition(success, failure) {requests.push({success, failure});}}};
  h.context.window.isSecureContext = true;
  h.element('#direction').value = '0';
  h.element('#stop').value = '2';
  vm.runInContext("renderRouteMap = () => {}; stops = [{id: 2, direction: 0, name: '測試站', lat: 25, lon: 121}, {id: 3, direction: 0, name: '下一站', lat: 25.01, lon: 121.01}]", h.context);
  const toggle = h.element('#use-location');
  toggle.checked = true;
  toggle.events.change();
  assert.equal(h.element('#walk-minutes').readOnly, true);
  assert.equal(h.element('#walk-source').textContent, '定位中 · 暫用手動');
  requests[0].success({coords: {latitude: 25, longitude: 121, accuracy: 10}});
  assert.equal(h.element('#walk-source').textContent, '依目前位置');
  assert.equal(h.element('#walk-minutes').value, '1');
  assert.equal(h.element('#location-refresh').hidden, false);
  h.element('#location-refresh').events.click();
  assert.equal(requests.length, 2, 'reposition requests a fresh browser location');
  requests[1].success({coords: {latitude: 25, longitude: 121, accuracy: 10}});
  h.element('#stop').value = '3';
  vm.runInContext('beginSelection()', h.context);
  assert.equal(requests.length, 3, 'changing stops requests a fresh location');
  toggle.checked = false;
  toggle.events.change();
  requests[2].success({coords: {latitude: 25.01, longitude: 121.01, accuracy: 10}});
  assert.equal(h.element('#walk-minutes').readOnly, false);
  assert.equal(h.element('#walk-minutes').value, '5', 'switching off restores the saved manual time');
  assert.equal(h.element('#walk-source').textContent, '手動設定');
  toggle.checked = true;
  toggle.events.change();
  requests[3].failure();
  assert.equal(toggle.checked, false, 'a denied location request returns to manual mode');
  assert.equal(h.element('#walk-minutes').readOnly, false);
  assert.match(h.element('#location-state').textContent, /檢查定位權限/);
}

{
  const desktop = harness(null, true, false);
  const phone = harness(null, true, true);
  assert.equal(desktop.element('#mobile-reminder').hidden, true,
    'phone-only reminder controls are hidden on a desktop viewport');
  assert.equal(phone.element('#mobile-reminder').hidden, false,
    'phone reminder controls are visible on a narrow viewport');
  const watches = [];
  const cleared = [];
  phone.context.navigator = {geolocation: {
    watchPosition(success, failure) {watches.push({success, failure}); return 7;},
    clearWatch(id) {cleared.push(id);},
    getCurrentPosition() {}
  }, vibrate() {}};
  phone.context.window.isSecureContext = true;
  phone.element('#direction').value = '0';
  phone.element('#stop').value = '122402';
  vm.runInContext(`stops = [{id:122402,direction:0,name:'測試站',lat:25,lon:121}];
    latestSnapshot.routeId=16405;
    latestSnapshot.updatedAt=new Date().toISOString();
    latestSnapshot.feedFetchedAt={BusData:new Date().toISOString(),
      BusEvent:new Date().toISOString(),EstimateTime:new Date().toISOString()};
    latestSnapshot.vehicles=[];
    latestSnapshot.officialEtaSeconds=900;
    renderLeaveAdvice(latestSnapshot)`, phone.context);
  assert.match(phone.element('#leave-advice').textContent, /建議/);
  phone.element('#mobile-travel').events.click();
  assert.equal(watches.length, 1);
  watches[0].success({coords: {latitude: 25.0025, longitude: 121, accuracy: 10}});
  assert.equal(phone.element('#travel-result').dataset.level, 'ok');
  vm.runInContext(`latestSnapshot.vehicles=[{id:'same-possible-bus',confidence:'high',
    lastSeen:new Date().toISOString(),estimatedEtaWindowSeconds:[120,600]}];
    renderTravelGuidance()`, phone.context);
  assert.equal(phone.element('#travel-result').dataset.level, 'ok',
    'an early vehicle bound must not override the official next ETA for the same possible bus');
  vm.runInContext('latestSnapshot.officialEtaSeconds=450; renderTravelGuidance()', phone.context);
  assert.equal(phone.element('#travel-result').dataset.level, 'hurry');
  assert.equal(phone.element('#travel-float').hidden, false);
  vm.runInContext('latestSnapshot.officialEtaSeconds=240; renderTravelGuidance()', phone.context);
  assert.equal(phone.element('#travel-result').dataset.level, 'miss');
  vm.runInContext(`renderRouteMap=()=>{};
    stops.push({id:122403,direction:0,name:'下一站',lat:25.001,lon:121})`, phone.context);
  phone.element('#stop').value = '122403';
  vm.runInContext('beginSelection()', phone.context);
  assert.equal(watches.length, 1, 'the active location watch follows the new stop');
  assert.equal(phone.element('#travel-result').dataset.level, 'waiting',
    'travel guidance waits for fresh bus data at the new stop');
  phone.element('#mobile-plan').events.click();
  assert.equal(phone.element('#travel-float').hidden, true);
  assert.equal(phone.element('#travel-panel').hidden, true);
  assert.deepEqual(cleared, [7], 'leaving travel mode stops continuous location tracking');
  phone.element('#mobile-travel').events.click();
  watches[1].failure({message: 'permission denied'});
  assert.equal(phone.element('#travel-result').dataset.level, 'waiting');
  assert.equal(phone.element('#travel-action').textContent, '重試定位');
  assert.match(phone.element('#travel-detail').textContent, /permission denied/);
}

{
  const routeTools = harness();
  routeTools.element('#route-add').events.click();
  assert.equal(routeTools.element('#route-picker').open, true);
  assert.equal(routeTools.element('#route-add').attributes['aria-expanded'], 'true');
  vm.runInContext(`routes[10841]={name:'0東',source:'taipei',heads:['去程','返程']};
    addedRouteIds=[10841]; activeRoute=10841; renderRouteTabs()`, routeTools.context);
  assert.equal(routeTools.element('#route-remove').hidden, false,
    'selected added route has a remove action beside the tabs');
  assert.equal(routeTools.element('#route-remove').textContent, '移除 0東 分頁');
}

{
  const h = harness();
  h.element('#stop').value = '122402';
  const control = h.element('#closed-loop');
  control.checked = false;
  control.events.change();
  assert.match(h.element('#scope-effect').textContent, /只估算本方向/);
  control.checked = true;
  control.events.change();
  assert.match(h.element('#scope-effect').textContent, /本方向及另一方向下一輪/);
  assert.match(h.pageRequests.at(-1), /closed_loop=1.*fresh=1/);
}

{
  const h = harness();
  vm.runInContext(`renderRouteMap = () => {};
    stops = [{id: 2, direction: 0, name: '新站', selectable: true}];
    latestSnapshot = {stop: {name: '舊站'}}`, h.context);
  h.element('#direction').value = '0';
  h.element('#stop').value = '2';
  h.element('#eta-card').hidden = false;
  h.element('#vehicles').append({textContent: '舊站公車'});
  h.element('#stop').events.change();
  assert.equal(h.element('#stop-title').textContent, '新站');
  assert.equal(h.element('#eta-card').hidden, true, 'previous stop ETA disappears immediately');
  assert.equal(h.element('#vehicles').children.length, 0, 'previous stop buses disappear immediately');
  assert.match(h.element('#message').textContent, /正在更新新站/);
  assert.match(h.pageRequests.at(-1), /stop_id=2.*fresh=1/);
}

{
  const h = harness();
  h.tabs[1].click();
  assert.equal(h.element('.route-badge').textContent, '908');
  assert.equal(h.element('#direction').options[1].textContent, '往三峽');
  assert.match(h.pageRequests.at(-1), /api\/stops\?route_id=16585/);
  h.tabs[2].click();
  assert.equal(h.element('#official-route-link').href, 'https://pda5284.gov.taipei/MQS/route.jsp?rid=16664');
  assert.equal(h.element('.route-badge').textContent, '921');
}

{
  const h = harness();
  vm.runInContext(`stops = [
    {id: 1, direction: 0, name: '捷運景安站', nameEn: 'Jingan Station'},
    {id: 2, direction: 0, name: '中興街口', nameEn: 'Zhongxing Street'},
    {id: 3, direction: 1, name: '捷運景安站', nameEn: 'Jingan Station'}
  ]`, h.context);
  assert.equal(vm.runInContext('matchingRouteStops(0, "景安").length', h.context), 1);
  assert.equal(vm.runInContext('matchingRouteStops(1, "jingan")[0].id', h.context), 3);
  assert.equal(vm.runInContext('matchingRouteStops(0, "missing").length', h.context), 0);
}

{
  const h = harness();
  vm.runInContext(`latestSnapshot.officialEtaSeconds = null;
    latestSnapshot.officialStatus = '今日未營運';
    latestSnapshot.updatedAt = new Date().toISOString();
    render(latestSnapshot)`, h.context);
  assert.equal(h.element('#eta').textContent, '官方暫無到站時間');
  assert.match(h.element('#eta-detail').textContent, /資料不一致/);
  assert.match(h.element('#eta-detail').textContent, /無法據此判斷本站是否停駛/);
  h.element('#voice-format').value = 'verbose';
  h.element('#voice-language').value = 'en';
  const english = vm.runInContext('briefingText(latestSnapshot)', h.context);
  assert.match(english, /sources disagree/);
}

{
  const h = harness();
  vm.runInContext(`latestSnapshot.officialEtaSeconds = null;
    latestSnapshot.officialStatus = '今日未營運';
    latestSnapshot.updatedAt = new Date().toISOString();
    latestSnapshot.vehicles = [{id: 'NEXT-CIRCUIT', originDirection: 1, crossDirection: true,
      atStop: false, estimatedEtaSeconds: 1200, estimatedEtaWindowSeconds: [900, 1800],
      stopsAway: 18, nextStop: '返程中途站', nextStopEn: 'Return stop',
      lastSeen: new Date().toISOString(), dataAgeSeconds: 30,
      etaBasis: {observed: 0, 'official-gap': 0, distance: 3}, confidence: 'low'}];
    render(latestSnapshot)`, h.context);
  assert.equal(h.element('#eta').textContent, '今日未營運', 'next-circuit buses do not imply direct service now');
  assert.match(h.element('#vehicle-summary').textContent, /另一方向.*折返續行/);
  assert.match(h.element('#leave-advice').textContent, /若此車在終點折返續行/);
  assert.match(h.element('#leave-advice').textContent, /NEXT-CIRCUIT/);
  assert.match(vm.runInContext('briefingText(latestSnapshot)', h.context), /若在終點折返續行，下一輪推估/);
}

{
  const h = harness();
  vm.runInContext(`latestSnapshot.updatedAt = new Date().toISOString();
    latestSnapshot.vehicles.push({id:'NEXT-TRIP',crossDirection:true,atStop:false,
      originDirection:1,estimatedEtaSeconds:1500,estimatedEtaWindowSeconds:[1200,1800],
      stopsAway:12,nextStop:'返程站',lastSeen:new Date().toISOString(),dataAgeSeconds:15,
      etaBasis:{distance:2},confidence:'low'}); render(latestSnapshot)`, h.context);
  const groups = h.element('#vehicles').children;
  assert.equal(groups.length, 2, 'direct and conditional buses have separate sections');
  assert.match(groups[0].children[0].textContent, /本方向接近本站/);
  assert.match(groups[1].children[0].textContent, /可能折返續行/);
  vm.runInContext(`savedTrips = Array.from({length:5}, (_, index) => ({routeId:16405,
    direction:0,stopId:index+1,stopName:'測試'+index,closedLoop:true})); renderSavedTrips()`, h.context);
  assert.equal(h.element('#trips-more').hidden, false);
  h.element('#trips-more').events.click();
  assert.equal(h.element('#trips-more').attributes['aria-expanded'], 'true');
}

{
  const h = harness();
  vm.runInContext('stops = [{id: 1}]; zoomMap(1 / 1.6, 400, 195)', h.context);
  assert.equal(vm.runInContext('Math.round(mapView.width)', h.context), 500);
  vm.runInContext('for (let i = 0; i < 12; i++) zoomMap(1 / 1.6, 400, 195)', h.context);
  assert.equal(vm.runInContext('mapView.width', h.context), 160, 'zoom is capped at five times');
  h.element('#map-zoom-reset').events.click();
  assert.equal(vm.runInContext('mapView.width', h.context), 800);
  h.tabs[2].click();
  assert.equal(vm.runInContext('mapView.width', h.context), 800, 'switching routes resets the map');
}

{
  const h = harness();
  h.element('#route-map').parentElement = {classList: {add() {}, remove() {}}};
  vm.runInContext(`stops = [
    {id: 1, name: '三峽', direction: 0, selectable: true, lat: 24.90, lon: 121.40},
    {id: 2, name: '捷運景安站(景平路)', direction: 0, selectable: true, lat: 24.99, lon: 121.50},
    {id: 2, name: '捷運景安站(景平路)', direction: 1, selectable: true, lat: 24.99, lon: 121.50},
    {id: 3, name: '三峽', direction: 1, selectable: true, lat: 24.90, lon: 121.40}
  ]; renderRouteMap({routeVehicles: [
    {direction: 0, stopId: 1, id: 'EAA-109', atStop: true},
    {direction: 0, stopId: 1, id: 'EAA-110', atStop: false},
    {direction: 1, stopId: 3, id: 'EAA-121', atStop: false}
  ]})`, h.context);
  const markers = h.element('#route-map').children.filter(node => node.attributes?.class === 'map-bus-marker');
  assert.equal(markers.length, 2);
  assert.equal(markers[0].children[0].attributes.fill, '#ed754d', 'outbound buses match the outbound line');
  assert.equal(markers[1].children[0].attributes.fill, '#3a9873', 'inbound buses match the inbound line');
  assert.equal(markers[0].children.find(node => node.tagName === 'text').textContent, '2');
  assert.equal(markers[1].children.find(node => node.tagName === 'text').textContent, '1');
  assert.match(markers[0].attributes['aria-label'], /EAA-109、EAA-110/);
}

{
  const h = harness();
  h.element('#voice-format').value = 'verbose';
  h.element('#voice-model').value = 'auto';
  h.element('#voice-mode').value = 'briefing';
  h.element('#briefing-interval').value = '5';
  h.element('#voice').events.click();
  assert.equal(h.spoken.length, 1, 'enabling speaks immediately in the click handler');
  assert.match(h.spoken[0].text, /官方預估下一班約 6 分鐘/);
  assert.match(h.spoken[0].text, /下一站中興街口/);
  assert.match(h.spoken[0].text, /EAA-109推估約 5–9 分鐘/);
  assert.match(h.spoken[0].text, /EAA-121推估約 12–16 分鐘/);
  assert.equal(h.spoken[0].voice.name, 'Mandarin');
  assert.equal(h.element('#voice-state').textContent, '語音播放完成');
  vm.runInContext('announce(latestSnapshot)', h.context);
  assert.equal(h.spoken.length, 1, 'polls within five minutes stay silent');
  vm.runInContext('lastBriefingAt = Date.now() - 5 * 60_000 - 1; announce(latestSnapshot)', h.context);
  assert.equal(h.spoken.length, 2, 'another report plays after the interval');
}

{
  const h = harness();
  assert.equal(h.element('#voice-format').value, 'short', 'short reporting is the default');
  vm.runInContext(`latestSnapshot.vehicles.push(
    {id: 'LOOP-1', crossDirection: true, atStop: false, estimatedEtaSeconds: 3000,
     estimatedEtaWindowSeconds: [2700, 3600], nextStop: '返程站一', nextStopEn: 'Return stop one'},
    {id: 'LOOP-2', crossDirection: true, atStop: false, estimatedEtaSeconds: 4200,
     estimatedEtaWindowSeconds: [3900, 4800], nextStop: '返程站二', nextStopEn: 'Return stop two'})`, h.context);
  const chinese = vm.runInContext('briefingText(latestSnapshot)', h.context);
  assert.match(chinese, /第1輛推估約 5–9 分鐘/);
  assert.match(chinese, /第2輛推估約 12–16 分鐘/);
  assert.doesNotMatch(chinese, /官方預估下一班/);
  assert.equal((chinese.match(/若在終點折返續行/g) || []).length, 1);
  assert.doesNotMatch(chinese, /EAA-|LOOP-|下一站/);
  h.element('#voice-language').value = 'en';
  const english = vm.runInContext('briefingText(latestSnapshot)', h.context);
  assert.doesNotMatch(english, /official next bus/i);
  assert.equal((english.match(/continue service after the terminal/g) || []).length, 1);
  assert.doesNotMatch(english, /EAA-|LOOP-|next stop|[\u3400-\u9fff]/i);
  h.element('#voice-format').value = 'verbose';
  h.element('#voice-format').events.change();
  assert.match(h.element('#voice-preview').textContent, /EAA-109/);
  assert.match(h.element('#voice-preview').textContent, /next stop/i);
}

{
  const h = harness();
  h.element('#voice-format').value = 'verbose';
  h.element('#voice-language').value = 'en';
  h.element('#voice-language').events.change();
  h.element('#voice-model').value = 'auto';
  h.element('#voice-mode').value = 'briefing';
  h.element('#voice').events.click();
  assert.equal(h.spoken[0].lang, 'en-US');
  assert.equal(h.spoken[0].voice.name, 'English');
  assert.match(h.spoken[0].text, /Jingan Station/);
  assert.match(h.spoken[0].text, /Zhongxing Road Intersection/);
  assert.match(h.spoken[0].text, /EAA-121.*12 to 16 minutes/);
  assert.doesNotMatch(h.spoken[0].text, /[\u3400-\u9fff]/);
}

{
  const h = harness();
  h.element('#voice-format').value = 'verbose';
  h.element('#voice-model').value = 'auto';
  h.element('#voice-mode').value = 'alert';
  h.element('#threshold').value = '5';
  h.element('#voice').events.click();
  assert.equal(h.spoken.length, 1);
  assert.match(h.spoken[0].text, /語音提醒已啟用/);
  vm.runInContext('latestSnapshot.officialEtaSeconds = 120; announce(latestSnapshot)', h.context);
  assert.equal(h.spoken.length, 2);
  assert.match(h.spoken[1].text, /官方下一班約 2 分鐘/);
  vm.runInContext('announce(latestSnapshot)', h.context);
  assert.equal(h.spoken.length, 2, 'threshold reminder is spoken once');
  vm.runInContext('latestSnapshot.vehicles[0].estimatedEtaSeconds = 240; announce(latestSnapshot)', h.context);
  assert.equal(h.spoken.length, 3);
  assert.match(h.spoken[2].text, /EAA-109推估約 5–9 分鐘/);
  vm.runInContext('latestSnapshot.vehicles[1].estimatedEtaSeconds = 180; announce(latestSnapshot)', h.context);
  assert.equal(h.spoken.length, 4);
  assert.match(h.spoken[3].text, /EAA-121推估約 12–16 分鐘/);
  vm.runInContext('announce(latestSnapshot)', h.context);
  assert.equal(h.spoken.length, 4, 'each bus is announced once');
}

{
  const h = harness();
  h.element('#voice-model').value = 'auto';
  h.element('#voice-mode').value = 'alert';
  h.element('#threshold').value = '5';
  h.element('#voice').events.click();
  vm.runInContext('latestSnapshot.vehicles[0].estimatedEtaSeconds = 240; announce(latestSnapshot)', h.context);
  const shortAlert = h.spoken.at(-1).text;
  assert.match(shortAlert, /第1輛公車推估/);
  assert.doesNotMatch(shortAlert, /EAA-109|下一站/);
}

{
  const h = harness('not-allowed');
  h.element('#voice-model').value = 'auto';
  h.element('#voice-test').events.click();
  assert.match(h.element('#voice-state').textContent, /瀏覽器禁止播放/);
  assert.equal(h.element('#voice-state').className, 'voice-state error');
}

(async () => {
  const catalog = harness();
  catalog.element('#route-query').value = '908';
  const olderSearch = catalog.element('#route-find').events.click();
  catalog.element('#route-query').value = '0東';
  const newerSearch = catalog.element('#route-find').events.click();
  const searches = catalog.pageResponses.filter(item => item.url.startsWith('api/catalog?'));
  searches[1].resolve({ok: true, json: async () => [{id: 10841, name: '0東',
    nameEn: '0East', heads: ['往臺北車站', '往內湖'], source: 'taipei'}]});
  await newerSearch;
  searches[0].resolve({ok: true, json: async () => [{id: 16585, name: '908',
    heads: ['往捷運景安站', '往三峽'], source: 'new-taipei'}]});
  await olderSearch;
  assert.equal(catalog.element('#route-results').children.length, 1,
    'an older catalog response cannot append stale routes');
  assert.match(catalog.element('#route-picker-status').textContent, /找到 1 條/);
  const addedRoute = harness();
  vm.runInContext(`routes[10841] = {name:'0東',spoken:'0東',english:'0East',
    heads:['往臺北車站','往內湖'],headsEn:['toward Taipei Main Station','toward Neihu'],
    source:'taipei'}; renderRouteMap = () => {};`, addedRoute.context);
  const switching = vm.runInContext('switchRoute(10841)', addedRoute.context);
  const stopRequest = addedRoute.pageResponses.find(item => item.url === 'api/stops?route_id=10841');
  stopRequest.resolve({ok: true, json: async () => [
    {id: 1, direction: 0, name: '瑞湖街口', selectable: true, lat: 25, lon: 121},
    {id: 2, direction: 1, name: '臺北車站', selectable: true, lat: 25.1, lon: 121.1}]});
  await switching;
  assert.equal(addedRoute.element('#stop').children.length, 1,
    'an added route loads selectable stops without a hard-coded tab');
  const tracking = harness();
  vm.runInContext(`renderRouteMap = () => {};
    stops = [{id: 2, direction: 0, name: '新站', selectable: true}];`, tracking.context);
  tracking.element('#direction').value = '0';
  tracking.element('#stop').value = '2';
  tracking.element('#stop').events.change();
  const snapshot = eta => ({routeId: 16405, route: '橘5', direction: 0,
    directionLabel: '往捷運景安站', closedLoop: true,
    stop: {id: 2, name: '新站', nameEn: 'New Stop'}, officialEtaSeconds: eta,
    officialStatus: null, vehicles: [], routeStatuses: [], routeVehicles: [],
    updatedAt: new Date().toISOString()});
  const reply = data => ({ok: true, json: () => Promise.resolve(data)});
  tracking.pageResponses.at(-2).resolve(reply(snapshot(300)));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(tracking.element('#eta').textContent, '5 分鐘', 'cached feed updates the new stop first');
  assert.match(tracking.element('#updated').textContent, /正在取得最新資訊/);
  tracking.pageResponses.at(-1).resolve(reply(snapshot(60)));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(tracking.element('#eta').textContent, '1 分鐘', 'fresh feed replaces the preview');
  assert.equal(tracking.element('#message').hidden, true);
  tracking.element('#stop').events.change();
  tracking.pageResponses.at(-1).resolve(reply(snapshot(90)));
  await new Promise(resolve => setImmediate(resolve));
  tracking.pageResponses.at(-2).resolve(reply(snapshot(600)));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(tracking.element('#eta').textContent, '2 分鐘', 'late cached response cannot replace fresh data');

  const h = harness('synthesis-failed');
  h.element('#voice-model').value = 'auto';
  h.element('#voice-test').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.audioPlayed.length, 1, 'synthesis failure plays server-generated WAV');
  assert.equal(h.element('#voice-state').textContent, '正在朗讀 · eSpeak cmn');
  const local = harness();
  local.element('#voice-model').value = 'espeak:cmn+f2';
  local.element('#voice-test').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(local.spoken.length, 0, 'local voice skips browser synthesis');
  assert.equal(local.audioPlayed.length, 1);
  assert.equal(local.voiceRequests[0].voice, 'cmn+f2');
  const api = harness();
  assert.equal(api.element('#api-voice').value, 'anne', 'new local TTS default is anne');
  api.element('#voice-model').value = 'api';
  api.element('#api-model').value = 'tts-1';
  api.element('#api-voice').value = 'alloy';
  api.element('#voice-test').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(api.voiceRequests[0].engine, 'api');
  assert.equal(api.voiceRequests[0].model, 'tts-1');
  assert.equal(api.voiceRequests[0].voice, 'alloy');
  assert.equal(api.element('#voice-state').textContent, '正在朗讀 · tts-1 / alloy');
  const englishApi = harness();
  englishApi.element('#voice-language').value = 'en';
  englishApi.element('#voice-language').events.change();
  englishApi.element('#voice-model').value = 'api';
  englishApi.element('#voice-test').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(englishApi.voiceRequests[0].text, /Orange Five/);
  assert.doesNotMatch(englishApi.voiceRequests[0].text, /[\u3400-\u9fff]/);
  const englishEspeak = harness('synthesis-failed');
  englishEspeak.element('#voice-language').value = 'en';
  englishEspeak.element('#voice-language').events.change();
  englishEspeak.element('#voice-model').value = 'auto';
  englishEspeak.element('#voice-test').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(englishEspeak.voiceRequests[0].voice, 'en');
  const livePush = harness(null, true);
  const liveStored = new Map([['bus-tracker-push-enabled', '1']]);
  livePush.context.localStorage = {getItem: key => liveStored.get(key) ?? null,
    setItem: (key, value) => liveStored.set(key, value), removeItem: key => liveStored.delete(key)};
  livePush.context.navigator = {serviceWorker: {getRegistration: () => Promise.resolve({pushManager: {
    getSubscription: () => Promise.resolve({endpoint: 'https://fcm.googleapis.com/fcm/send/live',
      toJSON: () => ({endpoint: 'https://fcm.googleapis.com/fcm/send/live', keys: {}})})}})}};
  livePush.context.AbortController = AbortController;
  livePush.context.setTimeout = setTimeout;
  livePush.context.clearTimeout = clearTimeout;
  livePush.element('#direction').value = '0';
  vm.runInContext(`stops = [101,102,103].map(id => ({id,direction:0,name:'站牌 '+id}))`, livePush.context);
  livePush.element('#stop').value = '101';
  const firstSync = vm.runInContext('syncPushSettings()', livePush.context);
  await new Promise(resolve => setImmediate(resolve));
  const firstPost = livePush.pageResponses.find(item => item.url === 'api/push-subscription');
  assert.equal(JSON.parse(firstPost.options.body).stop_id, 101);
  livePush.element('#stop').value = '102';
  vm.runInContext('syncPushSettings()', livePush.context);
  assert.equal(livePush.pageResponses.filter(item => item.url === 'api/push-subscription').length, 1,
    'browsing a different stop leaves the pinned notification target unchanged');
  assert.equal(livePush.element('#push-target-switch').hidden, false);
  const secondSync = livePush.element('#push-target-switch').events.click();
  firstPost.resolve({ok: true, json: async () => ({ok: true})});
  await firstSync;
  await new Promise(resolve => setImmediate(resolve));
  const secondPost = livePush.pageResponses.filter(item => item.url === 'api/push-subscription')[1];
  assert.equal(JSON.parse(secondPost.options.body).stop_id, 102);
  assert.ok(JSON.parse(secondPost.options.body).revision > JSON.parse(firstPost.options.body).revision);
  secondPost.resolve({ok: true, json: async () => ({ok: true})});
  await secondSync;
  assert.match(livePush.element('#push-state').textContent, /已固定/);
  livePush.element('#stop').value = '103';
  const rejectedSync = livePush.element('#push-target-switch').events.click();
  await new Promise(resolve => setImmediate(resolve));
  livePush.pageResponses.at(-1).resolve({ok: true, json: async () => ({ok: true, applied: false})});
  await rejectedSync;
  assert.equal(livePush.element('#push-retry').hidden, false);
  assert.match(livePush.element('#push-state').textContent, /可能仍追蹤上次成功設定的站牌/);
  livePush.element('#stop').value = '101';
  const retrySync = livePush.element('#push-retry').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(JSON.parse(livePush.pageResponses.at(-1).options.body).stop_id, 103,
    'retry resends the pinned target even while another stop is being viewed');
  livePush.pageResponses.at(-1).resolve({ok: true, json: async () => ({ok: true, applied: true})});
  await retrySync;
  assert.equal(livePush.element('#push-retry').hidden, true);
  const waiting = harness();
  waiting.element('#voice-state').textContent = '正在向本機 TTS 伺服器取得語音…';
  vm.runInContext('pendingAudio = true; syncVoiceMode()', waiting.context);
  assert.equal(waiting.element('#voice-state').textContent, '正在向本機 TTS 伺服器取得語音…');
  const advice = harness();
  advice.element('#walk-minutes').value = '5';
  vm.runInContext('latestSnapshot.updatedAt = new Date().toISOString(); renderLeaveAdvice(latestSnapshot)', advice.context);
  assert.match(advice.element('#leave-advice').textContent, /EAA-121/);
  advice.element('#walk-minutes').value = '7';
  advice.element('#walk-minutes').events.change();
  vm.runInContext('renderLeaveAdvice(latestSnapshot)', advice.context);
  assert.match(advice.element('#leave-advice').textContent, /EAA-121/);
  advice.element('#walk-minutes').value = '15';
  advice.element('#walk-minutes').events.change();
  vm.runInContext('renderLeaveAdvice(latestSnapshot)', advice.context);
  assert.match(advice.element('#leave-advice').textContent, /沒有可確認來得及搭乘的後續車輛/);
  const nextAdvice = harness();
  nextAdvice.element('#walk-minutes').value = '5';
  vm.runInContext(`latestSnapshot.updatedAt = new Date().toISOString();
    latestSnapshot.feedFetchedAt = {EstimateTime: new Date().toISOString()};
    latestSnapshot.officialEtaSeconds = 400;
    latestSnapshot.vehicles = [{id: 'FOLLOWING', atStop: false, estimatedEtaSeconds: 560,
      estimatedEtaWindowSeconds: [450, 680], lastSeen: new Date().toISOString()}];
    renderLeaveAdvice(latestSnapshot)`, nextAdvice.context);
  assert.match(nextAdvice.element('#leave-advice').textContent, /FOLLOWING/,
    'a feasible following bus is offered even when its range overlaps the official ETA');
  vm.runInContext(`latestSnapshot.officialEtaSeconds = 600;
    latestSnapshot.feedFetchedAt.EstimateTime = new Date(Date.now() - 200000).toISOString();
    latestSnapshot.vehicles = [
      {id: 'TOO-SOON', atStop: false, estimatedEtaSeconds: 600,
       estimatedEtaWindowSeconds: [500, 650], lastSeen: new Date(Date.now() - 150000).toISOString()},
      {id: 'NEXT-BUS', atStop: false, estimatedEtaSeconds: 1000,
       estimatedEtaWindowSeconds: [900, 1100], lastSeen: new Date(Date.now() - 150000).toISOString()}];
    renderLeaveAdvice(latestSnapshot)`, nextAdvice.context);
  assert.match(nextAdvice.element('#leave-advice').textContent, /NEXT-BUS/,
    'advice advances to the next feasible bus as source data ages');
  const thresholdChoice = harness();
  thresholdChoice.element('#threshold').value = '10';
  thresholdChoice.element('#threshold').events.change();
  assert.equal(vm.runInContext('alertThresholdMinutes()', thresholdChoice.context), 10);
  thresholdChoice.element('#threshold').value = 'custom';
  thresholdChoice.element('#custom-threshold').value = '12';
  thresholdChoice.element('#threshold').events.change();
  assert.equal(thresholdChoice.element('.custom-threshold-label').hidden, false);
  assert.equal(vm.runInContext('alertThresholdMinutes()', thresholdChoice.context), 12);
  thresholdChoice.element('#voice-model').value = 'auto';
  vm.runInContext('latestSnapshot.officialEtaSeconds = 660', thresholdChoice.context);
  thresholdChoice.element('#voice').events.click();
  assert.match(thresholdChoice.spoken[0].text, /官方下一班約 11 分鐘/);
  const saved = thresholdChoice.element('#schedule-save').events.click();
  const scheduleRequest = thresholdChoice.pageResponses.find(item =>
    item.url === 'api/schedule' && item.options?.method === 'POST');
  assert.equal(JSON.parse(scheduleRequest.options.body).alert_threshold_minutes, 12);
  scheduleRequest.resolve({ok: true, json: async () => ({enabled: false, alert_threshold_minutes: 12})});
  await saved;
  const publicView = harness(null, true);
  assert.equal(publicView.element('.schedule-settings').hidden, true);
  assert.equal(publicView.element('#api-voice-settings').hidden, false);
  assert.equal(publicView.element('#voice-model').value, 'api');
  publicView.element('#voice-test').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(publicView.voiceRequests[0].engine, 'api');
  assert.equal(publicView.voiceRequests[0].model, 'tts-1');
  assert.equal(publicView.voiceRequests[0].voice, 'anne');
  const publicFailure = harness('synthesis-failed', true);
  publicFailure.element('#voice-model').value = 'auto';
  publicFailure.element('#voice-test').events.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(publicFailure.voiceRequests[0].engine, 'espeak', 'public browser fallback can use server eSpeak');
  const push = harness(null, true);
  const stored = new Map([['bus-tracker-push-enabled', '1'],
    ['bus-tracker-push-endpoint', 'https://fcm.googleapis.com/fcm/send/example']]);
  push.context.localStorage = {getItem: key => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key)};
  push.context.navigator = {serviceWorker: {getRegistration: () => Promise.resolve(null)}};
  push.context.AbortController = AbortController;
  push.context.setTimeout = setTimeout;
  push.context.clearTimeout = clearTimeout;
  push.element('#stop').value = '122402';
  vm.runInContext('pushSyncChain = new Promise(() => {})', push.context);
  const closing = push.element('#push-toggle').events.click();
  await new Promise(resolve => setImmediate(resolve));
  const removal = push.pageResponses.find(item => item.url === 'api/push-subscription');
  assert.ok(removal, 'disable starts server removal even when an earlier sync never settles');
  assert.equal(stored.get('bus-tracker-push-enabled'), undefined);
  removal.resolve({ok: true, json: async () => ({ok: true})});
  await closing;
  assert.equal(push.element('#push-state').textContent, '已關閉手機通知');
  assert.equal(push.element('#push-toggle').disabled, false);
  assert.equal(stored.get('bus-tracker-push-pending-remove'), undefined);
  stored.set('bus-tracker-push-enabled', '1');
  stored.set('bus-tracker-push-endpoint', 'https://fcm.googleapis.com/fcm/send/example');
  const failedClose = push.element('#push-toggle').events.click();
  await new Promise(resolve => setImmediate(resolve));
  push.pageResponses.at(-1).resolve({ok: false, json: async () => ({error: '暫時無法連線'})});
  await failedClose;
  assert.equal(push.element('#push-toggle').textContent, '重試關閉手機通知');
  assert.equal(stored.get('bus-tracker-push-pending-remove'), '1');
  const retryClose = push.element('#push-toggle').events.click();
  await new Promise(resolve => setImmediate(resolve));
  push.pageResponses.at(-1).resolve({ok: true, json: async () => ({ok: true})});
  await retryClose;
  assert.equal(push.element('#push-state').textContent, '已關閉手機通知');
  stored.set('bus-tracker-push-enabled', '1');
  push.element('#stop').value = '';
  let unsubscribed = false;
  push.context.navigator.serviceWorker.getRegistration = () => Promise.resolve({pushManager: {
    getSubscription: () => Promise.resolve({endpoint: 'https://fcm.googleapis.com/fcm/send/old',
      unsubscribe: () => {unsubscribed = true; return Promise.resolve(true);}})}});
  const oldPhoneClose = push.element('#push-toggle').events.click();
  await new Promise(resolve => setImmediate(resolve));
  push.pageResponses.at(-1).resolve({ok: true, json: async () => ({ok: true})});
  await oldPhoneClose;
  assert.equal(push.element('#push-state').textContent, '已關閉手機通知');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(unsubscribed, true, 'older subscriptions without a saved endpoint are also cleared');
  console.log('voice tests passed');
})().catch(error => {console.error(error); process.exitCode = 1;});
