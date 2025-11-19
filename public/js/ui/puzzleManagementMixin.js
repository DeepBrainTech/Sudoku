// 管理谜题生命周期：打印、主题切换和谜题选择
export const puzzleManagementMixin = {
    // 将活动谜题渲染为可打印文档
    printBoard() {
        if (!this.board) {
            const message = this.languageManager ? 
                this.languageManager.getText('noPuzzleLoaded') || '请先开始一个游戏！' : 
                '请先开始一个游戏！';
            alert(message);
            return;
        }
        
        // 打开新窗口用于打印
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        
        // 构建可打印的HTML内容
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
        
        // 填充表格行和单元格
        for (let r = 0; r < this.SIZE; r++) {
            htmlContent += '<tr>';
            for (let c = 0; c < this.SIZE; c++) {
                let classes = [];
                
                // 为粗边框添加类
                if (this.SIZE === 9) {
                    // 9x9棋盘使用3x3块
                    if (r % 3 === 0) classes.push('thick-top');
                    if (r === this.SIZE - 1) classes.push('thick-bottom');
                    if (c % 3 === 0) classes.push('thick-left');
                    if (c === this.SIZE - 1) classes.push('thick-right');
                } else if (this.SIZE === 6) {
                    // 6x6棋盘使用2x3块
                    if (r % 2 === 0) classes.push('thick-top');
                    if (r === this.SIZE - 1) classes.push('thick-bottom');
                    if (c % 3 === 0) classes.push('thick-left');
                    if (c === this.SIZE - 1) classes.push('thick-right');
                }
                
                // 标记单元格类型（固定、已填充、空白）
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
        
        // 将标记注入打印窗口
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // 内容加载完成后触发打印对话框
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    },

    // 切换符号主题并更新UI依赖项
    changeTheme(theme) {
        if (theme === '') return; // 忽略下拉菜单中的占位符选项
        this.chessTheme = (theme === 'chess');
        this.mahjongTheme = (theme === 'mahjong');
        this.zodiacTheme = (theme === 'zodiac');
        this.customTheme = (theme === 'custom');
        this.uploadTheme = (theme === 'upload');

        this.updateCustomThemeButton();
        this.updateUploadThemeButton();

        if (this.customTheme) {
            this.openCustomThemeModal();
        } else {
            this.closeCustomThemeModal();
        }

        if (this.uploadTheme) {
            if (!this.hasUploadThemeImages()) {
                this.openUploadThemeModal();
            } else {
                this.closeUploadThemeModal();
            }
        } else {
            this.closeUploadThemeModal();
        }

        this.forceUpdateLegend();
        this.updateNumberPad();
        this.drawGrid();
    },

    // 为选定难度重建谜题下拉选项
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
    },

    // 谜题选择钩子的占位符（逻辑通过startSelectedPuzzle处理）
    selectPuzzle() {
        // 根据选定的谜题更新棋盘
    },

    // 开始下拉菜单中当前选择的谜题
    startSelectedPuzzle() {
        const diff = document.querySelector('input[name="difficulty"]:checked').value;
        const idx = parseInt(document.getElementById('puzzleSelect').value);
        this.newGame(diff, idx);
    },

    // 开始或切换谜题时准备内部状态
    newGame(difficulty, index = 0) {
        this.currentIndices[difficulty] = index;
        [this.puzzle, this.solution] = this.puzzles[difficulty][index];
        this.board = this.puzzle.map(row => [...row]);
        this.selected = null;
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        this.gameStartTime = Date.now();         // 记录谜题开始时间
        this.drawGrid();
    },

    // 显示说明模态对话框
    showInstructionsModal() {
        const modal = document.getElementById('instructionsModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';         // 模态框打开时防止背景滚动
    },

    // 隐藏说明模态对话框
    hideInstructionsModal() {
        const modal = document.getElementById('instructionsModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';         // 关闭模态框后恢复body滚动
    },
};
