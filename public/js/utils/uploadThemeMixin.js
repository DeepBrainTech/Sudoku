// 上传主题相关逻辑（拖拽、缩放、偏移）
export const uploadThemeMixin = {
    updateUploadThemeButton() {
        const uploadButton = document.getElementById('uploadThemeBtn');
        if (!uploadButton) return;
        uploadButton.style.display = this.uploadTheme ? 'inline-flex' : 'none';
    },

    openUploadThemeModal() {
        if (this.uploadThemeModalVisible) return;
        const modal = document.getElementById('uploadThemeModal');
        if (!modal) return;
        this.uploadThemeDraftImages = this.cloneUploadImageMap(this.uploadedThemeImages);
        this.populateUploadThemeInputs();
        this.clearUploadThemeError();
        this.updateUploadNumbersCheckbox();
        this.refreshUploadPreviews();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.uploadThemeModalVisible = true;
    },

    closeUploadThemeModal() {
        const modal = document.getElementById('uploadThemeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
        this.uploadThemeModalVisible = false;
        this.clearUploadThemeError();
    },

    populateUploadThemeInputs() {
        const container = document.getElementById('uploadThemeInputs');
        if (!container) return;
        container.innerHTML = '';
        const placeholder = this.getUploadPreviewPlaceholder();
        const current = this.uploadThemeDraftImages || {};
        const maxSymbols = this.getUploadThemeRequiredSymbols();
        for (let i = 1; i <= maxSymbols; i++) {
            const item = document.createElement('div');
            item.className = 'upload-theme-item';

            const label = document.createElement('div');
            label.className = 'upload-theme-label';
            label.textContent = i.toString();

            const preview = document.createElement('div');
            preview.className = 'upload-preview';
            preview.dataset.number = i.toString();
            preview.dataset.labelText = i.toString();
            this.applyUploadPreviewStyles(preview, current[i], placeholder, i.toString());
            this.setupUploadPreviewInteraction(preview, i);

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.className = 'upload-input';
            input.dataset.number = i.toString();
            input.addEventListener('change', (event) => this.handleUploadThemeFileChange(event));

            item.appendChild(label);
            item.appendChild(preview);
            item.appendChild(input);
            container.appendChild(item);
        }
    },

    resetUploadThemeDraft() {
        this.uploadThemeDraftImages = this.cloneUploadImageMap(this.uploadedThemeImages);
        this.populateUploadThemeInputs();
        this.clearUploadThemeError();
    },

    clearUploadThemeError() {
        const error = document.getElementById('uploadThemeError');
        if (error) {
            error.textContent = '';
        }
    },

    showUploadThemeError(message) {
        const error = document.getElementById('uploadThemeError');
        if (error) {
            error.textContent = message;
        }
    },

    getUploadPreviewPlaceholder() {
        if (this.languageManager) {
            return this.languageManager.getText('uploadPreviewPlaceholder');
        }
        return '预览';
    },

    applyUploadPreviewStyles(preview, data, placeholder = this.getUploadPreviewPlaceholder(), labelText) {
        if (!preview) return;
        const label = typeof labelText === 'string' && labelText !== '' ? labelText : (preview.dataset.labelText || '');
        if (label) {
            preview.dataset.labelText = label;
        }
        if (data && data.src) {
            const scale = typeof data.scale === 'number' ? data.scale : 1;
            const offsetX = typeof data.offsetX === 'number' ? data.offsetX : 0;
            const offsetY = typeof data.offsetY === 'number' ? data.offsetY : 0;
            preview.style.backgroundImage = `url(${data.src})`;
            preview.style.backgroundSize = `${scale * 100}% ${scale * 100}%`;
            preview.style.backgroundPosition = `${50 - offsetX * 100}% ${50 - offsetY * 100}%`;
            preview.classList.add('has-image');
            preview.classList.remove('drag-over');
            preview.textContent = '';
            preview.style.cursor = 'grab';
        } else {
            preview.style.backgroundImage = '';
            preview.style.backgroundSize = '';
            preview.style.backgroundPosition = '';
            preview.classList.remove('has-image', 'dragging', 'drag-over');
            preview.textContent = placeholder;
            preview.style.cursor = 'pointer';
        }
        if (this.uploadThemeShowNumbers && preview.dataset.labelText && data && data.src) {
            preview.classList.add('show-number-active');
            preview.setAttribute('data-label', preview.dataset.labelText);
        } else {
            preview.classList.remove('show-number-active');
            preview.removeAttribute('data-label');
        }
    },

    setupUploadPreviewInteraction(preview, num) {
        preview.addEventListener('pointerdown', (event) => this.startUploadPreviewDrag(event, num, preview));
        preview.addEventListener('wheel', (event) => this.handleUploadPreviewWheel(event, num, preview), { passive: false });
        preview.addEventListener('dragover', (event) => this.handleUploadDragOver(event, preview));
        preview.addEventListener('dragenter', (event) => this.handleUploadDragOver(event, preview));
        preview.addEventListener('dragleave', (event) => this.handleUploadDragLeave(event, preview));
        preview.addEventListener('drop', (event) => this.handleUploadDrop(event, num, preview));
    },

    startUploadPreviewDrag(event, num, preview) {
        if (event.button !== 0) return;
        const data = this.uploadThemeDraftImages ? this.uploadThemeDraftImages[num] : null;
        if (!data || !data.src) return;
        event.preventDefault();
        if (!this.boundUploadPreviewMove) {
            this.boundUploadPreviewMove = (ev) => this.handleUploadPreviewDragMove(ev);
            this.boundUploadPreviewEnd = (ev) => this.handleUploadPreviewDragEnd(ev);
        }
        preview.setPointerCapture(event.pointerId);
        this.uploadPreviewDragState = {
            pointerId: event.pointerId,
            num,
            preview,
            startX: event.clientX,
            startY: event.clientY,
            initialX: data.offsetX || 0,
            initialY: data.offsetY || 0,
        };
        preview.classList.add('dragging');
        preview.addEventListener('pointermove', this.boundUploadPreviewMove);
        preview.addEventListener('pointerup', this.boundUploadPreviewEnd);
        preview.addEventListener('pointercancel', this.boundUploadPreviewEnd);
    },

    handleUploadPreviewDragMove(event) {
        const state = this.uploadPreviewDragState;
        if (!state || event.pointerId !== state.pointerId) return;
        event.preventDefault();
        const data = this.uploadThemeDraftImages ? this.uploadThemeDraftImages[state.num] : null;
        if (!data) return;
        const size = state.preview.clientWidth || 1;
        const deltaX = (event.clientX - state.startX) / size;
        const deltaY = (event.clientY - state.startY) / size;
        data.offsetX = this.clampUploadOffset(state.initialX + deltaX);
        data.offsetY = this.clampUploadOffset(state.initialY + deltaY);
        this.applyUploadPreviewStyles(state.preview, data, this.getUploadPreviewPlaceholder());
    },

    handleUploadPreviewDragEnd(event) {
        const state = this.uploadPreviewDragState;
        if (!state || event.pointerId !== state.pointerId) return;
        state.preview.classList.remove('dragging');
        state.preview.releasePointerCapture(state.pointerId);
        state.preview.removeEventListener('pointermove', this.boundUploadPreviewMove);
        state.preview.removeEventListener('pointerup', this.boundUploadPreviewEnd);
        state.preview.removeEventListener('pointercancel', this.boundUploadPreviewEnd);
        this.uploadPreviewDragState = null;
    },

    handleUploadPreviewWheel(event, num, preview) {
        const data = this.uploadThemeDraftImages ? this.uploadThemeDraftImages[num] : null;
        if (!data || !data.src) return;
        event.preventDefault();
        const delta = -event.deltaY * 0.0015;
        data.scale = this.clampUploadScale((data.scale || 1) + delta);
        this.applyUploadPreviewStyles(preview, data, this.getUploadPreviewPlaceholder());
    },

    handleUploadDragOver(event, preview) {
        event.preventDefault();
        if (preview) {
            preview.classList.add('drag-over');
        }
    },

    handleUploadDragLeave(event, preview) {
        event.preventDefault();
        if (!preview) return;
        if (!event.relatedTarget || !preview.contains(event.relatedTarget)) {
            preview.classList.remove('drag-over');
        }
    },

    handleUploadDrop(event, num, preview) {
        event.preventDefault();
        if (preview) {
            preview.classList.remove('drag-over');
        }
        const files = event.dataTransfer ? event.dataTransfer.files : null;
        if (files && files.length > 0) {
            this.handleUploadThemeFileFromSource(files[0], num);
        }
    },

    updateUploadPreview(num) {
        const preview = document.querySelector(`.upload-preview[data-number="${num}"]`);
        if (preview) {
            const data = this.uploadThemeDraftImages ? this.uploadThemeDraftImages[num] : null;
            const label = preview.dataset.labelText || num.toString();
            this.applyUploadPreviewStyles(preview, data, this.getUploadPreviewPlaceholder(), label);
        }
    },

    async handleUploadThemeFileChange(event) {
        const input = event.target;
        const num = parseInt(input.dataset.number, 10);
        if (!input.files || input.files.length === 0) {
            return;
        }
        await this.handleUploadThemeFileFromSource(input.files[0], num);
        input.value = '';
    },

    async handleUploadThemeFileFromSource(file, num) {
        if (!file || !file.type.startsWith('image/')) {
            const message = this.languageManager ? this.languageManager.getText('uploadThemeInvalidFile') : '只能上传图片文件。';
            this.showUploadThemeError(message);
            return;
        }
        try {
            const processed = await this.processUploadThemeFile(file);
            if (!this.uploadThemeDraftImages) {
                this.uploadThemeDraftImages = {};
            }
            this.uploadThemeDraftImages[num] = this.createImageState(processed);
            this.updateUploadPreview(num);
            this.clearUploadThemeError();
        } catch (error) {
            console.error('处理上传主题文件失败', error);
            const message = this.languageManager ? this.languageManager.getText('uploadThemeInvalidFile') : '图片处理失败，请换一张试试。';
            this.showUploadThemeError(message);
        }
    },

    processUploadThemeFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const minSide = Math.min(img.width, img.height);
                        const cropX = (img.width - minSide) / 2;
                        const cropY = (img.height - minSide) / 2;
                        const canvas = document.createElement('canvas');
                        const outputSize = 512;
                        canvas.width = outputSize;
                        canvas.height = outputSize;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, cropX, cropY, minSide, minSide, 0, 0, outputSize, outputSize);
                        resolve(canvas.toDataURL('image/png'));
                    } catch (error) {
                        reject(error);
                    }
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    handleUploadThemeSubmit(event) {
        event.preventDefault();
        const temp = this.uploadThemeDraftImages || {};
        const required = this.getUploadThemeRequiredSymbols();
        for (let i = 1; i <= required; i++) {
            if (!temp[i] || !temp[i].src) {
                const message = this.languageManager ? this.languageManager.getText('uploadThemeMissingError') : '请为所有数字上传图片后再保存。';
                this.showUploadThemeError(message);
                return;
            }
        }
        this.uploadedThemeImages = this.cloneUploadImageMap(temp);
        this.saveUploadThemeImages();
        this.uploadThemeDraftImages = this.cloneUploadImageMap(this.uploadedThemeImages);
        this.uploadThemeImageCache = {};
        this.closeUploadThemeModal();
        this.forceUpdateLegend();
        this.updateNumberPad();
        this.drawGrid();
    },

    hasUploadThemeImages() {
        const required = this.getUploadThemeRequiredSymbols();
        const images = this.uploadedThemeImages || {};
        for (let i = 1; i <= required; i++) {
            if (!images[i] || !images[i].src) {
                return false;
            }
        }
        return true;
    },

    getUploadThemeImage(num) {
        if (!this.uploadedThemeImages) return null;
        return this.uploadedThemeImages[num] || null;
    },

    loadUploadThemeImages() {
        try {
            const stored = localStorage.getItem('sudoku-upload-theme');
            if (stored) {
                const parsed = JSON.parse(stored);
                return { images: this.normalizeUploadThemeImages(parsed), stored: true };
            }
        } catch (error) {
            console.warn('读取上传主题失败', error);
        }
        return { images: this.normalizeUploadThemeImages(), stored: false };
    },

    normalizeUploadThemeImages(data) {
        const normalized = {};
        const source = data && typeof data === 'object' ? data : {};
        for (let i = 1; i <= 9; i++) {
            const raw = source[i] ?? source[i.toString()];
            const entry = this.normalizeUploadImageData(raw);
            if (entry) {
                normalized[i] = entry;
            }
        }
        return normalized;
    },

    normalizeUploadImageData(raw) {
        if (!raw) return null;
        if (typeof raw === 'string') {
            if (!raw.startsWith('data:image')) return null;
            return { src: raw, scale: 1, offsetX: 0, offsetY: 0 };
        }
        if (typeof raw === 'object') {
            const src = typeof raw.src === 'string' ? raw.src : null;
            if (!src || !src.startsWith('data:image')) {
                return null;
            }
            return {
                src,
                scale: this.clampUploadScale(typeof raw.scale === 'number' ? raw.scale : 1),
                offsetX: this.clampUploadOffset(typeof raw.offsetX === 'number' ? raw.offsetX : 0),
                offsetY: this.clampUploadOffset(typeof raw.offsetY === 'number' ? raw.offsetY : 0),
            };
        }
        return null;
    },

    cloneUploadImageData(data) {
        const normalized = this.normalizeUploadImageData(data);
        if (!normalized) return null;
        return { ...normalized };
    },

    cloneUploadImageMap(source) {
        const map = {};
        if (!source) return map;
        Object.keys(source).forEach((key) => {
            const entry = this.cloneUploadImageData(source[key]);
            if (entry) {
                map[key] = entry;
            }
        });
        return map;
    },

    createImageState(src) {
        return { src, scale: 1, offsetX: 0, offsetY: 0 };
    },

    saveUploadThemeImages() {
        try {
            localStorage.setItem('sudoku-upload-theme', JSON.stringify(this.uploadedThemeImages || {}));
        } catch (error) {
            console.warn('保存上传主题失败', error);
        }
    },

    getUploadThemeRequiredSymbols() {
        const size = parseInt(this.SIZE, 10);
        if (!Number.isFinite(size) || size <= 0) {
            return 9;
        }
        return Math.min(size, 9);
    },

    clampUploadOffset(value) {
        return Math.max(-0.6, Math.min(0.6, value || 0));
    },

    clampUploadScale(value) {
        return Math.max(0.5, Math.min(3, value || 1));
    },

    loadUploadThemeShowNumbers() {
        try {
            return localStorage.getItem('sudoku-upload-theme-show-numbers') === '1';
        } catch (error) {
            console.warn('读取上传主题配置失败', error);
            return false;
        }
    },

    saveUploadThemeShowNumbers() {
        try {
            localStorage.setItem('sudoku-upload-theme-show-numbers', this.uploadThemeShowNumbers ? '1' : '0');
        } catch (error) {
            console.warn('保存上传主题配置失败', error);
        }
    },

    handleToggleUploadNumbers(enabled) {
        this.setUploadThemeShowNumbers(enabled);
    },

    setUploadThemeShowNumbers(value) {
        const next = !!value;
        if (this.uploadThemeShowNumbers === next) {
            this.updateUploadNumbersCheckbox();
            return;
        }
        this.uploadThemeShowNumbers = next;
        this.saveUploadThemeShowNumbers();
        this.updateUploadNumbersCheckbox();
        this.refreshUploadPreviews();
        this.forceUpdateLegend();
        this.updateNumberPad();
        this.drawGrid();
    },

    updateUploadNumbersCheckbox() {
        const checkbox = document.getElementById('showUploadNumbers');
        if (checkbox) {
            checkbox.checked = !!this.uploadThemeShowNumbers;
        }
    },

    refreshUploadPreviews() {
        const placeholder = this.getUploadPreviewPlaceholder();
        document.querySelectorAll('.upload-preview').forEach((preview) => {
            const number = parseInt(preview.dataset.number, 10);
            if (Number.isNaN(number)) return;
            const data = this.uploadThemeDraftImages && this.uploadThemeDraftImages[number]
                ? this.uploadThemeDraftImages[number]
                : (this.uploadedThemeImages ? this.uploadedThemeImages[number] : null);
            this.applyUploadPreviewStyles(preview, data, placeholder, preview.dataset.labelText || number.toString());
        });
        document.querySelectorAll('.number-btn-upload-preview').forEach((preview) => {
            const number = parseInt(preview.dataset.number, 10);
            if (Number.isNaN(number)) return;
            const data = this.uploadedThemeImages ? this.uploadedThemeImages[number] : null;
            const label = preview.dataset.labelText || number.toString();
            this.applyUploadPreviewStyles(preview, data, label, label);
        });
        document.querySelectorAll('.legend-upload-preview').forEach((preview) => {
            const number = parseInt(preview.dataset.number, 10);
            if (Number.isNaN(number)) return;
            const data = this.uploadedThemeImages ? this.uploadedThemeImages[number] : null;
            const label = preview.dataset.labelText || number.toString();
            this.applyUploadPreviewStyles(preview, data, placeholder, label);
        });
    },
};
