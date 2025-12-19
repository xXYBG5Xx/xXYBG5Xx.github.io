// تحديث الساعة
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('ar-SA');
}
setInterval(updateClock, 1000);

// إضافة موقع جديد مع أيقونة الموقع
function addShortcut() {
    let url = prompt("أدخل رابط الموقع (مثال: google.com):");
    if (url) {
        if (!url.startsWith('http')) url = 'https://' + url;
        const grid = document.getElementById('shortcutsGrid');
        const div = document.createElement('div');
        div.className = 'shortcut-item';
        // استخدام خدمة Google لجلب الأيقونة (Favicon)
        const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
        div.innerHTML = `<img src="${iconUrl}" width="48"><p>${url.split('//')[1]}</p>`;
        grid.insertBefore(div, grid.firstChild);
    }
}

// تغيير الخلفية وإضافة بلور
function changeBg(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.body.style.backgroundImage = `url('${e.target.result}')`;
        document.body.style.backgroundSize = 'cover';
    };
    reader.readAsDataURL(file);
}

function applyBlur(val) {
    document.querySelector('.animated-bg').style.filter = `blur(${val}px)`;
}