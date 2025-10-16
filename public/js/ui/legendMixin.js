export const legendMixin = {
    getChessSymbolAndColor(num) {
        if (this.SIZE === 6) {
            // 6x6数独的映射关系
            const mapping6x6 = {
                1: ['♖', '#1976d2'],  // Blue rook
                2: ['♘', '#1976d2'],  // Blue knight
                3: ['♗', '#1976d2'],  // Blue bishop
                4: ['♕', '#222'],     // Dark queen
                5: ['♔', '#222'],     // Dark king
                6: ['♙', '#222'],     // Dark pawn
            };
            return mapping6x6[num] || [num.toString(), '#222'];
        } else {
            // 9x9数独的映射关系
            const mapping9x9 = {
                1: ['♖', '#1976d2'],  // Blue rook
                2: ['♘', '#1976d2'],  // Blue knight
                3: ['♗', '#1976d2'],  // Blue bishop
                4: ['♕', '#222'],     // Dark queen
                5: ['♔', '#222'],     // Dark king
                6: ['♝', '#d32f2f'],  // Red bishop
                7: ['♞', '#d32f2f'],  // Red knight
                8: ['♜', '#d32f2f'],  // Red rook
                9: ['♙', '#222'],     // Dark pawn
            };
            return mapping9x9[num] || [num.toString(), '#222'];
        }
    },

    getMahjongSymbolAndColor(num) {
        const mapping = {
            1: ['🀐', '#2e7d32'], // 一条 - 绿色（带红色点缀）
            2: ['🀑', '#2e7d32'], // 二条 - 绿色
            3: ['🀒', '#2e7d32'], // 三条 - 绿色
            4: ['🀓', '#2e7d32'], // 四条 - 绿色
            5: ['🀔', '#2e7d32'], // 五条 - 绿色（中央红色）
            6: ['🀕', '#2e7d32'], // 六条 - 绿色
            7: ['🀖', '#2e7d32'], // 七条 - 绿色（顶部红色）
            8: ['🀗', '#2e7d32'], // 八条 - 绿色
            9: ['🀘', '#2e7d32']  // 九条 - 绿色（中央红色）
        };
        return mapping[num] || [num.toString(), '#222'];
    },

    getZodiacSymbolAndColor(num) {
        const mapping = {
            1: ['🐭', '#ff6b9d'], // 鼠 - 粉色
            2: ['🐄', '#8b4513'], // 牛 - 棕色
            3: ['🐅', '#ff8c00'], // 虎 - 橙色
            4: ['🐇', '#c0c0c0'], // 兔 - 银色
            5: ['🐉', '#00ff00'], // 龙 - 绿色
            6: ['🐍', '#32cd32'], // 蛇 - 绿色
            7: ['🐎', '#8b4513'], // 马 - 棕色
            8: ['🐑', '#ffffff'], // 羊 - 白色
            9: ['🐒', '#ffa500']  // 猴 - 橙色
        };
        return mapping[num] || [num.toString(), '#222'];
    },

    getZodiacName(num) {
        const mapping = {
            1: '鼠',
            2: '牛', 
            3: '虎',
            4: '兔',
            5: '龙',
            6: '蛇',
            7: '马',
            8: '羊',
            9: '猴'
        };
        return mapping[num] || num.toString();
    },

    updateLegend() {
        if (this.languageManager) {
            if (this.chessTheme) {
                this.languageManager.updateChessLegend();
            } else if (this.mahjongTheme) {
                this.updateMahjongLegend();
            } else if (this.zodiacTheme) {
                this.updateZodiacLegend();
            } else if (this.customTheme) {
                this.updateCustomLegend();
            } else {
                // Number主题 - 显示数字1-9
                this.updateNumberLegend();
            }
        } else {
            this.updateGenericLegend();
        }
    },

    updateNumberLegend() {
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
            for (let i = 1; i <= this.SIZE; i++) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                const symbol = i.toString();
                const color = '#222';
                item.innerHTML = `${i} → <span style="color: ${color}"> ${symbol}</span>`;
                legend.appendChild(item);
            }
        }
        
        // 使用通用标题
        this.updateLegendTitle();
    },

    updateGenericLegend() {
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
            for (let i = 1; i <= this.SIZE; i++) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                const labelSpan = document.createElement('span');
                labelSpan.textContent = ` ${i} → `;
                const symbolSpan = document.createElement('span');
                let symbol = i.toString();
                let color = '#222';
                if (this.chessTheme) {
                    [symbol, color] = this.getChessSymbolAndColor(i);
                } else if (this.mahjongTheme) {
                    [symbol, color] = this.getMahjongSymbolAndColor(i);
                } else if (this.zodiacTheme) {
                    [symbol, color] = this.getZodiacSymbolAndColor(i);
                    item.className = 'legend-item zodiac-symbol'; // 添加生肖符号特殊类
                } else if (this.customTheme) {
                    symbol = this.getCustomSymbol(i);
                    color = '#1976d2';
                }
                symbolSpan.style.color = color;
                symbolSpan.textContent = symbol;
                item.appendChild(labelSpan);
                item.appendChild(symbolSpan);
                legend.appendChild(item);
            }
        }
        
        // 更新图例标题为通用标题
        this.updateLegendTitle();
    },

    updateLegendTitle() {
        const legendTitle = document.querySelector('.legend-panel h3');
        if (legendTitle) {
            legendTitle.textContent = this.languageManager ? this.languageManager.getText('symbolReference') : '符号对照';
        }
    },

    updateMahjongLegend() {
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
            for (let i = 1; i <= this.SIZE; i++) {
                const [symbol, color] = this.getMahjongSymbolAndColor(i);
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `${i} → <span style="color: ${color}"> ${symbol}</span>`;
                legend.appendChild(item);
            }
        }
        
        // 使用通用标题
        this.updateLegendTitle();
    },

    updateZodiacLegend() {
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
            for (let i = 1; i <= this.SIZE; i++) {
                const [symbol, color] = this.getZodiacSymbolAndColor(i);
                const item = document.createElement('div');
                item.className = 'legend-item zodiac-symbol'; // 添加生肖符号特殊类
                item.innerHTML = `${i} → <span style="color: ${color}"> ${symbol}</span>`;
                legend.appendChild(item);
            }
        }
        
        // 使用通用标题
        this.updateLegendTitle();
    },

    updateCustomLegend() {
        const legend = document.getElementById('legend');
        if (!legend) return;
        legend.innerHTML = '';
        for (let i = 1; i <= this.SIZE; i++) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            const symbol = this.getCustomSymbol(i);
            const color = '#1976d2';
            item.innerHTML = `${i} → <span style="color: ${color}"> ${symbol}</span>`;
            legend.appendChild(item);
        }
        
        // 使用通用标题
        this.updateLegendTitle();
    },
};
