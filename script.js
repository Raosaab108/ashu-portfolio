/* ---------- Three.js particle hero ---------- */
(function heroParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 55;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const COUNT = window.innerWidth < 700 ? 900 : 2200;
  const palette = [0x7C5CFF, 0x22D3EE, 0xF472B6].map(c => new THREE.Color(c));
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const r = 20 + Math.random() * 55;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.55, vertexColors: true, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Wireframe core for depth
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(9, 1),
    new THREE.MeshBasicMaterial({ color: 0x7C5CFF, wireframe: true, transparent: true, opacity: 0.25 })
  );
  scene.add(core);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    const t = clock.getElapsedTime();
    points.rotation.y = t * 0.04;
    points.rotation.x = t * 0.015;
    core.rotation.y = -t * 0.15;
    core.rotation.x = t * 0.1;
    camera.position.x += (mouse.x * 8 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 5 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();
})();

/* ---------- Nav, progress bar ---------- */
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Scroll reveal, skill bars, counters ---------- */
function countUp(el) {
  const target = +el.dataset.count;
  const start = performance.now();
  const dur = 1400;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('in');
    el.querySelectorAll('.bar i').forEach(b => { b.style.width = b.dataset.w + '%'; });
    el.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(el);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 90 + 'ms';
  io.observe(el);
});

/* ---------- Card tilt ---------- */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ---------- Contact form (front-end only) ---------- */
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('form-note').textContent = 'Thanks! Your message is noted. This demo form does not send data yet.';
  e.target.reset();
});

document.getElementById('year').textContent = new Date().getFullYear();
