// ============================================================
// Counters (Projects / Happy Clients / Years Experience style)
// ============================================================
function animateCounter(counter) {
  const target = +counter.getAttribute('data-target');
  let count = 0;
  const increment = target / 100;

  const updateCount = () => {
    count += increment;
    if (count < target) {
      counter.innerText = Math.ceil(count);
      requestAnimationFrame(updateCount);
    } else {
      counter.innerText = target;
    }
  };

  updateCount();
}

const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// ============================================================
// Timeline progress animation
// ============================================================
const timelineSection = document.querySelector('#industriesTimeline');
const timelineProgress = document.querySelector('#timelineProgress');
const timelineProgressMobile = document.querySelector('#timelineProgressMobile');

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (timelineProgress) timelineProgress.style.width = '100%';
      if (timelineProgressMobile) timelineProgressMobile.style.height = '100%';
      timelineObserver.unobserve(timelineSection);
    }
  });
}, { threshold: 0.4 });

if (timelineSection) timelineObserver.observe(timelineSection);

// ============================================================
// Contact form
// NOTE: this homepage has no <form> element, so the previous
// unconditional `document.querySelector("form")` + listener setup
// threw a runtime error on every load (form was null). Guarded so
// it simply does nothing when there's no form on the page, and
// works unchanged on pages that do have one.
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    };

    if (Object.values(data).some(v => !v)) {
      return showToast('Please fill all fields', 'error');
    }

    if (!/^[A-Za-z ]{3,40}$/.test(data.name)) {
      return showToast('Invalid name', 'error');
    }

    if (!/^[0-9+ ]{10,15}$/.test(data.phone)) {
      return showToast('Invalid phone number', 'error');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return showToast('Invalid email address', 'error');
    }

    if (data.message.length < 10) {
      return showToast('Message too short', 'error');
    }

    showToast('Sending message...', 'info');

    try {
      await fakeAPI(data);
      showToast('Message sent successfully 🚀', 'success');
      form.reset();
    } catch (err) {
      showToast('Submission failed. Try again', 'error');
    }
  });

  function fakeAPI(data) {
    console.log('Form Data:', data);
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }

  function showToast(msg, type = 'info') {
    let bg = '#f97316';
    if (type === 'success') bg = '#22c55e';
    if (type === 'error') bg = '#ef4444';

    Toastify({
      text: msg,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      close: true,
      style: { background: bg, borderRadius: '12px', fontSize: '13px' }
    }).showToast();
  }
});

// ============================================================
// ============================================================
// Hero orbit animation
//
// STABILITY FIX (this revision):
// The previous version advanced each orbit's angle by a fixed amount
// EVERY requestAnimationFrame callback (e.g. `angleOuterDesktop +=
// OUTER_SPEED`). rAF does not guarantee a fixed interval — it fires at
// whatever the display's actual refresh rate is (60Hz vs 120Hz/144Hz
// screens), and drops frames under main-thread load (scrolling, other
// scripts, tab throttling). Since the code assumed every callback = the
// same slice of time, the orbit visibly sped up, slowed down, or
// stuttered depending on frame timing — exactly the "unstable /
// fluctuating" symptom described.
//
// Fix: motion is now driven by elapsed wall-clock time (delta-time)
// via the timestamp requestAnimationFrame already provides, instead of
// a fixed per-callback step. Degrees/second is calibrated from the
// original degrees/frame constants assuming a 60fps baseline, so the
// animation's speed, duration, and easing feel are unchanged on a
// normal 60Hz display — it's simply now correct (not frame-count
// dependent) on any refresh rate, and stays perfectly smooth when
// frames are dropped instead of jumping or stalling.
//
// A single-frame delta is also clamped (MAX_DELTA_MS) so that resuming
// from a paused/hidden/off-screen state (where potentially seconds have
// passed since the last real update) doesn't cause the orbit to "jump"
// forward — it simply continues at normal speed from where it left off.
//
// PERSISTENCE (new):
// The current angle of each orbit is periodically saved to
// localStorage (throttled, and also on tab-hide/unload) and restored
// on the next load/visit, so a reload continues the orbit from
// roughly where it left off instead of always snapping back to its
// start position. This doesn't change the animation itself (same
// speed/direction/easing) — it only changes the starting angle on a
// fresh page load, matching what a continuously-running orbit would
// look like across a reload.
// ============================================================

const outerImages = [
  './images/webthumb3.jpg',
  './images/webthumb2.png',
  './images/webthumb11.webp',
  './images/webthumb4.jpg',
  './images/webthumb5.jpg',
  './images/webthumb6.jpg',
  './images/webthumb7.jpg',
  './images/webthumb8.jpg',
  './images/webthumb9.jpg',
  './images/webthumb10.jpg',
  './images/thumbnail1.png',
  './images/webthumb12.jpg'
];

const innerImages = [
  './images/webthumb13.jpg',
  './images/webthumb14.jpg',
  './images/webthumb15.jpg',
  './images/webthumb16.jpg',
  './images/webthumb17.jpg',
  './images/webthumb18.jpg',
  './images/webthumb19.jpg',
  './images/webthumb20.jpg'
];

// ----- Persistence -----
const ORBIT_STORAGE_KEY = 'heroOrbitAngles:v1';
const ORBIT_SAVE_INTERVAL_MS = 1000;

function loadOrbitState() {
  try {
    const raw = localStorage.getItem(ORBIT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.outerDesktop === 'number' &&
      typeof parsed.innerDesktop === 'number' &&
      typeof parsed.outerMobile === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch (err) {
    // Storage disabled (private browsing), quota exceeded, or corrupt
    // JSON — animation just starts from 0 as before, no functional
    // change beyond that.
    return null;
  }
}

function saveOrbitState() {
  try {
    localStorage.setItem(
      ORBIT_STORAGE_KEY,
      JSON.stringify({
        outerDesktop: angleOuterDesktop,
        innerDesktop: angleInnerDesktop,
        outerMobile: angleOuterMobile
      })
    );
  } catch (err) {
    // Ignore — persistence is a nice-to-have, never allowed to break
    // or throw into the animation loop.
  }
}

// Restore any previously saved angles up front so both orbits start
// from the same continued position regardless of which layout
// (desktop/mobile) initializes first.
const savedOrbitState = loadOrbitState();

// Desktop orbit state
let angleOuterDesktop = savedOrbitState ? savedOrbitState.outerDesktop : 0;
let angleInnerDesktop = savedOrbitState ? savedOrbitState.innerDesktop : 0;
let pausedDesktop = false;
let animationIdDesktop = null;
let outerItemsDesktop = [];
let innerItemsDesktop = [];
let lastTimestampDesktop = null;

// Mobile orbit state
let angleOuterMobile = savedOrbitState ? savedOrbitState.outerMobile : 0;
let pausedMobile = false;
let animationIdMobile = null;
let outerItemsMobile = [];
let lastTimestampMobile = null;

// Original constants were "degrees per rAF callback" tuned by eye
// against a 60fps baseline. Converted to degrees/second so motion is
// now time-based rather than frame-based; the visual speed at 60Hz is
// identical to before.
const BASE_FPS = 60;
const OUTER_SPEED = 0.25;   // degrees/frame @60fps (kept for reference)
const INNER_SPEED = 0.38;
const MOBILE_SPEED = 0.28;
const OUTER_DEG_PER_SEC = OUTER_SPEED * BASE_FPS;
const INNER_DEG_PER_SEC = INNER_SPEED * BASE_FPS;
const MOBILE_DEG_PER_SEC = MOBILE_SPEED * BASE_FPS;

// Guard against huge jumps after a tab was backgrounded/throttled or
// the loop was fully stopped and just resumed (IntersectionObserver).
const MAX_DELTA_MS = 100;

function createDesktopOrbit() {
  const container = document.getElementById('dual-orbital-desktop');
  const outerContainer = document.getElementById('outer-orbit-desktop');
  const innerContainer = document.getElementById('inner-orbit-desktop');

  if (!container || !outerContainer || !innerContainer) return;

  outerContainer.innerHTML = '';
  innerContainer.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const w = rect.width || 900;
  const h = rect.height || 460;

  let outerSize, innerSize, outerRadiusX, outerRadiusY, innerRadiusX, innerRadiusY;

  if (w <= 850) {
    outerSize = 82;
    innerSize = 60;
    outerRadiusX = w * 0.44;
    outerRadiusY = h * 0.34;
    innerRadiusX = w * 0.24;
    innerRadiusY = h * 0.18;
  } else if (w <= 1024) {
    outerSize = 96;
    innerSize = 72;
    outerRadiusX = w * 0.45;
    outerRadiusY = h * 0.35;
    innerRadiusX = w * 0.25;
    innerRadiusY = h * 0.19;
  } else {
    outerSize = 115;
    innerSize = 85;
    outerRadiusX = w * 0.46;
    outerRadiusY = h * 0.35;
    innerRadiusX = w * 0.26;
    innerRadiusY = h * 0.19;
  }

  const centerX = w / 2;
  const centerY = h / 2;

  container.dataset.outerRadiusX = outerRadiusX;
  container.dataset.outerRadiusY = outerRadiusY;
  container.dataset.innerRadiusX = innerRadiusX;
  container.dataset.innerRadiusY = innerRadiusY;
  container.dataset.centerX = centerX;
  container.dataset.centerY = centerY;
  container.dataset.outerSize = outerSize;
  container.dataset.innerSize = innerSize;

  const outerCount = w <= 850 ? 10 : 12;
  const innerCount = w <= 850 ? 7 : 8;

  const outerFrag = document.createDocumentFragment();
  const outerSlice = outerImages.slice(0, outerCount);
  outerSlice.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'orbital-item outer-item';
    item.style.width = outerSize + 'px';
    item.style.height = outerSize + 'px';
    item.style.borderRadius = Math.max(10, Math.min(16, outerSize * 0.16)) + 'px';
    item.innerHTML = `<img src="${src}" alt="Team member ${i + 1}" loading="lazy" decoding="async">`;
    item.addEventListener('mouseenter', () => { pausedDesktop = true; });
    item.addEventListener('mouseleave', () => { pausedDesktop = false; lastTimestampDesktop = null; });
    outerFrag.appendChild(item);
  });
  outerContainer.appendChild(outerFrag);

  const innerFrag = document.createDocumentFragment();
  const innerSlice = innerImages.slice(0, innerCount);
  innerSlice.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'orbital-item inner-item';
    item.style.width = innerSize + 'px';
    item.style.height = innerSize + 'px';
    item.style.borderRadius = Math.max(10, Math.min(16, innerSize * 0.16)) + 'px';
    item.innerHTML = `<img src="${src}" alt="Team member ${i + 1}" loading="lazy" decoding="async">`;
    item.addEventListener('mouseenter', () => { pausedDesktop = true; });
    item.addEventListener('mouseleave', () => { pausedDesktop = false; lastTimestampDesktop = null; });
    innerFrag.appendChild(item);
  });
  innerContainer.appendChild(innerFrag);

  // Cache the freshly-created nodes ONCE, instead of re-querying every frame
  outerItemsDesktop = Array.from(outerContainer.children);
  innerItemsDesktop = Array.from(innerContainer.children);
}

function animateDesktopOrbit(timestamp) {
  const container = document.getElementById('dual-orbital-desktop');

  if (!container || (!outerItemsDesktop.length && !innerItemsDesktop.length)) {
    lastTimestampDesktop = null;
    animationIdDesktop = requestAnimationFrame(animateDesktopOrbit);
    return;
  }

  if (!pausedDesktop) {
    // Compute a clamped, frame-rate-independent delta.
    let deltaMs = lastTimestampDesktop === null ? 1000 / BASE_FPS : timestamp - lastTimestampDesktop;
    if (deltaMs < 0) deltaMs = 0;
    if (deltaMs > MAX_DELTA_MS) deltaMs = MAX_DELTA_MS;
    lastTimestampDesktop = timestamp;
    const deltaSec = deltaMs / 1000;

    const outerRadiusX = parseFloat(container.dataset.outerRadiusX) || 400;
    const outerRadiusY = parseFloat(container.dataset.outerRadiusY) || 160;
    const innerRadiusX = parseFloat(container.dataset.innerRadiusX) || 220;
    const innerRadiusY = parseFloat(container.dataset.innerRadiusY) || 85;
    const centerX = parseFloat(container.dataset.centerX) || 450;
    const centerY = parseFloat(container.dataset.centerY) || 230;
    const outerSize = parseFloat(container.dataset.outerSize) || 96;
    const innerSize = parseFloat(container.dataset.innerSize) || 72;

    const outerHalf = outerSize / 2;
    const innerHalf = innerSize / 2;

    const outerCount = outerItemsDesktop.length;
    outerItemsDesktop.forEach((item, i) => {
      const offset = i * (360 / outerCount);
      const currentAngle = (angleOuterDesktop + offset) * (Math.PI / 180);

      const x = centerX + Math.cos(currentAngle) * outerRadiusX;
      const y = centerY + Math.sin(currentAngle) * outerRadiusY;

      const depth = Math.sin(currentAngle);
      const scale = 0.82 + depth * 0.23;
      const rotateY = depth * 14;
      const zIndex = Math.round((depth + 1) * 22) + 5;

      item.style.left = `${x - outerHalf}px`;
      item.style.top = `${y - outerHalf}px`;
      item.style.transform = `scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`;
      item.style.zIndex = zIndex;
    });

    const innerCount = innerItemsDesktop.length;
    innerItemsDesktop.forEach((item, i) => {
      const offset = i * (360 / innerCount);
      const currentAngle = (angleInnerDesktop + offset) * (Math.PI / 180);

      const x = centerX + Math.cos(currentAngle) * innerRadiusX;
      const y = centerY + Math.sin(currentAngle) * innerRadiusY;

      const depth = Math.sin(currentAngle);
      const scale = 0.87 + depth * 0.18;
      const rotateY = depth * 11;
      const zIndex = Math.round((depth + 1) * 18) + 10;

      item.style.left = `${x - innerHalf}px`;
      item.style.top = `${y - innerHalf}px`;
      item.style.transform = `scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`;
      item.style.zIndex = zIndex;
    });

    angleOuterDesktop += OUTER_DEG_PER_SEC * deltaSec;
    angleInnerDesktop -= INNER_DEG_PER_SEC * deltaSec;
  } else {
    lastTimestampDesktop = null;
  }

  animationIdDesktop = requestAnimationFrame(animateDesktopOrbit);
}

function createMobileOrbit() {
  const container = document.getElementById('dual-orbital-mobile');
  const outerContainer = document.getElementById('outer-orbit-mobile');

  if (!container || !outerContainer) return;

  outerContainer.innerHTML = '';

  const rect = container.getBoundingClientRect();
  const w = rect.width || 380;
  const h = rect.height || 540;

  const outerSize = 58;
  const outerRadiusX = w * 0.34;
  const outerRadiusY = h * 0.44;

  const centerX = w / 2;
  const centerY = h / 2;

  container.dataset.outerRadiusX = outerRadiusX;
  container.dataset.outerRadiusY = outerRadiusY;
  container.dataset.centerX = centerX;
  container.dataset.centerY = centerY;
  container.dataset.outerSize = outerSize;

  const outerCount = 10;
  const outerFrag = document.createDocumentFragment();
  const outerSlice = outerImages.slice(0, outerCount);
  outerSlice.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'orbital-item outer-item';
    item.style.width = outerSize + 'px';
    item.style.height = outerSize + 'px';
    item.style.borderRadius = Math.max(10, Math.min(16, outerSize * 0.16)) + 'px';
    item.innerHTML = `<img src="${src}" alt="Team member ${i + 1}" loading="lazy" decoding="async">`;
    item.addEventListener('touchstart', () => { pausedMobile = true; }, { passive: true });
    item.addEventListener('touchend', () => { setTimeout(() => { pausedMobile = false; lastTimestampMobile = null; }, 300); }, { passive: true });
    item.addEventListener('mouseenter', () => { pausedMobile = true; });
    item.addEventListener('mouseleave', () => { pausedMobile = false; lastTimestampMobile = null; });
    outerFrag.appendChild(item);
  });
  outerContainer.appendChild(outerFrag);

  outerItemsMobile = Array.from(outerContainer.children);
}

function animateMobileOrbit(timestamp) {
  const container = document.getElementById('dual-orbital-mobile');

  if (!container || !outerItemsMobile.length) {
    lastTimestampMobile = null;
    animationIdMobile = requestAnimationFrame(animateMobileOrbit);
    return;
  }

  if (!pausedMobile) {
    let deltaMs = lastTimestampMobile === null ? 1000 / BASE_FPS : timestamp - lastTimestampMobile;
    if (deltaMs < 0) deltaMs = 0;
    if (deltaMs > MAX_DELTA_MS) deltaMs = MAX_DELTA_MS;
    lastTimestampMobile = timestamp;
    const deltaSec = deltaMs / 1000;

    const outerRadiusX = parseFloat(container.dataset.outerRadiusX) || 129;
    const outerRadiusY = parseFloat(container.dataset.outerRadiusY) || 237;
    const centerX = parseFloat(container.dataset.centerX) || 190;
    const centerY = parseFloat(container.dataset.centerY) || 270;
    const outerSize = parseFloat(container.dataset.outerSize) || 58;
    const outerHalf = outerSize / 2;
    const count = outerItemsMobile.length;

    outerItemsMobile.forEach((item, i) => {
      const offset = i * (360 / count);
      const currentAngle = (angleOuterMobile + offset) * (Math.PI / 180);

      const x = centerX + Math.cos(currentAngle) * outerRadiusX;
      const y = centerY + Math.sin(currentAngle) * outerRadiusY;

      const depth = Math.sin(currentAngle);
      const scale = 0.82 + depth * 0.23;
      const rotateY = depth * 14;
      const zIndex = Math.round((depth + 1) * 22) + 5;

      item.style.left = `${x - outerHalf}px`;
      item.style.top = `${y - outerHalf}px`;
      item.style.transform = `scale(${scale}) perspective(600px) rotateY(${rotateY}deg)`;
      item.style.zIndex = zIndex;
    });

    angleOuterMobile += MOBILE_DEG_PER_SEC * deltaSec;
  } else {
    lastTimestampMobile = null;
  }

  animationIdMobile = requestAnimationFrame(animateMobileOrbit);
}

let resizeTimer;
let isDesktopInitialized = false;
let isMobileInitialized = false;

function initDesktopOrbit() {
  if (animationIdDesktop) {
    cancelAnimationFrame(animationIdDesktop);
    animationIdDesktop = null;
  }
  lastTimestampDesktop = null;
  createDesktopOrbit();
  animateDesktopOrbit(performance.now());
  isDesktopInitialized = true;
}

function initMobileOrbit() {
  if (animationIdMobile) {
    cancelAnimationFrame(animationIdMobile);
    animationIdMobile = null;
  }
  lastTimestampMobile = null;
  createMobileOrbit();
  animateMobileOrbit(performance.now());
  isMobileInitialized = true;
}

function initOrbits() {
  const isMobile = window.innerWidth <= 767;

  if (isMobile) {
    initMobileOrbit();
    if (animationIdDesktop) {
      cancelAnimationFrame(animationIdDesktop);
      animationIdDesktop = null;
      isDesktopInitialized = false;
    }
  } else {
    initDesktopOrbit();
    if (animationIdMobile) {
      cancelAnimationFrame(animationIdMobile);
      animationIdMobile = null;
      isMobileInitialized = false;
    }
  }
}

// Start as soon as the DOM is parsed — layout metrics only need CSS,
// not for every image on the page (including below-the-fold sections)
// to have finished downloading, so there's no need to wait for `load`.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOrbits);
} else {
  initOrbits();
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initOrbits, 300);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pausedDesktop = true;
    pausedMobile = true;
    saveOrbitState();
  } else {
    setTimeout(() => {
      pausedDesktop = false;
      pausedMobile = false;
      lastTimestampDesktop = null;
      lastTimestampMobile = null;
    }, 500);
  }
});

// Belt-and-suspenders: also save right before the page actually unloads.
window.addEventListener('pagehide', saveOrbitState);

// Throttled periodic save — independent of the rAF loop so it keeps
// working even while paused, and cheap enough (one JSON.stringify +
// one localStorage write per second) to have no measurable effect on
// TBT/INP.
setInterval(saveOrbitState, ORBIT_SAVE_INTERVAL_MS);

// Fully stop the rAF loops (not just skip position updates) once the
// Hero has scrolled well out of view, and resume when it's back —
// removes 100% of the orbit's main-thread cost for the ~90% of the
// page the user spends scrolled past the Hero.
const heroOrbitDesktopEl = document.getElementById('dual-orbital-desktop');
const heroOrbitMobileEl = document.getElementById('dual-orbital-mobile');

function observeHeroVisibility(el, getAnimId, setAnimId, animateFn, resetTimestamp) {
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const currentId = getAnimId();
      if (entry.isIntersecting) {
        if (!currentId) {
          resetTimestamp();
          setAnimId(requestAnimationFrame(animateFn));
        }
      } else if (currentId) {
        cancelAnimationFrame(currentId);
        setAnimId(null);
      }
    });
  }, { threshold: 0 });
  io.observe(el);
}

observeHeroVisibility(
  heroOrbitDesktopEl,
  () => animationIdDesktop,
  (id) => { animationIdDesktop = id; },
  animateDesktopOrbit,
  () => { lastTimestampDesktop = null; }
);
observeHeroVisibility(
  heroOrbitMobileEl,
  () => animationIdMobile,
  (id) => { animationIdMobile = id; },
  animateMobileOrbit,
  () => { lastTimestampMobile = null; }
);