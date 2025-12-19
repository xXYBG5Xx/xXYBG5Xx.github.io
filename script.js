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

// ===== Search (no history text) =====
const searchInput = document.getElementById("searchInput");
searchInput.value = "";

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    const q = encodeURIComponent(searchInput.value);
    searchInput.value = ""; // يمسح النص
    location.href = `https://www.google.com/search?q=${q}`;
  }
});

// ===== Apps + favicon auto =====
document.querySelectorAll(".app").forEach(app => {
  const url = app.dataset.url;
  const icon = app.querySelector(".icon");
  const domain = new URL(url).hostname;

  icon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  app.onclick = () => location.href = url;
});

// ===== Settings =====
const settings = document.getElementById("settings");
document.getElementById("settingsBtn").onclick = () =>
  settings.classList.toggle("hidden");

function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("theme", theme);
}

// ===== Background =====
bgUpload.onchange = e => {
  const reader = new FileReader();
  reader.onload = () => {
    document.body.style.backgroundImage = `url(${reader.result})`;
    localStorage.setItem("bg", reader.result);
  };
  reader.readAsDataURL(e.target.files[0]);
};

// Load saved
document.body.className = localStorage.getItem("theme") || "dark";
if (localStorage.getItem("bg")) {
  document.body.style.backgroundImage =
    `url(${localStorage.getItem("bg")})`;
}

// ===== Weather (fixed + location per user) =====
const weather = document.getElementById("weather");
const API_KEY = "PUT_YOUR_API_KEY";

navigator.geolocation.getCurrentPosition(
  pos => {
    const { latitude, longitude } = pos.coords;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    )
      .then(res => res.json())
      .then(data => {
        weather.textContent =
          `${data.name} • ${Math.round(data.main.temp)}°C • ${data.weather[0].main}`;
      });
  },
  () => {
    weather.textContent = "Location disabled";
  }
);
