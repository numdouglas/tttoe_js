import { coords_to_boardpos } from "./common_methods.js";
import { ROLE_ASSIGNMENT, UI_FEEDBACK, GAME_OVER, ANIMATION_CSS_TEXT, PLAYER_CLICK, PLAYER_MODE, CLIENT_CONNECT_EVENT } from "./constants.js";
var DOMAIN = window.location.hostname;
//window.localStorage.debug = "*";
DOMAIN = DOMAIN !== "localhost" ? DOMAIN : `${DOMAIN}:8080`
//client dependencies
const g_socket = io(`${DOMAIN}`);/*the port and http are used for purposes of local testing,
//										otherwise prod doesn't need them as traffic is proxied*/
const g_div = document.getElementById("board").children;

var g_role = "";

g_socket.on(CLIENT_CONNECT_EVENT, (socket) => {
	console.log("connect");
	g_socket.emit(PLAYER_MODE, window.location.search.search("1p"));
});

g_socket.on(ROLE_ASSIGNMENT, (msg) => {
	console.log(`assigned player ${msg}`);
	if (parseInt(msg) === 1) g_role = "x";
	else g_role = "o";
});

g_socket.on(UI_FEEDBACK, (message) => {
	const args_arr = message.split(",");
	g_div[coords_to_boardpos(parseInt(args_arr[0]), parseInt(args_arr[1]))].classList.add(args_arr[2] === "x" ? "tile--xclick" : "tile--oclick");
});

g_socket.on(GAME_OVER, (message) => {

	const msg_arr = typeof message === "string" ? message.split(",") : message;
	// console.log(typeof msg_arr);
	message = msg_arr.pop();
	const winner_symbol = msg_arr.pop();

	//console.log(message);
	const results_text = document.getElementById("results_text");
	results_text.textContent = (message === "Tie!" || message === "You Win!" || message === "Rival Wins!") ? message :
		((message === "Player 1 Wins!" && g_role === "x") || (message === "Player 2 Wins!" && g_role === "o")) ? "You Win!" : "Rival Wins!";
	results_text.style.animation = ANIMATION_CSS_TEXT;

	//mark the winning plane
	for (let x of msg_arr) {
		//console.log(`modifying div at pos ${x} of div ${g_div[x]} and winner symbol ${winner_symbol}`);
		switch (winner_symbol) {
			case "x":
				g_div[x].classList.add("tile--xcolor");
				break;
			case "o":
				g_div[x].classList.add("tile--ocolor");
				break;
		}
	}

	wait(4000).then(() => { window.location.replace("/home"); });
	//game_over = true;
});

export function onBoardClick(x_coord, y_coord) {
	g_socket.emit(PLAYER_CLICK, `${x_coord},${y_coord},${g_role}`);
}

function wait(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}