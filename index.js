
  // Function to animate a single counter
  function animateCounter(counter) {
    const target = +counter.getAttribute('data-target');
    let count = 0;
    const increment = target / 100; // Speed of counting

    const updateCount = () => {
      count += increment;
      if (count < target) {
        counter.innerText = Math.ceil(count);
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = target; // Ensure it finishes at the exact target
      }
    };

    updateCount();
  }

  // Trigger counters when they come into view
  const counters = document.querySelectorAll('.counter');
  const options = { threshold: 0.5 }; // 50% visible

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, options);

  counters.forEach(counter => observer.observe(counter));

  // Timeline Progress Animation
const section = document.querySelector("#industriesTimeline");
const progress = document.querySelector("#timelineProgress");
const progressMobile = document.querySelector("#timelineProgressMobile");

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      if (progress) progress.style.width = "100%";
      if (progressMobile) progressMobile.style.height = "100%";

      timelineObserver.unobserve(section);
    }
  });
}, { threshold: 0.4 });

if (section) timelineObserver.observe(section);

//contact form 

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // ===== Get values =====
        const data = {
            name: form.name.value.trim(),
            phone: form.phone.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim()
        };

        // ===== Step 1: Validation =====
        if (Object.values(data).some(v => !v)) {
            return showToast("Please fill all fields", "error");
        }

        if (!/^[A-Za-z ]{3,40}$/.test(data.name)) {
            return showToast("Invalid name", "error");
        }

        if (!/^[0-9+ ]{10,15}$/.test(data.phone)) {
            return showToast("Invalid phone number", "error");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            return showToast("Invalid email address", "error");
        }

        if (data.message.length < 10) {
            return showToast("Message too short", "error");
        }

        // ===== Step 2: Loading =====
        showToast("Sending message...", "info");

        try {

            // ===== Step 3: Send Data (API PLACE) =====
            await fakeAPI(data); // replace this later with backend

            // ===== Step 4: Success =====
            showToast("Message sent successfully 🚀", "success");
            form.reset();

        } catch (err) {

            // ===== Step 5: Error =====
            showToast("Submission failed. Try again", "error");
        }
    });

    // ===== Fake API (replace with real backend later) =====
    function fakeAPI(data) {
        console.log("Form Data:", data);

        return new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
    }

    // ===== Toast Function =====
    function showToast(msg, type = "info") {

        let bg = "#f97316";

        if (type === "success") bg = "#22c55e";
        if (type === "error") bg = "#ef4444";

        Toastify({
            text: msg,
            duration: 3000,
            gravity: "top",
            position: "right",
            close: true,
            style: {
                background: bg,
                borderRadius: "12px",
                fontSize: "13px"
            }
        }).showToast();
    }

});

//------------------------------------------------- hero banner -----------------------------------------
  // ----- Image Arrays -----
    const outerImages = [
        "./images/webthumb3.jpg",
        "./images/webthumb2.png",
        "./images/webthumb11.webp",
        "./images/webthumb4.jpg",
        "./images/webthumb5.jpg",
        "./images/webthumb6.jpg",
        "./images/webthumb7.jpg",
        "./images/webthumb8.jpg",
        "./images/webthumb9.jpg",
        "./images/webthumb10.jpg",
        "./images/thumbnail1.png",
        "./images/webthumb12.jpg"
    ];

    const innerImages = [
        "./images/webthumb13.jpg",
        "./images/webthumb14.jpg",
        "./images/webthumb15.jpg",
        "./images/webthumb16.jpg",
        "./images/webthumb17.jpg",
        "./images/webthumb18.jpg",
        "./images/webthumb19.jpg",
        "./images/webthumb20.jpg"
    ];

    // ----- Desktop Orbit Variables -----
    let angleOuterDesktop = 0;
    let angleInnerDesktop = 0;
    let pausedDesktop = false;
    let animationIdDesktop = null;

    // ----- Mobile Orbit Variables -----
    let angleOuterMobile = 0;
    let pausedMobile = false;
    let animationIdMobile = null;

    // Speed controls
    const OUTER_SPEED = 0.25;
    const INNER_SPEED = 0.38;
    const MOBILE_SPEED = 0.28;

    // ----- DESKTOP ORBIT (Horizontal Dual Rings) -----
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
            outerContainer.appendChild(item);
        });

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
            innerContainer.appendChild(item);
        });
    }

    function animateDesktopOrbit() {
        const container = document.getElementById('dual-orbital-desktop');
        const outerItems = document.querySelectorAll('#outer-orbit-desktop .orbital-item');
        const innerItems = document.querySelectorAll('#inner-orbit-desktop .orbital-item');

        if (!container || (!outerItems.length && !innerItems.length)) {
            animationIdDesktop = requestAnimationFrame(animateDesktopOrbit);
            return;
        }

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

        outerItems.forEach((item, i) => {
            const count = outerItems.length;
            const offset = (i * (360 / count));
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

        innerItems.forEach((item, i) => {
            const count = innerItems.length;
            const offset = (i * (360 / count));
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

        if (!pausedDesktop) {
            angleOuterDesktop += OUTER_SPEED;
            angleInnerDesktop -= INNER_SPEED;
        }

        animationIdDesktop = requestAnimationFrame(animateDesktopOrbit);
    }

    // ----- MOBILE ORBIT (Single Continuous Vertical Ring) -----
    function createMobileOrbit() {
        const container = document.getElementById('dual-orbital-mobile');
        const outerContainer = document.getElementById('outer-orbit-mobile');

        if (!container || !outerContainer) return;

        outerContainer.innerHTML = '';

        const rect = container.getBoundingClientRect();
        const w = rect.width || 380;
        const h = rect.height || 540; // Increased height

        // Single vertical ellipse for mobile - continuous ring
        const outerSize = 58;
        const outerRadiusX = w * 0.34;  // Narrow - clears center content
        const outerRadiusY = h * 0.44;  // Tall - uses full height

        const centerX = w / 2;
        const centerY = h / 2;

        container.dataset.outerRadiusX = outerRadiusX;
        container.dataset.outerRadiusY = outerRadiusY;
        container.dataset.centerX = centerX;
        container.dataset.centerY = centerY;
        container.dataset.outerSize = outerSize;

        const outerCount = 10;

        const outerSlice = outerImages.slice(0, outerCount);
        outerSlice.forEach((src, i) => {
            const item = document.createElement('div');
            item.className = 'orbital-item outer-item';
            item.style.width = outerSize + 'px';
            item.style.height = outerSize + 'px';
            item.style.borderRadius = Math.max(10, Math.min(16, outerSize * 0.16)) + 'px';
            item.innerHTML = `<img src="${src}" alt="Team member ${i + 1}" loading="lazy" decoding="async">`;
            item.addEventListener('touchstart', () => { pausedMobile = true; });
            item.addEventListener('touchend', () => { setTimeout(() => { pausedMobile = false; }, 300); });
            item.addEventListener('mouseenter', () => { pausedMobile = true; });
            item.addEventListener('mouseleave', () => { pausedMobile = false; });
            outerContainer.appendChild(item);
        });
    }

    function animateMobileOrbit() {
        const container = document.getElementById('dual-orbital-mobile');
        const outerItems = document.querySelectorAll('#outer-orbit-mobile .orbital-item');

        if (!container || !outerItems.length) {
            animationIdMobile = requestAnimationFrame(animateMobileOrbit);
            return;
        }

        const outerRadiusX = parseFloat(container.dataset.outerRadiusX) || 129;
        const outerRadiusY = parseFloat(container.dataset.outerRadiusY) || 237; // Increased for taller container
        const centerX = parseFloat(container.dataset.centerX) || 190;
        const centerY = parseFloat(container.dataset.centerY) || 270; // Adjusted for taller container
        const outerSize = parseFloat(container.dataset.outerSize) || 58;

        const outerHalf = outerSize / 2;

        outerItems.forEach((item, i) => {
            const count = outerItems.length;
            const offset = (i * (360 / count));
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

        if (!pausedMobile) {
            angleOuterMobile += MOBILE_SPEED;
        }

        animationIdMobile = requestAnimationFrame(animateMobileOrbit);
    }

    // ----- Initialize both layouts -----
    let resizeTimer;
    let isDesktopInitialized = false;
    let isMobileInitialized = false;

    function initDesktopOrbit() {
        if (isDesktopInitialized) {
            if (animationIdDesktop) {
                cancelAnimationFrame(animationIdDesktop);
                animationIdDesktop = null;
            }
        }
        createDesktopOrbit();
        setTimeout(() => {
            if (animationIdDesktop) {
                cancelAnimationFrame(animationIdDesktop);
                animationIdDesktop = null;
            }
            animateDesktopOrbit();
            isDesktopInitialized = true;
        }, 50);
    }

    function initMobileOrbit() {
        if (isMobileInitialized) {
            if (animationIdMobile) {
                cancelAnimationFrame(animationIdMobile);
                animationIdMobile = null;
            }
        }
        createMobileOrbit();
        setTimeout(() => {
            if (animationIdMobile) {
                cancelAnimationFrame(animationIdMobile);
                animationIdMobile = null;
            }
            animateMobileOrbit();
            isMobileInitialized = true;
        }, 50);
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

    if (document.readyState === 'complete') {
        initOrbits();
    } else {
        window.addEventListener('load', initOrbits);
    }

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initOrbits();
        }, 300);
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

