# Netflix-YouTube Sync Extension

## Overview

The Netflix-YouTube Sync extension lets you synchronize playback between Netflix and YouTube. **Synchronization is manual**—you must click the "Sync" button to lock the two videos together before any changes in Netflix are reflected on YouTube.

## Key Features

- **Manual Sync Activation:**  
  The extension will not automatically sync the two videos. Instead, you must click the "Sync" button to record the current offset between Netflix and YouTube. Once set, sync updates will be active.

- **Continuous Sync Updates:**  
  After sync activation, any time change on Netflix (either forward or backward skips) is immediately reflected in YouTube. The YouTube video's `currentTime` is updated to:
  
  ```
  targetTime = netflix_currentTime + syncOffset
  ```
  
  with negative times clamped to zero. All updates are applied unconditionally—there is no threshold logic to disable syncing.

- **Play/Pause Synchronization:**  
  The extension also updates the YouTube player's play/pause state to match Netflix:
  
  - If Netflix is playing, YouTube starts playing.
  - If Netflix is paused, YouTube is paused.
  
  This ensures that both videos remain in sync after a sync is initiated.

## How It Works

1. **Netflix State Updates:**  
   The Netflix content script sends `netflixState` messages containing the current playback time and paused state. These messages are forwarded (via the background script) to the YouTube content script.

2. **Activation of Sync:**  
   On the YouTube side (in `content.js`), syncing is disabled by default. When you click the "Sync" button, a `setSyncOffset` message is sent. This records the offset and enables syncing.

3. **Processing Netflix State on YouTube:**  
   Once syncing is active:
   - The YouTube script computes the target time using the Netflix current time plus the sync offset.
   - It sets the YouTube video's `currentTime` to the computed target without any threshold-based verification.
   - It enforces the play/pause state to match Netflix.

   *Note:* This configuration has removed any manual seeking or threshold logic. Every Netflix state change (even large jumps) will be immediately pushed to YouTube.

## Installation & Usage

1. **Installation:**
   - Clone this repository.
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode."
   - Click "Load unpacked" and select the repository directory.

2. **Usage:**
   - Open Netflix in one tab and start playing a video.
   - Open YouTube in another tab.
   - Click the "Sync" button in the extension's UI. This will record the current offset between the Netflix and YouTube videos and activate syncing.
   - After syncing is activated, any skip (forward or backward) or play/pause update in Netflix is immediately reflected in the YouTube video.

## Troubleshooting

- **Sync Does Not Activate:**  
  Make sure you click the "Sync" button to initiate synchronization. Without this step, Netflix state updates are ignored on the YouTube side.

- **Playback Issues:**  
  Since all time updates are applied unconditionally, if any unexpected pauses occur on YouTube (usually during backwards skips), check the underlying state updates from Netflix. These issues might be transient or related to how Netflix handles backward seeks.

- **Sync Permanence:**  
  The current configuration removes any threshold that disables sync. Once you activate sync, subsequent Netflix state updates (regardless of how large) will always update YouTube.

## License

This project is licensed under the MIT License.

Happy syncing! 
