class SudokuGame {
    constructor() {
        this.SIZE = 9;
        this.canvas = document.getElementById('sudokuCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.side = 720;
        this.margin = 50;
        this.cell = (this.side - 2 * this.margin) / this.SIZE;
        
        // 游戏状态
        this.board = null;
        this.puzzle = null;
        this.solution = null;
        this.selected = null;
        this.score = 0;
        
        // 小键盘状态
        this.numberPadVisible = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.lastTouchTime = 0;
        
        // 模式状态
        this.hintMode = false;
        this.pencilMode = false;
        this.eraserMode = false;
        this.chessTheme = false; // 默认为数字主题
        this.mahjongTheme = false; // 默认为非麻将主题
        this.zodiacTheme = false; // 默认为非生肖主题
        this.customTheme = false;

        const customData = this.loadCustomSymbols();
        this.customSymbols = customData.symbols;
        this.customSymbolsStored = customData.stored;
        this.customThemeModalVisible = false;
        
        // 铅笔标记
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        
        // 谜题存储
        this.puzzles = { easy: [], normal: [], hard: [] };
        this.currentIndices = { easy: 0, normal: 0, hard: 0 };
        this.numPuzzles = 5;
        
        // 语言管理器
        this.languageManager = null;
        
        // 计时器
        this.gameStartTime = null;
        
        // 音频上下文
        this.audioContext = null;
        this.audioInitialized = false;
        
        this.initializeGame();
    }
    
    setBoardSize(size) {
        this.SIZE = parseInt(size);
        this.cell = (this.side - 2 * this.margin) / this.SIZE;
        
        // 清空当前棋盘和游戏状态
        this.board = null;
        this.puzzle = null;
        this.solution = null;
        this.selected = null;
        this.score = 0;
        this.gameStartTime = null;
        
        // 重新初始化铅笔标记
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        
        // 重新生成谜题
        this.generatePuzzles();
        this.updatePuzzleSelector();
        this.resetModes();
        
        if (this.customThemeModalVisible) {
            this.populateCustomThemeInputs();
        }

        // 强制更新图例，确保iPad上显示正确的映射关系
        this.forceUpdateLegend();
        this.updateNumberPad();
        this.drawGrid();
    }
    
        // 强制更新图例的方法
    forceUpdateLegend() {
        // 清除图例容器
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
        }
        
        // 重新更新图例
        this.updateLegend();
    }
    
    initializeGame() {
        // 初始化语言管理器
        this.languageManager = new LanguageManager();
        
        this.generatePuzzles();
        this.setupEventListeners();
        this.initializeNumberPad();
        this.initializeAudio();
        this.updateLegend();
        this.updateCursor();
        this.drawGrid();
        this.updatePuzzleSelector();
        this.updateCustomThemeButton();
    }
    
    // 初始化音频
    initializeAudio() {
        // 在用户首次交互时初始化音频上下文
        const initAudio = () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.audioInitialized = true;
                } catch (e) {
                    console.log('音频初始化失败:', e);
                }
            }
        };
        
        // 监听用户交互事件来初始化音频
        const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
        const initOnce = () => {
            initAudio();
            events.forEach(event => {
                document.removeEventListener(event, initOnce);
            });
        };
        
        events.forEach(event => {
            document.addEventListener(event, initOnce, { once: true });
        });
    }
    
    // 数独生成算法
    isValid(board, row, col, num) {
        // 检查行和列
        for (let i = 0; i < this.SIZE; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }
        
        // 检查宫格
        if (this.SIZE === 9) {
            // 9x9数独：3x3宫格
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[startRow + i][startCol + j] === num) {
                        return false;
                    }
                }
            }
        } else if (this.SIZE === 6) {
            // 6x6数独：2x3宫格
            const startRow = Math.floor(row / 2) * 2;
            const startCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[startRow + i][startCol + j] === num) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    solve(board) {
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (board[r][c] === 0) {
                    for (let num = 1; num <= this.SIZE; num++) {
                        if (this.isValid(board, r, c, num)) {
                            board[r][c] = num;
                            if (this.solve(board)) {
                                return true;
                            }
                            board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    generateFullBoard() {
        for (let attempt = 0; attempt < 10; attempt++) {
            const board = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill(0));
            const nums = Array.from({length: this.SIZE}, (_, i) => i + 1);
            
            const fill = () => {
                for (let r = 0; r < this.SIZE; r++) {
                    for (let c = 0; c < this.SIZE; c++) {
                        if (board[r][c] === 0) {
                            this.shuffleArray(nums);
                            for (const num of nums) {
                                if (this.isValid(board, r, c, num)) {
                                    board[r][c] = num;
                                    if (fill()) {
                                        return true;
                                    }
                                    board[r][c] = 0;
                                }
                            }
                            return false;
                        }
                    }
                }
                return true;
            };
            
            if (fill()) {
                // 验证生成的棋盘是否正确
                if (this.validateBoard(board)) {
                    return board;
                }
            }
        }
        throw new Error("无法生成有效的数独棋盘");
    }
    
    // 验证数独棋盘是否正确
    validateBoard(board) {
        // 检查行
        for (let r = 0; r < this.SIZE; r++) {
            const rowSet = new Set();
            for (let c = 0; c < this.SIZE; c++) {
                if (board[r][c] !== 0) {
                    if (rowSet.has(board[r][c])) {
                        return false; // 行中有重复数字
                    }
                    rowSet.add(board[r][c]);
                }
            }
        }
        
        // 检查列
        for (let c = 0; c < this.SIZE; c++) {
            const colSet = new Set();
            for (let r = 0; r < this.SIZE; r++) {
                if (board[r][c] !== 0) {
                    if (colSet.has(board[r][c])) {
                        return false; // 列中有重复数字
                    }
                    colSet.add(board[r][c]);
                }
            }
        }
        
        // 检查宫格
        if (this.SIZE === 9) {
            // 9x9数独：3x3宫格
            for (let br = 0; br < 9; br += 3) {
                for (let bc = 0; bc < 9; bc += 3) {
                    const blockSet = new Set();
                    for (let r = br; r < br + 3; r++) {
                        for (let c = bc; c < bc + 3; c++) {
                            if (board[r][c] !== 0) {
                                if (blockSet.has(board[r][c])) {
                                    return false; // 宫格中有重复数字
                                }
                                blockSet.add(board[r][c]);
                            }
                        }
                    }
                }
            }
        } else if (this.SIZE === 6) {
            // 6x6数独：2x3宫格
            for (let br = 0; br < 6; br += 2) {
                for (let bc = 0; bc < 6; bc += 3) {
                    const blockSet = new Set();
                    for (let r = br; r < br + 2; r++) {
                        for (let c = bc; c < bc + 3; c++) {
                            if (board[r][c] !== 0) {
                                if (blockSet.has(board[r][c])) {
                                    return false; // 宫格中有重复数字
                                }
                                blockSet.add(board[r][c]);
                            }
                        }
                    }
                }
            }
        }
        
        return true;
    }
    
    makePuzzle(board, difficulty = "easy") {
        const clues = this.SIZE === 9 ? 
            { easy: 40, normal: 32, hard: 25 } : 
            { easy: 20, normal: 16, hard: 12 };
        const keep = clues[difficulty];
        
        for (let attempt = 0; attempt < 10; attempt++) {
            const puzzle = board.map(row => [...row]);
            const cells = [];
            for (let r = 0; r < this.SIZE; r++) {
                for (let c = 0; c < this.SIZE; c++) {
                    cells.push([r, c]);
                }
            }
            this.shuffleArray(cells);
            
            let toRemove = this.SIZE * this.SIZE - keep;
            for (const [r, c] of cells) {
                if (toRemove <= 0) break;
                
                const backup = puzzle[r][c];
                puzzle[r][c] = 0;
                const boardCopy = puzzle.map(row => [...row]);
                
                if (this.solve(boardCopy)) {
                    toRemove--;
                } else {
                    puzzle[r][c] = backup;
                }
            }
            
            const boardCopy = puzzle.map(row => [...row]);
            if (this.solve(boardCopy)) {
                return puzzle;
            }
        }
        throw new Error("无法生成有效的数独谜题");
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    generatePuzzles() {
        for (const diff of ["easy", "normal", "hard"]) {
            this.puzzles[diff] = [];
            for (let i = 0; i < this.numPuzzles; i++) {
                const full = this.generateFullBoard();
                const puzzle = this.makePuzzle(full, diff);
                this.puzzles[diff].push([puzzle, full]);
            }
        }
    }
    
    generateMorePuzzles() {
        const diff = document.querySelector('input[name="difficulty"]:checked').value;
        const full = this.generateFullBoard();
        const puzzle = this.makePuzzle(full, diff);
        this.puzzles[diff].push([puzzle, full]);
        this.numPuzzles = Math.max(this.numPuzzles, this.puzzles[diff].length);
        this.updatePuzzleSelector();
        this.resetModes();
    }
    
    resetModes() {
        this.hintMode = false;
        this.pencilMode = false;
        this.eraserMode = false;
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        this.updateButtonStates();
    }
    
    setupEventListeners() {
        // 画布点击事件
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 触摸事件支持
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
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startSelectedPuzzle());
        document.getElementById('hintBtn').addEventListener('click', () => this.toggleHintMode());
        document.getElementById('pencilBtn').addEventListener('click', () => this.togglePencilMode());
        document.getElementById('eraserBtn').addEventListener('click', () => this.toggleEraserMode());
        document.getElementById('printBtn').addEventListener('click', () => this.printBoard());
        document.getElementById('generateBtn').addEventListener('click', () => this.generateMorePuzzles());
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        
        // 棋盘大小选择
        document.querySelectorAll('input[name="boardSize"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.setBoardSize(radio.value);
            });
        });
        
        // 难度选择
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', () => this.updatePuzzleSelector());
        });
        
        // 谜题选择
        document.getElementById('puzzleSelect').addEventListener('change', () => this.selectPuzzle());
        
        // 游戏说明弹窗
        document.getElementById('gameInstructionsBtn').addEventListener('click', () => this.showInstructionsModal());
        document.getElementById('closeInstructions').addEventListener('click', () => this.hideInstructionsModal());
        
        // 点击弹窗外部关闭
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
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否是Go board模式
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        let r, c;
        
        if (isGoBoard) {
            // Go board模式：检测交叉点
            const goSize = 8;
            const goCell = (this.side - 2 * this.margin) / goSize;
            
            if (x < this.margin || x > this.margin + goSize * goCell || 
                y < this.margin || y > this.margin + goSize * goCell) {
                return;
            }
            
            // 计算最接近的交叉点
            const gridX = Math.round((x - this.margin) / goCell);
            const gridY = Math.round((y - this.margin) / goCell);
            
            // 检查是否在有效范围内
            if (gridX < 0 || gridX > goSize || gridY < 0 || gridY > goSize) {
                return;
            }
            
            r = gridY;
            c = gridX;
        } else {
            // 普通模式：检测方格
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
        
        // 在工具模式下，点击同一个格子不取消选中，保持高亮
        if (this.pencilMode || this.eraserMode || this.hintMode) {
            this.selected = [r, c];
        } else {
            // 默认模式下，点击同一个格子可以取消选中
            this.selected = (this.selected && this.selected[0] === r && this.selected[1] === c) ? null : [r, c];
        }
        
        // 先绘制棋盘，确保高亮效果显示
        this.drawGrid();
        
        // 在移动设备上显示小键盘（仅当小键盘未显示时）
        if (this.selected && this.isMobileDevice() && !this.numberPadVisible) {
            this.showNumberPad();
        } else if (this.selected && this.isMobileDevice() && this.numberPadVisible) {
            // 如果小键盘已显示，确保它保持显示状态
            this.updateNumberPadButtons();
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否是Go board模式
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        let r, c;
        
        if (isGoBoard) {
            // Go board模式：检测交叉点
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
            // 普通模式：检测方格
            r = Math.floor((y - this.margin) / this.cell);
            c = Math.floor((x - this.margin) / this.cell);
        }
        
        this.drawGrid();
        if (r >= 0 && r < this.SIZE && c >= 0 && c < this.SIZE) {
            this.highlightIntersection(r, c);
            // 只有在没有小键盘显示时才更新selected
            if (!this.numberPadVisible) {
                this.selected = [r, c];
            }
        }
    }
    
    handleKeyPress(e) {
        // ESC键关闭弹窗
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
                    // 播放正确落子音效
                    this.playSound('correct');
                    // 显示得分动画
                    const x = this.margin + c * this.cell + this.cell / 2;
                    const y = this.margin + r * this.cell + this.cell / 2;
                    this.showScoreAnimation(100, x, y - 40);
                    // 闪光效果
                    this.flashCell(r, c);
                }
                this.board[r][c] = val;
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
                    `${val} ${this.languageManager.getText('incorrectEntry')}` : 
                    `${val} 不是这个格子的正确答案。`;
                alert(message);
            }
        } else if (key === '0' || key === ' ' || key === 'Backspace' || key === 'Delete') {
            this.board[r][c] = 0;
            this.pencilMarks[r][c].clear();
            this.drawGrid();
        }
    }
    
    playSound(type = 'correct') {
        // 初始化音频上下文（仅在需要时）
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('音频上下文创建失败:', e);
                return;
            }
        }
        
        // 检查音频上下文状态
        if (this.audioContext.state === 'suspended') {
            // 在iOS上需要用户交互来恢复音频上下文
            this.audioContext.resume().then(() => {
                this.playSoundInternal(type);
            }).catch(e => {
                console.log('音频上下文恢复失败:', e);
            });
            return;
        }
        
        this.playSoundInternal(type);
    }
    
    playSoundInternal(type = 'correct') {
        if (!this.audioContext) return;
        
        if (type === 'correct') {
            // 正确落子音效 - 愉快的音调
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.12);
            
        } else if (type === 'bonus') {
            // 奖励音效 - 音调序列
            const playNote = (frequency, startTime, duration) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, startTime);
                gainNode.gain.setValueAtTime(0.2, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };
            
            const baseTime = this.audioContext.currentTime;
            playNote(800, baseTime, 0.1);
            playNote(1000, baseTime + 0.05, 0.1);
            playNote(1200, baseTime + 0.1, 0.15);
            
        } else if (type === 'victory') {
            // 胜利音效 - 胜利音调序列
            const playNote = (frequency, startTime, duration) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, startTime);
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };
            
            const baseTime = this.audioContext.currentTime;
            const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
            notes.forEach((note, index) => {
                playNote(note, baseTime + index * 0.2, 0.2);
            });
        }
    }
    
    toggleHintMode() {
        this.hintMode = !this.hintMode;
        if (this.hintMode) {
            // 启用提示模式时，关闭其他模式
            this.pencilMode = false;
            this.eraserMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    }
    
    togglePencilMode() {
        this.pencilMode = !this.pencilMode;
        if (this.pencilMode) {
            // 启用铅笔模式时，关闭其他模式
            this.eraserMode = false;
            this.hintMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    }
    
    toggleEraserMode() {
        this.eraserMode = !this.eraserMode;
        if (this.eraserMode) {
            // 启用橡皮模式时，关闭其他模式
            this.pencilMode = false;
            this.hintMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    }
    
    printBoard() {
        if (!this.board) {
            const message = this.languageManager ? 
                this.languageManager.getText('noPuzzleLoaded') || '请先开始一个游戏！' : 
                '请先开始一个游戏！';
            alert(message);
            return;
        }
        
        // 创建打印窗口
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        
        // 构建打印内容
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>数独棋盘打印</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        @media print {
            @page {
                margin: 1.5cm;
                size: A4 portrait;
            }
            html, body {
                width: 100%;
                height: auto;
                overflow: visible;
            }
            body {
                padding: 0 !important;
                margin: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
        body {
            font-family: Arial, sans-serif;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .sudoku-container {
            width: 100%;
            max-width: 550px;
            margin: 0 auto;
        }
        .sudoku-grid {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
            background: white;
        }
        .sudoku-grid td {
            width: ${this.SIZE === 9 ? '11.11%' : '16.66%'};
            height: ${this.SIZE === 9 ? '55px' : '70px'};
            text-align: center;
            vertical-align: middle;
            font-size: ${this.SIZE === 9 ? '22px' : '26px'};
            font-weight: bold;
            border: 1px solid #999;
        }
        .sudoku-grid td.thick-top {
            border-top: 3px solid #000;
        }
        .sudoku-grid td.thick-bottom {
            border-bottom: 3px solid #000;
        }
        .sudoku-grid td.thick-left {
            border-left: 3px solid #000;
        }
        .sudoku-grid td.thick-right {
            border-right: 3px solid #000;
        }
        .sudoku-grid td.fixed {
            background-color: #f0f0f0;
            color: #000;
        }
        .sudoku-grid td.filled {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .sudoku-grid td.empty {
            background-color: white;
        }
        .no-print {
            text-align: center;
            margin-top: 30px;
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
        }
        .no-print button {
            padding: 12px 30px;
            font-size: 16px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 10px;
        }
        .no-print button:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="sudoku-container">
        <table class="sudoku-grid">
`;
        
        // 生成表格内容
        for (let r = 0; r < this.SIZE; r++) {
            htmlContent += '<tr>';
            for (let c = 0; c < this.SIZE; c++) {
                let classes = [];
                
                // 添加粗边框类
                if (this.SIZE === 9) {
                    // 9x9数独：3x3宫格
                    if (r % 3 === 0) classes.push('thick-top');
                    if (r === this.SIZE - 1) classes.push('thick-bottom');
                    if (c % 3 === 0) classes.push('thick-left');
                    if (c === this.SIZE - 1) classes.push('thick-right');
                } else if (this.SIZE === 6) {
                    // 6x6数独：2x3宫格
                    if (r % 2 === 0) classes.push('thick-top');
                    if (r === this.SIZE - 1) classes.push('thick-bottom');
                    if (c % 3 === 0) classes.push('thick-left');
                    if (c === this.SIZE - 1) classes.push('thick-right');
                }
                
                // 添加单元格类型类
                let cellValue = '';
                if (this.puzzle && this.puzzle[r][c] !== 0) {
                    classes.push('fixed');
                    cellValue = this.puzzle[r][c];
                } else if (this.board[r][c] !== 0) {
                    classes.push('filled');
                    cellValue = this.board[r][c];
                } else {
                    classes.push('empty');
                }
                
                htmlContent += `<td class="${classes.join(' ')}">${cellValue}</td>`;
            }
            htmlContent += '</tr>';
        }
        
        htmlContent += `
        </table>
        
        <div class="no-print">
            <button onclick="window.print()">打印</button>
            <button onclick="window.close()">关闭</button>
        </div>
    </div>
</body>
</html>
`;
        
        // 写入打印窗口
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // 等待内容加载完成后自动打开打印对话框
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    }
    
    changeTheme(theme) {
        if (theme === '') return; // 如果选择的是"Theme"占位符，不做任何操作
        this.chessTheme = (theme === 'chess');
        this.mahjongTheme = (theme === 'mahjong');
        this.zodiacTheme = (theme === 'zodiac');
        this.customTheme = (theme === 'custom');

        this.updateCustomThemeButton();

        if (this.customTheme) {
            this.openCustomThemeModal();
        } else {
            this.closeCustomThemeModal();
        }

        this.forceUpdateLegend();
        this.updateNumberPad();
        this.drawGrid();
    }

    updateButtonStates() {
        document.getElementById('hintBtn').classList.toggle('active', this.hintMode);
        document.getElementById('pencilBtn').classList.toggle('active', this.pencilMode);
        document.getElementById('eraserBtn').classList.toggle('active', this.eraserMode);
    }
    
    updateCursor() {
        if (this.hintMode) {
            this.canvas.style.cursor = 'help';
        } else if (this.pencilMode) {
            // 铅笔模式：使用文本光标，表示可以输入/标记
            this.canvas.style.cursor = 'text';
        } else if (this.eraserMode) {
            // 橡皮模式：使用十字光标，表示可以擦除
            this.canvas.style.cursor = 'crosshair';
        } else {
            // 默认模式：使用指针光标
            this.canvas.style.cursor = 'pointer';
        }
    }
    
    updatePuzzleSelector() {
        const diff = document.querySelector('input[name="difficulty"]:checked').value;
        const select = document.getElementById('puzzleSelect');
        select.innerHTML = '';
        
        for (let i = 0; i < this.puzzles[diff].length; i++) {
            const option = document.createElement('option');
            option.value = i;
            const puzzleText = this.languageManager ? this.languageManager.getText('puzzleNumber') : '谜题';
            option.textContent = `${puzzleText} ${i + 1}`;
            select.appendChild(option);
        }
    }
    
    selectPuzzle() {
        // 谜题选择逻辑
    }
    
    startSelectedPuzzle() {
        const diff = document.querySelector('input[name="difficulty"]:checked').value;
        const idx = parseInt(document.getElementById('puzzleSelect').value);
        this.newGame(diff, idx);
    }
    
    newGame(difficulty, index = 0) {
        this.currentIndices[difficulty] = index;
        [this.puzzle, this.solution] = this.puzzles[difficulty][index];
        this.board = this.puzzle.map(row => [...row]);
        this.selected = null;
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        this.gameStartTime = Date.now(); // 记录游戏开始时间
        this.drawGrid();
    }
    
    drawGrid() {
        document.getElementById('score').textContent = this.score;
        
        this.ctx.clearRect(0, 0, this.side, this.side);
        this.ctx.fillStyle = '#f5deb3';
        this.ctx.fillRect(0, 0, this.side, this.side);
        
        const boardEnd = this.margin + this.SIZE * this.cell;
        
        // 根据棋盘大小绘制不同的网格线
        if (this.SIZE === 9) {
            // 检查是否是Go board选项
            const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
            if (goBoardRadio && goBoardRadio.checked) {
                this.draw9x9GoGrid(boardEnd);
            } else {
                this.draw9x9Grid(boardEnd);
            }
        } else if (this.SIZE === 6) {
            this.draw6x6Grid(boardEnd);
        }
        
        // 绘制数字
        if (this.puzzle) {
            for (let r = 0; r < this.SIZE; r++) {
                for (let c = 0; c < this.SIZE; c++) {
                    if (this.puzzle[r][c] !== 0) {
                        this.drawCircle(r, c, this.puzzle[r][c], true);
                    } else if (this.board[r][c] !== 0) {
                        this.drawCircle(r, c, this.board[r][c], false);
                    } else if (this.pencilMarks[r][c].size > 0) {
                        this.drawPencilMarks(r, c);
                    }
                }
            }
        }
        
        // 绘制选中格子的高亮效果
        if (this.selected) {
            this.highlightIntersection(this.selected[0], this.selected[1]);
        }
        
    }
    draw9x9Grid(boardEnd) {
        // 9x9数独：3x3宫格
        const highlightRows = new Set([0, 3, 6, this.SIZE]);  // 行加粗位置
        const highlightCols = new Set([0, 3, 6, this.SIZE]);  // 列加粗位置
        
        for (let i = 0; i <= this.SIZE; i++) {
            const pos = this.margin + i * this.cell;
            
            // 绘制水平线（行）
            const rowLineWidth = highlightRows.has(i) ? 6 : 2;
            const rowLineColor = highlightRows.has(i) ? '#d2691e' : '#8b5c2a';
            
            this.ctx.strokeStyle = rowLineColor;
            this.ctx.lineWidth = rowLineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, pos);
            this.ctx.lineTo(boardEnd, pos);
            this.ctx.stroke();
            
            // 绘制垂直线（列）
            const colLineWidth = highlightCols.has(i) ? 6 : 2;
            const colLineColor = highlightCols.has(i) ? '#d2691e' : '#8b5c2a';
            
            this.ctx.strokeStyle = colLineColor;
            this.ctx.lineWidth = colLineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.margin);
            this.ctx.lineTo(pos, boardEnd);
            this.ctx.stroke();
        }
    }
    
    draw6x6Grid(boardEnd) {
        // 6x6数独：2x3宫格
        const highlightRows = new Set([0, 2, 4, 6, this.SIZE]);  // 行加粗位置
        const highlightCols = new Set([0, 3, 6, this.SIZE]);     // 列加粗位置
        
        for (let i = 0; i <= this.SIZE; i++) {
            const pos = this.margin + i * this.cell;
            
            // 绘制水平线（行）
            const rowLineWidth = highlightRows.has(i) ? 6 : 2;
            const rowLineColor = highlightRows.has(i) ? '#d2691e' : '#8b5c2a';
            
            this.ctx.strokeStyle = rowLineColor;
            this.ctx.lineWidth = rowLineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, pos);
            this.ctx.lineTo(boardEnd, pos);
            this.ctx.stroke();
            
            // 绘制垂直线（列）
            const colLineWidth = highlightCols.has(i) ? 6 : 2;
            const colLineColor = highlightCols.has(i) ? '#d2691e' : '#8b5c2a';
            
            this.ctx.strokeStyle = colLineColor;
            this.ctx.lineWidth = colLineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.margin);
            this.ctx.lineTo(pos, boardEnd);
            this.ctx.stroke();
        }
    }
    
    draw9x9GoGrid(boardEnd) {
        // 9x9数独：Go board样式 - 2x2小方格组加粗
        // 只需要输入2x2方格的左上角坐标，自动加粗整个2x2方格
        const highlightSquares = [
            // 示例：输入2x2方格的左上角坐标
                {row: 0, col: 0},
                {row: 0, col: 3},
                {row: 0, col: 6},
                {row: 3, col: 0},
                {row: 3, col: 3},
                {row: 3, col: 6},
                {row: 6, col: 0},
                {row: 6, col: 3},
                {row: 6, col: 6},

        ];
        
        // 计算8x8棋盘的尺寸
        const goSize = 8;
        const goCell = (this.side - 2 * this.margin) / goSize;
        const goBoardEnd = this.margin + goSize * goCell;
        
        // 先绘制所有普通线条 - 7条线形成8个格子
        for (let i = 1; i < goSize; i++) {
            const pos = this.margin + i * goCell;
            
            // 绘制水平线
            this.ctx.strokeStyle = '#8b5c2a';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, pos);
            this.ctx.lineTo(goBoardEnd, pos);
            this.ctx.stroke();
            
            // 绘制垂直线
            this.ctx.strokeStyle = '#8b5c2a';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.margin);
            this.ctx.lineTo(pos, goBoardEnd);
            this.ctx.stroke();
        }
        
        // 绘制边框线
        this.ctx.strokeStyle = '#8b5c2a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.rect(this.margin, this.margin, goSize * goCell, goSize * goCell);
        this.ctx.stroke();
        
        // 然后为每个2x2方格绘制加粗边框
        highlightSquares.forEach(square => {
            const {row, col} = square;
            
            // 计算2x2方格的像素坐标
            const startX = this.margin + col * goCell;
            const endX = this.margin + (col + 2) * goCell;
            const startY = this.margin + row * goCell;
            const endY = this.margin + (row + 2) * goCell;
            
            // 绘制2x2方格的加粗边框
            this.ctx.strokeStyle = '#d2691e';
            this.ctx.lineWidth = 6;
            
            // 上边
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, startY);
            this.ctx.stroke();
            
            // 下边
            this.ctx.beginPath();
            this.ctx.moveTo(startX, endY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            // 左边
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX, endY);
            this.ctx.stroke();
            
            // 右边
            this.ctx.beginPath();
            this.ctx.moveTo(endX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        });
    }
    
    drawCircle(r, c, num, fixed = false) {
        // 检查是否是Go board模式
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        let x, y, radius;
        
        if (isGoBoard) {
            // Go board模式：绘制在交叉点上
            const goSize = 8;
            const goCell = (this.side - 2 * this.margin) / goSize;
            x = this.margin + c * goCell;
            y = this.margin + r * goCell;
            radius = goCell * 0.4; // 稍微小一点，适合交叉点
        } else {
            // 普通模式：绘制在方格中心
            x = this.margin + c * this.cell + this.cell / 2;
            y = this.margin + r * this.cell + this.cell / 2;
            radius = this.cell * 0.42;
        }
        
        // 如果不是麻将主题，绘制圆圈
        if (!this.mahjongTheme) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = fixed ? '#fffbe6' : '#e0f7fa';
            this.ctx.fill();
            this.ctx.strokeStyle = fixed ? '#333' : '#1976d2';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
        
        // 绘制数字或符号
        if (this.chessTheme) {
            const [symbol, color] = this.getChessSymbolAndColor(num);
            this.ctx.fillStyle = color;
            
            // 检测是否为真正的移动设备（手机/平板），不包括触屏笔记本
            const isTrueMobile = this.isTrueMobileDevice();
            
            // 根据设备类型设置不同的字体
            if (isTrueMobile) {
                // 手机/平板设备：使用Arial字体，但保留回退选项以确保Unicode字符正确显示
                this.ctx.font = `bold ${Math.max(32, this.cell * 0.8)}px "Arial", "Helvetica", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
            } else {
                // 桌面设备/触屏笔记本：使用原有字体设置
                this.ctx.font = `bold ${Math.max(26, this.cell * 0.7)}px Arial`;
            }
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 为不同的象棋符号提供精确的垂直偏移调整
            let offsetY = y;
            if (isTrueMobile) {
                // 手机/平板设备上的调整
                switch(symbol) {
                    case '♖': // 车
                    case '♜':
                        offsetY = y + this.cell * 0.01;
                        break;
                    case '♘': // 马
                    case '♞':
                        offsetY = y - this.cell * 0.01;
                        break;
                    case '♗': // 象
                    case '♝':
                        offsetY = y - this.cell * 0.01;
                        break;
                    case '♕': // 后
                        offsetY = y - this.cell * 0.01;
                        break;
                    case '♔': // 王
                        offsetY = y - this.cell * 0.01;
                        break;
                    case '♙': // 兵
                        offsetY = y + this.cell * 0.01;
                        break;
                    default:
                        offsetY = y;
                }
            } else {
                // 桌面设备/触屏笔记本的调整
                switch(symbol) {
                    case '♖': // 车 - 需要稍微向下偏移
                    case '♜':
                        offsetY = y + this.cell * 0.03;
                        break;
                    case '♘': // 马 - 需要稍微向下偏移
                    case '♞':
                        offsetY = y + this.cell * 0.02;
                        break;
                    case '♗': // 象 - 需要稍微向下偏移
                    case '♝':
                        offsetY = y + this.cell * 0.02;
                        break;
                    case '♕': // 后 - 需要稍微向下偏移
                        offsetY = y + this.cell * 0.02;
                        break;
                    case '♔': // 王 - 需要稍微向下偏移
                        offsetY = y + this.cell * 0.02;
                        break;
                    case '♙': // 兵 - 需要稍微向下偏移
                        offsetY = y + this.cell * 0.03;
                        break;
                    default:
                        offsetY = y + this.cell * 0.02;
                }
            }
            
            this.ctx.fillText(symbol, x, offsetY);
        } else if (this.mahjongTheme) {
            // 绘制麻将符号，直接填充整个格子
            const [symbol, color] = this.getMahjongSymbolAndColor(num);
            this.ctx.fillStyle = color;
            
            // 检测是否为真正的移动设备（手机/平板），不包括触屏笔记本
            const isTrueMobile = this.isTrueMobileDevice();
            
            // 根据设备类型设置不同的字体
            if (isTrueMobile) {
                // 手机/平板设备：使用更大的字体和更好的字体族
                this.ctx.font = `bold ${Math.max(40, this.cell * 1.0)}px "Arial"`;
            } else {
                // 桌面设备/触屏笔记本：使用原有字体设置
                this.ctx.font = `bold ${Math.max(40, this.cell * 1.0)}px Arial`;
            }
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 根据设备类型调整位置
            let offsetY = y;
            if (isTrueMobile) {
                // 手机/平板设备：调整位置以适应字体渲染差异
                offsetY = y + this.cell * -0.15; // 轻微向下调整
            } else {
                // 桌面设备/触屏笔记本：使用原有位置
                offsetY = y + this.cell * 0.08;
            }
            
            this.ctx.fillText(symbol, x, offsetY);
        } else if (this.zodiacTheme) {
            // 绘制生肖符号
            const [symbol, color] = this.getZodiacSymbolAndColor(num);
            this.ctx.fillStyle = color;
            
            // 检测是否为真正的移动设备（手机/平板），不包括触屏笔记本
            const isTrueMobile = this.isTrueMobileDevice();
            
            // 根据设备类型设置不同的字体 - 与数字主题保持一致
            if (isTrueMobile) {
                // 手机/平板设备：使用与数字主题相同的字体大小
                this.ctx.font = `bold ${Math.max(20, this.cell * 0.6)}px "Arial", "Helvetica", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
            } else {
                // 桌面设备/触屏笔记本：使用与数字主题相同的字体大小
                this.ctx.font = `bold ${Math.max(28, this.cell * 0.6)}px Arial`;
            }
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 根据设备类型调整位置 - 与数字主题保持一致
            let offsetY = y + this.cell * 0.01;
            
            this.ctx.fillText(symbol, x, offsetY);
        } else if (this.customTheme) {
            const symbol = this.getCustomSymbol(num);
            const characterCount = Math.max(1, Array.from(symbol).length);
            const fontScale = characterCount === 1 ? 0.5 : characterCount === 2 ? 0.42 : 0.34;
            this.ctx.fillStyle = fixed ? '#222' : '#1976d2';
            this.ctx.font = `bold ${Math.max(20, this.cell * fontScale)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const offsetY = y + this.cell * 0.01;
            this.ctx.fillText(symbol, x, offsetY);
        } else {
            this.ctx.fillStyle = fixed ? '#222' : '#1976d2';
            this.ctx.font = `bold ${Math.max(20, this.cell * (fixed ? 0.45 : 0.4))}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const text = num.toString();
            
            // 为不同数字提供精确的垂直偏移调整
            let offsetY = y;
            switch(num) {
                case 1: // 数字1 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.015;
                    break;
                case 2: // 数字2 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                case 3: // 数字3 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                case 4: // 数字4 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                case 5: // 数字5 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                case 6: // 数字6 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                case 7: // 数字7 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                case 8: // 数字8 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                case 9: // 数字9 - 需要稍微向下偏移
                    offsetY = y + this.cell * 0.01;
                    break;
                default:
                    offsetY = y + this.cell * 0.01;
            }
            
            this.ctx.fillText(text, x, offsetY);
        }
    }
    
    drawPencilMarks(r, c) {
        const x = this.margin + c * this.cell + this.cell / 2;
        const y = this.margin + r * this.cell + this.cell / 2;
        const marks = Array.from(this.pencilMarks[r][c]).sort();
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = `${Math.max(10, this.cell * 0.2)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (this.SIZE === 9) {
            // 9x9数独：3x3网格排列1-9
            const positions = [
                [-1, -1], [0, -1], [1, -1],  // 上排
                [-1, 0], [0, 0], [1, 0],     // 中排
                [-1, 1], [0, 1], [1, 1]      // 下排
            ];
            
            marks.forEach(mark => {
                if (mark >= 1 && mark <= 9) {
                    const pos = positions[mark - 1];
                    const offsetX = x + pos[0] * this.cell * 0.25;
                    const offsetY = y + pos[1] * this.cell * 0.25;
                    this.ctx.fillText(mark.toString(), offsetX, offsetY);
                }
            });
        } else if (this.SIZE === 6) {
            // 6x6数独：3x2网格排列1-6
            const positions = [
                [-1, -1], [0, -1], [1, -1],  // 上排
                [-1, 1], [0, 1], [1, 1]      // 下排
            ];
            
            marks.forEach(mark => {
                if (mark >= 1 && mark <= 6) {
                    const pos = positions[mark - 1];
                    const offsetX = x + pos[0] * this.cell * 0.25;
                    const offsetY = y + pos[1] * this.cell * 0.25;
                    this.ctx.fillText(mark.toString(), offsetX, offsetY);
                }
            });
        } else {
            // 其他尺寸：使用原来的简单排列
            const markStr = marks.join(' ');
            this.ctx.fillText(markStr, x, y + this.cell / 4);
        }
    }
    
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
    }

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
    }

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
    }

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
    }
    
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
    }

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
    }

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
    }

    updateLegendTitle() {
        const legendTitle = document.querySelector('.legend-panel h3');
        if (legendTitle) {
            legendTitle.textContent = this.languageManager ? this.languageManager.getText('symbolReference') : '符号对照';
        }
    }

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
    }

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
    }

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
    }

    updateCustomThemeButton() {
        const customButton = document.getElementById('customThemeBtn');
        if (!customButton) return;
        customButton.style.display = this.customTheme ? 'inline-flex' : 'none';
    }

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
    }

    closeCustomThemeModal() {
        if (!this.customThemeModalVisible) return;
        const modal = document.getElementById('customThemeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
        this.customThemeModalVisible = false;
        this.clearCustomThemeError();
    }

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
    }

    clearCustomThemeError() {
        const error = document.getElementById('customThemeError');
        if (error) {
            error.textContent = '';
        }
        const inputs = document.querySelectorAll('#customThemeInputs input');
        inputs.forEach(input => input.classList.remove('input-error'));
    }

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
    }

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
            const message = this.languageManager ? this.languageManager.getText('customThemeDuplicateError') : 'Symbols must be unique for each number.';
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
    }

    createDefaultCustomSymbols() {
        const symbols = {};
        for (let i = 1; i <= 9; i++) {
            symbols[i] = i.toString();
        }
        return symbols;
    }

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
    }

    loadCustomSymbols() {
        try {
            const stored = localStorage.getItem('sudoku-custom-symbols');
            if (stored) {
                const parsed = JSON.parse(stored);
                return { symbols: this.normalizeCustomSymbols(parsed), stored: true };
            }
        } catch (error) {
            console.warn('Failed to load custom symbols', error);
        }
        return { symbols: this.createDefaultCustomSymbols(), stored: false };
    }

    saveCustomSymbols() {
        try {
            localStorage.setItem('sudoku-custom-symbols', JSON.stringify(this.customSymbols));
            this.customSymbolsStored = true;
        } catch (error) {
            console.warn('Failed to save custom symbols', error);
        }
    }

    getCustomSymbol(num) {
        return this.customSymbols[num] || num.toString();
    }

    showInstructionsModal() {
        const modal = document.getElementById('instructionsModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    hideInstructionsModal() {
        const modal = document.getElementById('instructionsModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢复滚动
    }
    
    highlightIntersection(r, c) {
        // 检查是否是Go board模式
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        if (isGoBoard) {
            // Go board模式：高亮交叉点
            const goSize = 8;
            const goCell = (this.side - 2 * this.margin) / goSize;
            const x = this.margin + c * goCell;
            const y = this.margin + r * goCell;
            const radius = goCell * 0.4; // 交叉点高亮圆圈半径
            
            // 绘制交叉点高亮圆圈
            this.ctx.fillStyle = 'rgba(187, 222, 251, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 绘制交叉点边框
            this.ctx.strokeStyle = '#1976d2';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
            
            // 添加内边框效果
            this.ctx.strokeStyle = 'rgba(25, 118, 210, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius - 2, 0, 2 * Math.PI);
            this.ctx.stroke();
        } else {
            // 普通模式：高亮方格
            const x1 = this.margin + c * this.cell;
            const y1 = this.margin + r * this.cell;
            
            // 绘制半透明背景，不遮挡数字
            this.ctx.fillStyle = 'rgba(187, 222, 251, 0.3)'; // 更透明的蓝色背景
            this.ctx.fillRect(x1 + 2, y1 + 2, this.cell - 4, this.cell - 4);
            
            // 绘制边框高亮
            this.ctx.strokeStyle = '#1976d2';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x1 + 2, y1 + 2, this.cell - 4, this.cell - 4);
            
            // 添加内边框效果，让高亮更明显但不遮挡内容
            this.ctx.strokeStyle = 'rgba(25, 118, 210, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x1 + 4, y1 + 4, this.cell - 8, this.cell - 8);
        }
    }
    
    flashCell(r, c) {
        // 检查是否是Go board模式
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        let centerX, centerY, radius;
        
        if (isGoBoard) {
            // Go board模式：在交叉点闪烁
            const goSize = 8;
            const goCell = (this.side - 2 * this.margin) / goSize;
            centerX = this.margin + c * goCell;
            centerY = this.margin + r * goCell;
            radius = goCell * 0.3;
        } else {
            // 普通模式：在方格中心闪烁
            const x1 = this.margin + c * this.cell;
            const y1 = this.margin + r * this.cell;
            centerX = x1 + this.cell / 2;
            centerY = y1 + this.cell / 2;
            radius = this.cell / 2 - 6;
        }
        
        // 创建多层闪光效果
        // 外层金色光环
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // 内层金色圆圈
        this.ctx.fillStyle = '#fff176';
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 添加金币符号
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('★', centerX, centerY);
        
        // 动画效果 - 闪烁
        let flashStep = 0;
        const flashInterval = setInterval(() => {
            flashStep++;
            if (flashStep >= 3) {
                clearInterval(flashInterval);
                this.drawGrid();
            } else {
                // 重新绘制网格和当前效果
                this.drawGrid();
                // 重新绘制闪光效果
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#fff176';
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#ffd700';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('★', centerX, centerY);
            }
        }, 50);
    }
    
    showScoreAnimation(points, x, y) {
        // 创建得分文本元素
        const scoreText = document.createElement('div');
        scoreText.textContent = `+${points}`;
        scoreText.style.position = 'absolute';
        scoreText.style.left = `${x}px`;
        scoreText.style.top = `${y}px`;
        scoreText.style.color = '#ffd700';
        scoreText.style.fontSize = '18px';
        scoreText.style.fontWeight = 'bold';
        scoreText.style.pointerEvents = 'none';
        scoreText.style.zIndex = '1000';
        scoreText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        
        // 添加到canvas的父容器
        const canvasContainer = this.canvas.parentElement;
        canvasContainer.style.position = 'relative';
        canvasContainer.appendChild(scoreText);
        
        // 动画效果 - 向上移动并淡出
        let step = 0;
        const animateScore = () => {
            step++;
            if (step < 20) {
                // 向上移动
                const newY = y - step * 3;
                // 逐渐变透明
                const alpha = 1.0 - (step / 20.0);
                scoreText.style.top = `${newY}px`;
                scoreText.style.opacity = alpha;
                
                requestAnimationFrame(animateScore);
            } else {
                // 删除元素
                if (scoreText.parentNode) {
                    scoreText.parentNode.removeChild(scoreText);
                }
            }
        };
        
        requestAnimationFrame(animateScore);
    }
    
    highlightBlock(br, bc, blockRows = 3, blockCols = 3) {
        for (let rr = br; rr < br + blockRows; rr++) {
            for (let cc = bc; cc < bc + blockCols; cc++) {
                const x1 = this.margin + cc * this.cell;
                const y1 = this.margin + rr * this.cell;
                
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.lineWidth = 4;
                this.ctx.fillStyle = '#ffe4e1';
                this.ctx.fillRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
                this.ctx.strokeRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
            }
        }
        setTimeout(() => this.drawGrid(), 350);
    }
    
    highlightRow(r) {
        for (let cc = 0; cc < this.SIZE; cc++) {
            const x1 = this.margin + cc * this.cell;
            const y1 = this.margin + r * this.cell;
            
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 4;
            this.ctx.fillStyle = '#ffe4e1';
            this.ctx.fillRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
            this.ctx.strokeRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
        }
        setTimeout(() => this.drawGrid(), 350);
    }
    
    highlightCol(c) {
        for (let rr = 0; rr < this.SIZE; rr++) {
            const x1 = this.margin + c * this.cell;
            const y1 = this.margin + rr * this.cell;
            
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 4;
            this.ctx.fillStyle = '#ffe4e1';
            this.ctx.fillRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
            this.ctx.strokeRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
        }
        setTimeout(() => this.drawGrid(), 350);
    }
    
    checkSolution() {
        // 检查行
        for (let r = 0; r < this.SIZE; r++) {
            const rowSet = new Set(this.board[r]);
            if (rowSet.size < this.SIZE || rowSet.has(0)) {
                return; // 未完成
            }
        }
        
        // 检查列
        for (let c = 0; c < this.SIZE; c++) {
            const colSet = new Set();
            for (let r = 0; r < this.SIZE; r++) {
                colSet.add(this.board[r][c]);
            }
            if (colSet.size < this.SIZE || colSet.has(0)) {
                return; // 未完成
            }
        }
        
        // 检查宫格
        if (this.SIZE === 9) {
            // 9x9数独：3x3宫格
            for (let br = 0; br < this.SIZE; br += 3) {
                for (let bc = 0; bc < this.SIZE; bc += 3) {
                    const blockSet = new Set();
                    for (let r = br; r < br + 3; r++) {
                        for (let c = bc; c < bc + 3; c++) {
                            blockSet.add(this.board[r][c]);
                        }
                    }
                    if (blockSet.size < this.SIZE || blockSet.has(0)) {
                        return; // 未完成
                    }
                }
            }
        } else if (this.SIZE === 6) {
            // 6x6数独：2x3宫格
            for (let br = 0; br < 6; br += 2) {
                for (let bc = 0; bc < 6; bc += 3) {
                    const blockSet = new Set();
                    for (let r = br; r < br + 2; r++) {
                        for (let c = bc; c < bc + 3; c++) {
                            blockSet.add(this.board[r][c]);
                        }
                    }
                    if (blockSet.size < 6 || blockSet.has(0)) {
                        return; // 未完成
                    }
                }
            }
        }
        
        // 数独完成！播放胜利音效
        this.playSound('victory');
        
        // 显示庆祝消息和撒花效果
        this.startConfetti();
        
        setTimeout(() => {
            this.showVictoryMessage();
        }, 1000); // 延迟1秒显示弹窗，让撒花效果先开始
    }
    
    showVictoryMessage() {
        // 计算完成时间
        const completionTime = this.calculateCompletionTime();
        
        // 获取多语言消息
        let message;
        if (this.languageManager) {
            message = this.languageManager.getText('victoryMessage')
                .replace('{time}', completionTime)
                .replace('{score}', this.score);
        } else {
            // 默认英文消息
            message = `Congratulations!
You finished in ⏱ ${completionTime} and scored ${this.score}, beating 99.9% of players worldwide! Your brain just set a new record for brilliance. 🧠✨

Take a snapshot and share your achievement with friends and family!
Post it directly to Instagram, Facebook, X, WhatsApp, or WeChat.`;
        }
        
        alert(message);
    }
    
    calculateCompletionTime() {
        if (!this.gameStartTime) {
            // 如果没有开始时间，使用模拟时间
            const minutes = Math.floor(Math.random() * 10) + 3; // 3-12分钟
            const seconds = Math.floor(Math.random() * 60); // 0-59秒
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // 计算实际完成时间
        const completionTime = Date.now() - this.gameStartTime;
        const minutes = Math.floor(completionTime / 60000);
        const seconds = Math.floor((completionTime % 60000) / 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startConfetti() {
        // 创建撒花容器
        this.confettiContainer = document.createElement('div');
        this.confettiContainer.style.position = 'fixed';
        this.confettiContainer.style.top = '0';
        this.confettiContainer.style.left = '0';
        this.confettiContainer.style.width = '100%';
        this.confettiContainer.style.height = '100%';
        this.confettiContainer.style.pointerEvents = 'none';
        this.confettiContainer.style.zIndex = '9999';
        document.body.appendChild(this.confettiContainer);
        
        // 撒花参数 - 增强版
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff4757', '#2ed573', '#ffa502', '#ff6348', '#ff3838', '#ff9f1a', '#ff6b35', '#f7931e'];
        const totalDuration = 10000; // 10秒总持续时间
        const pieceDuration = 4000; // 每个纸片持续4秒
        const creationInterval = 50; // 每50ms创建一个纸片（更频繁）
        
        // 持续创建彩色纸片 - 增强版
        const confettiInterval = setInterval(() => {
            // 每次创建2-4个纸片，让效果更密集
            const piecesCount = Math.floor(Math.random() * 3) + 2; // 2-4个纸片
            for (let i = 0; i < piecesCount; i++) {
                setTimeout(() => {
                    this.createConfettiPiece(colors, pieceDuration);
                }, i * 20); // 错开创建时间
            }
        }, creationInterval);
        
        // 10秒后停止创建并清理
        setTimeout(() => {
            clearInterval(confettiInterval);
            // 再等3秒让最后的纸片消失
            setTimeout(() => {
                if (this.confettiContainer && this.confettiContainer.parentNode) {
                    this.confettiContainer.parentNode.removeChild(this.confettiContainer);
                }
            }, pieceDuration);
        }, totalDuration);
    }
    
    createConfettiPiece(colors, duration) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 15 + 8; // 8-23px（更大）
        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() - 0.5) * 300; // 更大的水平移动
        const startY = -30; // 从更高的位置开始
        const endY = window.innerHeight + 30;
        const rotation = Math.random() * 360;
        const rotationSpeed = (Math.random() - 0.5) * 1080; // 更快的旋转
        
        // 设置样式
        confetti.style.position = 'absolute';
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.backgroundColor = color;
        confetti.style.left = startX + 'px';
        confetti.style.top = startY + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.opacity = '1';
        confetti.style.boxShadow = `0 0 12px ${color}, 0 0 24px ${color}40, 0 0 36px ${color}20`; // 增强发光效果
        confetti.style.filter = 'brightness(1.2) saturate(1.3)'; // 增强亮度和饱和度
        
        this.confettiContainer.appendChild(confetti);
        
        // 动画
        const animation = confetti.animate([
            {
                transform: `translate(0px, 0px) rotate(${rotation}deg)`,
                opacity: 1
            },
            {
                transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(${rotation + rotationSpeed}deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        // 动画结束后移除元素
        animation.addEventListener('finish', () => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        });
    }
    
    // 小键盘相关方法
    initializeNumberPad() {
        this.updateNumberPad();
        this.setupNumberPadEventListeners();
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
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
    }
    
    handleNumberPadHint() {
        this.toggleHintMode();
        this.updateNumberPadButtons();
    }
    
    handleNumberPadPencil() {
        this.togglePencilMode();
        this.updateNumberPadButtons();
    }
    
    handleNumberPadEraser() {
        this.toggleEraserMode();
        this.updateNumberPadButtons();
    }
    
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
    }
    
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
    }
    
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
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const numberPad = document.getElementById('numberPad');
        if (numberPad) {
            numberPad.classList.remove('dragging');
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 初始化语言管理器
    languageManager = new LanguageManager();
    
    // 初始化游戏
    const game = new SudokuGame();
    
    // 将游戏实例绑定到全局，以便语言管理器可以访问
    window.sudokuGame = game;
});
