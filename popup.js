console.log("+++ [Popup] popup.js is running.");

document.addEventListener("DOMContentLoaded", () => {
    console.log("+++ [Popup] Popup loaded.");

    // Save the original HTML so we can restore it on error.
    const defaultHTML = document.body.innerHTML;

    // Function to attach the click listener to the Sync Now button.
    function attachListeners() {
        const syncButton = document.getElementById("syncButton");
        if (!syncButton) {
            console.error("+++ [Popup] syncButton not found. Verify that a button with id 'syncButton' exists in popup.html.");
            return;
        }
        syncButton.addEventListener("click", onSyncClick);
    }

    // When the Sync Now button is clicked, start the sync process.
    function onSyncClick() {
        console.log("+++ [Popup] Sync Now button was clicked.");

        // Query for a Netflix tab.
        chrome.tabs.query({ url: "*://*.netflix.com/*" }, (netflixTabs) => {
            if (!netflixTabs.length) {
                showMessage("No Netflix tab found.", false);
                return;
            }
            chrome.tabs.sendMessage(netflixTabs[0].id, { action: "getTime" }, (netflixResponse) => {
                console.log("+++ [Popup] Received getTime response from Netflix tab:", netflixResponse);
                if (chrome.runtime.lastError || !netflixResponse) {
                    showMessage("Could not retrieve Netflix video time.", false);
                    return;
                }
                const netflixTime = netflixResponse.currentTime;
                const netflixPaused = netflixResponse.paused;
                console.log("+++ [Popup] Netflix currentTime:", netflixTime, "paused:", netflixPaused);

                // Query for a YouTube tab.
                chrome.tabs.query({ url: "*://*.youtube.com/*" }, (ytTabs) => {
                    if (!ytTabs.length) {
                        showMessage("No YouTube tab found.", false);
                        return;
                    }
                    chrome.tabs.sendMessage(ytTabs[0].id, { action: "getTime" }, (ytResponse) => {
                        console.log("+++ [Popup] Received getTime response from YouTube tab:", ytResponse);
                        if (chrome.runtime.lastError || !ytResponse) {
                            showMessage("Could not retrieve YouTube video time.", false);
                            return;
                        }
                        const youtubeTime = ytResponse.currentTime;
                        const youtubePaused = ytResponse.paused;
                        console.log("+++ [Popup] YouTube currentTime:", youtubeTime, "paused:", youtubePaused);

                        // Make sure both videos are either playing or paused.
                        if (netflixPaused !== youtubePaused) {
                            showMessage("Both videos must be either playing or paused to sync.", false);
                            return;
                        }

                        // Compute the offset.
                        const offset = youtubeTime - netflixTime;
                        console.log("+++ [Popup] Computed offset =", offset);

                        // Send the enableSync message to the background.
                        chrome.runtime.sendMessage({ action: "enableSync", offset: offset }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("+++ [Popup] Error sending enableSync message:", chrome.runtime.lastError);
                                showMessage("Error sending sync message.", false);
                            } else {
                                console.log("+++ [Popup] enableSync message forwarded. Background response:", response);
                                showMessage("VideoSync enabled!", true);
                            }
                        });
                    });
                });
            });
        });
    }

    // Shows a message in the popup panel.
    // Success messages auto-close after 3 seconds.
    // Error messages display with troubleshooting tips for 10 seconds before reverting to the default UI.
    function showMessage(message, isSuccess) {
        let messageContent = message;
        if (!isSuccess) {
            messageContent += `<br/><br/><strong>Troubleshooting Tips:</strong><br/>
            • Ensure that both Netflix and YouTube tabs are open with a video loaded.<br/>
            • Verify that both videos are either playing or paused.<br/>
            • Refresh the tabs and try again.<br/>
            • Confirm that the extension has all necessary permissions.`;
        }
        document.body.innerHTML = `<div id="message" class="message ${isSuccess ? "success-message" : "error-message"}">${messageContent}</div>`;
        if (isSuccess) {
            setTimeout(() => window.close(), 3000);
        } else {
            setTimeout(() => {
                document.body.innerHTML = defaultHTML;
                attachListeners();
            }, 20000);
        }
    }

    // Initialize the popup by attaching the event listener.
    attachListeners();
});
