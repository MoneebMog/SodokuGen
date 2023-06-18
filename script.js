document.addEventListener('DOMContentLoaded', function() {
  const numberSlider = document.getElementById('numberSlider');
  const numberLabel = document.getElementById('numberLabel');
  const generateButton = document.getElementById('generateButton');
  const checkButton = document.getElementById('checkButton');
  const boardElement = document.getElementById('board');
  const loadingElement = document.getElementById('loading');
  const countElement = document.getElementById('count');
  let numberInputs = document.querySelectorAll('.number-input');
  let currentStatusElement = document.getElementById('currentStatus'); // Get the current status element
  let selectedCell = null;

  numberSlider.addEventListener('input', updateSliderValue);
  generateButton.addEventListener('click', generateBoard);

  checkButton.addEventListener('click', function() {
    const userBoard = getUserBoard();
    const isValid = checkBoardValidity(userBoard);
    highlightCells(isValid);
    updateCurrentStatus(isValid); // Add this line to update the current status
  });


  boardElement.addEventListener('click', handleCellClick);

  function updateSliderValue() {
    const value = numberSlider.value;
    numberLabel.textContent = value;

    let remainingCount = 81;
    for (let i = 0; i < numberInputs.length; i++) {
      const input = numberInputs[i];
      if (input.value !== '' && !input.classList.contains('given')) { // Check if the input is not empty and not a given number
        remainingCount--;
      }
    }

    countElement.textContent = remainingCount;
    checkButton.disabled = remainingCount !== 0; // Enable the button when there are no remaining grids
  }

  function handleNumberInput(event) {
    const target = event.target;
    const input = parseInt(target.value);
    const isGiven = target.classList.contains('given');
  
    if (isGiven) {
      return; // Do not allow editing of given numbers
    }
  
    if (!isNaN(input) && input >= 1 && input <= 9) {
      target.value = input;
      updateRemainingCount();
    } else {
      target.value = '';
    }
    
  }

  function updateRemainingCount() {
    let remainingCount = 81;
    for (let i = 0; i < numberInputs.length; i++) {
      const input = numberInputs[i];
      if (input.value !== '' || input.classList.contains('given')) {
        remainingCount--;
      }
    }
  
    countElement.textContent = remainingCount;
    checkButton.disabled = remainingCount !== 0;
  }

  for (let i = 0; i < numberInputs.length; i++) {
    const input = numberInputs[i];
    input.addEventListener('input', handleNumberInput);
  }

  function generateBoard() {
    clearBoard();
    showLoading();
    setTimeout(() => {
      const remainingCount = parseInt(numberSlider.value);

      if (remainingCount === 0) {
        hideLoading();
        return;
      }

      const puzzleBoard = generatePuzzleBoard(remainingCount);
      renderBoard(puzzleBoard);
      hideLoading();

      countElement.textContent = remainingCount;
      updateRemainingCount();
    }, 1000);
  }

  // function please() {
  //   const userBoard = getUserBoard();
  //   const puzzleBoard = getPuzzleBoard();
  //   const isValid = compareBoards(puzzleBoard, userBoard);
  //   return isValid
  // }

  // function checkBoard() {
  //   const remainingCount = parseInt(numberSlider.value);
  //   if (remainingCount === 0) {
  //     const userBoard = getUserBoard();
  //     const puzzleBoard = getPuzzleBoard(); // Use the existing puzzle board
  //     const isValid = compareBoards(puzzleBoard, userBoard);
  //     highlightCells(isValid);
  //     updateCurrentStatus(isValid); // Add this line to update the current status
  //   }
  // }

  function getPuzzleBoard() {
    const puzzleBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
    const cells = boardElement.getElementsByClassName('cell');
  
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const row = Math.floor(i / 9);
      const col = i % 9;
      puzzleBoard[row][col] = cell.querySelector('.number-input').value !== '' ? parseInt(cell.querySelector('.number-input').value) : 0;
    }
  
    return puzzleBoard;
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

  function checkBoardValidity(board) {
    // Check rows
    for (let row = 0; row < 9; row++) {
      if (!isValidSet(board[row])) {
        return false;
      }
    }
  
    // Check columns
    for (let col = 0; col < 9; col++) {
      const column = [];
      for (let row = 0; row < 9; row++) {
        column.push(board[row][col]);
      }
      if (!isValidSet(column)) {
        return false;
      }
    }
  
    // Check 3x3 boxes
    for (let startRow = 0; startRow < 9; startRow += 3) {
      for (let startCol = 0; startCol < 9; startCol += 3) {
        const box = [];
        for (let row = startRow; row < startRow + 3; row++) {
          for (let col = startCol; col < startCol + 3; col++) {
            box.push(board[row][col]);
          }
        }
        if (!isValidSet(box)) {
          return false;
        }
      }
    }
  
    return true;
  }
  
  function isValidSet(arr) {
    const set = new Set();
    for (let i = 0; i < arr.length; i++) {
      const num = arr[i];
      if (num !== -1 && set.has(num)) {
        return false;
      }
      set.add(num);
    }
    return true;
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
        cell.innerHTML = `<input class="number-input${cellValue !== 0 ? ' given' : ''}" type="number" min="1" max="9" value="${cellValue !== 0 ? cellValue : ''}" ${cellValue !== 0 ? 'readonly' : ''}>`;
        boardElement.appendChild(cell);
      }
    }
  
    // Remove existing event listeners for number inputs
    for (let i = 0; i < numberInputs.length; i++) {
      const input = numberInputs[i];
      input.removeEventListener('input', handleNumberInput);
    }
  
    // Update event listeners for number inputs
    numberInputs = document.querySelectorAll('.number-input');
    for (let i = 0; i < numberInputs.length; i++) {
      const input = numberInputs[i];
      input.addEventListener('input', handleNumberInput);
    }
  }

  function getUserBoard() {
    const userBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
    const cells = boardElement.getElementsByClassName('cell');
  
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const row = Math.floor(i / 9);
      const col = i % 9;
  
      if (cell.classList.contains('given')) {
        userBoard[row][col] = cell.querySelector('.number-input').value !== '' ? parseInt(cell.querySelector('.number-input').value) : 0;
      } else {
        userBoard[row][col] = cell.querySelector('.number-input').value !== '' ? parseInt(cell.querySelector('.number-input').value) : -1;
      }
    }
  
    return userBoard;
  }

  function compareBoards(puzzleBoard, userBoard) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzleBoard[row][col] !== userBoard[row][col]) {
          return false;
        }
      }
    }
  
    return true;
  }

  function highlightCells(isValid) {
    const cells = boardElement.getElementsByClassName('cell');
  
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell.classList.contains('given')) {
        continue;
      }
  
      cell.classList.remove('correct');
      cell.classList.remove('incorrect');
  
      if (isValid) {
        cell.classList.add('correct');
      } else {
        cell.classList.add('incorrect');
      }
    }
  }

  function handleCellClick(event) {
    const target = event.target;
    if (target.classList.contains('cell')) {
      const selectedGrid = target;
      const cells = Array.from(boardElement.getElementsByClassName('cell'));
      const index = cells.indexOf(selectedGrid);
      const row = Math.floor(index / 9);
      const col = index % 9;
      selectedCell = { row, col };
      highlightSelectedCell();
    }
  }

  function updateCurrentStatus(isValid) {
    const statusText = isValid ? 'Correct' : 'Incorrect';
    currentStatusElement.textContent = `Current board status: ${statusText}`;
  }

  function highlightSelectedCell() {
    const cells = boardElement.getElementsByClassName('cell');

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      cell.classList.remove('selected');
    }

    if (selectedCell) {
      const { row, col } = selectedCell;
      const index = row * 9 + col;
      cells[index].classList.add('selected');
    }
  }
});
