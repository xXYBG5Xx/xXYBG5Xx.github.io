// Interactive Background with Vanta.js
VANTA.CLOUDS({
  el: "#vanta-bg",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  skyColor: 0x68b8d7,
  cloudColor: 0xc4e9f4,
  sunColor: 0xff9f1a,
  speed: 1.50
});

// Clock Update
function updateClock() {
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  const time = now.toLocaleTimeString('ar-SA', options);
  const date = now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('clock').innerHTML = `${time}<br><small>${date}</small>`;
}
updateClock();
setInterval(updateClock, 1000);

// Weather Fetch (using Open-Meteo - free, no key)
function fetchWeather(lat, lon) {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
    .then(res => res.json())
    .then(data => {
      const weather = data.current_weather;
      document.getElementById('weather-desc').textContent = getWeatherDescription(weather.weathercode);
      document.getElementById('weather-temp').textContent = `${weather.temperature}°C`;
    })
    .catch(() => document.getElementById('weather-desc').textContent = 'تعذر جلب الطقس');
}

function getWeatherDescription(code) {
  const descriptions = { 0: 'صافي', 1: 'غائم جزئيًا', 2: 'غائم', 3: 'ممطر', /* add more as needed */ };
  return descriptions[code] || 'غير معروف';
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => fetchWeather(pos.coords.latitude, pos.coords.longitude));
} else {
  fetchWeather(24.7136, 46.6753); // Default: Riyadh
}

// Search Form
document.getElementById('search-form').addEventListener('submit', e => {
  e.preventDefault();
  const query = document.getElementById('search-input').value;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});

// Links Management with LocalStorage and Thumbnails
const linksGrid = document.getElementById('links-grid');
let links = JSON.parse(localStorage.getItem('customLinks')) || [];

function renderLinks() {
  linksGrid.innerHTML = '';
  links.forEach((link, index) => {
    const item = document.createElement('a');
    item.classList.add('link-item');
    item.href = link.url;
    item.target = '_blank';
    item.innerHTML = `
      <img src="https://image.thum.io/get/width/200/crop/200/${link.url}" alt="${link.name}">
      <span>${link.name}</span>
    `;
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = () => {
      links.splice(index, 1);
      localStorage.setItem('customLinks', JSON.stringify(links));
      renderLinks();
    };
    item.appendChild(deleteBtn);
    linksGrid.appendChild(item);
  });
}
renderLinks();

document.getElementById('add-link-btn').addEventListener('click', () => {
  const name = document.getElementById('new-link-name').value;
  const url = document.getElementById('new-link-url').value;
  if (name && url) {
    links.push({ name, url });
    localStorage.setItem('customLinks', JSON.stringify(links));
    renderLinks();
    document.getElementById('new-link-name').value = '';
    document.getElementById('new-link-url').value = '';
  }
});

// Dark/Light Mode
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark) document.body.classList.add('dark');

document.getElementById('toggle-mode').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Custom Background and Effects
document.getElementById('set-bg-btn').addEventListener('click', () => {
  const url = document.getElementById('bg-url').value;
  if (url) document.body.style.backgroundImage = `url(${url})`;
});

document.getElementById('apply-effect-btn').addEventListener('click', () => {
  const effect = document.getElementById('effect-select').value;
  document.getElementById('vanta-bg').style.filter = effect;
});