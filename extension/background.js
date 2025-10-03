import { analyzeTextInExtension } from './api.js';

// Create the context menu item upon installation.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "synthetica-analyze",
    title: "Analyze with Synthetica",
    contexts: ["selection"]
  });
});

// Listener for when the context menu item is clicked.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "synthetica-analyze" && info.selectionText) {
    // Start analysis: show a loading badge and store loading state.
    chrome.action.setBadgeText({ text: "..." });
    chrome.action.setBadgeBackgroundColor({ color: '#ff8c00' });
    chrome.storage.local.set({ isLoading: true, analysisResult: null, analysisError: null });

    analyzeTextInExtension(info.selectionText)
      .then(result => {
        // Success: store the result and update badge.
        chrome.storage.local.set({ analysisResult: result, isLoading: false });
        chrome.action.setBadgeText({ text: "✓" });
        chrome.action.setBadgeBackgroundColor({ color: '#32cd32' });
      })
      .catch(error => {
        // Error: store the error message and update badge.
        console.error("Synthetica Extension Error:", error);
        chrome.storage.local.set({ analysisError: error.message, isLoading: false });
        chrome.action.setBadgeText({ text: "!" });
        chrome.action.setBadgeBackgroundColor({ color: '#ff3131' });
      });
  }
});

// Clear the badge when a new tab is activated
chrome.tabs.onActivated.addListener(() => {
    chrome.action.getBadgeText({}, (text) => {
        if(text) {
             setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
        }
    });
});
