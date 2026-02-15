const profileImg = document.getElementById("profile-img");
const profileInput = document.getElementById("profile-upload");

// Load saved image on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedImage = localStorage.getItem("profileImage");
  if (savedImage) {
    profileImg.src = savedImage;
  }
});

// Handle new upload
profileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const imageData = e.target.result;
    profileImg.src = imageData;
    localStorage.setItem("profileImage", imageData);
  };
  reader.readAsDataURL(file);
});
