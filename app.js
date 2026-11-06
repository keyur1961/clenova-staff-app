/* Clenova Staff App — $0 MVP · localStorage + IndexedDB · Brisbane
   Roles: Admin / Inspector / Cleaner / Client (+ Staff alias → Cleaner) */
(() => {
  const STORE_KEY = "clenova-staff-v2";
  const PHOTO_DB = "clenova-photos";
  const PHOTO_STORE = "photos";
  const PINS = {
    admin: "1234",
    staff: "2222",
    client: "3333",
    inspector: "4444",
    cleaner: "5555",
  };
  const ABN = "90 703 402 528";
  const COMPANY = "Clenova Care Solutions Pty Ltd";
  const APP_VERSION = "2026-11-06-inspector-cleaner";

  const DEFAULT_TASKS = [
    { id: "floors", label: "Floors vacuumed / mopped" },
    { id: "bath", label: "Bathroom cleaned & sanitised" },
    { id: "kitchen", label: "Kitchen benches & sink wiped" },
    { id: "bins", label: "Bins emptied" },
    { id: "surfaces", label: "High-touch surfaces disinfected" },
    { id: "supplies", label: "Supplies restocked / left tidy" },
  ];

  const PROPERTY_TYPES = {
    "1bed": {
      label: "1-bedroom house",
      rooms: ["Entry", "Living", "Kitchen", "Bedroom 1", "Bathroom", "Laundry", "Exterior / Balcony"],
    },
    "2bed": {
      label: "2-bedroom house",
      rooms: ["Entry", "Living", "Kitchen", "Bedroom 1", "Bedroom 2", "Bathroom", "Laundry", "Exterior / Balcony"],
    },
    "3bed": {
      label: "3-bedroom house",
      rooms: [
        "Entry",
        "Living",
        "Kitchen",
        "Bedroom 1",
        "Bedroom 2",
        "Bedroom 3",
        "Bathroom",
        "Laundry",
        "Exterior / Balcony",
      ],
    },
    "4bed": {
      label: "4-bedroom house",
      rooms: [
        "Entry",
        "Living",
        "Kitchen",
        "Bedroom 1",
        "Bedroom 2",
        "Bedroom 3",
        "Bedroom 4",
        "Bathroom 1",
        "Bathroom 2",
        "Laundry",
        "Exterior / Balcony",
      ],
    },
    "5bed": {
      label: "5-bedroom house",
      rooms: [
        "Entry",
        "Living",
        "Kitchen",
        "Bedroom 1",
        "Bedroom 2",
        "Bedroom 3",
        "Bedroom 4",
        "Bedroom 5",
        "Bathroom 1",
        "Bathroom 2",
        "Laundry",
        "Exterior / Balcony",
      ],
    },
    duplex: {
      label: "Duplex",
      rooms: [
        "Entry",
        "Living",
        "Kitchen",
        "Bedroom 1",
        "Bedroom 2",
        "Bathroom 1",
        "Bathroom 2",
        "Laundry",
        "Exterior / Balcony",
      ],
    },
    other: { label: "Other requested works", rooms: [] },
  };

  function roomSlotsFor(propertyType, customRooms) {
    if (propertyType === "other") {
      const rooms = (customRooms || []).filter(Boolean);
      return rooms.length
        ? rooms.map((label, i) => ({ id: "custom-" + i, label, required: true }))
        : [{ id: "custom-0", label: "Work area 1", required: true }];
    }
    const def = PROPERTY_TYPES[propertyType] || PROPERTY_TYPES["3bed"];
    return def.rooms.map((label, i) => ({
      id: "room-" + i + "-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      required: true,
    }));
  }

  function makeInspectionPhotos(propertyType, customRooms) {
    return roomSlotsFor(propertyType, customRooms).map((s) => ({
      id: s.id,
      label: s.label,
      required: true,
      photoKey: null,
    }));
  }

  function makeTaskList(taskDefs) {
    return (taskDefs || DEFAULT_TASKS).map((t) => ({
      id: t.id,
      label: t.label,
      done: false,
      doneAt: null,
    }));
  }

  // ---------- seed ----------
  function seed() {
    const today = new Date();
    const d = (offset, h = 9, m = 0) => {
      const x = new Date(today);
      x.setDate(x.getDate() + offset);
      x.setHours(h, m, 0, 0);
      return x.toISOString();
    };
    const tasks = makeTaskList(DEFAULT_TASKS);
    return {
      version: 2,
      appVersion: APP_VERSION,
      staff: [
        { id: "s1", name: "Priya Nair", role: "cleaner", phone: "04xx xxx 101" },
        { id: "s2", name: "Sam Chen", role: "cleaner", phone: "04xx xxx 102" },
        { id: "i1", name: "Alex Inspector", role: "inspector", phone: "04xx xxx 201" },
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
        normalizeJob({
          id: "j1",
          clientId: "c1",
          staffId: "s1",
          inspectorId: "i1",
          title: "Daily common-area clean",
          service: "Commercial · Aged care",
          propertyType: "other",
          customRooms: ["Dining hall", "Corridor A", "Corridor B", "Nurses station"],
          scheduledStart: d(0, 14, 0),
          scheduledEnd: d(0, 16, 0),
          status: "scheduled",
          checkIn: null,
          checkOut: null,
          notes: "Focus on dining hall + corridors. Key at nurses station.",
          tasks: tasks.map((t) => ({ ...t })),
        }),
        normalizeJob({
          id: "j2",
          clientId: "c2",
          staffId: "s1",
          inspectorId: "i1",
          title: "Consulting rooms deep clean",
          service: "Medical rooms",
          propertyType: "other",
          customRooms: ["Waiting room", "Consult 1", "Consult 2", "Bathroom"],
          scheduledStart: d(0, 17, 0),
          scheduledEnd: d(0, 18, 30),
          status: "scheduled",
          checkIn: null,
          checkOut: null,
          notes: "Use hospital-grade disinfectant. Alarm code with PM.",
          tasks: tasks.map((t) => ({ ...t })),
        }),
        normalizeJob({
          id: "j3",
          clientId: "c1",
          staffId: "s2",
          inspectorId: "i1",
          title: "Yesterday evening clean",
          service: "Commercial · Aged care",
          propertyType: "other",
          customRooms: ["Dining hall", "Corridor A"],
          scheduledStart: d(-1, 18, 0),
          scheduledEnd: d(-1, 20, 0),
          status: "completed",
          checkIn: { at: d(-1, 18, 5), lat: -27.4745, lng: 153.018, accuracy: 18 },
          checkOut: { at: d(-1, 19, 55), lat: -27.4746, lng: 153.0182, accuracy: 22 },
          notes: "Completed without issues.",
          tasks: tasks.map((t) => ({ ...t, done: true, doneAt: d(-1, 19, 50) })),
          completionRecord: {
            at: d(-1, 19, 55),
            by: "s2",
            byName: "Sam Chen",
            tasksDone: tasks.map((t) => t.label),
            arrivalPhotoCount: 2,
            completionPhotoCount: 2,
            inspectorPhotoCount: 2,
          },
        }),
        normalizeJob({
          id: "j4",
          clientId: "c3",
          staffId: "s1",
          inspectorId: "i1",
          title: "End-of-lease clean",
          service: "Residential · Bond clean",
          propertyType: "3bed",
          customRooms: [],
          scheduledStart: d(1, 9, 0),
          scheduledEnd: d(1, 13, 0),
          status: "scheduled",
          checkIn: null,
          checkOut: null,
          notes: "Oven + windows included.",
          tasks: tasks.map((t) => ({ ...t })),
        }),
      ],
    };
  }

  function normalizeJob(j) {
    const propertyType = j.propertyType || "3bed";
    const customRooms = j.customRooms || [];
    const inspPhotos =
      j.inspection && Array.isArray(j.inspection.photos) && j.inspection.photos.length
        ? j.inspection.photos
        : makeInspectionPhotos(propertyType, customRooms);
    const tasks = Array.isArray(j.tasks) && j.tasks.length ? j.tasks : makeTaskList(DEFAULT_TASKS);
    return {
      id: j.id,
      clientId: j.clientId,
      staffId: j.staffId || "s1",
      inspectorId: j.inspectorId || "i1",
      title: j.title || "Job",
      service: j.service || "General clean",
      propertyType,
      customRooms,
      scheduledStart: j.scheduledStart,
      scheduledEnd: j.scheduledEnd,
      status: j.status || "scheduled",
      checkIn: j.checkIn || null,
      checkOut: j.checkOut || null,
      notes: j.notes || "",
      tasks: tasks.map((t) => ({
        id: t.id,
        label: t.label,
        done: !!t.done,
        doneAt: t.doneAt || null,
      })),
      inspection: {
        status: (j.inspection && j.inspection.status) || "pending",
        at: (j.inspection && j.inspection.at) || null,
        by: (j.inspection && j.inspection.by) || null,
        byName: (j.inspection && j.inspection.byName) || null,
        photos: inspPhotos.map((p) => ({
          id: p.id,
          label: p.label,
          required: p.required !== false,
          photoKey: p.photoKey || null,
        })),
      },
      cleanerWork: {
        arrivalPhotos: (j.cleanerWork && j.cleanerWork.arrivalPhotos) || {},
        completionPhotos: (j.cleanerWork && j.cleanerWork.completionPhotos) || {},
      },
      completionRecord: j.completionRecord || null,
    };
  }

  // ---------- storage ----------
  function migrateIfNeeded() {
    try {
      const v2 = localStorage.getItem(STORE_KEY);
      if (v2) return JSON.parse(v2);
      const v1 = localStorage.getItem("clenova-staff-v1");
      if (v1) {
        const old = JSON.parse(v1);
        const migrated = {
          version: 2,
          appVersion: APP_VERSION,
          staff: (old.staff || []).map((s) => ({
            ...s,
            role: s.role === "staff" ? "cleaner" : s.role || "cleaner",
          })),
          clients: old.clients || [],
          jobs: (old.jobs || []).map((j) =>
            normalizeJob({
              ...j,
              propertyType: "3bed",
              tasks: (j.checklist || DEFAULT_TASKS).map((c) => ({
                id: c.id,
                label: c.label,
                done: c.result === "pass",
                doneAt: c.result === "pass" ? j.checkOut && j.checkOut.at : null,
              })),
            })
          ),
        };
        if (!migrated.staff.find((s) => s.role === "inspector")) {
          migrated.staff.push({
            id: "i1",
            name: "Alex Inspector",
            role: "inspector",
            phone: "04xx xxx 201",
          });
        }
        save(migrated);
        return migrated;
      }
    } catch {
      /* fall through */
    }
    const s = seed();
    save(s);
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return migrateIfNeeded();
      const parsed = JSON.parse(raw);
      parsed.jobs = (parsed.jobs || []).map(normalizeJob);
      parsed.appVersion = APP_VERSION;
      return parsed;
    } catch {
      const s = seed();
      save(s);
      return s;
    }
  }
  function save(d) {
    d.appVersion = APP_VERSION;
    localStorage.setItem(STORE_KEY, JSON.stringify(d));
  }
  function resetDemo() {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem("clenova-staff-v1");
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

  /** Compress image file to JPEG blob (~max edge 1280, quality 0.7) */
  function compressImage(file, maxEdge = 1280, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        const scale = Math.min(1, maxEdge / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("compress failed"));
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image load failed"));
      };
      img.src = url;
    });
  }

  // ---------- state ----------
  let data = load();
  let session = JSON.parse(sessionStorage.getItem("clenova-session") || "null");
  let view = session ? { name: "home" } : { name: "login" };
  let toastTimer = null;
  let missingBanner = null;

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
  function inspectorOf(job) {
    return data.staff.find((s) => s.id === job.inspectorId) || { name: "—" };
  }
  function statusTag(st) {
    if (st === "in_progress") return '<span class="tag inprog">In progress</span>';
    if (st === "completed") return '<span class="tag done">Completed</span>';
    if (st === "inspected") return '<span class="tag insp">Inspected</span>';
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
    toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  }
  function uid(prefix) {
    return prefix + Math.random().toString(36).slice(2, 9);
  }
  function propertyLabel(type) {
    return (PROPERTY_TYPES[type] && PROPERTY_TYPES[type].label) || type || "—";
  }

  function isCleanerRole() {
    return session && (session.role === "cleaner" || session.role === "staff");
  }
  function isInspectorRole() {
    return session && session.role === "inspector";
  }
  function canWorkJobs() {
    return session && (session.role === "admin" || isCleanerRole() || isInspectorRole());
  }

  function visibleJobs() {
    if (!session) return [];
    if (session.role === "admin") return data.jobs;
    if (isCleanerRole()) {
      const sid = session.staffId || "s1";
      return data.jobs.filter((j) => j.staffId === sid);
    }
    if (isInspectorRole()) {
      const iid = session.staffId || "i1";
      return data.jobs.filter((j) => j.inspectorId === iid || !j.inspectorId);
    }
    const cid = session.clientId || "c1";
    return data.jobs.filter((j) => j.clientId === cid);
  }

  function inspectorPhotoGaps(j) {
    return (j.inspection.photos || []).filter((p) => p.required && !p.photoKey);
  }
  function cleanerArrivalGaps(j) {
    return (j.inspection.photos || []).filter((p) => p.photoKey && !j.cleanerWork.arrivalPhotos[p.id]);
  }
  function cleanerCompletionGaps(j) {
    return (j.inspection.photos || []).filter((p) => p.photoKey && !j.cleanerWork.completionPhotos[p.id]);
  }
  function taskGaps(j) {
    return (j.tasks || []).filter((t) => !t.done);
  }

  function completionBlockers(j) {
    const missing = [];
    if (j.inspection.status !== "done") {
      missing.push("Inspection not finished (inspector must complete photos & submit)");
    }
    for (const p of cleanerArrivalGaps(j)) missing.push("Arrival photo: " + p.label);
    for (const p of cleanerCompletionGaps(j)) missing.push("Completion photo: " + p.label);
    for (const t of taskGaps(j)) missing.push("Task unticked: " + t.label);
    if (!j.checkIn) missing.push("Check-in required");
    return missing;
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
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
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
            `<button type="button" data-nav="${n.id}" class="${
              view.name === n.id || (view.name === "job" && n.id === "jobs") ? "active" : ""
            }"><span class="ico">${n.ico}</span>${n.label}</button>`
        )
        .join("")}</nav>
      <div class="footer-note">${esc(COMPANY)} · ABN ${ABN}<span data-app-version style="display:none">${APP_VERSION}</span></div>
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
    if (isInspectorRole()) {
      return [
        { id: "home", label: "Today", ico: "🏠" },
        { id: "jobs", label: "Jobs", ico: "📋" },
      ];
    }
    if (isCleanerRole()) {
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
    const roleLabel = session.role === "staff" ? "cleaner" : session.role;
    return `<header class="topbar">${back}<h2>${esc(title)}</h2><span class="chip">${esc(
      roleLabel
    )}</span><button type="button" class="btn btn-ghost btn-sm" data-action="logout" style="width:auto;padding:6px 12px">Out</button></header>`;
  }

  function renderLogin() {
    return `
      <div class="login">
        <div class="login-brand">
          <div class="login-logo">C</div>
          <div>
            <h1>Clenova Staff</h1>
            <p class="sub">Inspect · Clean · Photos · Portal</p>
          </div>
        </div>
        <div class="login-card">
          <label>Role</label>
          <div class="role-grid role-grid-5" id="roles">
            <button type="button" class="role-btn active" data-role="admin"><span>👔</span>Admin</button>
            <button type="button" class="role-btn" data-role="inspector"><span>📸</span>Inspector</button>
            <button type="button" class="role-btn" data-role="cleaner"><span>🧹</span>Cleaner</button>
            <button type="button" class="role-btn" data-role="client"><span>🏠</span>Client</button>
            <button type="button" class="role-btn" data-role="staff"><span>👷</span>Staff</button>
          </div>
          <label for="pin">PIN</label>
          <input id="pin" class="pin-input" type="password" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••" />
          <p class="err" id="login-err"></p>
          <button type="button" class="btn" id="login-btn" style="margin-top:14px">Sign in</button>
          <p class="hint">Demo PINs — Admin <b>1234</b> · Staff <b>2222</b> · Client <b>3333</b> · Inspector <b>4444</b> · Cleaner <b>5555</b>. Data stays on this device.</p>
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
    const jobs = visibleJobs()
      .slice()
      .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));
    const todayStr = todayBrisbane();
    const today = jobs.filter(
      (j) => brisbaneDate(j.scheduledStart) === todayStr || j.status === "in_progress" || j.status === "inspected"
    );
    const done = jobs.filter((j) => j.status === "completed").length;
    const open = jobs.filter((j) => j.status !== "completed").length;
    const inProg = jobs.filter((j) => j.status === "in_progress" || j.status === "inspected").length;

    let greeting = `Hi ${esc(session.name)}`;
    if (session.role === "client") greeting = `${esc(session.name)} portal`;

    let tip = "";
    if (isInspectorRole()) {
      tip = `<div class="section-title">Quick tip</div><div class="card meta">Open a job → set property type → take every required room photo → set agreed tasks → <b>Submit inspection</b>.</div>`;
    } else if (isCleanerRole()) {
      tip = `<div class="section-title">Quick tip</div><div class="card meta">Open a job → review inspector photos → <b>Check in</b> → take matching arrival photos → tick tasks → take completion photos → <b>Mark complete</b>.</div>`;
    } else if (session.role === "client") {
      tip = `<div class="card meta">You can view completed cleans, photos and the completion record for your sites.</div>`;
    } else {
      tip = `<div class="section-title">Quick tip</div><div class="card meta">Admin creates bookings. Inspector assesses + photos. Cleaner matches arrival/completion photos and ticks tasks before finishing.</div>`;
    }

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
      ${tip}
    `;
  }

  function jobCard(j) {
    const c = clientOf(j);
    const insp = j.inspection.status === "done" ? " · inspected" : "";
    return `
      <div class="card tap" data-open-job="${j.id}">
        <div class="card-h">
          <strong>${esc(j.title)}</strong>
          ${statusTag(j.status)}
        </div>
        <div class="meta">${esc(c.name)} · ${esc(c.suburb || "")} · ${esc(propertyLabel(j.propertyType))}${insp}<br/>${fmtTime(j.scheduledStart)}${
      j.checkIn ? ` · in ${fmtShort(j.checkIn.at)}` : ""
    }${j.checkOut ? ` → out ${fmtShort(j.checkOut.at)}` : ""}</div>
      </div>`;
  }

  function renderJobs() {
    const jobs = visibleJobs()
      .slice()
      .sort((a, b) => b.scheduledStart.localeCompare(a.scheduledStart));
    return `
      ${session.role === "admin" ? `<button type="button" class="btn" data-action="newjob" style="margin-bottom:12px">+ New job</button>` : ""}
      ${jobs.length ? jobs.map(jobCard).join("") : `<div class="empty">No jobs yet.</div>`}
    `;
  }

  function renderPhotoThumb(photoKey, slotId) {
    return `<div class="photo-thumb" data-load-photo="${esc(photoKey || "")}" data-thumb-id="${esc(slotId)}"></div>`;
  }

  function renderJobDetail(jobId) {
    const j = data.jobs.find((x) => x.id === jobId);
    if (!j) return `<div class="empty">Job not found.</div>`;
    const c = clientOf(j);
    const s = staffOf(j);
    const insp = inspectorOf(j);
    const clientView = session.role === "client";
    const adminView = session.role === "admin";
    const inspectorEdit = isInspectorRole() && j.status !== "completed";
    const cleanerEdit = isCleanerRole() && j.status !== "completed";

    let blocks = "";

    // Banner
    blocks += `
      <div class="detail-banner">
        <h3>${esc(j.title)}</h3>
        <div class="meta">${statusTag(j.status)} · ${esc(j.service)}</div>
        <div class="kv" style="margin-top:10px">
          <dt>Client</dt><dd>${esc(c.name)}<br/><span class="meta">${esc(c.address)}</span></dd>
          <dt>Property</dt><dd>${esc(propertyLabel(j.propertyType))}</dd>
          <dt>Inspector</dt><dd>${esc(insp.name)}</dd>
          <dt>Cleaner</dt><dd>${esc(s.name)}</dd>
          <dt>Window</dt><dd>${esc(fmtTime(j.scheduledStart))} – ${esc(fmtShort(j.scheduledEnd))}</dd>
          <dt>Notes</dt><dd>${esc(j.notes || "—")}</dd>
        </div>
      </div>`;

    if (missingBanner && missingBanner.length) {
      blocks += `<div class="missing-banner" id="missing-banner" role="alert"><strong>Cannot complete — missing:</strong><ul>${missingBanner
        .map((m) => `<li>${esc(m)}</li>`)
        .join("")}</ul></div>`;
    }

    // Inspector section
    if (inspectorEdit || adminView || clientView || j.inspection.status === "done" || cleanerEdit) {
      blocks += renderInspectionSection(j, { inspectorEdit, adminView, clientView });
    }

    // Cleaner section
    if (cleanerEdit || adminView || clientView || j.status === "completed") {
      blocks += renderCleanerSection(j, { cleanerEdit, adminView, clientView });
    }

    // Completion record
    if (j.completionRecord) {
      const r = j.completionRecord;
      blocks += `
        <div class="section-title">Completion record</div>
        <div class="card">
          <div class="kv">
            <dt>Completed</dt><dd>${esc(fmtTime(r.at))}</dd>
            <dt>By</dt><dd>${esc(r.byName || r.by)}</dd>
            <dt>Tasks done</dt><dd>${(r.tasksDone || []).map(esc).join("; ") || "—"}</dd>
            <dt>Photos</dt><dd>Inspector ${r.inspectorPhotoCount || 0} · Arrival ${r.arrivalPhotoCount || 0} · Completion ${r.completionPhotoCount || 0}</dd>
          </div>
        </div>`;
    }

    return blocks;
  }

  function renderInspectionSection(j, opts) {
    const { inspectorEdit } = opts;
    const gaps = inspectorPhotoGaps(j);
    const canEditType = inspectorEdit && j.inspection.status !== "done";

    let html = `<div class="section-title">Inspection</div><div class="card">`;
    html += `<div class="meta" style="margin-bottom:10px">Status: ${
      j.inspection.status === "done"
        ? '<span class="tag pass">Submitted</span>'
        : '<span class="tag sched">Pending</span>'
    }${j.inspection.at ? " · " + esc(fmtTime(j.inspection.at)) : ""}${
      j.inspection.byName ? " · " + esc(j.inspection.byName) : ""
    }</div>`;

    if (canEditType) {
      html += `
        <div class="field">
          <label>Property type</label>
          <select id="property-type">${Object.entries(PROPERTY_TYPES)
            .map(
              ([k, v]) =>
                `<option value="${k}" ${j.propertyType === k ? "selected" : ""}>${esc(v.label)}</option>`
            )
            .join("")}</select>
        </div>`;
      if (j.propertyType === "other") {
        html += `
          <div class="field">
            <label>Custom photo areas (one per line)</label>
            <textarea id="custom-rooms" rows="4" placeholder="e.g. Dining hall&#10;Corridor A">${esc(
              (j.customRooms || []).join("\n")
            )}</textarea>
            <button type="button" class="btn btn-ghost btn-sm" data-action="apply-rooms" style="margin-top:8px">Apply areas</button>
          </div>`;
      }
    } else {
      html += `<div class="meta" style="margin-bottom:8px">Property: <b>${esc(propertyLabel(j.propertyType))}</b></div>`;
    }

    html += `<div class="photo-list" id="insp-photos">`;
    for (const p of j.inspection.photos) {
      const has = !!p.photoKey;
      html += `
        <div class="photo-row ${has ? "has" : ""}" data-insp-slot="${esc(p.id)}">
          <div class="photo-row-main">
            ${has ? renderPhotoThumb(p.photoKey, "insp-" + p.id) : `<div class="photo-placeholder">📷</div>`}
            <div>
              <div class="photo-label">${esc(p.label)}${p.required ? ' <span class="req">*</span>' : " (extra)"}</div>
              <div class="meta">${has ? "Captured" : "Required — not yet taken"}</div>
            </div>
          </div>
          ${
            inspectorEdit && j.inspection.status !== "done"
              ? `<label class="btn btn-sm btn-ghost photo-btn">Take
                  <input type="file" accept="image/*" capture="environment" data-insp-photo="${esc(p.id)}" />
                </label>`
              : ""
          }
        </div>`;
    }
    html += `</div>`;

    if (inspectorEdit && j.inspection.status !== "done") {
      html += `
        <div class="btn-row" style="margin-top:12px">
          <button type="button" class="btn btn-ghost" data-action="add-extra-photo">+ Extra photo</button>
        </div>
        <div class="section-title" style="margin-top:16px">Agreed tasks</div>
        <div id="task-editor">
          ${(j.tasks || [])
            .map(
              (t, idx) => `
            <div class="task-edit-row" data-task-idx="${idx}">
              <input type="text" value="${esc(t.label)}" data-task-label="${idx}" />
              <button type="button" class="btn btn-ghost btn-sm" data-remove-task="${idx}">✕</button>
            </div>`
            )
            .join("")}
          <button type="button" class="btn btn-ghost btn-sm" data-action="add-task" style="margin-top:8px">+ Add task</button>
        </div>
        ${
          gaps.length
            ? `<p class="err" style="margin-top:12px">${gaps.length} required photo(s) still missing.</p>`
            : ""
        }
        <button type="button" class="btn btn-ok" data-action="submit-inspection" style="margin-top:12px" ${
          gaps.length ? "disabled" : ""
        }>Submit inspection</button>`;
    }

    html += `</div>`;
    return html;
  }

  function renderCleanerSection(j, opts) {
    const { cleanerEdit } = opts;
    const inspected = j.inspection.status === "done";

    let html = `<div class="section-title">Cleaner job</div>`;

    // Attendance
    html += `
      <div class="card">
        <div class="kv">
          <dt>Check-in</dt><dd>${
            j.checkIn
              ? esc(fmtTime(j.checkIn.at)) +
                (j.checkIn.lat != null
                  ? ` <span class="meta">(${j.checkIn.lat}, ${j.checkIn.lng} ±${j.checkIn.accuracy || "?"}m)</span>`
                  : " <span class='meta'>(no GPS)</span>")
              : "—"
          }</dd>
          <dt>Check-out</dt><dd>${j.checkOut ? esc(fmtTime(j.checkOut.at)) : "—"}</dd>
          <dt>Hours</dt><dd>${
            j.checkIn && j.checkOut ? hoursBetween(j.checkIn.at, j.checkOut.at).toFixed(2) + " h" : "—"
          }</dd>
        </div>
        ${
          cleanerEdit
            ? `<div class="btn-row" style="margin-top:10px">
                ${!j.checkIn ? `<button type="button" class="btn btn-ok" data-action="checkin" ${!inspected ? "disabled title=\"Wait for inspection\"" : ""}>Check in</button>` : ""}
                ${j.checkIn && !j.checkOut ? `<button type="button" class="btn btn-warn" data-action="try-complete">Mark complete</button>` : ""}
              </div>`
            : ""
        }
        ${!inspected && cleanerEdit ? `<p class="err" style="margin-top:8px">Inspection must be submitted before you can start.</p>` : ""}
      </div>`;

    if (!inspected) {
      html += `<div class="card meta">Waiting for inspector photos and agreed tasks.</div>`;
      return html;
    }

    // Inspector reference + arrival / completion matching
    html += `<div class="section-title">Match inspector photos</div>`;
    html += `<div class="photo-list">`;
    for (const p of j.inspection.photos) {
      if (!p.photoKey) continue;
      const arrKey = j.cleanerWork.arrivalPhotos[p.id];
      const compKey = j.cleanerWork.completionPhotos[p.id];
      html += `
        <div class="photo-match-card">
          <div class="photo-label">${esc(p.label)}</div>
          <div class="photo-match-grid">
            <div class="match-col">
              <div class="meta">Inspector</div>
              ${renderPhotoThumb(p.photoKey, "ref-" + p.id)}
            </div>
            <div class="match-col">
              <div class="meta">Arrival ${arrKey ? "✓" : "✗"}</div>
              ${arrKey ? renderPhotoThumb(arrKey, "arr-" + p.id) : `<div class="photo-placeholder sm">?</div>`}
              ${
                cleanerEdit
                  ? `<label class="btn btn-sm btn-ghost photo-btn">Take<input type="file" accept="image/*" capture="environment" data-arrival-photo="${esc(
                      p.id
                    )}" /></label>`
                  : ""
              }
            </div>
            <div class="match-col">
              <div class="meta">Done ${compKey ? "✓" : "✗"}</div>
              ${compKey ? renderPhotoThumb(compKey, "comp-" + p.id) : `<div class="photo-placeholder sm">?</div>`}
              ${
                cleanerEdit
                  ? `<label class="btn btn-sm btn-ghost photo-btn">Take<input type="file" accept="image/*" capture="environment" data-completion-photo="${esc(
                      p.id
                    )}" /></label>`
                  : ""
              }
            </div>
          </div>
        </div>`;
    }
    html += `</div>`;

    // Tasks checklist
    html += `
      <div class="section-title">Task checklist</div>
      <div class="card">
        ${(j.tasks || [])
          .map((t, idx) => {
            return `
            <label class="task-check" data-task-idx="${idx}">
              <input type="checkbox" data-toggle-task="${idx}" ${t.done ? "checked" : ""} ${
              cleanerEdit ? "" : "disabled"
            } />
              <span>${esc(t.label)}</span>
              ${t.doneAt ? `<span class="meta"> · ${esc(fmtShort(t.doneAt))}</span>` : ""}
            </label>`;
          })
          .join("")}
        <div class="meta" style="margin-top:8px">
          ${
            taskGaps(j).length === 0
              ? '<span class="tag pass">All tasks done</span>'
              : `${taskGaps(j).length} remaining`
          }
        </div>
      </div>`;

    return html;
  }

  function renderTimesheet() {
    const byStaff = {};
    for (const j of data.jobs.filter((x) => x.checkIn && x.checkOut)) {
      if (isCleanerRole() && j.staffId !== (session.staffId || "s1")) continue;
      if (session.role === "client" && j.clientId !== (session.clientId || "c1")) continue;
      const s = staffOf(j);
      byStaff[s.name] = byStaff[s.name] || [];
      byStaff[s.name].push(j);
    }
    const names = Object.keys(byStaff);
    if (!names.length)
      return `<div class="empty">No completed shifts yet. Check in and complete a job to log hours.</div>`;

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
                return `<div class="ts-row"><div><strong>${esc(j.title)}</strong><div class="meta">${esc(
                  c.name
                )} · ${esc(fmtTime(j.checkIn.at))}</div></div><div class="hrs">${h.toFixed(2)} h</div></div>`;
              })
              .join("")}
            <div class="ts-total"><span>Total</span><span class="hrs">${total.toFixed(2)} h</span></div>
          </div>`;
      })
      .join("");
  }

  function renderAdmin() {
    const inspectors = data.staff.filter((s) => s.role === "inspector");
    const cleaners = data.staff.filter((s) => s.role === "cleaner" || s.role === "staff");
    return `
      <div class="section-title">Overview</div>
      <div class="stat-grid">
        <div class="stat"><div class="n">${data.jobs.length}</div><div class="l">Jobs</div></div>
        <div class="stat"><div class="n">${data.staff.length}</div><div class="l">Staff</div></div>
        <div class="stat"><div class="n">${data.clients.length}</div><div class="l">Clients</div></div>
      </div>
      <div class="section-title">Inspectors</div>
      ${inspectors.map((s) => `<div class="card"><strong>${esc(s.name)}</strong><div class="meta">${esc(s.phone)}</div></div>`).join("") || '<div class="empty">None</div>'}
      <div class="section-title">Cleaners</div>
      ${cleaners.map((s) => `<div class="card"><strong>${esc(s.name)}</strong><div class="meta">${esc(s.phone)}</div></div>`).join("")}
      <div class="section-title">Clients</div>
      ${data.clients.map((c) => `<div class="card"><strong>${esc(c.name)}</strong><div class="meta">${esc(c.address)}</div></div>`).join("")}
      <div class="section-title">Actions</div>
      <div class="btn-row">
        <button type="button" class="btn" data-action="newjob">+ New job</button>
        <button type="button" class="btn btn-ghost" data-action="reset">Reset demo data</button>
      </div>
      <p class="hint" style="margin-top:14px">PINs: Admin 1234 · Staff 2222 · Client 3333 · Inspector 4444 · Cleaner 5555</p>
    `;
  }

  function renderNewJob() {
    const cleaners = data.staff.filter((s) => s.role === "cleaner" || s.role === "staff");
    const inspectors = data.staff.filter((s) => s.role === "inspector");
    return `
      <form id="new-job-form">
        <div class="field"><label>Title</label><input name="title" required placeholder="e.g. End-of-lease clean" /></div>
        <div class="field"><label>Service</label><input name="service" value="General clean" /></div>
        <div class="field"><label>Property type</label>
          <select name="propertyType">${Object.entries(PROPERTY_TYPES)
            .map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`)
            .join("")}</select>
        </div>
        <div class="field" id="custom-rooms-field" style="display:none">
          <label>Custom photo areas (one per line)</label>
          <textarea name="customRooms" rows="3" placeholder="Area 1&#10;Area 2"></textarea>
        </div>
        <div class="field"><label>Client</label>
          <select name="clientId">${data.clients.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
        </div>
        <div class="field"><label>Inspector</label>
          <select name="inspectorId">${(inspectors.length ? inspectors : data.staff)
            .map((s) => `<option value="${s.id}">${esc(s.name)}</option>`)
            .join("")}</select>
        </div>
        <div class="field"><label>Cleaner</label>
          <select name="staffId">${(cleaners.length ? cleaners : data.staff)
            .map((s) => `<option value="${s.id}">${esc(s.name)}</option>`)
            .join("")}</select>
        </div>
        <div class="field"><label>Start</label><input name="start" type="datetime-local" required /></div>
        <div class="field"><label>End</label><input name="end" type="datetime-local" required /></div>
        <div class="field"><label>Agreed tasks (one per line)</label>
          <textarea name="tasks" rows="5">${esc(DEFAULT_TASKS.map((t) => t.label).join("\n"))}</textarea>
        </div>
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
      else if (role === "inspector") {
        const insp = data.staff.find((s) => s.role === "inspector") || data.staff[0];
        setSession({ role: "inspector", name: insp.name, staffId: insp.id, clientId: null });
      } else if (role === "cleaner" || role === "staff") {
        const cl = data.staff.find((s) => s.role === "cleaner" || s.role === "staff") || data.staff[0];
        setSession({
          role: role === "staff" ? "staff" : "cleaner",
          name: cl.name,
          staffId: cl.id,
          clientId: null,
        });
      } else setSession({ role: "client", name: data.clients[0].name, staffId: null, clientId: "c1" });
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
        missingBanner = null;
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
        } else if (a === "try-complete") {
          await tryComplete();
        } else if (a === "submit-inspection") {
          submitInspection();
        } else if (a === "add-extra-photo") {
          addExtraPhotoSlot();
        } else if (a === "add-task") {
          addTask();
        } else if (a === "apply-rooms") {
          applyCustomRooms();
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
      loadAllThumbs();
      const j = data.jobs.find((x) => x.id === view.jobId);

      const typeSel = $("#property-type");
      if (typeSel) {
        typeSel.addEventListener("change", () => {
          j.propertyType = typeSel.value;
          if (j.propertyType !== "other") {
            j.customRooms = [];
            j.inspection.photos = makeInspectionPhotos(j.propertyType, []);
          } else {
            j.inspection.photos = makeInspectionPhotos("other", j.customRooms);
          }
          save(data);
          render();
        });
      }

      root.querySelectorAll("[data-insp-photo]").forEach((inp) => {
        inp.addEventListener("change", async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const slotId = inp.dataset.inspPhoto;
          try {
            const blob = await compressImage(file);
            const key = `${view.jobId}:insp:${slotId}`;
            await putPhoto(key, blob);
            const slot = j.inspection.photos.find((p) => p.id === slotId);
            if (slot) slot.photoKey = key;
            save(data);
            toast("Inspector photo saved");
            render();
          } catch (err) {
            toast("Photo failed: " + (err.message || err));
          }
        });
      });

      root.querySelectorAll("[data-arrival-photo]").forEach((inp) => {
        inp.addEventListener("change", async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const slotId = inp.dataset.arrivalPhoto;
          try {
            const blob = await compressImage(file);
            const key = `${view.jobId}:arr:${slotId}`;
            await putPhoto(key, blob);
            j.cleanerWork.arrivalPhotos[slotId] = key;
            save(data);
            toast("Arrival photo saved");
            render();
          } catch (err) {
            toast("Photo failed");
          }
        });
      });

      root.querySelectorAll("[data-completion-photo]").forEach((inp) => {
        inp.addEventListener("change", async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const slotId = inp.dataset.completionPhoto;
          try {
            const blob = await compressImage(file);
            const key = `${view.jobId}:comp:${slotId}`;
            await putPhoto(key, blob);
            j.cleanerWork.completionPhotos[slotId] = key;
            save(data);
            toast("Completion photo saved");
            render();
          } catch (err) {
            toast("Photo failed");
          }
        });
      });

      root.querySelectorAll("[data-toggle-task]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const idx = +cb.dataset.toggleTask;
          j.tasks[idx].done = cb.checked;
          j.tasks[idx].doneAt = cb.checked ? new Date().toISOString() : null;
          save(data);
          render();
        });
      });

      root.querySelectorAll("[data-task-label]").forEach((inp) => {
        inp.addEventListener("change", () => {
          const idx = +inp.dataset.taskLabel;
          j.tasks[idx].label = inp.value.trim() || j.tasks[idx].label;
          save(data);
        });
      });

      root.querySelectorAll("[data-remove-task]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = +btn.dataset.removeTask;
          j.tasks.splice(idx, 1);
          save(data);
          render();
        });
      });
    }

    if (view.name === "newjob") {
      const form = $("#new-job-form");
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

      const pt = form.propertyType;
      const customField = $("#custom-rooms-field");
      const syncCustom = () => {
        customField.style.display = pt.value === "other" ? "block" : "none";
      };
      pt.addEventListener("change", syncCustom);
      syncCustom();

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const propertyType = fd.get("propertyType");
        const customRooms = String(fd.get("customRooms") || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        const taskLabels = String(fd.get("tasks") || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        const tasks = taskLabels.map((label, i) => ({
          id: "t" + i,
          label,
          done: false,
          doneAt: null,
        }));
        const job = normalizeJob({
          id: uid("j"),
          clientId: fd.get("clientId"),
          staffId: fd.get("staffId"),
          inspectorId: fd.get("inspectorId"),
          title: fd.get("title"),
          service: fd.get("service") || "General clean",
          propertyType,
          customRooms,
          scheduledStart: new Date(fd.get("start")).toISOString(),
          scheduledEnd: new Date(fd.get("end")).toISOString(),
          status: "scheduled",
          checkIn: null,
          checkOut: null,
          notes: fd.get("notes") || "",
          tasks,
        });
        data.jobs.push(job);
        save(data);
        toast("Job created");
        view = { name: "job", jobId: job.id };
        render();
      });
    }
  }

  async function loadAllThumbs() {
    const nodes = root.querySelectorAll("[data-load-photo]");
    for (const el of nodes) {
      const key = el.dataset.loadPhoto;
      if (!key) continue;
      const blob = await getPhoto(key);
      if (!blob) continue;
      const url = URL.createObjectURL(blob);
      el.innerHTML = `<img alt="" src="${url}" />`;
      el.classList.add("has");
    }
  }

  function applyCustomRooms() {
    const j = data.jobs.find((x) => x.id === view.jobId);
    const ta = $("#custom-rooms");
    if (!j || !ta) return;
    j.customRooms = ta.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    // Keep existing photos that still match labels; rebuild slots
    const oldByLabel = {};
    for (const p of j.inspection.photos) {
      if (p.photoKey) oldByLabel[p.label] = p.photoKey;
    }
    j.inspection.photos = makeInspectionPhotos("other", j.customRooms).map((p) => ({
      ...p,
      photoKey: oldByLabel[p.label] || null,
    }));
    save(data);
    toast("Areas updated");
    render();
  }

  function addExtraPhotoSlot() {
    const j = data.jobs.find((x) => x.id === view.jobId);
    if (!j) return;
    const n = j.inspection.photos.filter((p) => !p.required).length + 1;
    j.inspection.photos.push({
      id: "extra-" + uid(""),
      label: "Extra " + n,
      required: false,
      photoKey: null,
    });
    save(data);
    render();
  }

  function addTask() {
    const j = data.jobs.find((x) => x.id === view.jobId);
    if (!j) return;
    j.tasks.push({ id: uid("t"), label: "New task", done: false, doneAt: null });
    save(data);
    render();
  }

  function submitInspection() {
    const j = data.jobs.find((x) => x.id === view.jobId);
    if (!j) return;
    // Persist any task label edits from inputs
    root.querySelectorAll("[data-task-label]").forEach((inp) => {
      const idx = +inp.dataset.taskLabel;
      if (j.tasks[idx]) j.tasks[idx].label = inp.value.trim() || j.tasks[idx].label;
    });
    const gaps = inspectorPhotoGaps(j);
    if (gaps.length) {
      missingBanner = gaps.map((p) => "Inspector photo: " + p.label);
      toast("Fill all required photos first");
      render();
      return;
    }
    if (!j.tasks.length) {
      toast("Add at least one agreed task");
      return;
    }
    j.inspection.status = "done";
    j.inspection.at = new Date().toISOString();
    j.inspection.by = session.staffId;
    j.inspection.byName = session.name;
    if (j.status === "scheduled") j.status = "inspected";
    save(data);
    toast("Inspection submitted");
    render();
  }

  async function doCheckIn() {
    const j = data.jobs.find((x) => x.id === view.jobId);
    if (!j || j.checkIn) return;
    if (j.inspection.status !== "done") {
      toast("Wait for inspection first");
      return;
    }
    toast("Getting location…");
    const geo = await getGeo();
    j.checkIn = { at: new Date().toISOString(), ...(geo || {}) };
    j.status = "in_progress";
    save(data);
    toast(geo ? "Checked in with GPS" : "Checked in (no GPS)");
    render();
  }

  async function tryComplete() {
    const j = data.jobs.find((x) => x.id === view.jobId);
    if (!j || !j.checkIn) {
      toast("Check in first");
      return;
    }
    const missing = completionBlockers(j);
    if (missing.length) {
      missingBanner = missing;
      toast("Cannot complete — see missing list");
      render();
      const el = $("#missing-banner");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    toast("Getting location…");
    const geo = await getGeo();
    j.checkOut = { at: new Date().toISOString(), ...(geo || {}) };
    j.status = "completed";
    j.completionRecord = {
      at: j.checkOut.at,
      by: session.staffId,
      byName: session.name,
      tasksDone: j.tasks.filter((t) => t.done).map((t) => t.label),
      arrivalPhotoCount: Object.keys(j.cleanerWork.arrivalPhotos).length,
      completionPhotoCount: Object.keys(j.cleanerWork.completionPhotos).length,
      inspectorPhotoCount: j.inspection.photos.filter((p) => p.photoKey).length,
    };
    save(data);
    missingBanner = null;
    toast("Job completed");
    render();
  }

  // boot
  openPhotoDB().catch(() => {});
  render();
})();
