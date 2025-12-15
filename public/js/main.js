document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");

  if (!header) return;

  const maxScroll = 80; // px until fully shrunk

  window.addEventListener(
    "scroll",
    () => {
      const scrollY = Math.min(window.scrollY, maxScroll);
      const progress = scrollY / maxScroll; // 0 → 1

      header.style.setProperty("--shrink", progress.toFixed(3));
    },
    { passive: true }
  );
});
