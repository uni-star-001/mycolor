document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggle');
  const toggleLabel = document.querySelector('.toggle-label');
  const issueList = document.getElementById('issue-list');

  // i18n対応
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    const key = el.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) el.textContent = message;
  });


  // 免責表示（初回のみ）
  chrome.storage.sync.get('disclaimerShown', function(data) {
    if (!data.disclaimerShown) {
      const overlay = document.getElementById('disclaimer-overlay');
      const text = document.getElementById('disclaimer-text');
      const closeBtn = document.getElementById('disclaimer-close');
      const title = document.createElement('div');
      title.style.cssText = 'font-weight:500; font-size:14px; margin-bottom:10px;';
      title.textContent = chrome.i18n.getMessage('disclaimerTitle');
      text.parentNode.insertBefore(title, text);
      text.textContent = chrome.i18n.getMessage('disclaimer');
      text.style.whiteSpace = 'pre-line';
      closeBtn.textContent = chrome.i18n.getMessage('disclaimerClose');
      overlay.style.display = 'flex';
      closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
        chrome.storage.sync.set({ disclaimerShown: true });
      });
    }
  });

  // 現在のタブに問題一覧をリクエスト
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'CHECK_PANEL_OPEN' }, function(panelResponse) {
      if (panelResponse && panelResponse.panelOpen) {
        issueList.innerHTML = `<p class="no-issues">${chrome.i18n.getMessage('panelOpenWarning')}</p>`;
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_ISSUES' }, function(response) {
        if (chrome.runtime.lastError || !response) {
          issueList.innerHTML = `<p class="no-issues">${chrome.i18n.getMessage('notSupported')}</p>`;
          return;
        }
        displayIssues(response.issues);
      });
    });
  });

  // ON/OFFトグル
  toggle.addEventListener('change', function() {
    const enabled = toggle.checked;
    toggleLabel.textContent = enabled ? chrome.i18n.getMessage('toggleOn') : chrome.i18n.getMessage('toggleOff');
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE', enabled: enabled });
    });
  });

  function displayIssues(issues) {
    if (!issues || issues.length === 0) {
      issueList.innerHTML = `<p class="no-issues">${chrome.i18n.getMessage('noIssues')}</p>`;
      return;
    }
    const html = issues.map(function(issue, index) {
      return `<div class="issue-item" data-index="${index}">
        <span class="issue-name">${issue.name}</span>
        <span class="issue-ratio">⚠ ${issue.ratio}</span>
      </div>`;
    }).join('');
    issueList.innerHTML = html;

    // マウスオーバーで赤枠プレビュー・マウスアウトで黄色枠に戻す
    document.querySelectorAll('.issue-item').forEach(function(item) {
      let isClicked = false; // クリック済みフラグ（UNFOCUSの誤送信を防ぐ）

      item.addEventListener('mouseenter', function() {
        const index = parseInt(item.dataset.index);
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'FOCUS_ELEMENT', index: index });
        });
      });

      item.addEventListener('mouseleave', function() {
        if (isClicked) return; // クリック後はUNFOCUSを送らない
        const index = parseInt(item.dataset.index);
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'UNFOCUS_ELEMENT', index: index });
        });
      });

      // クリックでカラーパネルを直接開く
      item.addEventListener('click', function() {
        isClicked = true; // フラグを立てる
        const index = parseInt(item.dataset.index);
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'OPEN_PANEL', index: index });
        });
        window.close();
      });
    });
  }

  // リセットボタン
  document.getElementById('reset-site').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const hostname = new URL(tabs[0].url).hostname;
      chrome.storage.sync.remove(hostname, function() {
        chrome.tabs.reload(tabs[0].id);
        window.close();
      });
    });
  });

});