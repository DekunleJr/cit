document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("myVideo");

    // Remove video if on mobile (screen width < 768px)
    if (window.innerWidth < 768 && video) {
        video.remove();
    }

    // Pause video when scrolling past it
    if (video) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        video.pause(); // Pause video when out of view
                    }
                });
            },
            { threshold: 0.2 } // Pause when less than 20% is visible
        );

        observer.observe(video);
    }
});
