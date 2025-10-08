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
        this.chessTheme = false;
        
        // 铅笔标记
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        
        // 谜题存储
        this.puzzles = { easy: [], normal: [], hard: [] };
        this.currentIndices = { easy: 0, normal: 0, hard: 0 };
        this.numPuzzles = 5;
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.generatePuzzles();
        this.setupEventListeners();
        this.updateLegend();
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
        
        // 检查3x3宫
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }
    
    solve(board) {
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (board[r][c] === 0) {
                    for (let num = 1; num <= 9; num++) {
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
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            
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
        const clues = { easy: 40, normal: 32, hard: 25 };
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
        document.getElementById('chessThemeBtn').addEventListener('click', () => this.toggleChessTheme());
        
        // 难度选择
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', () => this.updatePuzzleSelector());
        });
        
        // 谜题选择
        document.getElementById('puzzleSelect').addEventListener('change', () => this.selectPuzzle());
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
                alert("格子不为空！");
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
        if (!this.selected) return;
        
        const [r, c] = this.selected;
        if (this.puzzle && this.puzzle[r][c] !== 0) return;
        
        const key = e.key;
        
        if (this.eraserMode) {
            if (key >= '1' && key <= '9') {
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
        
        if (key >= '1' && key <= '9') {
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
                    this.highlightBlock(br, bc);
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
            } else {
                alert(`${val} 不是这个格子的正确答案。`);
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
    }
    
    togglePencilMode() {
        this.pencilMode = !this.pencilMode;
        if (this.pencilMode) {
            this.eraserMode = false;
        }
        this.updateButtonStates();
    }
    
    toggleEraserMode() {
        this.eraserMode = !this.eraserMode;
        if (this.eraserMode) {
            this.pencilMode = false;
        }
        this.updateButtonStates();
    }
    
    toggleChessTheme() {
        this.chessTheme = !this.chessTheme;
        const btn = document.getElementById('chessThemeBtn');
        btn.classList.toggle('active', this.chessTheme);
        this.updateLegend();
        this.drawGrid();
    }
    
    updateButtonStates() {
        document.getElementById('hintBtn').classList.toggle('active', this.hintMode);
        document.getElementById('pencilBtn').classList.toggle('active', this.pencilMode);
        document.getElementById('eraserBtn').classList.toggle('active', this.eraserMode);
    }
    
    updatePuzzleSelector() {
        const diff = document.querySelector('input[name="difficulty"]:checked').value;
        const select = document.getElementById('puzzleSelect');
        select.innerHTML = '';
        
        for (let i = 0; i < this.puzzles[diff].length; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `谜题 ${i + 1}`;
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
        this.drawGrid();
    }
    
    drawGrid() {
        document.getElementById('score').textContent = this.score;
        
        this.ctx.clearRect(0, 0, this.side, this.side);
        this.ctx.fillStyle = '#f5deb3';
        this.ctx.fillRect(0, 0, this.side, this.side);
        
        const boardEnd = this.margin + this.SIZE * this.cell;
        const highlightLines = new Set([0, 3, 6, this.SIZE]);
        
        // 绘制网格线
        for (let i = 0; i <= this.SIZE; i++) {
            const pos = this.margin + i * this.cell;
            const lineWidth = highlightLines.has(i) ? 6 : 2;
            const lineColor = highlightLines.has(i) ? '#d2691e' : '#8b5c2a';
            
            this.ctx.strokeStyle = lineColor;
            this.ctx.lineWidth = lineWidth;
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, pos);
            this.ctx.lineTo(boardEnd, pos);
            this.ctx.stroke();
            
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.margin);
            this.ctx.lineTo(pos, boardEnd);
            this.ctx.stroke();
        }
        
        // 绘制星位
        const starPoints = [[1, 1], [1, 7], [7, 1], [7, 7], [4, 4]];
        this.ctx.fillStyle = '#8b5c2a';
        for (const [r, c] of starPoints) {
            const x = this.margin + (c + 0.5) * this.cell;
            const y = this.margin + (r + 0.5) * this.cell;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
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
    
    drawCircle(r, c, num, fixed = false) {
        const x = this.margin + c * this.cell + this.cell / 2;
        const y = this.margin + r * this.cell + this.cell / 2;
        const radius = this.cell * 0.42;
        
        // 绘制圆圈
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = fixed ? '#fffbe6' : '#e0f7fa';
        this.ctx.fill();
        this.ctx.strokeStyle = fixed ? '#333' : '#1976d2';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 绘制数字或符号
        if (this.chessTheme) {
            const [symbol, color] = this.getChessSymbolAndColor(num);
            this.ctx.fillStyle = color;
            this.ctx.font = `bold ${Math.max(26, this.cell * 0.7)}px Arial`;
        } else {
            this.ctx.fillStyle = fixed ? '#222' : '#1976d2';
            this.ctx.font = `bold ${Math.max(20, this.cell * (fixed ? 0.45 : 0.4))}px Arial`;
        }
        
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const text = this.chessTheme ? this.getChessSymbolAndColor(num)[0] : num.toString();
        this.ctx.fillText(text, x, y);
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
            6: ['♝', '#d32f2f'],  // 红象
            7: ['♞', '#d32f2f'],  // 红马
            8: ['♜', '#d32f2f'],  // 红车
            9: ['♙', '#222'],     // 黑兵
        };
        return mapping[num] || [num.toString(), '#222'];
    }
    
    updateLegend() {
        const legend = document.getElementById('legend');
        legend.innerHTML = '';
        
        for (let i = 1; i <= 9; i++) {
            const [symbol, color] = this.getChessSymbolAndColor(i);
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `${i} → <span style="color: ${color}">${symbol}</span>`;
            legend.appendChild(item);
        }
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
    
    highlightBlock(br, bc) {
        for (let rr = br; rr < br + 3; rr++) {
            for (let cc = bc; cc < bc + 3; cc++) {
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
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
