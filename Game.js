import { coords_to_boardpos } from "./common_methods.js";
import { UI_FEEDBACK, GAME_OVER } from "./constants.js";

export class Game {
    constructor(room_name, ai_difficulty_prob, logger) {
        this.room_name = room_name;
        this.ai_difficulty_prob = ai_difficulty_prob;
        this.logger = logger;
        this.board_state = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
        this.move = undefined;
        this.game_over = false;
        this.dist_arr = [];
        this.player_mode = undefined;
        this.player_number = 1;
        this.last_player = "";
    }

    onBoardClick(pos_x, pos_y, symbol, io) {
        this.logger.debug(`symbol ${symbol} clicked`);
        if (this.game_over || this.board_state[pos_x][pos_y] !== "-" || this.last_player === symbol) return;

        this.last_player = symbol;
        this.board_state[pos_x][pos_y] = symbol;
        this.logger.debug("sending feedback");
        io.to(this.room_name).emit(UI_FEEDBACK, `${pos_x},${pos_y},${symbol}`);
        this.checkGameOver(io);

        if (this.player_mode === "1p") this.ai_play(io);
    }

    ai_play(io) {
        this.shuffleArray(this.dist_arr);
        var rand_or_maxxed = this.dist_arr[0];
        this.move = rand_or_maxxed === 0 ? this.minimax() : this.make_random_move();
        this.logger.debug(this.move);
        this.board_state[this.move.x][this.move.y] = "o";
        this.last_player = "o";
        io.to(this.room_name).emit(UI_FEEDBACK, `${this.move.x},${this.move.y},o`);
        this.checkGameOver(io);
    }

    checkGameOver(io) {
        let x_win = this.checkFullCross("x");
        if (x_win.length > 0) {
            this.logger.debug("Player one wins!");
            this.game_over = true;
            x_win.push("x");
            x_win.push(this.player_mode === "1p" ? "You Win!" : "Player 1 Wins!");
            io.to(this.room_name).emit(GAME_OVER, `${x_win}`);
            this.finish_game();
        }
        else {
            let o_win = this.checkFullCross("o");
            if (o_win.length > 0) {
                this.logger.debug("Player two Wins!");
                this.game_over = true;
                o_win.push("o");
                o_win.push(this.player_mode === "1p" ? "You Lose!" : "Player 2 Wins!");
                io.to(this.room_name).emit(GAME_OVER, `${o_win}`);
                this.finish_game();
            }
            else if (this.isTie()) {
                this.logger.debug("Tie!");
                this.game_over = true;
                io.to(this.room_name).emit(GAME_OVER, ["Tie!"]);
                this.finish_game();
            }
        }
    }

    checkFullCross(player) {

        for (let i = 0; i < 3; i++) {
            // Check horizontals
            if (this.board_state[i][0] == player && this.board_state[i][1] == player && this.board_state[i][2] == player)
                return [coords_to_boardpos(i, 0), coords_to_boardpos(i, 1), coords_to_boardpos(i, 2)];

            // Check verticals
            if (this.board_state[0][i] == player && this.board_state[1][i] == player && this.board_state[2][i] == player)
                return [coords_to_boardpos(0, i), coords_to_boardpos(1, i), coords_to_boardpos(2, i)];
        }

        // Check diagonals
        if (this.board_state[0][0] == player && this.board_state[1][1] == player && this.board_state[2][2] == player)
            return [coords_to_boardpos(0, 0), coords_to_boardpos(1, 1), coords_to_boardpos(2, 2)];

        if (this.board_state[0][2] == player && this.board_state[1][1] == player && this.board_state[2][0] == player)
            return [coords_to_boardpos(0, 2), coords_to_boardpos(1, 1), coords_to_boardpos(2, 0)];

        return [];
    }

    minimax() {
        var score = Number.MAX_VALUE;
        var move = { x: 0, y: 0 };

        for (let i = 0; i < 3; i++) {

            for (let j = 0; j < 3; j++) {
                if (this.board_state[i][j] === "-") {
                    this.board_state[i][j] = "o";
                    var temp = this.max();
                    //console.log(temp);
                    if (temp < score) {
                        score = temp;
                        move.x = i;
                        move.y = j;
                    }
                    this.board_state[i][j] = "-";
                }
            }
        }
        return move;
    }

    max() {
        if (this.checkFullCross("x").length > 0) return 10;
        else if (this.checkFullCross("o").length > 0) return -10;
        else if (this.isTie()) return 0;


        var score = Number.MIN_VALUE;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board_state[i][j] === "-") {
                    this.board_state[i][j] = "x";
                    score = Math.max(score, this.min());
                    this.board_state[i][j] = "-";
                }
            }
        }
        return score;
    }

    min() {
        if (this.checkFullCross("x").length > 0) return 10;
        else if (this.checkFullCross("o").length > 0) return -10;
        else if (this.isTie()) return 0;


        var score = Number.MAX_VALUE;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board_state[i][j] === "-") {
                    this.board_state[i][j] = "o";
                    var max_result = this.max();
                    score = Math.min(score, max_result);
                    //console.log(max_result,score);
                    this.board_state[i][j] = "-";
                }
            }
        }
        return score;
    }

    isTie() {
        for (let i = 0; i < 3; i++) {
            if (this.board_state[i][0] == "-" || this.board_state[i][1] == "-" || this.board_state[i][2] == "-")
                return false;
        }
        return true;
    }

    printBoard() {
        var row_str = "";
        this.logger.debug("+-----------------+");
        for (let i = 0; i < 3; i++) {
            row_str += "\n|";
            for (let j = 0; j < 3; j++) {
                row_str += this.board_state[i][j] + " |";
            }
            this.logger.debug(row_str);
            row_str = "";
        }
        this.logger.debug("\n+-----------------+\n");
    }


    make_random_move() {
        var move = { x: 0, y: 0 };

        move.x = Math.floor(Math.random() * 3);
        move.y = Math.floor(Math.random() * 3);

        if (this.board_state[move.x][move.y] != "-") return this.make_random_move();

        return move;
    }


    finish_game() {
        this.game_over = false;
        this.player_mode = undefined;
        this.player_number = 1;
        this.last_player = "";

        this.clear_board();
    }

    clear_board() {
        for (var i = 0; i < this.board_state.length; i++) {
            this.board_state[i].fill("-");
        }
    }


    //Durstenfeld shuffle
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    create_distribution() {
        for (let i = 0; i < 100; i++) {
            if (i <= 100 * this.ai_difficulty_prob)
                this.dist_arr.push(0);
            else this.dist_arr.push(1);
        }
    }
}