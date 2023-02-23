var DOMAIN=window.location.hostname;
DOMAIN=DOMAIN!=="localhost"?DOMAIN:`${DOMAIN}:8080`
//client dependencies
const socket=io(`${DOMAIN}`);/*the port and http are used for purposes of local testing,
										otherwise prod doesn't need them as traffic is proxied*/
									
function onClickNewGame(evt, mode){
	evt.preventDefault();
	console.log(mode);
	socket.emit("synchronize_empty_board",`${mode}`);
	window.location.assign(`./game?mode=${mode}`)
	
}