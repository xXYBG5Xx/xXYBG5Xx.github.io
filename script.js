// إعدادات عامة
const locale = "ar-TN"; // لضبط تنسيق تونس (العربية)

// الساعة والتاريخ
function updateClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(now);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(now);

  document.getElementById("clock").textContent = time;
  document.getElementById("date").textContent = date;
}
setInterval(updateClock, 1000);
updateClock();

// بحث يشبه جوجل: يعيد التوجيه إلى صفحة نتائج جوجل
const form = document.getElementById("search-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("q").value.trim();
  if (!q) return;
  // يمكنك تبديل محرك البحث: جوجل/بينغ
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  window.location.href = url;
});

// اقتراحات سريعة
document.querySelectorAll(".quick-links a").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const text = a.getAttribute("data-suggest");
    document.getElementById("q").value = text;
  });
});

// زر المايك (تجربة البحث الصوتي بالمتصفح)
const micBtn = document.getElementById("mic-btn");
micBtn.addEventListener("click", async () => {
  const supportsSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  if (!supportsSpeech) {
    alert("البحث الصوتي غير مدعوم في هذا المتصفح.");
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SR();
  recog.lang = locale;
  recog.interimResults = false;
  recog.maxAlternatives = 1;
  recog.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("q").value = transcript;
  };
  recog.onerror = (e) => console.error("Speech error:", e);
  recog.start();
});

// طقس باستخدام Open-Meteo (بدون مفتاح API)
// إن وُفِّق الحصول على الإحداثيات عبر المتصفح، نستخدمها؛ وإلا ن fallback لتونس.
const weatherEl = document.getElementById("weather");

async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    const desc = weatherCodeToText(code);
    weatherEl.textContent = `${temp}°C — ${desc}`;
  } catch (err) {
    weatherEl.textContent = "تعذر جلب الطقس.";
    console.error(err);
  }
}

function weatherCodeToText(code) {
  // تبسيط توصيفات Open-Meteo
  const map = {
    0: "صحو",
    1: "غائم قليلًا",
    2: "غائم جزئيًا",
    3: "غائم",
    45: "ضباب",
    48: "ضباب متجمد",
    51: "رذاذ خفيف",
    53: "رذاذ",
    55: "رذاذ كثيف",
    61: "مطر خفيف",
    63: "مطر",
    65: "مطر غزير",
    71: "ثلج خفيف",
    73: "ثلج",
    75: "ثلج كثيف",
    80: "زخات مطر خفيفة",
    81: "زخات مطر",
    82: "زخات مطر غزيرة",
    95: "عواصف رعدية",
    96: "عواصف مع برد خفيف",
    99: "عواصف مع برد"
  };
  return map[code] ?? "طقس غير معروف";
}

function initWeather() {
  if (!navigator.geolocation) {
    // fallback: وسط تونس
    fetchWeather(36.8065, 10.1815);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(latitude, longitude);
    },
    () => {
      // رفض المستخدم: استخدم تونس
      fetchWeather(36.8065, 10.1815);
    },
    { enableHighAccuracy: false, timeout: 6000 }
  );
}
initWeather();

// عنوان الشريط العلوي (شكل فقط)
document.getElementById("refresh-btn").addEventListener("click", () => {
  // تأثير بسيط للتحديث
  const btn = document.getElementById("refresh-btn");
  btn.textContent = "⟳";
  setTimeout(() => (btn.textContent = "↻"), 600);
});
