// 自定义主题混入 - 处理用户自定义符号主题
export const customThemeMixin = {
    // 更新自定义主题按钮的显示状态
    updateCustomThemeButton() {
        const customButton = document.getElementById('customThemeBtn');
        if (!customButton) return;
        customButton.style.display = this.customTheme ? 'inline-flex' : 'none';
    },

    // 打开自定义主题模态框
    openCustomThemeModal() {
        if (this.customThemeModalVisible) return;
        const modal = document.getElementById('customThemeModal');
        if (!modal) return;
        this.populateCustomThemeInputs();
        this.clearCustomThemeError();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.customThemeModalVisible = true;
        const firstInput = modal.querySelector('input[data-number]');
        if (firstInput) {
            requestAnimationFrame(() => firstInput.focus());
        }
    },

    // 关闭自定义主题模态框
    closeCustomThemeModal() {
        if (!this.customThemeModalVisible) return;
        const modal = document.getElementById('customThemeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
        this.customThemeModalVisible = false;
        this.clearCustomThemeError();
    },

    // 填充自定义主题输入字段
    populateCustomThemeInputs() {
        const container = document.getElementById('customThemeInputs');
        if (!container) return;
        container.innerHTML = '';
        const maxSymbols = 9;
        for (let i = 1; i <= maxSymbols; i++) {
            const row = document.createElement('div');
            row.className = 'custom-theme-row';

            const label = document.createElement('label');
            label.setAttribute('for', `customSymbol${i}`);
            label.textContent = i.toString();

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `customSymbol${i}`;
            input.name = `customSymbol${i}`;
            input.dataset.number = i.toString();
            input.maxLength = 3;
            input.autocomplete = 'off';
            input.value = this.getCustomSymbol(i);
            input.placeholder = i.toString();
            if (i > this.SIZE) {
                input.classList.add('custom-symbol-optional');
            }

            row.appendChild(label);
            row.appendChild(input);
            container.appendChild(row);
        }
    },

    // 清除自定义主题错误信息
    clearCustomThemeError() {
        const error = document.getElementById('customThemeError');
        if (error) {
            error.textContent = '';
        }
        const inputs = document.querySelectorAll('#customThemeInputs input');
        inputs.forEach(input => input.classList.remove('input-error'));
    },

    // 显示自定义主题错误信息
    showCustomThemeError(message, inputs = []) {
        const error = document.getElementById('customThemeError');
        if (error) {
            error.textContent = message;
        }
        inputs.forEach(input => {
            if (input) {
                input.classList.add('input-error');
            }
        });
    },

    // 处理自定义主题表单提交
    handleCustomThemeSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const inputs = Array.from(form.querySelectorAll('input[data-number]'));
        if (inputs.length === 0) {
            this.closeCustomThemeModal();
            return;
        }

        this.clearCustomThemeError();

        const nextSymbols = { ...this.customSymbols };
        const seen = new Map();
        const duplicateInputs = new Set();

        inputs.forEach((input) => {
            const valueNumber = parseInt(input.dataset.number, 10);
            if (Number.isNaN(valueNumber)) {
                return;
            }
            let value = input.value.trim();
            if (value === '') {
                value = valueNumber.toString();
            }
            input.value = value;
            nextSymbols[valueNumber] = value;
            if (valueNumber <= this.SIZE) {
                if (seen.has(value)) {
                    duplicateInputs.add(input);
                    duplicateInputs.add(seen.get(value));
                } else {
                    seen.set(value, input);
                }
            }
        });

        if (duplicateInputs.size > 0) {
            const message = this.languageManager ? this.languageManager.getText('customThemeDuplicateError') : '每个数字的符号必须唯一。';
            this.showCustomThemeError(message, Array.from(duplicateInputs));
            const firstDuplicate = duplicateInputs.values().next().value;
            if (firstDuplicate) {
                firstDuplicate.focus();
            }
            return;
        }

        this.customSymbols = this.normalizeCustomSymbols(nextSymbols);
        this.saveCustomSymbols();
        this.closeCustomThemeModal();
        this.forceUpdateLegend();
        this.updateNumberPad();
        this.drawGrid();
    },

    // 创建默认自定义符号
    createDefaultCustomSymbols() {
        const symbols = {};
        for (let i = 1; i <= 9; i++) {
            symbols[i] = i.toString();
        }
        return symbols;
    },

    // 标准化自定义符号
    normalizeCustomSymbols(symbols) {
        const normalized = {};
        const source = symbols && typeof symbols === 'object' ? symbols : {};
        for (let i = 1; i <= 9; i++) {
            const raw = source[i] ?? source[i.toString()];
            if (typeof raw === 'string' && raw.trim() !== '') {
                normalized[i] = raw.trim();
            } else if (typeof raw === 'number') {
                normalized[i] = raw.toString();
            } else {
                normalized[i] = i.toString();
            }
        }
        return normalized;
    },

    // 从本地存储加载自定义符号
    loadCustomSymbols() {
        try {
            const stored = localStorage.getItem('sudoku-custom-symbols');
            if (stored) {
                const parsed = JSON.parse(stored);
                return { symbols: this.normalizeCustomSymbols(parsed), stored: true };
            }
        } catch (error) {
            console.warn('加载自定义符号失败', error);
        }
        return { symbols: this.createDefaultCustomSymbols(), stored: false };
    },

    // 保存自定义符号到本地存储
    saveCustomSymbols() {
        try {
            localStorage.setItem('sudoku-custom-symbols', JSON.stringify(this.customSymbols));
            this.customSymbolsStored = true;
        } catch (error) {
            console.warn('保存自定义符号失败', error);
        }
    },

    // 获取指定数字的自定义符号
    getCustomSymbol(num) {
        return this.customSymbols[num] || num.toString();
    },
};
