let highlights = [];
let isEnabled = true;

function runScan() {
  if (!isEnabled) return;
  clearHighlights();

  axe.run({ runOnly: ['color-contrast'] }).then(function(results) {
    const violations = results.violations;
    if (violations.length === 0) return;

    const nodes = violations[0].nodes;
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