// 核心数独游戏类，组合所有游戏玩法混入
import { boardGenerationMixin } from '../core/boardGenerationMixin.js';
import { eventHandlersMixin } from '../ui/eventHandlersMixin.js';
import { modeMixin } from '../ui/modeMixin.js';
import { puzzleManagementMixin } from '../ui/puzzleManagementMixin.js';
import { renderingMixin } from '../ui/renderingMixin.js';
import { legendMixin } from '../ui/legendMixin.js';
import { customThemeMixin } from '../utils/customThemeMixin.js';
import { feedbackMixin } from '../ui/feedbackMixin.js';
import { numberPadMixin } from '../ui/numberPadMixin.js';
import { audioMixin } from '../utils/audioMixin.js';
import { uploadThemeMixin } from '../utils/uploadThemeMixin.js';
import { LanguageManager } from '../../languages.js';

export class SudokuGame {

    /**
     * 设置共享游戏状态并连接可选依赖项
     */
    constructor({ languageManager } = {}) {
        this.SIZE = 9;
        this.canvas = document.getElementById('sudokuCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.side = 720;
        this.margin = 50;
        this.cell = (this.side - 2 * this.margin) / this.SIZE;
        
        // 核心谜题状态
        this.board = null;
        this.puzzle = null;
        this.solution = null;
        this.selected = null;
        this.score = 0;
        
        // 数字键盘拖拽和可见性状态
        this.numberPadVisible = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.lastTouchTime = 0;
        
        // 游戏模式标志
        this.hintMode = false;
        this.pencilMode = false;
        this.eraserMode = false;
        this.chessTheme = false; // 象棋主题符号
        this.mahjongTheme = false; // 麻将牌符号
        this.zodiacTheme = false; // 中国生肖符号
        this.customTheme = false;
        this.uploadTheme = false;

        const customData = this.loadCustomSymbols();
        this.customSymbols = customData.symbols;
        this.customSymbolsStored = customData.stored;
        this.customThemeModalVisible = false;
        const uploadThemeData = this.loadUploadThemeImages();
        this.uploadedThemeImages = uploadThemeData.images;
        this.uploadThemeImagesStored = uploadThemeData.stored;
        this.uploadThemeModalVisible = false;
        this.uploadThemeDraftImages = this.cloneUploadImageMap ? this.cloneUploadImageMap(this.uploadedThemeImages) : { ...this.uploadedThemeImages };
        this.uploadThemeImageCache = {};
        this.uploadThemeShowNumbers = this.loadUploadThemeShowNumbers ? this.loadUploadThemeShowNumbers() : false;
        
        // 每个格子的铅笔标记集合
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        
        // 按难度分组的生成谜题
        this.puzzles = { easy: [], normal: [], hard: [] };
        this.currentIndices = { easy: 0, normal: 0, hard: 0 };
        this.numPuzzles = 5;
        
        // 可选的外部语言管理器实例
        this.languageManager = languageManager || null;
        
        // 跟踪当前谜题开始时间
        this.gameStartTime = null;
        
        // Web Audio状态
        this.audioContext = null;
        this.audioInitialized = false;
        
        this.initializeGame();
    }

    /**
     * 为选定的网格大小重新初始化棋盘和UI
     */
    setBoardSize(size) {
        this.SIZE = parseInt(size);
        this.cell = (this.side - 2 * this.margin) / this.SIZE;
        
        // 为选定大小重置谜题状态
        this.board = null;
        this.puzzle = null;
        this.solution = null;
        this.selected = null;
        this.score = 0;
        this.gameStartTime = null;
        
        // 重新创建铅笔标记存储
        this.pencilMarks = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill().map(() => new Set()));
        
        // 重新生成谜题并刷新选择器
        this.generatePuzzles();
        this.updatePuzzleSelector();
        this.resetModes();
        
        if (this.customThemeModalVisible) {
            this.populateCustomThemeInputs();
        }
        if (this.uploadTheme) {
            if (this.uploadThemeModalVisible) {
                this.populateUploadThemeInputs();
            } else if (!this.hasUploadThemeImages()) {
                this.openUploadThemeModal();
            }
        }

        // 强制完整UI刷新以避免某些触摸设备上的陈旧画布
        this.forceUpdateLegend();
        this.updateNumberPad();
        this.drawGrid();
    }

    /**
     * 清除任何现有的图例条目以便重新绘制
     */
    forceUpdateLegend() {
        // 移除所有图例条目
        const legend = document.getElementById('legend');
        if (legend) {
            legend.innerHTML = '';
        }
        
        // 重新填充图例条目
        this.updateLegend();
    }

    /**
     * 准备谜题、UI绑定和音频的启动序列
     */
    initializeGame() {
        // 如果没有提供语言管理器，则延迟创建一个
        if (!this.languageManager) {
            this.languageManager = new LanguageManager();
        }
        
        this.generatePuzzles();
        this.setupEventListeners();
        this.initializeNumberPad();
        this.initializeAudio();
        this.updateLegend();
        this.updateCursor();
        this.drawGrid();
        this.updatePuzzleSelector();
        this.updateCustomThemeButton();
        this.updateUploadThemeButton();
        if (this.updateUploadNumbersCheckbox) {
            this.updateUploadNumbersCheckbox();
        }
    }
}

Object.assign(
    SudokuGame.prototype,
    boardGenerationMixin,
    eventHandlersMixin,
    modeMixin,
    puzzleManagementMixin,
    renderingMixin,
    legendMixin,
    customThemeMixin,
    uploadThemeMixin,
    feedbackMixin,
    numberPadMixin,
    audioMixin,
);

export default SudokuGame;
