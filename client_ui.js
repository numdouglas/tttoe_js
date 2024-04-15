var DOMAIN = window.location.hostname;
//window.localStorage.debug = "*";
DOMAIN = DOMAIN !== "localhost" ? DOMAIN : `${DOMAIN}:8080`
//client dependencies
const g_socket = io(`${DOMAIN}`);/*the port and http are used for purposes of local testing,
//										otherwise prod doesn't need them as traffic is proxied*/
const g_div = document.getElementById("board").children;
const g_animation_css_text = "game_over_text .2s linear forwards,game_over_text_two .5s linear 3s forwards";
const g_int_form_board_coords = [0, 1, 2, 10, 11, 12, 20, 21, 22];

var g_role = "";

g_socket.emit("join", "room0");

g_socket.on(event_consts.CONNECT, (socket) => {
	console.log("connect");
	g_socket.emit("player_mode", window.location.search.search("1p"));
});

g_socket.on(event_consts.ROLE_ASSIGNMENT, (msg) => {
	console.log(`assigned player ${msg}`);
	if (parseInt(msg) === 1) g_role = "x";
	else g_role = "o";
});

g_socket.on(event_consts.UI_FEEDBACK, (message) => {
	const args_arr = message.split(",");
	//div[coords_to_boardpos(parseInt(args_arr[0]),parseInt(args_arr[1]))].style.backgroundColor = args_arr[2];
	g_div[coords_to_boardpos(parseInt(args_arr[0]), parseInt(args_arr[1]))].classList.add(args_arr[2] === "x" ? "tile--xclick" : "tile--oclick");
	//last_turn=last_turn==="o"?"x":"o";
	//console.log(`ui feedback ${message}`);
});

g_socket.on(event_consts.GAME_OVER, (message) => {
	//console.log("GAME OVER");

	console.log(message);

	const msg_arr = message.split(",");
	message = msg_arr.pop();
	const winner_symbol = msg_arr.pop();

	//console.log(message);
	const results_text = document.getElementById("results_text");
	results_text.textContent = (message === "Tie!" || message === "You Win!" || message === "Opponent Wins!") ? message :
		((message === "Player 1 Wins!" && g_role === "x") || (message === "Player 2 Wins!" && g_role === "o")) ? "You Win!" : "Opponent Wins!";
	results_text.style.animation = g_animation_css_text;

	//mark the winning plane
	for (let x of msg_arr) {
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

function onBoardClick(x_coord, y_coord) {
	g_socket.emit("player_click", `${x_coord},${y_coord},${g_role}`);
}

function coords_to_boardpos(coordx, coordy) {
	for (let i = 0; i < g_int_form_board_coords.length; i++) {
		if ((10 * coordx + coordy) === g_int_form_board_coords[i])
			return i;
	}
	return -1;
}

function wait(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}