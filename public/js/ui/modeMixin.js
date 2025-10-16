// 处理铅笔、橡皮和提示模式切换以及光标更新
export const modeMixin = {
    // 将工具状态重置为默认值并重建铅笔标记容器
    resetModes() {
        this.hintMode = false;
        this.pencilMode = false;
        this.eraserMode = false;
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        this.updateButtonStates();
    },

    // 在保持互斥性的同时切换提示模式开/关
    toggleHintMode() {
        this.hintMode = !this.hintMode;
        if (this.hintMode) {
            // 开启提示模式时禁用其他工具
            this.pencilMode = false;
            this.eraserMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    },

    // 在保持互斥性的同时切换铅笔模式开/关
    togglePencilMode() {
        this.pencilMode = !this.pencilMode;
        if (this.pencilMode) {
            // 开启铅笔模式时禁用其他工具
            this.eraserMode = false;
            this.hintMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    },

    // 在保持互斥性的同时切换橡皮模式开/关
    toggleEraserMode() {
        this.eraserMode = !this.eraserMode;
        if (this.eraserMode) {
            // 开启橡皮模式时禁用其他工具
            this.pencilMode = false;
            this.hintMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    },

    // 在工具栏按钮中反映当前模式状态
    updateButtonStates() {
        document.getElementById('hintBtn').classList.toggle('active', this.hintMode);
        document.getElementById('pencilBtn').classList.toggle('active', this.pencilMode);
        document.getElementById('eraserBtn').classList.toggle('active', this.eraserMode);
    },

    // 将画布光标与活动工具对齐
    updateCursor() {
        if (this.hintMode) {
            this.canvas.style.cursor = 'help';
        } else if (this.pencilMode) {
            // 铅笔模式使用文本光标表示标记
            this.canvas.style.cursor = 'text';
        } else if (this.eraserMode) {
            // 橡皮模式显示十字光标表示擦除
            this.canvas.style.cursor = 'crosshair';
        } else {
            // 默认模式使用指针光标
            this.canvas.style.cursor = 'pointer';
        }
    },
};
