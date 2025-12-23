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
    
    selectDropdowns: () => {
      // Element Plus 下拉菜单
      const selects = document.querySelectorAll('.el-select');
      let count = 0;
      
      selects.forEach((select, index) => {
        setTimeout(() => {
          // 点击打开下拉菜单
          const input = select.querySelector('.el-input') || select.querySelector('.el-select__wrapper');
          if (input && !select.classList.contains('is-disabled')) {
            input.click();
            
            // 等待下拉菜单出现后选择第一个选项
            setTimeout(() => {
              const dropdown = document.querySelector('.el-select-dropdown:not([style*="display: none"])') 
                || document.querySelector('.el-popper[aria-hidden="false"]');
              if (dropdown) {
                const firstOption = dropdown.querySelector('.el-select-dropdown__item:not(.is-disabled)');
                if (firstOption) {
                  firstOption.click();
                  count++;
                }
              }
            }, 100);
          }
        }, index * 300); // 每个下拉菜单间隔300ms
      });
      
      setTimeout(() => {
        console.log('%c✅ 下拉菜单选择完成，共选择 ' + selects.length + ' 个', 'color: #00ff88; font-weight: bold;');
      }, selects.length * 300 + 200);
    },
    
    fillAll: () => {
      actions.fillInputs();
      setTimeout(() => actions.selectOptions(), 100);
      setTimeout(() => actions.selectDropdowns(), 200);
      console.log('%c🚀 一键填充完成', 'color: #00ccff; font-weight: bold;');
    }
  };
  
  actions[action]?.();
}

// 绑定按钮事件
document.getElementById('fillAll').onclick = () => executeAction('fillAll');
document.getElementById('selectOptions').onclick = () => executeAction('selectOptions');
document.getElementById('selectDropdowns').onclick = () => executeAction('selectDropdowns');

// 固定面板按钮
document.getElementById('pinPanel').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'pinPanel' });
    // 关闭popup
    window.close();
  } catch (error) {
    console.log('发送消息失败，尝试注入脚本');
    // 如果content script没有加载，直接注入创建面板的代码
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    setTimeout(async () => {
      await chrome.tabs.sendMessage(tab.id, { action: 'pinPanel' });
      window.close();
    }, 100);
  }
};

// 保存设置
document.getElementById('textValue').onchange = (e) => {
  chrome.storage.local.set({ textValue: e.target.value });
};
document.getElementById('numberValue').onchange = (e) => {
  chrome.storage.local.set({ numberValue: e.target.value });
};

// 加载保存的设置
chrome.storage.local.get(['textValue', 'numberValue'], (data) => {
  if (data.textValue) document.getElementById('textValue').value = data.textValue;
  if (data.numberValue) document.getElementById('numberValue').value = data.numberValue;
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
    alert('❌ 扩展无法在此页面工作');
  }
};
