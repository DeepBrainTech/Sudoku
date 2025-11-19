export const renderingMixin = {
    drawGrid() {
        document.getElementById('score').textContent = this.score;
        
        this.ctx.clearRect(0, 0, this.side, this.side);
        this.ctx.fillStyle = '#f5deb3';
        this.ctx.fillRect(0, 0, this.side, this.side);
        
        const boardEnd = this.margin + this.SIZE * this.cell;
        
        // æ ¹æ®æ£‹ç›˜å¤§å°ç»˜åˆ¶ä¸åŒçš„ç½‘æ ¼çº¿
        if (this.SIZE === 9) {
            // æ£€æŸ¥æ˜¯å¦æ˜¯Go boardé€‰é¡¹
            const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
            if (goBoardRadio && goBoardRadio.checked) {
                this.draw9x9GoGrid(boardEnd);
            } else {
                this.draw9x9Grid(boardEnd);
            }
        } else if (this.SIZE === 6) {
            this.draw6x6Grid(boardEnd);
        }
        
        // ç»˜åˆ¶æ•°å­—
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
        
        // ç»˜åˆ¶é€‰ä¸­æ ¼å­çš„é«˜äº®æ•ˆæžœ
        if (this.selected) {
            this.highlightIntersection(this.selected[0], this.selected[1]);
        }
        
    },

    draw9x9Grid(boardEnd) {
        // 9x9æ•°ç‹¬ï¼š3x3å®«æ ¼
        const highlightRows = new Set([0, 3, 6, this.SIZE]);  // è¡ŒåŠ ç²—ä½ç½®
        const highlightCols = new Set([0, 3, 6, this.SIZE]);  // åˆ—åŠ ç²—ä½ç½®
        
        for (let i = 0; i <= this.SIZE; i++) {
            const pos = this.margin + i * this.cell;
            
            // ç»˜åˆ¶æ°´å¹³çº¿ï¼ˆè¡Œï¼‰
            const rowLineWidth = highlightRows.has(i) ? 6 : 2;
            const rowLineColor = highlightRows.has(i) ? '#d2691e' : '#8b5c2a';
            
            this.ctx.strokeStyle = rowLineColor;
            this.ctx.lineWidth = rowLineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, pos);
            this.ctx.lineTo(boardEnd, pos);
            this.ctx.stroke();
            
            // ç»˜åˆ¶åž‚ç›´çº¿ï¼ˆåˆ—ï¼‰
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
        // 6x6æ•°ç‹¬ï¼š2x3å®«æ ¼
        const highlightRows = new Set([0, 2, 4, 6, this.SIZE]);  // è¡ŒåŠ ç²—ä½ç½®
        const highlightCols = new Set([0, 3, 6, this.SIZE]);     // åˆ—åŠ ç²—ä½ç½®
        
        for (let i = 0; i <= this.SIZE; i++) {
            const pos = this.margin + i * this.cell;
            
            // ç»˜åˆ¶æ°´å¹³çº¿ï¼ˆè¡Œï¼‰
            const rowLineWidth = highlightRows.has(i) ? 6 : 2;
            const rowLineColor = highlightRows.has(i) ? '#d2691e' : '#8b5c2a';
            
            this.ctx.strokeStyle = rowLineColor;
            this.ctx.lineWidth = rowLineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, pos);
            this.ctx.lineTo(boardEnd, pos);
            this.ctx.stroke();
            
            // ç»˜åˆ¶åž‚ç›´çº¿ï¼ˆåˆ—ï¼‰
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
        // 9x9æ•°ç‹¬ï¼šGo boardæ ·å¼ - 2x2å°æ–¹æ ¼ç»„åŠ ç²—
        // åªéœ€è¦è¾“å…¥2x2æ–¹æ ¼çš„å·¦ä¸Šè§’åæ ‡ï¼Œè‡ªåŠ¨åŠ ç²—æ•´ä¸ª2x2æ–¹æ ¼
        const highlightSquares = [
            // ç¤ºä¾‹ï¼šè¾“å…¥2x2æ–¹æ ¼çš„å·¦ä¸Šè§’åæ ‡
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
        
        // è®¡ç®—8x8æ£‹ç›˜çš„å°ºå¯¸
        const goSize = 8;
        const goCell = (this.side - 2 * this.margin) / goSize;
        const goBoardEnd = this.margin + goSize * goCell;
        
        // å…ˆç»˜åˆ¶æ‰€æœ‰æ™®é€šçº¿æ¡ - 7æ¡çº¿å½¢æˆ8ä¸ªæ ¼å­
        for (let i = 1; i < goSize; i++) {
            const pos = this.margin + i * goCell;
            
            // ç»˜åˆ¶æ°´å¹³çº¿
            this.ctx.strokeStyle = '#8b5c2a';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, pos);
            this.ctx.lineTo(goBoardEnd, pos);
            this.ctx.stroke();
            
            // ç»˜åˆ¶åž‚ç›´çº¿
            this.ctx.strokeStyle = '#8b5c2a';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.margin);
            this.ctx.lineTo(pos, goBoardEnd);
            this.ctx.stroke();
        }
        
        // ç»˜åˆ¶è¾¹æ¡†çº¿
        this.ctx.strokeStyle = '#8b5c2a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.rect(this.margin, this.margin, goSize * goCell, goSize * goCell);
        this.ctx.stroke();
        
        // ç„¶åŽä¸ºæ¯ä¸ª2x2æ–¹æ ¼ç»˜åˆ¶åŠ ç²—è¾¹æ¡†
        highlightSquares.forEach(square => {
            const {row, col} = square;
            
            // è®¡ç®—2x2æ–¹æ ¼çš„åƒç´ åæ ‡
            const startX = this.margin + col * goCell;
            const endX = this.margin + (col + 2) * goCell;
            const startY = this.margin + row * goCell;
            const endY = this.margin + (row + 2) * goCell;
            
            // ç»˜åˆ¶2x2æ–¹æ ¼çš„åŠ ç²—è¾¹æ¡†
            this.ctx.strokeStyle = '#d2691e';
            this.ctx.lineWidth = 6;
            
            // ä¸Šè¾¹
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, startY);
            this.ctx.stroke();
            
            // ä¸‹è¾¹
            this.ctx.beginPath();
            this.ctx.moveTo(startX, endY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            // å·¦è¾¹
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX, endY);
            this.ctx.stroke();
            
            // å³è¾¹
            this.ctx.beginPath();
            this.ctx.moveTo(endX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        });
    },

    drawCircle(r, c, num, fixed = false) {
        // æ£€æŸ¥æ˜¯å¦æ˜¯Go boardæ¨¡å¼
        const goBoardRadio = document.querySelector('input[name="boardSize"][data-go-board="true"]');
        const isGoBoard = goBoardRadio && goBoardRadio.checked;
        
        let x, y, radius;
        
        if (isGoBoard) {
            // Go boardæ¨¡å¼ï¼šç»˜åˆ¶åœ¨äº¤å‰ç‚¹ä¸Š
            const goSize = 8;
            const goCell = (this.side - 2 * this.margin) / goSize;
            x = this.margin + c * goCell;
            y = this.margin + r * goCell;
            radius = goCell * 0.4; // ç¨å¾®å°ä¸€ç‚¹ï¼Œé€‚åˆäº¤å‰ç‚¹
        } else {
            // æ™®é€šæ¨¡å¼ï¼šç»˜åˆ¶åœ¨æ–¹æ ¼ä¸­å¿ƒ
            x = this.margin + c * this.cell + this.cell / 2;
            y = this.margin + r * this.cell + this.cell / 2;
            radius = this.cell * 0.42;
        }
        
        // å¦‚æžœä¸æ˜¯éº»å°†ä¸»é¢˜ä¸”ä¸æ˜¯ä¸Šä¼ ä¸»é¢˜ï¼Œç»˜åˆ¶åœ†åœˆ
        if (!this.mahjongTheme && !this.uploadTheme) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = fixed ? '#fffbe6' : '#e0f7fa';
            this.ctx.fill();
            this.ctx.strokeStyle = fixed ? '#333' : '#1976d2';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
        
        // ç»˜åˆ¶æ•°å­—æˆ–ç¬¦å·
        if (this.uploadTheme) {
            // ç»˜åˆ¶ä¸Šä¼ ä¸»é¢˜å›¾ç‰‡
            this.drawUploadThemePiece(x, y, radius, num, fixed);
        } else if (this.chessTheme) {
            const [symbol, color] = this.getChessSymbolAndColor(num);
            this.ctx.fillStyle = color;
            
            // æ£€æµ‹æ˜¯å¦ä¸ºçœŸæ­£çš„ç§»åŠ¨è®¾å¤‡ï¼ˆæ‰‹æœº/å¹³æ¿ï¼‰ï¼Œä¸åŒ…æ‹¬è§¦å±ç¬”è®°æœ¬
            const isTrueMobile = this.isTrueMobileDevice();
            
            // æ ¹æ®è®¾å¤‡ç±»åž‹è®¾ç½®ä¸åŒçš„å­—ä½“
            if (isTrueMobile) {
                // æ‰‹æœº/å¹³æ¿è®¾å¤‡ï¼šä½¿ç”¨Arialå­—ä½“ï¼Œä½†ä¿ç•™å›žé€€é€‰é¡¹ä»¥ç¡®ä¿Unicodeå­—ç¬¦æ­£ç¡®æ˜¾ç¤º
                this.ctx.font = `bold ${Math.max(32, this.cell * 0.8)}px "Arial", "Helvetica", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
            } else {
                // æ¡Œé¢è®¾å¤‡/è§¦å±ç¬”è®°æœ¬ï¼šä½¿ç”¨åŽŸæœ‰å­—ä½“è®¾ç½®
                this.ctx.font = `bold ${Math.max(26, this.cell * 0.7)}px Arial`;
            }
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // ä¸ºä¸åŒçš„è±¡æ£‹ç¬¦å·æä¾›ç²¾ç¡®çš„åž‚ç›´åç§»è°ƒæ•´
            let offsetY = y;
            if (isTrueMobile) {
                // æ‰‹æœº/å¹³æ¿è®¾å¤‡ä¸Šçš„è°ƒæ•´
                switch(symbol) {
                    case 'â™–': // è½¦
                    case 'â™œ':
                        offsetY = y + this.cell * 0.01;
                        break;
                    case 'â™˜': // é©¬
                    case 'â™ž':
                        offsetY = y - this.cell * 0.01;
                        break;
                    case 'â™—': // è±¡
                    case 'â™':
                        offsetY = y - this.cell * 0.01;
                        break;
                    case 'â™•': // åŽ
                        offsetY = y - this.cell * 0.01;
                        break;
                    case 'â™”': // çŽ‹
                        offsetY = y - this.cell * 0.01;
                        break;
                    case 'â™™': // å…µ
                        offsetY = y + this.cell * 0.01;
                        break;
                    default:
                        offsetY = y;
                }
            } else {
                // æ¡Œé¢è®¾å¤‡/è§¦å±ç¬”è®°æœ¬çš„è°ƒæ•´
                switch(symbol) {
                    case 'â™–': // è½¦ - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    case 'â™œ':
                        offsetY = y + this.cell * 0.03;
                        break;
                    case 'â™˜': // é©¬ - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    case 'â™ž':
                        offsetY = y + this.cell * 0.02;
                        break;
                    case 'â™—': // è±¡ - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    case 'â™':
                        offsetY = y + this.cell * 0.02;
                        break;
                    case 'â™•': // åŽ - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                        offsetY = y + this.cell * 0.02;
                        break;
                    case 'â™”': // çŽ‹ - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                        offsetY = y + this.cell * 0.02;
                        break;
                    case 'â™™': // å…µ - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                        offsetY = y + this.cell * 0.03;
                        break;
                    default:
                        offsetY = y + this.cell * 0.02;
                }
            }
            
            this.ctx.fillText(symbol, x, offsetY);
        } else if (this.mahjongTheme) {
            // ç»˜åˆ¶éº»å°†ç¬¦å·ï¼Œç›´æŽ¥å¡«å……æ•´ä¸ªæ ¼å­
            const [symbol, color] = this.getMahjongSymbolAndColor(num);
            this.ctx.fillStyle = color;
            
            // æ£€æµ‹æ˜¯å¦ä¸ºçœŸæ­£çš„ç§»åŠ¨è®¾å¤‡ï¼ˆæ‰‹æœº/å¹³æ¿ï¼‰ï¼Œä¸åŒ…æ‹¬è§¦å±ç¬”è®°æœ¬
            const isTrueMobile = this.isTrueMobileDevice();
            
            // æ ¹æ®è®¾å¤‡ç±»åž‹è®¾ç½®ä¸åŒçš„å­—ä½“
            if (isTrueMobile) {
                // æ‰‹æœº/å¹³æ¿è®¾å¤‡ï¼šä½¿ç”¨æ›´å¤§çš„å­—ä½“å’Œæ›´å¥½çš„å­—ä½“æ—
                this.ctx.font = `bold ${Math.max(40, this.cell * 1.0)}px "Arial"`;
            } else {
                // æ¡Œé¢è®¾å¤‡/è§¦å±ç¬”è®°æœ¬ï¼šä½¿ç”¨åŽŸæœ‰å­—ä½“è®¾ç½®
                this.ctx.font = `bold ${Math.max(40, this.cell * 1.0)}px Arial`;
            }
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // æ ¹æ®è®¾å¤‡ç±»åž‹è°ƒæ•´ä½ç½®
            let offsetY = y;
            if (isTrueMobile) {
                // æ‰‹æœº/å¹³æ¿è®¾å¤‡ï¼šè°ƒæ•´ä½ç½®ä»¥é€‚åº”å­—ä½“æ¸²æŸ“å·®å¼‚
                offsetY = y + this.cell * -0.15; // è½»å¾®å‘ä¸‹è°ƒæ•´
            } else {
                // æ¡Œé¢è®¾å¤‡/è§¦å±ç¬”è®°æœ¬ï¼šä½¿ç”¨åŽŸæœ‰ä½ç½®
                offsetY = y + this.cell * 0.08;
            }
            
            this.ctx.fillText(symbol, x, offsetY);
        } else if (this.zodiacTheme) {
            // ç»˜åˆ¶ç”Ÿè‚–ç¬¦å·
            const [symbol, color] = this.getZodiacSymbolAndColor(num);
            this.ctx.fillStyle = color;
            
            // æ£€æµ‹æ˜¯å¦ä¸ºçœŸæ­£çš„ç§»åŠ¨è®¾å¤‡ï¼ˆæ‰‹æœº/å¹³æ¿ï¼‰ï¼Œä¸åŒ…æ‹¬è§¦å±ç¬”è®°æœ¬
            const isTrueMobile = this.isTrueMobileDevice();
            
            // æ ¹æ®è®¾å¤‡ç±»åž‹è®¾ç½®ä¸åŒçš„å­—ä½“ - ä¸Žæ•°å­—ä¸»é¢˜ä¿æŒä¸€è‡´
            if (isTrueMobile) {
                // æ‰‹æœº/å¹³æ¿è®¾å¤‡ï¼šä½¿ç”¨ä¸Žæ•°å­—ä¸»é¢˜ç›¸åŒçš„å­—ä½“å¤§å°
                this.ctx.font = `bold ${Math.max(20, this.cell * 0.6)}px "Arial", "Helvetica", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
            } else {
                // æ¡Œé¢è®¾å¤‡/è§¦å±ç¬”è®°æœ¬ï¼šä½¿ç”¨ä¸Žæ•°å­—ä¸»é¢˜ç›¸åŒçš„å­—ä½“å¤§å°
                this.ctx.font = `bold ${Math.max(28, this.cell * 0.6)}px Arial`;
            }
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // æ ¹æ®è®¾å¤‡ç±»åž‹è°ƒæ•´ä½ç½® - ä¸Žæ•°å­—ä¸»é¢˜ä¿æŒä¸€è‡´
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
            
            // ä¸ºä¸åŒæ•°å­—æä¾›ç²¾ç¡®çš„åž‚ç›´åç§»è°ƒæ•´
            let offsetY = y;
            switch(num) {
                case 1: // æ•°å­—1 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.015;
                    break;
                case 2: // æ•°å­—2 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.01;
                    break;
                case 3: // æ•°å­—3 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.01;
                    break;
                case 4: // æ•°å­—4 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.01;
                    break;
                case 5: // æ•°å­—5 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.01;
                    break;
                case 6: // æ•°å­—6 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.01;
                    break;
                case 7: // æ•°å­—7 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.01;
                    break;
                case 8: // æ•°å­—8 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
                    offsetY = y + this.cell * 0.01;
                    break;
                case 9: // æ•°å­—9 - éœ€è¦ç¨å¾®å‘ä¸‹åç§»
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
            // 9x9æ•°ç‹¬ï¼š3x3ç½‘æ ¼æŽ’åˆ—1-9
            const positions = [
                [-1, -1], [0, -1], [1, -1],  // ä¸ŠæŽ’
                [-1, 0], [0, 0], [1, 0],     // ä¸­æŽ’
                [-1, 1], [0, 1], [1, 1]      // ä¸‹æŽ’
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
            // 6x6æ•°ç‹¬ï¼š3x2ç½‘æ ¼æŽ’åˆ—1-6
            const positions = [
                [-1, -1], [0, -1], [1, -1],  // ä¸ŠæŽ’
                [-1, 1], [0, 1], [1, 1]      // ä¸‹æŽ’
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
            // å…¶ä»–å°ºå¯¸ï¼šä½¿ç”¨åŽŸæ¥çš„ç®€å•æŽ’åˆ—
            const markStr = marks.join(' ');
            this.ctx.fillText(markStr, x, y + this.cell / 4);
        }
    },

    drawUploadThemePiece(x, y, radius, num, fixed) {
        // 绘制圆圈背景
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = fixed ? '#fffbe6' : '#e0f7fa';
        this.ctx.fill();
        this.ctx.strokeStyle = fixed ? '#333' : '#1976d2';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        const config = this.getUploadThemeImage ? this.getUploadThemeImage(num) : null;
        const dataUrl = config && config.src ? config.src : null;
        if (!dataUrl) {
            this.ctx.fillStyle = fixed ? '#222' : '#1976d2';
            this.ctx.font = `bold ${Math.max(26, this.cell * 0.7)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(num.toString(), x, y);
            return;
        }
        if (!this.uploadThemeImageCache) {
            this.uploadThemeImageCache = {};
        }
        let image = this.uploadThemeImageCache[dataUrl];
        if (!image) {
            image = new Image();
            image.src = dataUrl;
            image.onload = () => {
                if (this.uploadTheme) {
                    this.drawGrid();
                }
            };
            image.onerror = (error) => {
                console.warn('ä¸Šä¼ ä¸»é¢˜å›¾ç‰‡åŠ è½½å¤±è´¥', error);
            };
            this.uploadThemeImageCache[dataUrl] = image;
        }
        if (!image.complete) {
            return;
        }
        const innerRadius = radius * 0.85;
        const scale = config && typeof config.scale === 'number' ? config.scale : 1;
        const offsetX = config && typeof config.offsetX === 'number' ? config.offsetX : 0;
        const offsetY = config && typeof config.offsetY === 'number' ? config.offsetY : 0;
        const offsetXPx = offsetX * innerRadius * 2;
        const offsetYPx = offsetY * innerRadius * 2;

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.clip();
        this.ctx.save();
        this.ctx.translate(offsetXPx, offsetYPx);
        this.ctx.scale(scale, scale);
        this.ctx.drawImage(image, -innerRadius, -innerRadius, innerRadius * 2, innerRadius * 2);
        this.ctx.restore();
        if (this.uploadThemeShowNumbers) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = fixed ? '#1f2933' : '#0d47a1';
            this.ctx.font = `bold ${Math.max(28, innerRadius * 0.9)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(num.toString(), 0, 0);
        }
        this.ctx.restore();
    },
};

