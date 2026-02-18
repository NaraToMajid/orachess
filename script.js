// ==================== GAME STATE ====================
let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let currentPlayer = 'w';        // 'w' = putih, 'b' = hitam
let selectedRow = -1, selectedCol = -1;

let capturedByWhite = [];        // putih menangkap hitam
let capturedByBlack = [];        // hitam menangkap putih

let whiteKingPos = { row: 7, col: 4 };
let blackKingPos = { row: 0, col: 4 };
let gameActive = true;

// Mode game
let gameMode = '2player';
let computerDifficulty = 'MENENGAH';
const computerColor = 'b';

// ==================== DOM ELEMENTS ====================
const mainMenu = document.getElementById('mainMenu');
const modeSelect = document.getElementById('modeSelect');
const difficultySelect = document.getElementById('difficultySelect');
const gameContainer = document.getElementById('gameContainer');
const difficultyDisplay = document.getElementById('difficultyDisplay');

const btnMain = document.getElementById('btnMain');
const btnKeluar = document.getElementById('btnKeluar');
const btn2Player = document.getElementById('btn2Player');
const btnVsComputer = document.getElementById('btnVsComputer');
const backFromMode = document.getElementById('backFromMode');
const btnPemula = document.getElementById('btnPemula');
const btnMenengah = document.getElementById('btnMenengah');
const btnAhli = document.getElementById('btnAhli');
const backFromDifficulty = document.getElementById('backFromDifficulty');
const backToMenu = document.getElementById('backToMenu');

const boardEl = document.getElementById('chessboard');
const turnDisplay = document.getElementById('turnDisplay');
const whiteCapturedCount = document.getElementById('whiteCapturedCount');
const blackCapturedCount = document.getElementById('blackCapturedCount');
const resetBtn = document.getElementById('resetGame');
const gameOverModal = document.getElementById('gameOverModal');
const winnerText = document.getElementById('winnerText');
const checkmateText = document.getElementById('checkmateText');
const modalResetBtn = document.getElementById('modalResetBtn');

// ==================== MENU NAVIGATION ====================
btnMain.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    modeSelect.classList.remove('hidden');
});

btnKeluar.addEventListener('click', () => {
    alert('Terima kasih telah bermain!');
});

backFromMode.addEventListener('click', () => {
    modeSelect.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});

btn2Player.addEventListener('click', () => {
    gameMode = '2player';
    startNewGame();
});

btnVsComputer.addEventListener('click', () => {
    modeSelect.classList.add('hidden');
    difficultySelect.classList.remove('hidden');
});

backFromDifficulty.addEventListener('click', () => {
    difficultySelect.classList.add('hidden');
    modeSelect.classList.remove('hidden');
});

btnPemula.addEventListener('click', () => {
    gameMode = 'computer';
    computerDifficulty = 'PEMULA';
    startNewGame();
});

btnMenengah.addEventListener('click', () => {
    gameMode = 'computer';
    computerDifficulty = 'MENENGAH';
    startNewGame();
});

btnAhli.addEventListener('click', () => {
    gameMode = 'computer';
    computerDifficulty = 'AHLI';
    startNewGame();
});

backToMenu.addEventListener('click', () => {
    gameContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    resetGameFull();
});

function startNewGame() {
    resetGameFull();
    gameContainer.classList.remove('hidden');
    modeSelect.classList.add('hidden');
    difficultySelect.classList.add('hidden');

    if (gameMode === 'computer') {
        difficultyDisplay.classList.remove('hidden');
        difficultyDisplay.textContent = `AI: ${computerDifficulty}`;
    } else {
        difficultyDisplay.classList.add('hidden');
    }
}

// ==================== CHESS LOGIC ====================
function isWhitePiece(piece) {
    return piece && piece.charCodeAt(0) >= 65 && piece.charCodeAt(0) <= 90;
}

function getPieceClass(piece) {
    if (!piece) return '';

    const pieceLower = piece.toLowerCase();
    const isWhite = isWhitePiece(piece);

    let typeClass = '';
    switch (pieceLower) {
        case 'k': typeClass = 'king'; break;
        case 'q': typeClass = 'queen'; break;
        case 'r': typeClass = 'rook'; break;
        case 'b': typeClass = 'bishop'; break;
        case 'n': typeClass = 'knight'; break;
        case 'p': typeClass = 'pawn'; break;
        default: return '';
    }

    return `piece ${typeClass} ${isWhite ? 'white-piece' : 'black-piece'}`;
}

function updateKingPositions() {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === 'K') whiteKingPos = { row: r, col: c };
            if (board[r][c] === 'k') blackKingPos = { row: r, col: c };
        }
    }
}

function isSquareAttacked(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const isWhite = isWhitePiece(piece);
            if ((attackerColor === 'w' && !isWhite) || (attackerColor === 'b' && isWhite)) continue;

            if (canPieceAttack(r, c, row, col)) return true;
        }
    }
    return false;
}

function canPieceAttack(rFrom, cFrom, rTo, cTo) {
    const piece = board[rFrom][cFrom];
    if (!piece) return false;

    const isWhite = isWhitePiece(piece);
    const pieceType = piece.toLowerCase();
    const dr = rTo - rFrom;
    const dc = cTo - cFrom;

    // Pawn attacks diagonally
    if (pieceType === 'p') {
        const direction = isWhite ? -1 : 1;
        if (Math.abs(dc) === 1 && dr === direction) return true;
        return false;
    }

    // Rook
    if (pieceType === 'r') {
        if (rFrom !== rTo && cFrom !== cTo) return false;
        if (rFrom === rTo) {
            let step = (cTo > cFrom) ? 1 : -1;
            for (let c = cFrom + step; c !== cTo; c += step) {
                if (board[rFrom][c]) return false;
            }
        } else {
            let step = (rTo > rFrom) ? 1 : -1;
            for (let r = rFrom + step; r !== rTo; r += step) {
                if (board[r][cFrom]) return false;
            }
        }
        return true;
    }

    // Knight
    if (pieceType === 'n') {
        return ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2));
    }

    // Bishop
    if (pieceType === 'b') {
        if (Math.abs(dr) !== Math.abs(dc)) return false;
        let stepRow = (dr > 0) ? 1 : -1;
        let stepCol = (dc > 0) ? 1 : -1;
        for (let i = 1; i < Math.abs(dr); i++) {
            if (board[rFrom + i * stepRow][cFrom + i * stepCol]) return false;
        }
        return true;
    }

    // Queen
    if (pieceType === 'q') {
        if (rFrom === rTo || cFrom === cTo) {
            if (rFrom === rTo) {
                let step = (cTo > cFrom) ? 1 : -1;
                for (let c = cFrom + step; c !== cTo; c += step) {
                    if (board[rFrom][c]) return false;
                }
            } else {
                let step = (rTo > rFrom) ? 1 : -1;
                for (let r = rFrom + step; r !== rTo; r += step) {
                    if (board[r][cFrom]) return false;
                }
            }
            return true;
        } else if (Math.abs(dr) === Math.abs(dc)) {
            let stepRow = (dr > 0) ? 1 : -1;
            let stepCol = (dc > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(dr); i++) {
                if (board[rFrom + i * stepRow][cFrom + i * stepCol]) return false;
            }
            return true;
        }
        return false;
    }

    // King
    if (pieceType === 'k') {
        return (Math.abs(dr) <= 1 && Math.abs(dc) <= 1);
    }

    return false;
}

function isKingInCheck(color) {
    const kingPos = (color === 'w') ? whiteKingPos : blackKingPos;
    const attackerColor = (color === 'w') ? 'b' : 'w';
    return isSquareAttacked(kingPos.row, kingPos.col, attackerColor);
}

function getAllLegalMovesForPiece(rFrom, cFrom) {
    const moves = [];
    const piece = board[rFrom][cFrom];
    if (!piece) return moves;

    for (let rTo = 0; rTo < 8; rTo++) {
        for (let cTo = 0; cTo < 8; cTo++) {
            if (isValidMoveBasic(rFrom, cFrom, rTo, cTo)) {
                moves.push({ row: rTo, col: cTo });
            }
        }
    }
    return moves;
}

function isValidMoveBasic(rowFrom, colFrom, rowTo, colTo) {
    const piece = board[rowFrom][colFrom];
    if (!piece) return false;

    const target = board[rowTo][colTo];
    if (target && target.toLowerCase() === 'k') return false;

    const isWhite = isWhitePiece(piece);
    if (target && (isWhitePiece(target) === isWhite)) return false;

    const pieceType = piece.toLowerCase();
    const dr = rowTo - rowFrom;
    const dc = colTo - colFrom;

    // Pawn
    if (pieceType === 'p') {
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        if (dc === 0 && dr === direction && !target) return true;
        if (dc === 0 && dr === 2 * direction && rowFrom === startRow && !target) {
            if (!board[rowFrom + direction][colFrom]) return true;
        }
        if (Math.abs(dc) === 1 && dr === direction && target) return true;
        return false;
    }

    // Rook
    if (pieceType === 'r') {
        if (rowFrom !== rowTo && colFrom !== colTo) return false;
        if (rowFrom === rowTo) {
            let step = (colTo > colFrom) ? 1 : -1;
            for (let c = colFrom + step; c !== colTo; c += step) {
                if (board[rowFrom][c]) return false;
            }
        } else {
            let step = (rowTo > rowFrom) ? 1 : -1;
            for (let r = rowFrom + step; r !== rowTo; r += step) {
                if (board[r][colFrom]) return false;
            }
        }
        return true;
    }

    // Knight
    if (pieceType === 'n') {
        if (!((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2))) return false;
        return true;
    }

    // Bishop
    if (pieceType === 'b') {
        if (Math.abs(dr) !== Math.abs(dc)) return false;
        let stepRow = (dr > 0) ? 1 : -1;
        let stepCol = (dc > 0) ? 1 : -1;
        for (let i = 1; i < Math.abs(dr); i++) {
            if (board[rowFrom + i * stepRow][colFrom + i * stepCol]) return false;
        }
        return true;
    }

    // Queen
    if (pieceType === 'q') {
        if (rowFrom === rowTo || colFrom === colTo) {
            if (rowFrom === rowTo) {
                let step = (colTo > colFrom) ? 1 : -1;
                for (let c = colFrom + step; c !== colTo; c += step) {
                    if (board[rowFrom][c]) return false;
                }
            } else {
                let step = (rowTo > rowFrom) ? 1 : -1;
                for (let r = rowFrom + step; r !== rowTo; r += step) {
                    if (board[r][colFrom]) return false;
                }
            }
            return true;
        } else if (Math.abs(dr) === Math.abs(dc)) {
            let stepRow = (dr > 0) ? 1 : -1;
            let stepCol = (dc > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(dr); i++) {
                if (board[rowFrom + i * stepRow][colFrom + i * stepCol]) return false;
            }
            return true;
        }
        return false;
    }

    // King
    if (pieceType === 'k') {
        if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;
        return false;
    }

    return false;
}

function hasAnyLegalMove(color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const isWhite = isWhitePiece(piece);
            if ((color === 'w' && !isWhite) || (color === 'b' && isWhite)) continue;

            const moves = getAllLegalMovesForPiece(r, c);
            for (const move of moves) {
                const targetPiece = board[move.row][move.col];

                // Simulate move
                board[move.row][move.col] = piece;
                board[r][c] = '';

                const oldWhitePos = { ...whiteKingPos };
                const oldBlackPos = { ...blackKingPos };

                if (piece.toLowerCase() === 'k') {
                    if (color === 'w') whiteKingPos = { row: move.row, col: move.col };
                    else blackKingPos = { row: move.row, col: move.col };
                }

                const stillInCheck = isKingInCheck(color);

                // Undo move
                board[r][c] = piece;
                board[move.row][move.col] = targetPiece;

                if (piece.toLowerCase() === 'k') {
                    if (color === 'w') whiteKingPos = oldWhitePos;
                    else blackKingPos = oldBlackPos;
                }

                if (!stillInCheck) return true;
            }
        }
    }
    return false;
}

function checkGameState() {
    updateKingPositions();

    const whiteInCheck = isKingInCheck('w');
    const blackInCheck = isKingInCheck('b');

    if (whiteInCheck && !hasAnyLegalMove('w')) {
        gameActive = false;
        winnerText.textContent = 'HITAM MENANG';
        checkmateText.textContent = 'Skakmat!';
        gameOverModal.classList.add('show');
    } else if (blackInCheck && !hasAnyLegalMove('b')) {
        gameActive = false;
        winnerText.textContent = 'PUTIH MENANG';
        checkmateText.textContent = 'Skakmat!';
        gameOverModal.classList.add('show');
    }
}

function isValidMoveWithCheck(rowFrom, colFrom, rowTo, colTo) {
    if (!gameActive) return false;

    const piece = board[rowFrom][colFrom];
    if (!piece) return false;

    const isWhite = isWhitePiece(piece);

    if (!isValidMoveBasic(rowFrom, colFrom, rowTo, colTo)) return false;

    // Simulate move
    const targetPiece = board[rowTo][colTo];

    board[rowTo][colTo] = piece;
    board[rowFrom][colFrom] = '';

    const oldWhitePos = { ...whiteKingPos };
    const oldBlackPos = { ...blackKingPos };

    if (piece.toLowerCase() === 'k') {
        if (isWhite) whiteKingPos = { row: rowTo, col: colTo };
        else blackKingPos = { row: rowTo, col: colTo };
    }

    const kingInCheck = isKingInCheck(isWhite ? 'w' : 'b');

    // Undo move
    board[rowFrom][colFrom] = piece;
    board[rowTo][colTo] = targetPiece;

    if (piece.toLowerCase() === 'k') {
        if (isWhite) whiteKingPos = oldWhitePos;
        else blackKingPos = oldBlackPos;
    }

    return !kingInCheck;
}

function isValidMove(rowFrom, colFrom, rowTo, colTo) {
    return isValidMoveWithCheck(rowFrom, colFrom, rowTo, colTo);
}

function movePiece(rowFrom, colFrom, rowTo, colTo) {
    const piece = board[rowFrom][colFrom];
    const target = board[rowTo][colTo];
    if (!piece) return false;

    if (target) {
        if (isWhitePiece(piece)) {
            capturedByWhite.push('⚫'); // Black piece captured
        } else {
            capturedByBlack.push('⚪'); // White piece captured
        }
    }

    board[rowTo][colTo] = piece;
    board[rowFrom][colFrom] = '';

    updateKingPositions();
    currentPlayer = (currentPlayer === 'w') ? 'b' : 'w';
    checkGameState();
    return true;
}

// ==================== AI COMPUTER ====================
function getBestMove(color) {
    const moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const isWhite = isWhitePiece(piece);
            if ((color === 'w' && !isWhite) || (color === 'b' && isWhite)) continue;

            for (let r2 = 0; r2 < 8; r2++) {
                for (let c2 = 0; c2 < 8; c2++) {
                    if (isValidMove(r, c, r2, c2)) {
                        // Simple evaluation: capturing gives value
                        let value = 0;
                        const target = board[r2][c2];
                        if (target) {
                            const targetType = target.toLowerCase();
                            if (targetType === 'q') value += 9;
                            else if (targetType === 'r') value += 5;
                            else if (targetType === 'b' || targetType === 'n') value += 3;
                            else if (targetType === 'p') value += 1;
                        }
                        moves.push({ fromRow: r, fromCol: c, toRow: r2, toCol: c2, value });
                    }
                }
            }
        }
    }

    if (moves.length === 0) return null;

    // Sort by value
    moves.sort((a, b) => b.value - a.value);

    if (computerDifficulty === 'PEMULA') {
        // Beginner: completely random
        return moves[Math.floor(Math.random() * moves.length)];
    } else if (computerDifficulty === 'MENENGAH') {
        // Intermediate: 70% best move, 30% random
        if (Math.random() < 0.7) {
            return moves[0];
        } else {
            return moves[Math.floor(Math.random() * moves.length)];
        }
    } else {
        // Expert: always best move
        return moves[0];
    }
}

function computerMove() {
    if (!gameActive || currentPlayer !== computerColor) return;

    const move = getBestMove(computerColor);
    if (move) {
        setTimeout(() => {
            movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
            selectedRow = -1;
            selectedCol = -1;
            renderBoard();
        }, 100);
    }
}

// ==================== RENDER BOARD ====================
function renderBoard() {
    boardEl.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 8; c++) {
            const td = document.createElement('td');
            td.className = ((r + c) % 2 === 0) ? 'light' : 'dark';

            const piece = board[r][c];
            if (piece) {
                const pieceDiv = document.createElement('div');
                pieceDiv.className = getPieceClass(piece);
                td.appendChild(pieceDiv);
            }

            if (selectedRow === r && selectedCol === c) td.classList.add('selected');

            td.dataset.row = r;
            td.dataset.col = c;
            td.addEventListener('click', onCellClick);
            tr.appendChild(td);
        }
        boardEl.appendChild(tr);
    }

    // Highlight valid moves
    if (gameActive && selectedRow !== -1 && selectedCol !== -1) {
        const piece = board[selectedRow][selectedCol];
        if (piece) {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (isValidMove(selectedRow, selectedCol, r, c)) {
                        const cell = document.querySelector(`td[data-row='${r}'][data-col='${c}']`);
                        if (cell) cell.classList.add('highlight');
                    }
                }
            }
        } else {
            selectedRow = -1;
            selectedCol = -1;
        }
    }

    // Update turn display
    turnDisplay.innerHTML = currentPlayer === 'w' ?
        '<div class="piece-icon white-turn"></div>' :
        '<div class="piece-icon black-turn"></div>';

    whiteCapturedCount.textContent = capturedByWhite.length;
    blackCapturedCount.textContent = capturedByBlack.length;
}

// ==================== EVENT HANDLERS ====================
function onCellClick(e) {
    if (!gameActive) return;
    if (gameMode === 'computer' && currentPlayer === computerColor) return;

    const row = parseInt(e.currentTarget.dataset.row);
    const col = parseInt(e.currentTarget.dataset.col);
    const piece = board[row][col];

    if (selectedRow === -1 || selectedCol === -1) {
        if (piece) {
            const isWhite = isWhitePiece(piece);
            if ((isWhite && currentPlayer === 'w') || (!isWhite && currentPlayer === 'b')) {
                selectedRow = row;
                selectedCol = col;
            }
        }
        renderBoard();
        return;
    }

    if (selectedRow === row && selectedCol === col) {
        selectedRow = -1;
        selectedCol = -1;
        renderBoard();
        return;
    }

    if (isValidMove(selectedRow, selectedCol, row, col)) {
        movePiece(selectedRow, selectedCol, row, col);
        selectedRow = -1;
        selectedCol = -1;
        renderBoard();

        if (gameMode === 'computer' && gameActive && currentPlayer === computerColor) {
            computerMove();
        }
    } else {
        if (piece) {
            const isWhite = isWhitePiece(piece);
            if ((isWhite && currentPlayer === 'w') || (!isWhite && currentPlayer === 'b')) {
                selectedRow = row;
                selectedCol = col;
            } else {
                selectedRow = -1;
                selectedCol = -1;
            }
        } else {
            selectedRow = -1;
            selectedCol = -1;
        }
        renderBoard();
    }
}

// ==================== RESET GAME ====================
function resetGameFull() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    currentPlayer = 'w';
    selectedRow = -1;
    selectedCol = -1;
    capturedByWhite = [];
    capturedByBlack = [];
    gameActive = true;
    whiteKingPos = { row: 7, col: 4 };
    blackKingPos = { row: 0, col: 4 };
    gameOverModal.classList.remove('show');
    renderBoard();
}

resetBtn.addEventListener('click', resetGameFull);
modalResetBtn.addEventListener('click', resetGameFull);

// Prevent text selection on double click
document.querySelectorAll('td').forEach(td => {
    td.addEventListener('mousedown', (e) => e.preventDefault());
});

// Initialize
updateKingPositions();
renderBoard();
