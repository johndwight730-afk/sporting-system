(function () {
  "use strict";

  const ROLE_ADMIN = "Master Admin";
  const state = {
    token: localStorage.getItem("fieldhouse.token") || "",
    user: JSON.parse(localStorage.getItem("fieldhouse.user") || "null"),
    theme: localStorage.getItem("fieldhouse.theme") === "dark" ? "dark" : "light",
    navOpen: !window.matchMedia("(max-width: 720px)").matches,
    data: {},
    page: "home"
  };
  const systemAccess = { ready: false, closed: false, checking: false, unavailable: false };
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  let deferredInstallPrompt = null;
  let appInstalled = window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    navigator.standalone === true ||
    localStorage.getItem("fieldhouse.pwaInstalled") === "true";
  function updateInstallUi() {
    appInstalled = appInstalled ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      navigator.standalone === true;
    const showInstall = !appInstalled;
    ["#authInstallButton","#dashboardInstallButton"].forEach(selector => {
      const button = $(selector);
      if (button) button.hidden = !showInstall;
    });
    const banner = $("#installPromptBanner");
    const canShowBanner = showInstall && systemAccess.ready && !systemAccess.closed &&
      !localStorage.getItem("fieldhouse.pwaPromptDismissed");
    if (banner) banner.hidden = !canShowBanner;
    if (appInstalled) localStorage.setItem("fieldhouse.pwaInstalled","true");
  }
  function openInstallInstructions() {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const instructions = isIos
      ? "<p>In Safari, tap <strong>Share</strong>, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</p>"
      : isAndroid
        ? "<p>In Chrome, open the browser menu (⋮) and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>"
        : "<p>Open your browser menu and choose <strong>Install app</strong> or <strong>Install this site as an app</strong>. Chrome and Edge may also show an install icon beside the address bar.</p>";
    modal("Install Amazing Grace Digital",`<div class="install-instructions">${instructions}<p>The system must be served from HTTPS or localhost. It cannot be installed when opened directly as a file.</p></div>`);
    $("#modalRoot .modal").classList.add("install-help-modal");
  }
  async function installApp() {
    if (!deferredInstallPrompt) {
      openInstallInstructions();
      return;
    }
    const installPrompt = deferredInstallPrompt;
    deferredInstallPrompt = null;
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") {
        appInstalled = true;
        localStorage.setItem("fieldhouse.pwaInstalled","true");
      }
      updateInstallUi();
    } catch (error) {
      console.error("The app install prompt could not be opened.",error);
      toast("The app could not be installed from this browser. Use its menu to add the system to your device.",true);
    }
  }
  window.addEventListener("beforeinstallprompt",event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    appInstalled = false;
    localStorage.removeItem("fieldhouse.pwaInstalled");
    updateInstallUi();
  });
  window.addEventListener("appinstalled",() => {
    appInstalled = true;
    localStorage.setItem("fieldhouse.pwaInstalled","true");
    deferredInstallPrompt = null;
    updateInstallUi();
  });
  updateInstallUi();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.error("Offline app files could not be cached.", error);
      setTimeout(()=>toast("Offline support could not be enabled. Check the local app files and reload.",true),0);
    });
  }
  const navToggleButton = $("#navToggleButton");
  const navBackdrop = $("#navBackdrop");
  function setNavigationOpen(isOpen) {
    state.navOpen = isOpen;
    $("#dashboardView").classList.toggle("nav-open", isOpen);
    navBackdrop.hidden = !(isOpen && window.matchMedia("(max-width: 720px)").matches);
    navToggleButton.textContent = isOpen ? "×" : "☰";
    navToggleButton.setAttribute("aria-expanded", String(isOpen));
    navToggleButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    navToggleButton.title = isOpen ? "Close navigation" : "Open navigation";
  }
  setNavigationOpen(state.navOpen);
  navToggleButton.addEventListener("click", () => setNavigationOpen(!state.navOpen));
  navBackdrop.addEventListener("click", () => setNavigationOpen(false));
  let mobileNavigation = window.matchMedia("(max-width: 720px)").matches;
  window.addEventListener("resize", () => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    if (isMobile !== mobileNavigation) {
      mobileNavigation = isMobile;
      setNavigationOpen(!isMobile);
    }
  });
  const themeToggleButton = $("#themeToggleButton");
  function applyTheme() {
    const isLight = state.theme === "light";
    document.body.classList.toggle("light-theme", isLight);
    themeToggleButton.textContent = isLight ? "☾" : "☼";
    themeToggleButton.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    themeToggleButton.title = isLight ? "Switch to dark theme" : "Switch to light theme";
    themeToggleButton.setAttribute("aria-pressed", String(isLight));
  }
  applyTheme();
  themeToggleButton.addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("fieldhouse.theme", state.theme);
    applyTheme();
  });
  const backgroundSlides = $$(".background-slideshow img");
  if (backgroundSlides.length > 1) {
    let activeSlide = 0;
    setInterval(() => {
      backgroundSlides[activeSlide].classList.remove("active");
      activeSlide = (activeSlide + 1) % backgroundSlides.length;
      backgroundSlides[activeSlide].classList.add("active");
    }, 5000);
  }
  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const id = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const dateLabel = value => value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
  const ordinal = value => {
    const number = Number(value), mod100 = number % 100;
    return number + (mod100 >= 11 && mod100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[number % 10] || "th"));
  };
  const colors = ["#6e9a72", "#d59e54", "#8090b4", "#b57578", "#6ea5a0", "#987ab0", "#a9a14d", "#d47a52", "#688fbd", "#8d9d65"];
  const certificateTemplates = [
    {label:"Navy & Gold Champion",family:"geometric",design:1,primary:"#10354a",accent:"#f0b429"},
    {label:"Amber & Charcoal",family:"modern",design:2,primary:"#303337",accent:"#ed8b00"},
    {label:"Institutional Blue",family:"heritage",design:3,primary:"#315f91",accent:"#a8c6df"},
    {label:"Athletics Blue",family:"modern",design:4,primary:"#174c86",accent:"#e2bd59"},
    {label:"Royal Championship",family:"classic",design:5,primary:"#063b73",accent:"#f1c51b"},
    {label:"Emerald & Gold",family:"geometric",design:6,primary:"#176653",accent:"#d3a62d"},
    {label:"Parchment Heritage",family:"heritage",design:7,primary:"#927342",accent:"#d8be82"},
    {label:"Red Victory",family:"modern",design:8,primary:"#152852",accent:"#e93632"},
    {label:"Midnight Sports",family:"geometric",design:9,primary:"#101e49",accent:"#88bd3d"},
    {label:"Cobalt Motion",family:"geometric",design:10,primary:"#1768b5",accent:"#27b9db"},
    {label:"Crimson Champion",family:"geometric",design:11,primary:"#6e2034",accent:"#d7ad4a"},
    {label:"Pine & Brass",family:"heritage",design:12,primary:"#1f5a46",accent:"#d6ba62"},
    {label:"Purple Crest",family:"classic",design:13,primary:"#513c78",accent:"#d7bf8a"},
    {label:"Ocean Blue",family:"modern",design:14,primary:"#1c5d83",accent:"#48a8c4"},
    {label:"Burgundy Laurel",family:"classic",design:15,primary:"#762e3e",accent:"#d9af55"},
    {label:"Copper Motion",family:"modern",design:16,primary:"#75422f",accent:"#e3a15b"},
    {label:"Teal & Gold",family:"geometric",design:17,primary:"#146367",accent:"#d3a62d"},
    {label:"Silver Charcoal",family:"heritage",design:18,primary:"#36434e",accent:"#c0c6ce"},
    {label:"Royal Blue & Ivory",family:"classic",design:19,primary:"#223f73",accent:"#d9b540"},
    {label:"Sunrise Victory",family:"geometric",design:20,primary:"#a64b35",accent:"#ebc457"}
  ];
  const namedHouseColors = [
    { pattern: /\b(yellow|gold)\b/i, color: "#f2c511" },
    { pattern: /\bblue\b/i, color: "#218ef2" },
    { pattern: /\borange\b/i, color: "#ff8c00" },
    { pattern: /\b(mauve|purple|violet)\b/i, color: "#b784a7" },
    { pattern: /\bgreen\b/i, color: "#299447" },
    { pattern: /\bred\b/i, color: "#df3b36" },
    { pattern: /\bpink\b/i, color: "#e777a7" },
    { pattern: /\bbrown\b/i, color: "#8b5a2b" },
    { pattern: /\bblack\b/i, color: "#222222" },
    { pattern: /\bwhite\b/i, color: "#e6e6e6" },
    { pattern: /\b(grey|gray)\b/i, color: "#858b92" },
    { pattern: /\b(teal|turquoise)\b/i, color: "#149d99" },
    { pattern: /\bcyan\b/i, color: "#15bed1" }
  ];
  const colorForHouseName = name => {
    const match = namedHouseColors.find(option => option.pattern.test(String(name || "")));
    return match ? match.color : "";
  };
  const houseColor = (house, index) => {
    if (/^#[0-9a-f]{6}$/i.test(String(house && house.color || ""))) return house.color;
    const originalIndex = houses().indexOf(house);
    return colors[(originalIndex >= 0 ? originalIndex : index) % colors.length];
  };
  const houseTextColor = color => {
    const channels = color.slice(1).match(/.{2}/g).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179 ? "#111111" : "#ffffff";
  };
  const houses = () => state.data.houses || [];
  const records = name => state.data[name] || [];
  const schoolSettings = () => state.data.schoolSettings || {};
  const certificateTemplate = value => certificateTemplates[Number(value)-1] || certificateTemplates[0];
  function certificateTemplateId(cert, requestedId) {
    if (requestedId !== undefined && requestedId !== null) return Number(requestedId) || 1;
    const savedId=Number(cert.templateId);
    if (savedId>=1&&savedId<=certificateTemplates.length) return savedId;
    const index=records("certificates").findIndex(item=>String(item.id)===String(cert.id));
    const base=Number(schoolSettings().templateId)||1;
    return ((base-1+Math.max(0,index))%certificateTemplates.length)+1;
  }
  const certificateTemplateOptions = value => certificateTemplates.map((template,index)=>`<option value="${index+1}" ${Number(value)===index+1?"selected":""}>${index+1}. ${escapeHtml(template.label)}</option>`).join("");
  async function certificateTrophyImageData() {
    try {
      const response=await fetch("./certificate-trophy.png");
      if(!response.ok)throw new Error("The certificate trophy image returned HTTP "+response.status+".");
      const blob=await response.blob();
      if(!blob.type.startsWith("image/"))throw new Error("The certificate trophy asset is not an image.");
      return await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(reader.error||new Error("The certificate trophy image could not be read."));
        reader.readAsDataURL(blob);
      });
    } catch(error) {
      console.warn("Using the built-in trophy illustration because the PNG could not be loaded.",error);
      const trophy=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280"><path fill="#bd8726" d="M48 38H192V86C192 140 164 178 120 193 76 178 48 140 48 86Z"/><path fill="#dcae49" d="M48 56H22v25c0 44 26 67 69 70l-3-24c-25-4-40-19-40-47Zm144 0h26v25c0 44-26 67-69 70l3-24c25-4 40-19 40-47Z"/><path fill="#edc85d" d="m120 64 12 25 28 4-20 19 5 28-25-14-25 14 5-28-20-19 28-4z"/><path fill="#a96f1c" d="M105 188h30v42h-30zM72 230h96v23H72zM56 253h128v19H56z"/></svg>`;
      return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(trophy);
    }
  }
  const OFFLINE_DB_NAME = "fieldhouse-offline";
  let offlineDbPromise;
  function openOfflineDb() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("This browser does not support offline storage."));
    if (!offlineDbPromise) {
      offlineDbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(OFFLINE_DB_NAME, 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains("snapshots")) database.createObjectStore("snapshots", {keyPath: "userId"});
          if (!database.objectStoreNames.contains("outbox")) database.createObjectStore("outbox", {keyPath: "id"});
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Offline storage could not be opened."));
      });
    }
    return offlineDbPromise;
  }
  async function offlineRead(storeName, key) {
    const database = await openOfflineDb();
    return new Promise((resolve, reject) => {
      const request = database.transaction(storeName, "readonly").objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Offline data could not be read."));
    });
  }
  async function offlineReadAll(storeName) {
    const database = await openOfflineDb();
    return new Promise((resolve, reject) => {
      const request = database.transaction(storeName, "readonly").objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Offline data could not be read."));
    });
  }
  async function offlineWrite(storeName, value) {
    const database = await openOfflineDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(value);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Offline data could not be saved."));
      transaction.onabort = () => reject(transaction.error || new Error("Offline data could not be saved."));
    });
  }
  async function offlineDelete(storeName, key) {
    const database = await openOfflineDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Offline data could not be removed."));
      transaction.onabort = () => reject(transaction.error || new Error("Offline data could not be removed."));
    });
  }
  const QUEUED_ACTIONS = new Set([
    "setUserStatus","deleteUser","addHouses","updateHouse","deleteHouse","addOptions","deleteOption","clearOptions",
    "addScoreEntry","clearScoreEntries","addCertificates","updateCertificate","deleteCertificate","clearCertificates",
    "saveSchoolSettings","clearSchoolInfo","recordPrintBatch","resetPrintHistory"
  ]);
  let queueSyncInProgress = false;
  function makeCertificateNumber(certificateId, createdAt) {
    const year = new Date(createdAt || Date.now()).getFullYear();
    const suffix = String(certificateId || id()).replace(/[^a-z0-9]/gi,"").slice(-8).toUpperCase().padStart(8,"0");
    return `FH-${year}-${suffix}`;
  }
  function prepareMutationPayload(action, payload) {
    const result = JSON.parse(JSON.stringify(payload || {}));
    const createdAt = new Date().toISOString();
    if (action === "addHouses") {
      result.houses = (result.houses || []).map(house => Object.assign({},house,{id:house.id || id(),createdAt:house.createdAt || createdAt}));
    } else if (action === "addOptions") {
      result.values = (result.values || []).map(value => {
        const item = value && typeof value === "object" ? value : {value:value};
        return Object.assign({},item,{id:item.id || id(),createdAt:item.createdAt || createdAt});
      });
    } else if (action === "addScoreEntry") {
      result.id = result.id || id();
      result.createdAt = result.createdAt || createdAt;
    } else if (action === "addCertificates") {
      const baseTemplate=Number(schoolSettings().templateId)||1;
      const firstStyleIndex=records("certificates").length;
      result.athletes = (result.athletes || []).map((athlete,index) => {
        const item = Object.assign({},athlete,{id:athlete.id || id(),createdAt:athlete.createdAt || createdAt});
        item.certificateNumber = item.certificateNumber || makeCertificateNumber(item.id,item.createdAt);
        item.templateId = item.templateId || ((baseTemplate-1+firstStyleIndex+index)%certificateTemplates.length)+1;
        return item;
      });
    }
    return result;
  }
  async function saveOfflineSnapshot() {
    if (!state.user || !state.user.id) return;
    await offlineWrite("snapshots",{userId:String(state.user.id),data:state.data,updatedAt:new Date().toISOString()});
  }
  async function offlineOperationsForUser() {
    if (!state.user || !state.user.id) return [];
    return (await offlineReadAll("outbox")).filter(item => item.userId === String(state.user.id)).sort((a,b) => a.createdAt.localeCompare(b.createdAt));
  }
  function applyQueuedMutation(action, payload) {
    const list = name => {
      if (!Array.isArray(state.data[name])) state.data[name] = [];
      return state.data[name];
    };
    if (action === "addHouses") {
      list("houses").push(...payload.houses.map(house => Object.assign({},house)));
    } else if (action === "updateHouse") {
      state.data.houses = list("houses").map(house => String(house.id) === String(payload.houseId) ? Object.assign({},house,payload) : house);
    } else if (action === "deleteHouse") {
      state.data.houses = list("houses").filter(house => String(house.id) !== String(payload.houseId));
    } else if (action === "addOptions") {
      const key = payload.kind;
      list(key).push(...payload.values.map(item => Object.assign({},item,{value:String(item.value)})));
    } else if (action === "deleteOption") {
      state.data[payload.kind] = list(payload.kind).filter(item => String(item.id) !== String(payload.itemId));
    } else if (action === "clearOptions") {
      state.data[payload.kind] = [];
    } else if (action === "addScoreEntry") {
      list("scoreEntries").push(Object.assign({},payload,{awards:payload.awards.map(award => ({houseId:award.houseId,points:award.points}))}));
    } else if (action === "clearScoreEntries") {
      state.data.scoreEntries = [];
    } else if (action === "addCertificates") {
      list("certificates").push(...payload.athletes.map(athlete => Object.assign({},athlete,{
        categoryId:payload.categoryId,eventId:payload.eventId
      })));
    } else if (action === "updateCertificate") {
      state.data.certificates = list("certificates").map(cert => String(cert.id) === String(payload.certificateId) ? Object.assign({},cert,payload) : cert);
    } else if (action === "deleteCertificate") {
      state.data.certificates = list("certificates").filter(cert => String(cert.id) !== String(payload.certificateId));
    } else if (action === "clearCertificates") {
      state.data.certificates = [];
      state.data.printHistory = [];
    } else if (action === "saveSchoolSettings") {
      state.data.schoolSettings = Object.assign({},state.data.schoolSettings,payload);
    } else if (action === "clearSchoolInfo") {
      state.data.schoolSettings = Object.assign({},state.data.schoolSettings,{schoolName:"",motto:"",address:"",logo:""});
    } else if (action === "setUserStatus") {
      state.data.users = list("users").map(user => String(user.id) === String(payload.userId) ? Object.assign({},user,{status:payload.status}) : user);
    } else if (action === "deleteUser") {
      state.data.users = list("users").filter(user => String(user.id) !== String(payload.userId));
    } else if (action === "recordPrintBatch") {
      const history = list("printHistory");
      payload.certificateIds.forEach(certificateId => {
        if (!history.some(item => String(item.certificateId) === String(certificateId) && item.printType === payload.printType && String(item.scope) === String(payload.scope))) {
          history.push({id:id(),certificateId:String(certificateId),printType:payload.printType,scope:String(payload.scope),printedAt:new Date().toISOString()});
        }
      });
    } else if (action === "resetPrintHistory") {
      state.data.printHistory = [];
    }
  }
  function updateConnectionStatus(label) {
    const connectionLabel = $("#connectionLabel");
    if (connectionLabel) connectionLabel.textContent = label;
    const dot = $(".live-dot");
    if (dot) dot.classList.toggle("offline",label.toLowerCase().includes("offline"));
  }
  function hasActiveEditor() {
    const active=document.activeElement;
    return $("#modalRoot").children.length>0 || !!(active&&["INPUT","TEXTAREA","SELECT"].includes(active.tagName));
  }
  async function enqueueOfflineMutation(action, payload, mutationId) {
    if (!state.user || !state.user.id) throw new Error("Sign in online once before saving data offline.");
    const operation = {id:mutationId,userId:String(state.user.id),action:action,payload:payload,createdAt:new Date().toISOString()};
    await offlineWrite("outbox",operation);
    applyQueuedMutation(action,payload);
    try {
      await saveOfflineSnapshot();
    } catch (error) {
      console.error("The queued change was saved, but the updated dashboard snapshot could not be cached.",error);
      toast("Change queued, but offline dashboard data could not be refreshed: " + error.message,true);
    }
    updateSchoolIdentity();
    renderPage();
    const pending = await offlineOperationsForUser().catch(error => {
      console.error("The queued change was saved, but pending count could not be read.",error);
      return [];
    });
    updateConnectionStatus(pending.length?`Offline · ${pending.length} saved pending sync`:"Offline · change saved for sync");
    return {ok:true,queued:true};
  }
  async function sendApi(action, payload, mutationId, timeoutMs) {
    const url = String(window.APP_CONFIG && window.APP_CONFIG.apiUrl || "").trim();
    if (!url) throw new Error("Connect the app to Google Sheets by adding your Apps Script URL in config.js.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),timeoutMs || 30000);
    let response;
    try {
      response = await fetch(url,{
        method:"POST",
        headers:{"Content-Type":"text/plain;charset=utf-8"},
        body:JSON.stringify(Object.assign({action:action,token:state.token},payload || {},mutationId?{clientMutationId:mutationId}:{})),
        redirect:"follow",
        signal:controller.signal
      });
      if (!response.ok) throw new Error("The server returned HTTP " + response.status + ".");
      const result = await response.json();
      if (!result.ok) {
        const requestError = new Error(result.error || "The request could not be completed.");
        requestError.systemClosed = result.systemClosed === true;
        requestError.sessionExpired = result.sessionExpired === true;
        if (requestError.systemClosed) showSystemClosed();
        else if (requestError.sessionExpired && state.user) expireActiveSession();
        throw requestError;
      }
      return result;
    } catch (error) {
      if (controller.signal.aborted) {
        const timeoutError = new Error("The server did not respond within 30 seconds. Check your connection and try again.");
        timeoutError.name = "AbortError";
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  const isAdmin = () => state.user && state.user.role === ROLE_ADMIN;
  const canEditPoints = () => !!state.user;

  async function api(action, payload) {
    if (action !== "getSystemStatus" && action !== "unlockSystem" && (!systemAccess.ready || systemAccess.closed)) {
      throw new Error("The system is not currently available.");
    }
    if (action !== "getSystemStatus" && action !== "unlockSystem" && !navigator.onLine) {
      showSystemStatusUnavailable("Connect to the internet to verify that the system is open.");
      throw new Error("The system must be online to verify access.");
    }
    const canQueue = QUEUED_ACTIONS.has(action);
    const mutationId = canQueue ? id() : "";
    const preparedPayload = canQueue ? prepareMutationPayload(action,payload) : payload;
    if (canQueue && !navigator.onLine) return enqueueOfflineMutation(action,preparedPayload,mutationId);
    try {
      return await sendApi(action,preparedPayload,mutationId);
    } catch (error) {
      if (canQueue && (error instanceof TypeError || error.name === "AbortError" || !navigator.onLine)) {
        return enqueueOfflineMutation(action,preparedPayload,mutationId);
      }
      throw error;
    }
  }
  async function flushQueuedMutations() {
    if (queueSyncInProgress || !navigator.onLine || !state.user) return;
    const operations = await offlineOperationsForUser();
    const pending = operations.filter(operation => !operation.failed);
    if (!pending.length) return;
    queueSyncInProgress = true;
    updateConnectionStatus(`Syncing ${pending.length} saved change(s)`);
    try {
      for (const operation of pending) {
        try {
          await sendApi(operation.action,operation.payload,operation.id);
          await offlineDelete("outbox",operation.id);
        } catch (error) {
          if (error.systemClosed) return;
          if (error instanceof TypeError || error.name === "AbortError" || !navigator.onLine) {
            updateConnectionStatus("Offline · saved changes waiting to sync");
            return;
          }
          await offlineDelete("outbox",operation.id);
          toast("An offline change could not be synced: " + error.message,true);
        }
      }
    } finally {
      queueSyncInProgress = false;
    }
  }

  function updateSchoolIdentity() {
    const settings = schoolSettings();
    const logo = settings.logo || "";
    const crumbLogo=$("#schoolCrumbLogo");
    crumbLogo.src = logo;
    crumbLogo.hidden = !logo;
    $("#schoolCrumbName").textContent = settings.schoolName || "Workspace";
  }

  function toast(message, error) {
    const node = $("#toast");
    node.textContent = message;
    node.classList.toggle("error", !!error);
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3300);
  }

  function showButtonProgress(button, label) {
    if (!button) return () => {};
    const originalContent = button.innerHTML;
    const wasDisabled = button.disabled;
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.textContent = label;
    return () => {
      button.innerHTML = originalContent;
      button.disabled = wasDisabled;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
    };
  }

  function updateProfileDisplay() {
    const user = state.user;
    if (!user) return;
    $("#sideName").textContent = user.fullName;
    $("#sideRole").textContent = user.role;
    $("#topProfileName").textContent = user.username || user.fullName;
    $("[data-action='open-profile'].top-profile-button").setAttribute("aria-label", "Open profile for " + (user.username || user.fullName));
    const initial = (user.fullName || user.username || "U").charAt(0).toUpperCase();
    const profileImage = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(user.profileImage || "") ? user.profileImage : "";
    [$("#sideAvatar"), $("#topAvatar")].forEach(avatar => {
      avatar.textContent = profileImage ? "" : initial;
      avatar.style.backgroundImage = profileImage ? `url("${profileImage}")` : "";
    });
  }

  function validateImageUpload(file) {
    if (!file || (file.type && !file.type.startsWith("image/"))) {
      throw new Error("Choose an image file.");
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new Error("Choose an image smaller than 20 MB.");
    }
  }

  function resizeAndCompressImage(file) {
    return new Promise((resolve, reject) => {
      try {
        validateImageUpload(file);
      } catch(error) {
        reject(error);
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("The selected picture could not be read."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("The selected picture could not be opened."));
        image.onload = () => {
          if (!image.width || !image.height || image.width * image.height > 40 * 1024 * 1024) {
            reject(new Error("The image dimensions are too large to process safely."));
            return;
          }
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("This browser cannot process the selected picture."));
            return;
          }
          try {
            for (let maxSize = 256; maxSize >= 64; maxSize -= 32) {
              const scale = Math.min(1, maxSize / image.width, maxSize / image.height);
              canvas.width = Math.max(1, Math.round(image.width * scale));
              canvas.height = Math.max(1, Math.round(image.height * scale));
              context.drawImage(image, 0, 0, canvas.width, canvas.height);
              for (let quality = 0.82; quality >= 0.3; quality -= 0.08) {
                const dataUrl = canvas.toDataURL("image/jpeg", quality);
                if (dataUrl.length <= 40000) {
                  resolve(dataUrl);
                  return;
                }
              }
            }
            reject(new Error("This image could not be compressed to the image-storage limit."));
          } catch(error) {
            reject(new Error("This browser could not process the selected picture."));
          }
        };
        image.src = String(reader.result);
      };
      try {
        reader.readAsDataURL(file);
      } catch(error) {
        reject(new Error("The selected picture could not be read."));
      }
    });
  }

  function setAuthTab(tab) {
    $$(".auth-tab").forEach(button => button.classList.toggle("active", button.dataset.auth === tab));
    $("#loginFormWrap").hidden = tab !== "login";
    $("#registerFormWrap").hidden = tab !== "register";
  }

  function showAuthPage() {
    $("#maintenanceView").hidden = true;
    $("#dashboardView").hidden = true;
    $("#authView").hidden = false;
    setAuthTab("login");
    updateInstallUi();
  }

  function expireActiveSession() {
    state.user = null;
    state.token = "";
    state.data = {};
    localStorage.removeItem("fieldhouse.user");
    localStorage.removeItem("fieldhouse.token");
    showAuthPage();
    toast("Your session ended. Sign in again to continue.",true);
  }

  function showSystemClosed() {
    if (systemAccess.closed && !systemAccess.unavailable && !$("#maintenanceView").hidden) return;
    systemAccess.ready = false;
    systemAccess.closed = true;
    systemAccess.unavailable = false;
    state.user = null;
    state.token = "";
    state.data = {};
    localStorage.removeItem("fieldhouse.user");
    localStorage.removeItem("fieldhouse.token");
    $("#dashboardView").hidden = true;
    $("#authView").hidden = true;
    $("#maintenanceView").hidden = false;
    $("#maintenanceHeadline").textContent = "AMAZING GRACE DIGITAL SPORT MANAGEMENT SYSTEM has been closed for now.";
    $("#maintenanceMessage").textContent = "Only an approved Master Admin can reopen the system. All users must sign in again after it is opened.";
    $("[data-action='show-admin-unlock']").hidden = false;
    $("#masterAdminUnlockForm").hidden = true;
    $("#masterAdminUnlockForm").reset();
    $("#modalRoot").innerHTML = "";
    $("#printStage").innerHTML = "";
    $("#printStage").hidden = true;
    updateInstallUi();
  }

  function showSystemStatusUnavailable(message) {
    systemAccess.ready = false;
    systemAccess.unavailable = true;
    $("#dashboardView").hidden = true;
    $("#authView").hidden = true;
    $("#maintenanceView").hidden = false;
    $("#maintenanceHeadline").textContent = systemAccess.closed
      ? "AMAZING GRACE DIGITAL SPORT MANAGEMENT SYSTEM has been closed for now."
      : "Unable to verify system access.";
    $("#maintenanceMessage").textContent = message || "Connect to the internet so the system can confirm whether it is open.";
    $("[data-action='show-admin-unlock']").hidden = !systemAccess.closed;
    $("#masterAdminUnlockForm").hidden = true;
    $("#modalRoot").innerHTML = "";
    $("#printStage").innerHTML = "";
    $("#printStage").hidden = true;
    updateInstallUi();
  }

  async function checkSystemAccess() {
    if (systemAccess.checking) return;
    systemAccess.checking = true;
    try {
      if (!navigator.onLine) {
        showSystemStatusUnavailable("Connect to the internet so the system can confirm whether it is open.");
        return;
      }
      const status = await sendApi("getSystemStatus",{}, "",8000);
      if (status.closed) {
        showSystemClosed();
        return;
      }
      const wasUnavailable = systemAccess.unavailable;
      const wasClosed = systemAccess.closed;
      const wasReady = systemAccess.ready;
      systemAccess.ready = true;
      systemAccess.closed = false;
      systemAccess.unavailable = false;
      if (wasClosed || wasUnavailable || !wasReady) {
        if (state.user && state.token) {
          try {
            const result = await sendApi("getDashboard",{}, "",8000);
            state.data = result.data || {};
            showDashboard(true);
            saveOfflineSnapshot().catch(error => console.error("Dashboard data could not be cached.",error));
          } catch (error) {
            if (error.systemClosed) return;
            state.user = null;
            state.token = "";
            state.data = {};
            localStorage.removeItem("fieldhouse.user");
            localStorage.removeItem("fieldhouse.token");
            showAuthPage();
          }
        } else {
          showAuthPage();
        }
      }
    } catch (error) {
      if (error.systemClosed) return;
      showSystemStatusUnavailable("The system server could not be reached. Access is blocked until its status can be verified.");
    } finally {
      systemAccess.checking = false;
    }
  }

  function setAuthenticated(user, token) {
    state.user = user;
    state.token = token;
    systemAccess.ready = true;
    systemAccess.closed = false;
    systemAccess.unavailable = false;
    localStorage.setItem("fieldhouse.user", JSON.stringify(user));
    localStorage.setItem("fieldhouse.token", token);
    showDashboard();
  }

  function logout() {
    state.user = null;
    state.token = "";
    state.data = {};
    localStorage.removeItem("fieldhouse.user");
    localStorage.removeItem("fieldhouse.token");
    $("#dashboardView").hidden = true;
    $("#authView").hidden = false;
    setAuthTab("login");
    toast("Signed out successfully.");
  }

  function showDashboard(skipLoad) {
    if (!state.user || !state.token || !systemAccess.ready || systemAccess.closed) return;
    $("#maintenanceView").hidden = true;
    $("#authView").hidden = true;
    $("#dashboardView").hidden = false;
    updateInstallUi();
    updateProfileDisplay();
    $$(".admin-only").forEach(node => { node.hidden = !isAdmin(); });
    $$(".nav-link[data-page='points']").forEach(node => { node.hidden = !canEditPoints(); });
    goTo(state.page);
    if (!skipLoad) loadData().catch(error => toast(error.message, true));
  }

  async function loadData(options) {
    if (!state.user) return;
    const settings = options || {};
    let cached = null;
    try {
      cached = await offlineRead("snapshots",String(state.user.id));
    } catch (error) {
      console.error("Saved dashboard data could not be read.",error);
    }
    if (cached && cached.data) {
      state.data = cached.data;
      updateSchoolIdentity();
      renderPage();
    }
    if (!navigator.onLine) {
      const operations = await offlineOperationsForUser().catch(error => {
        console.error("Pending offline changes could not be read.",error);
        return [];
      });
      updateConnectionStatus(cached ? `Offline · showing saved data${operations.length?` · ${operations.length} pending`:""}` : "Offline · no saved data");
      if (!cached && !settings.quiet) throw new Error("No saved data is available offline. Connect once and sign in to cache this workspace.");
      return;
    }
    updateConnectionStatus("Syncing");
    try {
      try {
        await flushQueuedMutations();
      } catch (error) {
        console.error("Saved changes could not be read from the offline queue.",error);
      }
      const result = await sendApi("getDashboard");
      state.data = result.data || {};
      updateSchoolIdentity();
      renderPage();
      try {
        await saveOfflineSnapshot();
      } catch (error) {
        console.error("Dashboard data could not be saved for offline use.",error);
        updateConnectionStatus("Connected · offline cache unavailable");
        return;
      }
      updateConnectionStatus("Connected");
    } catch (error) {
      if (cached) {
        const operations=await offlineOperationsForUser().catch(queueError=>{
          console.error("Pending offline changes could not be read.",queueError);
          return [];
        });
        updateConnectionStatus(`Offline · showing saved data${operations.length?` · ${operations.length} pending`:""}`);
        return;
      }
      updateConnectionStatus("Connection unavailable");
      if (!settings.quiet) throw error;
    }
  }

  const pageTitles = {
    home: "Home", points: "Enter point",
    results: "Results", liveScore: "Live Score", certificates: "Certificates", about: "About", admin: "Admin control panel"
  };
  function goTo(page) {
    if (page === "admin" && !isAdmin()) page = "home";
    if (page === "points" && !canEditPoints()) page = "home";
    state.page = page;
    $$(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.page === page));
    $("#pageCrumb").textContent = pageTitles[page] || "Home";
    renderPage();
  }

  function heading(title, description, button) {
    return `<div class="page-heading"><div><span class="eyebrow">AMAZING GRACE DIGITAL / ${escapeHtml(title.toUpperCase())}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${button || ""}</div>`;
  }
  function button(label, action, light) {
    return `<button class="button ${light ? "button-light" : "button-dark"}" data-action="${escapeHtml(action)}">${escapeHtml(label)} <span>+</span></button>`;
  }
  function tableActionIcon(action, idValue, label, kind) {
    const icons={
      Edit:'<path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4z"/><path d="m14.8 5.7 3.5 3.5"/>',
      Delete:'<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
      Approve:'<path d="m5 12 4 4L19 6"/>',
      Deny:'<path d="m6 6 12 12M18 6 6 18"/>',
      View:'<path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>'
    };
    const extraKind=kind?` data-kind="${escapeHtml(kind)}"`:"";
    const danger=label==="Delete"||label==="Deny"?" delete":"";
    return `<button type="button" class="table-action${danger}" data-action="${escapeHtml(action)}" data-id="${escapeHtml(idValue)}"${extraKind} title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[label]}</svg></button>`;
  }
  function emptyRow(columns, text) {
    return `<tr><td class="empty-cell" colspan="${columns}">${escapeHtml(text)}</td></tr>`;
  }
  function houseName(houseId) {
    const index = houses().findIndex(house => house.id === houseId);
    return index < 0 ? "—" : `<span class="house-chip"><i class="house-dot" style="--dot:${houseColor(houses()[index],index)}"></i>${escapeHtml(houses()[index].name)}</span>`;
  }
  function totalsByHouse() {
    const totals = {};
    houses().forEach(house => { totals[house.id] = 0; });
    records("scoreEntries").forEach(entry => {
      (entry.awards || []).forEach(award => { totals[award.houseId] = (totals[award.houseId] || 0) + Number(award.points || 0); });
    });
    return totals;
  }
  function allPoints() {
    return records("points").map(item => Number(item.value)).filter(value => Number.isFinite(value));
  }

  function renderHome() {
    const total = totalsByHouse();
    const leader = houses().slice().sort((a, b) => (total[b.id] || 0) - (total[a.id] || 0))[0];
    return `${heading("Home", "Your season at a glance")}
      <section class="welcome-banner"><span class="welcome-date">${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span><div class="welcome-copy"><span class="eyebrow">YOUR SPORTING COMMUNITY</span><h1>Welcome back, ${escapeHtml(state.user.fullName.split(" ")[0])}.</h1><p>Bring your community together through friendly competition. Keep track of event scores, celebrate every house, and make this season one to remember.</p></div></section>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-top">Registered houses <span class="stat-icon">⌂</span></div><div class="stat-number">${houses().length}</div><div class="stat-foot">Competing this season</div></div>
        <div class="stat-card"><div class="stat-top">Events recorded <span class="stat-icon">▤</span></div><div class="stat-number">${records("scoreEntries").length}</div><div class="stat-foot">Scores in the system</div></div>
        <div class="stat-card"><div class="stat-top">Certificates <span class="stat-icon">▧</span></div><div class="stat-number">${records("certificates").length}</div><div class="stat-foot">Athletic entries recorded</div></div>
        <div class="stat-card"><div class="stat-top">Current leader <span class="stat-icon">✳</span></div><div class="stat-number" style="font-size:18px">${leader ? escapeHtml(leader.name) : "—"}</div><div class="stat-foot">${leader ? (total[leader.id] || 0) + " total points" : "Add houses to get started"}</div></div>
      </div>
      <div class="two-column"><section class="panel"><div class="panel-title"><h3>House leaderboard</h3><span>Season totals</span></div>${houses().length ? houses().slice().sort((a,b)=>(total[b.id]||0)-(total[a.id]||0)).map((house,index)=>`<div class="activity-row"><span class="activity-icon" style="color:${houseColor(house,index)}">♢</span><div class="activity-main"><b>${escapeHtml(house.name)}</b><small>${escapeHtml(house.description || "Ready to compete")}</small></div><span class="activity-meta">${total[house.id] || 0} pts</span></div>`).join("") : `<div class="notice">Your houses will appear here once they are added by a Master Admin.</div>`}</section>
      <section class="panel"><div class="panel-title"><h3>Getting started</h3><span>QUICK GUIDE</span></div><div class="activity-row"><span class="activity-icon">01</span><div class="activity-main"><b>Set up your houses</b><small>Add the teams taking part in your sports season.</small></div></div><div class="activity-row"><span class="activity-icon">02</span><div class="activity-main"><b>Configure events & points</b><small>Build the categories and scoring options.</small></div></div><div class="activity-row"><span class="activity-icon">03</span><div class="activity-main"><b>Record the results</b><small>Award points and celebrate your winners.</small></div></div></section></div>`;
  }

  function aboutSystemArtwork(type) {
    const artwork = {
      school: `<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="180" rx="14" fill="#e5f0e8"/><rect x="29" y="18" width="302" height="145" rx="10" fill="#fff" stroke="#d7e3da" stroke-width="2"/><rect x="29" y="18" width="302" height="25" rx="10" fill="#173d31"/><path d="M29 34h302v9H29z" fill="#173d31"/><circle cx="44" cy="31" r="3" fill="#f2cf53"/><circle cx="54" cy="31" r="3" fill="#fff" opacity=".8"/><circle cx="64" cy="31" r="3" fill="#fff" opacity=".55"/><rect x="39" y="52" width="59" height="100" rx="6" fill="#e5f0e8"/><circle cx="54" cy="66" r="8" fill="#bd3036"/><path d="M51 66h6m-3-3v6" stroke="#fff" stroke-width="2" stroke-linecap="round"/><rect x="68" y="62" width="20" height="5" rx="2.5" fill="#173d31"/><rect x="48" y="84" width="41" height="6" rx="3" fill="#a8bcae"/><rect x="48" y="99" width="34" height="6" rx="3" fill="#a8bcae"/><rect x="48" y="114" width="39" height="6" rx="3" fill="#a8bcae"/><rect x="111" y="55" width="204" height="10" rx="5" fill="#173d31"/><rect x="111" y="73" width="58" height="25" rx="5" fill="#dceafa"/><rect x="178" y="73" width="58" height="25" rx="5" fill="#fff2cf"/><rect x="245" y="73" width="58" height="25" rx="5" fill="#f9e1e2"/><rect x="120" y="80" width="29" height="5" rx="2.5" fill="#245f9b"/><rect x="187" y="80" width="34" height="5" rx="2.5" fill="#a7771a"/><rect x="254" y="80" width="31" height="5" rx="2.5" fill="#bd3036"/><rect x="111" y="108" width="204" height="5" rx="2.5" fill="#d8e0db"/><path d="M111 122h204m-204 13h204m-151-27v41m52-41v41m50-41v41" stroke="#e0e7e1" stroke-width="2"/><rect x="119" y="116" width="31" height="4" rx="2" fill="#8fac98"/><rect x="168" y="129" width="37" height="4" rx="2" fill="#bd3036"/><rect x="220" y="116" width="42" height="4" rx="2" fill="#245f9b"/></svg>`,
      clinic: `<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="180" rx="14" fill="#e7f1f8"/><circle cx="303" cy="35" r="18" fill="#f2cf53"/><rect x="82" y="42" width="196" height="111" rx="10" fill="#fff"/><rect x="82" y="42" width="196" height="25" rx="10" fill="#245f9b"/><path d="M82 57h196v10H82z" fill="#245f9b"/><circle cx="99" cy="54" r="3" fill="#fff"/><circle cx="110" cy="54" r="3" fill="#fff"/><rect x="101" y="82" width="67" height="55" rx="7" fill="#e7f1f8"/><path d="M127 92v35m-17-17h35" stroke="#bd3036" stroke-width="9" stroke-linecap="round"/><rect x="182" y="84" width="76" height="8" rx="4" fill="#d9e3eb"/><rect x="182" y="101" width="57" height="7" rx="3.5" fill="#d9e3eb"/><rect x="182" y="119" width="67" height="18" rx="6" fill="#e5f0e8"/><path d="M43 153h274" stroke="#173d31" stroke-width="4" stroke-linecap="round"/></svg>`,
      mobile: `<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="180" rx="14" fill="#fff2cf"/><circle cx="62" cy="45" r="18" fill="#f2cf53"/><rect x="116" y="19" width="91" height="143" rx="16" fill="#173d31"/><rect x="123" y="29" width="77" height="123" rx="10" fill="#fff"/><rect x="145" y="23" width="33" height="4" rx="2" fill="#8fa096"/><rect x="133" y="41" width="56" height="31" rx="7" fill="#e5f0e8"/><circle cx="146" cy="56" r="7" fill="#bd3036"/><rect x="158" y="51" width="23" height="5" rx="2.5" fill="#173d31"/><rect x="158" y="60" width="17" height="4" rx="2" fill="#8fa096"/><rect x="133" y="81" width="56" height="27" rx="6" fill="#e7f1f8"/><rect x="140" y="89" width="28" height="5" rx="2.5" fill="#245f9b"/><rect x="140" y="98" width="42" height="4" rx="2" fill="#9ab4c8"/><rect x="133" y="116" width="56" height="23" rx="6" fill="#fff2cf"/><circle cx="153" cy="127" r="4" fill="#bd3036"/><circle cx="166" cy="127" r="4" fill="#245f9b"/><circle cx="179" cy="127" r="4" fill="#f2cf53"/><rect x="226" y="54" width="70" height="93" rx="12" fill="#fff" stroke="#d7dfd8" stroke-width="4"/><rect x="237" y="67" width="48" height="36" rx="6" fill="#e7f1f8"/><path d="m244 94 12-14 9 9 7-6 8 11z" fill="#245f9b"/><rect x="237" y="111" width="41" height="6" rx="3" fill="#d7dfd8"/><rect x="237" y="123" width="31" height="6" rx="3" fill="#d7dfd8"/></svg>`,
      web: `<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="180" rx="14" fill="#e5f0e8"/><rect x="51" y="26" width="258" height="127" rx="11" fill="#173d31"/><rect x="58" y="34" width="244" height="111" rx="6" fill="#fff"/><path d="M58 50h244" stroke="#dce5df" stroke-width="2"/><circle cx="70" cy="42" r="3" fill="#bd3036"/><circle cx="81" cy="42" r="3" fill="#f2cf53"/><circle cx="92" cy="42" r="3" fill="#8eb49c"/><rect x="72" y="63" width="63" height="71" rx="6" fill="#e7f1f8"/><rect x="82" y="72" width="43" height="7" rx="3.5" fill="#245f9b"/><rect x="82" y="86" width="33" height="5" rx="2.5" fill="#a8bdca"/><rect x="82" y="98" width="43" height="25" rx="5" fill="#fff"/><rect x="148" y="64" width="139" height="10" rx="5" fill="#173d31"/><rect x="148" y="83" width="117" height="6" rx="3" fill="#d8e0db"/><rect x="148" y="96" width="129" height="6" rx="3" fill="#d8e0db"/><rect x="148" y="112" width="57" height="20" rx="5" fill="#bd3036"/><path d="M32 157h296" stroke="#173d31" stroke-width="4" stroke-linecap="round"/></svg>`,
      spreadsheet: `<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="180" rx="14" fill="#e5f0e8"/><rect x="76" y="25" width="208" height="131" rx="10" fill="#fff" stroke="#d8e3da" stroke-width="3"/><rect x="76" y="25" width="208" height="26" rx="10" fill="#176345"/><path d="M76 41h208v10H76z" fill="#176345"/><circle cx="94" cy="38" r="4" fill="#f2cf53"/><rect x="111" y="34" width="88" height="8" rx="4" fill="#fff" opacity=".8"/><path d="M92 65h176M92 85h176M92 105h176M92 125h176M128 57v78m44-78v78m44-78v78" stroke="#dce5df" stroke-width="2"/><rect x="94" y="67" width="31" height="15" rx="3" fill="#dceafa"/><rect x="130" y="87" width="40" height="15" rx="3" fill="#fff2cf"/><rect x="174" y="107" width="39" height="15" rx="3" fill="#f9e1e2"/><rect x="220" y="67" width="42" height="15" rx="3" fill="#e5f0e8"/><path d="M44 145v-14m12 14v-25m12 25V112" stroke="#245f9b" stroke-width="8" stroke-linecap="round"/><path d="M37 153h43" stroke="#173d31" stroke-width="4" stroke-linecap="round"/></svg>`,
      website: `<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="180" rx="14" fill="#fff0ef"/><rect x="49" y="25" width="262" height="130" rx="11" fill="#fff" stroke="#eadbd9" stroke-width="3"/><path d="M49 49h262" stroke="#eadbd9" stroke-width="2"/><circle cx="64" cy="37" r="4" fill="#bd3036"/><circle cx="77" cy="37" r="4" fill="#f2cf53"/><rect x="92" y="33" width="97" height="7" rx="3.5" fill="#e7ece8"/><rect x="64" y="61" width="130" height="78" rx="7" fill="#e5f0e8"/><circle cx="151" cy="81" r="11" fill="#f2cf53"/><path d="m71 131 42-38 25 22 17-17 32 33z" fill="#176345"/><rect x="210" y="66" width="81" height="10" rx="5" fill="#173d31"/><rect x="210" y="85" width="69" height="6" rx="3" fill="#d8e0db"/><rect x="210" y="99" width="74" height="6" rx="3" fill="#d8e0db"/><rect x="210" y="116" width="57" height="18" rx="6" fill="#bd3036"/><path d="M226 125h24" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`
    };
    return artwork[type];
  }

  function renderAboutContent() {
    const digitalSolutions = [
      { type:"school", title:"School management systems", description:"Bring school administration into a clearer workflow, with possible modules for student records, attendance, timetables, notices, and reporting.", value:"Designed to reduce scattered records and make routine information easier to find." },
      { type:"clinic", title:"Hospital and clinic systems", description:"Plan appointment, patient-record, and service workflows around the needs of a healthcare team.", value:"Privacy, access controls, and local healthcare requirements must be agreed before handling sensitive records." },
      { type:"mobile", title:"Mobile applications", description:"Create phone-friendly tools for forms, updates, service requests, and access to essential information.", value:"The design can be shaped around the people and devices that will use the app." },
      { type:"web", title:"Web applications", description:"Build browser-based workspaces with dashboards, forms, searchable records, and task-specific user roles.", value:"A shared web interface can help teams follow the same process from different devices." },
      { type:"spreadsheet", title:"Excel and spreadsheet solutions", description:"Organize data using practical templates, validated inputs, summary views, and reports.", value:"Clear formulas and review steps can help reduce repetitive manual calculations." },
      { type:"website", title:"Custom websites", description:"Present an organization with responsive pages, service information, contact details, and clear calls to action.", value:"Content and layout can be tailored to the audience and purpose of the website." }
    ];
    const solutionsMarkup = digitalSolutions.map(solution => `
      <article class="about-system-card">
        <div class="about-system-art" aria-hidden="true">${aboutSystemArtwork(solution.type)}</div>
        <div class="about-system-details">
          <span class="about-system-label">SYSTEM UI CONCEPT</span>
          <h3>${escapeHtml(solution.title)}</h3>
          <p>${escapeHtml(solution.description)}</p>
          <div class="about-system-value"><b>Why it helps</b><span>${escapeHtml(solution.value)}</span></div>
        </div>
      </article>`).join("");
    return `<div class="about-content">
      <section class="about-overview">
        <div class="about-overview-brand"><img src="amazing-grace-logo.svg" alt="Amazing Grace Digital shield logo"><span class="eyebrow">ABOUT OUR SYSTEM</span></div>
        <h2>Sport made <span class="about-highlight-red">clear.</span><br>Teams made <span class="about-highlight-yellow">stronger.</span></h2>
        <p>Amazing Grace Digital Sport Management System helps schools and sporting communities organize houses, events, point values, results, and athlete certificates in one connected workspace. Staff can record scores, follow house standings, review point history, and celebrate athletes while keeping the season's information together.</p>
        <div class="about-overview-note"><b>Purpose-built for school sport</b><span>Clear tools for administrators, house masters, field recorders, athletes, and supporters.</span></div>
      </section>
      <section class="about-section about-sport-gallery">
        <div class="about-section-heading"><span class="eyebrow">SPORT IN FOCUS</span><h2>Celebrate effort, teamwork, and achievement.</h2><p>Sport brings a community together. The system helps organizers carry that energy from event planning and score recording through to results and athlete recognition.</p></div>
        <div class="about-sport-photo-grid">
          <figure><img src="photo/athletics-03.jpg" alt="Athletes running together on a track" loading="lazy"><figcaption><b>Compete with purpose</b><span>Plan events and scoring before the competition begins.</span></figcaption></figure>
          <figure><img src="photo/athletics-06.jpg" alt="Athletes racing toward the finish line" loading="lazy"><figcaption><b>Record the moment</b><span>Enter awards for each house using the configured event and point values.</span></figcaption></figure>
          <figure><img src="photo/athletics-09.jpg" alt="Runner taking part in a track event" loading="lazy"><figcaption><b>Recognize achievement</b><span>Follow standings and create certificates for athletes.</span></figcaption></figure>
        </div>
        <p class="about-image-note">These are illustrative athletics photographs, not screenshots or evidence of particular recorded events.</p>
      </section>
      <section class="about-section">
        <div class="about-section-heading"><span class="eyebrow">WHY IT MATTERS</span><h2>Make every part of the season easier to manage.</h2><p>Keep important information together and help everyone follow the competition with confidence.</p></div>
        <div class="about-benefit-grid">
          <article class="about-benefit"><span class="about-benefit-number">01</span><h3>One organized workspace</h3><p>Set up houses, categories, events, point values, and positions in one place instead of scattered records.</p></article>
          <article class="about-benefit"><span class="about-benefit-number">02</span><h3>Clear results for everyone</h3><p>Record awards consistently and follow house standings, results, point history, and the live scoreboard.</p></article>
          <article class="about-benefit"><span class="about-benefit-number">03</span><h3>Celebrate athletes</h3><p>Create polished certificates with unique numbers, QR codes, and athlete details for recognition and verification.</p></article>
          <article class="about-benefit"><span class="about-benefit-number">04</span><h3>Keep working offline</h3><p>Previously saved data stays available, and supported changes can queue on this device to sync when the connection returns.</p></article>
          <article class="about-benefit"><span class="about-benefit-number">05</span><h3>Use the right access</h3><p>Administrator, house master, and field recorder roles help keep daily tasks organized and appropriate.</p></article>
          <article class="about-benefit"><span class="about-benefit-number">06</span><h3>Spend more time on sport</h3><p>Reduce repetitive record keeping so teams can focus on participation, fair competition, and achievement.</p></article>
        </div>
      </section>
      <section class="about-section">
        <div class="about-section-heading"><span class="eyebrow">HOW IT SUPPORTS A SEASON</span><h2>From planning to recognition.</h2><p>A clear process helps organizers, recorders, and houses stay on the same page throughout the competition.</p></div>
        <div class="about-journey-grid">
          <article class="about-journey-step"><span>01</span><div><h3>Plan</h3><p>Set up the school identity, houses, event categories, events, and scoring options.</p></div></article>
          <article class="about-journey-step"><span>02</span><div><h3>Record</h3><p>Authorized staff enter event results and athlete achievements as they happen.</p></div></article>
          <article class="about-journey-step"><span>03</span><div><h3>Follow</h3><p>Check house standings, result history, and the live scoreboard in one workspace.</p></div></article>
          <article class="about-journey-step"><span>04</span><div><h3>Celebrate</h3><p>Recognize athletes with designed certificates that include unique numbers and QR details.</p></div></article>
        </div>
      </section>
      <section class="about-section about-integrity">
        <div class="about-section-heading"><span class="eyebrow">TRANSPARENCY & RESULT INTEGRITY</span><h2>Clear rules in. Reviewable results out.</h2><p>The system supports a consistent scoring process by checking entries against the competition setup and keeping a point-history view for review.</p></div>
        <div class="about-integrity-grid">
          <article><span class="about-integrity-icon">01</span><div><h3>Agree scoring before events</h3><p>Administrators configure categories, events, positions, and allowed point values. Organizers should share the agreed setup with participating teams before the event.</p></div></article>
          <article><span class="about-integrity-icon">02</span><div><h3>Validate each scoring round</h3><p>The server checks that a valid category and event are selected, every house has an award or zero, and non-zero awards use configured, distinct point values.</p></div></article>
          <article><span class="about-integrity-icon">03</span><div><h3>Keep a reviewable history</h3><p>Point history displays the event, category, awards, date, and recorder name supplied with the submission, helping administrators review how the standings were formed.</p></div></article>
          <article><span class="about-integrity-icon">04</span><div><h3>Restrict administrative actions</h3><p>Role checks are enforced by the server for protected actions, including managing setup and clearing score history.</p></div></article>
        </div>
        <div class="about-accuracy-note"><b>Important accuracy note</b><p>Totals are calculated from the scores entered into the system; the app cannot independently verify a field result or prevent every human input mistake. Review point history and standings before publishing official results. The recorder name is supplied with each submission, and this history is not an immutable signed audit log; an authorized administrator can clear score records.</p></div>
      </section>
      <section class="about-section about-services">
        <div class="about-section-heading"><span class="eyebrow">MORE DIGITAL SOLUTIONS</span><h2>Technology shaped around real needs.</h2><p>The developers can plan digital solutions with organizations, schools, and businesses. The screens below are original website and app mockups showing possible interfaces for future or client-specific systems; they are concepts, not screenshots of completed products.</p></div>
        <div class="about-system-grid">${solutionsMarkup}</div>
        <p class="about-image-note">These website and app screens are original concept mockups, not screenshots of completed products. Final features, timelines, privacy controls, and support arrangements depend on the project requirements.</p>
      </section>
      <section class="about-section about-developers">
        <div class="about-section-heading"><span class="eyebrow">MEET THE DEVELOPERS</span><h2>Built by student software engineers.</h2><p>Both developers are final-year BSc (Hons) Software Engineering with Multimedia students at Limkokwing University. Their studies combine software engineering with multimedia skills.</p></div>
        <div class="about-developer-grid">
          <article class="about-developer-card">
            <img class="about-developer-photo" src="photo/engineer-john-dwight-tholley.png" alt="Engineer John Dwight Tholley">
            <div class="about-developer-details"><span class="about-developer-role">Software Engineer</span><h3>Engineer John Dwight Tholley</h3><p>Final-year BSc (Hons) Software Engineering with Multimedia student at Limkokwing University.</p><div class="about-contact-links"><a href="tel:+23273694109">Call +232 73 694 109</a><a href="mailto:tholleyj4@gmail.com">tholleyj4@gmail.com</a></div></div>
          </article>
          <article class="about-developer-card">
            <img class="about-developer-photo" src="photo/engineer-kabba-samura.png" alt="Engineer Kabba Samura">
            <div class="about-developer-details"><span class="about-developer-role">Software Engineer</span><h3>Engineer Kabba Samura</h3><p>Final-year BSc (Hons) Software Engineering with Multimedia student at Limkokwing University.</p><div class="about-contact-links"><a href="tel:+23279123230">Call +232 79 123 230</a></div></div>
          </article>
        </div>
      </section>
    </div>`;
  }

  function renderAboutPage() {
    return `${heading("About", "The purpose, benefits, and people behind Amazing Grace Digital.")}${renderAboutContent()}`;
  }

  function renderAdmin() {
    const users = records("users");
    const pending = users.filter(user => user.status === "Pending").length;
    return `${heading("Admin control panel", "Manage access, houses, event categories, and scoring options.")}
      <section class="system-control-card system-open"><div><span class="eyebrow">GLOBAL ACCESS · SYSTEM ON</span><h3>System is currently open</h3><p>Turn it off to sign out every user and show the system-closed page. An approved Master Admin must enter their username and password there to turn it on again.</p></div><button type="button" class="button button-danger" data-action="close-system">Turn system off</button></section>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-top">All users <span class="stat-icon">♙</span></div><div class="stat-number">${users.length}</div><div class="stat-foot">Registered accounts</div></div>
        <div class="stat-card"><div class="stat-top">Awaiting approval <span class="stat-icon">◷</span></div><div class="stat-number">${pending}</div><div class="stat-foot">Need your attention</div></div>
        <div class="stat-card"><div class="stat-top">Houses <span class="stat-icon">⌂</span></div><div class="stat-number">${houses().length}</div><div class="stat-foot">In this competition</div></div>
        <div class="stat-card"><div class="stat-top">Categories <span class="stat-icon">▦</span></div><div class="stat-number">${records("categories").length}</div><div class="stat-foot">Event groupings</div></div>
      </div>
      ${renderSchoolSettings()}
      <section class="table-card admin-table"><div class="table-toolbar"><div class="toolbar-left"><h3>Registered users</h3><small>${users.length} accounts</small></div><input class="search-input" data-filter="users" placeholder="Search users…"></div><div class="table-wrap"><table><thead><tr><th>NAME</th><th>USERNAME</th><th>EMAIL</th><th>ROLE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody id="usersBody">${renderUserRows(users)}</tbody></table></div></section>
      <section class="table-card" style="margin-top:17px"><div class="table-toolbar"><div class="toolbar-left"><h3>Houses</h3><small>${houses().length} houses</small></div>${button("Add houses","add-houses")}</div><div class="table-wrap"><table><thead><tr><th>HOUSE</th><th>DESCRIPTION</th><th>COLOR</th><th>ADDED</th><th>ACTIONS</th></tr></thead><tbody>${houses().map((house,index)=>`<tr><td>${escapeHtml(house.name)}</td><td>${escapeHtml(house.description || "—")}</td><td><span class="house-color-swatch" style="--house-bg:${houseColor(house,index)}"></span></td><td>${dateLabel(house.createdAt)}</td><td><div class="actions-cell">${tableActionIcon("edit-house",house.id,"Edit")}${tableActionIcon("delete-house",house.id,"Delete")}</div></td></tr>`).join("") || emptyRow(5,"No houses added yet.")}</tbody></table></div></section>
      <section class="table-card" style="margin-top:17px"><div class="table-toolbar"><div class="toolbar-left"><h3>Competition setup</h3><small>${records("categories").length} categories · ${records("events").length} events · ${records("points").length} point values · ${records("positions").length} positions</small></div></div>
      ${renderOptionTable("Categories","categories",records("categories"),"name")}${renderOptionTable("Events","events",records("events"),"name")}${renderOptionTable("Points","points",records("points"),"value")}${renderOptionTable("Positions","positions",records("positions"),"value")}</section>`;
  }
  function renderSchoolSettings() {
    const settings = schoolSettings();
    return `<section class="table-card school-settings-card"><div class="table-toolbar"><div class="toolbar-left"><h3>School identity & certificate setup</h3><small>Displayed in the workspace and on certificates</small></div><button type="button" class="button button-danger" data-action="clear-school-info">Clear school identity</button></div>
      <form id="schoolSettingsForm" class="school-settings-form">
        <div class="form-row"><label>School name<input name="schoolName" required maxlength="120" value="${escapeHtml(settings.schoolName||"")}" placeholder="School name"></label><label>School motto<input name="motto" maxlength="200" value="${escapeHtml(settings.motto||"")}" placeholder="School motto"></label></div>
        <label>School address<textarea name="address" maxlength="300" placeholder="School address">${escapeHtml(settings.address||"")}</textarea></label>
        <div class="school-logo-setting"><div class="school-logo-preview-wrap"><img id="schoolLogoPreview" class="school-logo-preview" src="${settings.logo?escapeHtml(settings.logo):""}" alt="School logo preview" ${settings.logo?"":"hidden"}><span id="schoolLogoFallback" class="school-logo-fallback" ${settings.logo?"hidden":""}>Logo</span></div><div class="school-logo-controls"><label>School logo<input name="schoolLogo" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="profile-remove-option"><input name="removeSchoolLogo" type="checkbox" ${settings.logo?"":"disabled"}> Remove current logo</label></div></div>
        <div class="form-row"><label>Meet title<input name="meetTitle" required maxlength="120" value="${escapeHtml(settings.meetTitle||"1st Annual Inter-Athlete Sports Meet")}"></label><label>Certificate template<div class="certificate-template-control"><select name="templateId">${certificateTemplateOptions(settings.templateId||1)}</select><button type="button" class="certificate-template-preview-button" data-action="preview-certificate-template" aria-label="Preview selected certificate design" title="Preview selected design"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div></label></div>
        <div class="form-row"><label>Certificate layout per sheet<select name="certificatesPerPage"><option value="1" selected>1 landscape certificate on A4 landscape</option></select></label><div class="school-settings-help">Certificates print one per A4 landscape sheet to preserve the same design and proportions as the preview and QR certificate page.</div></div>
        <div class="school-settings-actions"><button type="submit" class="button button-dark">Save school settings <span>→</span></button></div>
      </form></section>`;
  }
  function renderUserRows(users) {
    return users.map(user => `<tr><td>${escapeHtml(user.fullName)}</td><td>${escapeHtml(user.username)}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.role)}</td><td><span class="pill ${user.status === "Pending" ? "pending" : user.status === "Denied" ? "denied" : ""}">${escapeHtml(user.status)}</span></td><td><div class="actions-cell">${user.status !== "Approved" ? tableActionIcon("approve-user",user.id,"Approve") : ""}${user.status !== "Denied" ? tableActionIcon("deny-user",user.id,"Deny") : ""}${tableActionIcon("delete-user",user.id,"Delete")}</div></td></tr>`).join("") || emptyRow(6,"No registered users yet.");
  }
  function renderOptionTable(title, kind, items, key) {
    const addAction = kind === "points" ? "add-point-values" : "add-"+kind;
    return `<div class="table-toolbar" style="border-top:1px solid var(--line)"><div class="toolbar-left"><h3>${title}</h3><small>${items.length} saved</small></div><div class="toolbar-actions">${button("Add "+title.toLowerCase(), addAction, true)}<button class="button button-danger" data-action="clear-"+kind>Delete all</button></div></div><div class="table-wrap"><table><thead><tr><th>${title.toUpperCase()}</th><th>ADDED</th><th>ACTION</th></tr></thead><tbody>${items.map(item=>`<tr><td>${escapeHtml(kind === "positions" ? ordinal(item.value) : item.value)}</td><td>${dateLabel(item.createdAt)}</td><td>${tableActionIcon("delete-option",item.id,"Delete",kind)}</td></tr>`).join("") || emptyRow(3,`No ${title.toLowerCase()} added yet.`)}</tbody></table></div>`;
  }

  function renderPoints() {
    const totals=totalsByHouse();
    const leaders=houses().slice().sort((a,b)=>(totals[b.id]||0)-(totals[a.id]||0));
    const canDelete=isAdmin();
    return `${heading("Enter point","Award event points and follow your house leaderboard.",canEditPoints()?button("Add points","add-points"): "")}
      <div class="score-grid">${leaders.map((house,index)=>`<div class="score-card"><span><i class="house-dot" style="--dot:${houseColor(house,index)}"></i> ${escapeHtml(house.name)}</span><strong>${totals[house.id]||0} <small style="font-size:11px;color:#8b978f">pts</small></strong></div>`).join("") || `<div class="notice">Add houses in the admin control panel to start awarding points.</div>`}</div>
      <div class="table-card"><div class="table-toolbar"><div class="toolbar-left"><h3>Point history</h3><small>${records("scoreEntries").length} scoring rounds</small></div>${canDelete?`<button class="button button-danger" data-action="clear-score-entries">Delete all</button>`:""}</div><div class="table-wrap"><table><thead><tr><th>DATE</th><th>CATEGORY</th><th>EVENT</th><th>HOUSE AWARDS</th><th>RECORDED BY</th></tr></thead><tbody id="scoreHistoryRows">${records("scoreEntries").map(entry=>{const cats=records("categories").find(x=>x.id===entry.categoryId);const evt=records("events").find(x=>x.id===entry.eventId);return `<tr class="score-history-entry"><td>${dateLabel(entry.createdAt)}</td><td>${escapeHtml(cats?cats.value:"—")}</td><td>${escapeHtml(evt?evt.value:"—")}</td><td>${(entry.awards||[]).map(award=>`${houseName(award.houseId)}: <b>${escapeHtml(award.points)}</b>`).join(" &nbsp;·&nbsp; ")}</td><td>${escapeHtml(entry.createdBy||"—")}</td></tr>`;}).join("")||emptyRow(5,"No points have been awarded yet.")}</tbody></table></div></div>`;
  }

  function renderResults() {
    const total=totalsByHouse();
    const sorted=houses().slice().sort((a,b)=>(total[b.id]||0)-(total[a.id]||0));
    return `${heading("Results","The season standings, updated as scores are entered.")}
      <section class="welcome-banner" style="min-height:145px;margin-bottom:18px"><div class="welcome-copy"><span class="eyebrow">THE SEASON SO FAR</span><h1 style="font-size:25px">${sorted.length?escapeHtml(sorted[0].name)+" is setting the pace.":"The leaderboard is ready."}</h1><p>${sorted.length?escapeHtml(sorted[0].name)+" leads with "+(total[sorted[0].id]||0)+" points. Keep the competition going!":"Once points are awarded, each house's result will appear here."}</p></div></section>
      <div class="score-grid">${sorted.map((house,index)=>`<div class="score-card"><span>#${index+1} &nbsp; <i class="house-dot" style="--dot:${houseColor(house,index)}"></i> ${escapeHtml(house.name)}</span><strong>${total[house.id]||0} <small style="font-size:11px;color:#8b978f">points</small></strong><span>${escapeHtml(house.description||"Competing this season")}</span></div>`).join("")||`<div class="notice">No houses have been added yet.</div>`}</div>
      <section class="table-card"><div class="table-toolbar"><h3>House standings</h3><small>${sorted.length} houses</small></div><div class="table-wrap"><table><thead><tr><th>POSITION</th><th>HOUSE</th><th>TOTAL POINTS</th><th>EVENTS RECORDED</th></tr></thead><tbody>${sorted.map((house,index)=>`<tr><td>${ordinal(index+1)}</td><td>${houseName(house.id)}</td><td><b>${total[house.id]||0}</b></td><td>${records("scoreEntries").filter(entry=>(entry.awards||[]).some(a=>a.houseId===house.id)).length}</td></tr>`).join("")||emptyRow(4,"No results to display.")}</tbody></table></div></section>`;
  }

  function renderLiveScore() {
    const totals = totalsByHouse();
    const sorted = houses().slice().sort((a,b)=>(totals[b.id]||0)-(totals[a.id]||0));
    return `<section class="live-score-grid">${sorted.map((house,index)=>{
      const color = houseColor(house,index);
      return `<article class="live-score-card" style="--house-bg:${color};--house-text:${houseTextColor(color)}"><span>${escapeHtml(house.name)}</span><p class="live-score-description">${escapeHtml(house.description||"")}</p><strong>${totals[house.id]||0}</strong><small>POINTS</small></article>`;
    }).join("")||`<div class="notice">No houses have been added yet.</div>`}</section>`;
  }

  function renderCertificates() {
    const cats=records("categories"), events=records("events");
    const rows=records("certificates");
    const selectedHouse=$("#certHouseFilter")?$("#certHouseFilter").value:"all";
    return `${heading("Certificates","Recognize athletic achievement across every house.",button("Add certificate","add-cert"))}
      <div class="certificate-print-controls"><label>House<select id="certHouseFilter" class="search-input"><option value="all">All houses</option>${houses().map(house=>`<option value="${escapeHtml(house.id)}" ${selectedHouse===house.id?"selected":""}>${escapeHtml(house.name)}</option>`).join("")}</select></label><div class="toolbar-actions"><button class="button button-dark" data-action="print-certificates">Print certificates / Save as PDF</button><button class="button button-light" data-action="print-certificate-list">Print list</button>${isAdmin()?`<button class="button button-danger" data-action="reset-print-history">Reset print history</button>`:""}</div></div><p class="print-history-note">Confirmed prints are skipped on repeat runs for the same house and print type. All-house runs include records previously printed by house.</p>
      <div class="table-card"><div class="table-toolbar"><div class="toolbar-left"><h3>Certificate records</h3><small>${rows.length} athletes · printed records highlighted</small></div><div class="toolbar-actions"><input class="search-input" id="certSearch" placeholder="Search by athlete…">${isAdmin()&&rows.length?`<button class="button button-danger" data-action="clear-certificates">Delete all certificates</button>`:""}</div></div><div class="table-toolbar certificate-house-filter-toolbar"><div class="certificate-house-filters" role="group" aria-label="Filter certificate records by house"><button type="button" class="certificate-house-filter ${selectedHouse==="all"?"active":""}" data-cert-house="all" aria-pressed="${selectedHouse==="all"}">All houses</button>${houses().map(house=>`<button type="button" class="certificate-house-filter ${selectedHouse===String(house.id)?"active":""}" data-cert-house="${escapeHtml(house.id)}" aria-pressed="${selectedHouse===String(house.id)}">${escapeHtml(house.name)}</button>`).join("")}</div></div><div class="table-toolbar certificate-filter-toolbar"><label>Category<select id="certCategoryFilter" class="search-input"><option value="">All categories</option>${cats.map(cat=>`<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.value)}</option>`).join("")}</select></label></div><div class="table-wrap"><table><thead><tr><th>ATHLETE</th><th>CERTIFICATE #</th><th>HOUSE</th><th>CATEGORY</th><th>EVENT</th><th>POSITION</th><th>DATE</th><th>PRINT STATUS</th><th>ACTIONS</th></tr></thead><tbody id="certificateRows">${renderCertificateRows(rows)}</tbody></table></div></div>`;
  }
  function renderCertificateRows(rows) {
    const catMap=Object.fromEntries(records("categories").map(x=>[x.id,x.value]));
    const eventMap=Object.fromEntries(records("events").map(x=>[x.id,x.value]));
    const history=records("printHistory");
    return rows.map(cert=>{
      const printedCertificate=history.some(item=>String(item.certificateId)===String(cert.id)&&item.printType==="certificate");
      const printedList=history.some(item=>String(item.certificateId)===String(cert.id)&&item.printType==="list");
      const printed=printedCertificate||printedList;
      const status=`${printedCertificate?`<span class="pill printed-pill">Certificate</span>`:""}${printedList?`<span class="pill printed-pill">List</span>`:""}${printed?"":`<span class="muted-status">Not printed</span>`}`;
      return `<tr class="${printed?"certificate-printed":""}" data-athlete="${escapeHtml(cert.athleteName.toLowerCase())}" data-house="${escapeHtml(cert.houseId)}" data-category="${escapeHtml(cert.categoryId)}"><td>${escapeHtml(cert.athleteName)}</td><td><span class="certificate-number-chip">${escapeHtml(cert.certificateNumber||makeCertificateNumber(cert.id,cert.createdAt))}</span></td><td>${houseName(cert.houseId)}</td><td>${escapeHtml(catMap[cert.categoryId]||"—")}</td><td>${escapeHtml(eventMap[cert.eventId]||"—")}</td><td>${ordinal(cert.position)} place</td><td>${dateLabel(cert.createdAt)}</td><td>${status}</td><td><div class="actions-cell">${tableActionIcon("view-cert",cert.id,"View")}${tableActionIcon("edit-cert",cert.id,"Edit")}${tableActionIcon("delete-cert",cert.id,"Delete")}</div></td></tr>`;
    }).join("") || emptyRow(9,"No certificates found. Add an athlete to get started.");
  }

  function certificateArtwork(template) {
    const primary=template.primary, accent=template.accent;
    const designs=[
      `<path d="M0 990V835H175L0 990ZM1400 990V835H1225L1400 990Z" fill="${primary}"/><path d="M0 990V910H92L0 990ZM1400 990V910H1308L1400 990Z" fill="${accent}"/>`,
      `<path d="M0 0H25V990H0ZM1375 0H1400V990H1375Z" fill="${primary}"/><path d="M25 0H42V210H25ZM1358 780H1375V990H1358Z" fill="${accent}"/>`,
      `<path d="M0 965H1400V990H0Z" fill="${primary}"/><path d="M0 925H280V950H0ZM1120 925H1400V950H1120Z" fill="${accent}"/>`,
      `<circle cx="700" cy="12" r="52" fill="${primary}"/><circle cx="700" cy="12" r="28" fill="${accent}"/>`,
      `<circle cx="0" cy="990" r="150" fill="${primary}"/><circle cx="0" cy="990" r="92" fill="${accent}"/><circle cx="1400" cy="990" r="150" fill="${primary}"/><circle cx="1400" cy="990" r="92" fill="${accent}"/>`,
      `<path d="M0 990V860L130 990ZM1400 990V860L1270 990Z" fill="${accent}"/><path d="M0 990V925L65 990ZM1400 990V925L1335 990Z" fill="${primary}"/>`,
      `<rect x="0" y="0" width="36" height="990" rx="18" fill="${primary}"/><rect x="1364" y="0" width="36" height="990" rx="18" fill="${primary}"/><rect x="0" y="420" width="36" height="150" fill="${accent}"/><rect x="1364" y="420" width="36" height="150" fill="${accent}"/>`,
      `<path d="M0 965H1400V990H0Z" fill="${accent}"/><rect x="65" y="930" width="26" height="35" rx="8" fill="${primary}"/><rect x="1309" y="930" width="26" height="35" rx="8" fill="${primary}"/>`,
      `<path d="M0 410H34V580H0ZM1366 410H1400V580H1366Z" fill="${primary}"/><path d="m0 410 34 85-34 85Zm1400 0-34 85 34 85Z" fill="${accent}"/>`,
      `<path d="M625 0H775L700 52Z" fill="${primary}"/><circle cx="700" cy="18" r="13" fill="${accent}"/>`,
      `<path d="M0 990V875H125L0 990ZM1400 990V875H1275L1400 990Z" fill="${accent}"/><path d="M0 990V940H55L0 990ZM1400 990V940H1345L1400 990Z" fill="${primary}"/>`,
      `<rect x="0" y="0" width="18" height="990" fill="${accent}"/><rect x="1382" y="0" width="18" height="990" fill="${accent}"/><rect x="18" y="0" width="12" height="990" fill="${primary}"/><rect x="1370" y="0" width="12" height="990" fill="${primary}"/>`,
      `<path d="M0 990V900L90 990ZM1400 990V900L1310 990Z" fill="${primary}"/><circle cx="150" cy="965" r="22" fill="${accent}"/><circle cx="1250" cy="965" r="22" fill="${accent}"/>`,
      `<rect x="0" y="970" width="1400" height="20" fill="${primary}"/><rect x="0" y="938" width="160" height="18" fill="${accent}"/><rect x="1240" y="938" width="160" height="18" fill="${accent}"/>`,
      `<path d="M0 990V870H32V930H92V990ZM1400 990V870H1368V930H1308V990Z" fill="${primary}"/><path d="M0 990V940H50V990ZM1400 990V940H1350V990Z" fill="${accent}"/>`,
      `<rect x="0" y="470" width="28" height="160" rx="14" fill="${primary}"/><rect x="1372" y="300" width="28" height="160" rx="14" fill="${primary}"/><circle cx="14" cy="550" r="10" fill="${accent}"/><circle cx="1386" cy="380" r="10" fill="${accent}"/>`,
      `<path d="M0 990V860Q0 830 30 830H125L0 990ZM1400 990V860Q1400 830 1370 830H1275L1400 990Z" fill="${primary}"/><path d="M0 990V925H65L0 990ZM1400 990V925H1335L1400 990Z" fill="${accent}"/>`,
      `<path d="M0 0H45V190H0ZM1355 0H1400V190H1355Z" fill="${primary}"/><path d="M0 0H90V30H0ZM1310 0H1400V30H1310Z" fill="${accent}"/>`,
      `<rect x="0" y="952" width="1400" height="38" fill="${primary}"/><path d="m0 952 38 38H0Zm1400 0-38 38h38Z" fill="${accent}"/>`,
      `<path d="M0 990 90 900l90 90Zm1400 0-90-90-90 90Z" fill="${accent}"/><path d="m0 990 90-52 90 52Zm1400 0-90-52-90 52Z" fill="${primary}"/>`
    ];
    return designs[Number(template.design)-1]||designs[0];
  }

  function renderCertificate(cert, templateId, samplePreview, trophyImageHref) {
    const selectedTemplateId=certificateTemplateId(cert,templateId);
    const template=certificateTemplate(selectedTemplateId);
    return `<article class="certificate" data-family="${template.family}" data-design="${template.design}" style="--cert-primary:${template.primary};--cert-accent:${template.accent};padding:0;border:0;background:transparent">${svgCertificate(cert,selectedTemplateId,trophyImageHref,samplePreview)}</article>`;
  }

  async function openCertificatePreview(cert) {
    let trophyImageData;
    try { trophyImageData=await certificateTrophyImageData(); }
    catch(error) { toast("The certificate preview could not be created: "+error.message,true); return; }
    modal("Certificate preview", `<div class="certificate-preview">${renderCertificate(cert,undefined,false,trophyImageData)}</div><div class="certificate-preview-actions"><button class="button button-dark" data-action="print-single-cert" data-id="${escapeHtml(cert.id)}">Print / Save as PDF</button><button class="button button-light" data-action="save-cert-image" data-id="${escapeHtml(cert.id)}">Save as PNG</button></div>`);
    $("#modalRoot .modal-backdrop").classList.add("certificate-backdrop");
    $("#modalRoot .modal").classList.add("certificate-modal");
  }

  async function openCertificateTemplatePreview(templateId) {
    const house=houses()[0], category=records("categories")[0], event=records("events")[0], position=records("positions")[0];
    const sample={athleteName:"Alex Morgan",houseId:house?house.id:"sample-house",categoryId:category?category.id:"sample-category",eventId:event?event.id:"sample-event",position:position?position.value:1};
    let trophyImageData;
    try { trophyImageData=await certificateTrophyImageData(); }
    catch(error) { toast("The certificate preview could not be created: "+error.message,true); return; }
    modal("Certificate design preview", `<div class="certificate-preview">${renderCertificate(sample,templateId,true,trophyImageData)}</div>`);
    $("#modalRoot .modal-backdrop").classList.add("certificate-backdrop");
    $("#modalRoot .modal").classList.add("certificate-modal");
  }

  function certificateVerificationUrl(certificateNumber) {
    let url;
    try {
      url=new URL(window.APP_CONFIG&&window.APP_CONFIG.apiUrl);
    } catch(error) {
      throw new Error("Set a valid HTTPS Apps Script URL in config.js to create a scannable certificate link.");
    }
    if(url.protocol!=="https:")throw new Error("Certificate verification links require an HTTPS Apps Script URL.");
    url.searchParams.set("certificate",String(certificateNumber));
    return url.toString();
  }

  function svgCertificate(cert, templateId, trophyImageHref, samplePreview) {
    const school=schoolSettings(), template=certificateTemplate(certificateTemplateId(cert,templateId));
    const house=houses().find(item=>String(item.id)===String(cert.houseId));
    const category=records("categories").find(item=>String(item.id)===String(cert.categoryId));
    const event=records("events").find(item=>String(item.id)===String(cert.eventId));
    const awardHouse=house||(samplePreview?{name:"Blue House"}:null);
    const awardCategory=category||(samplePreview?{value:"Infant Boys"}:null);
    const awardEvent=event||(samplePreview?{value:"100 m Sprint"}:null);
    const certificateNumber=samplePreview?"FH-2025-SAMPLE":(cert.certificateNumber||makeCertificateNumber(cert.id,cert.createdAt));
    const medalColors={1:"#c59624",2:"#87939b",3:"#a86432",4:"#3d7fa6",5:"#4d8c62",6:"#7653a3",7:"#bc6d35",8:"#a74362",9:"#328c91",10:"#586b7a"};
    const awardColor=medalColors[Number(cert.position)]||template.primary;
    const text=value=>escapeHtml(value||"");
    const line=(value,x,y,size,color,weight,width)=> {
      const content=String(value==null?"":value).replace(/\s+/g," ").trim();
      const fitSize=Math.min(size,width/(Math.max(1,Array.from(content).length)*.58));
      return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fitSize}" font-weight="${weight||400}" fill="${color}">${text(content)}</text>`;
    };
    const headerColor="#15231d";
    const addressColor="#34453d";
    const logoImage=school.logo?`<image href="${text(school.logo)}" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>`:"";
    const logoFallback=(x)=>`<text x="${x}" y="136" text-anchor="middle" font-family="Arial,sans-serif" font-size="58" font-weight="700" fill="${template.primary}">${text((school.schoolName||"S").charAt(0).toUpperCase())}</text>`;
    const leftLogo=school.logo?logoImage.replace('width="100"','x="110" width="100"').replace('height="100"','y="62" height="100"'):logoFallback(160);
    const rightLogo=school.logo?logoImage.replace('width="100"','x="1190" width="100"').replace('height="100"','y="62" height="100"'):logoFallback(1240);
    const trophy=`<image href="${text(trophyImageHref)}" x="105" y="345" width="280" height="410" preserveAspectRatio="xMidYMid meet"/>`;
    const logoWatermark=school.logo?`<image href="${text(school.logo)}" x="500" y="285" width="400" height="400" opacity=".075" preserveAspectRatio="xMidYMid meet"/>`:"";
    const frame=template.family==="heritage"
      ? `<rect x="28" y="28" width="1344" height="934" fill="none" stroke="${template.primary}" stroke-width="14"/>`
      : template.family==="classic"
        ? `<rect x="30" y="30" width="1340" height="930" rx="24" fill="none" stroke="${template.primary}" stroke-width="9"/>`
        : template.family==="modern"
          ? `<rect x="28" y="28" width="1344" height="934" fill="none" stroke="${template.primary}" stroke-width="5"/>`
          : `<rect x="28" y="28" width="1344" height="934" rx="10" fill="none" stroke="${template.primary}" stroke-width="8"/>`;
    const detail=(label,value,x,valueColor)=>{
      const valueSize=Math.min(24,235/(Math.max(1,Array.from(String(value||"")).length)*.62));
      return `<text x="${x}" y="635" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="1" fill="#24332b">${text(label)}</text><text x="${x}" y="675" text-anchor="middle" font-family="Arial,sans-serif" font-size="${valueSize}" font-weight="700" fill="${valueColor||template.primary}">${text(value)}</text>`;
    };
    const awardDate=cert.createdAt?new Date(cert.createdAt):new Date();
    const footerDate=awardDate.toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});
    let qrMarkup;
    try {
      const verificationUrl=certificateVerificationUrl(certificateNumber);
      qrMarkup=window.FieldhouseQR.toSvg(verificationUrl,1185,725,150);
    } catch(error) {
      console.error("This certificate's verification QR code could not be created.",error);
      qrMarkup=`<g aria-label="Certificate QR code unavailable"><rect x="1185" y="725" width="150" height="150" fill="#fff" stroke="#ad3030" stroke-width="3"/><text x="1260" y="790" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#ad3030">QR LINK</text><text x="1260" y="812" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#ad3030">UNAVAILABLE</text></g>`;
    }
    const sealName=school.schoolName||"Amazing Grace Digital";
    const sealLabel=sealName.length>28?sealName.slice(0,27)+"…":sealName;
    const sealYear=awardDate.getFullYear();
    return `<svg class="certificate-artwork" xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990" role="img" aria-label="Certificate for ${text(cert.athleteName)}">
      <defs><linearGradient id="certificate-paper" x2="1" y2="1"><stop stop-color="#fffefa"/><stop offset=".58" stop-color="#fffdf7"/><stop offset="1" stop-color="#fffaf0"/></linearGradient></defs>
      <rect width="1400" height="990" fill="url(#certificate-paper)"/>
      ${certificateArtwork(template)}${frame}${logoWatermark}${leftLogo}${rightLogo}
      ${line(school.schoolName||"School Name",700,105,38,headerColor,700,900)}
      ${line(school.motto||"",700,145,21,template.primary,700,900)}
      ${line(school.address||"",700,180,17,addressColor,600,900)}
      ${line("SPORTS ACHIEVEMENT",880,275,19,template.accent,700,820)}
      ${line(school.meetTitle||"1st Annual Inter-Athlete Sports Meet",880,318,30,template.primary,700,820)}
      ${trophy}
      <text x="880" y="415" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#24332b">THIS CERTIFICATE IS PROUDLY PRESENTED TO</text>
      ${line(cert.athleteName,880,490,58,template.primary,700,790)}
      ${line("In recognition of outstanding effort, sportsmanship, and achievement.",880,550,21,"#24332b",600,780)}
      <rect x="470" y="590" width="815" height="128" rx="14" fill="#eff4ee"/>
      ${detail("EVENT",awardEvent?awardEvent.value:"—",570)}
      ${detail("CATEGORY",awardCategory?awardCategory.value:"—",780)}
      ${detail("POSITION",ordinal(cert.position)+" place",990,awardColor)}
      ${detail("HOUSE",awardHouse?awardHouse.name:"—",1200)}
      <g aria-label="${text(sealName)} school seal for ${sealYear}">
        <circle cx="700" cy="820" r="67" fill="#fffdf8" fill-opacity=".92" stroke="${template.primary}" stroke-width="3"/>
        <circle cx="700" cy="820" r="58" fill="none" stroke="${template.accent}" stroke-width="2"/>
        <path id="school-seal-arc-${text(cert.id||"sample")}" d="M644 815 A56 56 0 0 1 756 815" fill="none"/>
        <text font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="${template.primary}"><textPath href="#school-seal-arc-${text(cert.id||"sample")}" startOffset="50%" text-anchor="middle">${text(sealLabel)}</textPath></text>
        <text x="700" y="823" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="${template.primary}">OFFICIAL SEAL</text>
        <text x="700" y="842" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="${template.primary}">${sealYear}</text>
      </g>
      <text x="1260" y="714" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" letter-spacing="2" fill="#a32020">${text(certificateNumber)}</text>
      ${qrMarkup}
      <text x="145" y="895" text-anchor="start" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#24332b">${text(footerDate)}</text>
      <text x="1255" y="895" text-anchor="end" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#24332b">School Authority</text>
    </svg>`;
  }

  async function saveCertificateImage(cert) {
    let svgUrl;
    try {
      const trophyImageData=await certificateTrophyImageData();
      svgUrl=URL.createObjectURL(new Blob([svgCertificate(cert,undefined,trophyImageData)],{type:"image/svg+xml;charset=utf-8"}));
    } catch(error) {
      toast("The certificate image could not be created: "+error.message,true);
      return;
    }
    const image=new Image();
    image.onerror=()=>{URL.revokeObjectURL(svgUrl);toast("The certificate image could not be created.",true);};
    image.onload=()=>{
      const canvas=document.createElement("canvas");
      canvas.width=1400;canvas.height=990;
      const context=canvas.getContext("2d");
      if(!context){URL.revokeObjectURL(svgUrl);toast("This browser cannot create certificate images.",true);return;}
      context.drawImage(image,0,0,canvas.width,canvas.height);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob(blob=>{
        if(!blob){toast("The certificate image could not be saved.",true);return;}
        const link=document.createElement("a");
        link.href=URL.createObjectURL(blob);
        link.download=(cert.athleteName||"certificate").trim().replace(/[^\w-]+/g,"-")+".png";
        link.click();
        setTimeout(()=>URL.revokeObjectURL(link.href),1000);
        toast("Certificate image saved.");
      },"image/png");
    };
    image.src=svgUrl;
  }

  let printAfterHandler = null;
  function printCandidates(printType,scope) {
    const history=records("printHistory");
    return records("certificates").filter(cert=>{
      if(scope!=="all"&&String(cert.houseId)!==String(scope))return false;
      return !history.some(item=>String(item.certificateId)===String(cert.id)&&item.printType===printType&&String(item.scope)===String(scope));
    });
  }

  async function printCertificateBatch(certs,printType,scope) {
    if(!certs.length){toast("No unprinted records match this selection.",true);return;}
    let trophyImageData;
    if(printType==="certificate"){
      try { trophyImageData=await certificateTrophyImageData(); }
      catch(error) {
        toast("The certificate could not be printed: "+error.message,true);
        return;
      }
    }
    if(printAfterHandler)window.removeEventListener("afterprint",printAfterHandler);
    printAfterHandler=async()=>{
      printAfterHandler=null;
      const printStage=$("#printStage");
      printStage.hidden=true;
      printStage.innerHTML="";
      const label=printType==="list"?"certificate list":"certificate(s)";
      if(!window.confirm("Did the "+label+" print or save successfully?")){
        toast("Print history was not changed.");
        return;
      }
      let result;
      try{
        result=await api("recordPrintBatch",{certificateIds:certs.map(cert=>cert.id),printType:printType,scope:scope});
      }catch(error){
        toast("The print completed, but print history could not be saved: "+error.message,true);
        return;
      }
      try{await loadData();}
      catch(error){
        toast("Print history was saved, but the display could not be refreshed: "+error.message,true);
        return;
      }
      toast((result.recordedIds||[]).length+" "+label+" marked as printed.");
    };
    window.addEventListener("afterprint",printAfterHandler,{once:true});

    const school=schoolSettings();
    let body;
    if(printType==="list"){
      const logo=school.logo?`<img class="list-logo" src="${escapeHtml(school.logo)}" alt="">`:"";
      const categoryMap=Object.fromEntries(records("categories").map(item=>[item.id,item.value]));
      const eventMap=Object.fromEntries(records("events").map(item=>[item.id,item.value]));
      body=`<header class="list-heading">${logo}<div><h1>${escapeHtml(school.schoolName||"School")}</h1><p>${escapeHtml(school.motto||"")}</p><p>${escapeHtml(school.address||"")}</p><h2>Certificate Recipient List</h2><p>${escapeHtml(school.meetTitle||"1st Annual Inter-Athlete Sports Meet")}</p></div></header><table class="recipient-list"><thead><tr><th>ATHLETE</th><th>HOUSE</th><th>CATEGORY</th><th>EVENT</th><th>POSITION</th></tr></thead><tbody>${certs.map(cert=>{const house=houses().find(item=>String(item.id)===String(cert.houseId));return `<tr><td>${escapeHtml(cert.athleteName)}</td><td>${escapeHtml(house?house.name:"—")}</td><td>${escapeHtml(categoryMap[cert.categoryId]||"—")}</td><td>${escapeHtml(eventMap[cert.eventId]||"—")}</td><td>${escapeHtml(ordinal(cert.position)+" place")}</td></tr>`;}).join("")}</tbody></table>`;
      body=`<section class="print-list-page">${body}</section>`;
    }else{
      const pages=[];
      for(let index=0;index<certs.length;index++){
        pages.push(`<section class="print-page">${renderCertificate(certs[index],undefined,false,trophyImageData)}</section>`);
      }
      body=pages.join("");
    }
    const printStage=$("#printStage");
    printStage.innerHTML=`<div class="print-stage-content">${body}</div>`;
    printStage.hidden=false;
    const images=Array.from(printStage.querySelectorAll("img"));
    try {
      await Promise.all(images.map(image=>image.decode?image.decode():new Promise((resolve,reject)=>{
        if(image.complete&&image.naturalWidth){resolve();return;}
        image.onload=resolve;
        image.onerror=()=>reject(new Error("A school logo could not be loaded for printing."));
      })));
    } catch(error) {
      printStage.hidden=true;
      printStage.innerHTML="";
      window.removeEventListener("afterprint",printAfterHandler);
      printAfterHandler=null;
      toast(error.message,true);
      return;
    }
    requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));
  }

  function renderPage() {
    if (!state.user) return;
    const views = {home:renderHome,points:renderPoints,results:renderResults,liveScore:renderLiveScore,certificates:renderCertificates,about:renderAboutPage,admin:renderAdmin};
    $("#pageContent").innerHTML = (views[state.page] || renderHome)();
    if (state.page === "certificates") filterCertificates();
  }

  function modal(title, content) {
    $("#modalRoot").innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="modal-header"><h3>${escapeHtml(title)}</h3><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body">${content}</div></section></div>`;
  }
  function openAboutDialog() {
    modal("About Amazing Grace Digital",renderAboutContent());
    $("#modalRoot .modal").classList.add("about-modal");
  }
  let pendingConfirmation = null;
  function confirmDialog(title,message,onConfirm,confirmLabel) {
    pendingConfirmation=onConfirm;
    modal(title,`<p id="confirmationMessage" class="confirmation-message">${escapeHtml(message)}</p><div class="modal-footer"><button type="button" class="button button-light" data-action="close-modal">No</button><button type="button" class="button button-danger" data-action="confirm-pending">${escapeHtml(confirmLabel||"Yes, delete")}</button></div>`);
    const dialog=$("#modalRoot .modal");
    dialog.setAttribute("role","alertdialog");
    dialog.setAttribute("aria-describedby","confirmationMessage");
    $("#modalRoot [data-action='close-modal']").focus();
  }
  function closeModal() { pendingConfirmation=null; $("#modalRoot").innerHTML = ""; }
  function modalFooter(label) { return `<div class="modal-footer"><button type="button" class="button button-light" data-action="close-modal">Cancel</button><button type="submit" class="button button-dark">${escapeHtml(label)}</button></div>`; }
  function openHouseForm(house) {
    const houseIndex = house ? houses().findIndex(item=>item.id===house.id) : -1;
    const savedColor = house && /^#[0-9a-f]{6}$/i.test(String(house.color || "")) ? house.color : "";
    const rows = house ? [Object.assign({},house,{color:savedColor||colorForHouseName(house.name)||houseColor(house,houseIndex)})] : Array.from({length:4},(_,index)=>({name:"",description:"",color:colors[(houses().length+index)%colors.length]}));
    modal(house ? "Edit house" : "Add houses", `<form id="houseForm" class="modal-form" data-id="${house?escapeHtml(house.id):""}"><div class="notice">Add up to 10 houses. Each house needs a name; a description is optional. Choose a color for the live scoreboard.</div><div id="houseFields" class="field-list">${rows.map(item=>houseField(item,!house)).join("")}</div>${!house?`<button type="button" class="button button-light" id="addHouseField">＋ Add another house</button>`:""}${modalFooter(house?"Save changes":"Save houses")}</form>`);
  }
  function houseField(item, removable) {
    return `<div class="dynamic-row house-field"><label style="flex:1">House name<input name="houseName" value="${escapeHtml(item.name)}" maxlength="60" placeholder="e.g. Green House"></label><label style="flex:1">Description<input name="houseDescription" value="${escapeHtml(item.description||"")}" maxlength="160" placeholder="A short description (optional)"></label><label class="house-color-field">Color<input name="houseColor" type="color" value="${escapeHtml(item.color||colors[0])}" aria-label="House color"></label>${removable?`<button type="button" class="remove-field" data-action="remove-house-field" aria-label="Remove house">×</button>`:""}</div>`;
  }
  function openOptionsForm(kind) {
    const title={categories:"Categories",events:"Events",points:"Points",positions:"Positions"}[kind];
    const numeric=kind==="points"||kind==="positions";
    const guidance=kind==="events"?"Event names can use letters, numbers, or both, such as 200M, 200 M, or 200 Meters.":kind==="positions"?"Position values must be positive whole numbers.":kind==="points"?"Point values must be whole numbers.":"";
    modal("Add "+title.toLowerCase(), `<form id="optionForm" class="modal-form" data-kind="${kind}"><div class="notice">Enter one or more ${title.toLowerCase()}. Save anytime; open this form again to add more. ${guidance}</div><div class="field-list" id="optionFields">${Array.from({length:10},()=>optionField(kind,numeric)).join("")}</div>${modalFooter("Save "+title.toLowerCase())}</form>`);
  }
  function optionField(kind,numeric) {
    const label={categories:"Category name",events:"Event name",points:"Points",positions:"Position"}[kind];
    const placeholder=kind==="events"?"e.g. 200M, 200 M, or 200 Meters":numeric?"Enter a number":"Enter "+label.toLowerCase();
    return `<label class="option-field">${label}<input name="optionValue" ${numeric?'type="number" step="1" min="1"':'type="text" maxlength="80"'} placeholder="${placeholder}"></label>`;
  }
  function openScoreForm() {
    const categories=records("categories"), events=records("events");
    if (!categories.length || !events.length || !houses().length || !allPoints().length) {
      toast("Add at least one category, event, house, and point value in Admin control panel first.", true); return;
    }
    const options=list=>list.map(item=>`<option value="${escapeHtml(item.id)}">${escapeHtml(item.value)}</option>`).join("");
    const pointOptions=records("points").map(item=>`<option value="${escapeHtml(item.value)}">${escapeHtml(item.value)} points</option>`).join("");
    modal("Award event points", `<form id="scoreForm" class="modal-form"><label>Category<select name="categoryId" required><option value="">Select category</option>${options(categories)}</select></label><label>Event<select name="eventId" required><option value="">Select event</option>${options(events)}</select></label><div class="notice">Choose a point value for each house. A house marked Awarded 0 can receive zero points. Non-zero point values must be unique between houses.</div><div>${houses().map((house,index)=>`<div class="points-entry" data-house-entry="${escapeHtml(house.id)}"><div><b><i class="house-dot" style="--dot:${houseColor(house,index)}"></i> ${escapeHtml(house.name)}</b><small>${escapeHtml(house.description||"")}</small></div><select name="point-${escapeHtml(house.id)}"><option value="">Select points</option>${pointOptions}</select><label><input type="checkbox" name="zero-${escapeHtml(house.id)}"> Awarded 0</label></div>`).join("")}</div>${modalFooter("Save points")}</form>`);
  }
  function openPointsForm() { openScoreForm(); }
  function openProfileForm() {
    const image = state.user.profileImage || "";
    const initial = (state.user.fullName || state.user.username || "U").charAt(0).toUpperCase();
    modal("Edit profile", `<form id="profileForm" class="modal-form">
      <div class="profile-edit-heading"><div><img id="profilePreview" class="profile-preview" alt="Profile picture preview" ${image?`src="${escapeHtml(image)}"`:"hidden"}><span id="profilePreviewFallback" class="avatar profile-preview-fallback" ${image?"hidden":""}>${escapeHtml(initial)}</span></div><div><b>${escapeHtml(state.user.fullName)}</b><small class="profile-role">${escapeHtml(state.user.role)}</small></div></div>
      <label>Username<input name="username" required maxlength="50" autocomplete="username" value="${escapeHtml(state.user.username)}"></label>
      <label>Current password<input name="currentPassword" type="password" required autocomplete="current-password" placeholder="Required to save profile changes"></label>
      <label>New password (leave blank to keep current password)<input name="newPassword" type="password" minlength="8" autocomplete="new-password" placeholder="At least 8 characters"></label>
      <label>Confirm new password<input name="confirmPassword" type="password" minlength="8" autocomplete="new-password" placeholder="Repeat new password"></label>
      <label>Profile picture<input name="profilePicture" type="file" accept="image/*"></label>
      <small class="profile-image-help">Images up to 40 MP and 20 MB are centered and optimized automatically.</small>
      <label class="profile-remove-option"><input name="removeProfilePicture" type="checkbox" ${image?"":"disabled"}> Remove current profile picture</label>
      ${modalFooter("Save profile")}
    </form>`);
  }
  function openCertificateForm(cert) {
    const categories=records("categories"), events=records("events"), positions=records("positions");
    if (!categories.length || !events.length || !houses().length || !positions.length) {
      toast("Add at least one category, event, house, and position in Admin control panel first.", true); return;
    }
    const selectOptions=(items,value)=>items.map(item=>`<option value="${escapeHtml(item.id)}" ${item.id===value?"selected":""}>${escapeHtml(item.value)}</option>`).join("");
    const positionOptions=positions.map(item=>`<option value="${escapeHtml(item.value)}" ${Number(item.value)===Number(cert&&cert.position)?"selected":""}>${ordinal(item.value)}</option>`).join("");
    const row=cert||{athleteName:"",houseId:"",position:""};
    modal(cert?"Edit certificate":"Add certificates", `<form id="certificateForm" class="modal-form" data-edit-id="${cert?escapeHtml(cert.id):""}"><div class="form-row"><label>Category<select name="categoryId" required><option value="">Select category</option>${selectOptions(categories,cert&&cert.categoryId)}</select></label><label>Event<select name="eventId" required><option value="">Select event</option>${selectOptions(events,cert&&cert.eventId)}</select></label></div><div class="notice">Category and event are shared by all athletes entered in this form.</div><div id="athleteFields" class="field-list">${cert?athleteField(row,true):athleteField(row,false)+athleteField(row,false)}</div>${!cert?`<button type="button" class="button button-light" id="addAthleteField">＋ Add another athlete</button>`:""}${modalFooter(cert?"Save changes":"Save certificates")}</form>`);
    $("#certificateForm").dataset.positionOptions=positionOptions;
  }
  function athleteField(row, editing) {
    const cat=records("categories"), evt=records("events");
    const positions=records("positions").map(item=>`<option value="${escapeHtml(item.value)}" ${Number(item.value)===Number(row.position)?"selected":""}>${ordinal(item.value)}</option>`).join("");
    return `<div class="athlete-row" style="padding:12px;border:1px solid var(--line);border-radius:8px;display:grid;gap:12px"><div class="form-row"><label>Athlete name<input name="athleteName" required maxlength="100" value="${escapeHtml(row.athleteName)}" placeholder="Full name"></label><label>House<select name="houseId" required><option value="">Select house</option>${houses().map(h=>`<option value="${escapeHtml(h.id)}" ${h.id===row.houseId?"selected":""}>${escapeHtml(h.name)}</option>`).join("")}</select></label></div><div class="form-row"><label>Position<select name="position" required><option value="">Select position</option>${positions}</select></label>${editing?"":`<div style="display:flex;align-items:end;justify-content:flex-end"><button type="button" class="remove-field" data-action="remove-athlete-field">Remove</button></div>`}</div></div>`;
  }

  function filterCertificates() {
    if (!$("#certificateRows")) return;
    const query=($("#certSearch").value||"").toLowerCase(), house=$("#certHouseFilter").value||"all", category=$("#certCategoryFilter").value;
    $$("tr[data-athlete]",$("#certificateRows")).forEach(row=>{row.hidden=!(row.dataset.athlete.includes(query)&&(house==="all"||row.dataset.house===house)&&(!category||row.dataset.category===category));});
  }
  function updateCertificateHouseButtons(houseId) {
    $$("[data-cert-house]").forEach(button=>{
      const active=button.dataset.certHouse===houseId;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }
  function setCertificateHouseFilter(houseId) {
    const filter=$("#certHouseFilter");
    if(!filter)return;
    filter.value=houseId;
    updateCertificateHouseButtons(houseId);
    filterCertificates();
  }
  async function perform(action, payload, success, button) {
    const restoreButton = showButtonProgress(button, "Saving...");
    try {
      await api(action,payload);
      closeModal();
      toast(success);
      try { await loadData(); }
      catch(error) { toast(success+" Data refresh failed: "+error.message,true); }
    }
    catch(error) { toast(error.message,true); }
    finally { restoreButton(); }
  }

  async function closeSystemForEveryone() {
    try {
      await api("setSystemClosed",{closed:true});
      showSystemClosed();
    } catch(error) {
      if (!error.systemClosed) toast("The system could not be turned off: " + error.message,true);
    }
  }

  document.addEventListener("click", async event => {
    const houseFilterButton=event.target.closest("[data-cert-house]");
    if(houseFilterButton){setCertificateHouseFilter(houseFilterButton.dataset.certHouse);return;}
    const nav=event.target.closest("[data-page]");
    if(nav){event.preventDefault();goTo(nav.dataset.page);if(window.matchMedia("(max-width: 720px)").matches)setNavigationOpen(false);return;}
    const tab=event.target.closest("[data-auth]");
    if(tab){setAuthTab(tab.dataset.auth);return;}
    const buttonEl=event.target.closest("[data-action]");
    if(!buttonEl)return;
    const action=buttonEl.dataset.action,idValue=buttonEl.dataset.id,kind=buttonEl.dataset.kind;
    if(action==="show-admin-unlock"){
      const form=$("#masterAdminUnlockForm");
      form.hidden=false;
      form.elements.username.focus();
      return;
    }
    if(action==="close-system"){
      confirmDialog("Turn the system off for everyone?","Every user, including you, will be signed out and shown the system-closed page. An approved Master Admin must enter their username and password there to turn it on again.",closeSystemForEveryone,"Turn system off");
      return;
    }
    if(action==="install-app"){await installApp();return;}
    if(action==="dismiss-install-prompt"){
      localStorage.setItem("fieldhouse.pwaPromptDismissed","true");
      updateInstallUi();
      return;
    }
    if(action==="open-about"){openAboutDialog();return;}
    if(action==="confirm-pending"){
      const callback=pendingConfirmation;
      closeModal();
      if(callback)callback();
      return;
    }
    if(action==="close-modal"||(action==="backdrop-close"&&event.target===buttonEl)){closeModal();return;}
    if(action==="add-houses"){openHouseForm();return;}
    if(action==="add-categories"||action==="add-events"||action==="add-point-values"||action==="add-positions"){openOptionsForm(action==="add-point-values"?"points":action.slice(4));return;}
    if(action==="add-points"&&state.page==="points"){openPointsForm();return;}
    if(action==="add-cert"){openCertificateForm();return;}
    if(action==="preview-certificate-template"){
      const templateSelect=$("#schoolSettingsForm [name='templateId']");
      if(templateSelect)openCertificateTemplatePreview(Number(templateSelect.value));
      return;
    }
    if(action==="open-profile"){openProfileForm();return;}
    if(action==="edit-house"){openHouseForm(houses().find(item=>item.id===idValue));return;}
    if(action==="edit-cert"){openCertificateForm(records("certificates").find(item=>item.id===idValue));return;}
    if(action==="view-cert"){const cert=records("certificates").find(item=>String(item.id)===String(idValue));if(cert)openCertificatePreview(cert);return;}
    if(action==="print-single-cert"){
      const cert=records("certificates").find(item=>String(item.id)===String(idValue));
      if(cert&&printCandidates("certificate",String(cert.houseId)).some(item=>String(item.id)===String(cert.id)))printCertificateBatch([cert],"certificate",String(cert.houseId));
      else if(cert)toast("This certificate was already printed for its house.",true);
      return;
    }
    if(action==="save-cert-image"){const cert=records("certificates").find(item=>String(item.id)===String(idValue));if(cert)saveCertificateImage(cert);return;}
    if(action==="print-certificates"||action==="print-certificate-list"){
      const scope=$("#certHouseFilter").value||"all", printType=action==="print-certificates"?"certificate":"list";
      printCertificateBatch(printCandidates(printType,scope),printType,scope);
      return;
    }
    if(action==="clear-school-info"){
      confirmDialog("Clear school identity?","This will remove the school name, motto, address, and logo from the workspace and certificates.",()=>perform("clearSchoolInfo",{},"School identity cleared.",buttonEl),"Yes, clear");
      return;
    }
    if(action==="clear-certificates"){
      confirmDialog("Delete all certificates?","This permanently deletes every certificate and its print history.",()=>perform("clearCertificates",{},"All certificate records deleted.",buttonEl));
      return;
    }
    if(action==="reset-print-history"){
      confirmDialog("Reset print history?","Previously printed certificates and lists will become available to print again.",()=>perform("resetPrintHistory",{},"Print history reset.",buttonEl),"Yes, reset");
      return;
    }
    if(action==="remove-house-field"){buttonEl.closest(".house-field").remove();return;}
    if(action==="remove-athlete-field"){buttonEl.closest(".athlete-row").remove();return;}
    if(action==="approve-user"||action==="deny-user"){perform("setUserStatus",{userId:idValue,status:action==="approve-user"?"Approved":"Denied"},action==="approve-user"?"User approved.":"User denied.",buttonEl);return;}
    if(action==="delete-user"){
      confirmDialog("Delete user account?","This permanently deletes the selected user account.",()=>perform("deleteUser",{userId:idValue},"User deleted.",buttonEl));
      return;
    }
    if(action==="delete-house"){
      confirmDialog("Delete this house?","This removes the house. Existing scores for it will no longer count toward totals.",()=>perform("deleteHouse",{houseId:idValue},"House deleted.",buttonEl));
      return;
    }
    if(action==="delete-option"){
      confirmDialog("Delete this item?","This permanently deletes the selected setup item.",()=>perform("deleteOption",{kind:kind,itemId:idValue},"Item deleted.",buttonEl));
      return;
    }
    if(action==="clear-score-entries"){
      confirmDialog("Delete all score records?","This permanently deletes every recorded point and score entry.",()=>perform("clearScoreEntries",{},"All scoring records deleted.",buttonEl));
      return;
    }
    if(action.startsWith("clear-")) {
      const clearKind=action.slice(6);
      confirmDialog("Delete all "+clearKind+"?","This permanently deletes all saved "+clearKind+".",()=>perform("clearOptions",{kind:clearKind},"All "+clearKind+" deleted.",buttonEl));
      return;
    }
    if(action==="delete-cert"){
      confirmDialog("Delete this certificate?","This permanently deletes the selected certificate record.",()=>perform("deleteCertificate",{certificateId:idValue},"Certificate deleted.",buttonEl));
      return;
    }
  });

  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&pendingConfirmation)closeModal();
  });

  document.addEventListener("submit", async event => {
    event.preventDefault();
    const form=event.target;
    const submitButton=event.submitter||$("button[type='submit']",form);
    if(form.id==="masterAdminUnlockForm"){
      const values=Object.fromEntries(new FormData(form).entries());
      const restoreButton=showButtonProgress(submitButton,"Checking credentials...");
      try{
        const result=await api("unlockSystem",values);
        if(!result.user||result.user.role!==ROLE_ADMIN||!result.token)throw new Error("An approved Master Admin account is required.");
        form.reset();
        setAuthenticated(result.user,result.token);
        toast("System reopened. You are signed in as Master Admin.");
      }catch(error){toast(error.message,true);}
      finally{restoreButton();}
      return;
    }
    if(form.id==="loginForm"){
      const values=Object.fromEntries(new FormData(form).entries());
      const restoreButton=showButtonProgress(submitButton,"Signing in...");
      try {const result=await api("login",values);if(result.user.status!=="Approved")throw new Error(result.user.status==="Denied"?"Your account has been denied. Contact an administrator.":"Your account is awaiting administrator approval.");setAuthenticated(result.user,result.token);toast("Signed in successfully.");}
      catch(error){toast(error.message,true);}
      finally{restoreButton();}
    }
    if(form.id==="schoolSettingsForm"){
      const fields=form.elements, file=fields.schoolLogo.files[0];
      const payload={
        schoolName:fields.schoolName.value.trim(),
        motto:fields.motto.value.trim(),
        address:fields.address.value.trim(),
        meetTitle:fields.meetTitle.value.trim(),
        templateId:fields.templateId.value,
        certificatesPerPage:fields.certificatesPerPage.value,
        logo:schoolSettings().logo||""
      };
      const restoreButton=showButtonProgress(submitButton,"Saving school settings...");
      try{
        if(file)payload.logo=await resizeAndCompressImage(file);
        else if(fields.removeSchoolLogo.checked)payload.logo="";
        await api("saveSchoolSettings",payload);
        await loadData();
        toast("School settings saved.");
      }catch(error){toast(error.message,true);}
      finally{restoreButton();}
    }
    if(form.id==="registerForm"){
      const values=Object.fromEntries(new FormData(form).entries());
      if(values.password!==values.confirmPassword){toast("Passwords do not match.",true);return;}
      const restoreButton=showButtonProgress(submitButton,"Creating account...");
      try {
        const result=await api("register",values);
        form.reset();
        setAuthTab("login");
        if(result.status==="Approved"){
          $("#loginForm").elements.role.value=result.role;
          toast("Registration successful. Your first account is an approved Master Admin; sign in to continue.");
        }else{
          toast("Registration submitted successfully. An administrator must approve your account.");
        }
      }
      catch(error){toast(error.message,true);}
      finally{restoreButton();}
    }
    if(form.id==="profileForm"){
      const newPassword=form.elements.newPassword.value;
      if(newPassword!==form.elements.confirmPassword.value){toast("The new passwords do not match.",true);return;}
      const pictureInput=form.elements.profilePicture;
      const file=pictureInput.files[0];
      const restoreButton=showButtonProgress(submitButton,"Updating profile...");
      try {
        const payload={username:form.elements.username.value.trim(),currentPassword:form.elements.currentPassword.value,newPassword:newPassword};
        if(file) payload.profileImage=pictureInput.dataset.resizedImage||await resizeAndCompressImage(file);
        else if(form.elements.removeProfilePicture.checked) payload.profileImage="";
        const result=await api("updateProfile",payload);
        state.user=result.user;
        localStorage.setItem("fieldhouse.user",JSON.stringify(state.user));
        updateProfileDisplay();
        closeModal();
        toast("Profile updated successfully.");
      }
      catch(error){toast(error.message,true);}
      finally{restoreButton();}
    }
    if(form.id==="houseForm"){
      const rows=$$(".house-field",form).map(row=>({name:row.querySelector('[name="houseName"]').value.trim(),description:row.querySelector('[name="houseDescription"]').value.trim(),color:row.querySelector('[name="houseColor"]').value}));
      if(rows.some(entry=>!entry.name&&entry.description)){toast("A description needs a house name.",true);return;}
      const entries=rows.filter(entry=>entry.name);
      if(!entries.length){toast("Enter at least one house name.",true);return;}
      if(entries.length>10){toast("You can add up to 10 houses at a time.",true);return;}
      if(form.dataset.id){perform("updateHouse",{houseId:form.dataset.id,...entries[0]},"House updated.",submitButton);}
      else{perform("addHouses",{houses:entries},"Houses saved.",submitButton);}
    }
    if(form.id==="optionForm"){
      const values=$$('[name="optionValue"]',form).map(input=>input.value.trim()).filter(Boolean);
      if(!values.length){toast("Enter at least one value to save.",true);return;}
      if(["points","positions"].includes(form.dataset.kind)&&values.some(value=>!Number.isInteger(Number(value))||Number(value)<1)){toast("Enter positive whole numbers only.",true);return;}
      perform("addOptions",{kind:form.dataset.kind,values:values},"Saved "+values.length+" item(s).",submitButton);
    }
    if(form.id==="scoreForm"){
      const values=new FormData(form), awards=[];
      let missing=false;
      houses().forEach(house=>{
        const zero=values.get("zero-"+house.id)==="on", selected=values.get("point-"+house.id);
        if(!zero&&!selected)missing=true;
        awards.push({houseId:house.id,points:zero?0:Number(selected||0),zero:zero});
      });
      if(missing){toast("Select a point value or Awarded 0 for every house.",true);return;}
      const nonzero=awards.filter(award=>award.points>0).map(award=>award.points);
      if(new Set(nonzero).size!==nonzero.length){toast("Each non-zero point value must be unique. Awarded 0 is the only allowed tie.",true);return;}
      perform("addScoreEntry",{categoryId:values.get("categoryId"),eventId:values.get("eventId"),awards:awards,createdBy:state.user.fullName},"Event points saved.",submitButton);
    }
    if(form.id==="certificateForm"){
      const athletes=$$(".athlete-row",form).map(row=>({athleteName:row.querySelector('[name="athleteName"]').value.trim(),houseId:row.querySelector('[name="houseId"]').value,position:Number(row.querySelector('[name="position"]').value)}));
      if(athletes.some(row=>!row.athleteName||!row.houseId||!row.position)){toast("Complete the athlete name, house, and position for every entry.",true);return;}
      if(form.dataset.editId){perform("updateCertificate",{certificateId:form.dataset.editId,categoryId:form.elements.categoryId.value,eventId:form.elements.eventId.value,...athletes[0]},"Certificate updated.",submitButton);}
      else{perform("addCertificates",{categoryId:form.elements.categoryId.value,eventId:form.elements.eventId.value,athletes:athletes},"Certificates saved.",submitButton);}
    }
  });

  document.addEventListener("input",event=>{
    if(event.target.id==="certSearch")filterCertificates();
    if(event.target.matches(".house-field [name='houseName']")){
      const color=colorForHouseName(event.target.value);
      if(color)event.target.closest(".house-field").querySelector("[name='houseColor']").value=color;
    }
    if(event.target.dataset.filter==="users"){
      const query=event.target.value.toLowerCase();
      const matched=records("users").filter(user=>[user.fullName,user.username,user.email,user.role,user.status].some(value=>String(value).toLowerCase().includes(query)));
      $("#usersBody").innerHTML=renderUserRows(matched);
    }
  });
  document.addEventListener("change",event=>{
    if(event.target.id==="certCategoryFilter")filterCertificates();
    if(event.target.id==="certHouseFilter"){updateCertificateHouseButtons(event.target.value);filterCertificates();}
    if(event.target.matches("#profileForm [name='profilePicture']")){
      const file=event.target.files[0];
      if(!file)return;
      const input=event.target;
      input.dataset.resizedImage="";
      resizeAndCompressImage(file).then(dataUrl=>{
        if(input.files[0]!==file)return;
        const preview=$("#profilePreview"), fallback=$("#profilePreviewFallback");
        if(!preview||!fallback)return;
        preview.src=dataUrl;
        preview.hidden=false;
        fallback.hidden=true;
        input.dataset.resizedImage=dataUrl;
        $("#profileForm").elements.removeProfilePicture.checked=false;
      }).catch(error=>{
        if(input.files[0]!==file)return;
        toast(error.message,true);
        input.value="";
      });
    }
    if(event.target.matches("#profileForm [name='removeProfilePicture']")){
      const preview=$("#profilePreview"), fallback=$("#profilePreviewFallback");
      if(event.target.checked){
        $("#profileForm").elements.profilePicture.value="";
        $("#profileForm").elements.profilePicture.dataset.resizedImage="";
        preview.hidden=true;
        fallback.hidden=false;
      }else if(state.user.profileImage){
        preview.src=state.user.profileImage;
        preview.hidden=false;
        fallback.hidden=true;
      }
    }
    if(event.target.matches("#schoolSettingsForm [name='schoolLogo']")){
      const file=event.target.files[0];
      if(!file)return;
      try{
        validateImageUpload(file);
      }catch(error){
        toast(error.message,true);
        event.target.value="";
        return;
      }
      const reader=new FileReader();
      reader.onerror=()=>toast("The selected school logo preview could not be loaded.",true);
      reader.onload=()=>{
        const preview=$("#schoolLogoPreview"), fallback=$("#schoolLogoFallback");
        preview.src=String(reader.result);
        preview.hidden=false;
        fallback.hidden=true;
        $("#schoolSettingsForm").elements.removeSchoolLogo.checked=false;
      };
      reader.readAsDataURL(file);
    }
    if(event.target.matches("#schoolSettingsForm [name='removeSchoolLogo']")){
      const preview=$("#schoolLogoPreview"),fallback=$("#schoolLogoFallback");
      if(event.target.checked){
        $("#schoolSettingsForm").elements.schoolLogo.value="";
        preview.hidden=true;
        fallback.hidden=false;
      }else if(schoolSettings().logo){
        preview.src=schoolSettings().logo;
        preview.hidden=false;
        fallback.hidden=true;
      }
    }
  });
  $("#logoutButton").addEventListener("click",logout);
  $("#refreshButton").addEventListener("click",async event=>{
    const restoreButton=showButtonProgress(event.currentTarget,"Refreshing...");
    try { await loadData(); toast("Data refreshed successfully."); }
    catch(error) { toast(error.message,true); }
    finally { restoreButton(); }
  });
  document.addEventListener("click",event=>{
    if(event.target.id==="addHouseField"){
      const container=$("#houseFields");
      if(container.children.length>=10){toast("You can add up to 10 houses.",true);return;}
      container.insertAdjacentHTML("beforeend",houseField({name:"",description:"",color:colors[(houses().length+container.children.length)%colors.length]},true));
      toast("House entry added.");
    }
    if(event.target.id==="addAthleteField"){
      $("#athleteFields").insertAdjacentHTML("beforeend",athleteField({athleteName:"",houseId:"",position:""},false));
      toast("Athlete entry added.");
    }
  });

  window.addEventListener("online",async()=>{
    await checkSystemAccess();
    if(!systemAccess.ready||!state.user)return;
    updateConnectionStatus("Reconnecting");
    try { await flushQueuedMutations(); if(!hasActiveEditor())await loadData({quiet:true}); }
    catch(error) { console.error("Automatic reconnect sync failed.",error); updateConnectionStatus("Sync pending"); }
  });
  window.addEventListener("offline",()=>{
    showSystemStatusUnavailable("Connect to the internet so the system can confirm whether it is open. Your saved changes remain on this device.");
  });
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden&&navigator.onLine){
      checkSystemAccess().then(()=>{
        if(!systemAccess.ready||!state.user)return;
        return flushQueuedMutations().then(()=>{if(!hasActiveEditor())return loadData({quiet:true});});
      }).catch(error=>console.error("Automatic background sync failed.",error));
    }
  });
  setInterval(()=>{if(!document.hidden)checkSystemAccess();},5000);
  let lastAutoRefresh=Date.now();
  setInterval(()=>{
    if(!systemAccess.ready||systemAccess.closed||!state.user||!navigator.onLine)return;
    flushQueuedMutations().then(()=>{
      const dashboardVisible=!$("#dashboardView").hidden;
      const liveScoreDue=dashboardVisible&&state.page==="liveScore";
      const refreshDue=Date.now()-lastAutoRefresh>=30000;
      if(dashboardVisible&&!hasActiveEditor()&&(liveScoreDue||refreshDue)){
        lastAutoRefresh=Date.now();
        loadData({quiet:true});
      }
    }).catch(error=>console.error("Automatic background sync failed.",error));
  },15000);

  checkSystemAccess();
})();
