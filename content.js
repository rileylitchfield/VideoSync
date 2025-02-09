console.log("+++ Content script loaded on", window.location.href);

// Helper: find the first <video> element on the page.
function getVideoElement() {
  const video = document.querySelector("video");
  if (!video) {
    console.warn("+++ [Content] No video element found on", window.location.href);
  } else {
    console.log("+++ [Content] Video element found:", video);
  }
  return video;
}

// --- Common Message Handler ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("+++ [Content] Received message:", message, "from sender:", sender);
  
  if (message.action === "getTime") {
    const video = getVideoElement();
    if (video) {
      const response = { currentTime: video.currentTime, paused: video.paused };
      console.log("+++ [Content] getTime response:", response);
      sendResponse(response);
    } else {
      console.warn("+++ [Content] getTime: No video element found!");
      sendResponse({});
    }
    return true; // Keep the channel open for asynchronous response.
  }
  
  // --- YouTube-specific handling ---
  if (window.location.href.includes("youtube.com")) {
    // Initialize local sync variables if not already set.
    if (typeof window.autoSyncEnabled === "undefined") {
      window.autoSyncEnabled = false; // auto-sync disabled by default
      window.syncOffset = 0;
      console.log("+++ [YouTube] Initialized autoSyncEnabled to false and syncOffset to 0.");
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("+++ [YouTube] Received message:", message, "from sender:", sender);

      // Handle the enableSync message.
      if (message.action === "enableSync") {
        window.autoSyncEnabled = true;
        window.syncOffset = parseFloat(message.offset) || 0;
        console.log("+++ [YouTube] Auto-sync enabled. syncOffset set to:", window.syncOffset);
        sendResponse({ status: "enabled" });
        return true;
      }

      // Handle Netflix state updates.
      if (message.action === "netflixState") {
        if (window.autoSyncEnabled !== true) {
          console.log("+++ [YouTube] Auto-sync disabled. Ignoring netflixState message.");
          return;
        }
        const targetTime = message.currentTime + window.syncOffset;
        console.log("+++ [YouTube] Computed targetTime =", targetTime, "(Netflix currentTime =", message.currentTime, "+ syncOffset =", window.syncOffset, ")");
        const video = getVideoElement();
        if (!video) {
          console.error("+++ [YouTube] VIDEO element not found! Cannot update currentTime.");
          return;
        }
        console.log("+++ [YouTube] Current video.currentTime =", video.currentTime);
        if (Math.abs(video.currentTime - targetTime) > 0.5) {
          console.log("+++ [YouTube] Adjusting video.currentTime from", video.currentTime, "to", targetTime);
          video.currentTime = targetTime;
        } else {
          console.log("+++ [YouTube] Video time within threshold; no update required.");
        }

        // Mimic play/pause state.
        if (message.paused && !video.paused) {
          console.log("+++ [YouTube] Pausing video to match Netflix state.");
          video.pause();
        } else if (!message.paused && video.paused) {
          console.log("+++ [YouTube] Playing video to match Netflix state.");
          video.play().catch(err => console.error("+++ [YouTube] Error while trying to play video:", err));
        } else {
          console.log("+++ [YouTube] No play/pause adjustment needed.");
        }
        sendResponse({ status: "netflixState processed" });
        return true;
      }
    });

    // Also, disable auto-sync if the user manually drags the scrubber.
    const video = getVideoElement();
    if (video) {
      video.addEventListener("seeking", () => {
        window.autoSyncEnabled = false;
        console.log("+++ [YouTube] Manual seeking detected. Auto-sync disabled.");
      });
    }
  }
});

// --- Netflix Branch: Wait for Video Element and Set Up State Updates ---
if (window.location.href.includes("netflix.com")) {
  // Function to poll for the video element.
  function waitForVideoElement(callback, retries = 30, interval = 1000) {
    const video = getVideoElement();
    if (video) {
      callback(video);
    } else {
      if (retries > 0) {
        console.log("+++ [Netflix] Video element not found; retrying in", interval, "ms. Attempts remaining:", retries);
        setTimeout(() => {
          waitForVideoElement(callback, retries - 1, interval);
        }, interval);
      } else {
        console.error("+++ [Netflix] Video element not found after maximum retries.");
      }
    }
  }

  waitForVideoElement((video) => {
    console.log("+++ [Netflix] Video element detected. Setting up event listeners.");
    let lastUpdate = 0;

    // Sends a state update with the current time and pause/play status.
    function sendStateUpdate() {
      const state = {
        action: "netflixState",
        currentTime: video.currentTime,
        paused: video.paused
      };
      console.log("+++ [Netflix] Sending state update:", state);
      chrome.runtime.sendMessage(state, (response) => {
        if (chrome.runtime.lastError) {
          console.error("+++ [Netflix] Error sending state:", chrome.runtime.lastError.message);
        } else {
          console.log("+++ [Netflix] State message sent successfully. Response:", response);
        }
      });
    }

    // Throttled update for timeupdate events to reduce message frequency.
    function sendNetflixStateThrottled() {
      // Only send an update from timeupdate events if the video is playing.
      // This avoids sending duplicate paused state messages.
      if (video.paused) return; 
      const currentTime = video.currentTime;
      if (Math.abs(currentTime - lastUpdate) > 0.3) {
        lastUpdate = currentTime;
        sendStateUpdate();
      }
    }

    // Add event listeners:
    video.addEventListener("timeupdate", sendNetflixStateThrottled);
    video.addEventListener("play", () => {
      sendStateUpdate();
      lastUpdate = video.currentTime; // Prevent immediate duplicate update from a timeupdate event.
    });
    video.addEventListener("pause", sendStateUpdate);
    video.addEventListener("seeked", sendStateUpdate); // Ensures a state update is sent after seeking.
  });
}

