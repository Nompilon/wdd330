const currentyear = document.querySelector("#currentyear");
const lastModified = document.querySelector("#lastModified");

const today = new Date();
currentyear.textContent = today.getFullYear();

lastModified.textContent = document.lastModified;


