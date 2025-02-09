# VideoSync Extension

## Overview

VideoSync is a Chrome extension designed to synchronize video playback between Netflix and YouTube. With VideoSync, you can:
- Sync the current playback time between Netflix and YouTube.
- Mirror play, pause, and skip actions so that both videos stay in sync.
- Automatically adjust the YouTube video playback based on a computed time offset derived from Netflix's timeline.

## Features

- **Auto-Sync:**  
  Enable automatic synchronization of play, pause, and skip commands between Netflix and YouTube.

- **Time Offset Adjustment:**  
  The extension computes an offset between Netflix's and YouTube's playback times and adjusts YouTube's timeline accordingly.

- **Dynamic State Updates:**  
  Continuous monitoring of video state (current time, play/pause, and seeking) on both platforms ensures up-to-date synchronization.

## How It Works

### Netflix Side (Content Script)
- A content script running on Netflix captures video state updates such as current time, play/pause, and seeking events.
- It periodically sends these updates to the background script, which in turn forwards them to the YouTube tab.
- Special handling is implemented for skip/seek events to ensure that state updates occur smoothly.

### YouTube Side (Content Script)
- The YouTube content script listens for messages forwarded by the background script.
- It computes the target playback time by applying the offset received from Netflix.
- The script updates YouTube's video `currentTime` and mirrors the play/pause state accordingly.

### Background Script
- The background script routes messages between Netflix and YouTube.
- It listens for commands (such as `syncPlayPause`, `skip`, `netflixState`, and `enableSync`) and forwards them to the corresponding tabs.

### Popup UI
- The extension popup provides a "Sync Now" button to initiate synchronization.
- When clicked, it queries both Netflix and YouTube for their current state, calculates the time offset, and sends the sync configuration to both tabs.
- If issues occur, troubleshooting tips are provided in the popup.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" (toggle in the top-right corner).
4. Click "Load unpacked" and select the folder containing the extension's files.
5. The extension will be added to your browser.

## Usage

1. Open both Netflix and YouTube in separate tabs with a video loaded.
2. Ensure that both videos are either playing or paused.
3. Click the VideoSync extension icon to open the popup.
4. Click "Sync Now" to initiate synchronization.
5. Playback actions such as play, pause, and seek on Netflix will be mirrored on YouTube.

## Future Improvements

- **Boundary Handling:**  
  - Detect if the user skips the Netflix movie so far backward that the computed YouTube time becomes negative. In such cases, auto-sync should be disabled and an error message should be displayed.
  - Handle the opposite case where the user skips too far ahead, causing the computed YouTube time to exceed the video's duration. Auto-sync should similarly be disabled with appropriate user feedback.

- **Sync Toggle Button:**  
  Replace the current "Sync Now" button with a toggle button that clearly indicates when synchronization is active or inactive. This would also provide users with the ability to manually disable sync at any time.

- **Support for Additional Streaming Services:**  
  Expand support to include other popular streaming platforms such as Hulu, Amazon Prime Video, Disney+, HBO Max, and others. This would allow VideoSync to synchronize video playback across a broader range of services.

## Troubleshooting

- **Sync Not Initiating:**  
  Ensure that valid video elements are present on both Netflix and YouTube pages.

- **Developer Logging:**  
  For further troubleshooting, open the browser console (F12 or right-click > Inspect) to view diagnostic messages provided by the extension.

## Contributing

Contributions and improvements are welcome!  
If you encounter any issues or have suggestions, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

Happy syncing! 
