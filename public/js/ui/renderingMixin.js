export const renderingMixin = {
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
        
    },

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
    },

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
    },

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
    },

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
    },

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
    },
};
