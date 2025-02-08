document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup script loaded!");

    const playButton = document.getElementById("playButton");
    const pauseButton = document.getElementById("pauseButton");
    const scrubber = document.getElementById("scrubber");
    const timeDisplay = document.getElementById("timeDisplay");

    if (!playButton || !pauseButton || !scrubber) {
        console.error("One or more elements not found in popup!");
        return;
    }

    // Send play command
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

    // Send pause command
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

    // When scrubber is used, send a "syncSeek" message with the new time
    scrubber.addEventListener("input", (e) => {
        const newTime = parseFloat(e.target.value);
        console.log("Scrubber adjusted. Seeking to:", newTime);
        chrome.runtime.sendMessage({ action: "syncSeek", time: newTime });
    });

    // Periodically update the slider (and time display) with the video's current time
    setInterval(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                // Ask the content script for the current time and duration
                chrome.tabs.sendMessage(tabs[0].id, { action: "getTime" }, (response) => {
                    if (chrome.runtime.lastError || !response) return;
                    
                    const { currentTime, duration } = response;
                    if (duration && !isNaN(duration)) {
                        scrubber.max = duration;
                        scrubber.value = currentTime;
                        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
                    }
                });
            }
        });
    }, 500);

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
});
