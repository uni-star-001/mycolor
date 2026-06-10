console.log('MyColor: content script loaded!');

axe.run({ runOnly: ['color-contrast'] }).then(function(results) {
  if (results.violations.length === 0) {
    console.log('MyColor: コントラスト違反なし');
  } else {
    console.log('MyColor: コントラスト違反 ' + results.violations[0].nodes.length + '件検出');
    console.log(results.violations[0].nodes);
  }
});