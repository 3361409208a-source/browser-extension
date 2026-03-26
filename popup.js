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

      // 方法1: 尝试直接操作 Vue 组件实例
      const tryVueMethod = (selectEl) => {
        try {
          // 查找 Vue 实例
          const vueInstance = selectEl.__vueParentComponent || selectEl.__vue__ || 
                             (selectEl._vnode && selectEl._vnode.ctx);
          
          if (vueInstance) {
            // 尝试获取组件实例
            const component = vueInstance.ctx || vueInstance.setupState || vueInstance;
            
            // Element Plus Select 组件通常有 handleOptionSelect 方法
            if (component.handleOptionSelect) {
              // 获取第一个选项
              const options = component.options || component.cachedOptions || [];
              if (options.length > 0) {
                component.handleOptionSelect(options[0]);
                return true;
              }
            }
            
            // 尝试直接设置值
            if (component.modelValue !== undefined) {
              const options = component.options || [];
              if (options.length > 0) {
                component['update:modelValue']?.(options[0].value);
                component.handleChange?.(options[0].value);
                return true;
              }
            }
          }
        } catch (e) {
          console.log('  Vue 方法失败:', e.message);
        }
        return false;
      };

      // 全新方法：使用键盘导航 + MutationObserver 监听下拉菜单出现
      const selectWithKeyboard = async (selectEl) => {
        return new Promise((resolve) => {
          const input = selectEl.querySelector('input');
          if (!input) {
            resolve(false);
            return;
          }

          // 先关闭所有下拉菜单
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
          
          setTimeout(() => {
            selectEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // 使用 MutationObserver 监听下拉菜单出现
            const observer = new MutationObserver((mutations, obs) => {
              // 查找可见的下拉菜单
              const dropdowns = document.querySelectorAll('.el-select-dropdown, .el-popper');
              for (const dropdown of dropdowns) {
                const rect = dropdown.getBoundingClientRect();
                const style = window.getComputedStyle(dropdown);
                
                if (rect.width > 0 && rect.height > 0 && 
                    style.display !== 'none' && 
                    style.visibility !== 'hidden') {
                  
                  const option = dropdown.querySelector('.el-select-dropdown__item:not(.is-disabled):not(.is-selected)');
                  if (option) {
                    obs.disconnect();
                    
                    // 找到选项后，使用更可靠的方式点击
                    setTimeout(() => {
                      // 方法1: 直接点击选项
                      option.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                      
                      // 创建更真实的鼠标事件
                      const mouseEvents = [
                        new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, buttons: 1 }),
                        new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, buttons: 1 }),
                        new MouseEvent('click', { bubbles: true, cancelable: true, view: window, buttons: 1 })
                      ];
                      
                      mouseEvents.forEach(evt => option.dispatchEvent(evt));
                      
                      // 也尝试直接调用 click
                      if (typeof option.click === 'function') {
                        option.click();
                      }
                      
                      resolve(true);
                    }, 50);
                    return;
                  }
                }
              }
            });

            // 开始观察 DOM 变化
            observer.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['style', 'class']
            });

            // 设置超时
            setTimeout(() => {
              observer.disconnect();
              resolve(false);
            }, 3000);

            // Focus 到 input
            input.focus();
            
            // 触发键盘事件打开下拉菜单：Space 或 Enter
            setTimeout(() => {
              const spaceEvent = new KeyboardEvent('keydown', {
                key: ' ',
                code: 'Space',
                keyCode: 32,
                which: 32,
                bubbles: true,
                cancelable: true
              });
              input.dispatchEvent(spaceEvent);
              
              setTimeout(() => {
                const enterEvent = new KeyboardEvent('keydown', {
                  key: 'Enter',
                  code: 'Enter',
                  keyCode: 13,
                  which: 13,
                  bubbles: true,
                  cancelable: true
                });
                input.dispatchEvent(enterEvent);
                
                // 如果键盘事件不行，尝试点击
                setTimeout(() => {
                  const wrapper = selectEl.querySelector('.el-select__wrapper') || 
                                selectEl.querySelector('.el-input__wrapper') ||
                                selectEl;
                  wrapper.click();
                }, 100);
              }, 100);
            }, 100);
          }, 200);
        });
      };

      let index = 0;
      let successCount = 0;

      async function selectNext() {
        if (index >= selects.length) {
          console.log('%c✅ 全部完成！成功: ' + successCount + '/' + selects.length, 'color: #00ff88; font-weight: bold; font-size: 14px;');
          return;
        }

        const select = selects[index];
        console.log('%c--- 处理第 ' + (index + 1) + '/' + selects.length + ' 个下拉菜单 ---', 'color: #00ccff;');

        const success = await selectWithKeyboard(select);

        if (success) {
          successCount++;
          console.log('%c  ✓ 成功选择第 ' + (index + 1) + ' 个！', 'color: #00ff88; font-weight: bold;');
        } else {
          console.log('%c  ✗ 选择失败', 'color: #ff4444;');
        }

        index++;
        setTimeout(selectNext, 500);
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
