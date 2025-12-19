let vantaEffect;

function initVanta(type) {
  if (vantaEffect) vantaEffect.destroy();

  if (type === 'none') {
    document.getElementById('vanta-bg').style.background = 'ur[](https://source.unsplash.com/random/1920x1080?nature) center/cover';
    return;
  }

  const options = {
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1.0,
    scaleMobile: 1.0
  };

  if (type === 'dots') VANTA.DOTS(options);
  if (type === 'waves') VANTA.WAVES(options);
  if (type === 'net') VANTA.NET(options);

  vantaEffect = VANTA.current;
}

initVanta('dots'); // البداية بنقاط بسيطة

document.getElementById('effect-select').addEventListener('change', (e) => {
  initVanta(e.target.value);
});

document.getElementById('apply-bg').addEventListener('click', () => {
  const url = document.getElementById('bg-url').value;
  if (url) {
    document.getElementById('vanta-bg').style.background = `url(${url}) center/cover`;
    if (vantaEffect) vantaEffect.destroy();
  }
});

document.getElementById('apply-filter').addEventListener('click', () => {
  const filter = document.getElementById('filter-select').value;
  document.getElementById('vanta-bg').style.filter = filter;
});

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = document.getElementById('search-input').value;
  if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
});