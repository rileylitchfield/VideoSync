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
  Continuous monitoring of video state (current time, play/pause, seeking) on both platforms ensures up-to-date synchronization.

- **Error Handling for Negative Time:**  
  If a user seeks too far back in the Netflix video—resulting in a computed negative target time for YouTube—the extension will automatically disable auto-sync and show an error message. This alerts you that you need to re-sync.

## How It Works

### Netflix Side (Content Script)
- A content script running on Netflix captures video state updates such as current time, play/pause, and seeking events.
- Using throttling, it minimizes redundant messages while sending state updates (via `chrome.runtime.sendMessage`) to keep YouTube in sync.
- Special handling is implemented for skips (seeking) to ensure that updates occur smoothly.

### YouTube Side (Content Script)
- The YouTube content script listens for messages sent from Netflix (via the background script).
- It computes the target playback time by applying the offset received from Netflix.
- **New Behavior:** If the target time becomes negative (i.e., before 0 seconds), auto-sync is immediately disabled, the video is paused, and an error message is displayed to the user using an alert.
- Otherwise, the script updates YouTube's video `currentTime` and mirrors the play/pause state to ensure synchronization.

### Background Script
- The background script routes messages between Netflix and YouTube.
- It listens for commands (such as `syncPlayPause`, `skip`, `netflixState`, and `enableSync`) and forwards them appropriately to their target tabs.

### Popup UI
- The extension popup provides a "Sync Now" button to initiate synchronization.
- When clicked, it queries both Netflix and YouTube tabs for their current state, calculates the offset, and then streams updates to device both videos.
- Troubleshooting tips are shown directly in the popup if issues occur (e.g., if there is a negative time error).

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" (toggle in the top-right corner).
4. Click "Load unpacked" and select the folder containing the extension's files.
5. The extension will be added to your browser.

## Usage

1. Open both Netflix and YouTube in separate tabs with a video loaded.
2. Make sure the videos are either both playing or both paused.
3. Click the VideoSync extension icon to bring up the popup.
4. Click "Sync Now" to initiate synchronization.
5. When a skip or seek occurs on Netflix, the corresponding YouTube video will update.  
   **Note:** If you seek too far back—causing the YouTube target time to drop below zero—the extension will disable auto-sync and display an error message. Re-sync by clicking "Sync Now" again.

## Troubleshooting

- **Sync Not Initiating:**  
  Ensure that valid video elements are present on both Netflix and YouTube pages.

- **Negative Target Time Error:**  
  If you encounter an error due to a negative computed target time (by seeking too far back), the popup will alert you that auto-sync has been disabled. Simply refresh your tabs and re-sync.

- **Developer Logging:**  
  For further issues or logs, open the browser console (F12 or right-click > Inspect) to see detailed diagnostic messages provided by the extension.

## Contributing

Contributions and improvements are welcome!  
If you encounter any issues or have suggestions, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

Happy syncing! 
