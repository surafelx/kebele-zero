import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Gamepad2, ArrowLeft, Play, Star } from 'lucide-react';
import { pointsAPI } from '../services/points';
import { useAuth } from '../contexts/AuthContext';

// Extend window interface for global functions
declare global {
  interface Window {
    openKebeleModal?: (modalType: string) => void;
  }
}

// Checkers Game Component
const CheckersGameComponent: React.FC<{ onClose: () => void; gameMode: 'human' | 'computer'; user: any }> = ({ onClose, gameMode, user }) => {
   // Board representation: 0=empty, 1=human man, 2=human king, -1=AI man, -2=AI king
   const initialBoard = useMemo(() => {
     const board: number[][] = Array(8).fill(null).map(() => Array(8).fill(0));
     // Place AI pieces (top 3 rows) - AI is black, human is red
     for (let row = 0; row < 3; row++) {
       for (let col = 0; col < 8; col++) {
         if ((row + col) % 2 === 1) {
           board[row][col] = -1; // AI man
         }
       }
     }
     // Place human pieces (bottom 3 rows)
     for (let row = 5; row < 8; row++) {
       for (let col = 0; col < 8; col++) {
         if ((row + col) % 2 === 1) {
           board[row][col] = 1; // Human man
         }
       }
     }
     return board;
   }, []);

   const [board, setBoard] = useState<number[][]>(initialBoard);
   const [currentPlayer, setCurrentPlayer] = useState<'human' | 'ai'>('human'); // Human goes first (red)
   const [selectedSquare, setSelectedSquare] = useState<{row: number, col: number} | null>(null);
   const [validMoves, setValidMoves] = useState<{row: number, col: number, isCapture?: boolean}[]>([]);
   const [mustCapture, setMustCapture] = useState(false);
   const [gameOver, setGameOver] = useState(false);
   const [winner, setWinner] = useState<'human' | 'ai' | null>(null);
   const [isComputerThinking, setIsComputerThinking] = useState(false);
   const [multiJumpPiece, setMultiJumpPiece] = useState<{row: number, col: number} | null>(null);
   const [humanScore, setHumanScore] = useState(0);
   const [aiScore, setAiScore] = useState(0);

   // Generate all legal moves for current player
   const generateLegalMoves = (board: number[][], player: 'human' | 'ai') => {
     const moves: {from: {row: number, col: number}, to: {row: number, col: number}, captures: {row: number, col: number}[]}[] = [];
     const playerValue = player === 'human' ? 1 : -1;
     const opponentValue = -playerValue;

     for (let row = 0; row < 8; row++) {
       for (let col = 0; col < 8; col++) {
         const piece = board[row][col];
         if (Math.abs(piece) === playerValue || Math.abs(piece) === playerValue * 2) {
           const pieceMoves = getPieceMoves(board, row, col, piece);
           moves.push(...pieceMoves.map(move => ({from: {row, col}, ...move})));
         }
       }
     }

     return moves;
   };

   // Get moves for a specific piece
   const getPieceMoves = (board: number[][], row: number, col: number, piece: number) => {
     const moves: {to: {row: number, col: number}, captures: {row: number, col: number}[]}[] = [];
     const isKing = Math.abs(piece) === 2;
     const direction = piece > 0 ? -1 : 1; // Human moves up (negative), AI moves down (positive)
     const opponent = piece > 0 ? -1 : 1;

     // Check for captures first (mandatory)
     const captureMoves = getCaptureMoves(board, row, col, piece, isKing, direction, opponent);
     if (captureMoves.length > 0) {
       return captureMoves;
     }

     // If no captures, check normal moves
     if (!isKing) {
       // Normal man moves
       const normalMoves = [
         {row: row + direction, col: col - 1},
         {row: row + direction, col: col + 1}
       ];
       normalMoves.forEach(move => {
         if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8 && board[move.row][move.col] === 0) {
           moves.push({to: move, captures: []});
         }
       });
     } else {
       // King moves in all directions
       const kingMoves = [
         {row: row - 1, col: col - 1}, {row: row - 1, col: col + 1},
         {row: row + 1, col: col - 1}, {row: row + 1, col: col + 1}
       ];
       kingMoves.forEach(move => {
         if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8 && board[move.row][move.col] === 0) {
           moves.push({to: move, captures: []});
         }
       });
     }

     return moves;
   };

   // Get capture moves for a piece
   const getCaptureMoves = (board: number[][], row: number, col: number, piece: number, isKing: boolean, direction: number, opponent: number) => {
     const moves: {to: {row: number, col: number}, captures: {row: number, col: number}[]}[] = [];

     if (!isKing) {
       // Man capture moves
       const captureMoves = [
         {to: {row: row + direction * 2, col: col - 2}, jumped: {row: row + direction, col: col - 1}},
         {to: {row: row + direction * 2, col: col + 2}, jumped: {row: row + direction, col: col + 1}}
       ];
       captureMoves.forEach(move => {
         if (move.to.row >= 0 && move.to.row < 8 && move.to.col >= 0 && move.to.col < 8 &&
             board[move.to.row][move.to.col] === 0 &&
             board[move.jumped.row][move.jumped.col] === opponent) {
           moves.push({to: move.to, captures: [move.jumped]});
         }
       });
     } else {
       // King capture moves (all directions)
       const kingCaptures = [
         {to: {row: row - 2, col: col - 2}, jumped: {row: row - 1, col: col - 1}},
         {to: {row: row - 2, col: col + 2}, jumped: {row: row - 1, col: col + 1}},
         {to: {row: row + 2, col: col - 2}, jumped: {row: row + 1, col: col - 1}},
         {to: {row: row + 2, col: col + 2}, jumped: {row: row + 1, col: col + 1}}
       ];
       kingCaptures.forEach(move => {
         if (move.to.row >= 0 && move.to.row < 8 && move.to.col >= 0 && move.to.col < 8 &&
             board[move.to.row][move.to.col] === 0 &&
             board[move.jumped.row][move.jumped.col] === opponent) {
           moves.push({to: move.to, captures: [move.jumped]});
         }
       });
     }

     return moves;
   };

   const handleSquareClick = (row: number, col: number) => {
     if (isComputerThinking || (gameMode === 'computer' && currentPlayer === 'ai') || gameOver) return;

     if (multiJumpPiece) {
       // Must continue multi-jump
       if (validMoves.some(move => move.row === row && move.col === col)) {
         executeMove(multiJumpPiece.row, multiJumpPiece.col, row, col);
       }
       return;
     }

     if (selectedSquare) {
       // Try to move to this square
       if (validMoves.some(move => move.row === row && move.col === col)) {
         executeMove(selectedSquare.row, selectedSquare.col, row, col);
       } else {
         setSelectedSquare(null);
         setValidMoves([]);
       }
     } else {
       // Select a piece
       const piece = board[row][col];
       if ((currentPlayer === 'human' && piece > 0) || (currentPlayer === 'ai' && piece < 0)) {
         setSelectedSquare({row, col});
         const moves = getPieceMoves(board, row, col, piece).map(move => ({...move.to, isCapture: move.captures.length > 0}));
         setValidMoves(moves);
       }
     }
   };

   const executeMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
     const newBoard = board.map(row => [...row]);
     const piece = newBoard[fromRow][fromCol];

     // Calculate captures
     const captures = [];
     if (Math.abs(toRow - fromRow) === 2) {
       // Single capture
       const jumpedRow = (fromRow + toRow) / 2;
       const jumpedCol = (fromCol + toCol) / 2;
       captures.push({row: jumpedRow, col: jumpedCol});
     }

     // Remove captured pieces
     captures.forEach(capture => {
       newBoard[capture.row][capture.col] = 0;
     });

     // Move piece
     newBoard[fromRow][fromCol] = 0;
     newBoard[toRow][toCol] = piece;

     // Check for king promotion
     let promoted = false;
     if (piece === 1 && toRow === 0) {
       newBoard[toRow][toCol] = 2; // Human king
       promoted = true;
     } else if (piece === -1 && toRow === 7) {
       newBoard[toRow][toCol] = -2; // AI king
       promoted = true;
     }

     setBoard(newBoard);

     // Check for additional captures (multi-jump)
     const additionalCaptures = getCaptureMoves(newBoard, toRow, toCol, newBoard[toRow][toCol], Math.abs(newBoard[toRow][toCol]) === 2, piece > 0 ? -1 : 1, piece > 0 ? -1 : 1);
     if (additionalCaptures.length > 0 && !promoted) {
       // Multi-jump possible
       setMultiJumpPiece({row: toRow, col: toCol});
       setValidMoves(additionalCaptures.map(move => ({...move.to, isCapture: true})));
       return; // Don't switch turns
     }

     // End turn
     setSelectedSquare(null);
     setValidMoves([]);
     setMultiJumpPiece(null);

     const nextPlayer = currentPlayer === 'human' ? 'ai' : 'human';
     setCurrentPlayer(nextPlayer);

     // Check win condition after turn switch
     checkWinCondition(newBoard, currentPlayer);

     // AI turn
     if (gameMode === 'computer' && nextPlayer === 'ai' && !gameOver) {
       setTimeout(() => makeAIMove(newBoard), 1000);
     }
   };

   const makeAIMove = (currentBoard: number[][]) => {
     setIsComputerThinking(true);

     setTimeout(() => {
       // Simple AI: random move (can be upgraded to minimax)
       const legalMoves = generateLegalMoves(currentBoard, 'ai');
       if (legalMoves.length > 0) {
         const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
         executeMove(randomMove.from.row, randomMove.from.col, randomMove.to.row, randomMove.to.col);
       }

       setIsComputerThinking(false);
     }, 1000);
   };

   const checkWinCondition = async (board: number[][], playerWhoJustMoved: 'human' | 'ai') => {
     const humanPieces = board.flat().filter(piece => piece > 0).length;
     const aiPieces = board.flat().filter(piece => piece < 0).length;

     let winner: 'human' | 'ai' | null = null;

     if (humanPieces === 0) {
       setGameOver(true);
       setWinner('ai');
       setAiScore(prev => prev + 1);
       winner = 'ai';
     } else if (aiPieces === 0) {
       setGameOver(true);
       setWinner('human');
       setHumanScore(prev => prev + 1);
       winner = 'human';
     } else {
       // Check if the player who just moved created a situation where opponent has no moves
       const opponent = playerWhoJustMoved === 'human' ? 'ai' : 'human';
       const legalMoves = generateLegalMoves(board, opponent);
       if (legalMoves.length === 0) {
         setGameOver(true);
         setWinner(playerWhoJustMoved);
         if (playerWhoJustMoved === 'human') {
           setHumanScore(prev => prev + 1);
           winner = 'human';
         } else {
           setAiScore(prev => prev + 1);
           winner = 'ai';
         }
       }
     }

     // Update points if user is logged in and there's a winner
     if (winner && user && gameMode === 'computer') {
       try {
         await pointsAPI.addGameScore({
           user_id: user.id,
           game_type: 'checkers',
           score: winner === 'human' ? 10 : 0, // 10 points for win, 0 for loss
           result: winner === 'human' ? 'win' : 'loss'
         });
       } catch (error) {
         console.error('Error updating points:', error);
       }
     }
   };

   const resetGame = () => {
     setBoard(initialBoard.map(row => [...row]));
     setCurrentPlayer('human');
     setSelectedSquare(null);
     setValidMoves([]);
     setMustCapture(false);
     setGameOver(false);
     setWinner(null);
     setIsComputerThinking(false);
     setMultiJumpPiece(null);
   };

   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <h2 className="retro-title text-2xl">Checkers</h2>
         <div className="flex space-x-3">
           <button onClick={resetGame} className="retro-btn px-4 py-2">
             Reset Game
           </button>
           <button onClick={onClose} className="retro-btn-secondary px-4 py-2">
             Close
           </button>
         </div>
       </div>

       <div className="text-center">
         <div className="flex justify-center space-x-8 mb-4">
           <div className="text-center">
             <p className="retro-text text-sm text-red-600">You (Red)</p>
             <p className="retro-title text-2xl font-bold text-red-600">{humanScore}</p>
           </div>
           <div className="text-center">
             <p className="retro-text text-lg mb-2">
               Current Player: <span className={`font-bold ${currentPlayer === 'human' ? 'text-red-600' : 'text-gray-800'}`}>
                 {currentPlayer === 'human' ? 'Red (You)' : 'Black (AI)'}
                 {isComputerThinking && ' (Thinking...)'}
               </span>
             </p>
           </div>
           <div className="text-center">
             <p className="retro-text text-sm text-gray-800">AI (Black)</p>
             <p className="retro-title text-2xl font-bold text-gray-800">{aiScore}</p>
           </div>
         </div>
         {gameOver && winner && (
           <p className="retro-text text-xl font-bold text-yellow-600 mb-4">
             🎉 {winner === 'human' ? 'You Win!' : 'AI Wins!'}
           </p>
         )}
         {multiJumpPiece && (
           <p className="retro-text text-sm text-orange-600">
             Multi-jump! Continue with the same piece.
           </p>
         )}
       </div>

       <div className="flex justify-center">
         <div className="grid grid-cols-8 gap-1 border-4 border-amber-800 p-2 bg-amber-100 rounded-lg">
           {board.map((row, rowIndex) =>
             row.map((piece, colIndex) => {
               const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
               const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
               const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
               const isMultiJump = multiJumpPiece?.row === rowIndex && multiJumpPiece?.col === colIndex;

               return (
                 <div
                   key={`${rowIndex}-${colIndex}`}
                   className={`w-12 h-12 flex items-center justify-center cursor-pointer border-2 transition-all ${
                     isBlackSquare ? 'bg-amber-800' : 'bg-amber-200'
                   } ${isSelected ? 'border-yellow-400 bg-yellow-200' : 'border-amber-600'} ${
                     isValidMove ? 'border-green-400 bg-green-300' : ''
                   } ${isMultiJump ? 'border-purple-400 bg-purple-300' : ''}`}
                   onClick={() => handleSquareClick(rowIndex, colIndex)}
                 >
                   {piece !== 0 && (
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-bold ${
                       piece > 0 ? 'bg-red-600 border-red-400' : 'bg-gray-800 border-gray-600'
                     }`}>
                       {Math.abs(piece) === 2 && '♔'}
                     </div>
                   )}
                 </div>
               );
             })
           )}
         </div>
       </div>

       <div className="text-center retro-text text-sm opacity-80">
         {multiJumpPiece ? 'Continue your multi-jump!' : 'Click on your pieces to select them, then click on highlighted squares to move. Captures are mandatory!'}
       </div>
     </div>
   );
 };

// Marbles Game Component (Peg Solitaire)
const MarblesGameComponent: React.FC<{ onClose: () => void; user?: any }> = ({ onClose, user }) => {
 // Board: 0=empty, 1=marble, -1=invalid
 const initialBoard = useMemo(() => {
   const board: number[][] = Array(7).fill(null).map(() => Array(7).fill(-1));
   // Valid positions: cross shape
   for (let row = 0; row < 7; row++) {
     for (let col = 0; col < 7; col++) {
       if ((row >= 2 && row <= 4) || (col >= 2 && col <= 4)) {
         board[row][col] = 1; // Marble
       }
     }
   }
   // Center empty
   board[3][3] = 0;
   return board;
 }, []);

 const [board, setBoard] = useState<number[][]>(initialBoard);
 const [selectedSquare, setSelectedSquare] = useState<{row: number, col: number} | null>(null);
 const [validMoves, setValidMoves] = useState<{row: number, col: number}[]>([]);
 const [gameOver, setGameOver] = useState(false);
 const [winner, setWinner] = useState<boolean | null>(null); // true if won (1 marble left)

 const isValidPosition = (row: number, col: number) => {
   return (row >= 2 && row <= 4) || (col >= 2 && col <= 4);
 };

 const getValidMoves = (row: number, col: number) => {
   const moves: {row: number, col: number}[] = [];
   const directions = [
     {dr: -1, dc: 0}, {dr: 1, dc: 0}, {dr: 0, dc: -1}, {dr: 0, dc: 1}
   ];

   directions.forEach(({dr, dc}) => {
     const jumpRow = row + dr * 2;
     const jumpCol = col + dc * 2;
     const midRow = row + dr;
     const midCol = col + dc;

     if (jumpRow >= 0 && jumpRow < 7 && jumpCol >= 0 && jumpCol < 7 &&
         isValidPosition(jumpRow, jumpCol) &&
         board[jumpRow][jumpCol] === 0 &&
         board[midRow][midCol] === 1) {
       moves.push({row: jumpRow, col: jumpCol});
     }
   });

   return moves;
 };

 const handleSquareClick = async (row: number, col: number) => {
   if (gameOver) return;

   if (selectedSquare) {
     if (selectedSquare.row === row && selectedSquare.col === col) {
       // Deselect
       setSelectedSquare(null);
       setValidMoves([]);
     } else if (validMoves.some(move => move.row === row && move.col === col)) {
       // Execute move
       await executeMove(selectedSquare.row, selectedSquare.col, row, col);
     } else {
       // Select new if it's a marble
       if (board[row][col] === 1) {
         setSelectedSquare({row, col});
         setValidMoves(getValidMoves(row, col));
       } else {
         setSelectedSquare(null);
         setValidMoves([]);
       }
     }
   } else {
     // Select if marble
     if (board[row][col] === 1) {
       setSelectedSquare({row, col});
       setValidMoves(getValidMoves(row, col));
     }
   }
 };

 const executeMove = async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
   const newBoard = board.map(row => [...row]);
   const midRow = (fromRow + toRow) / 2;
   const midCol = (fromCol + toCol) / 2;

   // Move marble
   newBoard[fromRow][fromCol] = 0;
   newBoard[toRow][toCol] = 1;
   // Remove jumped marble
   newBoard[midRow][midCol] = 0;

   setBoard(newBoard);
   setSelectedSquare(null);
   setValidMoves([]);

   // Check win/lose
   const marbleCount = newBoard.flat().filter(cell => cell === 1).length;
   if (marbleCount === 1) {
     setGameOver(true);
     setWinner(true);
     // Award points for winning
     if (user) {
       pointsAPI.addGameScore({
         user_id: user.id,
         game_type: 'marbles',
         score: 10, // 10 points for winning marbles
         result: 'win'
       }).catch(error => console.error('Error updating points:', error));
     }
   } else {
     // Check if any moves left
     let hasMoves = false;
     for (let r = 0; r < 7; r++) {
       for (let c = 0; c < 7; c++) {
         if (newBoard[r][c] === 1 && getValidMoves(r, c).length > 0) {
           hasMoves = true;
           break;
         }
       }
       if (hasMoves) break;
     }
     if (!hasMoves) {
       setGameOver(true);
       setWinner(false);
       // Record loss (0 points)
       if (user) {
         pointsAPI.addGameScore({
           user_id: user.id,
           game_type: 'marbles',
           score: 0,
           result: 'loss'
         }).catch(error => console.error('Error updating points:', error));
       }
     }
   }
 };

 const resetGame = () => {
   setBoard(initialBoard.map(row => [...row]));
   setSelectedSquare(null);
   setValidMoves([]);
   setGameOver(false);
   setWinner(null);
 };

 const marbleCount = board.flat().filter(cell => cell === 1).length;

 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h2 className="retro-title text-2xl">Marbles</h2>
       <div className="flex space-x-3">
         <button onClick={resetGame} className="retro-btn px-4 py-2">
           Reset Game
         </button>
         <button onClick={onClose} className="retro-btn-secondary px-4 py-2">
           Close
         </button>
       </div>
     </div>

     <div className="text-center">
       <p className="retro-text text-lg mb-4">
         Marbles Left: <span className="font-bold text-blue-600">{marbleCount}</span>
       </p>
       {gameOver && winner !== null && (
         <p className="retro-text text-xl font-bold text-yellow-600 mb-4">
           🎉 {winner ? 'You Win! Only one marble left!' : 'Game Over! No more moves.'}
         </p>
       )}
     </div>

     <div className="flex justify-center">
       <div className="grid grid-cols-7 gap-1 border-4 border-blue-800 p-2 bg-blue-100 rounded-lg">
         {board.map((row, rowIndex) =>
           row.map((cell, colIndex) => {
             const isValid = isValidPosition(rowIndex, colIndex);
             const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
             const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);

             return (
               <div
                 key={`${rowIndex}-${colIndex}`}
                 className={`w-10 h-10 flex items-center justify-center cursor-pointer border-2 transition-all ${
                   !isValid ? 'bg-gray-300 border-gray-400' :
                   cell === 0 ? 'bg-blue-200 border-blue-400' :
                   'bg-blue-600 border-blue-500'
                 } ${isSelected ? 'border-yellow-400 bg-yellow-200' : ''} ${
                   isValidMove ? 'border-green-400 bg-green-300' : ''
                 }`}
                 onClick={() => isValid && handleSquareClick(rowIndex, colIndex)}
               >
                 {cell === 1 && (
                   <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600"></div>
                 )}
               </div>
             );
           })
         )}
       </div>
     </div>

     <div className="text-center retro-text text-sm opacity-80">
       Click on a marble to select it, then click on a highlighted empty spot to jump over and remove the marble in between. Goal: leave only one marble!
     </div>
   </div>
 );
};


interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  games_played: number;
  checkers_wins: number;
  marbles_wins: number;
  created_at: string;
  updated_at: string;
}

const KebeleGames: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(false);

  // Real high scores data - will be fetched from database
  const [highScores, setHighScores] = useState({
    checkers: [
      { name: 'ChessMaster22', score: 2850, wins: 124 },
      { name: 'QueenSlayer', score: 2780, wins: 112 },
      { name: 'DoubleJumpPro', score: 2640, wins: 98 }
    ],
    marbles: [
      { name: 'LastMarble', score: 3120, wins: 187 },
      { name: 'PegEliminator', score: 2980, wins: 165 },
      { name: 'BoardMaster', score: 2850, wins: 142 }
    ]
  });

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user) return;
    try {
      const data = await pointsAPI.getUserPoints(user.id);
      setUserPoints(data);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const games = [
    {
      id: 'checkers',
      name: 'Checkers',
      description: 'Classic Ethiopian Checkers with strategic depth and AI opponents',
      icon: '♟️',
      color: 'from-red-500 to-red-600',
      available: true
    },
    {
      id: 'marbles',
      name: 'Marbles',
      description: 'Traditional Ethiopian peg solitaire - test your puzzle-solving skills',
      icon: '⚪',
      color: 'from-blue-500 to-blue-600',
      available: true
    }
  ];

  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [selectedGameMode, setSelectedGameMode] = useState<'human' | 'computer' | null>(null);
  const [showGameModeModal, setShowGameModeModal] = useState(false);

  const startGame = (gameId: string) => {
    setCurrentGame(gameId);
    setShowGameModeModal(true);
  };

  const selectGameMode = (mode: 'human' | 'computer') => {
    setSelectedGameMode(mode);
    setShowGameModeModal(false);
  };

  const closeGame = () => {
    setCurrentGame(null);
    setSelectedGameMode(null);
    setShowGameModeModal(false);
  };

  return (
    <div className="min-h-screen retro-bg">
      {/* Modal Header */}
      <div className="bg-white border-b-4 border-black py-4 px-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl retro-title text-gray-800 uppercase tracking-tight font-bold">GAMES MODAL</h1>
            <p className="retro-text text-gray-600 uppercase tracking-wide text-sm">Play, compete, and earn points</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center border-2 border-black shadow-md">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Styled like other modal cards */}
        <div className="retro-window mb-8">
          <div className="retro-titlebar retro-titlebar-purple">
            <div className="flex items-center space-x-4">
              <Gamepad2 className="w-5 h-5 retro-icon" />
              <span className="retro-title text-sm font-bold uppercase">Play, Compete, Earn Points</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
              <div className="retro-window-dot"></div>
            </div>
          </div>
          <div className="p-6 text-center">
            <h2 className="text-xl md:text-2xl retro-title mb-3 leading-tight uppercase tracking-tight">
              Traditional Ethiopian Games
            </h2>
            <p className="text-sm retro-text max-w-2xl mx-auto leading-relaxed">
              Experience authentic Ethiopian games with modern twists! Challenge friends or AI opponents, earn points, and climb the global leaderboards. Test your strategy and skill!
            </p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {games.map((game) => (
            <div key={game.id} className="retro-window retro-hover">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-lg flex items-center justify-center text-2xl retro-icon`}>
                    {game.icon}
                  </div>
                  {game.available && (
                    <button
                      onClick={() => startGame(game.id)}
                      className="retro-btn px-3 py-1 flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 retro-icon" />
                      <span className="text-sm">Play</span>
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 retro-title mb-1">{game.name}</h3>
                <p className="text-gray-600 retro-text text-sm mb-3">{game.description}</p>
                {!game.available && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Star className="w-3 h-3" />
                    <span className="text-xs retro-text">Coming Soon</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 gap-8">
          {/* Checkers Leaderboard */}
          <div className="retro-window">
            <div className="retro-titlebar retro-titlebar-red p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center retro-icon">
                  <span className="text-2xl">♟️</span>
                </div>
                <div>
                  <h3 className="retro-title text-xl">Checkers Champions</h3>
                  <p className="retro-text text-base opacity-80">Top checkers players</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {highScores.checkers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between retro-window retro-hover p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold retro-title text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 retro-title text-sm">{player.name}</p>
                        <p className="text-xs text-gray-600 retro-text">{player.wins} wins</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 retro-title text-sm">{player.score}</p>
                      <p className="text-xs text-gray-500 retro-text">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Marbles Leaderboard */}
            <div className="retro-window">
              <div className="retro-titlebar retro-titlebar-blue p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center retro-icon">
                    <span className="text-2xl">⚪</span>
                  </div>
                  <div>
                    <h3 className="retro-title text-xl">Marbles Masters</h3>
                    <p className="retro-text text-base opacity-80">Top marbles players</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {highScores.marbles.map((player, index) => (
                    <div key={index} className="flex items-center justify-between retro-window retro-hover p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold retro-title text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 retro-title text-sm">{player.name}</p>
                          <p className="text-xs text-gray-600 retro-text">{player.wins} wins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 retro-title text-sm">{player.score}</p>
                        <p className="text-xs text-gray-500 retro-text">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
          </div>
        </div>

        {/* Instructions */}
        <div className="retro-window mt-8">
          <div className="retro-titlebar retro-titlebar-green p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center retro-icon">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div>
                <h3 className="retro-title text-xl">How to Play</h3>
                <p className="retro-text text-base opacity-80">Game instructions and tips</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 retro-title mb-2">Checkers</h4>
                <ul className="text-sm text-gray-600 retro-text space-y-1">
                  <li>• Move diagonally on dark squares</li>
                  <li>• Jump over opponent pieces to capture (mandatory)</li>
                  <li>• Multiple jumps allowed in one turn</li>
                  <li>• Reach the opposite end to become king</li>
                  <li>• Kings can move in all directions</li>
                  <li>• Capture all opponent pieces to win</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 retro-title mb-2">Marbles</h4>
                <ul className="text-sm text-gray-600 retro-text space-y-1">
                  <li>• Click on a marble to select it</li>
                  <li>• Jump over adjacent marbles to empty spots</li>
                  <li>• The jumped marble is removed from the board</li>
                  <li>• Goal: leave only one marble on the board</li>
                  <li>• Game ends if no more jumps are possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Mode Selection Modal */}
      {showGameModeModal && currentGame && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold retro-title mb-2">
                  {currentGame === 'checkers' ? '♟️ Checkers' :
                   currentGame === 'marbles' ? '⚪ Marbles' : 'Game'}
                </h3>
                <p className="retro-text text-gray-600">Choose your opponent</p>
              </div>

              <div className="space-y-4">
                {currentGame !== 'pool' && currentGame !== 'marbles' && (
                  <button
                    onClick={() => selectGameMode('human')}
                    className="w-full retro-btn py-4 px-6 flex items-center justify-center space-x-3"
                  >
                    <span className="text-2xl">👥</span>
                    <div className="text-left">
                      <div className="font-bold">vs Human</div>
                      <div className="text-sm opacity-80">Play against another player</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => selectGameMode('computer')}
                  className="w-full retro-btn py-4 px-6 flex items-center justify-center space-x-3"
                >
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <div className="font-bold">{currentGame === 'pool' ? 'Play Pool' : 'vs Computer'}</div>
                    <div className="text-sm opacity-80">
                      {currentGame === 'pool' ? 'Challenge the AI in 9-Ball Pool' : 'Challenge the AI opponent'}
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowGameModeModal(false)}
                  className="retro-btn-secondary px-6 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {currentGame && selectedGameMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-6">
              {currentGame === 'checkers' && <CheckersGameComponent onClose={closeGame} gameMode={selectedGameMode} user={user} />}
              {currentGame === 'marbles' && <MarblesGameComponent onClose={closeGame} user={user} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KebeleGames;