document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup script loaded!");

    const playButton = document.getElementById("playButton");
    const pauseButton = document.getElementById("pauseButton");
    const scrubber = document.getElementById("scrubber");
    const timeDisplay = document.getElementById("timeDisplay");
    const scrubberContainer = document.getElementById("scrubber-container");
    const noVideoMessage = document.getElementById("no-video-message");

    if (!playButton || !pauseButton || !scrubber || !timeDisplay || !scrubberContainer || !noVideoMessage) {
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

    // Debounce the slider input to prevent spamming seek commands (especially important for Netflix)
    let seekDebounceTimer = null;
    scrubber.addEventListener("input", (e) => {
        const newTime = parseFloat(e.target.value);
        clearTimeout(seekDebounceTimer);
        // Set a debounce delay of 300ms (adjust if needed)
        seekDebounceTimer = setTimeout(() => {
            console.log("Debounced scrubber adjusted. Seeking to:", newTime);
            chrome.runtime.sendMessage({ action: "syncSeek", time: newTime });
        }, 300);
    });

    // Periodically update the slider (and time display) with the video's current time
    setInterval(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                // Ask the content script for the current time and duration
                chrome.tabs.sendMessage(tabs[0].id, { action: "getTime" }, (response) => {
                    if (
                        chrome.runtime.lastError ||
                        !response ||
                        !response.duration ||
                        isNaN(response.duration) ||
                        response.duration <= 0
                    ) {
                        // Hide scrubber if no valid video info is returned
                        scrubberContainer.style.display = "none";
                        noVideoMessage.style.display = "none";
                    } else {
                        // Valid video data found; show the scrubber and update time display.
                        scrubberContainer.style.display = "block";
                        noVideoMessage.style.display = "none";
                        const { currentTime, duration } = response;
                        scrubber.max = duration;
                        scrubber.value = currentTime;
                        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
                    }
                });
            }
        });
    }, 500);

    // Helper function to format time as mm:ss.
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }
});
