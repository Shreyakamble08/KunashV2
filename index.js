const bannerContent = [
  {
    word: "Digital Marketing",
    para: "Drive measurable growth with data-driven marketing strategies, targeted campaigns, and performance-focused digital solutions.",
  },
  {
    word: "Software Development",
    para: "Build scalable, secure, and high-performance software tailored to your business processes and future growth needs.",
  },
  {
    word: "Web Development",
    para: "Create fast, responsive, and user-focused websites that enhance brand presence and deliver seamless digital experiences.",
  },
  {
    word: "Graphic Designing",
    para: "Transform ideas into impactful visuals with creative designs that strengthen brand identity and customer engagement.",
  },
];

let index = 0;
let typingTimeout; // ⭐ Important — controls typing

const typingEl = document.getElementById("typingText");
const paraEl = document.getElementById("scrollPara");

// ✅ Typing Effect (Safe Version)
function typeWord(text, speed = 60) {
  clearTimeout(typingTimeout); // STOP previous typing
  typingEl.textContent = "";

  let i = 0;

  function typing() {
    if (i < text.length) {
      typingEl.textContent += text.charAt(i);
      i++;
      typingTimeout = setTimeout(typing, speed);
    }
  }

  typing();
}

// ✅ Paragraph Scroll Animation
function scrollParagraph(text) {
  paraEl.style.transition = "none";
  paraEl.style.transform = "translateY(100%)";
  paraEl.textContent = text;

  setTimeout(() => {
    paraEl.style.transition = "transform 0.8s ease";
    paraEl.style.transform = "translateY(0)";
  }, 50);
}

// ✅ Change Content
function changeContent() {
  typeWord(bannerContent[index].word);
  scrollParagraph(bannerContent[index].para);

  index = (index + 1) % bannerContent.length;
}

// ✅ Start
changeContent();
setInterval(changeContent, 4000); // ⭐ Increased time (VERY IMPORTANT)


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


