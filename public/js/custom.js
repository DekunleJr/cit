// Custom JavaScript for the website
document.addEventListener("DOMContentLoaded", function () {
  const videoDesktop = document.getElementById("myVideo"); // Video for larger screens
  const videoMobile = document.getElementById("myVideo_2"); // Video for mobile screens

  if (window.innerWidth < 768) {
    // If on mobile, remove desktop video
    if (videoDesktop) videoDesktop.remove();
  } else {
    // If on larger screen, remove mobile video
    if (videoMobile) videoMobile.remove();
  }

  // Pause video when scrolling past it
  const handleVideoPause = (videoElement) => {
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.2 } // Pause when less than 20% is visible
    );

    observer.observe(videoElement);
  };

  handleVideoPause(videoDesktop);
  handleVideoPause(videoMobile);
});

document.addEventListener("DOMContentLoaded", function () {
  const togglePasswordButton = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const toggleIcon = togglePasswordButton.querySelector("i");

  if (togglePasswordButton && passwordInput && toggleIcon) {
    togglePasswordButton.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      if (type === "password") {
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
        togglePasswordButton.setAttribute("aria-label", "Show password");
      } else {
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
        togglePasswordButton.setAttribute("aria-label", "Hide password");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const togglePasswordButton = document.getElementById("toggleConfirmPassword");
  const passwordInput = document.getElementById("confirm_password");
  const toggleIcon = togglePasswordButton.querySelector("i");

  if (togglePasswordButton && passwordInput && toggleIcon) {
    togglePasswordButton.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      if (type === "password") {
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
        togglePasswordButton.setAttribute("aria-label", "Show password");
      } else {
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
        togglePasswordButton.setAttribute("aria-label", "Hide password");
      }
    });
  }
});
