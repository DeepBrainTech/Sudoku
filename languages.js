// 多语言支持文件
const languages = {
    zh: {
        // 页面标题和头部
        title: "数独围棋棋盘游戏",
        score: "得分",
        
        // 象棋符号说明
        chessSymbols: "象棋符号",
        
        // 难度选择
        difficulty: "难度选择",
        easy: "简单",
        normal: "普通", 
        hard: "困难",
        
        // 谜题选择
        puzzle: "谜题选择",
        puzzleNumber: "谜题",
        
        // 按钮文本
        start: "开始游戏",
        hint: "提示",
        pencil: "铅笔",
        eraser: "橡皮",
        generate: "生成新谜题",
        chessTheme: "♕ 象棋主题 ♘",
        
        // 游戏说明
        instructions: "游戏说明",
        instruction1: "点击格子选择位置，然后输入数字1-9",
        instruction2: "使用提示按钮获得正确答案",
        instruction3: "使用铅笔模式做笔记",
        instruction4: "使用橡皮模式清除内容",
        instruction5: "开启象棋主题用象棋符号代替数字",
        instruction6: "每填对一个数字得100分，完成行/列/宫得500分",
        
        // 游戏消息
        cellNotEmpty: "格子不为空！",
        incorrectEntry: "不是这个格子的正确答案。",
        congratulations: "恭喜！",
        puzzleSolved: "您解决了这个谜题！",
        finalScore: "最终得分",
        
        // 语言切换
        language: "语言",
        chinese: "中文",
        english: "English"
    },
    
    en: {
        // Page title and header
        title: "Sudoku Go Board Game",
        score: "Score",
        
        // Chess symbols legend
        chessSymbols: "Chess Symbols",
        
        // Difficulty selection
        difficulty: "Difficulty Selection",
        easy: "Easy",
        normal: "Normal",
        hard: "Hard",
        
        // Puzzle selection
        puzzle: "Puzzle Selection",
        puzzleNumber: "Puzzle",
        
        // Button texts
        start: "Start Game",
        hint: "Hint",
        pencil: "Pencil",
        eraser: "Eraser",
        generate: "Generate New",
        chessTheme: "♕ Chess Theme ♘",
        
        // Game instructions
        instructions: "Game Instructions",
        instruction1: "Click on a cell to select position, then input numbers 1-9",
        instruction2: "Use Hint button to get correct answers",
        instruction3: "Use Pencil mode to make notes",
        instruction4: "Use Eraser mode to clear content",
        instruction5: "Enable Chess Theme to use chess symbols instead of numbers",
        instruction6: "Get 100 points for each correct number, 500 points for completing row/column/box",
        
        // Game messages
        cellNotEmpty: "Cell is not empty!",
        incorrectEntry: "is not correct for this cell.",
        congratulations: "Congratulations!",
        puzzleSolved: "You solved the puzzle!",
        finalScore: "Final Score",
        
        // Language switching
        language: "Language",
        chinese: "中文",
        english: "English"
    }
};

// 语言管理类
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('sudoku-language') || 'zh';
        this.init();
    }
    
    init() {
        this.updatePageLanguage();
        this.setupLanguageSwitcher();
    }
    
    getText(key) {
        return languages[this.currentLanguage][key] || key;
    }
    
    setLanguage(lang) {
        if (languages[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('sudoku-language', lang);
            this.updatePageLanguage();
            this.updateLanguageSwitcher();
        }
    }
    
    updatePageLanguage() {
        // 更新所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.getText(key);
            
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = text;
            } else if (element.tagName === 'OPTION') {
                element.textContent = text;
            } else {
                element.textContent = text;
            }
        });
        
        // 更新页面标题
        document.title = this.getText('title');
        
        // 更新特殊元素
        this.updateSpecialElements();
        
        // 更新游戏相关元素
        this.updateGameElements();
    }
    
    updateSpecialElements() {
        // 更新难度标签
        const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
        const difficultyLabels = ['easy', 'normal', 'hard'];
        difficultyRadios.forEach((radio, index) => {
            const label = radio.nextElementSibling;
            if (label) {
                label.textContent = this.getText(difficultyLabels[index]);
            }
        });
        
        // 更新象棋符号图例
        this.updateChessLegend();
    }
    
    updateChessLegend() {
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
            for (let i = 1; i <= 9; i++) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                const [symbol, color] = this.getChessSymbolAndColor(i);
                item.innerHTML = `${i} → <span style="color: ${color}">${symbol}</span>`;
                legend.appendChild(item);
            }
        }
    }
    
    getChessSymbolAndColor(num) {
        const mapping = {
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
        return mapping[num] || [num.toString(), '#222'];
    }
    
    setupLanguageSwitcher() {
        const switcher = document.getElementById('languageSwitcher');
        if (switcher) {
            switcher.addEventListener('click', () => {
                const newLang = this.currentLanguage === 'zh' ? 'en' : 'zh';
                this.setLanguage(newLang);
            });
        }
    }
    
    updateLanguageSwitcher() {
        const switcher = document.getElementById('languageSwitcher');
        if (switcher) {
            const text = this.currentLanguage === 'zh' ? 'English' : '中文';
            switcher.textContent = text;
        }
    }
    
    updateGameElements() {
        // 更新游戏实例的谜题选择器
        if (window.sudokuGame && window.sudokuGame.updatePuzzleSelector) {
            window.sudokuGame.updatePuzzleSelector();
        }
        
        // 更新象棋图例
        this.updateChessLegend();
    }
}

// 全局语言管理器实例
let languageManager;
