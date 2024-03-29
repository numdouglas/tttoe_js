"use strict"
//server dependencies
require("dotenv").config();
const express=require("express");
const http=require("http");
const cors=require("cors");
const fs=require("fs");
const winston=require("winston");
const {combine,timestamp,json}=winston.format;
require("winston-daily-rotate-file");

//dailyfilerotate function
const file_rotate_transport=new winston.transports.DailyRotateFile({
	filename: "logs/tttoe_debug_%DATE%.log",
	datePattern: "YYYY-MM-DD",
	maxFiles: "14d",
	maxSize: "50m"
});

const logger=winston.createLogger({
	level:"debug",
	format: combine(timestamp(),json()),
	transports:[
		file_rotate_transport,
		new winston.transports.Console()
		/*new transports.File({
			level: "debug"
			filename: "logs/tttoe_debug.log"
	})*/
	]
});

const app = express();

const server=http.createServer(app);
/*app.use(cors({
	"origin":"*",
	"methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
	"credentials":"true",
	"allowedHeaders":"Content-Type,Authorization"
	}));*/
app.use(express.static(".",{extensions: ["html"]}));

//map index static file
app.get("/home", (req,res) => {
     fs.readFile("./index.html", function(err,data){
          res.writeHead(200, {"Content-Type": "text/html"});
          res.write(data);
          res.end();
     });
});

app.get("/game", (req,res) => {
     fs.readFile("./game.html", function(err,data){
          res.writeHead(200, {"Content-Type": "text/html"});
          res.write(data);
          res.end();
     });
});

// .listen(8080, () => console.log(`Listening on 8080`));
/*var n_static=require("node-static");
var fileServer = new n_static.Server("./");*/

/*const http= require("http").createServer(function (request, response) {
	request.addListener("end", function () {
        fileServer.serve(request, response);
    }).resume();
});*/
const SERVER_DOMAIN=process.env.DOMAIN||"localhost";

const io= require("socket.io")(server, {
	cors: {
	/*wss connection will still arrive here as http connection*/
	"origin":[`http://${SERVER_DOMAIN}`,"https://tttoe.uk","https://www.tttoe.uk"]
	/*"methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
	"credentials":"true",
	"allowedHeaders":"Content-Type,Authorization"*/
	}
});

io.on("connection", (socket)=>{
	logger.debug("user connected");
	
	socket.on("synchronize_empty_board",(msg)=>{
		if(msg==="1p")finish_game();
		else clear_board();
	});
	
	socket.on("player_mode",(msg)=>{
		logger.debug(`initializing ${msg===-1}`);
		if(player_mode===undefined){
			if(msg===-1)player_mode="2p"
			else {player_mode="1p";create_distribution(ai_difficulty_prob,dist_arr);}
		}
		
		//assign p1 and p2
		//use socket for individual role assignment rather than broadcast
			socket.emit("role_assignment",player_number);
			//prepare for next assignment
			if(player_mode==="2p"&&player_number===1)player_number=2;
			else player_number=1;
	});
	
	
	socket.on("player_click",(message)=>{
		
		var args_arr=message.split(",");
		onBoardClick(args_arr[0],args_arr[1],args_arr[2]);
	});

});

server.listen(8080,()=>logger.debug("listening on port 8080"));


const board_state = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]];
var move;
var consts=null;
var game_over = false;
var ai_difficulty_prob = .8;
const dist_arr = [];
const animation_css_text="game_over_text .2s linear forwards,game_over_text_two .5s linear 3s forwards";
var player_mode=undefined;
var player_number=1;
var last_player="";


function onBoardClick(pos_x, pos_y, symbol) {
	logger.debug(`symbol ${symbol} clicked`);
    if (game_over || board_state[pos_x][pos_y] !== "-"|| last_player===symbol) return;
	
	last_player=symbol;
    board_state[pos_x][pos_y] = symbol;
	logger.debug("sending feedback");
	io.emit("player_1_ui_feedback",`${pos_x},${pos_y},${symbol}`);
	checkGameOver();
	
	if(player_mode==="1p")ai_play();
}

function ai_play(){
	shuffleArray(dist_arr);
    var rand_or_maxxed = dist_arr[0];
    move = rand_or_maxxed === 0 ? minimax() : make_random_move();
    logger.debug(move);
    board_state[move.x][move.y] = "o";
	last_player="o";
	io.emit("player_1_ui_feedback",`${move.x},${move.y},o`);
	checkGameOver();
}

function checkGameOver(){	
    if (checkFullCross("x")) {
		logger.debug("Player one wins!");
		game_over=true;
		io.emit("finish_game",player_mode==="1p"?"You Win!":"Player 1 Wins!");
		finish_game();
    }
    else if (checkFullCross("o")) {
        logger.debug("Player two wins!");
		game_over=true;
		io.emit("finish_game",player_mode==="1p"?"You Lose!":"Player 2 Wins!");
		finish_game();
    }
    else if (isTie()) {
        logger.debug("Tie!");
		game_over=true;
		io.emit("finish_game","Tie!");
		finish_game();
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
    logger.debug("+-----------------+");
    for (let i = 0; i < 3; i++) {
        row_str += "\n|";
        for (let j = 0; j < 3; j++) {
            //console.log(board_state[i][j]);
            row_str += board_state[i][j] + " |";
        }
        logger.debug(row_str);
        row_str = "";
    }
    logger.debug("\n+-----------------+\n");
}


function make_random_move() {
    var move = { x: 0, y: 0 };

    move.x = Math.floor(Math.random() * 3);
    move.y = Math.floor(Math.random() * 3);

    if (board_state[move.x][move.y] != "-") return make_random_move();

    return move;
}


function finish_game(){
	game_over = false;
	player_mode=undefined;
	player_number=1;
	last_player="";

	clear_board();
}

function clear_board(){
	for(var i=0;i<board_state.length;i++){
		board_state[i].fill("-");
	}
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