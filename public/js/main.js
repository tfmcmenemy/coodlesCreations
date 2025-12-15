document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("shrink");
      } else {
        header.classList.remove("shrink");
      }
    });
  }
});
