const profileImg = document.getElementById('profile-img');
const profileInput = document.getElementById('profile-upload');

// Load saved image on page load
const savedImage = localStorage.getItem('profileImage');
if (savedImage) profileImg.src = savedImage;

// Handle new upload
profileInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profileImg.src = e.target.result;
      localStorage.setItem('profileImage', e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

localStorage.setItem('nutrientGoals', JSON.stringify(goals));