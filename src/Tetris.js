import React, { useState, useEffect, useCallback } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TETROMINOS = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]]
];

const Tetris = () => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateNewPiece = useCallback(() => {
    const randomPiece = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    const newPosition = { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(randomPiece[0].length / 2), y: 0 };
    
    if (!canMove(randomPiece, newPosition.x, newPosition.y)) {
      setGameOver(true);
    } else {
      setCurrentPiece(randomPiece);
      setPosition(newPosition);
    }
  }, []);
  
  const moveDown = useCallback(() => {
    if (currentPiece && !gameOver) {
      if (canMove(currentPiece, position.x, position.y + 1)) {
        setPosition(prev => ({ ...prev, y: prev.y + 1 }));
      } else {
        placePiece();
        if (!gameOver) {  // 只有在游戏没有结束时才生成新的方块
      generateNewPiece();
    }
    }
    }
  }, [currentPiece, position, gameOver]);

  const moveLeft = useCallback(() => {
    if (currentPiece && canMove(currentPiece, position.x - 1, position.y) && !gameOver) {
      setPosition(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentPiece, position, gameOver]);

  const moveRight = useCallback(() => {
    if (currentPiece && canMove(currentPiece, position.x + 1, position.y) && !gameOver) {
      setPosition(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentPiece, position, gameOver]);

  const rotate = useCallback(() => {
    if (currentPiece && !gameOver) {
      const rotatedPiece = currentPiece[0].map((_, index) =>
        currentPiece.map(row => row[index]).reverse()
  );
      if (canMove(rotatedPiece, position.x, position.y)) {
        setCurrentPiece(rotatedPiece);
      }
    }
  }, [currentPiece, position, gameOver]);

  const canMove = (piece, x, y) => {
    for (let i = 0; i < piece.length; i++) {
      for (let j = 0; j < piece[i].length; j++) {
        if (piece[i][j]) {
          const newX = x + j;
          const newY = y + i;
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
};

  const placePiece = () => {
    const newBoard = board.map(row => [...row]);
    let reachedTop = false;
    for (let i = 0; i < currentPiece.length; i++) {
      for (let j = 0; j < currentPiece[i].length; j++) {
        if (currentPiece[i][j]) {
          const newY = position.y + i;
          const newX = position.x + j;
          newBoard[newY][newX] = 1;
          if (newY === 0) {
            reachedTop = true;
        }
      }
    }
    }
    setBoard(newBoard);
    if (reachedTop) {
      setGameOver(true);
    } else {
    clearLines(newBoard);
    }
  };

  const clearLines = (board) => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    const fillerRows = Array(clearedLines).fill().map(() => Array(BOARD_WIDTH).fill(0));
    setBoard([...fillerRows, ...newBoard]);
    setScore(prevScore => prevScore + clearedLines);
  };

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      generateNewPiece();
    }
    const intervalId = setInterval(moveDown, 1000);
    return () => clearInterval(intervalId);
  }, [currentPiece, generateNewPiece, moveDown, gameOver]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!gameOver) {
        switch (event.key) {
          case 'ArrowLeft':
            moveLeft();
            break;
          case 'ArrowRight':
            moveRight();
            break;
          case 'ArrowDown':
            moveDown();
            break;
          case 'ArrowUp':
            rotate();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [moveLeft, moveRight, moveDown, rotate, gameOver]);

  const renderCell = (i, j) => {
    if (
      currentPiece &&
      i >= position.y &&
      i < position.y + currentPiece.length &&
      j >= position.x &&
      j < position.x + currentPiece[0].length
    ) {
      const pieceI = i - position.y;
      const pieceJ = j - position.x;
      if (currentPiece[pieceI][pieceJ]) {
        return true;
      }
    }
    return board[i][j];
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ marginRight: '20px', fontSize: '24px' }}>
        Score: {score}
      </div>
      <div style={{ display: 'inline-block', border: '1px solid black', position: 'relative' }}>
        {board.map((row, i) => (
          <div key={i} style={{ display: 'flex' }}>
            {row.map((_, j) => (
              <div
                key={`${i}-${j}`}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: renderCell(i, j) ? 'black' : 'white',
                  border: '1px solid gray'
                }}
              />
            ))}
          </div>
        ))}
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '24px'
          }}>
            <div>Game Over</div>
            <div style={{ fontSize: '36px', marginTop: '20px' }}>Score: {score}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tetris;
