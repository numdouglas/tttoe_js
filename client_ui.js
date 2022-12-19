var div=document.getElementById("board").children;
const animation_css_text="game_over_text .2s linear forwards,game_over_text_two .5s linear 3s forwards";
const int_form_board_coords = [0, 1, 2, 10, 11, 12, 20, 21, 22];
//client dependencies
const socket=io("ws://localhost:8080");

var last_turn="x";

socket.on(event_consts.UI_FEEDBACK,(message)=>{
	const args_arr=message.split(",");
	div[coords_to_boardpos(parseInt(args_arr[0]),parseInt(args_arr[1]))].style.backgroundColor = args_arr[2];
	last_turn=last_turn==="o"?"x":"o";
});
socket.on(event_consts.GAME_OVER, (message)=>{
	const results_text = document.getElementById("results_text");
    results_text.textContent = message;
	results_text.style.animation=animation_css_text;
    //game_over = true;
});

function onBoardClick(x_coord, y_coord){
	socket.emit("player_click",`${x_coord},${y_coord},${last_turn}`);
}

function coords_to_boardpos(coordx, coordy) {
    for (let i = 0; i < int_form_board_coords.length; i++) {
        if ((10 * coordx + coordy) === int_form_board_coords[i])
            return i;
    }
    return -1;
}