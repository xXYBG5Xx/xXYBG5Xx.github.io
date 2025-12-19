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
searchInput.value = "";
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    const q = encodeURIComponent(searchInput.value);
    searchInput.value = "";
    location.href = `https://www.google.com/search?q=${q}`;
  }
});

// ===== Theme =====
function setTheme(t) {
  document.body.className = t;
  localStorage.setItem("theme", t);
}
document.body.className = localStorage.getItem("theme") || "dark";

// ===== Background =====
bgUpload.onchange = e => {
  const r = new FileReader();
  r.onload = () => {
    document.body.style.backgroundImage = `url(${r.result})`;
    localStorage.setItem("bg", r.result);
  };
  r.readAsDataURL(e.target.files[0]);
};
if (localStorage.getItem("bg"))
  document.body.style.backgroundImage = `url(${localStorage.getItem("bg")})`;

// ===== Settings =====
settingsBtn.onclick = () =>
  settings.classList.toggle("hidden");

// ===== Apps (+ add sites) =====
const apps = document.getElementById("apps");
const addModal = document.getElementById("addModal");
const siteName = document.getElementById("siteName");
const siteUrl = document.getElementById("siteUrl");

addBtn.onclick = () => addModal.classList.remove("hidden");
addModal.onclick = e => {
  if (e.target === addModal) addModal.classList.add("hidden");
};

let sites = JSON.parse(localStorage.getItem("sites") || "[]");

function renderSites() {
  apps.querySelectorAll(".site").forEach(e => e.remove());

  sites.forEach(site => {
    const div = document.createElement("div");
    div.className = "app glass site";
    div.innerHTML = `
      <img class="icon">
      <span>${site.name}</span>
    `;

    const domain = new URL(site.url).hostname;
    div.querySelector(".icon").src =
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    div.onclick = () => location.href = site.url;
    apps.insertBefore(div, addBtn);
  });
}

addSiteBtn.onclick = () => {
  if (!siteName.value || !siteUrl.value) return;

  sites.push({
    name: siteName.value,
    url: siteUrl.value
  });

  localStorage.setItem("sites", JSON.stringify(sites));
  siteName.value = siteUrl.value = "";
  addModal.classList.add("hidden");
  renderSites();
};

renderSites();

// ===== Weather =====
const weather = document.getElementById("weather");
const API_KEY = "PUT_YOUR_API_KEY";

navigator.geolocation.getCurrentPosition(
  pos => {
    const { latitude, longitude } = pos.coords;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    )
      .then(r => r.json())
      .then(d => {
        weather.textContent =
          `${d.name} • ${Math.round(d.main.temp)}°C • ${d.weather[0].main}`;
      });
  },
  () => weather.textContent = "Location disabled"
);
