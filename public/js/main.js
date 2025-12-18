// document.addEventListener("DOMContentLoaded", () => {
//   const header = document.getElementById("site-header");

//   if (!header) return;

//   const maxScroll = 80; // px until fully shrunk

//   window.addEventListener(
//     "scroll",
//     () => {
//       const scrollY = Math.min(window.scrollY, maxScroll);
//       const progress = scrollY / maxScroll; // 0 → 1

//       header.style.setProperty("--shrink", progress.toFixed(3));
//     },
//     { passive: true }
//   );
// });

/////////////////////////////////////////////////////////////////////////
// Mailing list AJAX form submission and alert modal
////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  // ---- Mailing list AJAX submit ----
  const form = document.getElementById("mailingListForm");

  // Alert modal elements
  const alertWrap = document.getElementById("ccAlert");
  const alertTitle = document.getElementById("ccAlertTitle");
  const alertMsg = document.getElementById("ccAlertMessage");
  const alertOk = document.getElementById("ccAlertOk");
  const alertIcon = document.getElementById("ccAlertIcon");

  let autoTimer = null;

  function closeAlert() {
    if (!alertWrap) return;
    alertWrap.classList.remove("open");
    alertWrap.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cc-alert-open");
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = null;
  }

  function showAlert({
    scheme = "success",
    title = "Message",
    message = "",
    autoDismiss = false,
  }) {
    if (!alertWrap) return;

    // Scheme classes
    alertWrap.classList.remove("scheme-success", "scheme-warn");
    alertWrap.classList.add(
      scheme === "warn" ? "scheme-warn" : "scheme-success"
    );

    alertTitle.textContent = title;
    alertMsg.textContent = message;

    // Icon
    if (scheme === "warn") {
      alertIcon.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>`;
    } else {
      alertIcon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
    }

    alertWrap.classList.add("open");
    alertWrap.setAttribute("aria-hidden", "false");
    document.body.classList.add("cc-alert-open");

    // if (autoDismiss) {
    //   autoTimer = setTimeout(closeAlert, 5000);
    // }
  }

  if (alertOk) alertOk.addEventListener("click", closeAlert);

  if (alertWrap) {
    alertWrap.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.close === "true") closeAlert();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (!alertWrap || !alertWrap.classList.contains("open")) return;
    if (e.key === "Escape") closeAlert();
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]')?.value || "";
      const email = form.querySelector('[name="email"]')?.value || "";
      const event = form.querySelector('[name="event"]')?.value || "";

      try {
        const resp = await fetch("/mailing_list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, event }),
        });

        const data = await resp.json().catch(() => ({}));

        // Successful
        if (resp.ok && data.ok) {
          // success or exists: green + auto dismiss
          if (data.type === "exists") {
            showAlert({
              scheme: "success",
              title: "You’re already subscribed",
              message: data.message || "You’re already on our mailing list!",
              autoDismiss: true,
            });
          } else {
            showAlert({
              scheme: "success",
              title: "Welcome!",
              message:
                data.message ||
                "Thank you for joining Coodles Creations Mailing List!",
              autoDismiss: true,
            });
          }

          form.reset();
          return;
        }

        // Not successful: yellow + requires OK
        showAlert({
          scheme: "warn",
          title: "Oops!",
          message: data.message || "That didn’t work. Please try again.",
          autoDismiss: false,
        });
      } catch (err) {
        console.error(err);
        showAlert({
          scheme: "warn",
          title: "Network error",
          message:
            "We couldn’t connect right now. Please try again in a moment.",
          autoDismiss: false,
        });
      }
    });
  }
});
