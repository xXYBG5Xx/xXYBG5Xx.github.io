// الوقت
function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

// خلفية فخمة
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let blobs = Array.from({ length: 12 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: 120 + Math.random() * 150,
  dx: (Math.random() - 0.5) * 0.4,
  dy: (Math.random() - 0.5) * 0.4
}));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blobs.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x < -200 || b.x > canvas.width + 200) b.dx *= -1;
    if (b.y < -200 || b.y > canvas.height + 200) b.dy *= -1;

    const grad = ctx.createRadialGradient(
      b.x, b.y, 0,
      b.x, b.y, b.r
    );

    grad.addColorStop(0, "rgba(79,172,254,0.25)");
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
draw();

window.onresize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
};
