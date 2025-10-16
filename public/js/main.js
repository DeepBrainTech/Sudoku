import { LanguageManager } from '../languages.js';
import { SudokuGame } from './game/SudokuGame.js';

// 当DOM内容加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 创建语言管理器实例
    const languageManager = new LanguageManager();
    window.languageManager = languageManager;

    // 创建数独游戏实例并传入语言管理器
    const game = new SudokuGame({ languageManager });
    window.sudokuGame = game;
});

