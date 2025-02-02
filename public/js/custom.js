// document.addEventListener("DOMContentLoaded", function () {
//     const video = document.getElementById("myVideo");

//     // Remove video if on mobile (screen width < 768px)
//     if (window.innerWidth < 768 && video) {
//         video.remove();
//     }

//     // Pause video when scrolling past it
//     if (video) {
//         const observer = new IntersectionObserver(
//             (entries) => {
//                 entries.forEach((entry) => {
//                     if (!entry.isIntersecting) {
//                         video.pause(); // Pause video when out of view
//                     }
//                 });
//             },
//             { threshold: 0.2 } // Pause when less than 20% is visible
//         );

//         observer.observe(video);
//     }
// });
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
