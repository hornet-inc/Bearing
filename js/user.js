// === Doughnut Center Text Plugin ===
Chart.register({
  id: 'centerText',
  beforeDraw(chart) {
    if (chart.config.options.elements?.center) {
      const ctx = chart.ctx;
      const centerConfig = chart.config.options.elements.center;
      const txt = centerConfig.text;
      const fontSize = centerConfig.fontSize || 20;
      const fontColor = centerConfig.color || '#fff';

      const width = chart.width;
      const height = chart.height;

      ctx.restore();
      ctx.font = `${fontSize}px 'Segoe UI', sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = fontColor;

      const textX = Math.round((width - ctx.measureText(txt).width) / 2);
      const textY = height / 1.5;

      ctx.fillText(txt, textX, textY);
      ctx.save();
    }
  }
});

// === Firebase Setup ===
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
const db = firebase.database();

// === Labels for Gauges ===
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

// === Chart Instances ===
const chartInstances = [];

// === Create Gauges ===
function createGauge(canvasId, label, value, max, suffix = "") {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, max - value],
        backgroundColor: ['#ff6f00', 'rgba(255,255,255,0.07)'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: false,
      rotation: -90,
      circumference: 180,
      cutout: '70%',
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false }
      },
      elements: {
        center: {
          text: `${value}${suffix}`,
          fontSize: 22,
          color: '#ffffff'
        }
      }
    }
  });

  const labelElement = document.createElement("div");
  labelElement.className = "gauge-label";
  labelElement.textContent = label;
  ctx.parentElement.appendChild(labelElement);

  return chart;
}

// === Render Gauges Initially ===
labels.forEach((l, i) => {
  const val = Math.floor(Math.random() * 100);
  const chart = createGauge(`g${i + 1}`, l.label, val, 100, l.suffix);
  chartInstances.push(chart);
});

// === Update Chart ===
function updateCenterText(chart, newValue, suffix = "") {
  chart.options.elements.center.text = `${newValue}${suffix}`;
  chart.data.datasets[0].data = [newValue, 100 - newValue];
  chart.update();
}

// === Error Components ===
const errs = [
  { sid: "status-power", name: "Power Supply", img: "img-power", p: "error/Power/bit" },
  { sid: "status-bushings", name: "Bushings", img: "img-bushings", p: "error/Bushing/bit" },
  { sid: "status-armature", name: "Armature", img: "img-armature", p: "error/Armature/bit" },
  { sid: "status-shell", name: "Shell", img: "img-shell", p: "error/Shell/bit" },
  { sid: "status-front-bearing", name: "Front Bearing", img: "img-front-bearing", p: "error/FBearing/bit" },
  { sid: "status-rear-bearing", name: "Rear Bearing", img: "img-rear-bearing", p: "error/RBearing/bit" },
  { sid: "status-load", name: "Load", img: "img-load", p: "error/Load/bit" }
];

// === Firebase Auth + Live Sync ===
firebase.auth().signInWithEmailAndPassword("dashboardmaster@mirai.com", "MIRAI@2580")
  .then(() => {
    console.log("✅ Firebase logged in");

    // Gauge listeners
    labels.forEach((o, i) => {
      db.ref(o.path).on('value', snap => {
        const v = parseFloat(snap.val());
        if (!isNaN(v)) updateCenterText(chartInstances[i], v, o.suffix);
      });
    });

    // Error listeners
    errs.forEach(o => {
      const el = document.getElementById(o.sid);
      const img = document.getElementById(o.img);
      db.ref(o.p).on('value', snap => {
        const v = parseInt(snap.val());
        if (v === 1) {
          el.textContent = `⚠️ ${o.name} ERROR`;
          el.classList.add('fault');
          img.style.display = 'block';
        } else {
          el.textContent = `✅ ${o.name} OK`;
          el.classList.remove('fault');
          img.style.display = 'none';
        }
      });
    });

  })
  .catch(err => {
    console.error("❌ Firebase login failed:", err.message);
  });

// === Logout Modal ===
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const confirmLogout = document.getElementById("confirmLogout");
const cancelLogout = document.getElementById("cancelLogout");

logoutBtn.onclick = () => logoutModal.style.display = "flex";
cancelLogout.onclick = () => logoutModal.style.display = "none";
confirmLogout.onclick = () => {
  window.location.href = "index.html";
};

// === Motor Specs Modal ===
const modal = document.getElementById("specModal");
const btn = document.getElementById("specBtn");
const close = document.querySelector(".close");

btn.onclick = () => modal.style.display = "block";
close.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};
