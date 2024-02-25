import { $update, Record, StableBTreeMap, Result, Vec, Principal, nat64 } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define the record type for Game
type Game = Record<{
    gameId: string;
    player1: Principal;
    player2: Principal;
    stakeAmount: u64;
    winner: Principal;
    isFinished: boolean;
}>;

// Define the record type for ChessMove
type ChessMove = Record<{
    gameId: string;
    player: Principal;
    move: string;
}>;

// Create a StableBTreeMap instance for storing games
const gameStorage = new StableBTreeMap<string, Game>(0, 44, 1024);

// Create a StableBTreeMap instance for storing moves
const moveStorage = new StableBTreeMap<string, ChessMove>(1, 44, 1024);

// Update function to start a new chess game
$update
export function startGame(player2: Principal, stakeAmount: u64): string {
    const gameId = uuidv4();
    const game: Game = {
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

// Update function to make a move in a chess game
$update
export function makeMove(gameId: string, move: string): string {
    const game = gameStorage.getSome(gameId);
    if (game.isFinished) {
        return "This game has already finished.";
    }
    if (game.player1 != ic.caller() && game.player2 != ic.caller()) {
        return "You are not a player in this game.";
    }
    const chessMove: ChessMove = {
        gameId: gameId,
        player: ic.caller(),
        move: move
    };
    moveStorage.insert(uuidv4(), chessMove);
    return "Move made successfully.";
}

// Update function to end a chess game and declare the winner
$update
export function endGame(gameId: string, winner: Principal): string {
    const game = gameStorage.getSome(gameId);
    if (game.isFinished) {
        return "This game has already finished.";
    }
    game.isFinished = true;
    game.winner = winner;
    gameStorage.insert(gameId, game);
    return "Game ended successfully.";
}

// Query function to get the status of a chess game
export function getGameStatus(gameId: string): Game {
    return gameStorage.getSome(gameId);
}
