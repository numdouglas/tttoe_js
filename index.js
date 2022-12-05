var div=null;
var is_player_one_turn=true;
var selected_color=null;
var board_state=[["-","-","-"],["-","-","-"],["-","-","-"]];
var int_form_board_coords=[0,1,2,10,11,12,20,21,22];
var turn_result='-';
var move;


function onBoardClick(pos_x, pos_y){
	if(div===null)div=document.getElementById("board").children;
	
		board_state[pos_x][pos_y]="x";
	
		//selected_color="magenta";
		is_player_one_turn=true;
		move=minimax();
		console.log(move);
		board_state[move.x][move.y]="o";
	
	
	div[coords_to_boardpos(pos_x,pos_y)].style.backgroundColor="magenta";
	div[coords_to_boardpos(move.x,move.y)].style.backgroundColor="silver";
	
	if(checkFullCross('x'))console.log("Player one wins!");
	else if(checkFullCross('o'))console.log("Player two wins!");
	else if(isTie())console.log("Tie!");
}

function checkFullCross(player){
		
        for (let i = 0; i < 3; i++)
        {
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

function minimax(){
	var score=Number.MIN_VALUE;
	var move={x:0,y:0};
	
	for (let i=0;i<3;i++){
		
		for(let j=0;j<3;j++){
			if(board_state[i][j]==='-'){ 
			board_state[i][j]='o';
			var temp=max();
			//console.log(temp);
			if(temp<score){
				score=temp;
				move.x=i;
				move.y=j;
			}
			board_state[i][j]='-';
			}
		}
	}
	return move;
}

function max(){
	if(checkFullCross('x'))return 10;
	else if(checkFullCross('o'))return -10;
	else if(isTie())return 0;
	
	
	var score=Number.MIN_VALUE;
	
	for(let i=0;i<3;i++){
		for(let j=0;j<3;j++){
			if(board_state[i][j]==='-'){
				board_state[i][j]='x';
				score= Math.max(score,min());
				board_state[i][j]='-';
			}
		}
	}
	return score;
}

function min(){
	printBoard();
	if(checkFullCross('x'))return 10;
	else if(checkFullCross('o'))return -10;
	else if(isTie())return 0;
	
	
	var score=Number.MAX_VALUE;

	for(let i=0;i<3;i++){
		for(let j=0;j<3;j++){
			if(board_state[i][j]==='-'){
				board_state[i][j]='x';
				score= Math.min(score,max());
				board_state[i][j]='-';
			}
		}
	}	
	return score;
}

function isTie()
    {
        for (let i = 0; i < 3; i++)
        {
            if (board_state[i][0] == '-' || board_state[i][1] == '-' || board_state[i][2] == '-')
                return false;
        }
        return true;
    }
function printBoard()
    {
        console.log( "+-----------------+");
        for (let i = 0; i < 3; i++)
        {
            console.log( "\n|");
            for (let j = 0; j < 3; j++)
            {
                console.log(board_state[i][j] +" |");
            }
        }
        console.log("\n+-----------------+\n");
    }


function coords_to_boardpos(coordx , coordy){
	for(let i=0;i<int_form_board_coords.length;i++){
		if((10*coordx+coordy)===int_form_board_coords[i])
			return i;
	}
	return -1;
}

//console.log(printBoard());