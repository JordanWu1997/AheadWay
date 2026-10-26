# 橘5 / 908 / 921 bus tracker

Small local web app for a selected 橘5, 908, or 921 stop. Tabs switch the map, stops, official next arrival, following vehicles, and spoken reports. Each detected approaching vehicle has an estimated arrival time and next stop. Route and stop selections are saved per route in the browser. The optional **納入另一方向後續車** switch adds vehicles on the opposite leg if they finish that leg and continue into the next circuit to the selected stop. These next-circuit arrivals are uncertain: departure advice can show a conditional suggestion for them, while phone push and threshold alerts still exclude them.

## Public HTTPS with Tailscale Funnel

Funnel terminates HTTPS on public port 443 and proxies to a local HTTP port. The Python server does not need a certificate or port 443. Run the owner dashboard on localhost port 8000 and a separate read-only viewer on localhost port 8765:

```sh
cd /home/jordan/Desktop/Bus_Tracker
python -m bus_tracker.server 8000             # owner dashboard, localhost only
python -m bus_tracker.server 8765 --public --public-host=pop-os.tail443eb6.ts.net
```

The public viewer supports route data, live arrivals, browser speech, eSpeak, and the local OpenAI-compatible TTS server. It accepts only `/api/voice` and `/api/push-subscription` as public POST requests; schedule editing and the saved schedule remain private. Public requests require an HTTPS Origin matching `--public-host`. Public speech allows only `tts-1` / `alloy` for the API engine or listed eSpeak voices, limits text to 1,000 characters, and caps shared traffic at 60 requests per 10 minutes with two concurrent syntheses. Phone notification subscriptions have a separate request rate limit and a 64-device capacity. Do not route Funnel to port 8000 or directly to the TTS server on port 8001. Change `--public-host` if the device's Tailscale hostname changes.

After enabling Funnel in the Tailscale admin console, publish **only** the viewer under `/bus`:

```sh
tailscale funnel --bg --https=443 --set-path=/bus http://127.0.0.1:8765
tailscale funnel status
```

Open the HTTPS URL shown by `tailscale funnel status` with `/bus/` appended. Test it from a device outside your LAN. Funnel supplies the HTTPS certificate for the `*.ts.net` hostname. A future personal website can run locally on another port (for example 9000) and use the same public HTTPS port and hostname at `/`:

```sh
tailscale funnel --bg --https=443 --set-path=/ http://127.0.0.1:9000
```

The `/bus` route remains the more specific path. Check `tailscale funnel status` after adding the root route. To remove only the bus route, use `tailscale funnel --https=443 --set-path=/bus off`. Anyone on the Internet can open a Funnel URL. Speech consumes resources on your computer; the global limits protect capacity but do not provide per-user identity. The host, Python viewer, TTS server, and Tailscale must remain running for API speech to work. For automatic startup on login, install the two example user services. Stop any manually running server on port 8000 before starting the owner service:

```sh
mkdir -p ~/.config/systemd/user
cp deploy/bus-tracker-owner.service deploy/bus-tracker-public.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now bus-tracker-owner.service bus-tracker-public.service
```

User services may stop after logout unless linger is enabled for the account. Keep the host awake for continuous public access.

The visitor path works whether Tailscale strips `/bus` before forwarding or preserves it; assets and API requests stay under `/bus/`. The owner dashboard remains at `http://127.0.0.1:8000/` and retains scheduled voice and local TTS controls.

## Run

Requires Python 3.10+ and internet access to the public New Taipei bus feed.

```sh
python -m bus_tracker.server
```

Open <http://127.0.0.1:8000>. Choose a route, direction, and stop, or click a stop in the route panel. The arrival board puts the official next-bus ETA above every freshly detected approaching vehicle, numbered by estimated arrival order; it never hides following vehicles. Each bus row shows its next stop and estimated range, with position age, confidence, and calculation sources under expandable details. The official ETA is not tied to a particular license plate. On small screens the route panel displays one direction at a time and the map can be expanded; voice settings are collapsed beneath the enable and test buttons. The selected stop has a blue pointer and name on the map, separate from the orange and green direction lines. **常用行程** stores up to eight route, direction, stop, and opposite-direction presets in this browser. The **納入另一方向後續車** switch is saved per route. When enabled, a vehicle on the other leg is counted at any selected stop only after its remaining leg, the turn between endpoints, and the selected leg's prefix; its ETA is marked as a next-circuit estimate. A vehicle confirmed at a shared terminal can still be shown as already at that stop. Selecting a stop immediately clears the previous stop’s ETA and buses, shows the new selection, then displays the newest cached snapshot while a fresh feed request completes. Deliberate selections and manual refreshes request fresh vehicle, event, and ETA data, with a shared five-second minimum refresh age to protect the upstream feed. The dashboard shows feed fetch age and each vehicle's last report age. Its low/medium/high confidence label is a heuristic based on vehicle age, route projection, observed travel, and recent arrival samples; it is not a probability. Routine polling remains every 30 seconds. The upstream feed may itself lag behind the bus. Run `python -m unittest discover -s bus_tracker -t . -p "test_*.py"` and `node bus_tracker/test_voice.js` for local tests.

## Data and accuracy

- The routes are 橘5 (`16405`), 908 (`16585`), and 921 (`16664`); their path IDs come from the [official Route feed](https://tcgbusfs.blob.core.windows.net/ntpcbus/GetRoute.gz).
- Stop order comes from the [Stop feed](https://tcgbusfs.blob.core.windows.net/ntpcbus/GetStop.gz). The next bus ETA comes from the [EstimateTime feed](https://tcgbusfs.blob.core.windows.net/ntpcbus/GetEstimateTime.gz). Individual locations come from the [BusData feed](https://tcgbusfs.blob.core.windows.net/ntpcbus/GetBusData.gz); terminal dwell state comes from the [BusEvent feed](https://tcgbusfs.blob.core.windows.net/ntpcbus/GetBusEvent.gz).
- 橘5 is a loop at 捷運景安站(景平路): the feed assigns that stop to return direction, though it follows outbound 中興街口. The app includes it at the end of outbound too. A bus that has switched to return direction is shown as “at this stop” on the outbound view only while a fresh stop event confirms it is stopped there. Following outbound vehicles remain visible behind it.
- 908 and 921 assign 景安站 to outbound travel. The app also includes it at the start of return travel and carries a stopped vehicle across directions only while a fresh stop event confirms it is there. Segment history and ETA calibration are separate per route. Long freeway gaps use a longer fallback when observed and official segment times are unavailable. Virtual nonboarding and temporarily removed stops appear on the route, but cannot be selected for tracking.
- The route panel shows each stop's official ETA/status and recent bus stop-event markers in both directions. The selected-stop list shows only buses still approaching that stop, with their next stop. It uses fresh stop events when GPS is unavailable, and uses GPS only when it agrees reasonably with the stop event. Data older than four minutes is ignored. Loops, overlapping streets, detours, poor GPS, or a bus about to start service can still give an incorrect order or omit a vehicle.
- The route sketch connects stop coordinates with straight lines; it is not a road-level route map.
- The official ETA feed reports one prediction per route and stop. It does not identify all following vehicles or give their individual ETAs. The official next ETA therefore remains separate from per-vehicle estimates.
- For each detected bus, the tracker adds the remaining stop-to-stop travel times between its mapped position and the selected stop. Each segment uses a recent observed passage of the same bus between adjacent stops when available; otherwise it uses a plausible positive difference between adjacent official stop ETAs, then falls back to a stop-distance estimate. Observed segment samples are held in server memory for up to three hours, so coverage improves while the dashboard is polled and resets when the server restarts. Each per-bus estimate has an uncertainty range; `arrival_history.sqlite3` stores recent forecasts and confirmed stop arrivals so the range can adapt to observed prediction errors. Before enough arrivals are observed, the range uses a conservative allowance based on the source of the segment times. This is an approximate range, not a statistical guarantee. Buses with no fresh position or stop event cannot be listed.
- The manual voice notifier uses the browser's `speechSynthesis` API or the selected local voice while this page is open. **到站提醒** announces the official ETA when it first enters the threshold and announces each tracked vehicle when its own estimate enters the threshold, with repeat suppression per vehicle. **定時播報** speaks the selected stop's live official status and estimated arrival time for every detected approaching bus immediately when enabled, then at the chosen interval (1–60 minutes). The enable button becomes available after live data loads; pressing it starts speech during the click so browsers that require a user gesture can play it. **試播目前資訊** provides a direct audio test, and the status line shows playback start, completion, or an error. If browser synthesis returns `synthesis-failed`, the local server renders a WAV via `libespeak-ng` and the page plays it as HTML audio. On Linux, install the `libespeak-ng1` and `espeak-ng-data` packages if this fallback is unavailable. Restart the server after updating the app. If the status says it is speaking but no sound is heard, check the browser tab's mute state and the system output device.

- **播報內容** defaults to 簡短: reports a numbered ETA for each tracked bus without license plates, next stops, or a duplicate official ETA. When no bus can be tracked, it reports the official status. 詳細 preserves the longer report with the official ETA, plates, next stops, and distance details. Both Chinese and English reports group next-circuit vehicles after one warning that they must continue service beyond the terminal. The browser saves this choice; saving the owner's daily schedule includes it. Existing saved cron schedules stay on their previous detailed wording until resaved.

## Departure advice and daily voice schedule

The **使用目前位置估算步行** button asks the browser for one location fix. Coordinates stay in the browser. It estimates walking time from straight-line distance, a 35% detour factor, location accuracy, and a 1.2 m/s walking pace; this is not a walking route. Changing stops clears that estimate. The manual walking time remains available. The public HTTPS page offers **手機出發提醒**, which subscribes this device to Web Push for the currently selected stop and walking time. Changing the stop or walking time updates the subscription. The server checks every 30 seconds and sends a notification when a fresh official ETA or eligible vehicle estimate enters the walking time plus two-minute leave window. Notifications can arrive after the page closes, subject to browser and phone delivery. On iPhone/iPad, add the public page to the Home Screen before enabling notifications. This feature requires Python `cryptography` and `requests`; the public server stores its VAPID private key in `bus_tracker/push_vapid.pem` and subscriptions in `bus_tracker/push_subscriptions.sqlite3`. Keep the private key private and persistent; changing it requires devices to subscribe again. Push alerts are visual notifications, not background voice playback. The owner's daily cron voice schedule is separate.

Set **步行到站** to your estimated walking time, or use the current-location button for a rough estimate. The recommendation allows that time plus a fixed two-minute buffer. If the official next ETA is too soon, it looks for the earliest direct vehicle whose lower ETA bound still leaves enough time, then a next-circuit vehicle if no direct one qualifies. Next-circuit advice says the vehicle must continue service at the endpoint. The page updates advice and displayed per-vehicle ETA ranges every ten seconds between feed polls, aging official ETA from the feed fetch time and vehicle estimates from their report times. **到站提醒** offers 1, 3, 5, and 10-minute presets or a custom whole-minute threshold from 1 to 60; the selected value also works in the owner's saved cron schedule.

The **朗讀語音** menu offers the local OpenAI-compatible TTS server at `http://localhost:8001/v1/audio/speech`, eight eSpeak variants for the selected language, and matching voices installed in the browser. The local TTS fields default to `model=tts-1` and `voice=alloy`, and request WAV audio as in the example API call. This server does not expose a voice catalog, so enter the model and voice names supported by your server. The dashboard proxies and normalizes its WAV response before playing it. The choice and API fields are saved in this browser. Browser synthesis failures fall back to standard eSpeak. Click **試播目前資訊** after selecting a voice.

Set **播報語言** to 中文 or English. This changes the spoken alert, periodic briefing, test message, browser voice choices, and saved cron report; the dashboard labels remain Chinese. English reports use the official `nameEn` value from the public stop feed and expand common abbreviations for speech. English mode also offers eight English eSpeak variants and falls back to English eSpeak if browser synthesis fails. Language and voice choices are saved in this browser. Save the cron schedule again after changing the language or voice so its stored settings match the page.

Choose a route tab, stop, voice mode, and **每天定時啟動**; set a local start time and duration (1–720 minutes), then click **儲存排程**. This installs one named entry in your user crontab while retaining other entries, and saves the route, stop, mode, interval or threshold, language, and local voice in `bus_tracker/schedule.json`. At that time each day, cron starts a polling process that continues for the configured duration. Briefing mode speaks immediately and at the selected interval; alert mode speaks an initial report, then reports each newly approaching vehicle and the official threshold crossing. The process stops early if the saved schedule changes or is disabled, and a lock prevents overlapping runs. It works without the dashboard tab or server running, provided the computer is awake, cron is active, an audio session is available, and the bus feed is reachable. The local TTS server must also be running if selected. Browser voices use standard eSpeak in cron because browser voices cannot run there. To disable the job, uncheck **每天定時啟動** and save. On Linux this feature needs `cron`, `pulseaudio-utils`, and `libespeak-ng1` installed.

## Optional spoken queries with speech-to-speech

The included `bus_tracker.voice_tools` module exposes a read-only live-arrival tool to [Hugging Face speech-to-speech](https://github.com/huggingface/speech-to-speech). In a separate Python 3.11+ environment, install that package and run from this repository's parent directory:

```sh
speech-to-speech local --tool-module bus_tracker.voice_tools --stt paraformer \
  --init_chat_prompt "You are a Traditional Chinese bus assistant. For current 橘5, 908 or 921 arrivals, call get_bus_arrivals. Ask for the route, stop and direction if missing. Distinguish the official next ETA from each detected bus's estimated arrival time, and label the latter as an estimate."
```

The models download on first run. The package's default speech recognizer covers European languages, so a Chinese-capable STT backend such as Paraformer or Whisper is needed. The tool module itself is tested for Python syntax, but the voice pipeline has not been installed or run here. Web Push leave alerts are configured separately on the public dashboard.
