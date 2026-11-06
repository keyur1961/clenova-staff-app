/* Clenova Staff App — $0 MVP · localStorage + IndexedDB · Brisbane */
(() => {
  const STORE_KEY = "clenova-staff-v1";
  const PHOTO_DB = "clenova-photos";
  const PHOTO_STORE = "photos";
  const PINS = { admin: "1234", staff: "2222", client: "3333" };
  const ABN = "90 703 402 528";
  const COMPANY = "Clenova Care Solutions Pty Ltd";

  const DEFAULT_CHECKLIST = [
    { id: "floors", label: "Floors vacuumed / mopped" },
    { id: "bath", label: "Bathroom cleaned & sanitised" },
    { id: "kitchen", label: "Kitchen benches & sink wiped" },
    { id: "bins", label: "Bins emptied" },
    { id: "surfaces", label: "High-touch surfaces disinfected" },
    { id: "supplies", label: "Supplies restocked / left tidy" },
  ];

  // ---------- seed ----------
  function seed() {
    const today = new Date();
    const d = (offset, h = 9, m = 0) => {
      const x = new Date(today);
      x.setDate(x.getDate() + offset);
      x.setHours(h, m, 0, 0);
      return x.toISOString();
    };
    return {
      version: 1,
      staff: [
        { id: "s1", name: "Priya Nair", role: "staff", phone: "04xx xxx 101" },
        { id: "s2", name: "Sam Chen", role: "staff", phone: "04xx xxx 102" },
      ],
      clients: [
        {
          id: "c1",
          name: "Riverbend Aged Care",
          contact: "Nurse Unit Manager",
          address: "12 River Tce, South Brisbane QLD 4101",
          suburb: "South Brisbane",
        },
        {
          id: "c2",
          name: "West End Medical Rooms",
          contact: "Practice Manager",
          address: "88 Vulture St, West End QLD 4101",
          suburb: "West End",
        },
        {
          id: "c3",
          name: "Keyur Demo Home",
          contact: "Keyur Patel",
          address: "Forest Lake QLD 4078",
          suburb: "Forest Lake",
        },
      ],
      jobs: [
        {
          id: "j1",
          clientId: "c1",
          staffId: "s1",
          title: "Daily common-area clean",
          service: "Commercial · Aged care",
          scheduledStart: d(0, 14, 0),
          scheduledEnd: d(0, 16, 0),
          status: "scheduled", // scheduled | in_progress | completed
          checkIn: null,
          checkOut: null,
          notes: "Focus on dining hall + corridors. Key at nurses station.",
          checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, result: null, note: "" })),
          photos: { before: null, after: null },
        },
        {
          id: "j2",
          clientId: "c2",
          staffId: "s1",
          title: "Consulting rooms deep clean",
          service: "Medical rooms",
          scheduledStart: d(0, 17, 0),
          scheduledEnd: d(0, 18, 30),
          status: "scheduled",
          checkIn: null,
          checkOut: null,
          notes: "Use hospital-grade disinfectant. Alarm code with PM.",
          checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, result: null, note: "" })),
          photos: { before: null, after: null },
        },
        {
          id: "j3",
          clientId: "c1",
          staffId: "s2",
          title: "Yesterday evening clean",
          service: "Commercial · Aged care",
          scheduledStart: d(-1, 18, 0),
          scheduledEnd: d(-1, 20, 0),
          status: "completed",
          checkIn: { at: d(-1, 18, 5), lat: -27.4745, lng: 153.018, accuracy: 18 },
          checkOut: { at: d(-1, 19, 55), lat: -27.4746, lng: 153.0182, accuracy: 22 },
          notes: "Completed without issues.",
          checklist: DEFAULT_CHECKLIST.map((c, i) => ({
            ...c,
            result: i === 3 ? "pass" : "pass",
            note: i === 0 ? "Extra mop in wet corridor" : "",
          })),
          photos: { before: null, after: null },
        },
        {
          id: "j4",
          clientId: "c3",
          staffId: "s1",
          title: "End-of-lease clean",
          service: "Residential · Bond clean",
          scheduledStart: d(1, 9, 0),
          scheduledEnd: d(1, 13, 0),
          status: "scheduled",
          checkIn: null,
          checkOut: null,
          notes: "Oven + windows included.",
          checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, result: null, note: "" })),
          photos: { before: null, after: null },
        },
      ],
    };
  }

  // ---------- storage ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) {
        const s = seed();
        save(s);
        return s;
      }
      return JSON.parse(raw);
    } catch {
      const s = seed();
      save(s);
      return s;
    }
  }
  function save(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }
  function resetDemo() {
    localStorage.removeItem(STORE_KEY);
    return openPhotoDB().then((db) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).clear();
      return new Promise((res, rej) => {
        tx.oncomplete = () => res(load());
        tx.onerror = () => rej(tx.error);
      });
    });
  }

  function openPhotoDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(PHOTO_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          db.createObjectStore(PHOTO_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function putPhoto(key, blob) {
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readwrite");
      tx.objectStore(PHOTO_STORE).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function getPhoto(key) {
    if (!key) return null;
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, "readonly");
      const req = tx.objectStore(PHOTO_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // ---------- state ----------
  let data = load();
  let session = JSON.parse(sessionStorage.getItem("clenova-session") || "null");
  let view = session ? { name: "home" } : { name: "login" };
  let toastTimer = null;

  function setSession(s) {
    session = s;
    if (s) sessionStorage.setItem("clenova-session", JSON.stringify(s));
    else sessionStorage.removeItem("clenova-session");
  }

  // ---------- helpers ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  function fmtTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-AU", {
      timeZone: "Australia/Brisbane",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  function fmtShort(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-AU", {
      timeZone: "Australia/Brisbane",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  function hoursBetween(a, b) {
    if (!a || !b) return 0;
    return Math.max(0, (new Date(b) - new Date(a)) / 36e5);
  }
  function brisbaneDate(iso) {
    return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Australia/Brisbane" });
  }
  function todayBrisbane() {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Brisbane" });
  }
  function clientOf(job) {
    return data.clients.find((c) => c.id === job.clientId) || { name: "?", address: "" };
  }
  function staffOf(job) {
    return data.staff.find((s) => s.id === job.staffId) || { name: "?" };
  }
  function statusTag(st) {
    if (st === "in_progress") return '<span class="tag inprog">In progress</span>';
    if (st === "completed") return '<span class="tag done">Completed</span>';
    return '<span class="tag sched">Scheduled</span>';
  }
  function toast(msg) {
    let t = $(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function uid(prefix) {
    return prefix + Math.random().toString(36).slice(2, 9);
  }

  function visibleJobs() {
    if (!session) return [];
    if (session.role === "admin") return data.jobs;
    if (session.role === "staff") {
      const sid = session.staffId || "s1";
      return data.jobs.filter((j) => j.staffId === sid);
    }
    // client
    const cid = session.clientId || "c1";
    return data.jobs.filter((j) => j.clientId === cid);
  }

  // ---------- geo ----------
  function getGeo() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolve({
            lat: +p.coords.latitude.toFixed(5),
            lng: +p.coords.longitude.toFixed(5),
            accuracy: Math.round(p.coords.accuracy),
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }

  // ---------- render ----------
  const root = document.getElementById("app");

  function render() {
    if (!session || view.name === "login") {
      root.innerHTML = renderLogin();
      bindLogin();
      return;
    }
    const navItems = navForRole();
    root.innerHTML = `
      ${renderTop()}
      <div class="main">${renderView()}</div>
      <nav class="nav">${navItems
        .map(
          (n) =>
            `<button type="button" data-nav="${n.id}" class="${view.name === n.id || (view.name === "job" && n.id === "jobs") ? "active" : ""}"><span class="ico">${n.ico}</span>${n.label}</button>`
        )
        .join("")}</nav>
      <div class="footer-note">${esc(COMPANY)} · ABN ${ABN}</div>
    `;
    bindNav();
    bindView();
  }

  function navForRole() {
    if (session.role === "client") {
      return [
        { id: "home", label: "Home", ico: "🏠" },
        { id: "jobs", label: "Jobs", ico: "🧹" },
      ];
    }
    if (session.role === "staff") {
      return [
        { id: "home", label: "Today", ico: "🏠" },
        { id: "jobs", label: "Jobs", ico: "🧹" },
        { id: "timesheet", label: "Hours", ico: "⏱" },
      ];
    }
    return [
      { id: "home", label: "Home", ico: "🏠" },
      { id: "jobs", label: "Jobs", ico: "🧹" },
      { id: "timesheet", label: "Hours", ico: "⏱" },
      { id: "admin", label: "Admin", ico: "⚙" },
    ];
  }

  function renderTop() {
    const initial = (session.name || "?").slice(0, 1).toUpperCase();
    const back =
      view.name === "job" || view.name === "newjob"
        ? `<button type="button" class="back" data-action="back" aria-label="Back">←</button>`
        : `<div class="avatar">${esc(initial)}</div>`;
    const title =
      view.name === "job"
        ? "Job detail"
        : view.name === "newjob"
          ? "New job"
          : view.name === "timesheet"
            ? "Timesheet"
            : view.name === "admin"
              ? "Admin"
              : view.name === "jobs"
                ? "Jobs"
                : "Clenova Staff";
    return `<header class="topbar">${back}<h2>${esc(title)}</h2><span class="chip">${esc(session.role)}</span><button type="button" class="btn btn-ghost btn-sm" data-action="logout" style="width:auto;padding:6px 12px">Out</button></header>`;
  }

  function renderLogin() {
    return `
      <div class="login">
        <div class="login-brand">
          <div class="login-logo">C</div>
          <div>
            <h1>Clenova Staff</h1>
            <p class="sub">Check-ins · Photos · Inspections · Portal</p>
          </div>
        </div>
        <div class="login-card">
          <label>Role</label>
          <div class="role-grid" id="roles">
            <button type="button" class="role-btn active" data-role="admin"><span>👔</span>Admin</button>
            <button type="button" class="role-btn" data-role="staff"><span>🧹</span>Staff</button>
            <button type="button" class="role-btn" data-role="client"><span>🏠</span>Client</button>
          </div>
          <label for="pin">PIN</label>
          <input id="pin" class="pin-input" type="password" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••" />
          <p class="err" id="login-err"></p>
          <button type="button" class="btn" id="login-btn" style="margin-top:14px">Sign in</button>
          <p class="hint">Demo PINs — Admin <b>1234</b> · Staff <b>2222</b> · Client <b>3333</b>. Data stays on this device. $0 · no cloud.</p>
        </div>
      </div>`;
  }

  function renderView() {
    switch (view.name) {
      case "home":
        return renderHome();
      case "jobs":
        return renderJobs();
      case "job":
        return renderJobDetail(view.jobId);
      case "timesheet":
        return renderTimesheet();
      case "admin":
        return renderAdmin();
      case "newjob":
        return renderNewJob();
      default:
        return renderHome();
    }
  }

  function renderHome() {
    const jobs = visibleJobs().slice().sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));
    const todayStr = todayBrisbane();
    const today = jobs.filter((j) => brisbaneDate(j.scheduledStart) === todayStr || j.status === "in_progress");
    const done = jobs.filter((j) => j.status === "completed").length;
    const open = jobs.filter((j) => j.status !== "completed").length;
    const inProg = jobs.filter((j) => j.status === "in_progress").length;

    let greeting = `Hi ${esc(session.name)}`;
    if (session.role === "client") greeting = `${esc(session.name)} portal`;

    return `
      <p style="margin:0 0 12px;color:var(--muted);font-size:.95rem">${greeting}</p>
      <div class="stat-grid">
        <div class="stat"><div class="n">${today.length}</div><div class="l">Today</div></div>
        <div class="stat"><div class="n">${inProg}</div><div class="l">Active</div></div>
        <div class="stat"><div class="n">${done}</div><div class="l">Done</div></div>
      </div>
      <div class="section-title">${session.role === "client" ? "Your jobs" : "Today's jobs"}</div>
      ${
        today.length
          ? today.map(jobCard).join("")
          : `<div class="empty">No jobs scheduled for today.${open ? ` ${open} upcoming.` : ""}</div>`
      }
      ${
        session.role !== "client"
          ? `<div class="section-title">Quick tip</div><div class="card meta">Open a job → <b>Check in</b> (GPS optional) → add before/after photos → complete the inspection → <b>Check out</b>.</div>`
          : `<div class="card meta">You can view completed cleans, photos and inspection results for your sites.</div>`
      }
    `;
  }

  function jobCard(j) {
    const c = clientOf(j);
    return `
      <div class="card tap" data-open-job="${j.id}">
        <div class="card-h">
          <strong>${esc(j.title)}</strong>
          ${statusTag(j.status)}
        </div>
        <div class="meta">${esc(c.name)} · ${esc(c.suburb || "")}<br/>${fmtTime(j.scheduledStart)}${j.checkIn ? ` · in ${fmtShort(j.checkIn.at)}` : ""}${j.checkOut ? ` → out ${fmtShort(j.checkOut.at)}` : ""}</div>
      </div>`;
  }

  function renderJobs() {
    const jobs = visibleJobs().slice().sort((a, b) => b.scheduledStart.localeCompare(a.scheduledStart));
    return `
      ${session.role === "admin" ? `<button type="button" class="btn" data-action="newjob" style="margin-bottom:12px">+ New job</button>` : ""}
      ${jobs.length ? jobs.map(jobCard).join("") : `<div class="empty">No jobs yet.</div>`}
    `;
  }

  function renderJobDetail(jobId) {
    const j = data.jobs.find((x) => x.id === jobId);
    if (!j) return `<div class="empty">Job not found.</div>`;
    const c = clientOf(j);
    const s = staffOf(j);
    const canEdit = session.role === "admin" || session.role === "staff";
    const clientView = session.role === "client";

    const checkBlock = `
      <div class="section-title">Attendance</div>
      <div class="card">
        <div class="kv">
          <dt>Check-in</dt><dd>${j.checkIn ? esc(fmtTime(j.checkIn.at)) + (j.checkIn.lat != null ? ` <span class="meta">(${j.checkIn.lat}, ${j.checkIn.lng} ±${j.checkIn.accuracy || "?"}m)</span>` : " <span class='meta'>(no GPS)</span>") : "—"}</dd>
          <dt>Check-out</dt><dd>${j.checkOut ? esc(fmtTime(j.checkOut.at)) + (j.checkOut.lat != null ? ` <span class="meta">(${j.checkOut.lat}, ${j.checkOut.lng} ±${j.checkOut.accuracy || "?"}m)</span>` : "") : "—"}</dd>
          <dt>Hours</dt><dd>${j.checkIn && j.checkOut ? hoursBetween(j.checkIn.at, j.checkOut.at).toFixed(2) + " h" : "—"}</dd>
        </div>
        ${
          canEdit && j.status !== "completed"
            ? `<div class="btn-row" style="margin-top:10px">
                ${!j.checkIn ? `<button type="button" class="btn btn-ok" data-action="checkin">Check in</button>` : ""}
                ${j.checkIn && !j.checkOut ? `<button type="button" class="btn btn-warn" data-action="checkout">Check out</button>` : ""}
                ${j.checkIn && !j.checkOut ? `<button type="button" class="btn btn-ghost" data-action="complete">Mark complete</button>` : ""}
              </div>`
            : ""
        }
      </div>`;

    const photoBlock = `
      <div class="section-title">Photos</div>
      <div class="photo-grid">
        <label class="photo-slot ${j.photos.before ? "has" : ""}" data-photo="before" id="slot-before">
          <span>📷 Before</span>
          ${canEdit && !clientView ? `<input type="file" accept="image/*" capture="environment" data-photo-input="before" />` : ""}
          <span class="photo-cap">Before</span>
        </label>
        <label class="photo-slot ${j.photos.after ? "has" : ""}" data-photo="after" id="slot-after">
          <span>✨ After</span>
          ${canEdit && !clientView ? `<input type="file" accept="image/*" capture="environment" data-photo-input="after" />` : ""}
          <span class="photo-cap">After</span>
        </label>
      </div>`;

    const checklistBlock = `
      <div class="section-title">Inspection checklist</div>
      <div class="card">
        ${j.checklist
          .map((item, idx) => {
            const passOn = item.result === "pass" ? "on-pass" : "";
            const failOn = item.result === "fail" ? "on-fail" : "";
            return `
            <div class="check-item" data-check-idx="${idx}">
              <div class="q">
                <div>${esc(item.label)}</div>
                ${
                  canEdit && !clientView
                    ? `<textarea class="note-input" data-note-idx="${idx}" placeholder="Note (optional)">${esc(item.note || "")}</textarea>`
                    : item.note
                      ? `<div class="meta" style="margin-top:4px">${esc(item.note)}</div>`
                      : ""
                }
              </div>
              <div class="check-actions">
                <button type="button" class="${passOn}" data-result="pass" ${clientView || !canEdit ? "disabled" : ""}>✓ Pass</button>
                <button type="button" class="${failOn}" data-result="fail" ${clientView || !canEdit ? "disabled" : ""}>✗ Fail</button>
              </div>
            </div>`;
          })
          .join("")}
        <div class="meta" style="margin-top:8px">
          ${
            j.checklist.every((i) => i.result === "pass")
              ? '<span class="tag pass">All passed</span>'
              : j.checklist.some((i) => i.result === "fail")
                ? '<span class="tag fail">Has fails</span>'
                : "Not finished"
          }
        </div>
      </div>`;

    return `
      <div class="detail-banner">
        <h3>${esc(j.title)}</h3>
        <div class="meta">${statusTag(j.status)} · ${esc(j.service)}</div>
        <div class="kv" style="margin-top:10px">
          <dt>Client</dt><dd>${esc(c.name)}<br/><span class="meta">${esc(c.address)}</span></dd>
          <dt>Staff</dt><dd>${esc(s.name)}</dd>
          <dt>Window</dt><dd>${esc(fmtTime(j.scheduledStart))} – ${esc(fmtShort(j.scheduledEnd))}</dd>
          <dt>Notes</dt><dd>${esc(j.notes || "—")}</dd>
        </div>
      </div>
      ${checkBlock}
      ${photoBlock}
      ${checklistBlock}
    `;
  }

  function renderTimesheet() {
    const jobs = visibleJobs().filter((j) => j.checkIn && j.checkOut);
    const byStaff = {};
    for (const j of data.jobs.filter((x) => x.checkIn && x.checkOut)) {
      if (session.role === "staff" && j.staffId !== (session.staffId || "s1")) continue;
      if (session.role === "client" && j.clientId !== (session.clientId || "c1")) continue;
      const s = staffOf(j);
      byStaff[s.name] = byStaff[s.name] || [];
      byStaff[s.name].push(j);
    }
    const names = Object.keys(byStaff);
    if (!names.length) return `<div class="empty">No completed shifts yet. Check in and out on a job to log hours.</div>`;

    return names
      .map((name) => {
        const list = byStaff[name];
        const total = list.reduce((sum, j) => sum + hoursBetween(j.checkIn.at, j.checkOut.at), 0);
        return `
          <div class="section-title">${esc(name)}</div>
          <div class="card">
            ${list
              .map((j) => {
                const c = clientOf(j);
                const h = hoursBetween(j.checkIn.at, j.checkOut.at);
                return `<div class="ts-row"><div><strong>${esc(j.title)}</strong><div class="meta">${esc(c.name)} · ${esc(fmtTime(j.checkIn.at))}</div></div><div class="hrs">${h.toFixed(2)} h</div></div>`;
              })
              .join("")}
            <div class="ts-total"><span>Total</span><span class="hrs">${total.toFixed(2)} h</span></div>
          </div>`;
      })
      .join("");
  }

  function renderAdmin() {
    return `
      <div class="section-title">Overview</div>
      <div class="stat-grid">
        <div class="stat"><div class="n">${data.jobs.length}</div><div class="l">Jobs</div></div>
        <div class="stat"><div class="n">${data.staff.length}</div><div class="l">Staff</div></div>
        <div class="stat"><div class="n">${data.clients.length}</div><div class="l">Clients</div></div>
      </div>
      <div class="section-title">Staff</div>
      ${data.staff.map((s) => `<div class="card"><strong>${esc(s.name)}</strong><div class="meta">${esc(s.phone)}</div></div>`).join("")}
      <div class="section-title">Clients</div>
      ${data.clients.map((c) => `<div class="card"><strong>${esc(c.name)}</strong><div class="meta">${esc(c.address)}</div></div>`).join("")}
      <div class="section-title">Actions</div>
      <div class="btn-row">
        <button type="button" class="btn" data-action="newjob">+ New job</button>
        <button type="button" class="btn btn-ghost" data-action="reset">Reset demo data</button>
      </div>
      <p class="hint" style="margin-top:14px">PINs are demo-only. For live use, host on GitHub Pages under keyur1961 (needs your OK) and later add a real login.</p>
    `;
  }

  function renderNewJob() {
    return `
      <form id="new-job-form">
        <div class="field"><label>Title</label><input name="title" required placeholder="e.g. Evening clean" /></div>
        <div class="field"><label>Service</label><input name="service" value="General clean" /></div>
        <div class="field"><label>Client</label>
          <select name="clientId">${data.clients.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
        </div>
        <div class="field"><label>Staff</label>
          <select name="staffId">${data.staff.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select>
        </div>
        <div class="field"><label>Start</label><input name="start" type="datetime-local" required /></div>
        <div class="field"><label>End</label><input name="end" type="datetime-local" required /></div>
        <div class="field"><label>Notes</label><textarea name="notes" rows="3"></textarea></div>
        <button type="submit" class="btn">Create job</button>
      </form>
    `;
  }

  // ---------- bind ----------
  function bindLogin() {
    let role = "admin";
    $("#roles").addEventListener("click", (e) => {
      const b = e.target.closest("[data-role]");
      if (!b) return;
      role = b.dataset.role;
      $("#roles").querySelectorAll(".role-btn").forEach((x) => x.classList.toggle("active", x === b));
    });
    const go = () => {
      const pin = $("#pin").value.trim();
      if (pin !== PINS[role]) {
        $("#login-err").textContent = "Wrong PIN for that role.";
        return;
      }
      if (role === "admin") setSession({ role: "admin", name: "Keyur (Admin)", staffId: null, clientId: null });
      else if (role === "staff") setSession({ role: "staff", name: data.staff[0].name, staffId: "s1", clientId: null });
      else setSession({ role: "client", name: data.clients[0].name, staffId: null, clientId: "c1" });
      view = { name: "home" };
      render();
      toast(`Signed in as ${session.role}`);
    };
    $("#login-btn").addEventListener("click", go);
    $("#pin").addEventListener("keydown", (e) => {
      if (e.key === "Enter") go();
    });
  }

  function bindNav() {
    root.querySelectorAll("[data-nav]").forEach((b) =>
      b.addEventListener("click", () => {
        view = { name: b.dataset.nav };
        render();
      })
    );
    root.querySelectorAll("[data-action]").forEach((b) =>
      b.addEventListener("click", async () => {
        const a = b.dataset.action;
        if (a === "logout") {
          setSession(null);
          view = { name: "login" };
          render();
        } else if (a === "back") {
          view = { name: "jobs" };
          render();
        } else if (a === "newjob") {
          view = { name: "newjob" };
          render();
        } else if (a === "reset") {
          if (!confirm("Reset all demo data on this device?")) return;
          data = await resetDemo();
          toast("Demo data reset");
          view = { name: "admin" };
          render();
        } else if (a === "checkin") {
          await doCheckIn();
        } else if (a === "checkout") {
          await doCheckOut(false);
        } else if (a === "complete") {
          await doCheckOut(true);
        }
      })
    );
    root.querySelectorAll("[data-open-job]").forEach((el) =>
      el.addEventListener("click", () => {
        view = { name: "job", jobId: el.dataset.openJob };
        render();
      })
    );
  }

  function bindView() {
    if (view.name === "job") {
      loadPhotosIntoSlots(view.jobId);
      root.querySelectorAll("[data-photo-input]").forEach((inp) => {
        inp.addEventListener("change", async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const kind = inp.dataset.photoInput;
          const key = `${view.jobId}:${kind}`;
          await putPhoto(key, file);
          const j = data.jobs.find((x) => x.id === view.jobId);
          j.photos[kind] = key;
          save(data);
          toast(`${kind === "before" ? "Before" : "After"} photo saved`);
          render();
        });
      });
      root.querySelectorAll(".check-item").forEach((row) => {
        const idx = +row.dataset.checkIdx;
        row.querySelectorAll("[data-result]").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (btn.disabled) return;
            const j = data.jobs.find((x) => x.id === view.jobId);
            j.checklist[idx].result = btn.dataset.result;
            save(data);
            render();
          });
        });
        const note = row.querySelector("[data-note-idx]");
        if (note) {
          note.addEventListener("change", () => {
            const j = data.jobs.find((x) => x.id === view.jobId);
            j.checklist[idx].note = note.value;
            save(data);
          });
        }
      });
    }
    if (view.name === "newjob") {
      const form = $("#new-job-form");
      // default datetimes: tomorrow 9–11 Brisbane-ish local
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setHours(11, 0, 0, 0);
      const toLocal = (d) => {
        const off = d.getTimezoneOffset();
        const x = new Date(d.getTime() - off * 60000);
        return x.toISOString().slice(0, 16);
      };
      form.start.value = toLocal(start);
      form.end.value = toLocal(end);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const job = {
          id: uid("j"),
          clientId: fd.get("clientId"),
          staffId: fd.get("staffId"),
          title: fd.get("title"),
          service: fd.get("service") || "General clean",
          scheduledStart: new Date(fd.get("start")).toISOString(),
          scheduledEnd: new Date(fd.get("end")).toISOString(),
          status: "scheduled",
          checkIn: null,
          checkOut: null,
          notes: fd.get("notes") || "",
          checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, result: null, note: "" })),
          photos: { before: null, after: null },
        };
        data.jobs.push(job);
        save(data);
        toast("Job created");
        view = { name: "job", jobId: job.id };
        render();
      });
    }
  }

  async function loadPhotosIntoSlots(jobId) {
    const j = data.jobs.find((x) => x.id === jobId);
    if (!j) return;
    for (const kind of ["before", "after"]) {
      const key = j.photos[kind];
      if (!key) continue;
      const blob = await getPhoto(key);
      if (!blob) continue;
      const url = URL.createObjectURL(blob);
      const slot = $(`#slot-${kind}`);
      if (!slot) continue;
      let img = slot.querySelector("img");
      if (!img) {
        img = document.createElement("img");
        img.alt = kind;
        slot.appendChild(img);
      }
      img.src = url;
      slot.classList.add("has");
    }
  }

  async function doCheckIn() {
    const j = data.jobs.find((x) => x.id === view.jobId);
    if (!j || j.checkIn) return;
    toast("Getting location…");
    const geo = await getGeo();
    j.checkIn = { at: new Date().toISOString(), ...(geo || {}) };
    j.status = "in_progress";
    save(data);
    toast(geo ? "Checked in with GPS" : "Checked in (no GPS)");
    render();
  }

  async function doCheckOut(forceComplete) {
    const j = data.jobs.find((x) => x.id === view.jobId);
    if (!j || !j.checkIn) return;
    toast("Getting location…");
    const geo = await getGeo();
    j.checkOut = { at: new Date().toISOString(), ...(geo || {}) };
    j.status = "completed";
    save(data);
    toast(forceComplete ? "Job completed" : "Checked out");
    render();
  }

  // boot
  openPhotoDB().catch(() => {});
  render();
})();
