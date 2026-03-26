// 固定面板
let fixedPanel = null;

function createFixedPanel() {
  if (fixedPanel) return;
  
  // 注入样式
  const style = document.createElement('style');
  style.id = 'cyber-debug-style';
  style.textContent = `
    @keyframes cyber-pulse {
      0%, 100% { box-shadow: 0 0 15px rgba(0, 255, 136, 0.5); }
      50% { box-shadow: 0 0 25px rgba(0, 255, 136, 0.8); }
    }
    @keyframes cyber-scan {
      0% { top: 0; }
      100% { top: calc(100% - 2px); }
    }
  `;
  if (!document.getElementById('cyber-debug-style')) {
    document.head.appendChild(style);
  }
  
  fixedPanel = document.createElement('div');
  fixedPanel.id = 'cyber-debug-fixed-panel';
  fixedPanel.innerHTML = `
    <div class="scan-line"></div>
    <div class="panel-header">
      <span class="header-text">⚡ 调试工具</span>
      <span class="close-btn">×</span>
    </div>
    <div class="panel-body">
      <button class="cyber-btn primary" data-action="fillAll">🚀 一键填充</button>
      <button class="cyber-btn" data-action="selectOptions">☑️ 选择选项</button>
      <button class="cyber-btn" data-action="selectDropdowns">📋 下拉菜单</button>
      <button class="cyber-btn" data-action="selectDates">📅 填充日期</button>
      <button class="cyber-btn" data-action="clickButtons">🔘 点击按钮</button>
      <button class="cyber-btn" id="toggle-payload">📡 请求监听</button>
    </div>
    <div id="payload-sidebar" style="display: none; position: absolute; left: 100%; top: 0; width: 350px; height: 100%; background: linear-gradient(180deg, rgba(10, 14, 23, 0.98) 0%, rgba(15, 20, 30, 0.98) 100%); border: 1px solid rgba(0, 204, 255, 0.5); border-left: none; border-radius: 0 8px 8px 0; overflow: hidden;">
      <div style="padding: 10px 12px; background: rgba(0,204,255,0.1); border-bottom: 1px solid rgba(0,204,255,0.3); color: #00ccff; font-size: 12px; font-weight: bold;">
        📡 请求监听器
      </div>
      <div style="padding: 10px; font-size: 10px; color: #00ff88; background: rgba(0,255,136,0.05);">
        ✓ 监听中... 进行操作后点击请求复制载荷
      </div>
      <div id="payload-list" style="padding: 10px; max-height: calc(100% - 80px); overflow-y: auto;"></div>
    </div>
  `;
  
  // 面板样式
  fixedPanel.style.cssText = `
    position: fixed;
    right: 20px;
    top: 100px;
    z-index: 999999;
    width: 160px;
    background: linear-gradient(180deg, rgba(10, 14, 23, 0.95) 0%, rgba(15, 20, 30, 0.95) 100%);
    border: 1px solid rgba(0, 255, 136, 0.5);
    font-family: 'Consolas', 'Monaco', monospace;
    border-radius: 8px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;
  
  // 扫描线
  const scanLine = fixedPanel.querySelector('.scan-line');
  scanLine.style.cssText = `
    position: absolute; top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.8), transparent);
    animation: cyber-scan 2s linear infinite;
    pointer-events: none;
  `;
  
  // 头部
  const header = fixedPanel.querySelector('.panel-header');
  header.style.cssText = `
    padding: 10px 12px;
    background: rgba(0, 255, 136, 0.1);
    border-bottom: 1px solid rgba(0, 255, 136, 0.3);
    display: flex; justify-content: space-between; align-items: center;
    cursor: move;
  `;
  
  fixedPanel.querySelector('.header-text').style.cssText = `
    color: #00ff88; font-size: 12px; font-weight: bold;
    text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
  `;
  
  // 关闭按钮
  const closeBtn = fixedPanel.querySelector('.close-btn');
  closeBtn.style.cssText = `
    color: #666; font-size: 18px; cursor: pointer; transition: all 0.3s; line-height: 1;
  `;
  closeBtn.onmouseenter = () => { closeBtn.style.color = '#ff4444'; };
  closeBtn.onmouseleave = () => { closeBtn.style.color = '#666'; };
  closeBtn.onclick = () => removeFixedPanel();
  
  // 按钮区
  const body = fixedPanel.querySelector('.panel-body');
  body.style.cssText = 'padding: 12px;';
  
  fixedPanel.querySelectorAll('.cyber-btn:not(#toggle-payload)').forEach(btn => {
    const isPrimary = btn.classList.contains('primary');
    btn.style.cssText = `
      display: block; width: 100%;
      padding: 10px 12px; margin-bottom: 8px;
      background: ${isPrimary ? 'rgba(0, 204, 255, 0.1)' : 'transparent'};
      border: 1px solid rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.5);
      color: ${isPrimary ? '#00ccff' : '#00ff88'};
      font-family: inherit; font-size: 12px;
      cursor: pointer; text-align: center;
      transition: all 0.3s;
      border-radius: 4px;
    `;
    
    btn.onmouseenter = () => {
      btn.style.borderColor = isPrimary ? '#00ccff' : '#00ff88';
      btn.style.boxShadow = `0 0 15px rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.4)`;
      btn.style.background = `rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.2)`;
    };
    
    btn.onmouseleave = () => {
      btn.style.borderColor = `rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.5)`;
      btn.style.boxShadow = 'none';
      btn.style.background = isPrimary ? 'rgba(0, 204, 255, 0.1)' : 'transparent';
    };
    
    btn.onclick = () => runAction(btn.dataset.action);
  });
  
  // 单独处理请求监听按钮的样式和事件
  const togglePayloadBtn = fixedPanel.querySelector('#toggle-payload');
  const payloadSidebar = fixedPanel.querySelector('#payload-sidebar');
  const payloadList = fixedPanel.querySelector('#payload-list');
  
  togglePayloadBtn.style.cssText = `
    display: block; width: 100%;
    padding: 10px 12px; margin-bottom: 8px;
    background: transparent;
    border: 1px solid rgba(0, 255, 136, 0.5);
    color: #00ff88;
    font-family: inherit; font-size: 12px;
    cursor: pointer; text-align: center;
    transition: all 0.3s;
    border-radius: 4px;
  `;
  
  togglePayloadBtn.onmouseenter = () => {
    togglePayloadBtn.style.borderColor = '#00ff88';
    togglePayloadBtn.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.4)';
    togglePayloadBtn.style.background = 'rgba(0, 255, 136, 0.2)';
  };
  
  togglePayloadBtn.onmouseleave = () => {
    const isActive = payloadSidebar.style.display !== 'none';
    togglePayloadBtn.style.borderColor = isActive ? '#00ccff' : 'rgba(0, 255, 136, 0.5)';
    togglePayloadBtn.style.boxShadow = 'none';
    togglePayloadBtn.style.background = isActive ? 'rgba(0, 204, 255, 0.2)' : 'transparent';
  };
  
  // 请求监听侧边栏切换
  let isMonitoring = false;
  
  togglePayloadBtn.onclick = (e) => {
    e.stopPropagation();
    console.log('点击了请求监听按钮');
    
    if (payloadSidebar.style.display === 'none') {
      payloadSidebar.style.display = 'block';
      togglePayloadBtn.style.background = 'rgba(0, 204, 255, 0.2)';
      togglePayloadBtn.style.borderColor = '#00ccff';
      
      if (!isMonitoring) {
        startPayloadMonitoring();
        isMonitoring = true;
      }
    } else {
      payloadSidebar.style.display = 'none';
      togglePayloadBtn.style.background = 'transparent';
      togglePayloadBtn.style.borderColor = 'rgba(0, 255, 136, 0.5)';
    }
  };
  
  function startPayloadMonitoring() {
    function addRequest(method, url, body) {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 8px; margin-bottom: 6px;
        background: rgba(0,204,255,0.05);
        border: 1px solid rgba(0,204,255,0.3);
        border-radius: 4px; cursor: pointer;
        transition: all 0.2s;
      `;
      
      const urlShort = url.length > 40 ? '...' + url.slice(-37) : url;
      const bodyPreview = typeof body === 'string' ? body.slice(0, 60) : JSON.stringify(body).slice(0, 60);
      
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: #00ff88; font-weight: bold; font-size: 10px;">${method}</span>
          <span style="color: #666; font-size: 9px;">${new Date().toLocaleTimeString()}</span>
        </div>
        <div style="color: #00ccff; font-size: 10px; margin-bottom: 3px; word-break: break-all;">${urlShort}</div>
        <div style="color: #888; font-size: 9px;">${bodyPreview}...</div>
      `;
      
      item.onclick = () => {
        let bodyText = typeof body === 'string' ? body : JSON.stringify(body);
        try {
          const parsed = JSON.parse(bodyText);
          bodyText = JSON.stringify(parsed, null, 2);
        } catch (e) {}
        
        navigator.clipboard.writeText(bodyText).then(() => {
          item.style.background = 'rgba(0,255,136,0.2)';
          item.style.borderColor = '#00ff88';
          
          const copied = document.createElement('div');
          copied.textContent = '✓ 已复制';
          copied.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #00ff88; color: #000; padding: 4px 8px; border-radius: 3px; font-weight: bold; font-size: 10px;';
          item.style.position = 'relative';
          item.appendChild(copied);
          
          setTimeout(() => {
            copied.remove();
            item.style.background = 'rgba(0,204,255,0.05)';
            item.style.borderColor = 'rgba(0,204,255,0.3)';
          }, 800);
        });
        
        console.log('%c📋 请求载荷已复制', 'color: #00ff88; font-weight: bold; font-size: 14px;');
        console.log('%cURL:', 'color: #00ccff; font-weight: bold;', url);
        console.log('%cMethod:', 'color: #00ccff; font-weight: bold;', method);
        console.log('%cPayload:', 'color: #00ccff; font-weight: bold;');
        console.log(bodyText);
      };
      
      item.onmouseenter = () => {
        item.style.background = 'rgba(0,204,255,0.15)';
        item.style.transform = 'translateX(-2px)';
      };
      item.onmouseleave = () => {
        item.style.background = 'rgba(0,204,255,0.05)';
        item.style.transform = 'translateX(0)';
      };
      
      payloadList.insertBefore(item, payloadList.firstChild);
      if (payloadList.children.length > 20) {
        payloadList.removeChild(payloadList.lastChild);
      }
    }
    
    // 拦截 fetch
    if (!window.__originalFetch) {
      window.__originalFetch = window.fetch;
      window.fetch = function(...args) {
        const [url, options] = args;
        if (options && options.body) {
          addRequest(options.method || 'POST', url, options.body);
        }
        return window.__originalFetch.apply(this, args);
      };
    }
    
    // 拦截 XMLHttpRequest
    if (!window.__originalXHR) {
      window.__originalXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new window.__originalXHR();
        const originalSend = xhr.send;
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url) {
          xhr._method = method;
          xhr._url = url;
          return originalOpen.apply(this, arguments);
        };
        
        xhr.send = function(body) {
          if (body) {
            addRequest(xhr._method || 'POST', xhr._url || 'XHR', body);
          }
          return originalSend.apply(this, arguments);
        };
        
        return xhr;
      };
    }
    
    console.log('%c📡 请求监听器已启动', 'color: #00ccff; font-weight: bold;');
  }
  
  // 拖拽功能
  let isDragging = false;
  let offset = { x: 0, y: 0 };
  
  header.onmousedown = (e) => {
    isDragging = true;
    offset = { x: e.clientX - fixedPanel.offsetLeft, y: e.clientY - fixedPanel.offsetTop };
    
    const onMove = (e) => {
      if (!isDragging) return;
      fixedPanel.style.left = (e.clientX - offset.x) + 'px';
      fixedPanel.style.top = (e.clientY - offset.y) + 'px';
      fixedPanel.style.right = 'auto';
    };
    
    const onUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };
  
  document.body.appendChild(fixedPanel);
  console.log('%c🔧 调试面板已固定', 'color: #00ff88; font-weight: bold;');
}

function removeFixedPanel() {
  // 恢复原始的 fetch 和 XMLHttpRequest
  if (window.__originalFetch) {
    window.fetch = window.__originalFetch;
    delete window.__originalFetch;
  }
  if (window.__originalXHR) {
    window.XMLHttpRequest = window.__originalXHR;
    delete window.__originalXHR;
  }
  
  fixedPanel?.remove();
  fixedPanel = null;
  console.log('%c🔧 调试面板已关闭', 'color: #ff4444; font-weight: bold;');
}

function runAction(action) {
  const actions = {
    fillInputs: () => {
      document.querySelectorAll('.el-input__inner, .el-textarea__inner, input[type="text"], input[type="number"], input:not([type]), textarea').forEach(input => {
        if (input.disabled || input.readOnly) return;
        const isTextarea = input.tagName === 'TEXTAREA';
        const proto = isTextarea ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, isTextarea ? '测试数据' : '100');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      console.log('%c✅ 输入框填充完成', 'color: #00ff88; font-weight: bold;');
    },
    selectOptions: () => {
      // 单选框
      const radioGroups = new Set();
      document.querySelectorAll('.el-radio, input[type="radio"]').forEach(r => {
        const g = r.closest('.el-radio-group') || r.name || Math.random();
        if (!radioGroups.has(g) && !r.disabled) { radioGroups.add(g); r.click(); }
      });
      // 多选框
      const checkboxGroups = new Map();
      document.querySelectorAll('.el-checkbox, input[type="checkbox"]').forEach(cb => {
        const g = cb.closest('.el-checkbox-group') || 'default';
        const c = checkboxGroups.get(g) || 0;
        if (c < 2 && !cb.disabled && !cb.classList.contains('is-disabled')) { cb.click(); checkboxGroups.set(g, c + 1); }
      });
      console.log('%c✅ 选项选择完成', 'color: #00ff88; font-weight: bold;');
    },
    selectDropdowns: () => {
      const selects = [...document.querySelectorAll('.el-select:not(.is-disabled)')];
      console.log('%c📋 开始处理下拉菜单，共找到 ' + selects.length + ' 个', 'color: #00ccff; font-weight: bold; font-size: 14px;');

      if (selects.length === 0) return;

      // 方法1: 尝试直接操作 Vue 组件实例
      const tryVueMethod = (selectEl) => {
        try {
          const vueInstance = selectEl.__vueParentComponent || selectEl.__vue__ || 
                             (selectEl._vnode && selectEl._vnode.ctx);
          
          if (vueInstance) {
            const component = vueInstance.ctx || vueInstance.setupState || vueInstance;
            
            if (component.handleOptionSelect) {
              const options = component.options || component.cachedOptions || [];
              if (options.length > 0) {
                component.handleOptionSelect(options[0]);
                return true;
              }
            }
            
            if (component.modelValue !== undefined) {
              const options = component.options || [];
              if (options.length > 0) {
                component['update:modelValue']?.(options[0].value);
                component.handleChange?.(options[0].value);
                return true;
              }
            }
          }
        } catch (e) {}
        return false;
      };

      // 方法2: 直接操作 DOM 和事件（仅点击，不填充）
      const tryDirectMethod = async (selectEl) => {
        return new Promise((resolve) => {
          const input = selectEl.querySelector('input');
          if (!input) {
            resolve(false);
            return;
          }

          try {
            // 先关闭其他下拉菜单
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            
            setTimeout(() => {
              selectEl.scrollIntoView({ behavior: 'instant', block: 'center' });
              
              // 先点击打开下拉菜单
              const wrapper = selectEl.querySelector('.el-select__wrapper') || 
                            selectEl.querySelector('.el-input__wrapper') ||
                            selectEl;
              
              wrapper.click();
              
              // 等待下拉菜单出现后点击选项
              let attempts = 0;
              const checkAndClick = () => {
                attempts++;
                
                const allOptions = document.querySelectorAll('.el-select-dropdown__item:not(.is-disabled):not(.is-selected)');
                if (allOptions.length > 0) {
                  const option = allOptions[0];
                  option.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                  
                  // 只触发点击事件，不设置值
                  ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                    const evt = new MouseEvent(eventType, {
                      bubbles: true,
                      cancelable: true,
                      view: window,
                      detail: 1
                    });
                    option.dispatchEvent(evt);
                  });
                  option.click();
                  
                  resolve(true);
                  return;
                }
                
                if (attempts < 20) {
                  setTimeout(checkAndClick, 100);
                } else {
                  resolve(false);
                }
              };
              
              setTimeout(checkAndClick, 200);
            }, 100);
          } catch (e) {
            resolve(false);
          }
        });
      };

      // 方法3: 强制展开下拉菜单并选择
      const tryForceExpand = async (selectEl) => {
        return new Promise((resolve) => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          
          setTimeout(() => {
            selectEl.scrollIntoView({ behavior: 'instant', block: 'center' });
            
            const input = selectEl.querySelector('input');
            const wrapper = selectEl.querySelector('.el-select__wrapper') || 
                          selectEl.querySelector('.el-input__wrapper') ||
                          selectEl;
            
            if (!input || !wrapper) {
              resolve(false);
              return;
            }

            input.focus();
            wrapper.focus();
            
            const clickEvt = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
              detail: 1
            });
            wrapper.dispatchEvent(clickEvt);
            wrapper.click();
            input.click();

            let attempts = 0;
            const check = () => {
              attempts++;
              
              const dropdowns = document.querySelectorAll('.el-select-dropdown, .el-popper');
              for (const dropdown of dropdowns) {
                const rect = dropdown.getBoundingClientRect();
                const style = window.getComputedStyle(dropdown);
                
                if (rect.width > 0 && rect.height > 0 && 
                    style.display !== 'none' && 
                    style.visibility !== 'hidden') {
                  
                  const option = dropdown.querySelector('.el-select-dropdown__item:not(.is-disabled):not(.is-selected)');
                  if (option) {
                    option.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                    
                    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                      const evt = new MouseEvent(eventType, {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        detail: 1
                      });
                      option.dispatchEvent(evt);
                    });
                    option.click();
                    
                    resolve(true);
                    return;
                  }
                }
              }
              
              if (attempts < 30) {
                setTimeout(check, 100);
              } else {
                resolve(false);
              }
            };
            
            setTimeout(check, 200);
          }, 100);
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
        console.log('%c--- 处理第 ' + (index + 1) + '/' + selects.length + ' 个 ---', 'color: #00ccff;');

        let success = false;
        
        // 方法1: Vue 方法（同步）
        if (!success) {
          success = tryVueMethod(select);
          if (success) {
            console.log('%c  ✓ Vue 方法成功', 'color: #00ff88;');
            await new Promise(resolve => setTimeout(resolve, 200)); // 等待一下确保生效
          }
        }
        
        // 方法2: 直接方法（异步）
        if (!success) {
          success = await tryDirectMethod(select);
          if (success) {
            console.log('%c  ✓ 直接方法成功', 'color: #00ff88;');
            await new Promise(resolve => setTimeout(resolve, 200)); // 等待一下确保生效
          }
        }
        
        // 方法3: 强制展开（异步）
        if (!success) {
          success = await tryForceExpand(select);
          if (success) {
            console.log('%c  ✓ 强制展开成功', 'color: #00ff88;');
            await new Promise(resolve => setTimeout(resolve, 200)); // 等待一下确保生效
          }
        }

        if (success) {
          successCount++;
          console.log('%c  ✓ 成功选择第 ' + (index + 1) + ' 个！', 'color: #00ff88; font-weight: bold;');
        } else {
          console.log('%c  ✗ 所有方法都失败', 'color: #ff4444;');
        }

        index++;
        setTimeout(selectNext, 400);
      }

      selectNext();
    },
    fillAll: () => {
      actions.fillInputs();
      setTimeout(actions.selectOptions, 100);
      setTimeout(actions.selectDropdowns, 200);
      setTimeout(actions.selectDates, 300);
    },
    selectDates: () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      let count = 0;
      
      document.querySelectorAll('.el-date-editor input, input[type="date"]').forEach(input => {
        if (!input.disabled && !input.readOnly) {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(input, dateStr);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          count++;
        }
      });
      
      console.log('%c✅ 日期填充完成: ' + count + ' 个', 'color: #00ff88; font-weight: bold;');
    },
    clickButtons: () => {
      const keywords = ['确定', '确认', '提交', '保存', '下一步', '完成', '开始'];
      let count = 0;
      
      document.querySelectorAll('button, .el-button').forEach(btn => {
        if (btn.disabled || btn.classList.contains('is-disabled')) return;
        const text = btn.textContent.trim();
        if (keywords.some(keyword => text.includes(keyword))) {
          setTimeout(() => btn.click(), count * 500);
          count++;
        }
      });
      
      console.log('%c✅ 按钮点击完成: ' + count + ' 个', 'color: #00ff88; font-weight: bold;');
    }
  };
  actions[action]?.();
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'pinPanel') {
    if (fixedPanel) {
      removeFixedPanel();
    } else {
      createFixedPanel();
    }
    sendResponse({ success: true, pinned: !!fixedPanel });
  }
  return true;
});
