let highlights = [];
let isEnabled = true;

function runScan() {
  if (!isEnabled) return;
  clearHighlights();

  axe.run({ runOnly: ['color-contrast'] }).then(function(results) {
    const violations = results.violations;
    if (violations.length === 0) {
      chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', count: 0 });
      return;
    }

    const nodes = violations[0].nodes;

    // バッジに件数を送信
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', count: nodes.length });

    nodes.forEach(function(node) {
      const el = document.querySelector(node.target[0]);
      if (el) {
        el.style.outline = '3px solid #FFD700';
        el.style.outlineOffset = '2px';
        highlights.push(el);
      }
    });
  });
}

function clearHighlights() {
  highlights.forEach(function(el) {
    el.style.outline = '';
    el.style.outlineOffset = '';
  });
  highlights = [];
}

// ページ読み込み後にスキャン実行
runScan();

// 動的コンテンツ対応（SPA等）
let debounceTimer = null;

const observer = new MutationObserver(function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(function() {
    runScan();
  }, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// ON/OFFとGET_ISSUESのメッセージ受信
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'TOGGLE') {
    isEnabled = message.enabled;
    if (isEnabled) {
      runScan();
    } else {
      clearHighlights();
    }
  }

  if (message.type === 'GET_ISSUES') {
    axe.run({ runOnly: ['color-contrast'] }).then(function(results) {
      const violations = results.violations;
      if (violations.length === 0) {
        sendResponse({ issues: [] });
        return;
      }
      const issues = violations[0].nodes.map(function(node) {
        return {
          name: node.target[0],
          ratio: node.any[0]?.data?.contrastRatio
            ? node.any[0].data.contrastRatio.toFixed(1) + ':1'
            : '基準未満'
        };
      });
      sendResponse({ issues: issues });
    });
    
  }

  if (message.type === 'FOCUS_ELEMENT') {
    const el = highlights[message.index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.outline = '4px solid #FF4500';
      setTimeout(function() {
        el.style.outline = '3px solid #FFD700';
      }, 1500);
    }
  }

  return true;
});