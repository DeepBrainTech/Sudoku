// 多语言支持文件
export const languages = {
    zh: {
        // 页面标题和头部
        title: "数独",
        score: "得分",
        
        // 符号说明
        symbolReference: "符号对照",
        chessSymbols: "象棋",
        mahjongSymbols: "麻将", 
        zodiacSymbols: "生肖",
        customSymbols: "自定义",
        
        // 棋盘大小选择
        boardSize: "棋盘大小",
        size9x9: "9x9 (标准)",
        size6x6: "6x6 (简单)",
        size9x9Go: "9x9 (围棋棋盘)",
        
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
        print: "打印",
        generate: "生成新谜题",
        chessTheme: "♕ 象棋主题 ♘",
        zodiacTheme: "🐭 生肖主题 🐒",
        
        // 游戏说明
        instructions: "游戏说明",
        instruction1: "点击格子选择位置，然后输入数字1-9（9x9）或1-6（6x6）",
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
        noPuzzleLoaded: "请先开始一个游戏！",
        victoryMessage: "恭喜！\n您在 ⏱ {time} 内完成并得分 {score}，超越了全球99.9%的玩家！您的大脑刚刚创造了新的智慧记录。🧠✨\n\n截图分享您的成就给朋友和家人吧！\n直接发布到Instagram、Facebook、X、WhatsApp或微信。",
        
        // 游戏说明按钮
        gameInstructions: "游戏说明",
        
        // 主题选择
        theme: "主题",
        numberTheme: "数字主题",
        chessTheme: "象棋主题",
        mahjongTheme: "麻将主题",
        zodiacTheme: "生肖主题",
        customTheme: "自定义符号主题",
        customThemeButton: "编辑符号",
        customThemeTitle: "自定义符号",
        customThemeDescription: "为每个数字指定唯一的符号，未使用的可以留空。",
        customThemeDuplicateError: "请为每个数字选择不同的符号。",
        uploadTheme: "上传",
        uploadThemeButton: "上传图片",
        uploadThemeTitle: "上传图片主题",
        uploadThemeDescription: "为数字1-9分别选择一张图片，我们会自动裁剪并适配圆形棋子。",
        uploadThemeReset: "清除全部图片",
        uploadPreviewPlaceholder: "等待上传",
        uploadThemeMissingError: "请为所有数字上传图片后再保存。",
        uploadThemeInvalidFile: "只能上传图片文件。",
        uploadThemeProcessing: "图片处理中，请稍候……",
        uploadShowNumbers: "显示数字标记",
        cancel: "取消",
        save: "保存",
        
        // 语言切换
        language: "语言",
        chinese: "中文",
        english: "English",
        
    },
    
    en: {
        // Page title and header
        title: "Sudoku",
        score: "Score",
        
        // Symbols legend
        symbolReference: "Symbol Reference",
        chessSymbols: "Chess Symbols",
        mahjongSymbols: "Mahjong Symbols",
        zodiacSymbols: "Zodiac Symbols", 
        customSymbols: "Custom Symbols",
        
        // Board size selection
        boardSize: "Board Size",
        size9x9: "9x9 (Standard)",
        size6x6: "6x6 (Easy)",
        size9x9Go: "9x9 (Go Board)",
        
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
        print: "Print",
        generate: "Generate New Puzzle",
        chessTheme: "♕ Chess Theme ♘",
        zodiacTheme: "🐭 Zodiac Theme 🐒",
        
        // Game instructions
        instructions: "Game Instructions",
        instruction1: "Move your mouse over the cell, then input numbers 1-9 (9x9) or 1-6 (6x6)",
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
        noPuzzleLoaded: "Please start a game first!",
        victoryMessage: "Congratulations!\nYou finished in ⏱ {time} and scored {score}, beating 99.9% of players worldwide! Your brain just set a new record for brilliance. 🧠✨\n\nTake a snapshot and share your achievement with friends and family!\nPost it directly to Instagram, Facebook, X, WhatsApp, or WeChat.",
        
        // Game instructions button
        gameInstructions: "Game Instructions",
        
        // Theme selection
        theme: "Theme",
        numberTheme: "Number",
        chessTheme: "Chess",
        mahjongTheme: "Mahjong",
        zodiacTheme: "Zodiac",
        customTheme: "Custom",
        customThemeButton: "Customize Symbols",
        customThemeTitle: "Customize Symbols",
        customThemeDescription: "Assign a unique symbol to each number. Leave unused values blank.",
        customThemeDuplicateError: "Please choose a unique symbol for each number.",
        uploadTheme: "Upload",
        uploadThemeButton: "Upload Images",
        uploadThemeTitle: "Upload Image Theme",
        uploadThemeDescription: "Choose one image for each number (1-9). We crop it automatically to fit the circular pieces.",
        uploadThemeReset: "Clear All Images",
        uploadPreviewPlaceholder: "Waiting for upload",
        uploadThemeMissingError: "Please upload images for all numbers before saving.",
        uploadThemeInvalidFile: "Only image files are supported.",
        uploadThemeProcessing: "Processing image, please wait...",
        uploadShowNumbers: "Show Numbers On Images",
        cancel: "Cancel",
        save: "Save",
        
        // Language switching
        language: "Language",
        chinese: "中文",
        english: "English",
        
    }
};

// 语言管理类
export class LanguageManager {
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
        // 更新棋盘大小标签
        const boardSizeRadios = document.querySelectorAll('input[name="boardSize"]');
        const boardSizeLabels = ['size9x9', 'size6x6', 'size9x9Go'];
        boardSizeRadios.forEach((radio, index) => {
            const label = radio.nextElementSibling;
            if (label && boardSizeLabels[index]) {
                label.textContent = this.getText(boardSizeLabels[index]);
            }
        });
        
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
        if (window.sudokuGame && window.sudokuGame.forceUpdateLegend) {
            window.sudokuGame.forceUpdateLegend();
        } else {
            this.updateChessLegend();
        }
        if (window.sudokuGame && window.sudokuGame.updateCustomThemeButton) {
            window.sudokuGame.updateCustomThemeButton();
        }
        if (window.sudokuGame && window.sudokuGame.updateUploadThemeButton) {
            window.sudokuGame.updateUploadThemeButton();
        }
    }
    
    updateChessLegend() {
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
            // 获取当前棋盘大小，如果没有游戏实例则默认为9
            const boardSize = window.sudokuGame ? window.sudokuGame.SIZE : 9;
            for (let i = 1; i <= boardSize; i++) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                const [symbol, color] = this.getChessSymbolAndColor(i);
                item.innerHTML = `${i} → <span style="color: ${color}"> ${symbol}</span>`;
                legend.appendChild(item);
            }
        }
        
        // 使用通用标题
        this.updateLegendTitle();
    }

    updateLegendTitle() {
        const legendTitle = document.querySelector('.legend-panel h3');
        if (legendTitle) {
            legendTitle.textContent = this.getText('symbolReference');
        }
    }
    
    getChessSymbolAndColor(num) {
        // 获取当前棋盘大小，如果没有游戏实例则默认为9
        const boardSize = window.sudokuGame ? window.sudokuGame.SIZE : 9;
        
        if (boardSize === 6) {
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
        if (window.sudokuGame && window.sudokuGame.forceUpdateLegend) {
            window.sudokuGame.forceUpdateLegend();
        } else {
            this.updateChessLegend();
        }
        if (window.sudokuGame && window.sudokuGame.updateCustomThemeButton) {
            window.sudokuGame.updateCustomThemeButton();
        }
        if (window.sudokuGame && window.sudokuGame.updateUploadThemeButton) {
            window.sudokuGame.updateUploadThemeButton();
        }
        if (window.sudokuGame && window.sudokuGame.updateNumberPad) {
            window.sudokuGame.updateNumberPad();
        }
        
        // 更新小键盘文本
        this.updateNumberPadTexts();
    }
    
    updateNumberPadTexts() {

        
        // 更新小键盘按钮文本
        const hintBtn = document.getElementById('hintNumberPad');
        const pencilBtn = document.getElementById('pencilNumberPad');
        const eraserBtn = document.getElementById('eraserNumberPad');
        
        if (hintBtn) hintBtn.textContent = this.getText('hint');
        if (pencilBtn) pencilBtn.textContent = this.getText('pencil');
        if (eraserBtn) eraserBtn.textContent = this.getText('eraser');
    }
}





