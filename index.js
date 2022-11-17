var div=null;
var is_player_one_turn=true;
var selected_color=null;
var board_state=["-","-","-","-","-","-","-","-","-"];
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


//max score assuming o's turn
function search_max(board_pos){
	//right traverse
	var r_score=0;
	for(let r=board_pos+1;r<board_pos+3;r++){
		if(board_state[r]==="-"){r_score=1;}
		else if(board_state[r]==="o"){if(r_score===2)r_score=100;else r_score=2;}
		else if(board_state[r]==="x"){r_score=0;break;}
	}
	//left traverse
	var l_score=0;
	for(let l=board_pos-1;l>board_pos-3;l--){
		if(board_state[l]==="-"){l_score=1;}
		else if(board_state[l]==="o"){if(l_score===2)l_score=100;else l_score=2;}
		else if(board_state[l]==="x"){l_score=0;break;}
	}
	//up traverse
	var u_score=0;
	for(let u=board_pos-3;u>board_pos-9;u-=3){
		if(board_state[l]==="-"){u_score=1;}
		else if(board_state[l]==="o"){if(u_score===2)u_score=100;else u_score=2;}
		else if(board_state[l]==="x"){u_score=0;break;}
	}
	//TO DO
	//down traverse
	//middle horizontal traverse
	//middle vertical traverse	
	
	return Math.max(r_score,l_score,u_score,d_score,mh_score,mv_score);
}

function maximized_dom(){
	var max_score=0;
	var max_bpos=0;
	//move through each square in board
	for(let i=0;i<board_state.length;i++){
		//for each empty/unplayed pos maximize
		if(board_state[i]==="-"){
			var pos_score=search_max(i);
			if(pos_score>max_score){
				max_score=pos_score;
				max_bpos=i;
			}
		}
	}
	return max_bpos;
}