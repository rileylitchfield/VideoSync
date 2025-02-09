console.log("+++ [Background] Background script loaded.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("+++ [Background] onMessage triggered. Message:", message, "Sender:", sender);

    if (message.action === "syncPlayPause") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url.includes("youtube.com") || tab.url.includes("netflix.com")) {
                    console.log(`Sending ${message.state} message to tab: ${tab.url}`);
                    chrome.tabs.sendMessage(tab.id, { action: message.state }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error sending message:", chrome.runtime.lastError);
                        } else {
                            console.log(`Message sent successfully to: ${tab.url}`);
                        }
                    });
                }
            });
        });
    } else if (message.action === "skip") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url.includes("youtube.com") || tab.url.includes("netflix.com")) {
                    console.log(`Sending skip message to tab: ${tab.url} with offset: ${message.offset}`);
                    chrome.tabs.sendMessage(tab.id, { action: "skip", offset: message.offset }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error sending skip message:", chrome.runtime.lastError);
                        } else {
                            console.log(`Skip message sent successfully to: ${tab.url}`);
                        }
                    });
                }
            });
        });
    } else if (message.action === "netflixState") {
        console.log("+++ [Background] Handling netflixState message:", message);
        chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
            console.log("+++ [Background] Found YouTube tabs (IDs):", tabs.map(tab => tab.id));
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(`+++ [Background] Error sending netflixState message to tab ${tab.id}:`, chrome.runtime.lastError.message);
                    } else {
                        console.log(`+++ [Background] netflixState message successfully sent to tab ${tab.id}. Response:`, response);
                    }
                });
            });
            sendResponse({ status: "netflixState forwarded" });
        });
        return true;
    }

    // New branch for enabling sync.
    if (message.action === "enableSync") {
        console.log("+++ [Background] Received enableSync message:", message);
        chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
            console.log("+++ [Background] Forwarding enableSync message to YouTube tabs (IDs):", tabs.map(tab => tab.id));
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(`+++ [Background] Error sending enableSync message to tab ${tab.id}:`, chrome.runtime.lastError.message);
                    } else {
                        console.log(`+++ [Background] enableSync message sent to tab ${tab.id}. Response:`, response);
                    }
                });
            });
            sendResponse({ status: "enableSync forwarded" });
        });
        return true;
    }
});
