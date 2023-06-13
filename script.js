document.addEventListener('DOMContentLoaded', function() {
  const numberSlider = document.getElementById('numberSlider');
  const numberLabel = document.getElementById('numberLabel');
  const generateButton = document.getElementById('generateButton');
  const boardElement = document.getElementById('board');
  const loadingElement = document.getElementById('loading');

  numberSlider.addEventListener('input', updateSliderValue);
  generateButton.addEventListener('click', generateBoard);

  function updateSliderValue() {
    const value = numberSlider.value;
    numberLabel.textContent = value;
  }

  function generateBoard() {
    clearBoard();
    showLoading();
    setTimeout(() => {
      const puzzleBoard = generatePuzzleBoard(parseInt(numberSlider.value));
      renderBoard(puzzleBoard);
      hideLoading();
  
      const remainingCount = 81 - parseInt(numberSlider.value); // this only assumes that the number slider is actually giving the right amount lmao
      const countElement = document.getElementById('count');
      countElement.textContent = remainingCount;
    }, 1000);
  }

  function clearBoard() {
    boardElement.innerHTML = '';
  }

  function showLoading() {
    loadingElement.classList.remove('hidden');
  }

  function hideLoading() {
    loadingElement.classList.add('hidden');
  }

  function generatePuzzleBoard(numToRemove) {
    const puzzleBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));

    solveSudoku(puzzleBoard);
    removeRandomNumbers(puzzleBoard, numToRemove);

    return puzzleBoard;
  }

  function solveSudoku(board) {
    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
      return true;
    }

    const [row, col] = emptyCell;
    const numbers = shuffleNumbers();

    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];

      if (isValidMove(board, row, col, num)) {
        board[row][col] = num;

        if (solveSudoku(board)) {
          return true;
        }

        board[row][col] = 0;
      }
    }

    return false;
  }

  function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return [row, col];
        }
      }
    }

    return null;
  }

  function isValidMove(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxStartRow + i][boxStartCol + j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  function removeRandomNumbers(board, numToRemove) {
    const cells = [];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        cells.push({ row, col });
      }
    }

    for (let i = cells.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];

      const { row, col } = cells[i];
      const temp = board[row][col];
      board[row][col] = 0;

      if (!hasUniqueSolution(board) || countNumbers(board) < numToRemove) {
        board[row][col] = temp;
      }
    }
  }

  function hasUniqueSolution(board) {
    const copyBoard = JSON.parse(JSON.stringify(board));
    return countSolutions(copyBoard) === 1;
  }

  function countSolutions(board) {
    let solutionCount = 0;

    countSolutionsHelper(board);

    return solutionCount;

    function countSolutionsHelper(board) {
      const emptyCell = findEmptyCell(board);
      if (!emptyCell) {
        solutionCount++;
        return;
      }

      const [row, col] = emptyCell;

      for (let num = 1; num <= 9; num++) {
        if (isValidMove(board, row, col, num)) {
          board[row][col] = num;

          countSolutionsHelper(board);

          board[row][col] = 0;
        }
      }
    }
  }

  function shuffleNumbers() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    return numbers;
  }

  function countNumbers(board) {
    let count = 0;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0) {
          count++;
        }
      }
    }

    return count;
  }

  function renderBoard(board) {
    // Clear the board
    boardElement.innerHTML = '';
  
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cellValue = board[row][col];
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = cellValue !== 0 ? cellValue : '';
        boardElement.appendChild(cell);
      }
    }
  }
});
