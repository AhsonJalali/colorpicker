(function() {
  'use strict';
  
  // Remove existing instance if present
  const existing = document.getElementById('my-color-picker-root');
  if (existing) {
    existing.remove();
    return;
  }

  // Create host container
  const host = document.createElement('div');
  host.id = 'my-color-picker-root';
  host.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;';
  document.body.appendChild(host);

  // Create Shadow DOM
  const shadow = host.attachShadow({ mode: 'open' });

  // State
  let colorHistory = [];
  const maxHistory = 5;
  let currentColor = null;
  let hoveredElement = null;

  // Styles
  const styles = `
    <style>
      * {
        box-sizing: border-box;
      }
      
      .loupe {
        position: fixed;
        width: 120px;
        height: 120px;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3);
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(-50%, -50%);
        overflow: hidden;
        background: #fff;
      }
      
      .loupe-inner {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .loupe-color {
        width: 100%;
        height: 70%;
        background: #ccc;
      }
      
      .loupe-hex {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30%;
        background: rgba(0,0,0,0.8);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .highlight {
        outline: 2px solid #4CAF50 !important;
        outline-offset: -2px !important;
      }
      
      .history-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(30, 30, 30, 0.95);
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 2147483647;
        pointer-events: auto;
        min-width: 200px;
        backdrop-filter: blur(10px);
      }
      
      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
      }
      
      .history-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .history-close:hover {
        background: rgba(255,255,255,0.2);
      }
      
      .history-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .history-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .history-item:hover {
        background: rgba(255,255,255,0.1);
      }
      
      .history-swatch {
        width: 30px;
        height: 30px;
        border-radius: 4px;
        border: 2px solid rgba(255,255,255,0.3);
        flex-shrink: 0;
      }
      
      .history-hex {
        color: #fff;
        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        font-size: 12px;
        flex: 1;
      }
      
      .history-clear {
        margin-top: 10px;
        width: 100%;
        padding: 8px;
        background: rgba(255,77,77,0.2);
        border: 1px solid rgba(255,77,77,0.5);
        border-radius: 4px;
        color: #ff4d4d;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .history-clear:hover {
        background: rgba(255,77,77,0.3);
      }
      
      .history-empty {
        color: rgba(255,255,255,0.5);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        text-align: center;
        padding: 10px 0;
      }
    </style>
  `;

  // HTML structure
  const loupeHTML = `
    <div class="loupe" id="loupe">
      <div class="loupe-inner">
        <div class="loupe-color" id="loupe-color"></div>
        <div class="loupe-hex" id="loupe-hex">#000000</div>
      </div>
    </div>
  `;

  const panelHTML = `
    <div class="history-panel" id="history-panel">
      <div class="history-header">
        <span>Color History</span>
        <button class="history-close" id="history-close" title="Close">×</button>
      </div>
      <div class="history-list" id="history-list">
        <div class="history-empty">No colors picked yet</div>
      </div>
      <button class="history-clear" id="history-clear">Clear History</button>
    </div>
  `;

  // Inject into Shadow DOM
  shadow.innerHTML = styles + loupeHTML + panelHTML;

  // Get references
  const loupe = shadow.getElementById('loupe');
  const loupeColor = shadow.getElementById('loupe-color');
  const loupeHex = shadow.getElementById('loupe-hex');
  const historyPanel = shadow.getElementById('history-panel');
  const historyList = shadow.getElementById('history-list');
  const historyClose = shadow.getElementById('history-close');
  const historyClear = shadow.getElementById('history-clear');

  // Get color from element
  function getColorFromElement(element) {
    if (!element) return null;
    
    const style = window.getComputedStyle(element);
    let color = style.backgroundColor || style.color;
    
    // If background is transparent, try to get from parent or use color
    if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
      color = style.color;
    }
    
    // Convert to hex
    if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
      return rgbToHex(color);
    }
    
    return null;
  }

  // Convert RGB/RGBA to HEX
  function rgbToHex(rgb) {
    if (rgb.startsWith('#')) {
      return rgb.toUpperCase();
    }
    
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('').toUpperCase();
    }
    
    // Try named colors
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = rgb;
    const hex = ctx.fillStyle;
    if (hex.startsWith('#')) {
      return hex.toUpperCase();
    }
    
    return '#000000';
  }

  // Update loupe
  function updateLoupe(x, y, color) {
    loupe.style.left = x + 'px';
    loupe.style.top = y + 'px';
    loupeColor.style.background = color;
    loupeHex.textContent = color;
  }

  // Add to history
  function addToHistory(color) {
    if (!color || colorHistory.includes(color)) {
      // Move to front if already exists
      colorHistory = colorHistory.filter(c => c !== color);
    }
    colorHistory.unshift(color);
    if (colorHistory.length > maxHistory) {
      colorHistory.pop();
    }
    renderHistory();
  }

  // Render history
  function renderHistory() {
    if (colorHistory.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No colors picked yet</div>';
      return;
    }
    
    historyList.innerHTML = colorHistory.map(color => `
      <div class="history-item" data-color="${color}">
        <div class="history-swatch" style="background: ${color}"></div>
        <div class="history-hex">${color}</div>
      </div>
    `).join('');
    
    // Add click handlers to history items
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const color = item.dataset.color;
        copyToClipboard(color);
      });
    });
  }

  // Copy to clipboard
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const original = loupeHex.textContent;
        loupeHex.textContent = 'COPIED!';
        setTimeout(() => {
          loupeHex.textContent = original;
        }, 500);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  // Fallback copy method
  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      const original = loupeHex.textContent;
      loupeHex.textContent = 'COPIED!';
      setTimeout(() => {
        loupeHex.textContent = original;
      }, 500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textarea);
  }

  // Remove highlight
  function removeHighlight() {
    if (hoveredElement) {
      hoveredElement.classList.remove('highlight');
      hoveredElement = null;
    }
  }

  // Mouse move handler
  function handleMouseMove(e) {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // Skip if hovering over our own elements
    if (element && (element.id === 'my-color-picker-root' || element.closest('#my-color-picker-root'))) {
      loupe.style.display = 'none';
      removeHighlight();
      return;
    }
    
    loupe.style.display = 'block';
    
    // Remove previous highlight
    removeHighlight();
    
    // Get color from element
    const color = getColorFromElement(element);
    currentColor = color || '#000000';
    
    // Update loupe
    updateLoupe(e.clientX, e.clientY, currentColor);
    
    // Add highlight
    if (element && element !== document.body && element !== document.documentElement) {
      hoveredElement = element;
      element.classList.add('highlight');
    }
  }

  // Click handler
  function handleClick(e) {
    // Don't pick color if clicking on our own UI
    if (e.target.closest('#my-color-picker-root') || e.target.closest('.history-panel')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    if (currentColor) {
      copyToClipboard(currentColor);
      addToHistory(currentColor);
    }
  }

  // Close handler
  function handleClose() {
    host.remove();
  }

  // Clear handler
  function handleClear() {
    colorHistory = [];
    renderHistory();
  }

  // Event listeners
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick, true);
  historyClose.addEventListener('click', handleClose);
  historyClear.addEventListener('click', handleClear);

  // Initial render
  renderHistory();
})();

