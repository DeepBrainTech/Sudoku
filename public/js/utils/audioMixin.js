// 音频混入 - 处理游戏音效
export const audioMixin = {
    // 初始化音频系统
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
    },

    // 播放指定类型的音效
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
    },

    // 内部音效播放实现
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
    },
};
