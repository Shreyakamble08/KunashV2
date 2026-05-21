fetch("/header/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    const menuBtn = document.getElementById("menu-btn");
    const menuIcon = menuBtn.querySelector(".material-icons");
    const mobileMenu = document.getElementById("mobile-menu");

    const servicesBtn = document.getElementById("mobile-services-btn");
    const servicesMenu = document.getElementById("mobile-services-menu");
    const servicesIcon = document.getElementById("mobile-services-icon");

    let menuOpen = false;
    let servicesOpen = false;

    // 🔥 Toggle Mobile Menu
    menuBtn.addEventListener("click", () => {
      menuOpen = !menuOpen;

      menuIcon.textContent = menuOpen ? "close" : "menu";
      mobileMenu.style.maxHeight = menuOpen
        ? mobileMenu.scrollHeight + "px"
        : "0px";
    });

    // 🔥 Toggle Services Dropdown
    servicesBtn.addEventListener("click", () => {
      servicesOpen = !servicesOpen;

      servicesIcon.textContent = servicesOpen ? "remove" : "add";
      servicesMenu.style.maxHeight = servicesOpen
        ? servicesMenu.scrollHeight + "px"
        : "0px";
    });

    // 🔥 Close menu when clicking any mobile link
    document
      .querySelectorAll("#mobile-menu a")
      .forEach(link => {
        link.addEventListener("click", () => {
          menuOpen = false;
          menuIcon.textContent = "menu";
          mobileMenu.style.maxHeight = "0px";
        });
      });

    // 🔥 Click outside to close menu
    document.addEventListener("click", e => {
      if (!e.target.closest("header") && menuOpen) {
        menuOpen = false;
        menuIcon.textContent = "menu";
        mobileMenu.style.maxHeight = "0px";
      }
    });
  });
