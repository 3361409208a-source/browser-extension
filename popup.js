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
      const radioGroups = new Set();
      document.querySelectorAll('.el-radio, input[type="radio"]').forEach(radio => {
        const group = radio.closest('.el-radio-group') || radio.name || Math.random();
        if (!radioGroups.has(group) && !radio.disabled) {
          radioGroups.add(group);
          radio.click();
        }
      });
      
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
      const selects = [...document.querySelectorAll('.el-select:not(.is-disabled)')];
      console.log('%c📋 开始处理下拉菜单，共找到 ' + selects.length + ' 个', 'color: #00ccff; font-weight: bold; font-size: 14px;');
      
      if (selects.length === 0) {
        console.log('%c⚠️ 未找到下拉菜单', 'color: #ff9900;');
        return;
      }
      
      let index = 0;
      let successCount = 0;
      
      function selectNext() {
        if (index >= selects.length) {
          console.log('%c✅ 全部完成！成功: ' + successCount + '/' + selects.length, 'color: #00ff88; font-weight: bold; font-size: 14px;');
          return;
        }
        
        console.log('%c--- 处理第 ' + (index + 1) + '/' + selects.length + ' 个下拉菜单 ---', 'color: #00ccff;');
        
        const select = selects[index];
        const clickTargets = [
          select.querySelector('.el-select__wrapper'),
          select.querySelector('.el-input__wrapper'),
          select.querySelector('.el-input'),
          select
        ].filter(Boolean);
        
        console.log('  找到 ' + clickTargets.length + ' 个可点击目标');
        
        let clicked = false;
        for (let i = 0; i < clickTargets.length; i++) {
          try {
            clickTargets[i].click();
            clicked = true;
            console.log('  ✓ 点击成功（目标' + (i + 1) + '）');
            break;
          } catch (e) {
            console.log('  ✗ 点击失败（目标' + (i + 1) + '）:', e.message);
          }
        }
        
        if (!clicked) {
          console.log('%c  ✗ 无法点击，跳过', 'color: #ff4444;');
          index++;
          setTimeout(selectNext, 100);
          return;
        }
        
        // 等待下拉菜单出现
        setTimeout(() => {
          console.log('  查找下拉选项...');
          let found = false;
          
          // 方法1: 通过 getBoundingClientRect 查找可见的下拉菜单
          const allDropdowns = document.querySelectorAll('.el-select-dropdown');
          console.log('  找到 ' + allDropdowns.length + ' 个下拉菜单元素');
          
          for (let i = 0; i < allDropdowns.length; i++) {
            if (found) break;
            const dropdown = allDropdowns[i];
            const rect = dropdown.getBoundingClientRect();
            console.log('  下拉菜单' + (i + 1) + ' 尺寸:', rect.width + 'x' + rect.height);
            
            if (rect.width > 0 && rect.height > 0) {
              const options = dropdown.querySelectorAll('.el-select-dropdown__item:not(.is-disabled):not(.is-selected)');
              console.log('  找到 ' + options.length + ' 个可选项');
              
              if (options.length > 0) {
                options[0].click();
                successCount++;
                found = true;
                console.log('%c  ✓ 成功选择第 ' + (index + 1) + ' 个！', 'color: #00ff88; font-weight: bold;');
              }
            }
          }
          
          // 方法2: 查找 body 下的 popper
          if (!found) {
            console.log('  尝试方法2: 查找 popper...');
            const poppers = document.querySelectorAll('body > .el-popper, body > div[id^="el-popper-"]');
            console.log('  找到 ' + poppers.length + ' 个 popper');
            
            for (const popper of poppers) {
              if (found) break;
              const style = window.getComputedStyle(popper);
              if (style.display !== 'none' && style.visibility !== 'hidden') {
                const option = popper.querySelector('.el-select-dropdown__item:not(.is-disabled):not(.is-selected)');
                if (option) {
                  option.click();
                  successCount++;
                  found = true;
                  console.log('%c  ✓ 成功选择第 ' + (index + 1) + ' 个（方法2）！', 'color: #00ff88; font-weight: bold;');
                }
              }
            }
          }
          
          if (!found) {
            console.log('%c  ✗ 未找到可选项', 'color: #ff9900;');
          }
          
          index++;
          console.log('  准备处理下一个...\n');
          setTimeout(selectNext, 400);
        }, 300);
      }
      
      selectNext();
    },
    
    selectDates: () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      let count = 0;
      
      // Element Plus 日期选择器
      document.querySelectorAll('.el-date-editor input').forEach(input => {
        if (!input.disabled && !input.readOnly) {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(input, dateStr);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          count++;
        }
      });
      
      // 普通日期输入框
      document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.disabled && !input.readOnly) {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(input, dateStr);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          count++;
        }
      });
      
      console.log('%c✅ 日期填充完成，共 ' + count + ' 个', 'color: #00ff88; font-weight: bold;');
    },
    
    clickButtons: () => {
      const keywords = ['确定', '确认', '提交', '保存', '下一步', '完成', '开始'];
      let count = 0;
      
      document.querySelectorAll('button, .el-button').forEach(btn => {
        if (btn.disabled || btn.classList.contains('is-disabled')) return;
        
        const text = btn.textContent.trim();
        if (keywords.some(keyword => text.includes(keyword))) {
          console.log('%c  点击: ' + text, 'color: #00ccff;');
          setTimeout(() => {
            btn.click();
            count++;
          }, count * 500);
        }
      });
      
      setTimeout(() => {
        console.log('%c✅ 按钮点击完成，共 ' + count + ' 个', 'color: #00ff88; font-weight: bold;');
      }, count * 500 + 100);
    },
    
    fillAll: () => {
      actions.fillInputs();
      setTimeout(() => actions.selectOptions(), 100);
      setTimeout(() => actions.selectDropdowns(), 200);
      setTimeout(() => actions.selectDates(), 300);
    }
  };
  
  actions[action]?.();
}

// 绑定按钮事件
document.getElementById('fillAll').onclick = () => executeAction('fillAll');
document.getElementById('selectOptions').onclick = () => executeAction('selectOptions');
document.getElementById('selectDropdowns').onclick = () => executeAction('selectDropdowns');
document.getElementById('selectDates').onclick = () => executeAction('selectDates');
document.getElementById('clickButtons').onclick = () => executeAction('clickButtons');

// 复制请求载荷 - 现在集成到固定面板中
document.getElementById('copyPayload').onclick = async () => {
  alert('📡 请求监听功能已集成到固定面板中\n\n请点击"📌 固定到页面"按钮\n然后点击面板中的"📡 请求监听"按钮即可使用');
};

// 固定面板按钮
document.getElementById('pinPanel').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'pinPanel' });
    window.close();
  } catch (error) {
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
