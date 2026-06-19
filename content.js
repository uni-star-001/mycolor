if (window.location.hostname === 'uni-star-001.github.io') {
  // MyColor自身のページでは何もしない
} else {

let highlights = [];
let isEnabled = true;
let isScanning = false;
let appliedElements = []; // 適用済み要素を記録

function runScan() {
  if (!isEnabled) return;
  if (isScanning) return;
  isScanning = true;
  clearHighlights();

  axe.run({ runOnly: ['color-contrast'] }).then(function(results) {
    isScanning = false;
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
      if (!el) return;
      if (appliedElements.includes(el)) return; // 適用済みはスキップ

      el.style.outline = '3px solid #FFD700';
      el.style.outlineOffset = '2px';
      highlights.push(el);

      // クリックでカラーパネルを表示
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showColorPanel(el);
      });
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

// 保存済み設定を自動適用してからスキャン
applySavedColors().then(function() {
  runScan();
});

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
    <div style="font-size:11px; color:#595959; margin-bottom:12px;">対象：${targetEl.tagName.toLowerCase()}</div>
    <div style="margin-bottom:10px;">
      <div style="font-size:11px; color:#595959; margin-bottom:4px;">色を選ぶ</div>
      <input type="color" id="mycolor-picker" style="width:36px; height:36px; border:none; cursor:pointer; border-radius:6px;">
      <span id="mycolor-hex" style="margin-left:8px; font-size:12px; color:#595959;"></span>
    </div>
    <div style="margin-bottom:12px;">
      <div style="font-size:11px; color:#595959; margin-bottom:6px;">提案色（基準を満たす候補）</div>
      <div id="mycolor-suggests" style="display:flex; gap:6px; flex-wrap:wrap;"></div>
    </div>
    <div style="display:flex; gap:6px; margin-top:12px;">
      <button id="mycolor-revert" style="flex:1; padding:7px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; font-size:12px;">元に戻す</button>
      <button id="mycolor-apply" style="flex:1; padding:7px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; font-size:12px; font-weight:500;">適用して保存</button>
    </div>
    <button id="mycolor-close" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer; font-size:16px; color:#888;">×</button>
  `;

  document.body.appendChild(panel);
  targetEl.style.outline = '4px solid #FF4500'; // パネル表示中は赤枠を維持

  const picker = document.getElementById('mycolor-picker');
  const hexLabel = document.getElementById('mycolor-hex');
  const originalColor = targetEl.style.color || window.getComputedStyle(targetEl).color;

  // 現在の色をセット
  picker.value = rgbToHex(window.getComputedStyle(targetEl).color);
  hexLabel.textContent = picker.value;

  // 提案色を生成
  const bgColor = window.getComputedStyle(targetEl).backgroundColor;
  const suggests = generateSuggestColors(picker.value, bgColor);
  const suggestContainer = document.getElementById('mycolor-suggests');
  suggests.forEach(function(color) {
    const chip = document.createElement('div');
    chip.style.cssText = `
      display:flex; align-items:center; gap:4px;
      padding:4px 8px; border-radius:99px;
      border:1px solid #ddd; cursor:pointer;
      font-size:11px; color:#666; background:#f8f8f8;
    `;
    chip.innerHTML = `<div style="width:11px;height:11px;border-radius:50%;background:${color};"></div>${color}`;
    chip.addEventListener('click', function() {
      targetEl.style.color = color;
      picker.value = color;
      hexLabel.textContent = color;
    });
    suggestContainer.appendChild(chip);
  });

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
    targetEl.style.outline = '2px dashed #1D9E75';
    targetEl.style.outlineOffset = '2px';
    appliedElements.push(targetEl); // 適用済みリストに追加

    // chrome.storageに保存
    const siteKey = location.hostname;
    chrome.storage.sync.get(siteKey, function(data) {
      const siteData = data[siteKey] || {};
      const selector = getSelector(targetEl);
      siteData[selector] = {
        color: targetEl.style.color
      };
      chrome.storage.sync.set({ [siteKey]: siteData });
    });

    panel.remove();
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

// 保存済み色設定を自動適用
function applySavedColors() {
  return new Promise(function(resolve) {
    const siteKey = location.hostname;
    chrome.storage.sync.get(siteKey, function(data) {
      const siteData = data[siteKey] || {};
      Object.keys(siteData).forEach(function(selector) {
        const el = document.querySelector(selector);
        if (el) {
          el.style.color = siteData[selector].color;
          el.style.outline = '2px dashed #1D9E75';
          el.style.outlineOffset = '2px';
          appliedElements.push(el);
        }
      });
      resolve();
    });
  });
}

// セレクター取得
function getSelector(el) {
  if (el.id) return '#' + el.id;
  if (el.className) return el.tagName.toLowerCase() + '.' + el.className.trim().split(/\s+/).join('.');
  return el.tagName.toLowerCase();
}

// 提案色生成（chroma.jsを使用）
function generateSuggestColors(currentColor, bgColor) {
  const results = [];
  const bg = chroma(bgColor);

  // darken方向（最優先）
  const darkenCandidates = [
    chroma(currentColor).darken(1),
    chroma(currentColor).darken(2),
    chroma(currentColor).darken(3),
    chroma(currentColor).darken(4),
  ];

  // brighten方向（補助）
  const brightenCandidates = [
    chroma(currentColor).brighten(1),
    chroma(currentColor).brighten(2),
    chroma(currentColor).brighten(3),
  ];

  // darkenから最大2つ
  darkenCandidates.forEach(function(c) {
    try {
      if (chroma.contrast(c, bg) >= 4.5 && results.length < 2) {
        results.push(c.hex());
      }
    } catch(e) {}
  });

  // brightenから最大1つ（darkenと重複しない）
  brightenCandidates.forEach(function(c) {
    try {
      if (chroma.contrast(c, bg) >= 4.5 && results.length < 3) {
        results.push(c.hex());
      }
    } catch(e) {}
  });

  return results;
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
        const el = document.querySelector(node.target[0]);
        const tagName = el ? el.tagName.toLowerCase() : 'element';
        const tagToKey = {
          'p': 'elementText', 'span': 'elementText', 'div': 'elementText',
          'a': 'elementLink', 'button': 'elementButton', 'input': 'elementInput',
          'h1': 'elementHeading', 'h2': 'elementHeading', 'h3': 'elementHeading',
          'h4': 'elementHeading', 'h5': 'elementHeading', 'h6': 'elementHeading',
          'label': 'elementLabel', 'li': 'elementListItem'
        };
        const typeLabel = chrome.i18n.getMessage(tagToKey[tagName] || 'elementText');
        return {
          name: typeLabel,
          ratio: node.any[0]?.data?.contrastRatio
            ? node.any[0].data.contrastRatio.toFixed(1) + ':1'
            : '基準未満'
        };
      });
      sendResponse({ issues: issues });
    });
    return true; // 非同期応答はGET_ISSUESの時だけ約束する
  }

  if (message.type === 'FOCUS_ELEMENT') {
    const el = highlights[message.index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.outline = '4px solid #FF4500';
    }
  }

  if (message.type === 'UNFOCUS_ELEMENT') {
    const el = highlights[message.index];
    const panelOpen = document.getElementById('mycolor-panel');
    if (el && !panelOpen) {
      el.style.outline = '3px solid #FFD700';
    }
  }

  if (message.type === 'OPEN_PANEL') {
    const el = highlights[message.index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showColorPanel(el);
    }
  }
});

} // end else