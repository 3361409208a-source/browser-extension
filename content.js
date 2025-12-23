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
      <button class="cyber-btn" data-action="selectDropdowns">📋 选择下拉菜单</button>
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
  
  fixedPanel.querySelectorAll('.cyber-btn').forEach(btn => {
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
      const selects = document.querySelectorAll('.el-select');
      selects.forEach((select, index) => {
        setTimeout(() => {
          const input = select.querySelector('.el-input') || select.querySelector('.el-select__wrapper');
          if (input && !select.classList.contains('is-disabled')) {
            input.click();
            setTimeout(() => {
              const dropdown = document.querySelector('.el-select-dropdown:not([style*="display: none"])') 
                || document.querySelector('.el-popper[aria-hidden="false"]');
              if (dropdown) {
                const firstOption = dropdown.querySelector('.el-select-dropdown__item:not(.is-disabled)');
                if (firstOption) firstOption.click();
              }
            }, 100);
          }
        }, index * 300);
      });
      setTimeout(() => {
        console.log('%c✅ 下拉菜单选择完成', 'color: #00ff88; font-weight: bold;');
      }, selects.length * 300 + 200);
    },
    fillAll: () => {
      actions.fillInputs();
      setTimeout(actions.selectOptions, 100);
      setTimeout(actions.selectDropdowns, 200);
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
