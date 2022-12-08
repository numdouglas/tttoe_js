//server dependencies
/*const express=require("express");
const app=express();
const http=require("http");
const server=http.createServer(app);
const {Server}=require("socket.io");
const io=new Server(server);*/

var div = null;
const board_state = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
const int_form_board_coords = [0, 1, 2, 10, 11, 12, 20, 21, 22];
var move;
var game_over = false;
var ai_difficulty_prob = .8;
const dist_arr = [];


/*app.get("/",(req,res)=>{
	res.sendFile(__dirname+"/index.html");
});

io.on("connection",(socket)=>{
	console.log("a user connected");
	socket.on("disconnect",()=>{
		console.log("a user disconnected")
	});
	socket.on("text_click",(msg)=>{
		console.log(msg);
		io.emit("text_click_resp","ken");
	})
});

server.listen(3000,()=>{
	console.log("listening on 3000");
});*/


function onBoardClick(pos_x, pos_y, is_human) {
    if (game_over || (is_human&&board_state[pos_x][pos_y] != "-")) return;

    if (div === null) {
        div = document.getElementById("board").children;
        create_distribution(ai_difficulty_prob,dist_arr);
    }

    if (is_human) {
        board_state[pos_x][pos_y] = "x";
        div[coords_to_boardpos(pos_x, pos_y)].style.backgroundColor = "gold";
    }
    else {
        shuffleArray(dist_arr);
        var rand_or_max = dist_arr[0];
        move = rand_or_max === 0 ? minimax() : make_random_move();
        console.log(move);
        board_state[move.x][move.y] = "o";
        div[coords_to_boardpos(move.x, move.y)].style.backgroundColor = "rgb(110, 42, 11)";
    }

	const animation_css_text="game_over_text .3s linear forwards,game_over_text_two .5s linear 3s forwards";
	
    if (checkFullCross("x")) {
		console.log("Player one wins!");
		var results_text = document.getElementById("results_text");
        results_text.textContent = "You Win!";
		results_text.style.animation=animation_css_text;
		//results_text.style.animation="game_over_text_two 2s linear 4s forwards";
        game_over = true;
    }
    else if (checkFullCross("o")) {
        console.log("Player two wins!");
        const results_text = document.getElementById("results_text");
        results_text.textContent = "You Lose!";
		results_text.style.animation=animation_css_text;
        game_over = true;
    }
    else if (isTie()) {
        console.log("Tie!");
        const results_text = document.getElementById("results_text");
        results_text.textContent = "Tie!";
        results_text.style.animation=animation_css_text;
        game_over = true;
    }

    if (is_human) { onBoardClick(0, 0, false); }
}

function checkFullCross(player) {

    for (let i = 0; i < 3; i++) {
        // Check horizontals
        if (board_state[i][0] == player && board_state[i][1] == player && board_state[i][2] == player)
            return true;

        // Check verticals
        if (board_state[0][i] == player && board_state[1][i] == player && board_state[2][i] == player)
            return true;
    }

    // Check diagonals
    if (board_state[0][0] == player && board_state[1][1] == player && board_state[2][2] == player)
        return true;

    if (board_state[0][2] == player && board_state[1][1] == player && board_state[2][0] == player)
        return true;

    return false;
}

function minimax() {
    var score = Number.MAX_VALUE;
    var move = { x: 0, y: 0 };

    for (let i = 0; i < 3; i++) {

        for (let j = 0; j < 3; j++) {
            if (board_state[i][j] === "-") {
                board_state[i][j] = "o";
                var temp = max();
                //console.log(temp);
                if (temp < score) {
                    score = temp;
                    move.x = i;
                    move.y = j;
                }
                board_state[i][j] = "-";
            }
        }
    }
    return move;
}

function max() {
    if (checkFullCross("x")) return 10;
    else if (checkFullCross("o")) return -10;
    else if (isTie()) return 0;


    var score = Number.MIN_VALUE;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board_state[i][j] === "-") {
                board_state[i][j] = "x";
                score = Math.max(score, min());
                board_state[i][j] = "-";
            }
        }
    }
    return score;
}

function min() {
    if (checkFullCross("x")) return 10;
    else if (checkFullCross("o")) return -10;
    else if (isTie()) return 0;


    var score = Number.MAX_VALUE;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board_state[i][j] === "-") {
                board_state[i][j] = "o";
                var max_result = max();
                score = Math.min(score, max_result);
                //console.log(max_result,score);
                board_state[i][j] = "-";
            }
        }
    }
    return score;
}

function isTie() {
    for (let i = 0; i < 3; i++) {
        if (board_state[i][0] == "-" || board_state[i][1] == "-" || board_state[i][2] == "-")
            return false;
    }
    return true;
}

function printBoard() {
    var row_str = "";
    console.log("+-----------------+");
    for (let i = 0; i < 3; i++) {
        row_str += "\n|";
        for (let j = 0; j < 3; j++) {
            //console.log(board_state[i][j]);
            row_str += board_state[i][j] + " |";
        }
        console.log(row_str);
        row_str = "";
    }
    console.log("\n+-----------------+\n");
}


function coords_to_boardpos(coordx, coordy) {
    for (let i = 0; i < int_form_board_coords.length; i++) {
        if ((10 * coordx + coordy) === int_form_board_coords[i])
            return i;
    }
    return -1;
}

function make_random_move() {
    var move = { x: 0, y: 0 };

    move.x = Math.floor(Math.random() * 3);
    move.y = Math.floor(Math.random() * 3);

    if (board_state[move.x][move.y] != "-") return make_random_move();

    return move;
}


//Durstenfeld shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function create_distribution(prob, arr) {
    for (let i = 0; i < 100; i++) {
        if (i <= 100 * prob)
            arr.push(0);
        else arr.push(1);
    }
}
/*board_state[0][0]="x";
console.log(printBoard());
move=minimax();
board_state[move.x][move.y]="o";

console.log(move.x,move.y,max(),min());*/