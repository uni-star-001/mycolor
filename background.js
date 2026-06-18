chrome.runtime.onMessage.addListener(function(message, sender) {
  if (message.type === 'UPDATE_BADGE') {
    const count = message.count;
    if (count === 0) {
      chrome.action.setBadgeText({ text: '', tabId: sender.tab.id });
    } else {
      chrome.action.setBadgeText({ text: String(count), tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#005BAC', tabId: sender.tab.id });
      chrome.action.setBadgeTextColor({ color: '#FFFFFF', tabId: sender.tab.id });
    }
  }
});