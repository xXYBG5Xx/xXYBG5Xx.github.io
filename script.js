const appsContainer = document.getElementById('apps');
const searchInput = document.getElementById('searchInput');
const bgInput = document.getElementById('bgInput');

// تحميل الصفحات المحفوظة
let apps = JSON.parse(localStorage.getItem('apps') || '[]');

// تحميل الخلفية
const savedBg = localStorage.getItem('bg');
if (savedBg) document.body.style.backgroundImage = `url(${savedBg})`;

function renderApps() {
  appsContainer.innerHTML = '<div class="app add" id="addBtn">+</div>';

  apps.forEach((app, index) => {
    const div = document.createElement('div');
    div.className = 'app';
    div.draggable = true;
    div.dataset.index = index;

    div.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${app.url}&sz=64">`;
    div.onclick = () => window.location.href = app.url;

    // Drag events
    div.addEventListener('dragstart', e => {
      e.dataTransfer.setData('index', index);
    });

    div.addEventListener('dragover', e => e.preventDefault());

    div.addEventListener('drop', e => {
      const from = e.dataTransfer.getData('index');
      const to = index;
      apps.splice(to, 0, apps.splice(from, 1)[0]);
      save();
    });

    appsContainer.appendChild(div);
  });

  document.getElementById('addBtn').onclick = addApp;
}

function addApp() {
  const url = prompt('الرابط (https://...)');
  if (!url) return;
  apps.push({ url });
  save();
}

function save() {
  localStorage.setItem('apps', JSON.stringify(apps));
  renderApps();
}

// البحث
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (!q) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }
});

// تغيير الخلفية
bgInput.addEventListener('change', () => {
  const file = bgInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.body.style.backgroundImage = `url(${reader.result})`;
    localStorage.setItem('bg', reader.result);
  };
  reader.readAsDataURL(file);
});

renderApps();