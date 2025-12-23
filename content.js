// 赛博朋克风格悬浮按钮
let floatBtn = null;
let panel = null;
let offset = { x: 0, y: 0 };

function createFloatButton() {
  if (floatBtn) return;
  
  // 注入样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cyber-pulse {
      0%, 100% { box-shadow: 0 0 15px rgba(0, 255, 136, 0.5), inset 0 0 15px rgba(0, 255, 136, 0.1); }
      50% { box-shadow: 0 0 25px rgba(0, 255, 136, 0.8), inset 0 0 20px rgba(0, 255, 136, 0.2); }
    }
    @keyframes cyber-scan {
      0% { top: 0; }
      100% { top: calc(100% - 2px); }
    }
    @keyframes glitch {
      0%, 90%, 100% { transform: translate(0); }
      92% { transform: translate(-2px, 1px); }
      94% { transform: translate(2px, -1px); }
      96% { transform: translate(-1px, 2px); }
      98% { transform: translate(1px, -2px); }
    }
  `;
  document.head.appendChild(style);
  
  floatBtn = document.createElement('div');
  floatBtn.id = 'cyber-debug-float';
  floatBtn.innerHTML = `
    <div class="cyber-core">⚡</div>
    <div class="cyber-ring"></div>
    <div class="cyber-ring ring2"></div>
  `;
  floatBtn.style.cssText = `
    position: fixed; left: 20px; top: 200px; z-index: 999999;
    width: 56px; height: 56px;
    cursor: pointer; user-select: none;
  `;
  
  // 核心样式
  const core = floatBtn.querySelector('.cyber-core');
  core.style.cssText = `
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%);
    border: 2px solid #00ff88;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: #00ff88;
    clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
    animation: cyber-pulse 2s infinite;
    text-shadow: 0 0 10px #00ff88;
  `;
  
  // 外环
  floatBtn.querySelectorAll('.cyber-ring').forEach((ring, i) => {
    ring.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(${i * 45}deg);
      width: ${52 + i * 8}px; height: ${52 + i * 8}px;
      border: 1px solid rgba(0, 255, 136, ${0.4 - i * 0.15});
      border-radius: 50%;
      border-top-color: transparent;
      border-bottom-color: transparent;
      animation: spin ${3 + i}s linear infinite ${i % 2 ? 'reverse' : ''};
    `;
  });
  
  // 添加旋转动画
  const spinStyle = document.createElement('style');
  spinStyle.textContent = `@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }`;
  document.head.appendChild(spinStyle);
  
  floatBtn.onmouseenter = () => {
    core.style.background = 'linear-gradient(135deg, #0f1520 0%, #1a2535 100%)';
    core.style.borderColor = '#00ccff';
    core.style.color = '#00ccff';
    core.style.textShadow = '0 0 15px #00ccff';
  };
  
  floatBtn.onmouseleave = () => {
    core.style.background = 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%)';
    core.style.borderColor = '#00ff88';
    core.style.color = '#00ff88';
    core.style.textShadow = '0 0 10px #00ff88';
  };
  
  // 点击打开面板
  core.onclick = (e) => {
    e.stopPropagation();
    togglePanel();
  };
  
  // 拖拽（只在外层div上）
  let startX, startY, moved = false;
  
  floatBtn.onmousedown = (e) => {
    if (e.target === core || core.contains(e.target)) return; // 点击核心不触发拖拽
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
    offset = { x: e.clientX - floatBtn.offsetLeft, y: e.clientY - floatBtn.offsetTop };
    
    const onMove = (e) => {
      moved = true;
      floatBtn.style.left = Math.max(0, e.clientX - offset.x) + 'px';
      floatBtn.style.top = Math.max(0, e.clientY - offset.y) + 'px';
    };
    
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };
  
  document.body.appendChild(floatBtn);
}

function togglePanel() {
  if (panel) {
    panel.style.animation = 'panelOut 0.2s forwards';
    setTimeout(() => { panel?.remove(); panel = null; }, 200);
    return;
  }
  
  const rect = floatBtn.getBoundingClientRect();
  
  panel = document.createElement('div');
  panel.id = 'cyber-debug-panel';
  panel.innerHTML = `
    <div class="scan-line"></div>
    <div class="panel-header">
      <span class="header-text">// 调试控制台</span>
      <span class="close-btn">×</span>
    </div>
    <div class="panel-body">
      <button class="cyber-btn primary" data-action="fillAll"><span class="btn-prefix">⚡</span> 一键填充</button>
      <button class="cyber-btn" data-action="selectOptions"><span class="btn-prefix">&gt;</span> 仅选择选项</button>
    </div>
    <div class="panel-footer">
      <span class="status"><span class="dot"></span>系统激活</span>
    </div>
  `;
  
  panel.style.cssText = `
    position: fixed;
    left: ${rect.right + 12}px;
    top: ${rect.top}px;
    z-index: 999999;
    width: 180px;
    background: linear-gradient(180deg, rgba(10, 14, 23, 0.98) 0%, rgba(15, 20, 30, 0.98) 100%);
    border: 1px solid rgba(0, 255, 136, 0.4);
    font-family: 'Consolas', 'Monaco', monospace;
    overflow: hidden;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    animation: panelIn 0.3s forwards;
    backdrop-filter: blur(10px);
  `;
  
  // 添加动画
  const animStyle = document.createElement('style');
  animStyle.textContent = `
    @keyframes panelIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes panelOut { from { opacity: 1; } to { opacity: 0; transform: translateX(-10px); } }
  `;
  document.head.appendChild(animStyle);
  
  // 扫描线
  const scanLine = panel.querySelector('.scan-line');
  scanLine.style.cssText = `
    position: absolute; top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.8), transparent);
    animation: cyber-scan 2s linear infinite;
    pointer-events: none;
  `;
  
  // 头部
  const header = panel.querySelector('.panel-header');
  header.style.cssText = `
    padding: 10px 12px;
    background: rgba(0, 255, 136, 0.1);
    border-bottom: 1px solid rgba(0, 255, 136, 0.3);
    display: flex; justify-content: space-between; align-items: center;
  `;
  
  panel.querySelector('.header-text').style.cssText = `
    color: #00ff88; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;
    text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
  `;
  
  const closeBtn = panel.querySelector('.close-btn');
  closeBtn.style.cssText = `
    color: #666; font-size: 18px; cursor: pointer; transition: all 0.3s;
    line-height: 1;
  `;
  closeBtn.onmouseenter = () => { closeBtn.style.color = '#ff4444'; closeBtn.style.textShadow = '0 0 5px #ff4444'; };
  closeBtn.onmouseleave = () => { closeBtn.style.color = '#666'; closeBtn.style.textShadow = 'none'; };
  closeBtn.onclick = () => togglePanel();
  
  // 按钮区
  const body = panel.querySelector('.panel-body');
  body.style.cssText = 'padding: 16px;';
  
  panel.querySelectorAll('.cyber-btn').forEach(btn => {
    const isPrimary = btn.classList.contains('primary');
    btn.style.cssText = `
      display: block; width: 100%;
      padding: 12px 16px; margin-bottom: 8px;
      background: ${isPrimary ? 'rgba(0, 204, 255, 0.05)' : 'transparent'};
      border: 1px solid rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.4);
      color: ${isPrimary ? '#00ccff' : '#00ff88'};
      font-family: inherit; font-size: 12px;
      cursor: pointer; text-align: left;
      transition: all 0.3s;
      clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    `;
    
    btn.querySelector('.btn-prefix').style.cssText = `
      color: ${isPrimary ? '#00ccff' : '#00ff88'}; margin-right: 8px; font-size: 14px;
    `;
    
    btn.onmouseenter = () => {
      btn.style.borderColor = isPrimary ? '#00ccff' : '#00ff88';
      btn.style.boxShadow = `0 0 15px rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.3), inset 0 0 15px rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.1)`;
      btn.style.textShadow = `0 0 5px ${isPrimary ? '#00ccff' : '#00ff88'}`;
      btn.style.animation = 'glitch 0.3s';
    };
    
    btn.onmouseleave = () => {
      btn.style.borderColor = `rgba(${isPrimary ? '0, 204, 255' : '0, 255, 136'}, 0.4)`;
      btn.style.boxShadow = 'none';
      btn.style.textShadow = 'none';
      btn.style.animation = 'none';
    };
    
    btn.onclick = () => runAction(btn.dataset.action);
  });
  
  // 底部
  const footer = panel.querySelector('.panel-footer');
  footer.style.cssText = `
    padding: 8px 12px;
    border-top: 1px solid rgba(0, 255, 136, 0.2);
    font-size: 9px; color: #444;
  `;
  
  const dot = panel.querySelector('.dot');
  dot.style.cssText = `
    display: inline-block; width: 6px; height: 6px;
    background: #00ff88; border-radius: 50%; margin-right: 4px;
    animation: cyber-pulse 1s infinite;
  `;
  
  document.body.appendChild(panel);
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
      console.log('%c⚡ 输入框填充完成', 'color: #00ff88; font-weight: bold; text-shadow: 0 0 10px #00ff88;');
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
      
      console.log('%c⚡ 选项选择完成', 'color: #00ff88; font-weight: bold;');
    },
    fillAll: () => {
      actions.fillInputs();
      setTimeout(actions.selectOptions, 100);
    }
  };
  actions[action]?.();
}

// 监听消息
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'toggleFloatBtn') {
    if (msg.show) {
      createFloatButton();
    } else { 
      floatBtn?.remove(); 
      floatBtn = null; 
      panel?.remove(); 
      panel = null; 
    }
    sendResponse({ success: true });
  }
  return true; // 保持消息通道开放
});

// 初始化 - 延迟执行确保页面加载完成
setTimeout(() => {
  chrome.storage.local.get(['showFloatBtn'], (data) => {
    if (data.showFloatBtn !== false) {
      createFloatButton();
      console.log('🔧 调试工具悬浮按钮已加载');
    }
  });
}, 1000);
