/**
 * ==========================================================================
 * ADVANCED INTERACTIVE PHOTO COLLAGE STUDIO ENGINE
 * Features: Drag, Resize, Rotate, Freeform Design, Emoji Grid, Borders/Frames,
 * Font Picker, Layer Z-Index, Mobile Touch Controls, 100% Client-Side Privacy
 * ==========================================================================
 */

(function () {
  'use strict';

  // ─── 14 TEMPLATES & PRESETS ──────────────────────────────────────────────
  const TEMPLATES = [
    { id: 'freestyle', name: '🎨 Blank Canvas (Freestyle)', icon: '✨', bg: '#ffffff' },
    { id: 'polaroid', name: '📸 Scattered Polaroid', icon: '📷', bg: '#fdfbf7' },
    { id: 'heart', name: '💖 Heart Grid', icon: '❤️', bg: '#fff5f7' },
    { id: 'duo-split', name: '💌 Love Story Split', icon: '💘', bg: '#f43f5e' },
    { id: 'sunset', name: '🌅 Sunset Masonry', icon: '🌆', bg: '#111827' },
    { id: 'filmstrip', name: '🎞️ Vintage Film Strip', icon: '📼', bg: '#09090b' },
    { id: 'circle-cluster', name: '🔮 Circle Cluster', icon: '⭕', bg: '#fce7f3' },
    { id: 'trio', name: '✨ Lover\'s Trio', icon: '💎', bg: '#fafaf9' },
    { id: 'vogue', name: '📖 Vogue Editorial', icon: '📰', bg: '#0f172a' },
    { id: 'golden', name: '📐 Golden Ratio', icon: '🔳', bg: '#1e1b4b' },
    { id: 'diagonal', name: '✂️ Diagonal Split', icon: '📐', bg: '#ffe4e6' },
    { id: 'vinyl', name: '💿 Retro Vinyl', icon: '🎵', bg: '#292524' },
    { id: 'classic-2x2', name: '🖼️ Classic 2x2', icon: '🧱', bg: '#ffffff' },
    { id: 'postcard', name: '📮 Postcard Memory', icon: '✉️', bg: '#fef3c7' }
  ];

  const EMOJIS = ['💘', '💖', '💕', '💌', '🌹', '🧸', '👑', '✨', '🎀', '🥂', '📸', '💍', '💋', '🍓', '🕊️', '🔮', '🧸', '🌟', '🔥', '🌸'];

  // ─── APP STATE ───────────────────────────────────────────────────────────
  const state = {
    layers: [],           // array of layer objects
    selectedId: null,     // id of currently active layer
    nextZIndex: 10,
    bgColor: '#ffffff',
    aspectRatio: '1/1',
    activeTab: 'templates'
  };

  // ─── INIT ────────────────────────────────────────────────────────────────
  function initStudio() {
    renderTemplates();
    renderEmojiGrid();
    bindEvents();
    bindSidebarTabs();

    // Default startup with blank template & sample layers
    loadTemplate(TEMPLATES[0]);
  }

  // ─── TAB NAVIGATION ──────────────────────────────────────────────────────
  function bindSidebarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        state.activeTab = tabId;

        const targetPanel = document.getElementById(`panel-${tabId}`);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  // ─── TEMPLATES RENDER ────────────────────────────────────────────────────
  function renderTemplates() {
    const grid = document.getElementById('collageTemplateGrid');
    if (!grid) return;

    grid.innerHTML = TEMPLATES.map((t, idx) => `
      <div class="template-card ${idx === 0 ? 'active' : ''}" data-id="${t.id}">
        <div class="template-card-icon">${t.icon}</div>
        <div class="template-card-title">${t.name}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const tmpl = TEMPLATES.find(t => t.id === card.dataset.id);
        if (tmpl) loadTemplate(tmpl);
      });
    });
  }

  function loadTemplate(tmpl) {
    state.layers = [];
    state.selectedId = null;
    state.bgColor = tmpl.bg;

    const canvasBox = document.getElementById('collageCanvasBox');
    if (canvasBox) canvasBox.style.background = tmpl.bg;

    // Load preset placeholder elements for specific templates
    if (tmpl.id === 'polaroid') {
      addTextLayer('You feel like home.', 'Dancing Script', '#1e293b', 26, 25, 75);
    } else if (tmpl.id === 'heart') {
      addTextLayer('Forever & Always', 'Great Vibes', '#e11d48', 34, 22, 45);
    } else if (tmpl.id === 'duo-split') {
      addTextLayer('"I LOVE MY LIFE\nBECAUSE IT GAVE ME YOU"', 'Outfit', '#ffffff', 20, 20, 50);
    } else if (tmpl.id === 'vogue') {
      addTextLayer('ROMANCE ISSUE', 'Playfair Display', '#ffffff', 32, 10, 10);
    }

    renderLayers();
  }

  // ─── EMOJI GRID RENDER ───────────────────────────────────────────────────
  function renderEmojiGrid() {
    const grid = document.getElementById('collageEmojiGrid');
    if (!grid) return;

    grid.innerHTML = EMOJIS.map(e => `
      <div class="emoji-item">${e}</div>
    `).join('');

    grid.querySelectorAll('.emoji-item').forEach(item => {
      item.addEventListener('click', () => {
        addEmojiLayer(item.textContent);
      });
    });
  }

  // ─── LAYER CREATORS ──────────────────────────────────────────────────────
  function addPhotoLayer(src) {
    const layer = {
      id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'image',
      src: src,
      x: 20,
      y: 20,
      width: 180,
      height: 180,
      rotation: 0,
      zIndex: ++state.nextZIndex,
      borderStyle: 'none',
      borderWidth: 0,
      borderColor: '#ffffff',
      borderRadius: 8,
      filter: 'none'
    };
    state.layers.push(layer);
    state.selectedId = layer.id;
    renderLayers();
    syncControls();
  }

  function addTextLayer(text = 'Your Romantic Text', font = 'Dancing Script', color = '#e11d48', size = 24, x = 30, y = 40) {
    const layer = {
      id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'text',
      text: text,
      font: font,
      color: color,
      size: size,
      x: x,
      y: y,
      width: 220,
      height: 60,
      rotation: 0,
      zIndex: ++state.nextZIndex
    };
    state.layers.push(layer);
    state.selectedId = layer.id;
    renderLayers();
    syncControls();
  }

  function addEmojiLayer(emoji) {
    const layer = {
      id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'emoji',
      emoji: emoji,
      size: 48,
      x: 40,
      y: 40,
      width: 60,
      height: 60,
      rotation: 0,
      zIndex: ++state.nextZIndex
    };
    state.layers.push(layer);
    state.selectedId = layer.id;
    renderLayers();
  }

  // ─── RENDER LAYERS ON CANVAS ─────────────────────────────────────────────
  function renderLayers() {
    const canvasBox = document.getElementById('collageCanvasBox');
    if (!canvasBox) return;

    canvasBox.innerHTML = '';

    state.layers.forEach(layer => {
      const isSelected = layer.id === state.selectedId;
      const el = document.createElement('div');
      el.className = `canvas-element ${isSelected ? 'selected' : ''}`;
      el.dataset.id = layer.id;
      el.style.left = `${layer.x}%`;
      el.style.top = `${layer.y}%`;
      el.style.width = `${layer.width}px`;
      el.style.height = `${layer.height}px`;
      el.style.transform = `rotate(${layer.rotation}deg)`;
      el.style.zIndex = layer.zIndex;

      // Layer Content Types
      if (layer.type === 'image') {
        const frameClass = getFrameClass(layer.borderStyle);
        if (frameClass) el.classList.add(frameClass);

        el.style.border = layer.borderWidth > 0 ? `${layer.borderWidth}px solid ${layer.borderColor}` : 'none';
        el.style.borderRadius = `${layer.borderRadius}px`;
        el.style.filter = layer.filter !== 'none' ? layer.filter : 'none';

        el.innerHTML = `<img src="${layer.src}" class="element-image" alt="Uploaded Photo">`;
      } else if (layer.type === 'text') {
        el.style.fontFamily = `'${layer.font}', cursive`;
        el.style.color = layer.color;
        el.style.fontSize = `${layer.size}px`;
        el.style.lineHeight = '1.2';
        el.innerText = layer.text;
      } else if (layer.type === 'emoji') {
        el.style.fontSize = `${layer.size}px`;
        el.innerText = layer.emoji;
      }

      // Add Transformation Handles for Selected Layer
      if (isSelected) {
        const controls = document.createElement('div');
        controls.className = 'element-controls';
        controls.innerHTML = `
          <div class="control-handle handle-delete" title="Delete"><i class="fas fa-times"></i></div>
          <div class="control-handle handle-rotate" title="Rotate"><i class="fas fa-redo"></i></div>
          <div class="control-handle handle-resize" title="Resize"><i class="fas fa-expand-alt"></i></div>
        `;
        el.appendChild(controls);
        bindHandleEvents(controls, layer);
      }

      makeDraggable(el, layer);
      canvasBox.appendChild(el);
    });
  }

  function getFrameClass(style) {
    switch (style) {
      case 'polaroid': return 'frame-border-polaroid';
      case 'scalloped': return 'frame-border-scalloped';
      case 'circle': return 'frame-border-circle';
      case 'filmstrip': return 'frame-border-filmstrip';
      case 'gold': return 'frame-border-gold';
      default: return '';
    }
  }

  // ─── INTERACTIVE DRAG, RESIZE, ROTATE HANDLERS ─────────────────────────
  function makeDraggable(el, layer) {
    let isDragging = false;
    let startX, startY, initialPctX, initialPctY;
    const canvasBox = document.getElementById('collageCanvasBox');

    const onStart = (e) => {
      e.stopPropagation();
      state.selectedId = layer.id;
      renderLayers();
      syncControls();

      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;
      initialPctX = layer.x;
      initialPctY = layer.y;
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = canvasBox.getBoundingClientRect();

      const deltaX = ((clientX - startX) / rect.width) * 100;
      const deltaY = ((clientY - startY) / rect.height) * 100;

      layer.x = Math.max(-10, Math.min(95, initialPctX + deltaX));
      layer.y = Math.max(-10, Math.min(95, initialPctY + deltaY));

      el.style.left = `${layer.x}%`;
      el.style.top = `${layer.y}%`;
    };

    const onEnd = () => {
      isDragging = false;
    };

    el.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    el.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  function bindHandleEvents(controls, layer) {
    // Delete handle
    const btnDelete = controls.querySelector('.handle-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        state.layers = state.layers.filter(l => l.id !== layer.id);
        state.selectedId = null;
        renderLayers();
      });
    }

    // Resize handle
    const btnResize = controls.querySelector('.handle-resize');
    if (btnResize) {
      let isResizing = false;
      let startX, startWidth, startHeight;

      const onResizeStart = (e) => {
        e.stopPropagation();
        isResizing = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startWidth = layer.width;
        startHeight = layer.height;
      };

      const onResizeMove = (e) => {
        if (!isResizing) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - startX;

        layer.width = Math.max(40, startWidth + deltaX);
        layer.height = Math.max(40, startHeight + deltaX);

        if (layer.type === 'text' || layer.type === 'emoji') {
          layer.size = Math.max(12, Math.round(layer.width / 4));
        }

        renderLayers();
      };

      const onResizeEnd = () => { isResizing = false; };

      btnResize.addEventListener('mousedown', onResizeStart);
      window.addEventListener('mousemove', onResizeMove);
      window.addEventListener('mouseup', onResizeEnd);

      btnResize.addEventListener('touchstart', onResizeStart, { passive: false });
      window.addEventListener('touchmove', onResizeMove, { passive: false });
      window.addEventListener('touchend', onResizeEnd);
    }

    // Rotate handle
    const btnRotate = controls.querySelector('.handle-rotate');
    if (btnRotate) {
      let isRotating = false;

      const onRotateStart = (e) => {
        e.stopPropagation();
        isRotating = true;
      };

      const onRotateMove = (e) => {
        if (!isRotating) return;
        const canvasBox = document.getElementById('collageCanvasBox');
        const rect = canvasBox.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const centerX = rect.left + (layer.x / 100) * rect.width;
        const centerY = rect.top + (layer.y / 100) * rect.height;

        const radians = Math.atan2(clientY - centerY, clientX - centerX);
        layer.rotation = Math.round(radians * (180 / Math.PI));
        renderLayers();
      };

      const onRotateEnd = () => { isRotating = false; };

      btnRotate.addEventListener('mousedown', onRotateStart);
      window.addEventListener('mousemove', onRotateMove);
      window.addEventListener('mouseup', onRotateEnd);

      btnRotate.addEventListener('touchstart', onRotateStart, { passive: false });
      window.addEventListener('touchmove', onRotateMove, { passive: false });
      window.addEventListener('touchend', onRotateEnd);
    }
  }

  // ─── SYNC CONTROL INPUTS WITH SELECTED LAYER ────────────────────────────
  function syncControls() {
    const layer = state.layers.find(l => l.id === state.selectedId);
    if (!layer) return;

    if (layer.type === 'text') {
      const textInput = document.getElementById('collageTextInput');
      const fontSelect = document.getElementById('collageFontSelect');
      const colorInput = document.getElementById('collageTextColor');
      const sizeSlider = document.getElementById('collageTextSize');

      if (textInput) textInput.value = layer.text;
      if (fontSelect) fontSelect.value = layer.font;
      if (colorInput) colorInput.value = layer.color;
      if (sizeSlider) sizeSlider.value = layer.size;
    } else if (layer.type === 'image') {
      const borderWidth = document.getElementById('collageBorderWidth');
      const borderColor = document.getElementById('collageBorderColor');
      const borderRadius = document.getElementById('collageBorderRadius');
      const frameSelect = document.getElementById('collageFrameSelect');
      const filterSelect = document.getElementById('collageFilterSelect');

      if (borderWidth) borderWidth.value = layer.borderWidth;
      if (borderColor) borderColor.value = layer.borderColor;
      if (borderRadius) borderRadius.value = layer.borderRadius;
      if (frameSelect) frameSelect.value = layer.borderStyle;
      if (filterSelect) filterSelect.value = layer.filter;
    }
  }

  // ─── BIND ALL UI CONTROL EVENTS ──────────────────────────────────────────
  function bindEvents() {
    // Add Photo Button (100% Client-side FileReader)
    const photoFileInput = document.getElementById('collagePhotoInput');
    const btnAddPhoto = document.getElementById('btnAddPhotoBtn');

    if (btnAddPhoto && photoFileInput) {
      btnAddPhoto.addEventListener('click', () => photoFileInput.click());
      photoFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
          if (!file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = (ev) => addPhotoLayer(ev.target.result);
          reader.readAsDataURL(file);
        });
      });
    }

    // Add Text Button
    const btnAddText = document.getElementById('btnAddTextBtn');
    if (btnAddText) {
      btnAddText.addEventListener('click', () => addTextLayer('Click to edit text'));
    }

    // Text Live Inputs
    const textInput = document.getElementById('collageTextInput');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'text') {
          layer.text = e.target.value;
          renderLayers();
        }
      });
    }

    const fontSelect = document.getElementById('collageFontSelect');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'text') {
          layer.font = e.target.value;
          renderLayers();
        }
      });
    }

    const colorInput = document.getElementById('collageTextColor');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'text') {
          layer.color = e.target.value;
          renderLayers();
        }
      });
    }

    const sizeSlider = document.getElementById('collageTextSize');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer) {
          layer.size = parseInt(e.target.value, 10);
          renderLayers();
        }
      });
    }

    // Photo Border & Frame Live Controls
    const borderWidth = document.getElementById('collageBorderWidth');
    if (borderWidth) {
      borderWidth.addEventListener('input', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'image') {
          layer.borderWidth = parseInt(e.target.value, 10);
          renderLayers();
        }
      });
    }

    const borderColor = document.getElementById('collageBorderColor');
    if (borderColor) {
      borderColor.addEventListener('input', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'image') {
          layer.borderColor = e.target.value;
          renderLayers();
        }
      });
    }

    const borderRadius = document.getElementById('collageBorderRadius');
    if (borderRadius) {
      borderRadius.addEventListener('input', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'image') {
          layer.borderRadius = parseInt(e.target.value, 10);
          renderLayers();
        }
      });
    }

    const frameSelect = document.getElementById('collageFrameSelect');
    if (frameSelect) {
      frameSelect.addEventListener('change', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'image') {
          layer.borderStyle = e.target.value;
          renderLayers();
        }
      });
    }

    const filterSelect = document.getElementById('collageFilterSelect');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer && layer.type === 'image') {
          layer.filter = e.target.value;
          renderLayers();
        }
      });
    }

    // Layer Depth Controls (Forward / Backward)
    const btnBringForward = document.getElementById('btnBringForward');
    if (btnBringForward) {
      btnBringForward.addEventListener('click', () => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer) {
          layer.zIndex += 1;
          renderLayers();
        }
      });
    }

    const btnSendBackward = document.getElementById('btnSendBackward');
    if (btnSendBackward) {
      btnSendBackward.addEventListener('click', () => {
        const layer = state.layers.find(l => l.id === state.selectedId);
        if (layer) {
          layer.zIndex = Math.max(1, layer.zIndex - 1);
          renderLayers();
        }
      });
    }

    // Aspect Ratio Buttons
    document.querySelectorAll('.aspect-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.aspectRatio = btn.dataset.aspect;
        const canvasBox = document.getElementById('collageCanvasBox');
        if (canvasBox) canvasBox.style.aspectRatio = btn.dataset.aspect;
      });
    });

    // HD Download Export
    const btnDownload = document.getElementById('btnDownloadCollage');
    if (btnDownload) {
      btnDownload.addEventListener('click', exportCollage);
    }
  }

  // ─── HIGH RES CANVAS EXPORTER ────────────────────────────────────────────
  function exportCollage() {
    const canvasBox = document.getElementById('collageCanvasBox');
    if (!canvasBox) return;

    // Deselect active layer before export so outline/handles don't render on exported image
    const prevSelected = state.selectedId;
    state.selectedId = null;
    renderLayers();

    if (window.html2canvas) {
      window.html2canvas(canvasBox, { scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Love_Collage_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Restore selection
        state.selectedId = prevSelected;
        renderLayers();
      });
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => exportCollage();
      document.head.appendChild(script);
    }
  }

  // Global Controller API
  window.LoveCollageStudio = {
    open: function () {
      const modal = document.getElementById('collageModalBackdrop');
      if (modal) modal.classList.add('active');
    },
    close: function () {
      const modal = document.getElementById('collageModalBackdrop');
      if (modal) modal.classList.remove('active');
    }
  };

  document.addEventListener('DOMContentLoaded', initStudio);
})();
