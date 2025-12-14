// Simple start-page with add/edit/delete, drag reorder, background settings and animations.
// Author: copilot-style example
(() => {
  // DOM
  const tilesEl = document.getElementById('tiles');
  const tpl = document.getElementById('tile-template');
  const btnAdd = document.getElementById('btn-add');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const tileTitle = document.getElementById('tile-title');
  const tileUrl = document.getElementById('tile-url');
  const tileIcon = document.getElementById('tile-icon');
  const tileColor = document.getElementById('tile-color');
  const modalSave = document.getElementById('modal-save');
  const modalCancel = document.getElementById('modal-cancel');

  const settingsModal = document.getElementById('settings');
  const btnSettings = document.getElementById('btn-settings');
  const bgColor = document.getElementById('bg-color');
  const bgImage = document.getElementById('bg-image');
  const toggleClickAnim = document.getElementById('toggle-click-anim');
  const settingsSave = document.getElementById('settings-save');
  const settingsReset = document.getElementById('settings-reset');
  const settingsClose = document.getElementById('settings-close');

  const searchInput = document.getElementById('search');

  const STORAGE_KEY = 'edge_start_tiles_v1';
  const SETTINGS_KEY = 'edge_start_settings_v1';

  // default tiles (icons as emoji for portability)
  const DEFAULTS = [
    {title: 'إضافة اختصار', url: '#', icon: '+', color: '#ffffff', placeholder:true},
    {title: 'WhatsApp', url: 'https://web.whatsapp.com/', icon: '💬', color: '#25D366'},
    {title: 'Telegram', url: 'https://web.telegram.org/', icon: '✈️', color: '#26A5E4'},
    {title: 'Instagram', url: 'https://instagram.com/', icon: '📸', color: '#E1306C'},
    {title: 'TikTok', url: 'https://www.tiktok.com/', icon: '🎵', color: '#000000'},
    {title: 'Facebook', url: 'https://facebook.com/', icon: 'f', color: '#1877F2'},
  ];

  let tiles = loadTiles();
  let settings = loadSettings();

  // --- render ---
  function render() {
    tilesEl.innerHTML = '';
    tiles.forEach((t, idx) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      const btn = node.querySelector('.tile-btn');
      const icon = node.querySelector('.tile-icon');
      const title = node.querySelector('.tile-title');

      icon.textContent = t.icon || '•';
      icon.style.background = t.color || '#666';
      title.textContent = t.title || t.url || 'موقع';

      // actions
      node.querySelector('.edit').addEventListener('click', e => {
        e.stopPropagation();
        openModal('edit', idx);
      });
      node.querySelector('.remove').addEventListener('click', e => {
        e.stopPropagation();
        removeTile(idx);
      });
      node.querySelector('.move-up').addEventListener('click', e => {
        e.stopPropagation();
        move(idx, idx - 1);
      });
      node.querySelector('.move-down').addEventListener('click', e => {
        e.stopPropagation();
        move(idx, idx + 1);
      });

      // open link with click animation if enabled
      btn.addEventListener('click', e => {
        if (t.placeholder) { openModal('add', idx); return; }
        if (settings.clickAnim) {
          btn.classList.add('click-anim');
          setTimeout(() => {
            btn.classList.remove('click-anim');
            window.open(t.url, '_blank');
          }, 220);
        } else {
          window.open(t.url, '_blank');
        }
      });

      // drag & drop attributes
      const li = node;
      li.setAttribute('data-index', idx);
      li.draggable = true;
      li.addEventListener('dragstart', onDragStart);
      li.addEventListener('dragover', onDragOver);
      li.addEventListener('drop', onDrop);
      li.addEventListener('dragend', onDragEnd);

      tilesEl.appendChild(node);
    });
    saveTiles();
  }

  // --- storage ---
  function loadTiles() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULTS.slice();
  }
  function saveTiles() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
  }

  function loadSettings() {
    const defaultSettings = { backgroundColor: '', backgroundImage: '', clickAnim: true };
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        applySettings(Object.assign(defaultSettings, s));
        return s;
      }
    } catch(e){}
    applySettings(defaultSettings);
    return defaultSettings;
  }
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function applySettings(s) {
    settings = settings || {};
    settings.backgroundColor = s.backgroundColor || '';
    settings.backgroundImage = s.backgroundImage || '';
    settings.clickAnim = typeof s.clickAnim === 'boolean' ? s.clickAnim : true;

    if (settings.backgroundImage) {
      document.body.style.background = `url(${settings.backgroundImage}) center/cover fixed`;
    } else if (settings.backgroundColor) {
      document.body.style.background = settings.backgroundColor;
    } else {
      document.body.style.background = null;
    }
    toggleClickAnim.checked = !!settings.clickAnim;
    if (settings.backgroundColor) bgColor.value = settings.backgroundColor;
  }

  // --- tile actions ---
  function openModal(mode, index = null) {
    modal.classList.remove('hidden');
    if (mode === 'add') {
      modalTitle.textContent = 'إضافة تطبيق';
      tileTitle.value = '';
      tileUrl.value = '';
      tileIcon.value = '';
      tileColor.value = '#4a90e2';
      modalSave.onclick = () => {
        const newTile = {
          title: tileTitle.value || tileUrl.value,
          url: tileUrl.value || '#',
          icon: tileIcon.value || '•',
          color: tileColor.value || '#666'
        };
        if (index !== null && tiles[index] && tiles[index].placeholder) {
          tiles[index] = newTile;
        } else {
          tiles.push(newTile);
        }
        modal.classList.add('hidden');
        render();
      };
    } else if (mode === 'edit') {
      modalTitle.textContent = 'تعديل التطبيق';
      const t = tiles[index];
      tileTitle.value = t.title || '';
      tileUrl.value = t.url || '';
      tileIcon.value = t.icon || '';
      tileColor.value = t.color || '#666';
      modalSave.onclick = () => {
        tiles[index] = {
          title: tileTitle.value || tileUrl.value,
          url: tileUrl.value || '#',
          icon: tileIcon.value || '•',
          color: tileColor.value || '#666'
        };
        modal.classList.add('hidden');
        render();
      };
    }
  }
  modalCancel.addEventListener('click', ()=> modal.classList.add('hidden'));

  btnAdd.addEventListener('click', ()=> openModal('add'));

  function removeTile(i){
    if (!confirm('هل تود حذف الاختصار؟')) return;
    tiles.splice(i,1);
    render();
  }
  function move(from,to){
    if (to < 0 || to >= tiles.length) return;
    const [item] = tiles.splice(from,1);
    tiles.splice(to,0,item);
    render();
  }

  // --- drag & drop (HTML5) ---
  let draggingIndex = null;
  function onDragStart(e){
    const idx = Number(this.getAttribute('data-index'));
    draggingIndex = idx;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e){
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function onDrop(e){
    e.preventDefault();
    const targetIndex = Number(this.getAttribute('data-index'));
    if (draggingIndex === null || draggingIndex === targetIndex) return;
    const [item] = tiles.splice(draggingIndex,1);
    tiles.splice(targetIndex,0,item);
    draggingIndex = null;
    render();
  }
  function onDragEnd(){
    draggingIndex = null;
    render();
  }

  // --- settings handlers ---
  btnSettings.addEventListener('click', ()=> settingsModal.classList.remove('hidden'));
  settingsClose.addEventListener('click', ()=> settingsModal.classList.add('hidden'));

  bgColor.addEventListener('change', e=>{
    settings.backgroundColor = e.target.value;
    settings.backgroundImage = '';
    applySettings(settings);
  });
  bgImage.addEventListener('change', e=>{
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      settings.backgroundImage = ev.target.result;
      settings.backgroundColor = '';
      applySettings(settings);
    };
    reader.readAsDataURL(f);
  });

  settingsSave.addEventListener('click', ()=>{
    settings.clickAnim = toggleClickAnim.checked;
    saveSettings();
    settingsModal.classList.add('hidden');
  });
  settingsReset.addEventListener('click', ()=>{
    if (!confirm('إعادة الإعدادات للوضع الافتراضي؟')) return;
    localStorage.removeItem(SETTINGS_KEY);
    applySettings({backgroundColor:'', backgroundImage:'', clickAnim:true});
    saveSettings();
  });

  // --- search quick open ---
  searchInput.addEventListener('keydown', e=>{
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (!q) return;
      const url = q.includes('http') ? q : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      window.open(url, '_blank');
    }
  });

  // --- small utilities ---
  function removeAllPlaceholders(){
    // keep exactly one placeholder at start
    tiles = tiles.filter(t => !t.placeholder);
    tiles.unshift(DEFAULTS[0]);
  }

  // initial render
  removeAllPlaceholders();
  render();

  // make sure settings saved whenever changed (debounced small)
  window.addEventListener('beforeunload', () => {
    saveTiles();
    saveSettings();
  });

  // expose minimal API for console tweaking
  window.startPage = {tiles, settings, render, saveTiles, saveSettings};

})();
