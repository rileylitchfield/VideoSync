chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script received:", message);

    if (message.action === "syncPlayPause") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url.includes("youtube.com") || tab.url.includes("netflix.com")) {
                    console.log("Sending message to tab:", tab.url, "Action:", message.state);
                    chrome.tabs.sendMessage(tab.id, { action: message.state }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error sending message:", chrome.runtime.lastError);
                        } else {
                            console.log("Message sent successfully to:", tab.url);
                        }
                    });
                }
            });
        });
    } else if (message.action === "syncSeek") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url.includes("youtube.com") || tab.url.includes("netflix.com")) {
                    console.log("Sending seek message to tab:", tab.url, "Time:", message.time);
                    chrome.tabs.sendMessage(tab.id, { action: "seek", time: message.time }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error sending seek message:", chrome.runtime.lastError);
                        } else {
                            console.log("Seek message sent successfully to:", tab.url);
                        }
                    });
                }
            });
        });
    }
});
