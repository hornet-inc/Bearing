// === Firebase Setup & Login ===
const firebaseConfig = {
  apiKey: "AIzaSyA7hwpWxOsj4GxqvoO4OKrd525KiFyr6i8",
  authDomain: "mirai-1.firebaseapp.com",
  databaseURL: "https://mirai-1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mirai-1",
  storageBucket: "mirai-1.appspot.com",
  messagingSenderId: "333185207214",
  appId: "1:333185207214:web:xyz123"
};

firebase.initializeApp(firebaseConfig);
firebase.auth().signInWithEmailAndPassword("dashboardmaster@mirai.com", "MIRAI@2580");

// === Live Sensor Labels ===
const labels = [
  { label: "⚡ Voltage", path: "data/AC/voltage", suffix: "V" },
  { label: "🔌 Current", path: "data/AC/current", suffix: "A" },
  { label: "🔁 Frequency", path: "data/AC/frequency", suffix: "Hz" },
  { label: "🌀 Phase", path: "data/AC/phase", suffix: "°" },
  { label: "⚙️ Power Factor", path: "data/AC/pf", suffix: "%" },
  { label: "🎤 Amplitude", path: "data/Accoustic/amplitude", suffix: "dB" },
  { label: "🎧 Noise", path: "data/Accoustic/noise", suffix: "dB" },
  { label: "📳 Vibration", path: "data/Accoustic/vibration", suffix: "mm/s" },
  { label: "📐 Harmonics", path: "data/Accoustic/harmonics", suffix: "%" },
  { label: "🌈 Distortion", path: "data/Accoustic/distortion", suffix: "%" },
  { label: "📡 RF Gain", path: "data/RF/gain", suffix: "dB" },
  { label: "📶 SNR", path: "data/RF/snr", suffix: "dB" },
  { label: "📴 Signal Loss", path: "data/RF/loss", suffix: "dB" },
  { label: "📍 RF Current", path: "data/RF/rfc", suffix: "mA" },
  { label: "📏 Noise Margin", path: "data/RF/nm", suffix: "dB" },
  { label: "🔁 RPM", path: "data/Motor/rpm", suffix: "rpm" },
  { label: "💪 Torque", path: "data/Motor/torque", suffix: "Nm" },
  { label: "🌡️ Temp", path: "data/Motor/temp", suffix: "°C" },
  { label: "🧪 Winding R", path: "data/Motor/a", suffix: "Ω" },
  { label: "🔋 Stator V", path: "data/Motor/b", suffix: "V" },
  { label: "🔌 Rotor V", path: "data/Motor/c", suffix: "V" },
  { label: "🧲 Flux", path: "data/Motor/d", suffix: "Wb" },
  { label: "🧮 Impedance", path: "data/Motor/e", suffix: "Ω" },
  { label: "🔧 Efficiency", path: "data/Motor/e", suffix: "%" },
  { label: "📦 Load", path: "data/Motor/e", suffix: "%" },
  { label: "🧭 Yaw", path: "data/Gyro/yaw", suffix: "°/s" },
  { label: "🌀 Pitch", path: "data/Gyro/pitch", suffix: "°/s" },
  { label: "📐 Roll", path: "data/Gyro/roll", suffix: "°/s" },
  { label: "🪁 X-Axis", path: "data/Gyro/xax", suffix: "g" },
  { label: "🎯 Y-Axis", path: "data/Gyro/yax", suffix: "g" },
  { label: "🛰️ Z-Axis", path: "data/Gyro/zax", suffix: "g" }
];

function getGroup(path) {
  if (path.includes("AC")) return "AC";
  if (path.includes("Motor")) return "Motor";
  if (path.includes("RF")) return "RF";
  if (path.includes("Gyro")) return "Gyro";
  if (path.includes("Accoustic")) return "Accoustic";
  return "Misc";
}

labels.forEach((item, index) => {
  const div = document.createElement("div");
  div.className = "gauge-block";

  const label = document.createElement("div");
  label.className = "gauge-label";
  label.textContent = item.label;

  const value = document.createElement("div");
  value.className = "gauge-value";
  value.id = `val-${index}`;
  value.textContent = "--";

  div.appendChild(label);
  div.appendChild(value);

  const group = getGroup(item.path);
  const groupContainer = document.getElementById(`group-${group}`);
  if (groupContainer) {
    groupContainer.appendChild(div);
  }

  firebase.database().ref(item.path).on("value", (snap) => {
    value.textContent = `${snap.val() ?? "--"} ${item.suffix}`;
  });
});

const diagnostics = [
  { sid: "status-power", name: "Power", img: "img-fault-power", bitPath: "error/Power/bit", descPath: "errorval/Power" },
  { sid: "status-bushings", name: "Bushing", img: "img-fault-bushings", bitPath: "error/Bushing/bit", descPath: "errorval/Bushing" },
  { sid: "status-armature", name: "Armature", img: "img-fault-armature", bitPath: "error/Armature/bit", descPath: "errorval/Armature" },
  { sid: "status-shell", name: "Shell", img: "img-fault-shell", bitPath: "error/Shell/bit", descPath: "errorval/Shell" },
  { sid: "status-front-bearing", name: "FBearing", img: "img-fault-front-bearing", bitPath: "error/FBearing/bit", descPath: "errorval/FBearing" },
  { sid: "status-rear-bearing", name: "RBearing", img: "img-fault-rear-bearing", bitPath: "error/RBearing/bit", descPath: "errorval/RBearing" },
  { sid: "status-load", name: "Load", img: "img-fault-load", bitPath: "error/Load/bit", descPath: "errorval/Load" }
];

const terminal = document.getElementById("error-terminal");
const activeErrors = {};

diagnostics.forEach(d => {
  const li = document.getElementById(d.sid);
  const img = document.getElementById(d.img);

  firebase.database().ref(d.bitPath).on("value", async (snap) => {
    const val = snap.val();

    if (val === "1") {
      li.textContent = `⚠️ ${d.name} ERROR`;
      li.classList.add("fault");
      img.classList.add("fault-show");

if (!activeErrors[d.name]) {
  const descSnap = await firebase.database().ref(d.descPath).once("value");
  const description = descSnap.val() || "No description available";
  const timestamp = new Date().toLocaleTimeString();

  const entry = document.createElement("div");
  entry.id = `log-${d.name}`;
  entry.textContent = `[${timestamp}] ${d.name} Error: ${description}`;

  terminal.appendChild(entry);
  terminal.scrollTop = terminal.scrollHeight;
  activeErrors[d.name] = entry;
}



    } else {
      li.textContent = `✅ ${d.name} OK`;
      li.classList.remove("fault");
      img.classList.remove("fault-show");

      if (activeErrors[d.name]) {
        const entry = activeErrors[d.name];
        entry.style.opacity = 0.3;
        setTimeout(() => entry.remove(), 2000);
        delete activeErrors[d.name];
      }
    }
  });
});

// AC Subsystem Control Modal
const acBtn = document.getElementById("acControlBtn");
const acModal = document.getElementById("acControlModal");
const acClose = document.querySelector(".close-ac");
const acStatusText = document.getElementById("acStatusText");
const overrideBtn = document.getElementById("overrideBtn");

// Firebase reference
const acRef = firebase.database().ref("command/Core/AC");

acBtn.onclick = () => {
  acModal.style.display = "flex";
  acStatusText.textContent = "RELAY: ⏳";
  acRef.once("value").then((snap) => {
    const val = snap.val();
    acStatusText.textContent = `RELAY: ${val === 1 ? "✅ ON" : "❌ OFF"}`;
  });
};

acClose.onclick = () => acModal.style.display = "none";
window.onclick = (e) => {
  if (e.target === acModal) acModal.style.display = "none";
};

// Override button logic with confirmation dialog (like logout)
overrideBtn.onclick = () => {
  const confirmBox = document.createElement("div");
  confirmBox.className = "logout-modal";
  confirmBox.style.display = "flex";
  confirmBox.innerHTML = `
    <div class="logout-modal-content">
      <p>Are you sure you want to toggle AC status?</p>
      <div class="logout-modal-actions">
        <button id="confirmAC">Yes, Override</button>
        <button id="cancelAC">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmBox);

  document.getElementById("cancelAC").onclick = () => confirmBox.remove();

  document.getElementById("confirmAC").onclick = async () => {
    const current = (await acRef.get()).val();
    acRef.set(current === 1 ? 0 : 1);
    confirmBox.remove();
    acModal.style.display = "none";
  };
};




// === ESP Controls ===
const controlKeys = ["ambient", "fan", "light"];
const controlContainer = document.querySelector(".controls-grid");
controlContainer.innerHTML = "";

controlKeys.forEach(key => {
  const btn = document.createElement("button");
  btn.className = "esp-btn toggle-btn";
  btn.id = `btn-${key}`;
  btn.textContent = `⏳ Loading ${key}...`;

  const ref = firebase.database().ref(`command/Control/${key}`);
  ref.on("value", (snap) => {
    const state = snap.val();
    btn.textContent = `${state ? "✅" : "❌"} ${key.toUpperCase()} ${state ? "ON" : "OFF"}`;
    btn.classList.toggle("on", state === 1);
    btn.classList.toggle("off", state === 0);
  });

  btn.onclick = async () => {
    const current = (await ref.get()).val();
    ref.set(current === 1 ? 0 : 1);
  };

  controlContainer.appendChild(btn);
});

// === Modal: Motor Specs ===
const modal = document.getElementById("specModal");
const btn = document.getElementById("specBtn");
const close = modal.querySelector(".close");

btn.onclick = () => modal.style.display = "flex";
close.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// === Modal: Logout ===
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogout = document.getElementById("confirmLogout");
const cancelLogout = document.getElementById("cancelLogout");

logoutBtn.onclick = () => logoutModal.style.display = "flex";
cancelLogout.onclick = () => logoutModal.style.display = "none";
confirmLogout.onclick = () => window.location.href = "index.html";




document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("masterControlPanel");
  const openBtn = document.getElementById("openMasterPanelBtn");
  const closeBtn = document.getElementById("closeMasterPanelBtn");
  const header = document.getElementById("masterPanelHeader");

  openBtn.onclick = () => panel.style.display = "block";
  closeBtn.onclick = () => panel.style.display = "none";

  let isDragging = false, offsetX = 0, offsetY = 0;
  header.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    document.body.style.userSelect = "none";
  };
  document.onmousemove = (e) => {
    if (isDragging) {
      panel.style.left = `${e.clientX - offsetX}px`;
      panel.style.top = `${e.clientY - offsetY}px`;
    }
  };
  document.onmouseup = () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  };

  // === LED Helpers ===
  const showLed = (id) => {
    document.getElementById(id).style.display = "inline-block";
  };
  const hideLed = (id) => {
    document.getElementById(id).style.display = "none";
  };

  // === RF Panel ===
  const rfSlider = document.getElementById("rfFrequencySlider");
  const rfInput = document.getElementById("rfFrequencyInput");
  const rfSet = document.getElementById("rfFrequencySet");
  const rfReset = document.getElementById("rfFrequencyReset");
  const gainSlider = document.getElementById("rfGainSlider");
  const gainInput = document.getElementById("rfGainInput");
  const gainSet = document.getElementById("rfGainSet");
  const gainReset = document.getElementById("rfGainReset");
  const sweepBtn = document.getElementById("rfSweepBtn");
  const staticBtn = document.getElementById("rfStaticBtn");
  const rfMode = document.getElementById("rfModeSelect");
  const rfAutoFields = document.getElementById("rfAutoFields");
  const rfStatus = document.getElementById("rfAutoStatus");

  rfSlider.oninput = () => rfInput.value = rfSlider.value;
  rfInput.oninput = () => rfSlider.value = rfInput.value;

  gainSlider.oninput = () => gainInput.value = gainSlider.value;
  gainInput.oninput = () => gainSlider.value = gainInput.value;

  rfSet.onclick = () => {
    showLed("rfLed");
    firebase.database().ref("command/Core/frequency").set(rfInput.value).then(() => {
      hideLed("rfLed");
    });
  };
  rfReset.onclick = () => {
    rfSlider.value = rfInput.value = 1000;
    showLed("rfLed");
    firebase.database().ref("command/Core/frequency").set("1000").then(() => {
      hideLed("rfLed");
    });
  };

  gainSet.onclick = () => {
    showLed("rfLed");
    firebase.database().ref("command/Core/gain").set(gainInput.value).then(() => {
      hideLed("rfLed");
    });
  };
  gainReset.onclick = () => {
    gainSlider.value = gainInput.value = 10;
    showLed("rfLed");
    firebase.database().ref("command/Core/gain").set("10").then(() => {
      hideLed("rfLed");
    });
  };

  const setRfType = (type) => {
    showLed("rfLed");
    firebase.database().ref("command/Core/type").set(type).then(() => {
      hideLed("rfLed");
    });
    sweepBtn.classList.toggle("active", type === "SWEEP");
    staticBtn.classList.toggle("active", type === "STATIC");
  };

  sweepBtn.onclick = () => setRfType("SWEEP");
  staticBtn.onclick = () => setRfType("STATIC");

  rfMode.onchange = () => {
    const manual = rfMode.value === "manual";
    rfAutoFields.style.display = manual ? "none" : "block";
    [rfSet, rfReset, gainSet, gainReset, sweepBtn, staticBtn].forEach(btn => {
      btn.style.display = manual ? "inline-block" : "none";
    });
  };
  rfMode.dispatchEvent(new Event("change")); // Apply on load

  let rfInterval = null;
  const rfStartAuto = document.getElementById("rfStartAuto");
  const rfStopAuto = document.getElementById("rfStopAuto");

  rfStartAuto.onclick = () => {
    const start = +document.getElementById("rfStartPos").value;
    const end = +document.getElementById("rfEndPos").value;
    const delay = +document.getElementById("rfDelay").value * 1000;
    const step = +document.getElementById("rfUnit").value;
    let cur = start;
    rfInterval = setInterval(() => {
      if (cur > end) {
        clearInterval(rfInterval);
        rfStatus.innerText = "✅ TEST COMPLETED";
        return;
      }
      showLed("rfLed");
      firebase.database().ref("command/Core/frequency").set(cur.toString()).then(() => {
        hideLed("rfLed");
      });
      cur += step;
    }, delay);
  };

  rfStopAuto.onclick = () => {
    clearInterval(rfInterval);
    rfStatus.innerText = "";
  };

  // === ANTENNA PANEL ===
  const antennaSlider = document.getElementById("antennaSlider");
  const antennaInput = document.getElementById("antennaStrengthValue");
  const antennaMode = document.getElementById("antennaModeSelect");
  const antennaAutoFields = document.getElementById("antennaAutoFields");
  const antennaStatus = document.getElementById("antennaAutoStatus");

  antennaSlider.oninput = () => {
    antennaInput.value = antennaSlider.value;
    showLed("antennaLed");
    firebase.database().ref("command/Core/Antenna").set(antennaSlider.value).then(() => {
      hideLed("antennaLed");
    });
  };
  antennaInput.oninput = () => {
    antennaSlider.value = antennaInput.value;
  };

  document.getElementById("antennaLow").onclick = () => {
    antennaSlider.value = 0;
    antennaSlider.dispatchEvent(new Event("input"));
  };
  document.getElementById("antennaMid").onclick = () => {
    antennaSlider.value = 50;
    antennaSlider.dispatchEvent(new Event("input"));
  };
  document.getElementById("antennaHigh").onclick = () => {
    antennaSlider.value = 100;
    antennaSlider.dispatchEvent(new Event("input"));
  };

  antennaMode.onchange = () => {
    antennaAutoFields.style.display = antennaMode.value === "auto" ? "block" : "none";
  };
  antennaMode.dispatchEvent(new Event("change"));

  let antennaInterval = null;
  document.getElementById("antennaStartAuto").onclick = () => {
    const start = +document.getElementById("antennaStartPos").value;
    const end = +document.getElementById("antennaEndPos").value;
    const delay = +document.getElementById("antennaDelay").value * 1000;
    const step = +document.getElementById("antennaUnit").value;
    let cur = start;
    antennaInterval = setInterval(() => {
      if (cur > end) {
        clearInterval(antennaInterval);
        antennaStatus.innerText = "✅ TEST COMPLETED";
        return;
      }
      antennaSlider.value = cur;
      antennaInput.value = cur;
      showLed("antennaLed");
      firebase.database().ref("command/Core/Antenna").set(cur.toString()).then(() => {
        hideLed("antennaLed");
      });
      cur += step;
    }, delay);
  };

  document.getElementById("antennaStopAuto").onclick = () => {
    clearInterval(antennaInterval);
    antennaStatus.innerText = "";
  };

  // === DATA LOG PANEL ===
  let logMode = "NO-LOG";
  const readyBtn = document.getElementById("logReadyBtn");
  const breakBtn = document.getElementById("logBreakBtn");
  const startBtn = document.getElementById("masterStartBtn");
  const stopBtn = document.getElementById("masterStopBtn");

  readyBtn.onclick = () => {
    logMode = "LOG";
    firebase.database().ref("command/Core/data").set("LOG");
    readyBtn.classList.add("active");
    breakBtn.classList.remove("active");
  };
  breakBtn.onclick = () => {
    logMode = "NO-LOG";
    firebase.database().ref("command/Core/data").set("NO-LOG");
    breakBtn.classList.add("active");
    readyBtn.classList.remove("active");
  };
  // === CSV Helper ===
  let csvLog = [];

  function getCurrentTimestamp() {
    const now = new Date();
    return now.toISOString().replace("T", " ").split(".")[0]; // YYYY-MM-DD HH:MM:SS
  }

  function saveToCSV() {
    const headers = ["Timestamp", "Voltage", "Current", "Freq", "Power Factor", "Phase","RF Gain","RF Loss","RF NM", "RF RFC", "RF SNR", "RF Frequency","Antenna Distance","RF Type","Amplitude","Distortion","Harmonics","Noise","Vibration","Gyro Pitch","Roll","Yaw","X Axis","Y Axis","Z Axis","Motor A", "Motor B", "Motor C","Motor D","Motor E", "RPM","Temperature","Torque"];
    const csv = [headers, ...csvLog].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "log_data.csv";
    link.click();
  }

function fetchAndLogDataRow() {
  const timestamp = getCurrentTimestamp();
  Promise.all([
    firebase.database().ref("data/AC/voltage").once("value"),
    firebase.database().ref("data/AC/current").once("value"),
    firebase.database().ref("data/AC/frequency").once("value"),
    firebase.database().ref("data/AC/pf").once("value"),
    firebase.database().ref("data/AC/phase").once("value"),
    firebase.database().ref("data/RF/gain").once("value"),
    firebase.database().ref("data/RF/loss").once("value"),
    firebase.database().ref("data/RF/nm").once("value"),
    firebase.database().ref("data/RF/rfc").once("value"),
    firebase.database().ref("data/RF/snr").once("value"),
    firebase.database().ref("command/Core/frequency").once("value"),
    firebase.database().ref("command/Core/Antenna").once("value"),
    firebase.database().ref("command/Core/type").once("value"),
    firebase.database().ref("data/Accoustic/amplitude").once("value"),
    firebase.database().ref("data/Accoustic/distortion").once("value"),
    firebase.database().ref("data/Accoustic/harmonics").once("value"),
    firebase.database().ref("data/Accoustic/noise").once("value"),
    firebase.database().ref("data/Accoustic/vibration").once("value"),
    firebase.database().ref("data/Gyro/pitch").once("value"),
    firebase.database().ref("data/Gyro/roll").once("value"),
    firebase.database().ref("data/Gyro/yaw").once("value"),
    firebase.database().ref("data/Gyro/xax").once("value"),
    firebase.database().ref("data/Gyro/yax").once("value"),
    firebase.database().ref("data/Gyro/zax").once("value"),
    firebase.database().ref("data/Motor/a").once("value"),
    firebase.database().ref("data/Motor/b").once("value"),
    firebase.database().ref("data/Motor/c").once("value"),
    firebase.database().ref("data/Motor/d").once("value"),
    firebase.database().ref("data/Motor/e").once("value"),
    firebase.database().ref("data/Motor/rpm").once("value"),
    firebase.database().ref("data/Motor/temp").once("value"),
    firebase.database().ref("data/Motor/torque").once("value")
  ]).then((snapshots) => {
    const row = [timestamp];
    snapshots.forEach(snap => {
      row.push(snap.val() ?? "");
    });
    csvLog.push(row);
  });
}


  let logInterval = null;

  // === MAIN START / STOP ===
  startBtn.onclick = () => {
    document.getElementById("rfStartAuto")?.click();
    document.getElementById("antennaStartAuto")?.click();

    if (logMode === "LOG") {
      csvLog = []; // reset
      fetchAndLogDataRow(); // immediate fetch
      logInterval = setInterval(fetchAndLogDataRow, 2000); // every 2 seconds
    }
  };

  stopBtn.onclick = () => {
    document.getElementById("rfStopAuto")?.click();
    document.getElementById("antennaStopAuto")?.click();

    if (logMode === "LOG") {
      clearInterval(logInterval);
      setTimeout(() => {
        saveToCSV();
        alert("✅ CSV Log Saved.");
      }, 500); // short delay to capture last row
    } else {
      alert("🛑 All operations stopped.");
    }
  };

});
