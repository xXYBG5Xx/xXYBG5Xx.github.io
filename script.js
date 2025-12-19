// ===== Time =====
const time = document.getElementById("time");
function updateTime() {
  const now = new Date();
  time.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
setInterval(updateTime, 1000);
updateTime();

// ===== Search =====
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    location.href =
      "https://www.google.com/search?q=" +
      encodeURIComponent(searchInput.value);
  }
});

// ===== Apps + Auto Icons (مثل Google/Edge) =====
document.querySelectorAll(".app").forEach(app => {
  const url = app.dataset.url;
  const icon = app.querySelector(".icon");
  const domain = new URL(url).hostname;

  icon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  app.onclick = () => location.href = url;
});

// ===== Settings =====
const settings = document.getElementById("settings");
const settingsBtn = document.getElementById("settingsBtn");
settingsBtn.onclick = () => settings.classList.toggle("hidden");

function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("theme", theme);
}

// ===== Background Upload =====
const bgUpload = document.getElementById("bgUpload");
bgUpload.onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    document.body.style.backgroundImage = `url(${reader.result})`;
    localStorage.setItem("bg", reader.result);
  };
  reader.readAsDataURL(file);
};

// ===== Load Saved Settings =====
document.body.className = localStorage.getItem("theme") || "dark";
if (localStorage.getItem("bg")) {
  document.body.style.backgroundImage =
    `url(${localStorage.getItem("bg")})`;
}

// ===== Weather (OpenWeather) =====
// 🔑 ضع API KEY الخاص بك هنا
const API_KEY = "PUT_YOUR_API_KEY";
const weather = document.getElementById("weather");

navigator.geolocation.getCurrentPosition(pos => {
  const { latitude, longitude } = pos.coords;

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
  )
    .then(res => res.json())
    .then(data => {
      weather.textContent =
        `${Math.round(data.main.temp)}°C • ${data.weather[0].main}`;
    })
    .catch(() => {
      weather.textContent = "تعذر جلب الطقس";
    });
});
