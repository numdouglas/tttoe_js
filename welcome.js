let DOMAIN = window.location.hostname;
DOMAIN = DOMAIN !== "localhost" ? DOMAIN : `${DOMAIN}:8080`

export const onClickNewGame = (evt, mode) => {
	evt.preventDefault();
	console.log(mode);
	sessionStorage.setItem("player_mode", mode);
	window.location.assign(`./game`);
}