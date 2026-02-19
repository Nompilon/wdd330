import { saveProfileImage, getProfileImage } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const profileImg = document.getElementById("profile-img");
  const profileInput = document.getElementById("profile-upload");

  if (!profileImg || !profileInput) return;

  // Load saved image
  const savedImage = getProfileImage();
  if (savedImage) {
    profileImg.src = savedImage;
  }

  // Handle upload
  profileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Optional: size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large. Max size is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      profileImg.src = imageData;
      saveProfileImage(imageData);
    };

    reader.readAsDataURL(file);
  });
});
