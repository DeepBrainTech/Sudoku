// 聚合用户交互的DOM事件绑定
export const eventHandlersMixin = {
    // 游戏准备就绪时绑定所有DOM事件
    setupEventListeners() {
        // 画布点击处理程序
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 画布的触摸事件支持
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        // 键盘输入处理
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 控制按钮交互
        document.getElementById('startBtn').addEventListener('click', () => this.startSelectedPuzzle());
        document.getElementById('hintBtn').addEventListener('click', () => this.toggleHintMode());
        document.getElementById('pencilBtn').addEventListener('click', () => this.togglePencilMode());
        document.getElementById('eraserBtn').addEventListener('click', () => this.toggleEraserMode());
        document.getElementById('printBtn').addEventListener('click', () => this.printBoard());
        document.getElementById('generateBtn').addEventListener('click', () => this.generateMorePuzzles());
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        
        // 棋盘大小选择单选按钮
        document.querySelectorAll('input[name="boardSize"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.setBoardSize(radio.value);
            });
        });
        
        // 难度单选按钮组
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', () => this.updatePuzzleSelector());
        });
        
        // 谜题下拉菜单变化
        document.getElementById('puzzleSelect').addEventListener('change', () => this.selectPuzzle());
        
        // 说明模态框切换
        document.getElementById('gameInstructionsBtn').addEventListener('click', () => this.showInstructionsModal());
        document.getElementById('closeInstructions').addEventListener('click', () => this.hideInstructionsModal());
        
        // 点击外部关闭模态框
        document.getElementById('instructionsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('instructionsModal')) {
                this.hideInstructionsModal();
            }
        });

        const customThemeBtn = document.getElementById('customThemeBtn');
        if (customThemeBtn) {
            customThemeBtn.addEventListener('click', () => this.openCustomThemeModal());
        }

        const customThemeForm = document.getElementById('customThemeForm');
        if (customThemeForm) {
            customThemeForm.addEventListener('submit', (e) => this.handleCustomThemeSubmit(e));
        }

        const cancelCustomTheme = document.getElementById('cancelCustomTheme');
        if (cancelCustomTheme) {
            cancelCustomTheme.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCustomThemeModal();
            });
        }

        const closeCustomTheme = document.getElementById('closeCustomTheme');
        if (closeCustomTheme) {
            closeCustomTheme.addEventListener('click', () => this.closeCustomThemeModal());
        }

        const customThemeModal = document.getElementById('customThemeModal');
        if (customThemeModal) {
            customThemeModal.addEventListener('click', (e) => {
                if (e.target === customThemeModal) {
                    this.closeCustomThemeModal();
                }
            });
        }

        const uploadThemeBtn = document.getElementById('uploadThemeBtn');
        if (uploadThemeBtn) {
            uploadThemeBtn.addEventListener('click', () => this.openUploadThemeModal());
        }

        const uploadThemeForm = document.getElementById('uploadThemeForm');
        if (uploadThemeForm) {
            uploadThemeForm.addEventListener('submit', (e) => this.handleUploadThemeSubmit(e));
        }

        const closeUploadTheme = document.getElementById('closeUploadTheme');
        if (closeUploadTheme) {
            closeUploadTheme.addEventListener('click', () => this.closeUploadThemeModal());
        }

        const cancelUploadTheme = document.getElementById('cancelUploadTheme');
        if (cancelUploadTheme) {
            cancelUploadTheme.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeUploadThemeModal();
            });
        }

        const resetUploadTheme = document.getElementById('resetUploadTheme');
        if (resetUploadTheme) {
            resetUploadTheme.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetUploadThemeDraft();
            });
        }

        const uploadThemeModal = document.getElementById('uploadThemeModal');
        if (uploadThemeModal) {
            uploadThemeModal.addEventListener('click', (e) => {
                if (e.target === uploadThemeModal) {
                    this.closeUploadThemeModal();
                }
            });
        }

        const showUploadNumbers = document.getElementById('showUploadNumbers');
        if (showUploadNumbers) {
            showUploadNumbers.addEventListener('change', (e) => this.handleToggleUploadNumbers(e.target.checked));
        }
    },

    // 将指针点击/轻触转换为棋盘操作
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否激活了围棋棋盘布局
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        let r, c;
        
        if (isGoBoard) {
            // 围棋棋盘：检测最近的交叉点
            const goSize = 8;
            const goCell = (this.side - 2 * this.margin) / goSize;
            
            if (x < this.margin || x > this.margin + goSize * goCell || 
                y < this.margin || y > this.margin + goSize * goCell) {
                return;
            }
            
            // 将坐标对齐到最近的交叉点
            const gridX = Math.round((x - this.margin) / goCell);
            const gridY = Math.round((y - this.margin) / goCell);
            
            // 确保位置保持在棋盘边界内
            if (gridX < 0 || gridX > goSize || gridY < 0 || gridY > goSize) {
                return;
            }
            
            r = gridY;
            c = gridX;
        } else {
            // 常规网格：将位置映射到格子
            if (x < this.margin || x > this.side - this.margin || 
                y < this.margin || y > this.side - this.margin) {
                return;
            }
            
            r = Math.floor((y - this.margin) / this.cell);
            c = Math.floor((x - this.margin) / this.cell);
        }
        
        if (this.eraserMode) {
            if (this.pencilMarks[r][c].size > 0) {
                this.pencilMarks[r][c].clear();
                this.drawGrid();
            }
            return;
        }
        
            if (this.hintMode) {
                if (this.board[r][c] === 0) {
                    const correct = this.solution[r][c];
                    this.board[r][c] = correct;
                    this.drawGrid();
                    this.flashCell(r, c);
                } else {
                    const message = this.languageManager ? this.languageManager.getText('cellNotEmpty') : "格子不为空！";
                    alert(message);
                }
                return;
            }
        
        // 使用铅笔/提示/橡皮工具时保持选择
        if (this.pencilMode || this.eraserMode || this.hintMode) {
            this.selected = [r, c];
        } else {
            // 不在工具模式时切换选择
            this.selected = (this.selected && this.selected[0] === r && this.selected[1] === c) ? null : [r, c];
        }
        
        // 立即重绘网格以更新高亮
        this.drawGrid();
        
        // 在移动设备上，如果数字键盘隐藏则显示
        if (this.selected && this.isMobileDevice() && !this.numberPadVisible) {
            this.showNumberPad();
        } else if (this.selected && this.isMobileDevice() && this.numberPadVisible) {
            // 当数字键盘已可见时刷新按钮
            this.updateNumberPadButtons();
        }
    },

    // 跟踪桌面交互的悬停状态
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否激活了围棋棋盘布局
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        let r, c;
        
        if (isGoBoard) {
            // 围棋棋盘：检测最近的交叉点
            const goSize = 8;
            const goCell = (this.side - 2 * this.margin) / goSize;
            
            if (x >= this.margin && x <= this.margin + goSize * goCell && 
                y >= this.margin && y <= this.margin + goSize * goCell) {
                const gridX = Math.round((x - this.margin) / goCell);
                const gridY = Math.round((y - this.margin) / goCell);
                
                if (gridX >= 0 && gridX <= goSize && gridY >= 0 && gridY <= goSize) {
                    r = gridY;
                    c = gridX;
                } else {
                    r = -1;
                    c = -1;
                }
            } else {
                r = -1;
                c = -1;
            }
        } else {
            // 常规网格：将位置映射到格子
            r = Math.floor((y - this.margin) / this.cell);
            c = Math.floor((x - this.margin) / this.cell);
        }
        
        this.drawGrid();
        if (r >= 0 && r < this.SIZE && c >= 0 && c < this.SIZE) {
            this.highlightIntersection(r, c);
            // 只有在数字键盘隐藏时才改变选择
            if (!this.numberPadVisible) {
                this.selected = [r, c];
            }
        }
    },

    // 处理数字输入和快捷键的键盘输入
    handleKeyPress(e) {
        // 允许ESC键关闭模态框
        if (e.key === 'Escape') {
            this.hideInstructionsModal();
            return;
        }
        
        if (!this.selected) return;
        
        const [r, c] = this.selected;
        if (this.puzzle && this.puzzle[r][c] !== 0) return;
        
        const key = e.key;
        
        if (this.eraserMode) {
            if (key >= '1' && key <= this.SIZE.toString()) {
                const val = parseInt(key);
                if (this.pencilMarks[r][c].has(val)) {
                    this.pencilMarks[r][c].delete(val);
                    this.drawGrid();
                }
            } else if (key === '0' || key === ' ' || key === 'Backspace' || key === 'Delete') {
                if (this.pencilMarks[r][c].size > 0) {
                    this.pencilMarks[r][c].clear();
                    this.drawGrid();
                }
            }
            return;
        }
        
        if (key >= '1' && key <= this.SIZE.toString()) {
            const val = parseInt(key);
            if (this.pencilMode) {
                this.pencilMarks[r][c].add(val);
                this.drawGrid();
                return;
            }
            
            if (this.solution && val === this.solution[r][c]) {
                let gained = false;
                if (this.board[r][c] !== val) {
                    this.score += 100;
                    gained = true;
                    // 播放成功音效
                    this.playSound('correct');
                    // 显示得分动画
                    const x = this.margin + c * this.cell + this.cell / 2;
                    const y = this.margin + r * this.cell + this.cell / 2;
                    this.showScoreAnimation(100, x, y - 40);
                    // 触发闪光高亮
                    this.flashCell(r, c);
                }
                this.board[r][c] = val;
                this.pencilMarks[r][c].clear();
                // 清除选择以避免持续高亮
                this.selected = null;
                this.drawGrid();
                
                let bonus = false;
                if (this.SIZE === 9) {
                    // 对于9x9棋盘高亮完成的3x3块
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
                    // 对于6x6棋盘高亮完成的2x3块
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
                    // 动画显示奖励得分
                    const x = this.margin + c * this.cell + this.cell / 2;
                    const y = this.margin + r * this.cell + this.cell / 2;
                    this.showScoreAnimation(500, x, y - 60);
                    this.drawGrid();
                } else if (gained) {
                    this.drawGrid();
                }
                
                // 检查谜题完成情况
                this.checkSolution();
            } else {
                const message = this.languageManager ? 
                    `${val} ${this.languageManager.getText('incorrectEntry')}` : 
                    `${val} 不是这个格子的正确答案。`;
                alert(message);
            }
        } else if (key === '0' || key === ' ' || key === 'Backspace' || key === 'Delete') {
            this.board[r][c] = 0;
            this.pencilMarks[r][c].clear();
            this.drawGrid();
        }
    },
};
