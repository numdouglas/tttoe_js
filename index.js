var div=null;
var is_player_one_turn=true;
var selected_color=null;
var board_state=[["-","-","-"],["-","-","-"],["-","-","-"]];
var turn_result='-';
var move;


function onBoardClick(pos_x, pos_y){
	if(div===null)div=document.getElementById("board").children;
	
		board_state[pos_x][pos_y]="x";
	
		//selected_color="magenta";
		is_player_one_turn=true;
		move=minimax();
		board_state[move.x][move.y]="o";
	
	
	div[board_pos].style.backgroundColor="magenta";
	div[move].style.backgroundColor="silver";
	
	if(checkFullCross('x'))console.log("Player one wins!");
	else if(checkFullCross('o'))console.log("Player two wins!");
	else if(isTie())console.log("Tie!");
}

function checkFullCross(player){
		
        for (let i = 0; i < 3; i++)
        {
            // Check horizontals
            if (board[i][0] == player && board[i][1] == player && board[i][2] == player)
                return true;

            // Check verticals
            if (board[0][i] == player && board[1][i] == player && board[2][i] == player)
                return true;
        }

        // Check diagonals
        if (board[0][0] == player && board[1][1] == player && board[2][2] == player)
            return true;

        if (board[0][2] == player && board[1][1] == player && board[2][0] == player)
            return true;

        return false;
}

function minimax(){
	int score=Number.MIN_VALUE;
	var move;
	
	for (let i=0;i<3;i++){
		
		for(let j=0;j<3;j++){
			if(board[i][j]==='-'){ 
			board[i][j]='o';
			var temp=max();
			if(temp<score){
				score=temp;
				move.x=i;
				move.y=j;
			}
			board[i][j]='-';
			}
		}
	}
	return move;
}

function max(){
	if(checkFullCross('x'))return 10;
	else if(checkFullCross('o'))return -10;
	else if(isTied())return 0;
	
	
	var score=Number.MIN_VALUE;
	
	for(let i=0;i<3;i++){
		for(let j=0;j<3;j++){
			if(board[i][j]==='-'){
				board[i][j]='x';
				score= Math.max(score,min());
				board[i][j]='-';
			}
		}
	}
}

function min(){
	if(checkFullCross('x'))return 10;
	else if(checkFullCross('o'))return -10;
	else if(isTied())return 0;
	
	
	var score=Number.MAX_VALUE;

	for(let i=0;i<3;i++){
		for(let j=0;j<3;j++){
			if(board[i][j]==='-'){
				board[i][j]='x';
				score= Math.min(score,max());
				board[i][j]='-';
			}
		}
	}	
}

function isTie()
    {
        for (let i = 0; i < 3; i++)
        {
            if (board[i][0] == Player::none || board[i][1] == Player::none || board[i][2] == Player::none)
                return false;
        }
        return true;
    }
