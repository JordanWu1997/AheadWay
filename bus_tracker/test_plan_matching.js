const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, 'static/app.js'), 'utf8');
const start = app.indexOf('const PLAN_MATCH_WINDOW_SECONDS');
const end = app.indexOf('function planCandidateClock', start);
assert.ok(start >= 0 && end > start, 'plan matching source is present');

const now = Date.parse('2026-10-30T12:00:00+08:00');
const context = vm.createContext({
  currentWalkMinutes: () => 5,
  planBufferMinutes: () => 2,
  planMatchContext: null,
  planText: zh => zh,
  elapsedSeconds: () => 0,
  remainingVehicleWindow: bus => bus.estimatedEtaWindowSeconds,
});
vm.runInContext(app.slice(start, end), context);

function snapshot(officialSeconds, vehicles = []) {
  const stamp = '2026-10-30T12:00:00+08:00';
  return {updatedAt: stamp, feedFetchedAt: {EstimateTime: stamp}, officialEtaSeconds: officialSeconds, vehicles};
}
function bus(id, seconds, extra = {}) {
  return {id, atStop: false, lastSeen: '2026-10-30T12:00:00+08:00', confidence: 'high',
    estimatedEtaWindowSeconds: [seconds, seconds], ...extra};
}
function match(data, planMinutes, settings) {
  context.planMatchContext = settings;
  context.currentSnapshot = data;
  context.planAt = now + planMinutes * 60000;
  context.testNow = now;
  return vm.runInContext('planCandidate(currentSnapshot, planAt, testNow, planMatchContext)', context);
}

const leave = match(snapshot(15 * 60, [bus('MATCH', 19 * 60), bus('LATER', 25 * 60)]), 10,
  {timePurpose:'leave', walkMinutes:5, bufferMinutes:2, referenceReturn:false});
assert.equal(leave.readyIn, 17 * 60, 'leave-time plans include walking and buffer');
assert.equal(leave.match.key, 'MATCH', 'the first bus within three minutes after stop-ready time matches');
assert.equal(leave.earlier.key, 'official', 'the closest earlier bus is retained as an adjustment option');
assert.equal(leave.later.key, 'LATER', 'the closest later bus is retained as an adjustment option');

const arrive = match(snapshot(15 * 60, [bus('LATER', 20 * 60)]), 10,
  {timePurpose:'arrive', walkMinutes:5, bufferMinutes:2, referenceReturn:false});
assert.equal(arrive.readyIn, 12 * 60, 'arrival-time plans add buffer but do not add walking again');
assert.equal(arrive.match.key, 'official', 'the next bus at the edge of the three-minute window matches');

const overnight = match(snapshot(10 * 60, [bus('TONIGHT', 12 * 60)]), 8 * 60,
  {timePurpose:'leave', walkMinutes:5, bufferMinutes:2, referenceReturn:false});
assert.equal(overnight.deferred, true, 'far-future plans wait for the live monitoring window');
assert.equal(overnight.candidates.length, 0, 'current-night buses are not recommended for a morning plan');

const gap = match(snapshot(8 * 60, [bus('LATER', 18 * 60)]), 10,
  {timePurpose:'arrive', walkMinutes:5, bufferMinutes:2, referenceReturn:false});
assert.equal(gap.match, null, 'a plan with no bus in the three-minute window has no direct match');
assert.equal(gap.earlier.key, 'official');
assert.equal(gap.later.key, 'LATER');

context.optionResult = {readyIn: 12 * 60,
  earlier: {key:'EARLIER', seconds:7 * 60}, later: {key:'LATER', seconds:14 * 60}};
context.optionPlanAt = now + 10 * 60000;
context.optionNow = now;
assert.deepEqual(Array.from(vm.runInContext(
  'orderedPlanAlternatives(optionResult, optionPlanAt, optionNow).map(item => item.direction)', context)),
['later', 'earlier'], 'the smaller adjustment is recommended first even when it is the later bus');

context.optionResult = {readyIn: 12 * 60,
  earlier: {key:'EARLIER', seconds:10 * 60}, later: {key:'LATER', seconds:18 * 60}};
assert.deepEqual(Array.from(vm.runInContext(
  'orderedPlanAlternatives(optionResult, optionPlanAt, optionNow).map(item => item.direction)', context)),
['earlier', 'later'], 'an earlier bus is first when it is closer to the plan');

const tracked = match(snapshot(13 * 60, [bus('OTHER', 13 * 60), bus('TRACKED', 14 * 60)]), 10,
  {timePurpose:'arrive', walkMinutes:5, bufferMinutes:1, referenceReturn:false,
    trackedBusId:'TRACKED', trackOnly:true});
assert.equal(tracked.match.key, 'TRACKED', 'tracked-only plans ignore official and other vehicles');

const returningBus = bus('RETURN', 18 * 60, {crossDirection:true, confidence:'low'});
const withReturn = match(snapshot(null, [returningBus]), 10,
  {timePurpose:'leave', walkMinutes:5, bufferMinutes:2, referenceReturn:true});
assert.equal(withReturn.match.key, 'RETURN', 'enabled return-bus setting includes conditional low-confidence loop estimates');
assert.equal(withReturn.match.conditional, true, 'returning buses remain marked conditional');
const withoutReturn = match(snapshot(null, [returningBus]), 10,
  {timePurpose:'leave', walkMinutes:5, bufferMinutes:2, referenceReturn:false});
assert.equal(withoutReturn.match, null, 'disabled return-bus setting excludes untracked returning buses');
vm.runInContext(app.slice(app.indexOf('function snapshotMatchesPlan'), app.indexOf('async function refreshPlanMatch')), context);
context.scopeContext = {routeId:16585, direction:0, stopId:'101', referenceReturn:true};
context.scopeSnapshot = {routeId:16585, direction:0, stop:{id:101}, closedLoop:false};
assert.equal(vm.runInContext('snapshotMatchesPlan(scopeSnapshot, scopeContext)', context), false,
  'a plan requesting return buses cannot reuse a snapshot without them');
context.scopeSnapshot.closedLoop = true;
assert.equal(vm.runInContext('snapshotMatchesPlan(scopeSnapshot, scopeContext)', context), true,
  'a matching loop-enabled snapshot can be reused');

function optionButton() { return {hidden: true, disabled: false, dataset: {}, textContent: ''}; }
context.planEarlierOptionEl = optionButton();
context.planLaterOptionEl = optionButton();
context.planAlternativeActionsEl = {append() {}};
context.planAlternativesEl = {hidden: true};
context.planAlternativesDetailEl = {textContent: ''};
context.planDepartureAt = now + 10 * 60000;
context.uiI18n = {language: 'zh'};
vm.runInContext(app.slice(app.indexOf('function planCandidateClock'), app.indexOf('function applyPlanAlternative')), context);
context.emptyResult = {readyIn: 12 * 60, earlier: null, later: null};
vm.runInContext('renderPlanAlternatives(emptyResult, testNow)', context);
assert.equal(context.planAlternativesEl.hidden, false, 'adjustment choices stay visible without any candidate');
assert.equal(context.planEarlierOptionEl.disabled, true, 'unavailable earlier choice cannot be applied');
assert.equal(context.planLaterOptionEl.disabled, true, 'unavailable later choice cannot be applied');
context.oneSideResult = {readyIn: 12 * 60, earlier: null, later: {key:'LATER', label:'LATER', seconds:18 * 60}};
vm.runInContext('renderPlanAlternatives(oneSideResult, testNow)', context);
assert.equal(context.planEarlierOptionEl.disabled, true, 'missing earlier bus remains visible and unavailable');
assert.equal(context.planLaterOptionEl.disabled, false, 'available later bus can adjust the plan');

console.log('plan matching tests passed');
