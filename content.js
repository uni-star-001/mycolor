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

        // クリックでカラーパネルを表示
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          showColorPanel(el);
        });
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

// カラーパネルの表示
function showColorPanel(targetEl) {
  // 既存のパネルを削除
  const existing = document.getElementById('mycolor-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'mycolor-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 240px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 14px;
    z-index: 999999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13px;
    color: #222;
  `;

  panel.innerHTML = `
    <div style="font-weight:500; margin-bottom:4px;">色を変更</div>
    <div style="font-size:11px; color:#888; margin-bottom:12px;">対象：${targetEl.tagName.toLowerCase()}</div>
    <div style="margin-bottom:10px;">
      <div style="font-size:11px; color:#888; margin-bottom:4px;">色を選ぶ</div>
      <input type="color" id="mycolor-picker" style="width:36px; height:36px; border:none; cursor:pointer; border-radius:6px;">
      <span id="mycolor-hex" style="margin-left:8px; font-size:12px; color:#666;"></span>
    </div>
    <div style="display:flex; gap:6px; margin-top:12px;">
      <button id="mycolor-revert" style="flex:1; padding:7px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; font-size:12px;">元に戻す</button>
      <button id="mycolor-apply" style="flex:1; padding:7px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; font-size:12px; font-weight:500;">適用して保存</button>
    </div>
    <button id="mycolor-close" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:16px; color:#888;">×</button>
  `;

  document.body.appendChild(panel);

  const picker = document.getElementById('mycolor-picker');
  const hexLabel = document.getElementById('mycolor-hex');
  const originalColor = targetEl.style.color || window.getComputedStyle(targetEl).color;

  // 現在の色をセット
  picker.value = rgbToHex(window.getComputedStyle(targetEl).color);
  hexLabel.textContent = picker.value;

  // リアルタイムプレビュー
  picker.addEventListener('input', function() {
    targetEl.style.color = picker.value;
    hexLabel.textContent = picker.value;
  });

  // 閉じるボタン
  document.getElementById('mycolor-close').addEventListener('click', function() {
    panel.remove();
  });

  // 元に戻す
  document.getElementById('mycolor-revert').addEventListener('click', function() {
    targetEl.style.color = originalColor;
    targetEl.style.outline = '3px solid #FFD700';
    panel.remove();
  });

  // 適用して保存
  document.getElementById('mycolor-apply').addEventListener('click', function() {
    targetEl.style.outline = 'none';
    panel.remove();
    // Phase 1-C-6で保存処理を追加
  });
}

// RGB→HEX変換
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return '#000000';
  return '#' + result.slice(0,3).map(function(x) {
    return parseInt(x).toString(16).padStart(2, '0');
  }).join('');
}

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