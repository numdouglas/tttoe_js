var DOMAIN = window.location.hostname;
DOMAIN = DOMAIN !== "localhost" ? DOMAIN : `${DOMAIN}:8080`
//client dependencies

export const onClickNewGame = (evt, mode) => {
	evt.preventDefault();
	console.log(mode);
	// socket.emit("synchronize_empty_board", `${mode}`);
	window.location.assign(`./game?mode=${mode}`)

}