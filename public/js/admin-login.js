const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const alertBox = document.getElementById("alertBox");
const alertText = document.getElementById("alertText");
const alertIcon = document.getElementById("alertIcon");

function hideAlert() {
  if (!alertBox) return;
  alertBox.style.display = "none";
  alertBox.className = "alert";
  alertText.textContent = "";
}

function showRedErrorIncorrectCredentials() {
  // Red error: Incorrect Username or password – clear both fields
  alertBox.style.display = "flex";
  alertBox.className = "alert alert-error";
  alertIcon.textContent = "!";
  alertText.textContent = "Incorrect Username or password.";

  usernameInput.value = "";
  passwordInput.value = "";
  usernameInput.focus();
}

function showYellowErrorMissingField(message) {
  // Yellow error: Please enter a Username (or password) – do NOT clear fields
  alertBox.style.display = "flex";
  alertBox.className = "alert alert-warning";
  alertIcon.textContent = "!";
  alertText.textContent = message || "Please enter a Username (or password).";
}

// Mock submit handler – replace with your JSON later
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  hideAlert();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showYellowErrorMissingField("Please enter a Username and password.");
    return;
  }

  // For now we just simulate invalid credentials:
  showRedErrorIncorrectCredentials();
});

// Clear alert when typing again
usernameInput?.addEventListener("input", hideAlert);
passwordInput?.addEventListener("input", hideAlert);
