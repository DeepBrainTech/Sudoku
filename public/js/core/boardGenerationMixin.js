// 数独棋盘生成和求解辅助函数
export const boardGenerationMixin = {
    // 验证数字放置是否遵循数独规则
    isValid(board, row, col, num) {
        // 检查行和列约束
        for (let i = 0; i < this.SIZE; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }
        
        // 验证每个宫格中的数字唯一性
        if (this.SIZE === 9) {
            // 9x9模式使用3x3宫格
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
            // 6x6模式使用2x3宫格
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
    },

    // 使用深度优先回溯递归求解棋盘
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
    },

    // 在移除线索之前构建完全求解的棋盘
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
                // 确保生成的棋盘仍然能正确求解
                if (this.validateBoard(board)) {
                    return board;
                }
            }
        }
        throw new Error("无法生成有效的数独棋盘");
    },

    // 验证已求解的棋盘是否遵循所有约束
    validateBoard(board) {
        // 验证每行中的数字唯一性
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
        
        // 验证每列中的数字唯一性
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
        
        // 验证每个宫格中的数字唯一性
        if (this.SIZE === 9) {
            // 9x9模式使用3x3宫格
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
            // 6x6模式使用2x3宫格
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
    },

    // 移除数字同时保持谜题唯一可解
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
    },

    // 使用Fisher-Yates洗牌算法随机化数字顺序
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    // 为每个难度级别预计算少量谜题池
    generatePuzzles() {
        for (const diff of ["easy", "normal", "hard"]) {
            this.puzzles[diff] = [];
            for (let i = 0; i < this.numPuzzles; i++) {
                const full = this.generateFullBoard();
                const puzzle = this.makePuzzle(full, diff);
                this.puzzles[diff].push([puzzle, full]);
            }
        }
    },

    // 为当前难度级别添加更多谜题
    generateMorePuzzles() {
        const diff = document.querySelector('input[name="difficulty"]:checked').value;
        const full = this.generateFullBoard();
        const puzzle = this.makePuzzle(full, diff);
        this.puzzles[diff].push([puzzle, full]);
        this.numPuzzles = Math.max(this.numPuzzles, this.puzzles[diff].length);
        this.updatePuzzleSelector();
        this.resetModes();
    },
};
