import tkinter as tk
from tkinter import messagebox
import random

SIZE = 9


# --- Sudoku Puzzle Generator Helpers ---
def valid(board, row, col, num):
    # Check row and column
    for i in range(SIZE):
        if board[row][i] == num or board[i][col] == num:
            return False
    # Check 3x3 box
    start_row, start_col = (row // 3) * 3, (col // 3) * 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def solve(board):
    for r in range(SIZE):
        for c in range(SIZE):
            if board[r][c] == 0:
                for num in range(1, 10):
                    if valid(board, r, c, num):
                        board[r][c] = num
                        if solve(board):
                            return True
                        board[r][c] = 0
                return False
    return True


def generate_full_board():
    for _ in range(10):
        board = [[0] * SIZE for _ in range(SIZE)]

        def fill():
            for r in range(SIZE):
                for c in range(SIZE):
                    if board[r][c] == 0:
                        random.shuffle(nums)
                        for num in nums:
                            if valid(board, r, c, num):
                                board[r][c] = num
                                if fill():
                                    return True
                                board[r][c] = 0
                        return False
            return True

        nums = list(range(1, 10))
        if fill():
            return board
    raise RuntimeError("Failed to generate a valid Sudoku board after multiple attempts.")


def make_puzzle(board, difficulty="easy"):
    clues = {"easy": 40, "normal": 32, "hard": 25}
    keep = clues[difficulty]
    for _ in range(10):
        puzzle = [row[:] for row in board]
        cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
        random.shuffle(cells)
        to_remove = SIZE * SIZE - keep
        for (r, c) in cells:
            if to_remove <= 0:
                break
            backup = puzzle[r][c]
            puzzle[r][c] = 0
            board_copy = [row[:] for row in puzzle]
            if not solve(board_copy):
                puzzle[r][c] = backup
            else:
                to_remove -= 1
        board_copy = [row[:] for row in puzzle]
        if solve(board_copy):
            return puzzle
    raise RuntimeError("Failed to generate a valid Sudoku puzzle after multiple attempts.")


# --- GUI ---
class SudokuGoGUI:
    def __init__(self, root):
        self.root = root
        self.side = 720
        self.root.title("Sudoku on a Go Board")

        self.puzzles = {"easy": [], "normal": [], "hard": []}
        self.current_indices = {"easy": 0, "normal": 0, "hard": 0}
        self.num_puzzles = 5
        self.generate_puzzles()

        self.display_frame = tk.Frame(root)
        self.display_frame.pack(pady=10)

        self.canvas = tk.Canvas(self.display_frame, width=self.side, height=self.side, bg="#f5deb3")
        self.canvas.pack(side="left", padx=(0, 10))
        self.canvas.bind("<Button-1>", self.click)
        self.canvas.bind("<Motion>", self.mouse_move)

        self.legend_frame = None
        self.legend_labels = []

        self.root.bind("<Key>", self.key_press)

        self.board = None
        self.puzzle = None
        self.solution = None
        self.selected = None
        self.score = 0

        self.hint_mode = False
        self.pencil_mode = False
        self.eraser_mode = False
        self.chess_theme = False
        self.pencil_marks = [[set() for _ in range(SIZE)] for _ in range(SIZE)]

        self.build_legend_panel()
        self.draw_grid()

        control_frame = tk.Frame(root)
        control_frame.pack()

        self.diff_var = tk.StringVar(value="easy")
        self.puzzle_var = tk.IntVar(value=0)
        radio_font = ("Arial", 22)
        button_font = ("Arial", 22)
        menu_font = ("Arial", 22)

        for diff in ["easy", "normal", "hard"]:
            tk.Radiobutton(
                control_frame,
                text=f"{diff.capitalize()} ({len(self.puzzles[diff])})",
                variable=self.diff_var,
                value=diff,
                command=self.update_puzzle_selector,
                font=radio_font,
            ).pack(side="left", padx=10)

        self.puzzle_menu = tk.OptionMenu(control_frame, self.puzzle_var, *range(self.num_puzzles), command=self.select_puzzle)
        self.puzzle_menu.config(font=menu_font)
        self.puzzle_menu.pack(side="left", padx=10)

        self.start_btn = tk.Button(control_frame, text="Start", command=self.start_selected_puzzle, font=button_font)
        self.start_btn.pack(side="left", padx=10)

        self.hint_btn = tk.Button(control_frame, text="Hint", command=self.enable_hint_mode, font=button_font)
        self.hint_btn.pack(side="left", padx=10)

        self.pencil_btn = tk.Button(control_frame, text="Pencil", command=self.enable_pencil_mode, font=button_font)
        self.pencil_btn.pack(side="left", padx=10)

        self.eraser_btn = tk.Button(control_frame, text="Eraser", command=self.enable_eraser_mode, font=button_font)
        self.eraser_btn.pack(side="left", padx=10)

        self.more_btn = tk.Button(control_frame, text="Generate", command=self.generate_more_puzzles, font=button_font)
        self.more_btn.pack(side="left", padx=10)

        chess_frame = tk.Frame(root)
        chess_frame.pack(pady=(5, 10))
        self.chess_btn = tk.Button(
            chess_frame,
            text="♕ Chess Theme ♘",
            command=self.enable_chess_theme,
            font=("Arial", 18, "bold"),
            bg="#f0f8ff",
            fg="#222",
            relief="raised",
            bd=4,
        )
        self.chess_btn.pack(padx=20, pady=10)

    # --- Layout helpers ---
    def build_legend_panel(self):
        if self.legend_frame:
            self.legend_frame.destroy()
            self.legend_labels = []

        self.legend_frame = tk.Frame(self.display_frame)
        self.legend_frame.pack(side="left", fill="y")

        title = tk.Label(self.legend_frame, text="Chess Symbols", font=("Arial", 18, "bold"))
        title.pack(anchor="n", pady=(0, 12))

        for i in range(1, 10):
            lbl = tk.Label(self.legend_frame, font=("Arial", 30, "bold"))
            lbl.pack(anchor="w", pady=4)
            self.legend_labels.append(lbl)

        self.update_legend()

    def update_legend(self):
        for index, lbl in enumerate(self.legend_labels, start=1):
            symbol, color = self.get_chess_symbol_and_color(index)
            lbl.config(text=f"{index} → {symbol}", fg=color)

    # --- Puzzle management ---
    def generate_puzzles(self):
        for diff in ["easy", "normal", "hard"]:
            self.puzzles[diff] = []
            for _ in range(self.num_puzzles):
                full = generate_full_board()
                puzzle = make_puzzle(full, diff)
                self.puzzles[diff].append((puzzle, full))

    def generate_more_puzzles(self):
        diff = self.diff_var.get()
        full = generate_full_board()
        puzzle = make_puzzle(full, diff)
        self.puzzles[diff].append((puzzle, full))
        self.num_puzzles = max(self.num_puzzles, len(self.puzzles[diff]))
        self.update_puzzle_selector()
        self.hint_mode = False
        self.pencil_mode = False
        self.eraser_mode = False
        self.pencil_marks = [[set() for _ in range(SIZE)] for _ in range(SIZE)]

    def update_puzzle_selector(self, *_):
        diff = self.diff_var.get()
        menu = self.puzzle_menu["menu"]
        menu.delete(0, "end")
        for i in range(len(self.puzzles[diff])):
            menu.add_command(label=str(i), command=lambda v=i: self.puzzle_var.set(v))
        self.puzzle_var.set(0)

    def select_puzzle(self, _value):
        pass

    def start_selected_puzzle(self):
        diff = self.diff_var.get()
        idx = self.puzzle_var.get()
        self.new_game(diff, idx)

    # --- Rendering ---
    def mouse_move(self, event):
        x, y = event.x, event.y
        if not hasattr(self, "margin") or not hasattr(self, "cell") or self.cell <= 0:
            return
        c = int((x - self.margin) // self.cell)
        r = int((y - self.margin) // self.cell)
        self.draw_grid()
        if 0 <= r < SIZE and 0 <= c < SIZE:
            self.highlight_intersection(r, c)
            self.selected = (r, c)

    def highlight_intersection(self, r, c):
        x1 = self.margin + c * self.cell
        y1 = self.margin + r * self.cell
        x2 = x1 + self.cell
        y2 = y1 + self.cell
        self.canvas.create_rectangle(
            x1 + 2,
            y1 + 2,
            x2 - 2,
            y2 - 2,
            outline="#1976d2",
            width=4,
            fill="#bbdefb",
        )

    def enable_chess_theme(self):
        self.chess_theme = not self.chess_theme
        self.chess_btn.config(relief="sunken" if self.chess_theme else "raised")
        self.update_legend()
        self.draw_grid()

    def draw_grid(self):
        self.root.title(f"Sudoku on a Go Board | Score: {self.score}")

        margin = 50
        cell = (self.side - 2 * margin) / SIZE
        self.margin = margin
        self.cell = cell

        self.canvas.delete("all")

        board_end = margin + SIZE * cell
        highlight_lines = {0, 3, 6, SIZE}
        for i in range(SIZE + 1):
            pos = margin + i * cell
            line_width = 2
            line_color = "#8b5c2a"
            if i in highlight_lines:
                line_width = 6
                line_color = "#d2691e"
            self.canvas.create_line(margin, pos, board_end, pos, width=line_width, fill=line_color)
            self.canvas.create_line(pos, margin, pos, board_end, width=line_width, fill=line_color)

        star_points = [(1, 1), (1, 7), (7, 1), (7, 7), (4, 4)]
        for r, c in star_points:
            x = margin + (c + 0.5) * cell
            y = margin + (r + 0.5) * cell
            self.canvas.create_oval(x - 6, y - 6, x + 6, y + 6, fill="#8b5c2a", outline="")

        if self.puzzle:
            for r in range(SIZE):
                for c in range(SIZE):
                    if self.puzzle[r][c] != 0:
                        self.draw_circle(r, c, self.puzzle[r][c], fixed=True)
                    elif self.board[r][c] != 0:
                        self.draw_circle(r, c, self.board[r][c], fixed=False)
                    elif self.pencil_marks[r][c]:
                        x = margin + c * cell + cell / 2
                        y = margin + r * cell + cell / 2
                        marks = sorted(self.pencil_marks[r][c])
                        mark_str = " ".join(str(m) for m in marks)
                        pencil_font = max(12, int(cell * 0.25))
                        self.canvas.create_text(x, y + cell / 4, text=mark_str, fill="#888", font=("Arial", pencil_font))

        self.canvas.create_text(
            self.side // 2,
            self.side - 10,
            text=f"★  {self.score}",
            fill="red",
            font=("Arial", 20, "bold"),
        )

    def draw_circle(self, r, c, num, fixed=False):
        x = self.margin + c * self.cell + self.cell / 2
        y = self.margin + r * self.cell + self.cell / 2
        r_circle = self.cell * 0.42
        fill_color = "#fffbe6" if fixed else "#e0f7fa"
        outline_color = "#333" if fixed else "#1976d2"
        self.canvas.create_oval(
            x - r_circle,
            y - r_circle,
            x + r_circle,
            y + r_circle,
            outline=outline_color,
            width=3,
            fill=fill_color,
        )

        if self.chess_theme:
            symbol, color = self.get_chess_symbol_and_color(num)
            font_size = max(26, int(self.cell * 0.7))
            self.canvas.create_text(x, y, text=symbol, fill=color, font=("Arial", font_size, "bold"))
        else:
            color = "#222" if fixed else "#1976d2"
            font_size = max(20, int(self.cell * (0.45 if fixed else 0.4)))
            self.canvas.create_text(x, y, text=str(num), fill=color, font=("Arial", font_size, "bold"))

    def get_chess_symbol_and_color(self, num):
        mapping = {
            1: ("♖", "#1976d2"),  # Blue rook
            2: ("♘", "#1976d2"),  # Blue knight
            3: ("♗", "#1976d2"),  # Blue bishop
            4: ("♕", "#222"),     # Dark queen
            5: ("♔", "#222"),     # Dark king
            6: ("♝", "#d32f2f"),  # Red bishop
            7: ("♞", "#d32f2f"),  # Red knight
            8: ("♜", "#d32f2f"),  # Red rook
            9: ("♙", "#222"),     # Dark pawn
        }
        return mapping.get(num, (str(num), "#222"))

    # --- Game state ---
    def new_game(self, difficulty, index=None):
        if index is None:
            index = self.current_indices[difficulty]
        self.current_indices[difficulty] = index
        self.puzzle, full = self.puzzles[difficulty][index]
        self.board = [row[:] for row in self.puzzle]
        self.solution = full
        self.selected = None
        self.pencil_marks = [[set() for _ in range(SIZE)] for _ in range(SIZE)]
        self.draw_grid()

    def enable_hint_mode(self):
        self.hint_mode = not self.hint_mode
        relief = "sunken" if self.hint_mode else "raised"
        try:
            self.hint_btn.config(relief=relief)
        except Exception:
            pass
        try:
            self.root.config(cursor="question_arrow" if self.hint_mode else "arrow")
        except Exception:
            self.root.config(cursor="arrow")

    def click(self, event):
        x, y = event.x, event.y
        if self.margin < x < self.side - self.margin and self.margin < y < self.side - self.margin:
            self.canvas.focus_set()
            r = int((y - self.margin) // self.cell)
            c = int((x - self.margin) // self.cell)

            if self.eraser_mode:
                if self.pencil_marks[r][c]:
                    self.pencil_marks[r][c].clear()
                    self.draw_grid()
                return

            if self.hint_mode:
                if self.board[r][c] == 0:
                    correct = self.solution[r][c]
                    self.board[r][c] = correct
                    self.draw_grid()
                    self.flash_cell(r, c)
                else:
                    messagebox.showinfo("Hint", "Cell is not empty!")
                return

            self.selected = None if self.selected == (r, c) else (r, c)
            self.draw_grid()

    def flash_cell(self, r, c):
        x1 = self.margin + c * self.cell
        y1 = self.margin + r * self.cell
        x2 = x1 + self.cell
        y2 = y1 + self.cell
        rect = self.canvas.create_rectangle(
            x1 + 3,
            y1 + 3,
            x2 - 3,
            y2 - 3,
            outline="#ffd700",
            width=4,
            fill="#fff176",
        )
        self.root.update()
        self.root.after(150, lambda: self.canvas.delete(rect))

    def key_press(self, event):
        if not self.selected:
            return
        r, c = self.selected
        if self.puzzle and self.puzzle[r][c] != 0:
            return
        key = event.char

        if self.eraser_mode:
            if key in "123456789":
                val = int(key)
                if val in self.pencil_marks[r][c]:
                    self.pencil_marks[r][c].discard(val)
                    self.draw_grid()
            elif key in ("0", " ", "\b", "\x7f"):
                if self.pencil_marks[r][c]:
                    self.pencil_marks[r][c].clear()
                    self.draw_grid()
            return

        if key in "123456789":
            val = int(key)
            if self.pencil_mode:
                self.pencil_marks[r][c].add(val)
                self.draw_grid()
                return

            if self.solution and val == self.solution[r][c]:
                gained = False
                if self.board[r][c] != val:
                    self.score += 100
                    gained = True
                    try:
                        self.flash_cell(r, c)
                    except Exception:
                        pass
                    try:
                        import winsound

                        winsound.Beep(1200, 120)
                    except Exception:
                        pass
                self.board[r][c] = val
                self.pencil_marks[r][c].clear()
                self.draw_grid()

                bonus = False
                br, bc = 3 * (r // 3), 3 * (c // 3)
                block = [self.board[rr][cc] for rr in range(br, br + 3) for cc in range(bc, bc + 3)]
                if all(n != 0 for n in block):
                    bonus = True
                    self.highlight_block(br, bc)
                if all(self.board[r][cc] != 0 for cc in range(SIZE)):
                    bonus = True
                    self.highlight_row(r)
                if all(self.board[rr][c] != 0 for rr in range(SIZE)):
                    bonus = True
                    self.highlight_col(c)
                if bonus:
                    self.score += 500
                    self.draw_grid()
                elif gained:
                    self.draw_grid()
            else:
                messagebox.showwarning("Incorrect Entry", f"{val} is not correct for this cell.")
        elif key in ("0", " ", "\b", "\x7f"):
            self.board[r][c] = 0
            self.pencil_marks[r][c].clear()
            self.draw_grid()

    def enable_pencil_mode(self):
        self.pencil_mode = not self.pencil_mode
        if self.pencil_mode:
            self.eraser_mode = False
            self.pencil_btn.config(relief="sunken")
            try:
                self.root.config(cursor="pencil")
            except Exception:
                self.root.config(cursor="arrow")
        else:
            self.pencil_btn.config(relief="raised")
            self.root.config(cursor="arrow")

    def enable_eraser_mode(self):
        self.eraser_mode = not self.eraser_mode
        if self.eraser_mode:
            self.pencil_mode = False
            self.pencil_btn.config(relief="raised")
            try:
                self.root.config(cursor="hand2")
            except Exception:
                self.root.config(cursor="arrow")
            self.eraser_btn.config(relief="sunken")
        else:
            self.root.config(cursor="arrow")
            self.eraser_btn.config(relief="raised")

    def highlight_block(self, br, bc):
        for rr in range(br, br + 3):
            for cc in range(bc, bc + 3):
                x1 = self.margin + cc * self.cell
                y1 = self.margin + rr * self.cell
                x2 = x1 + self.cell
                y2 = y1 + self.cell
                self.canvas.create_rectangle(
                    x1 + 3,
                    y1 + 3,
                    x2 - 3,
                    y2 - 3,
                    outline="#ff0000",
                    width=4,
                    fill="#ffe4e1",
                )
        self.root.update()
        self.root.after(350, self.draw_grid)

    def highlight_row(self, r):
        for cc in range(SIZE):
            x1 = self.margin + cc * self.cell
            y1 = self.margin + r * self.cell
            x2 = x1 + self.cell
            y2 = y1 + self.cell
            self.canvas.create_rectangle(
                x1 + 3,
                y1 + 3,
                x2 - 3,
                y2 - 3,
                outline="#ff0000",
                width=4,
                fill="#ffe4e1",
            )
        self.root.update()
        self.root.after(350, self.draw_grid)

    def highlight_col(self, c):
        for rr in range(SIZE):
            x1 = self.margin + c * self.cell
            y1 = self.margin + rr * self.cell
            x2 = x1 + self.cell
            y2 = y1 + self.cell
            self.canvas.create_rectangle(
                x1 + 3,
                y1 + 3,
                x2 - 3,
                y2 - 3,
                outline="#ff0000",
                width=4,
                fill="#ffe4e1",
            )
        self.root.update()
        self.root.after(350, self.draw_grid)

    def check_solution(self):
        for r in range(SIZE):
            if len(set(self.board[r])) < SIZE:
                messagebox.showinfo("Result", "Incorrect or incomplete!")
                return
        for c in range(SIZE):
            col = [self.board[r][c] for r in range(SIZE)]
            if len(set(col)) < SIZE:
                messagebox.showinfo("Result", "Incorrect or incomplete!")
                return
        for br in range(0, SIZE, 3):
            for bc in range(0, SIZE, 3):
                block = [self.board[r][c] for r in range(br, br + 3) for c in range(bc, bc + 3)]
                if len(set(block)) < SIZE:
                    messagebox.showinfo("Result", "Incorrect or incomplete!")
                    return
        messagebox.showinfo(
            "Congratulations!",
            "You solved the puzzle!\nYour final score: {}".format(self.score),
        )


if __name__ == "__main__":
    root = tk.Tk()
    app = SudokuGoGUI(root)
    root.mainloop()
