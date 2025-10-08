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
        
        // 模式状态
        this.hintMode = false;
        this.pencilMode = false;
        this.eraserMode = false;
        this.chessTheme = false; // 默认为数字主题
        this.mahjongTheme = false; // 默认为非麻将主题
        
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
        
        this.initializeGame();
    }
    
    setBoardSize(size) {
        this.SIZE = parseInt(size);
        this.cell = (this.side - 2 * this.margin) / this.SIZE;
        
        // 重新初始化铅笔标记
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        
        // 重新生成谜题
        this.generatePuzzles();
        this.updatePuzzleSelector();
        this.resetModes();
        this.updateLegend();
        this.drawGrid();
    }
    
    initializeGame() {
        // 初始化语言管理器
        this.languageManager = new LanguageManager();
        
        this.generatePuzzles();
        this.setupEventListeners();
        this.updateLegend();
        this.updateCursor();
        this.drawGrid();
        this.updatePuzzleSelector();
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
                return board;
            }
        }
        throw new Error("无法生成有效的数独棋盘");
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
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startSelectedPuzzle());
        document.getElementById('hintBtn').addEventListener('click', () => this.toggleHintMode());
        document.getElementById('pencilBtn').addEventListener('click', () => this.togglePencilMode());
        document.getElementById('eraserBtn').addEventListener('click', () => this.toggleEraserMode());
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
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x < this.margin || x > this.side - this.margin || 
            y < this.margin || y > this.side - this.margin) {
            return;
        }
        
        const r = Math.floor((y - this.margin) / this.cell);
        const c = Math.floor((x - this.margin) / this.cell);
        
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
        
        this.selected = (this.selected && this.selected[0] === r && this.selected[1] === c) ? null : [r, c];
        this.drawGrid();
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const r = Math.floor((y - this.margin) / this.cell);
        const c = Math.floor((x - this.margin) / this.cell);
        
        this.drawGrid();
        if (r >= 0 && r < this.SIZE && c >= 0 && c < this.SIZE) {
            this.highlightIntersection(r, c);
            this.selected = [r, c];
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
                    this.flashCell(r, c);
                    this.playSound();
                }
                this.board[r][c] = val;
                this.pencilMarks[r][c].clear();
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
    
    playSound() {
        // 简单的音效模拟
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.12);
    }
    
    toggleHintMode() {
        this.hintMode = !this.hintMode;
        this.updateButtonStates();
        this.updateCursor();
    }
    
    togglePencilMode() {
        this.pencilMode = !this.pencilMode;
        if (this.pencilMode) {
            this.eraserMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    }
    
    toggleEraserMode() {
        this.eraserMode = !this.eraserMode;
        if (this.eraserMode) {
            this.pencilMode = false;
        }
        this.updateButtonStates();
        this.updateCursor();
    }
    
    changeTheme(theme) {
        if (theme === '') return; // 如果选择的是"Theme"占位符，不做任何操作
        this.chessTheme = (theme === 'chess');
        this.mahjongTheme = (theme === 'mahjong');
        this.updateLegend();
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
            this.canvas.style.cursor = 'text';
        } else if (this.eraserMode) {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'crosshair';
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
            this.draw9x9Grid(boardEnd);
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
        
        // 绘制得分
        this.ctx.fillStyle = 'red';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`★ ${this.score}`, this.side / 2, this.side - 10);
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
    
    drawCircle(r, c, num, fixed = false) {
        const x = this.margin + c * this.cell + this.cell / 2;
        const y = this.margin + r * this.cell + this.cell / 2;
        const radius = this.cell * 0.42;
        
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
            this.ctx.font = `bold ${Math.max(26, this.cell * 0.7)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 为不同的象棋符号提供精确的垂直偏移调整
            let offsetY = y;
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
            
            this.ctx.fillText(symbol, x, offsetY);
        } else if (this.mahjongTheme) {
            // 绘制麻将符号，直接填充整个格子
            const [symbol, color] = this.getMahjongSymbolAndColor(num);
            this.ctx.fillStyle = color;
            this.ctx.font = `bold ${Math.max(40, this.cell * 1.0)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            // 稍微向下调整位置
            this.ctx.fillText(symbol, x, y + this.cell * 0.08);
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
        const markStr = marks.join(' ');
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = `${Math.max(12, this.cell * 0.25)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(markStr, x, y + this.cell / 4);
    }
    
    getChessSymbolAndColor(num) {
        const mapping = {
            1: ['♖', '#1976d2'],  // 蓝车
            2: ['♘', '#1976d2'],  // 蓝马
            3: ['♗', '#1976d2'],  // 蓝象
            4: ['♕', '#222'],     // 黑后
            5: ['♔', '#222'],     // 黑王
            6: ['♙', '#222'],     // 黑兵
            7: ['♞', '#d32f2f'],  // 红马
            8: ['♜', '#d32f2f'],  // 红车
            9: ['♝', '#d32f2f'],  // 红象
        };
        return mapping[num] || [num.toString(), '#222'];
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
    
    updateLegend() {
        // 如果语言管理器存在，使用其方法更新图例
        if (this.languageManager) {
            if (this.chessTheme) {
                this.languageManager.updateChessLegend();
            } else if (this.mahjongTheme) {
                this.updateMahjongLegend();
            } else {
                this.languageManager.updateChessLegend(); // 默认使用数字
            }
        } else {
            // 备用方法
            const legend = document.getElementById('legend');
            if (legend) {
                legend.innerHTML = '';
                for (let i = 1; i <= this.SIZE; i++) {
                    let symbol, color;
                    if (this.chessTheme) {
                        [symbol, color] = this.getChessSymbolAndColor(i);
                    } else if (this.mahjongTheme) {
                        [symbol, color] = this.getMahjongSymbolAndColor(i);
                    } else {
                        symbol = i.toString();
                        color = '#222';
                    }
                    const item = document.createElement('div');
                    item.className = 'legend-item';
                    item.innerHTML = `${i} → <span style="color: ${color}">${symbol}</span>`;
                    legend.appendChild(item);
                }
            }
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
                item.innerHTML = `${i} → <span style="color: ${color}">${symbol}</span>`;
                legend.appendChild(item);
            }
        }
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
        const x1 = this.margin + c * this.cell;
        const y1 = this.margin + r * this.cell;
        const x2 = x1 + this.cell;
        const y2 = y1 + this.cell;
        
        this.ctx.strokeStyle = '#1976d2';
        this.ctx.lineWidth = 4;
        this.ctx.fillStyle = '#bbdefb';
        this.ctx.fillRect(x1 + 2, y1 + 2, this.cell - 4, this.cell - 4);
        this.ctx.strokeRect(x1 + 2, y1 + 2, this.cell - 4, this.cell - 4);
    }
    
    flashCell(r, c) {
        const x1 = this.margin + c * this.cell;
        const y1 = this.margin + r * this.cell;
        
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 4;
        this.ctx.fillStyle = '#fff176';
        this.ctx.fillRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
        this.ctx.strokeRect(x1 + 3, y1 + 3, this.cell - 6, this.cell - 6);
        
        setTimeout(() => this.drawGrid(), 150);
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
            for (let br = 0; br < this.SIZE; br += 2) {
                for (let bc = 0; bc < this.SIZE; bc += 3) {
                    const blockSet = new Set();
                    for (let r = br; r < br + 2; r++) {
                        for (let c = bc; c < bc + 3; c++) {
                            blockSet.add(this.board[r][c]);
                        }
                    }
                    if (blockSet.size < this.SIZE || blockSet.has(0)) {
                        return; // 未完成
                    }
                }
            }
        }
        
        // 数独完成！显示庆祝消息和撒花效果
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
