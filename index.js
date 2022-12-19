//server dependencies
const http= require("http").createServer();
const io= require("socket.io")(http, {
	cors: {origin:"*"}
});

io.on("connection", (socket)=>{
	console.log("user connected");
	socket.on("player_click",(message)=>{
		
		var args_arr=message.split(",");
		onBoardClick(args_arr[0],args_arr[1],args_arr[2]);
		if(player_mode==="1p")
		{ai_play();}
	})

});

http.listen(8080,()=>console.log("listening on port 8080"));


const board_state = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
var move;
var consts=null;
var game_over = false;
var ai_difficulty_prob = .8;
const dist_arr = [];
const animation_css_text="game_over_text .2s linear forwards,game_over_text_two .5s linear 3s forwards";
var player_mode="2p";

initialize();

function initialize(){
	
	create_distribution(ai_difficulty_prob,dist_arr);
}

function onBoardClick(pos_x, pos_y, symbol) {
    if (game_over || board_state[pos_x][pos_y] != "-") return;
	
    board_state[pos_x][pos_y] = symbol;
	console.log("sending feedback");
	io.emit("player_1_ui_feedback",`${pos_x},${pos_y},${symbol==="x"?"gold":"brown"}`);
	checkGameOver();
}

function ai_play(){
	shuffleArray(dist_arr);
    var rand_or_max = dist_arr[0];
    move = rand_or_max === 0 ? minimax() : make_random_move();
    console.log(move);
    board_state[move.x][move.y] = "o";
	io.emit("player_1_ui_feedback",`${move.x},${move.y},brown`);
	checkGameOver();
}

function checkGameOver(){	
    if (checkFullCross("x")) {
		console.log("Player one wins!");
		game_over=true;
		io.emit("finish_game",player_mode==="1p"?"You Win!":"Player 1 Wins!");
    }
    else if (checkFullCross("o")) {
        console.log("Player two wins!");
		game_over=true;
		io.emit("finish_game",player_mode==="1p"?"You Lose!":"Player 2 Wins!");
    }
    else if (isTie()) {
        console.log("Tie!");
		game_over=true;
		io.emit("finish_game","Tie!");
    }
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