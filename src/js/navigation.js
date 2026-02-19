// ==========================
// Mobile menu toggle
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  }
});

// ==========================
// Initialize navigation links
// ==========================
export function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Only preventDefault if it's a page-internal link (starts with #)
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          document
            .querySelectorAll("section")
            .forEach((s) => s.classList.add("hidden"));
          target.classList.remove("hidden");
        }
      }
      // Otherwise, let the browser navigate to other pages normally
    });
  });
}
