// Importing necessary modules from the 'azle' library and 'uuid' library
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, Principal } from 'azle';
import { v4 as uuidv4 } from "uuid";

// Defining record types for different entities
type Game = Record<{
  gameId: string;
  player1: Principal;
  player2: Principal;
  stakeAmount: u64;
  winner: Principal;
  isFinished: boolean;
}>;

type ChessMove = Record<{
  gameId: string;
  player: Principal;
  move: string;
}>;

type GameResult = variant {
  Winner: Principal;
  Draw: null;
};

// Creating instances of StableBTreeMap for each entity type
const gameStorage = new StableBTreeMap<string, Game>(0, 44, 512);
const moveStorage = new StableBTreeMap<string, ChessMove>(1, 44, 512);

$update;
// Function to start a new chess game
export function startGame(player2: Principal, stakeAmount: u64): string {
  const gameId = uuidv4();
  const game = {
    gameId: gameId,
    player1: ic.caller(),
    player2: player2,
    stakeAmount: stakeAmount,
    winner: Principal.Null,
    isFinished: false
  };
  gameStorage.insert(gameId, game);
  return gameId;
}

$update;
// Function to make a move in a chess game
export function makeMove(gameId: string, move: string): string {
  const game = gameStorage.getSome(gameId);
  if (game.isFinished) {
    return "This game has already finished.";
  }
  if (game.player1 != ic.caller() && game.player2 != ic.caller()) {
    return "You are not a player in this game.";
  }
  const chessMove = {
    gameId: gameId,
    player: ic.caller(),
    move: move
  };
  moveStorage.insert(uuidv4(), chessMove);
  return "Move made successfully.";
}

$update;
// Function to end a chess game and declare the winner
export function endGame(gameId: string, result: GameResult): string {
  const game = gameStorage.getSome(gameId);
  if (game.isFinished) {
    return "This game has already finished.";
  }
  game.isFinished = true;
  if (result.Winner == Principal.Null) {
    game.winner = Principal.Null;
  } else {
    game.winner = result.Winner;
  }
  gameStorage.insert(gameId, game);
  return "Game ended successfully.";
}

$query;
// Function to get the status of a chess game
export function getGameStatus(gameId: string): Game {
  return gameStorage.getSome(gameId);
}
