// الوقت
function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

// خلفية تفاعلية
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let particles = Array.from({ length: 80 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 0.5,
  vy: (Math.random() - 0.5) * 0.5
}));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();

window.onresize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
};
