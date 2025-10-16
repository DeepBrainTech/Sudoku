export const feedbackMixin = {
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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },
};
