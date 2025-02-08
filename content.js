console.log("Content script loaded on", window.location.href);

let video = document.querySelector("video");

function findVideo() {
    if (!video) {
        console.warn("No video found, waiting...");
        video = document.querySelector("video");
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    findVideo();
    console.log("Received message:", message);

    if (!video) {
        console.error("No video element to control!");
        return;
    }

    if (message.action === "play") {
        console.log("Playing video...");
        video.play().catch((error) => console.error("Play error:", error));
    } else if (message.action === "pause") {
        console.log("Pausing video...");
        video.pause();
    }
});
