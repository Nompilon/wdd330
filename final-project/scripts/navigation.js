
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  }
});