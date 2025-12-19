/* صفحة رئيسية تفاعلية:
   - ضع مفتاح OpenWeatherMap في المتغير owmKey أو في settings (سيُخزن في localStorage)
   - يدعم إضافة الصفحات، حفظ الإعدادات، الخلفية التفاعلية
*/

(() => {
  // ---------- عناصر DOM ----------
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const clockEl = $('#clock');
  const dateEl = $('#date');
  const weatherEl = $('#weather');
  const tempEl = weatherEl.querySelector('.temp');
  const condEl = weatherEl.querySelector('.cond');

  const searchForm = $('#search-form');
  const searchInput = $('#search-input');
  const engineSelect = $('#engine');

  const shortcutsEl = $('#shortcuts');
  const addBtn = $('#add-shortcut');

  const settingsBtn = $('#btn-settings');
  const settingsModal = $('#settings-modal');
  const closeSettingsBtn = $('#close-settings');
  const saveSettingsBtn = $('#save-settings');

  const themeSelect = $('#theme-select');
  const defaultEngine = $('#default-engine');

  const bgFile = $('#bg-file');
  const bgUrl = $('#bg-url');
  const setBgUrlBtn = $('#set-bg-url');
  const bgOverlay = $('#bg-image-overlay');
  const bgBlur = $('#bg-blur');
  const bgBlurVal = $('#bg-blur-val');
  const bgOpacity = $('#bg-opacity');
  const bgOpacityVal = $('#bg-opacity-val');

  const owmKeyInput = $('#owm-key');
  const getWeatherBtn = $('#get-weather');

  const particlesToggle = $('#particles-toggle');
  const particlesCount = $('#particles-count');
  const particlesCountVal = $('#particles-count-val');

  const addModal = $('#add-modal');
  const scTitle = $('#sc-title');
  const scUrl = $('#sc-url');
  const saveShortcutBtn = $('#save-shortcut');
  const cancelShortcutBtn = $('#cancel-shortcut');

  // ---------- إعدادات افتراضية ----------
  const DEFAULTS = {
    theme: 'auto', // auto/light/dark
    engine: 'google',
    background: '',
    blur: 6,
    opacity: 0.5,
    owmKey: '',
    particles: true,
    particlesCount: 80,
  };

  // ---------- إدارة التخزين ----------
  function loadSettings(){
    try{
      const raw = localStorage.getItem('home_settings');
      return Object.assign({}, DEFAULTS, raw ? JSON.parse(raw) : {});
    } catch(e){ return Object.assign({}, DEFAULTS); }
  }
  function saveSettings(obj){
    localStorage.setItem('home_settings', JSON.stringify(obj));
  }

  function loadShortcuts(){
    try{
      const raw = localStorage.getItem('home_shortcuts');
      return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
  }
  function saveShortcuts(list){ localStorage.setItem('home_shortcuts', JSON.stringify(list)); }

  let settings = loadSettings();
  let shortcuts = loadShortcuts();

  // ---------- Theme ----------
  function applyTheme(){
    const root = document.documentElement;
    if(settings.theme === 'auto'){
      const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', settings.theme);
    }
  }

  // ---------- Clock ----------
  function tick(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}`;
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday:'long', day:'numeric', month:'short' });
  }
  setInterval(tick, 1000);
  tick();

  // ---------- Search ----------
  const engines = {
    google: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    bing: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    ddg: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  };
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if(!q) return;
    const engine = engineSelect.value || settings.engine || 'google';
    window.open(engines[engine](q), '_blank');
  });

  // ---------- Shortcuts UI ----------
  function domainFromUrl(u){
    try{ return (new URL(u)).hostname; } catch(e){ return null; }
  }
  function faviconUrlFor(domain){
    if(!domain) return '';
    return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=64`;
  }
  function renderShortcuts(){
    shortcutsEl.innerHTML = '';
    shortcuts.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = 'shortcut';
      card.title = s.url;
      card.innerHTML = `
        <img src="${s.icon || faviconUrlFor(domainFromUrl(s.url))}" alt="">
        <div class="title">${s.title}</div>
      `;
      card.addEventListener('click', () => window.open(s.url, '_blank'));
      card.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        if(confirm('حذف هذا الاختصار؟')) {
          shortcuts.splice(idx,1); saveShortcuts(shortcuts); renderShortcuts();
        }
      });
      shortcutsEl.appendChild(card);
    });
  }
  renderShortcuts();

  addBtn.addEventListener('click', () => {
    scTitle.value = '';
    scUrl.value = '';
    addModal.classList.remove('hidden');
  });
  cancelShortcutBtn.addEventListener('click', () => addModal.classList.add('hidden'));
  saveShortcutBtn.addEventListener('click', async () => {
    const title = scTitle.value.trim();
    const url = scUrl.value.trim();
    if(!url) return alert('أدخل رابط صالح');
    const domain = domainFromUrl(url);
    const icon = faviconUrlFor(domain);
    shortcuts.push({title: title || domain, url, icon});
    saveShortcuts(shortcuts);
    renderShortcuts();
    addModal.classList.add('hidden');
  });

  // ---------- Settings modal ----------
  settingsBtn.addEventListener('click', openSettings);
  function openSettings(){
    // populate fields
    themeSelect.value = settings.theme || 'auto';
    defaultEngine.value = settings.engine || 'google';
    bgBlur.value = settings.blur ?? DEFAULTS.blur;
    bgBlurVal.textContent = `${bgBlur.value}px`;
    bgOpacity.value = settings.opacity ?? DEFAULTS.opacity;
    bgOpacityVal.textContent = settings.opacity;
    owmKeyInput.value = settings.owmKey || '';
    particlesToggle.checked = !!settings.particles;
    particlesCount.value = settings.particlesCount || DEFAULTS.particlesCount;
    particlesCountVal.textContent = particlesCount.value;
    settingsModal.classList.remove('hidden');
  }
  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
  saveSettingsBtn.addEventListener('click', () => {
    settings.theme = themeSelect.value;
    settings.engine = defaultEngine.value;
    settings.blur = Number(bgBlur.value);
    settings.opacity = Number(bgOpacity.value);
    settings.owmKey = owmKeyInput.value.trim();
    settings.particles = particlesToggle.checked;
    settings.particlesCount = Number(particlesCount.value);
    saveSettings(settings);
    applyTheme();
    applyBackgroundVisuals();
    initParticles(); // reinit with new count
    settingsModal.classList.add('hidden');
  });

  // Bg controls
  bgBlur.addEventListener('input', () => { bgBlurVal.textContent = `${bgBlur.value}px`; bgOverlay.style.filter = `blur(${bgBlur.value}px)`; });
  bgOpacity.addEventListener('input', () => { bgOpacityVal.textContent = bgOpacity.value; bgOverlay.style.opacity = bgOpacity.value; });

  bgFile.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      settings.background = reader.result;
      saveSettings(settings);
      applyBackgroundVisuals();
    };
    reader.readAsDataURL(f);
  });

  setBgUrlBtn.addEventListener('click', () => {
    const val = bgUrl.value.trim();
    if(!val) return;
    settings.background = val;
    saveSettings(settings);
    applyBackgroundVisuals();
    bgUrl.value = '';
  });

  function applyBackgroundVisuals(){
    if(settings.background){
      bgOverlay.style.backgroundImage = `url("${settings.background}")`;
      bgOverlay.style.display = '';
    } else {
      bgOverlay.style.backgroundImage = '';
      bgOverlay.style.display = '';
    }
    bgOverlay.style.filter = `blur(${settings.blur}px)`;
    bgOverlay.style.opacity = settings.opacity;
  }

  // ---------- Weather ----------
  async function fetchWeatherByCoords(lat,lon){
    const key = settings.owmKey;
    if(!key) return;
    try{
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ar&appid=${key}`);
      if(!res.ok) throw new Error('weather fetch failed');
      const d = await res.json();
      updateWeatherUI(d);
    }catch(e){ console.warn(e); }
  }
  async function fetchWeatherByCity(city){
    const key = settings.owmKey;
    if(!key) return;
    try{
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ar&appid=${key}`);
      if(!res.ok) throw new Error('weather fetch failed');
      const d = await res.json();
      updateWeatherUI(d);
    }catch(e){ console.warn(e); }
  }
  function updateWeatherUI(d){
    if(!d) return;
    tempEl.textContent = `${Math.round(d.main.temp)}°C`;
    condEl.textContent = d.weather && d.weather[0] ? d.weather[0].description : '';
  }

  getWeatherBtn.addEventListener('click', () => {
    settings.owmKey = owmKeyInput.value.trim(); saveSettings(settings);
    tryGeolocationThenWeather();
  });

  async function tryGeolocationThenWeather(){
    if(settings.owmKey){
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos => {
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        }, () => {
          // fallback to a default city if geo blocked
          fetchWeatherByCity('Riyadh');
        }, {timeout:7000});
      } else {
        fetchWeatherByCity('Riyadh');
      }
    }
  }

  // ---------- Particles background ----------
  const canvas = $('#bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;
  function resizeCanvas(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function rand(min,max){ return Math.random()*(max-min)+min; }

  function initParticles(){
    cancelAnimationFrame(animationId);
    particles = [];
    if(!settings.particles) return;
    const count = settings.particlesCount || 80;
    for(let i=0;i<count;i++){
      particles.push({
        x: rand(0,canvas.width),
        y: rand(0,canvas.height),
        vx: rand(-0.6,0.6),
        vy: rand(-0.6,0.6),
        r: rand(0.8,2.6),
      });
    }
    animate();
  }

  const mouse = {x:-9999,y:-9999};
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // gradient background subtle
    const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0, 'rgba(10,20,30,0.0)');
    g.addColorStop(1, 'rgba(10,30,60,0.05)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // update particles
    for(let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      // bounds
      if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
      // mouse repulse
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 120){
        p.x += dx / dist * 2;
        p.y += dy / dist * 2;
      }
      // draw
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }

    // connect lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 100){
          ctx.strokeStyle = `rgba(170,200,230,${(1-dist/100)*0.12})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  // ---------- init on load ----------
  function init(){
    // load saved settings into UI variables
    engineSelect.value = settings.engine || DEFAULTS.engine;
    applyTheme();
    applyBackgroundVisuals();
    initParticles();
    tryGeolocationThenWeather();
  }
  init();

  // load UI settings on open
  // ensure settings var kept up-to-date when changed in modal (save handled on saveSettings)

  // keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if(e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
    if(e.key === 'Escape') { settingsModal.classList.add('hidden'); addModal.classList.add('hidden'); }
  });

  // on first install, if no shortcuts exist, add defaults
  if(shortcuts.length === 0){
    shortcuts = [
      {title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://s2.googleusercontent.com/s2/favicons?domain=youtube.com'},
      {title: 'Gmail', url: 'https://mail.google.com', icon: 'https://s2.googleusercontent.com/s2/favicons?domain=mail.google.com'},
      {title: 'GitHub', url: 'https://github.com', icon: 'https://s2.googleusercontent.com/s2/favicons?domain=github.com'},
    ];
    saveShortcuts(shortcuts); renderShortcuts();
  }

  // expose some functions for debugging (optional)
  window.HOME = {
    settings, saveSettings,
    shortcuts, saveShortcuts,
    reinit: () => { settings = loadSettings(); shortcuts = loadShortcuts(); applyTheme(); applyBackgroundVisuals(); renderShortcuts(); initParticles(); }
  };
})();
