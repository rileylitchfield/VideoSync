# Video Sync Extension

Video Sync is a Chrome extension that allows you to control video playback across multiple tabs simultaneously. Whether you're watching videos on YouTube or Netflix, the extension lets you play, pause, or seek through videos on all supported tabs at the same time from a central popup.

## Features

- **Synchronized Play/Pause:**  
  Start or pause playback on all open tabs with a single click.
  
- **Scrubber (Seek) Control:**  
  - Use an `<input type="range">` slider to control the current playback position.
  - When you adjust the slider, the extension sends a seek command to all supported tabs so every video jumps by the same amount.
  
- **Real-Time Time Display:**  
  The popup shows the current playback time and total duration (formatted as mm:ss) by polling the active tab.

## File Overview

- **`manifest.json`**  
  Defines the extension's configuration, permissions, content scripts, background service worker, and host permissions for sites such as YouTube and Netflix.

- **`background.js`**  
  Acts as the central hub that receives commands from the popup and broadcasts them to all relevant tabs. It handles both play/pause (`syncPlayPause`) and seek (`syncSeek`) actions.

- **`popup.html`**  
  The popup UI where users control video playback. It contains buttons for play and pause, as well as a scrubber slider for seeking through the video.

- **`popup.js`**  
  Handles user interactions from the popup. It sends messages to `background.js` which then relays the commands to the content scripts on each matching tab.

- **`popup.css`**  
  Provides CSS styling to make the popup's buttons and slider visually appealing and user-friendly.

- **`content.js`**  
  Injected into supported pages (like YouTube and Netflix). Listens for messages from the background script to perform actions on the video element, including playing, pausing, seeking, and reporting the video's current time and duration.

## Installation

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/your-username/video-sync-extension.git
   ```
   
2. **Load as an Unpacked Extension:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer Mode" by toggling the switch in the top-right corner.
   - Click "Load unpacked" and select the extension's directory.

3. **Verify Installation:**
   The extension icon should appear in your Chrome toolbar.

## Usage

1. **Open a Supported Video Site:**
   - Navigate to a page with a video, like YouTube or Netflix.

2. **Control Playback:**
   - Click the extension icon to display the popup.
   - Use the **Play** and **Pause** buttons to control video playback across all matching tabs.
   - Adjust the **Scrubber Slider:**  
     Drag the slider to a new position and all videos (across all supported tabs) will seek to that new time.
   - The current time and total duration are displayed in a `mm:ss / mm:ss` format below the scrubber.

## How It Works

- **Message Broadcasting:**  
  Actions in the popup (like play, pause, or seek) send messages (e.g., `syncPlayPause` or `syncSeek`) to the background service worker (`background.js`), which then broadcasts the appropriate command (e.g., `play`, `pause`, or `seek`) to all tabs that match the specified URLs.

- **Content Script Control:**  
  Each content script (`content.js`), injected into supported sites, listens for these messages and interacts with the page's video element accordingly. This ensures synchronized control over multiple tabs.

## Customization

- **UI Adjustments:**  
  Modify `popup.css` to change the appearance of the popup interface.

- **Adding More Features:**  
  Extend the functionality (such as volume controls or additional video controls) by updating `popup.js` and `content.js` as needed. You can also adjust the list of supported sites via the host permissions in `manifest.json`.

## Troubleshooting

- **Out-of-Sync Values:**  
  Make sure that video metadata (e.g., duration and current time) is fully loaded before sending commands. The content script logs raw values for debugging.
  
- **No Video Found:**  
  If the extension logs that no video element was found, verify that you are on a supported video site and that the video element is properly accessible using the current selector in your content script.

- **Message Passing Issues:**  
  Use Chrome Developer Tools (F12) to inspect logs in the background, popup, and content scripts to troubleshoot any message-sending errors.

## Contributing

Contributions are welcome! Feel free to fork this repository and submit a pull request with improvements or new features. For major changes, please open an issue to discuss your ideas.

## License

This project is licensed under the [MIT License](LICENSE).

Happy syncing! 
