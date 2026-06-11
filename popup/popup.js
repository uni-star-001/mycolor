document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggle');
  const toggleLabel = document.querySelector('.toggle-label');
  const issueList = document.getElementById('issue-list');

  // 現在のタブに問題一覧をリクエスト
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_ISSUES' }, function(response) {
      if (chrome.runtime.lastError || !response) {
        issueList.innerHTML = '<p class="no-issues">このページでは動作しません</p>';
        return;
      }
      displayIssues(response.issues);
    });
  });

  // ON/OFFトグル
  toggle.addEventListener('change', function() {
    const enabled = toggle.checked;
    toggleLabel.textContent = enabled ? 'ON' : 'OFF';
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE', enabled: enabled });
    });
  });

  function displayIssues(issues) {
    if (!issues || issues.length === 0) {
      issueList.innerHTML = '<p class="no-issues">問題は見つかりませんでした ✓</p>';
      return;
    }
    const html = issues.map(function(issue, index) {
      return `<div class="issue-item" data-index="${index}">
        <span class="issue-name">${issue.name}</span>
        <span class="issue-ratio">${issue.ratio}</span>
      </div>`;
    }).join('');
    issueList.innerHTML = html;

    // クリックで該当要素にスクロール
    document.querySelectorAll('.issue-item').forEach(function(item) {
      item.addEventListener('click', function() {
        const index = parseInt(item.dataset.index);
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'FOCUS_ELEMENT', index: index });
        });
        window.close();
      });
    });
  }

});