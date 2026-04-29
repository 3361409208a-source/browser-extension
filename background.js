// 确保点击扩展图标时打开侧边栏
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 也可以在这里处理其他后台逻辑
chrome.runtime.onInstalled.addListener(() => {
  console.log('表单自动填充调试工具已安装 (侧边栏模式)');
});
