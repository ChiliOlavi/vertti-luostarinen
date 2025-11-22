// Minimal landing page with monochromatic hydra-synth visuals
// Each user gets a unique pattern based on a seeded random

import Hydra from 'hydra-synth';

const hydraCanvas = document.getElementById('hydra-bg');
// Pointer state for interactive modulation (normalized 0..1)
let mouseX = 0.5;
let mouseY = 0.5;
window.addEventListener('pointermove', (e) => {
  if (!hydraCanvas) return;
  const rect = hydraCanvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) / rect.width;
  mouseY = (e.clientY - rect.top) / rect.height;
}, { passive: true });

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

function initHydra() {
  if (hydraInstance || prefersReducedMotion()) return;
  
  hydraInstance = new Hydra({ 
    canvas: hydraCanvas, 
    makeGlobal: false, 
    detectAudio: false, 
    autoLoop: false,
    precision: 'mediump' 
  });
  
  const { osc, noise, shape, gradient, voronoi, solid, s0, s1, o0 } = hydraInstance.synth;
  
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
        .out(o0);
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
        .out(o0);
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
        .out(o0);
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
        .out(o0);
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
        .out(o0);
      break;
  }
  
  // Start render loop
  let lastTime = performance.now();
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;
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