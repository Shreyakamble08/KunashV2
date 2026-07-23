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
// Hero orbit animation
//
// Performance changes vs. the original:
// 1. DOM nodes are queried ONCE per create*Orbit() call and cached
//    in arrays (outerItemsDesktop / innerItemsDesktop / outerItemsMobile).
//    The previous version ran document.querySelectorAll() inside the
//    rAF loop -> a full DOM query + style read/write cycle 60 times a
//    second, which is one of the biggest avoidable causes of main-thread
//    work (TBT/INP) on this page.
// 2. When an orbit is "paused" (mouse hover / touch), the loop now
//    skips ALL style writes entirely instead of recomputing and
//    re-applying identical inline styles to every item every frame.
// 3. An IntersectionObserver fully starts/stops each rAF loop
//    (cancelAnimationFrame) when its section scrolls out of view, so
//    the animation costs nothing while the user is reading the rest
//    of the page.
// 4. Touch listeners are marked { passive: true } since they never
//    call preventDefault(), so the browser doesn't have to wait on
//    them before starting a scroll/touch response.
// 5. Initialization runs on DOMContentLoaded instead of window 'load',
//    so the decorative orbit doesn't sit idle waiting for every image
//    on the entire page (including below-the-fold sections) to finish
//    downloading before it appears — layout metrics only depend on
//    CSS, not on images having loaded.
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

// Desktop orbit state
let angleOuterDesktop = 0;
let angleInnerDesktop = 0;
let pausedDesktop = false;
let animationIdDesktop = null;
let outerItemsDesktop = [];
let innerItemsDesktop = [];

// Mobile orbit state
let angleOuterMobile = 0;
let pausedMobile = false;
let animationIdMobile = null;
let outerItemsMobile = [];

const OUTER_SPEED = 0.25;
const INNER_SPEED = 0.38;
const MOBILE_SPEED = 0.28;

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
    item.addEventListener('mouseleave', () => { pausedDesktop = false; });
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
    item.addEventListener('mouseleave', () => { pausedDesktop = false; });
    innerFrag.appendChild(item);
  });
  innerContainer.appendChild(innerFrag);

  // Cache the freshly-created nodes ONCE, instead of re-querying every frame
  outerItemsDesktop = Array.from(outerContainer.children);
  innerItemsDesktop = Array.from(innerContainer.children);
}

function animateDesktopOrbit() {
  const container = document.getElementById('dual-orbital-desktop');

  if (!container || (!outerItemsDesktop.length && !innerItemsDesktop.length)) {
    animationIdDesktop = requestAnimationFrame(animateDesktopOrbit);
    return;
  }

  // Skip all reads/writes while paused — position is already correct,
  // no need to recompute and re-apply identical styles every frame.
  if (!pausedDesktop) {
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

    angleOuterDesktop += OUTER_SPEED;
    angleInnerDesktop -= INNER_SPEED;
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
    item.addEventListener('touchend', () => { setTimeout(() => { pausedMobile = false; }, 300); }, { passive: true });
    item.addEventListener('mouseenter', () => { pausedMobile = true; });
    item.addEventListener('mouseleave', () => { pausedMobile = false; });
    outerFrag.appendChild(item);
  });
  outerContainer.appendChild(outerFrag);

  outerItemsMobile = Array.from(outerContainer.children);
}

function animateMobileOrbit() {
  const container = document.getElementById('dual-orbital-mobile');

  if (!container || !outerItemsMobile.length) {
    animationIdMobile = requestAnimationFrame(animateMobileOrbit);
    return;
  }

  if (!pausedMobile) {
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

    angleOuterMobile += MOBILE_SPEED;
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
  createDesktopOrbit();
  animateDesktopOrbit();
  isDesktopInitialized = true;
}

function initMobileOrbit() {
  if (animationIdMobile) {
    cancelAnimationFrame(animationIdMobile);
    animationIdMobile = null;
  }
  createMobileOrbit();
  animateMobileOrbit();
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
  } else {
    setTimeout(() => {
      pausedDesktop = false;
      pausedMobile = false;
    }, 500);
  }
});

// Fully stop the rAF loops (not just skip position updates) once the
// Hero has scrolled well out of view, and resume when it's back —
// removes 100% of the orbit's main-thread cost for the ~90% of the
// page the user spends scrolled past the Hero.
const heroOrbitDesktopEl = document.getElementById('dual-orbital-desktop');
const heroOrbitMobileEl = document.getElementById('dual-orbital-mobile');

function observeHeroVisibility(el, getAnimId, setAnimId, animateFn) {
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const currentId = getAnimId();
      if (entry.isIntersecting) {
        if (!currentId) {
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
  animateDesktopOrbit
);
observeHeroVisibility(
  heroOrbitMobileEl,
  () => animationIdMobile,
  (id) => { animationIdMobile = id; },
  animateMobileOrbit
);