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
      console.log('%c📋 处理 ' + selects.length + ' 个下拉菜单', 'color: #00ccff; font-weight: bold;');

      if (selects.length === 0) return;

      let i = 0;
      let success = 0;

      const processNext = async (attempt = 1) => {
        if (i >= selects.length) {
          console.log('%c✅ 完成 ' + success + '/' + selects.length, 'color: #00ff88; font-weight: bold;');
          return;
        }

        const select = selects[i];
        const input = select.querySelector('input');
        if (!input) {
          i++;
          processNext();
          return;
        }

        // 前3个增加额外准备时间
        const extraDelay = i < 3 ? 300 : 0;
        
        setTimeout(() => {
          // 滚动到视图并聚焦
          select.scrollIntoView({ block: 'center', behavior: 'instant' });
          input.focus();

          // 等待下拉菜单出现
          const waitForDropdown = () => new Promise((resolve) => {
            let found = false;
            let checkCount = 0;
            
            const checkDropdown = () => {
              const dropdowns = document.querySelectorAll('.el-select-dropdown:not(.is-hidden), .el-popper:not(.is-hidden)');
              
              for (const dropdown of dropdowns) {
                const options = dropdown.querySelectorAll('.el-select-dropdown__item:not(.is-disabled):not(.is-selected)');
                if (options.length > 0) {
                  found = true;
                  observer.disconnect();
                  clearTimeout(timeoutId);
                  resolve({ dropdown, options: Array.from(options) });
                  return;
                }
              }
              
              if (++checkCount < 5 && !found) {
                setTimeout(checkDropdown, 100);
              }
            };
            
            const observer = new MutationObserver(() => {
              checkDropdown();
            });

            observer.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['class', 'style']
            });

            const timeoutId = setTimeout(() => {
              if (!found) {
                observer.disconnect();
                resolve(null);
              }
            }, 2000);

            // 触发打开下拉菜单
            setTimeout(() => {
              const arrow = select.querySelector('.el-select__caret, .el-input__suffix-inner, .el-select__suffix');
              const target = arrow || input;
              
              target.click();
              target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            }, 50);
          });

          waitForDropdown().then(result => {
            if (result && result.options.length > 0) {
              const option = result.options[0];
              
              option.scrollIntoView({ block: 'nearest', behavior: 'instant' });
              
              const rect = option.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              
              const events = [
                new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }),
                new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }),
                new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y })
              ];
              
              events.forEach(e => option.dispatchEvent(e));
              option.click?.();
              
              // 键盘导航备用
              setTimeout(() => {
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                setTimeout(() => {
                  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                }, 50);
              }, 50);
              
              success++;
              console.log('%c✓ #' + (i+1) + ' ' + option.textContent.trim().slice(0, 15), 'color: #00ff88');
              
              setTimeout(() => {
                input.blur();
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                i++;
                processNext();
              }, 150);
              
            } else if (attempt === 1) {
              console.log('%c↻ #' + (i+1) + ' 重试中...', 'color: #ff9900');
              input.blur();
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
              setTimeout(() => {
                processNext(2);
              }, 300);
            } else {
              console.log('%c✗ #' + (i+1) + ' 未找到选项', 'color: #ff4444');
              input.blur();
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
              i++;
              processNext();
            }
          });
        }, extraDelay);
      };

      // 初始延迟，确保页面准备好
      setTimeout(() => {
        processNext();
      }, 200);
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
