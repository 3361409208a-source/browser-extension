// 数字矩阵背景
function initMatrix() {
  const matrix = document.getElementById('matrix');
  const chars = '01アイウエオカキクケコサシスセソタチツテト';
  let content = '';
  // 增加字符数量以覆盖侧边栏可能的高度
  for (let i = 0; i < 2000; i++) {
    content += chars[Math.floor(Math.random() * chars.length)];
    if (i % 30 === 0) content += '\n';
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
                // 点击页面空白处关闭下拉菜单，而不是Escape
                document.body.click();
                document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                i++;
                processNext();
              }, 150);
              
            } else if (attempt === 1) {
              console.log('%c↻ #' + (i+1) + ' 重试中...', 'color: #ff9900');
              input.blur();
              document.body.click();
              setTimeout(() => {
                processNext(2);
              }, 300);
            } else {
              console.log('%c✗ #' + (i+1) + ' 未找到选项', 'color: #ff4444');
              input.blur();
              document.body.click();
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

    // 诊断信息
    console.log('=== 扩展诊断 ===');
    console.log('当前标签页:', tab.url);
    console.log('标签页ID:', tab.id);
    console.log('标签页是否可访问:', tab.url && tab.url.startsWith('http'));

    // 检查页面是否可访问
    if (!tab.url || !tab.url.startsWith('http')) {
      alert('❌ 此页面无法访问\n\n扩展需要访问普通网页才能工作。\n\n当前页面: ' + (tab.url || '未知') + '\n\n建议：\n- 在普通网页（如 baidu.com, github.com）上使用此扩展\n- 不要在浏览器内部页面使用');
      return;
    }

    // 首先尝试通过消息通信
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'test' });
      console.log('消息通信成功:', response);
      alert('🔧 调试工具已激活！\n\n如果看到控制台日志，说明扩展工作正常。');
      return;
    } catch (msgError) {
      console.log('消息通信失败，尝试注入脚本:', msgError);
    }

    // 注入 content.js
    console.log('开始注入 content.js...');
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // 等待脚本加载完成
    await new Promise(resolve => setTimeout(resolve, 100));

    // 再次尝试消息通信
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'test' });
      console.log('消息通信成功:', response);
      alert('🔧 调试工具已激活！\n\n如果看到控制台日志，说明扩展工作正常。');
    } catch (finalError) {
      console.log('最终消息通信失败:', finalError);
      alert('🔧 脚本已注入！\n\n请刷新页面或点击"固定到页面"按钮来激活调试工具。\n\n如果仍有问题，请按 F12 打开控制台查看详细错误信息。');
    }
  } catch (error) {
    console.error('测试失败:', error);
    alert('❌ 扩展无法在此页面工作\n\n错误详情：\n' + error.message + '\n\n可能原因：\n1. 页面有严格的 CSP 限制\n2. 页面尚未完全加载\n3. 脚本注入被阻止\n\n建议：\n- 按 F12 打开控制台查看详细错误\n- 刷新页面后重试\n- 检查扩展权限是否正确配置');
  }
};
