document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup script loaded!");

    const playButton = document.getElementById("playButton");
    const pauseButton = document.getElementById("pauseButton");

    if (!playButton || !pauseButton) {
        console.error("Play or Pause button not found in popup!");
        return;
    }

    playButton.addEventListener("click", () => {
        console.log("Play button clicked! Sending play action.");
        chrome.runtime.sendMessage({ action: "syncPlayPause", state: "play" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending play message:", chrome.runtime.lastError);
            } else {
                console.log("Play message sent successfully:", response);
            }
        });
    });

    pauseButton.addEventListener("click", () => {
        console.log("Pause button clicked! Sending pause action.");
        chrome.runtime.sendMessage({ action: "syncPlayPause", state: "pause" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending pause message:", chrome.runtime.lastError);
            } else {
                console.log("Pause message sent successfully:", response);
            }
        });
    });
});
