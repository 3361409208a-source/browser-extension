// 数字矩阵背景
function initMatrix() {
  const matrix = document.getElementById('matrix');
  const chars = '01アイウエオカキクケコサシスセソタチツテト';
  let content = '';
  for (let i = 0; i < 500; i++) {
    content += chars[Math.floor(Math.random() * chars.length)];
    if (i % 20 === 0) content += '\n';
  }
  matrix.textContent = content;
}
initMatrix();

// 执行内容脚本中的函数
async function executeAction(action) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const settings = await chrome.storage.local.get(['textValue', 'numberValue']);
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: runAction,
    args: [action, settings.textValue || '测试数据', settings.numberValue || '100']
  });
}

function runAction(action, textValue, numberValue) {
  const actions = {
    fillInputs: () => {
      document.querySelectorAll('.el-input__inner, .el-textarea__inner, input[type="text"], input[type="number"], input:not([type]), textarea').forEach(input => {
        if (input.disabled || input.readOnly) return;
        const isTextarea = input.tagName === 'TEXTAREA';
        const isNumber = input.type === 'number' || input.classList.contains('el-input__inner');
        const proto = isTextarea ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(input, isTextarea ? textValue : numberValue);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      console.log('%c✅ 输入框填充完成', 'color: #00ff88; font-weight: bold;');
    },
    
    selectOptions: () => {
      // 单选框
      const radioGroups = new Set();
      document.querySelectorAll('.el-radio, input[type="radio"]').forEach(radio => {
        const group = radio.closest('.el-radio-group') || radio.name || Math.random();
        if (!radioGroups.has(group) && !radio.disabled) {
          radioGroups.add(group);
          radio.click();
        }
      });
      
      // 多选框
      const checkboxGroups = new Map();
      document.querySelectorAll('.el-checkbox, input[type="checkbox"]').forEach(cb => {
        const group = cb.closest('.el-checkbox-group') || 'default';
        const count = checkboxGroups.get(group) || 0;
        if (count < 2 && !cb.disabled && !cb.classList.contains('is-disabled')) {
          cb.click();
          checkboxGroups.set(group, count + 1);
        }
      });
      
      console.log('%c✅ 选项选择完成', 'color: #00ff88; font-weight: bold;');
    },
    
    fillAll: () => {
      actions.fillInputs();
      setTimeout(() => actions.selectOptions(), 100);
      console.log('%c🚀 一键全填完成', 'color: #00ccff; font-weight: bold;');
    }
  };
  
  actions[action]?.();
}

// 绑定按钮事件
document.getElementById('fillAll').onclick = () => executeAction('fillAll');
document.getElementById('selectOptions').onclick = () => executeAction('selectOptions');

// 保存设置
document.getElementById('textValue').onchange = (e) => {
  chrome.storage.local.set({ textValue: e.target.value });
};
document.getElementById('numberValue').onchange = (e) => {
  chrome.storage.local.set({ numberValue: e.target.value });
};

// 悬浮按钮开关
const floatToggle = document.getElementById('floatToggle');
floatToggle.onclick = async () => {
  floatToggle.classList.toggle('active');
  const show = floatToggle.classList.contains('active');
  chrome.storage.local.set({ showFloatBtn: show });
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleFloatBtn', show });
    console.log('悬浮按钮状态已更新:', show);
  } catch (error) {
    console.log('发送消息失败，可能需要刷新页面');
  }
};

// 加载保存的设置
chrome.storage.local.get(['textValue', 'numberValue', 'showFloatBtn'], (data) => {
  if (data.textValue) document.getElementById('textValue').value = data.textValue;
  if (data.numberValue) document.getElementById('numberValue').value = data.numberValue;
  if (data.showFloatBtn === false) floatToggle.classList.remove('active');
});

// 测试按钮
document.getElementById('testBtn').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log('%c🔧 扩展测试成功！', 'color: #00ff88; font-size: 16px; font-weight: bold;');
        alert('🔧 调试工具扩展工作正常！');
      }
    });
  } catch (error) {
    alert('❌ 扩展无法在此页面工作，请刷新页面后重试');
  }
};
