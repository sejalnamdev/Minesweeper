let cells = [];
let firstMove = true;
let totalCells = 0;
let totalMines = 0;
let remainingFlags = 0;
let uncoveredCells = 0;
let gameOver = false;


function startGame(rows, cols) {
  const messageContainer = document.getElementById("messageContainer");
  messageContainer.style.display = "none";
  const gridContainer = document.getElementById('gridContainer');
  gridContainer.innerHTML = '';
  cells = []; 
  firstMove = true;
  totalCells = 0;
  totalMines = 0;
  remainingFlags = 0;
  uncoveredCells = 0;
  gameOver = false;

  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', (event) => handleLeftClick(event, row, col));
      cell.addEventListener('contextmenu', (event) => handleRightClick(event, row, col));
      gridContainer.appendChild(cell);
      cells[row].push({
        element: cell,
        mine: false,
        uncovered: false,
        flagged: false,
        count: 0,
      });
    }
  }

  totalCells = rows * cols;
  totalMines = rows === 9 ? 10 : ( rows === 16 ? 40 : 99 ); 
  remainingFlags = totalMines;
  let placedMines = 0;
  while (placedMines < totalMines) {
    const randomRow = Math.floor(Math.random() * rows);
    const randomCol = Math.floor(Math.random() * cols);
    if (!cells[randomRow][randomCol].mine) {
      cells[randomRow][randomCol].mine = true;
      placedMines++;
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = cells[row][col];
      if (!cell.mine) {
        let mineCount = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (row + i >= 0 && row + i < cells.length && col + j >= 0 && col + j < cells[0].length) {
              mineCount += cells[row + i][col + j].mine ? 1 : 0;
            }
          }
        }
        cell.count = mineCount;
        cell.element.setAttribute('data-count', mineCount);
      }
    }
  }

  gridContainer.className = `grid-container grid-${rows}x${cols}`;
} 


function showWinMessage() {
  gameOver = true;
  const messageContainer = document.getElementById("messageContainer");
  const messageText = document.getElementById("messageText");
  messageText.className = "game-won-message-text";
  messageText.textContent = "Congratulations! You won!";
  messageContainer.style.display = "block";
}

function showFlagOverMessage() {
  const messageContainer = document.getElementById("messageContainer");
  const messageText = document.getElementById("messageText");
  messageText.className = "flags-over-message-text";
  messageText.textContent = "All available flags exhausted!";
  messageContainer.style.display = "block";
  setTimeout(function() {
    messageContainer.style.display = "none";
  }, 1000)
}

function showLostMessage() {
  gameOver = true;
  const messageContainer = document.getElementById("messageContainer");
  const messageText = document.getElementById("messageText");
  messageText.className = "game-lost-message-text";
  messageText.textContent = "Uh oh! You hit a mine!";
  messageContainer.style.display = "block";
}


function uncoverNeighbors(row, col) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (newRow >= 0 && newRow < cells.length && newCol >= 0 && newCol < cells[0].length) {
        const neighborCell = cells[newRow][newCol];
        if (!neighborCell.uncovered && !neighborCell.flagged && !neighborCell.mine) {
          neighborCell.uncovered = true;
          uncoveredCells = uncoveredCells + 1;
          neighborCell.element.classList.add('uncovered');
          if (neighborCell.count === 0) {
            uncoverNeighbors(newRow, newCol);
          } else {
            neighborCell.element.textContent = neighborCell.count;
          }
        }
      }
    }
  }
}


function handleLeftClick(event, row, col) {
  event.preventDefault();
  const cell = cells[row][col];

  if (cell.uncovered || gameOver) return;

  if (cell.flagged) {
    cell.flagged = false;
    remainingFlags = remainingFlags + 1;
    cell.element.classList.remove('flagged');
    return;
  }

  if (cell.mine && firstMove) {
    startGame(cells.length, cells[0].length);
    firstMove = false;
    handleClick(event, row, col);
    return;
  }

  if(firstMove) firstMove = false;
  cell.uncovered = true;

  if (cell.mine) {
    cell.element.classList.add('uncovered', 'clickedMine');
    cells.forEach((rowCells) => {
      rowCells.forEach((c) => {
        if (c.mine) {
          c.uncovered = true;
          c.element.classList.add('unclickedMine', 'uncovered');
        }
      });
    }); 
    showLostMessage();
  } else {
    uncoveredCells = uncoveredCells + 1;
    cell.element.classList.add('uncovered');
    cell.element.setAttribute('data-count', cell.count);

    if (cell.count > 0) {
      cell.element.textContent = cell.count;
    } else {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (row + i >= 0 && row + i < cells.length && col + j >= 0 && col + j < cells[0].length) {
            const adjacentCell = cells[row + i][col + j];
            if (!adjacentCell.mine && !adjacentCell.uncovered) {
              uncoverNeighbors(row + i, col + j);
            }
          }
        }
      }
    }
    if (uncoveredCells === (totalCells - totalMines)) showWinMessage();
  }
}


function handleRightClick(event, row, col) {
  event.preventDefault();
  const cell = cells[row][col];

  if (cell.uncovered || gameOver) return;

  if (cell.flagged) {
    remainingFlags = remainingFlags + 1;
  } else {
    if (remainingFlags === 0) {
      showFlagOverMessage();
      return;
    }
    remainingFlags = remainingFlags - 1;
  }
  cell.flagged = !cell.flagged;
  cell.element.classList.toggle('flagged', cell.flagged);
}
