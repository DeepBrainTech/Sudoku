export const numberPadMixin = {
    // 小键盘相关方法
    initializeNumberPad() {
        this.updateNumberPad();
        this.setupNumberPadEventListeners();
    },

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    },

    // 区分真正的移动设备（手机/平板）和触屏笔记本
    isTrueMobileDevice() {
        // 首先检查是否是移动设备的 UserAgent
        const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (mobileUA) {
            return true;
        }
        
        // 如果不是移动设备 UserAgent，但支持触摸
        if (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
            // 检查屏幕尺寸，触屏笔记本通常屏幕较大
            // 手机/平板通常屏幕宽度小于 1024px
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const maxDimension = Math.max(screenWidth, screenHeight);
            
            // 如果屏幕最大尺寸小于 1024px，很可能是平板
            if (maxDimension < 1024) {
                return true;
            }
            
            // 检查设备是否支持鼠标指针（通过 matchMedia）
            // 触屏笔记本通常主要输入设备是鼠标（fine pointer）
            // 手机/平板主要输入设备是触摸（coarse pointer）
            const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
            if (hasCoarsePointer) {
                return true; // 粗糙指针（触摸），是移动设备
            }
            
            // 否则很可能是触屏笔记本
            return false;
        }
        
        return false;
    },

    updateNumberPad() {
        const numberPadGrid = document.getElementById('numberPadGrid');
        if (!numberPadGrid) return;

        numberPadGrid.innerHTML = '';

        for (let i = 1; i <= this.SIZE; i++) {
            const button = document.createElement('button');
            button.classList.add('number-btn');
            if (this.customTheme) {
                button.classList.add('number-btn-custom');
            }
            let display = i.toString();
            if (this.customTheme) {
                display = this.getCustomSymbol(i);
            } else if (this.zodiacTheme) {
                const [symbol] = this.getZodiacSymbolAndColor(i);
                display = symbol;
            }
            button.textContent = display;
            button.dataset.number = i.toString();
            if (this.customTheme) {
                button.title = `${i}`;
            } else if (this.zodiacTheme) {
                button.title = `${i} - ${this.getZodiacName(i)}`;
            } else if (button.title) {
                button.removeAttribute('title');
            }
            numberPadGrid.appendChild(button);
        }
    },

    setupNumberPadEventListeners() {
        // 关闭小键盘
        const closeBtn = document.getElementById('closeNumberPad');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideNumberPad());
            closeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.hideNumberPad();
            });
        }
        
        // 拖拽功能
        this.setupNumberPadDrag();
        
        // 数字按钮事件处理 - 防止重复触发
        const handleNumberButtonClick = (e) => {
            if (e.target.classList.contains('number-btn') && !this.isDragging) {
                e.preventDefault();
                const currentTime = Date.now();
                // 防止在300ms内重复触发
                if (currentTime - this.lastTouchTime > 300) {
                    this.lastTouchTime = currentTime;
                    const number = parseInt(e.target.dataset.number);
                    this.handleNumberPadInput(number);
                }
            }
        };
        
        // 触摸事件（移动设备）
        document.addEventListener('touchstart', handleNumberButtonClick);
        
        // 点击事件（桌面设备和触屏笔记本）
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('number-btn') && !this.isDragging) {
                // 只有在真正的移动设备上才阻止点击事件（因为已经有触摸事件处理了）
                // 触屏笔记本需要支持鼠标点击
                if (this.isTrueMobileDevice()) {
                    return;
                }
                handleNumberButtonClick(e);
            }
        });
        
        // 小键盘功能按钮
        const hintBtn = document.getElementById('hintNumberPad');
        const pencilBtn = document.getElementById('pencilNumberPad');
        const eraserBtn = document.getElementById('eraserNumberPad');
        
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.handleNumberPadHint());
            hintBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleNumberPadHint();
            });
        }
        
        if (pencilBtn) {
            pencilBtn.addEventListener('click', () => this.handleNumberPadPencil());
            pencilBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleNumberPadPencil();
            });
        }
        
        if (eraserBtn) {
            eraserBtn.addEventListener('click', () => this.handleNumberPadEraser());
            eraserBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleNumberPadEraser();
            });
        }
        
        // 点击小键盘外部关闭
        const numberPad = document.getElementById('numberPad');
        if (numberPad) {
            numberPad.addEventListener('click', (e) => {
                if (e.target === numberPad) {
                    this.hideNumberPad();
                }
            });
        }
    },

    showNumberPad() {
        if (!this.selected) return;
        
        const numberPad = document.getElementById('numberPad');
        if (numberPad) {
            // 检查是否有保存的位置
            const savedPosition = localStorage.getItem('sudoku-numberpad-position');
            if (savedPosition) {
                const position = JSON.parse(savedPosition);
                numberPad.style.left = position.x + 'px';
                numberPad.style.top = position.y + 'px';
                numberPad.style.transform = 'none';
                // 使用淡入动画，不改变位置
                numberPad.classList.remove('show-centered');
                numberPad.classList.add('show');
            } else {
                // 默认居中显示
                numberPad.style.left = '50%';
                numberPad.style.top = '50%';
                numberPad.style.transform = 'translate(-50%, -50%)';
                // 使用滑入动画
                numberPad.classList.remove('show');
                numberPad.classList.add('show-centered');
            }
            
            this.numberPadVisible = true;
            this.updateNumberPadButtons();
        }
    },

    hideNumberPad() {
        const numberPad = document.getElementById('numberPad');
        if (numberPad) {
            // 保存当前位置
            const rect = numberPad.getBoundingClientRect();
            const position = {
                x: rect.left,
                y: rect.top
            };
            localStorage.setItem('sudoku-numberpad-position', JSON.stringify(position));
            
            numberPad.classList.remove('show');
            numberPad.classList.remove('show-centered');
            this.numberPadVisible = false;
        }
    },

    updateNumberPadButtons() {
        const hintBtn = document.getElementById('hintNumberPad');
        const pencilBtn = document.getElementById('pencilNumberPad');
        const eraserBtn = document.getElementById('eraserNumberPad');
        
        if (hintBtn) {
            hintBtn.classList.toggle('active', this.hintMode);
        }
        if (pencilBtn) {
            pencilBtn.classList.toggle('active', this.pencilMode);
        }
        if (eraserBtn) {
            eraserBtn.classList.toggle('active', this.eraserMode);
        }
    },

    handleNumberPadInput(number) {
        if (!this.selected) return;
        
        const [r, c] = this.selected;
        if (this.puzzle && this.puzzle[r][c] !== 0) return;
        
        if (this.eraserMode) {
            if (this.pencilMarks[r][c].has(number)) {
                this.pencilMarks[r][c].delete(number);
                this.drawGrid();
            }
            return;
        }
        
        if (this.pencilMode) {
            this.pencilMarks[r][c].add(number);
            this.drawGrid();
            return;
        }
        
        // 正常输入模式
        if (this.solution && number === this.solution[r][c]) {
            let gained = false;
            if (this.board[r][c] !== number) {
                this.score += 100;
                gained = true;
                // 播放正确落子音效
                this.playSound('correct');
                // 显示得分动画
                const x = this.margin + c * this.cell + this.cell / 2;
                const y = this.margin + r * this.cell + this.cell / 2;
                this.showScoreAnimation(100, x, y - 40);
                // 闪光效果
                this.flashCell(r, c);
            }
            this.board[r][c] = number;
            this.pencilMarks[r][c].clear();
            // 清除选中状态，避免高亮持续显示
            this.selected = null;
            this.drawGrid();
            
            let bonus = false;
            if (this.SIZE === 9) {
                // 9x9数独：3x3宫格
                const br = Math.floor(r / 3) * 3;
                const bc = Math.floor(c / 3) * 3;
                const block = [];
                for (let rr = br; rr < br + 3; rr++) {
                    for (let cc = bc; cc < bc + 3; cc++) {
                        block.push(this.board[rr][cc]);
                    }
                }
                if (block.every(n => n !== 0)) {
                    bonus = true;
                    this.highlightBlock(br, bc, 3, 3);
                }
            } else if (this.SIZE === 6) {
                // 6x6数独：2x3宫格
                const br = Math.floor(r / 2) * 2;
                const bc = Math.floor(c / 3) * 3;
                const block = [];
                for (let rr = br; rr < br + 2; rr++) {
                    for (let cc = bc; cc < bc + 3; cc++) {
                        block.push(this.board[rr][cc]);
                    }
                }
                if (block.every(n => n !== 0)) {
                    bonus = true;
                    this.highlightBlock(br, bc, 2, 3);
                }
            }
            if (this.board[r].every(n => n !== 0)) {
                bonus = true;
                this.highlightRow(r);
            }
            if (this.board.every(row => row[c] !== 0)) {
                bonus = true;
                this.highlightCol(c);
            }
            if (bonus) {
                this.score += 500;
                // 播放奖励音效
                this.playSound('bonus');
                // 显示奖励得分动画
                const x = this.margin + c * this.cell + this.cell / 2;
                const y = this.margin + r * this.cell + this.cell / 2;
                this.showScoreAnimation(500, x, y - 60);
                this.drawGrid();
            } else if (gained) {
                this.drawGrid();
            }
            
            // 检查是否完成数独
            this.checkSolution();
        } else {
            const message = this.languageManager ? 
                `${number} ${this.languageManager.getText('incorrectEntry')}` : 
                `${number} 不是这个格子的正确答案。`;
            alert(message);
        }
    },

    handleNumberPadHint() {
        this.toggleHintMode();
        this.updateNumberPadButtons();
    },

    handleNumberPadPencil() {
        this.togglePencilMode();
        this.updateNumberPadButtons();
    },

    handleNumberPadEraser() {
        this.toggleEraserMode();
        this.updateNumberPadButtons();
    },

    // 拖拽功能实现
    setupNumberPadDrag() {
        const numberPad = document.getElementById('numberPad');
        const dragHandle = document.getElementById('numberPadDragHandle');
        
        if (!numberPad || !dragHandle) return;
        
        // 鼠标事件
        dragHandle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // 触摸事件
        dragHandle.addEventListener('touchstart', (e) => this.startDrag(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.endDrag());
        
        // 整个头部也可以拖拽
        const header = numberPad.querySelector('.number-pad-header');
        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.target === header) {
                    this.startDrag(e);
                }
            });
            header.addEventListener('touchstart', (e) => {
                if (e.target === header) {
                    this.startDrag(e);
                }
            });
        }
    },

    startDrag(e) {
        if (!this.numberPadVisible) return;
        
        e.preventDefault();
        this.isDragging = true;
        
        const numberPad = document.getElementById('numberPad');
        const rect = numberPad.getBoundingClientRect();
        
        // 计算鼠标/触摸点相对于小键盘的偏移
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        this.dragOffset.x = clientX - rect.left;
        this.dragOffset.y = clientY - rect.top;
        
        numberPad.classList.add('dragging');
    },

    drag(e) {
        if (!this.isDragging || !this.numberPadVisible) return;
        
        e.preventDefault();
        
        const numberPad = document.getElementById('numberPad');
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 计算新位置
        let newX = clientX - this.dragOffset.x;
        let newY = clientY - this.dragOffset.y;
        
        // 边界检查，确保小键盘不会完全移出屏幕
        const rect = numberPad.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        // 应用新位置
        numberPad.style.left = newX + 'px';
        numberPad.style.top = newY + 'px';
        numberPad.style.transform = 'none';
    },

    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const numberPad = document.getElementById('numberPad');
        if (numberPad) {
            numberPad.classList.remove('dragging');
        }
    },
};
