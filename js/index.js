function login() {
  const user = document.getElementById("username").value.trim();
  const pwd = document.getElementById("password").value;

  if (user === "USER" && pwd === "1234") {
    window.location.href = "user.html";
  } else if (user === "ADMIN" && pwd === "1234") {
    // Redirect to blockchain auth step for admin
    window.location.href = "admin_auth.html";
  } else {
    const error = document.getElementById("error-msg");
    error.innerText = "🚫 Invalid credentials!";
    error.style.opacity = 1;

    setTimeout(() => {
      error.innerText = "";
    }, 3000);
  }
}
