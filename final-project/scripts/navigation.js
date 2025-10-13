
const menuBtn = document.querySelector('.menu-btn');
const menuContainer = document.querySelector('.menu-container');

menuBtn.addEventListener('click', () => {
  menuContainer.classList.toggle('active');
});

// Close the menu when clicking outside it
window.addEventListener('click', (event) => {
  if (!menuContainer.contains(event.target)) {
    menuContainer.classList.remove('active');
  }
});
