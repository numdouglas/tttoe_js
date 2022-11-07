var div=null;
var is_player_one_turn=true;
var selected_color=null;

function showClick(board_pos){
	if(div===null)div=document.getElementById("board").children;
	
	if(is_player_one_turn){
		selected_color="silver";
		is_player_one_turn=false;
	}
	else{
		selected_color="magenta";
		is_player_one_turn=true;
	}
	
	div[board_pos].style.backgroundColor=selected_color;
}