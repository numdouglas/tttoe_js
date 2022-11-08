var div=null;
var is_player_one_turn=true;
var selected_color=null;
var board_state=[];
var turn_result='-';
var num_turns=0;

function onBoardClick(board_pos){
	if(div===null)div=document.getElementById("board").children;
	
	if(is_player_one_turn){
		selected_color="silver";
		is_player_one_turn=false;
		board_state[board_pos]="x";
	}
	else{
		selected_color="magenta";
		is_player_one_turn=true;
		board_state[board_pos]="o";
	}
	
	div[board_pos].style.backgroundColor=selected_color;
	
	turn_result=checkFullCross(board_state);
	
	num_turns++;
	
	if(turn_result==='x')console.log("Player one wins!");
	else if(turn_result==='o')console.log("Player two wins!");
	else if(num_turns>=9)console.log("Tie!");
}

function checkFullCross(board){
		
		if (//first row matches
                board[0] != '-' & (
                        (board[0] === board[1] &board[0] === board[2])||
                        (board[0] === board[3] &board[0] === board[6])||
                        (board[0] === board[4] &board[0] === board[8]))) {
            return board[0];
        }
        if (board[1] != '-' &
                (board[1] === board[4] &board[1] === board[7])) {
            return board[1];
        }
        if (board[2] != '-' &(
                (board[2] === board[5] &board[2] === board[8]) ||
                        (board[2] === board[4] &board[2] === board[6]))) {
            return board[2];
        }
        //second row matches
        if (board[3] != '-' &
                (board[3] === board[4] &board[3] === board[5])) {
            return board[3];
        }
        //third row matches
        if (board[6] != '-' &
                (board[6] === board[7] &board[6] === board[8])
        ) {
            return board[6];
        }

    return '-';	
}