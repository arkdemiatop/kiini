/* ===========================================================
   KIINI — app logic
   In-memory state only (no localStorage), as this demo may be
   rendered inside an artifact preview. Reloading resets state.
   =========================================================== */

const app = document.getElementById("app");
const bottomNav = document.getElementById("bottom-nav");
const toastRegion = document.getElementById("toast-region");

const NAV_ORDER = ["home", "units", "rooms", "events", "hub"];

function clone(x) { return JSON.parse(JSON.stringify(x)); }

const state = {
  route: "onboarding",
  onboardStep: 0,
  student: { name: "", course: "", year: "", unitCodes: [] },
  onboarded: false,

  currentUnitId: null,
  unitSpace: "personal",       // personal | room
  topicFilter: "All",

  currentRoomId: null,
  roomTab: "chat",             // chat | files | members

  eventFilter: "mine",         // mine | all

  admin: { loggedIn: false, email: "", view: "post-event" },

  activeSheet: null,           // { name, data }

  gemmaTyping: {},             // roomId -> bool
  chatDraft: "",

  units: clone(MOCK.units),
  personalFiles: clone(MOCK.personalFiles),
  roomFiles: clone(MOCK.roomFiles),
  rooms: clone(MOCK.rooms),
  tasks: clone(MOCK.tasks),
  events: clone(MOCK.events),
  hubMessages: [],             // {from, text, sources}
  hubDocs: clone(MOCK.hubDocs),
  adminEvents: [],
};

/* ---------- small utilities ---------- */

function toast(msg, icon) {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${icon || "✓"} <span>${msg}</span>`;
  toastRegion.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 1900);
  setTimeout(() => el.remove(), 2300);
}

function initials(name) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function unitById(id) { return state.units.find(u => u.id === id); }
function roomById(id) { return state.rooms[id]; }

function fileIconSvg(type) {
  if (type === "img") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>`;
}

/* ===========================================================
   Router
   =========================================================== */

function setRoute(route) {
  state.route = route;
  state.activeSheet = null;
  render();
  window.scrollTo(0, 0);
}

function render() {
  const showNav = state.onboarded && state.route !== "onboarding";
  bottomNav.hidden = !showNav;
  app.classList.toggle("no-nav-pad", !showNav);

  [...bottomNav.querySelectorAll(".nav-btn")].forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === state.route);
  });

  let html = "";
  switch (state.route) {
    case "onboarding": html = renderOnboarding(); break;
    case "home": html = renderHome(); break;
    case "units": html = renderUnitsList(); break;
    case "unit": html = renderUnitWorkspace(); break;
    case "rooms": html = renderRoomsList(); break;
    case "room": html = renderRoom(); break;
    case "events": html = renderEvents(); break;
    case "hub": html = renderHub(); break;
    case "admin": html = renderAdmin(); break;
    default: html = renderHome();
  }
  app.innerHTML = html;

  if (state.activeSheet) {
    app.insertAdjacentHTML("beforeend", renderSheet(state.activeSheet));
  }

  afterRender();
}

/* ===========================================================
   ONBOARDING  (Flow 1)
   =========================================================== */

const ONBOARD_STEPS = ["welcome", "profile", "units", "room"];

function renderOnboarding() {
  const step = ONBOARD_STEPS[state.onboardStep];
  const progress = ONBOARD_STEPS.map((s, i) =>
    `<i class="${i <= state.onboardStep ? "done" : ""}"></i>`).join("");

  let body = "";
  let footer = "";

  if (step === "welcome") {
    body = `
      <div class="eyebrow">${MOCK.university.name}</div>
      <h2>One school.<br>One brain.<br>Every student.</h2>
      <p class="lead">Kiini turns your unit PDFs, timetables and group chats into one shared, organized workspace — no accounts, no passwords, just your name and your units.</p>
      <div class="stamp marigold big" style="align-self:flex-start;">
        <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> Powered by Gemma 4
      </div>`;
    footer = `<button class="btn btn-marigold btn-block" data-action="onboard-next">Get started</button>`;
  }

  if (step === "profile") {
    body = `
      <div class="eyebrow">Step 1 of 3</div>
      <h2>Tell us who you are</h2>
      <p class="lead">Just enough to build your personal dashboard.</p>
      <div class="field">
        <label for="in-name">Full name</label>
        <input id="in-name" type="text" placeholder="e.g. Wanjiru Kamau" value="${state.student.name}">
      </div>
      <div class="field">
        <label for="in-course">Course / programme</label>
        <select id="in-course">
          <option value="">Select your course</option>
          ${MOCK.courses.map(c => `<option ${state.student.course === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Year of study</label>
        <div class="chip-grid">
          ${MOCK.years.map(y => `<div class="chip ${state.student.year === y ? "selected" : ""}" data-action="pick-year" data-year="${y}">${y}</div>`).join("")}
        </div>
      </div>`;
    footer = `<div class="row">
        <button class="btn btn-ghost on-dark" data-action="onboard-back">Back</button>
        <button class="btn btn-marigold btn-block" data-action="onboard-next" id="profile-next">Continue</button>
      </div>`;
  }

  if (step === "units") {
    body = `
      <div class="eyebrow">Step 2 of 3</div>
      <h2>Add your units</h2>
      <p class="lead">Each unit becomes its own organized workspace. You can add more any time.</p>
      <div class="chip-grid">
        ${MOCK.catalogUnits.map(u => `<div class="chip ${state.student.unitCodes.includes(u.code) ? "selected" : ""}" data-action="toggle-unit-code" data-code="${u.code}">${u.code} — ${u.name}</div>`).join("")}
      </div>`;
    footer = `<div class="row">
        <button class="btn btn-ghost on-dark" data-action="onboard-back">Back</button>
        <button class="btn btn-marigold btn-block" data-action="onboard-next">Continue</button>
      </div>`;
  }

  if (step === "room") {
    body = `
      <div class="eyebrow">Step 3 of 3</div>
      <h2>Join a unit room</h2>
      <p class="lead">Optional — paste a room code from a classmate, or skip and join later from any unit.</p>
      <div class="field">
        <label for="in-room-code">Room code</label>
        <input id="in-room-code" class="mono" type="text" placeholder="e.g. CIT301-9F2K">
      </div>`;
    footer = `<div class="row">
        <button class="btn btn-ghost on-dark" data-action="finish-onboarding">Skip for now</button>
        <button class="btn btn-marigold btn-block" data-action="finish-onboarding">Join &amp; finish</button>
      </div>`;
  }

  return `
    <div class="onboard-wrap">
      <div class="onboard-top">
        <div class="wordmark"><div class="mark">K</div><div class="name" style="color:var(--paper-soft)">Kiini</div></div>
      </div>
      <div class="onboard-progress">${progress}</div>
      <div class="onboard-body">${body}</div>
      <div class="onboard-footer">${footer}</div>
    </div>`;
}

/* ===========================================================
   HOME DASHBOARD  (Flow 2)
   =========================================================== */

function renderHome() {
  const upcoming = state.tasks.filter(t => !t.done).length;
  const name = state.student.name || "Student";
  const firstName = name.split(" ")[0];

  const timetable = MOCK.timetableToday.length
    ? MOCK.timetableToday.map(t => `
        <div class="tt-card">
          <div class="time mono">${t.time}</div>
          <div class="unit">${t.unit}</div>
          <div class="room">${t.room}</div>
        </div>`).join("")
    : `<div class="tt-empty">No classes on today's timetable.</div>`;

  const notifs = state.tasks.slice(0, 4).map(t => `
    <div class="notif-row task-row ${t.done ? "done" : ""}">
      <div class="task-check ${t.done ? "done" : ""}" data-action="toggle-task" data-id="${t.id}">
        ${t.done ? `<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>` : ""}
      </div>
      <div class="notif-body" style="flex:1">
        <div class="t">${t.title}</div>
        <div class="m">${t.unitCode}</div>
        <div class="when">${t.when}</div>
      </div>
    </div>`).join("");

  const quick = state.units.map(u => `
    <button class="quick-card" data-action="open-unit" data-id="${u.id}">
      <div class="glyph" style="background:${u.accentBg}22; color:${u.accentBg}">${u.code.split(" ")[0]}</div>
      <div class="code">${u.code}</div>
      <div class="name">${u.name}</div>
      <div class="meta">${(state.personalFiles[u.id] || []).length} files ${u.hasRoom ? "· room joined" : ""}</div>
    </button>`).join("");

  return `
    <div class="screen">
      <div class="hero-band">
        <div class="flex-row" style="justify-content:space-between; align-items:flex-start;">
          <div>
            <div class="greeting">Karibu, ${firstName}</div>
            <h2>${state.student.course || "Your dashboard"}</h2>
            <div class="sub">${state.student.year || ""} · ${MOCK.university.name}</div>
          </div>
          <div class="wordmark"><div class="mark" style="width:30px;height:30px;font-size:0.85rem;">K</div></div>
        </div>
        <div class="section-title" style="margin:18px 0 0;">
          <h3 style="color:var(--paper-soft)">Today's timetable</h3>
        </div>
        <div class="timetable-scroll">${timetable}</div>
      </div>

      <div class="page-pad">
        <div class="section-title">
          <h3>Reminders <span class="small muted">(${upcoming} pending)</span></h3>
        </div>
        <div class="card">${notifs}</div>

        <div class="section-title">
          <h3>Your workspaces</h3>
          <button class="see-all" data-action="set-route" data-route="units">See all</button>
        </div>
        <div class="quick-grid">${quick}</div>
      </div>
    </div>`;
}

/* ===========================================================
   UNITS LIST + UNIT WORKSPACE  (Flow 3)
   =========================================================== */

function renderUnitsList() {
  const rows = state.units.map(u => {
    const count = (state.personalFiles[u.id] || []).length;
    return `
      <div class="list-row" data-action="open-unit" data-id="${u.id}">
        <div class="avatar" style="background:${u.accentBg}22; color:${u.accentBg}">${u.code.split(" ")[0]}</div>
        <div class="body">
          <div class="title">${u.code} <span class="muted small">· ${u.name}</span></div>
          <div class="sub">${count} personal file${count === 1 ? "" : "s"} ${u.hasRoom ? "· room joined" : "· no room yet"}</div>
        </div>
        <div class="chevron"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></div>
      </div>`;
  }).join("");

  return `
    <div class="screen">
      <div class="topbar">
        <div class="wordmark"><div class="mark">K</div></div>
        <h1>Your units</h1>
        <div class="spacer"></div>
      </div>
      <div class="page-pad">
        <div class="card" style="padding:4px 16px;">${rows}</div>
        <button class="btn btn-ghost btn-block mt-16" data-action="open-sheet" data-sheet="add-unit">+ Add another unit</button>
      </div>
    </div>`;
}

function renderUnitWorkspace() {
  const u = unitById(state.currentUnitId);
  if (!u) return renderUnitsList();

  const space = state.unitSpace;
  const files = space === "personal" ? (state.personalFiles[u.id] || []) : (u.hasRoom ? (state.roomFiles[u.roomId] || []) : []);
  const topics = ["All", ...u.topics];
  const filtered = state.topicFilter === "All" ? files : files.filter(f => f.topic === state.topicFilter);

  const topicChips = topics.map(t => `
    <button class="topic-chip ${state.topicFilter === t ? "active" : ""}" data-action="set-topic-filter" data-topic="${t}">${t}</button>
  `).join("");

  const fileRows = filtered.length ? filtered.map(f => `
    <div class="file-row">
      <div class="ficon ${f.type}">${fileIconSvg(f.type)}</div>
      <div class="fbody">
        <div class="fname">${f.name}</div>
        <div class="fmeta">${f.topic} · ${f.size} · ${space === "personal" ? f.uploaded : (f.uploader + " · " + f.uploaded)}</div>
      </div>
      <div class="factions">
        ${space === "personal"
          ? (u.hasRoom ? `<div class="icon-mini" data-action="share-file" data-id="${f.id}" title="Share to room"><svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="m16 6-4-4-4 4"/><path d="M12 2v14"/></svg></div>` : "")
          : `<div class="icon-mini" data-action="save-file" data-id="${f.id}" title="Save to my unit"><svg viewBox="0 0 24 24"><path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7"/><path d="m8 10 4 4 4-4"/><path d="M12 14V2"/></svg></div>`}
      </div>
    </div>`).join("") : `
    <div class="empty-state">
      <div class="glyph">📂</div>
      <h4>Nothing here yet</h4>
      <p>${space === "personal" ? "Upload a PDF or photo and Gemma will file it automatically." : "No files have been shared in this room's " + state.topicFilter + " topic yet."}</p>
    </div>`;

  const spaceToggle = u.hasRoom ? `
    <div class="space-toggle">
      <button class="${space === "personal" ? "active" : ""}" data-action="set-unit-space" data-space="personal">My files</button>
      <button class="${space === "room" ? "active" : ""}" data-action="set-unit-space" data-space="room">Shared with room</button>
    </div>` : "";

  const processing = renderProcessingCard();

  return `
    <div class="screen">
      <div class="topbar">
        <button class="icon-btn back" data-action="set-route" data-route="units"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
        <h1>${u.code}</h1>
        <div class="spacer"></div>
        ${!u.hasRoom ? `<button class="btn btn-ghost btn-sm" data-action="create-room" data-id="${u.id}">Start room</button>` : ""}
      </div>
      <div class="unit-hero">
        <div class="code" style="color:${u.accentBg}">${u.code}</div>
        <div class="name">${u.name}</div>
        <div class="tabs-row">${spaceToggle}</div>
      </div>
      <div class="topic-scroll">${topicChips}</div>
      ${processing}
      ${space === "personal" ? `
        <div class="upload-zone" data-action="simulate-upload" data-unit="${u.id}">
          <svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
          <div class="t">Upload a PDF or photo</div>
          <div class="m">Gemma will classify, rename and file it for you</div>
        </div>` : ""}
      <div class="page-pad" style="padding-top:0;">${fileRows}</div>
    </div>`;
}

function renderProcessingCard() {
  if (!state.processingUpload) return "";
  const p = state.processingUpload;
  const messages = [
    "Reading document with Gemma 4…",
    "Classifying topic and document type…",
    "Generating a clean filename…",
    "Filing into the right topic folder…",
  ];
  return `
    <div class="processing-card">
      <div class="spin"></div>
      <div class="txt">${messages[p.step] || messages[0]}<small>${p.filename}</small></div>
    </div>`;
}

/* ===========================================================
   ROOMS LIST + ROOM  (Flow 4)
   =========================================================== */

function renderRoomsList() {
  const joined = state.units.filter(u => u.hasRoom);
  const rows = joined.length ? joined.map(u => {
    const r = roomById(u.roomId);
    const lastMsg = r.chat[r.chat.length - 1];
    const preview = lastMsg ? (lastMsg.from === "system" ? lastMsg.text : `${lastMsg.from === "me" ? "You" : lastMsg.from}: ${lastMsg.text}`) : "No messages yet";
    return `
      <div class="list-row" data-action="open-room" data-id="${u.roomId}">
        <div class="avatar" style="background:${u.accentBg}22; color:${u.accentBg}">${u.code.split(" ")[0]}</div>
        <div class="body">
          <div class="title">${u.code} room <span class="muted small">· ${r.members.length} members</span></div>
          <div class="sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${preview}</div>
        </div>
        <div class="chevron"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></div>
      </div>`;
  }).join("") : `<div class="empty-state"><div class="glyph">💬</div><h4>No rooms yet</h4><p>Start a room from any unit, or join one with a code.</p></div>`;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="wordmark"><div class="mark">K</div></div>
        <h1>Rooms</h1>
        <div class="spacer"></div>
        <button class="icon-btn" data-action="open-sheet" data-sheet="join-room" title="Join a room"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
      </div>
      <div class="page-pad">
        <div class="card" style="padding:4px 16px;">${rows}</div>
      </div>
    </div>`;
}

function renderRoom() {
  const r = roomById(state.currentRoomId);
  if (!r) return renderRoomsList();
  const u = unitById(r.unitId);
  const typing = state.gemmaTyping[r.id];

  const tabs = `
    <div class="room-tabs">
      <button class="room-tab ${state.roomTab === "chat" ? "active" : ""}" data-action="set-room-tab" data-tab="chat">Chat</button>
      <button class="room-tab ${state.roomTab === "files" ? "active" : ""}" data-action="set-room-tab" data-tab="files">Files</button>
      <button class="room-tab ${state.roomTab === "members" ? "active" : ""}" data-action="set-room-tab" data-tab="members">Members</button>
    </div>`;

  let body = "";
  if (state.roomTab === "chat") {
    const msgs = r.chat.map(m => {
      if (m.from === "system") return `<div class="msg system"><div class="bubble">${m.text}</div></div>`;
      if (m.from === "me") return `<div class="msg me"><div class="bubble"><div class="text">${escapeHtml(m.text)}</div></div></div>`;
      if (m.from === "Gemma") return `<div class="msg gemma">
          <div class="av" style="background:var(--marigold-dark)">G</div>
          <div class="bubble"><div class="who"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg> Gemma · grounded in ${u.code}</div><div class="text">${escapeHtml(m.text).replace(/\n/g, "<br>")}</div></div>
        </div>`;
      return `<div class="msg">
          <div class="av" style="background:${avatarColor(m.avatar)}">${initials(m.from)}</div>
          <div class="bubble"><div class="who">${m.from}</div><div class="text">${escapeHtml(m.text)}</div></div>
        </div>`;
    }).join("");

    const typingHtml = typing ? `
      <div class="msg gemma">
        <div class="av" style="background:var(--marigold-dark)">G</div>
        <div class="bubble"><div class="who">Gemma is answering…</div><div class="typing-dots"><span></span><span></span><span></span></div></div>
      </div>` : "";

    body = `
      <div class="chat-scroll" id="chat-scroll">${msgs}${typingHtml}</div>
      <div class="quick-prompts">
        <button class="qp-chip" data-action="quick-prompt" data-text="@Gemma what topics are in the CAT 1 past paper?">CAT 1 topics?</button>
        <button class="qp-chip" data-action="quick-prompt" data-text="@Gemma generate practice questions on this unit">Practice questions</button>
        <button class="qp-chip" data-action="quick-prompt" data-text="@Gemma re-explain this in simple terms">Re-explain simply</button>
        <button class="qp-chip" data-action="quick-prompt" data-text="@Gemma when is the next deadline?">Next deadline?</button>
      </div>
      <div class="chat-input-bar">
        <input id="chat-input" type="text" placeholder="Message the room, or tag @Gemma…" value="${escapeAttr(state.chatDraft)}">
        <button class="send-btn" data-action="send-chat"><svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
      </div>`;
  }

  if (state.roomTab === "files") {
    const files = state.roomFiles[r.id] || [];
    body = `<div class="page-pad">
      ${files.length ? files.map(f => `
        <div class="file-row">
          <div class="ficon ${f.type}">${fileIconSvg(f.type)}</div>
          <div class="fbody"><div class="fname">${f.name}</div><div class="fmeta">${f.topic} · ${f.uploader} · ${f.uploaded}</div></div>
          <div class="factions"><div class="icon-mini" data-action="save-file" data-id="${f.id}" title="Save to my unit"><svg viewBox="0 0 24 24"><path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7"/><path d="m8 10 4 4 4-4"/><path d="M12 14V2"/></svg></div></div>
        </div>`).join("") : `<div class="empty-state"><div class="glyph">📁</div><h4>No shared files</h4><p>Files anyone shares here will show up for the whole room.</p></div>`}
    </div>`;
  }

  if (state.roomTab === "members") {
    body = `<div class="page-pad">
      <div class="stamp" style="margin-bottom:14px;"><svg viewBox="0 0 24 24"><path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7Z"/></svg> Room code: ${r.code}</div>
      ${r.members.map(m => `
        <div class="member-row">
          <div class="av" style="background:${avatarColor(m.avatar)}">${initials(m.name)}</div>
          <div><div class="nm">${m.name}</div><div class="rl">${m.role}</div></div>
        </div>`).join("")}
    </div>`;
  }

  return `
    <div class="screen">
      <div class="topbar">
        <button class="icon-btn back" data-action="set-route" data-route="rooms"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
        <h1>${u.code} room</h1>
        <div class="spacer"></div>
      </div>
      ${tabs}
      ${body}
    </div>`;
}

function avatarColor(cls) {
  const map = { "avatar-a": "#4C6B57", "avatar-b": "#3D4E82", "avatar-c": "#B34A3C", "avatar-d": "#C7842A", "avatar-e": "#6B4C7A" };
  return map[cls] || "#4C6B57";
}
function escapeHtml(s) { return s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function escapeAttr(s) { return (s || "").replace(/"/g, "&quot;"); }

/* ===========================================================
   EVENTS  (Flow 5)
   =========================================================== */

function renderEvents() {
  const mine = state.eventFilter === "mine";
  const list = state.events.filter(e => !mine || e.courses.includes(state.student.course) || e.courses.includes("All courses"));

  const cards = list.length ? list.map(e => `
    <div class="card event-card">
      <div class="event-date"><div class="d mono">${e.date.d}</div><div class="m">${e.date.m}</div></div>
      <div class="event-body">
        <div class="title">${e.title}</div>
        <div class="meta">${e.location}</div>
        <div class="tags">${e.courses.map(c => `<span class="chip on-paper" style="padding:4px 10px; font-size:0.72rem;">${c}</span>`).join("")}</div>
      </div>
      <button class="save-btn ${e.saved ? "saved" : ""}" data-action="toggle-save-event" data-id="${e.id}" title="Save event">
        <svg viewBox="0 0 24 24"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>
      </button>
    </div>`).join("") : `<div class="empty-state"><div class="glyph">🎉</div><h4>No events right now</h4><p>Check back soon, or view all campus events.</p></div>`;

  return `
    <div class="screen">
      <div class="topbar">
        <div class="wordmark"><div class="mark">K</div></div>
        <h1>Events</h1>
        <div class="spacer"></div>
      </div>
      <div class="page-pad">
        <div class="filter-row">
          <button class="chip on-paper ${mine ? "selected" : ""}" data-action="set-event-filter" data-filter="mine">For ${state.student.course ? state.student.course.split(" ")[0] : "you"}</button>
          <button class="chip on-paper ${!mine ? "selected" : ""}" data-action="set-event-filter" data-filter="all">All campus events</button>
        </div>
        ${cards}
      </div>
    </div>`;
}

/* ===========================================================
   UNIVERSITY INFO HUB  (Flow 6)
   =========================================================== */

function renderHub() {
  const msgs = state.hubMessages.map(m => {
    if (m.from === "me") return `<div class="msg me"><div class="bubble"><div class="text">${escapeHtml(m.text)}</div></div></div>`;
    return `<div class="msg gemma" style="max-width:100%;">
        <div class="av" style="background:var(--marigold-dark)">G</div>
        <div class="bubble" style="flex:1;">
          <div class="who"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg> Gemma · University Info Hub</div>
          <div class="text">${escapeHtml(m.text)}</div>
          ${m.sources ? `<div class="suggest-grid" style="margin-top:9px;">${m.sources.map(s => `<span class="source-chip">📄 ${s}</span>`).join("")}</div>` : ""}
        </div>
      </div>`;
  }).join("");

  const suggestions = state.hubMessages.length ? "" : `
    <div class="page-pad">
      <div class="eyebrow-label">Try asking</div>
      <div class="suggest-grid mt-8">
        ${MOCK.hubSuggestions.map(q => `<button class="chip on-paper" data-action="hub-quick" data-q="${escapeAttr(q)}">${q}</button>`).join("")}
      </div>
      <div class="section-title"><h3>School-wide documents</h3></div>
      <div class="card" style="padding:4px 16px;">
        ${MOCK.hubDocs.map(d => `
          <div class="file-row" style="border:none; padding:12px 0; margin:0;">
            <div class="ficon">${fileIconSvg("pdf")}</div>
            <div class="fbody"><div class="fname">${d.name}</div><div class="fmeta">${d.size} · added ${d.added}</div></div>
          </div>`).join("")}
      </div>
      <div class="center mt-24"><button class="text-link" data-action="set-route" data-route="admin">I'm a university official →</button></div>
    </div>`;

  return `
    <div class="screen">
      <div class="hub-hero">
        <h2>University Info Hub</h2>
        <p>Ask about offices, deadlines, hours — grounded only in official ${MOCK.university.shortName} documents.</p>
      </div>
      <div class="hub-search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="hub-input" type="text" placeholder="Ask the University Info Hub…">
        <button class="icon-btn" data-action="send-hub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
      </div>
      ${state.hubMessages.length ? `<div class="chat-scroll">${msgs}</div>` : suggestions}
    </div>`;
}

/* ===========================================================
   ADMIN / UNIVERSITY OFFICIAL  (Flow 7)
   =========================================================== */

function renderAdmin() {
  if (!state.admin.loggedIn) {
    return `
      <div class="screen">
        <div class="topbar"><button class="icon-btn back" data-action="set-route" data-route="hub"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button><h1>Official sign-in</h1><div class="spacer"></div></div>
        <div class="page-pad">
          <div class="card">
            <div class="eyebrow-label">University Official</div>
            <h3 class="mt-8">Sign in with a magic link</h3>
            <p class="small muted mt-8">The one place in Kiini that uses real authentication — students never need this.</p>
            <div class="form-field mt-16">
              <label for="admin-email">Work email</label>
              <input id="admin-email" type="email" placeholder="j.mwangi@embu.ac.ke">
            </div>
            <button class="btn btn-primary btn-block" data-action="admin-send-link">Send magic link</button>
          </div>
        </div>
      </div>`;
  }

  const nav = `
    <div class="filter-row">
      <button class="chip on-paper ${state.admin.view === "post-event" ? "selected" : ""}" data-action="admin-set-view" data-view="post-event">Post an event</button>
      <button class="chip on-paper ${state.admin.view === "manage-hub" ? "selected" : ""}" data-action="admin-set-view" data-view="manage-hub">Manage Info Hub</button>
    </div>`;

  let body = "";
  if (state.admin.view === "post-event") {
    const posted = state.adminEvents.length ? `
      <div class="section-title"><h3>Posted this session</h3></div>
      ${state.adminEvents.map(e => `<div class="card"><div class="flex-row" style="justify-content:space-between;"><b>${e.title}</b><span class="stamp marigold">Live</span></div><div class="small muted mt-8">${e.date} · targeting ${e.course}</div></div>`).join("")}
    ` : "";
    body = `
      <div class="card">
        <div class="form-field"><label for="ev-title">Event title</label><input id="ev-title" type="text" placeholder="e.g. Inter-University Hackathon 2026"></div>
        <div class="form-field"><label for="ev-date">Date</label><input id="ev-date" type="text" placeholder="e.g. 22 Jul 2026"></div>
        <div class="form-field"><label for="ev-loc">Location</label><input id="ev-loc" type="text" placeholder="e.g. Innovation Hub"></div>
        <div class="form-field"><label for="ev-course">Target course / programme</label>
          <select id="ev-course"><option>All courses</option>${MOCK.courses.map(c => `<option>${c}</option>`).join("")}</select>
        </div>
        <button class="btn btn-marigold btn-block" data-action="admin-post-event">Publish event</button>
      </div>
      ${posted}`;
  } else {
    body = `
      <div class="card">
        <div class="eyebrow-label">School-wide documents</div>
        <p class="small muted mt-8">These ground answers in the University Info Hub — separate from any single unit.</p>
        <div class="upload-zone mt-16" data-action="admin-upload-doc">
          <svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
          <div class="t">Upload handbook, timetable or directory</div>
          <div class="m">PDF or image — Gemma indexes it for the whole school</div>
        </div>
      </div>
      <div class="section-title"><h3>Currently indexed</h3></div>
      <div class="card" style="padding:4px 16px;">
        ${state.hubDocs.map(d => `
          <div class="file-row" style="border:none; padding:12px 0; margin:0;">
            <div class="ficon">${fileIconSvg("pdf")}</div>
            <div class="fbody"><div class="fname">${d.name}</div><div class="fmeta">${d.size} · added ${d.added}</div></div>
            <span class="stamp" style="font-size:0.65rem;">Indexed</span>
          </div>`).join("")}
      </div>`;
  }

  return `
    <div class="screen">
      <div class="topbar">
        <button class="icon-btn back" data-action="set-route" data-route="hub"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
        <h1>Official console</h1>
        <div class="spacer"></div>
        <span class="admin-badge">${state.admin.email.split("@")[0]}</span>
      </div>
      <div class="page-pad">${nav}${body}</div>
    </div>`;
}

/* ===========================================================
   SHEETS (bottom modals)
   =========================================================== */

function renderSheet(sheet) {
  let inner = "";

  if (sheet.name === "add-unit") {
    inner = `
      <div class="handle"></div>
      <h3>Add a unit</h3>
      <div class="sheet-lead">It becomes its own organized workspace right away.</div>
      <div class="chip-grid">
        ${MOCK.catalogUnits.filter(u => !state.units.some(su => su.code === u.code)).map(u => `
          <div class="chip on-paper" data-action="add-unit-from-sheet" data-code="${u.code}" data-name="${u.name}">${u.code} — ${u.name}</div>`).join("") || `<p class="small muted">All catalog units already added.</p>`}
      </div>
      <button class="btn btn-ghost btn-block mt-16" data-action="close-sheet">Close</button>`;
  }

  if (sheet.name === "join-room") {
    inner = `
      <div class="handle"></div>
      <h3>Join a room</h3>
      <div class="sheet-lead">Paste a code shared by a classmate.</div>
      <div class="form-field"><label for="join-code">Room code</label><input id="join-code" class="mono" type="text" placeholder="e.g. CIT301-9F2K"></div>
      <button class="btn btn-marigold btn-block" data-action="join-room-submit">Join room</button>`;
  }

  if (sheet.name === "create-room") {
    const u = unitById(sheet.data.unitId);
    inner = `
      <div class="handle"></div>
      <h3>Start a room for ${u.code}</h3>
      <div class="sheet-lead">Anyone with the link or code can join — no account needed.</div>
      <div class="card center" style="padding:22px;">
        <div class="stamp big marigold">${u.code}-${Math.random().toString(36).slice(2, 6).toUpperCase()}</div>
      </div>
      <button class="btn btn-marigold btn-block mt-16" data-action="confirm-create-room" data-id="${u.id}">Create &amp; open room</button>`;
  }

  return `<div class="sheet-backdrop" data-action="close-sheet-backdrop">
      <div class="sheet" data-stop="1">${inner}</div>
    </div>`;
}

/* ===========================================================
   GEMMA simulation helpers
   =========================================================== */

function matchReply(text, table, fallback) {
  const t = text.toLowerCase();
  for (const entry of table) {
    if (entry.match.some(k => t.includes(k))) return entry.reply || entry.answer;
  }
  return fallback;
}
function matchAnswerWithSources(text) {
  const t = text.toLowerCase();
  for (const entry of MOCK.hubAnswers) {
    if (entry.match.some(k => t.includes(k))) return entry;
  }
  return { answer: MOCK.hubDefaultAnswer, sources: null };
}

function sendRoomMessage(rawText) {
  const r = roomById(state.currentRoomId);
  const text = rawText.trim();
  if (!text) return;
  r.chat.push({ from: "me", text });
  state.chatDraft = "";
  render();
  scrollChatToBottom();

  if (/@gemma/i.test(text)) {
    state.gemmaTyping[r.id] = true;
    render();
    scrollChatToBottom();
    setTimeout(() => {
      const reply = matchReply(text, MOCK.gemmaChatReplies, MOCK.gemmaDefaultReply);
      state.gemmaTyping[r.id] = false;
      r.chat.push({ from: "Gemma", text: reply });
      render();
      scrollChatToBottom();
    }, 1100 + Math.random() * 500);
  } else {
    // light demo realism: an occasional classmate reply
  }
}

function scrollChatToBottom() {
  const el = document.getElementById("chat-scroll");
  if (el) el.scrollTop = el.scrollHeight;
}

function sendHubMessage(text) {
  text = text.trim();
  if (!text) return;
  state.hubMessages.push({ from: "me", text });
  render();
  const el = document.querySelector(".hub-hero")?.parentElement?.querySelector(".chat-scroll");
  setTimeout(() => {
    const found = matchAnswerWithSources(text);
    state.hubMessages.push({ from: "Gemma", text: found.answer, sources: found.sources });
    render();
  }, 900);
}

function runUploadSimulation(unitId) {
  if (state.processingUpload) return;
  const sample = MOCK.sampleExtractions[Math.floor(Math.random() * MOCK.sampleExtractions.length)];
  state.processingUpload = { step: 0, filename: sample.filename, unitId, topic: sample.topic };
  render();
  let step = 0;
  const iv = setInterval(() => {
    step++;
    if (!state.processingUpload) { clearInterval(iv); return; }
    state.processingUpload.step = step;
    if (step >= 3) {
      clearInterval(iv);
      setTimeout(() => {
        const list = state.personalFiles[unitId] || (state.personalFiles[unitId] = []);
        list.unshift({
          id: "f" + Date.now(), name: sample.filename, topic: sample.topic,
          type: sample.filename.match(/\.(jpg|jpeg|png)$/i) ? "img" : "pdf",
          size: (Math.round(Math.random() * 900) + 100) + " KB", uploaded: "just now", stamped: true,
        });
        state.processingUpload = null;
        state.topicFilter = "All";
        render();
        toast(`Filed under ${sample.topic}`, "🗂️");
      }, 700);
    } else {
      render();
    }
  }, 750);
}

/* ===========================================================
   Action handling (event delegation)
   =========================================================== */

function afterRender() {
  const chatScroll = document.getElementById("chat-scroll");
  if (chatScroll) chatScroll.scrollTop = chatScroll.scrollHeight;

  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    chatInput.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); sendRoomMessage(chatInput.value); }
    });
    chatInput.addEventListener("input", e => { state.chatDraft = e.target.value; });
  }
  const hubInput = document.getElementById("hub-input");
  if (hubInput) {
    hubInput.focus();
    hubInput.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); sendHubMessage(hubInput.value); hubInput.value = ""; }
    });
  }
  const nameInput = document.getElementById("in-name");
  if (nameInput) nameInput.addEventListener("input", e => { state.student.name = e.target.value; });
  const courseSelect = document.getElementById("in-course");
  if (courseSelect) courseSelect.addEventListener("change", e => { state.student.course = e.target.value; });
}

document.addEventListener("click", (e) => {
  // close sheet on backdrop click (but not when clicking inside the sheet itself)
  if (e.target.dataset.action === "close-sheet-backdrop") {
    state.activeSheet = null; render(); return;
  }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case "set-route":
      setRoute(el.dataset.route);
      break;

    case "onboard-next": {
      if (ONBOARD_STEPS[state.onboardStep] === "profile") {
        if (!state.student.name.trim()) { toast("Add your name to continue", "✏️"); return; }
        const courseEl = document.getElementById("in-course");
        state.student.course = courseEl ? courseEl.value : state.student.course;
        if (!state.student.course) { toast("Select your course to continue", "🎓"); return; }
        if (!state.student.year) { toast("Select your year to continue", "📅"); return; }
      }
      state.onboardStep = Math.min(state.onboardStep + 1, ONBOARD_STEPS.length - 1);
      render();
      break;
    }
    case "onboard-back":
      state.onboardStep = Math.max(state.onboardStep - 1, 0);
      render();
      break;
    case "pick-year":
      state.student.year = el.dataset.year;
      render();
      break;
    case "toggle-unit-code": {
      const code = el.dataset.code;
      const i = state.student.unitCodes.indexOf(code);
      if (i >= 0) state.student.unitCodes.splice(i, 1); else state.student.unitCodes.push(code);
      render();
      break;
    }
    case "finish-onboarding": {
      const codeInput = document.getElementById("in-room-code");
      const pasted = codeInput ? codeInput.value.trim() : "";
      state.onboarded = true;
      state.route = "home";
      if (pasted) toast(`Joined room ${pasted}`, "🎉");
      render();
      break;
    }

    case "toggle-task": {
      const t = state.tasks.find(t => t.id === el.dataset.id);
      if (t) t.done = !t.done;
      render();
      break;
    }

    case "open-unit":
      state.currentUnitId = el.dataset.id;
      state.unitSpace = "personal";
      state.topicFilter = "All";
      setRoute("unit");
      break;
    case "set-unit-space":
      state.unitSpace = el.dataset.space;
      state.topicFilter = "All";
      render();
      break;
    case "set-topic-filter":
      state.topicFilter = el.dataset.topic;
      render();
      break;
    case "simulate-upload":
      runUploadSimulation(el.dataset.unit);
      break;
    case "share-file": {
      const u = unitById(state.currentUnitId);
      const files = state.personalFiles[u.id];
      const f = files.find(f => f.id === el.dataset.id);
      if (f && u.hasRoom) {
        state.roomFiles[u.roomId].unshift({ ...f, uploader: "You" });
        toast("Shared to room", "📤");
        render();
      }
      break;
    }
    case "save-file": {
      const unitId = state.route === "room" ? roomById(state.currentRoomId)?.unitId : state.currentUnitId;
      const u = unitById(unitId);
      if (!u) break;
      const roomFiles = state.roomFiles[u.roomId] || [];
      const f = roomFiles.find(f => f.id === el.dataset.id);
      if (f) {
        const personal = state.personalFiles[u.id] || (state.personalFiles[u.id] = []);
        if (!personal.some(p => p.name === f.name)) personal.unshift({ ...f, uploaded: "just now" });
        toast("Saved to your unit", "📥");
        render();
      }
      break;
    }
    case "create-room":
      state.activeSheet = { name: "create-room", data: { unitId: el.dataset.id } };
      render();
      break;
    case "confirm-create-room": {
      const u = unitById(el.dataset.id);
      const newRoomId = "r" + Date.now();
      const code = `${u.code.replace(" ", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      state.rooms[newRoomId] = { id: newRoomId, unitId: u.id, code, members: [{ name: "You", role: "Member", avatar: u.color }], chat: [{ from: "system", text: "Room created. Share the code so classmates can join." }] };
      state.roomFiles[newRoomId] = [];
      u.hasRoom = true; u.roomId = newRoomId;
      state.activeSheet = null;
      state.currentRoomId = newRoomId;
      state.roomTab = "chat";
      setRoute("room");
      toast("Room created", "🏠");
      break;
    }

    case "open-room":
      state.currentRoomId = el.dataset.id;
      state.roomTab = "chat";
      setRoute("room");
      break;
    case "set-room-tab":
      state.roomTab = el.dataset.tab;
      render();
      break;
    case "send-chat": {
      const input = document.getElementById("chat-input");
      sendRoomMessage(input ? input.value : state.chatDraft);
      break;
    }
    case "quick-prompt":
      sendRoomMessage(el.dataset.text);
      break;

    case "set-event-filter":
      state.eventFilter = el.dataset.filter;
      render();
      break;
    case "toggle-save-event": {
      const ev = state.events.find(e => e.id === el.dataset.id);
      if (ev) { ev.saved = !ev.saved; toast(ev.saved ? "Event saved" : "Removed from saved", ev.saved ? "🔖" : "↩️"); }
      render();
      break;
    }

    case "hub-quick":
      sendHubMessage(el.dataset.q);
      break;
    case "send-hub": {
      const input = document.getElementById("hub-input");
      if (input) { sendHubMessage(input.value); input.value = ""; }
      break;
    }

    case "admin-send-link": {
      const email = document.getElementById("admin-email").value.trim();
      if (!email) { toast("Enter your work email", "✉️"); return; }
      state.admin.email = email;
      state.admin.loggedIn = true;
      toast("Signed in via magic link", "🔗");
      render();
      break;
    }
    case "admin-set-view":
      state.admin.view = el.dataset.view;
      render();
      break;
    case "admin-post-event": {
      const title = document.getElementById("ev-title").value.trim();
      const date = document.getElementById("ev-date").value.trim();
      const course = document.getElementById("ev-course").value;
      if (!title || !date) { toast("Add a title and date", "📝"); return; }
      state.adminEvents.unshift({ title, date, course });
      toast("Event published", "📣");
      document.getElementById("ev-title").value = "";
      document.getElementById("ev-date").value = "";
      document.getElementById("ev-loc").value = "";
      render();
      break;
    }
    case "admin-upload-doc":
      toast("Indexing document for the Info Hub…", "📚");
      setTimeout(() => {
        state.hubDocs.unshift({ name: "New department circular.pdf", size: "180 KB", added: "just now" });
        toast("Indexed — available in the Info Hub", "✅");
        render();
      }, 1300);
      break;

    case "open-sheet":
      state.activeSheet = { name: el.dataset.sheet, data: {} };
      render();
      break;
    case "close-sheet":
      state.activeSheet = null;
      render();
      break;
    case "add-unit-from-sheet": {
      const code = el.dataset.code, name = el.dataset.name;
      const palette = ["avatar-a", "avatar-b", "avatar-c", "avatar-d", "avatar-e"];
      const colorMap = { "avatar-a": "#4C6B57", "avatar-b": "#3D4E82", "avatar-c": "#B34A3C", "avatar-d": "#C7842A", "avatar-e": "#6B4C7A" };
      const color = palette[state.units.length % palette.length];
      const newUnit = { id: "u" + Date.now(), code, name, color, accentBg: colorMap[color], topics: ["General", "Past Papers"], hasRoom: false, roomId: null, deadlineCount: 0 };
      state.units.push(newUnit);
      state.personalFiles[newUnit.id] = [];
      state.activeSheet = null;
      toast(`${code} added`, "➕");
      render();
      break;
    }
    case "join-room-submit": {
      const code = document.getElementById("join-code").value.trim();
      if (!code) { toast("Enter a room code", "🔑"); return; }
      state.activeSheet = null;
      toast(`Joined room ${code.toUpperCase()}`, "🎉");
      // Demo convenience: land them on an existing joined room
      const first = state.units.find(u => u.hasRoom);
      if (first) { state.currentRoomId = first.roomId; setRoute("room"); } else render();
      break;
    }
  }
});

/* stop backdrop-close when clicking inside the sheet */
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-stop]") && e.target.dataset.action === "close-sheet-backdrop") {
    e.stopPropagation();
  }
});

/* ===========================================================
   Init
   =========================================================== */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
