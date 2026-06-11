// Minimal landing page with monochromatic hydra-synth visuals
// Each user gets a unique pattern based on a seeded random

import Hydra from 'hydra-synth';

const hydraCanvas = document.getElementById('hydra-bg');
const interactionCanvas = document.createElement('canvas');
const interactionCtx = interactionCanvas.getContext('2d');
const isLandingPage = /(^\/|\/index\.html)$/i.test(window.location.pathname);
// Pointer state for interactive modulation (normalized 0..1)
let mouseX = 0.5;
let mouseY = 0.5;
let smoothMouseX = 0.5;
let smoothMouseY = 0.5;
let pointerActivity = 0;
let pointerVelocity = 0;
let smoothPointerVelocity = 0;
let pointerVelX = 0;
let pointerVelY = 0;
let smoothPointerVelX = 0;
let smoothPointerVelY = 0;
let pointerHeading = 0;
let smoothPointerHeading = 0;
let lastPointerX = 0.5;
let lastPointerY = 0.5;
let lastPointerTime = performance.now();

if (isLandingPage) {
  window.addEventListener('pointermove', (e) => {
    if (!hydraCanvas) return;
    const rect = hydraCanvas.getBoundingClientRect();
    const now = performance.now();
    const dt = Math.max(8, now - lastPointerTime);
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
    const dx = mouseX - lastPointerX;
    const dy = mouseY - lastPointerY;
    const moveAmount = Math.hypot(dx, dy);

    // Deadzone removes touchpad micro jitter when dragging very slowly.
    if (moveAmount < 0.0006) {
      pointerVelX = 0;
      pointerVelY = 0;
      pointerVelocity = 0;
    } else {
      pointerVelX = dx / (dt * 0.001);
      pointerVelY = dy / (dt * 0.001);
      pointerVelocity = Math.min(4, Math.hypot(pointerVelX, pointerVelY));
      if (pointerVelocity > 0.05) {
        pointerHeading = Math.atan2(pointerVelY, pointerVelX);
      }
    }
    lastPointerX = mouseX;
    lastPointerY = mouseY;
    lastPointerTime = now;
    pointerActivity = 1;
  }, { passive: true });
}

function shortestAngleDelta(from, to) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

// Generate a unique seed for this user (persist in localStorage)
function getUserSeed() {
  let seed = "7rh89kwb9q2";
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('hydra-seed', seed);
  }
  return seed;
}

// Simple hash function to convert seed to numbers
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const userSeed = getUserSeed();
const seedNum = hashCode(userSeed);

// Generate user-specific parameters from seed
const hue = (seedNum % 360) / 360; // 0-1 range for hue
const pattern = seedNum % 5; // Choose from 5 different wild patterns
const speed = 0.02 + (seedNum % 15) / 80; // More speed variation
const noiseScale = 8 + (seedNum % 12); // Higher noise scales
const chaos = 0.3 + (seedNum % 20) / 50; // Chaos factor

// Device pixel ratio aware resize
function resizeCanvas(targetWidth, targetHeight, scale = 1) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.round(targetWidth * dpr * scale);
  const h = Math.round(targetHeight * dpr * scale);
  if (hydraCanvas) {
    hydraCanvas.width = w;
    hydraCanvas.height = h;
    hydraCanvas.style.width = targetWidth + 'px';
    hydraCanvas.style.height = targetHeight + 'px';
  }
  interactionCanvas.width = w;
  interactionCanvas.height = h;
}

function doResize() {
  const isMobile = window.innerWidth < 900;
  const scale = isMobile ? 0.7 : 1.0;
  resizeCanvas(window.innerWidth, window.innerHeight, scale);
}
doResize();
window.addEventListener('resize', doResize);

// Respect prefers-reduced-motion (used by ripple setup)
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// (Removed separate ripple-layer drawing — pointer now modulates the Hydra synth directly.)

// Respect prefers-reduced-motion

// Initialize Hydra
let hydraInstance = null;
let rafId = null;

function drawPointerField() {
  if (!interactionCtx) return;

  const w = interactionCanvas.width;
  const h = interactionCanvas.height;
  interactionCtx.clearRect(0, 0, w, h);

  if (!isLandingPage) return;

  const t = performance.now() * 0.001;
  const x = smoothMouseX * w;
  const y = smoothMouseY * h;
  const speedBoost = Math.min(1.2, smoothPointerVelocity * 0.5);
  const baseline = Math.min(0.2, 0.07 + pointerActivity * 0.04 + speedBoost * 0.05);
  const baseGray = Math.round(baseline * 255);
  interactionCtx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`;
  interactionCtx.fillRect(0, 0, w, h);

  const cornerDist = Math.max(
    Math.hypot(x, y),
    Math.hypot(w - x, y),
    Math.hypot(x, h - y),
    Math.hypot(w - x, h - y)
  );
  const fieldRadius = cornerDist * (1.03 + 0.04 * Math.sin(t * 1.7));
  const nearBoost = Math.min(0.72, 0.24 + pointerActivity * 0.12 + speedBoost * 0.2);

  const fullField = interactionCtx.createRadialGradient(x, y, 0, x, y, fieldRadius);
  fullField.addColorStop(0, `rgba(255, 255, 255, ${nearBoost})`);
  fullField.addColorStop(0.25, `rgba(255, 255, 255, ${nearBoost * 0.46})`);
  fullField.addColorStop(0.6, `rgba(255, 255, 255, ${nearBoost * 0.14})`);
  fullField.addColorStop(1, 'rgba(255, 255, 255, 0.01)');

  interactionCtx.save();
  interactionCtx.globalCompositeOperation = 'lighter';
  interactionCtx.fillStyle = fullField;
  interactionCtx.fillRect(0, 0, w, h);

  const heading = smoothPointerHeading;
  const coreSize = Math.max(w, h) * (0.1 + speedBoost * 0.05 + pointerActivity * 0.03);
  interactionCtx.translate(x, y);
  interactionCtx.rotate(heading + (0.04 + speedBoost * 0.12) * Math.sin(t * 2.2));
  interactionCtx.scale(1.25 + speedBoost * 0.35, 0.78);
  const core = interactionCtx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
  core.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  core.addColorStop(0.45, 'rgba(255, 255, 255, 0.42)');
  core.addColorStop(1, 'rgba(255, 255, 255, 0)');
  interactionCtx.fillStyle = core;
  interactionCtx.beginPath();
  interactionCtx.arc(0, 0, coreSize, 0, Math.PI * 2);
  interactionCtx.fill();
  interactionCtx.restore();

  // Keep viewport borders calmer to avoid stretched-looking edge distortion.
  const edgeMaskRadius = Math.hypot(w * 0.5, h * 0.5) * 1.02;
  const edgeMask = interactionCtx.createRadialGradient(
    w * 0.5,
    h * 0.5,
    edgeMaskRadius * 0.68,
    w * 0.5,
    h * 0.5,
    edgeMaskRadius
  );
  edgeMask.addColorStop(0, 'rgba(255, 255, 255, 1)');
  edgeMask.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
  interactionCtx.globalCompositeOperation = 'destination-in';
  interactionCtx.fillStyle = edgeMask;
  interactionCtx.fillRect(0, 0, w, h);
  interactionCtx.globalCompositeOperation = 'source-over';
}

function initHydra() {
  if (hydraInstance || prefersReducedMotion()) return;
  
  hydraInstance = new Hydra({ 
    canvas: hydraCanvas, 
    makeGlobal: false, 
    detectAudio: false, 
    autoLoop: false,
    precision: 'mediump' 
  });
  
  const { osc, noise, shape, src, s0, o0, o1 } = hydraInstance.synth;
  s0.init({ src: interactionCanvas });
  
  // Wild, unpredictable, noisy monochromatic patterns
  // Each pattern is unique to the user but consistent across visits
  
  switch(pattern) {
    case 0: // Chaotic noise waves
      noise(noiseScale, speed * 2)
        .modulateScale(
          noise(noiseScale * 0.5, speed * 1.5).brightness(-0.1),
          chaos
        )
        .modulate(
          osc(3, speed * 0.3).rotate(() => Math.sin(hydraInstance.synth.time * speed * 0.5) * 2),
          0.002
        )
        .color(hue, hue + 0.15, hue + 0.08)
        .contrast(1.3)
        .saturate(0.4)
        .out(o1);
      break;
      
    case 1: // Turbulent flows
      noise(noiseScale * 1.2, speed * 3)
        .mult(
          osc(5, -speed * 0.8, hue).rotate(() => hydraInstance.synth.time * speed)
        )
        .modulateRotate(
          noise(noiseScale * 0.7, speed * 1.2),
          () => Math.sin(hydraInstance.synth.time * speed * 0.8) * chaos * 2
        )
        .color(hue, hue + 0.2, hue + 0.1)
        .contrast(1.2)
        .saturate(0.45)
        .out(o1);
      break;
      
    case 2: // Distorted feedback
      noise(noiseScale, speed * 2.5)
        .diff(osc(8, speed * 0.2, hue))
        .modulateScale(
          noise(noiseScale * 0.8, speed).brightness(0.1),
          1 + chaos
        )
        .add(
          noise(noiseScale * 1.5, speed * 1.8).brightness(-0.2),
          0.3
        )
        .color(hue, hue + 0.18, hue + 0.09)
        .contrast(1.4)
        .saturate(0.35)
        .out(o1);
      break;
      
    case 3: // Layered chaos
      noise(noiseScale * 0.8, speed * 2)
        .layer(
          noise(noiseScale * 1.5, speed * 1.3)
            .invert()
            .brightness(-0.2)
        )
        .modulate(
          osc(4, -speed * 0.5).rotate(1.57),
          chaos * 0.8
        )
        .modulatePixelate(
          noise(3, speed * 0.8),
          100 + chaos * 200,
          50 + chaos * 100
        )
        .color(hue, hue + 0.16, hue + 0.07)
        .contrast(1.25)
        .saturate(0.4)
        .out(o1);
      break;
      
    case 4: // Organic turbulence
      noise(noiseScale * 1.1, speed * 2.8)
        .mult(noise(noiseScale * 0.6, speed * 1.6).brightness(0.3))
        .modulateScale(
          osc(6, speed * 0.4).kaleid(2),
          1 + chaos * 0.8
        )
        .modulate(
          noise(noiseScale * 0.9, speed * 2.2),
          0.003
        )
        .add(
          noise(noiseScale * 2, speed * 3.5).brightness(-0.3),
          0.25
        )
        .color(hue, hue + 0.22, hue + 0.11)
        .contrast(1.35)
        .saturate(0.38)
        .out(o1);
      break;
  }

  // Pointer response is baked into the same field (no visible overlay layer).
  // A hidden offscreen canvas provides a single local influence area.
  src(o1)
    .modulate(
      noise(7, 0.05)
        .mult(src(s0)),
      () => 0.0035 + pointerActivity * 0.009 + smoothPointerVelocity * 0.004
    )
    .modulateScale(
      noise(3, 0.02)
        .mult(src(s0)),
      () => 1.012 + pointerActivity * 0.03 + smoothPointerVelocity * 0.017
    )
    .out(o0);
  
  // Start render loop
  let lastTime = performance.now();
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;
    if (isLandingPage) {
      smoothMouseX += (mouseX - smoothMouseX) * 0.11;
      smoothMouseY += (mouseY - smoothMouseY) * 0.11;
      smoothPointerVelocity += (pointerVelocity - smoothPointerVelocity) * 0.18;
      smoothPointerVelX += (pointerVelX - smoothPointerVelX) * 0.18;
      smoothPointerVelY += (pointerVelY - smoothPointerVelY) * 0.18;
      smoothPointerHeading += shortestAngleDelta(smoothPointerHeading, pointerHeading) * 0.14;
      pointerVelocity *= 0.9;
      pointerVelX *= 0.88;
      pointerVelY *= 0.88;
      pointerActivity *= 0.965;
      if (pointerActivity < 0.001) pointerActivity = 0;
    } else {
      pointerActivity = 0;
      pointerVelocity = 0;
      smoothPointerVelocity = 0;
      pointerVelX = 0;
      pointerVelY = 0;
      smoothPointerVelX = 0;
      smoothPointerVelY = 0;
      pointerHeading = 0;
      smoothPointerHeading = 0;
    }
    drawPointerField();
    hydraInstance.tick(dt);
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

function stopHydra() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (hydraInstance) {
    hydraInstance = null;
  }
}

// Pause when tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopHydra();
  } else if (!prefersReducedMotion()) {
    initHydra();
  }
});

// Auto-start
if (!prefersReducedMotion()) {
  initHydra();
}