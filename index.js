"use strict"
//server dependencies
import express from "express";
import fs from "fs";
import winston from "winston";
import { createServer } from "http";
import { Server } from "socket.io";
import { Game } from "./Game.js";
import { AtomicInteger } from "./AtomicInteger.js";
const { combine, timestamp, json } = winston.format;
import "winston-daily-rotate-file";
import { ROLE_ASSIGNMENT, PLAYER_CLICK, PLAYER_MODE, SERVER_CONNECT_EVENT, SERVER_DISCONNECT_EVENT, FORCED_DISCONNECT_EVENT } from "./constants.js";

//dailyfilerotate function
const file_rotate_transport = new winston.transports.DailyRotateFile({
    filename: "logs/tttoe_debug_%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    maxSize: "50m"
});

const logger = winston.createLogger({
    level: "debug",
    format: combine(timestamp(), json()),
    transports: [
        file_rotate_transport,
        new winston.transports.Console()
        /*new transports.File({
            level: "debug"
            filename: "logs/tttoe_debug.log"
    })*/
    ]
});

const app = express();

const server = createServer(app);

app.use(express.static(".", { extensions: ["html"] }));

//map index static file
app.get("/home", (req, res) => {
    fs.readFile("./index.html", function (err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    });
});

app.get("/game", (req, res) => {
    fs.readFile("./game.html", function (err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    });
});

const SERVER_DOMAIN = process.env.DOMAIN || "localhost";

export const io = new Server(server, {
    cors: {
        /*wss connection will still arrive here as http connection*/
        "origin": [`http://${SERVER_DOMAIN}`, "https://tttoe.uk", "https://www.tttoe.uk"]
        /*"methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        "credentials":"true",
        "allowedHeaders":"Content-Type,Authorization"*/
    }
});

let g_lobby = [];
const collator = new Intl.Collator(undefined, { numeric: true });

io.on(SERVER_CONNECT_EVENT, (socket) => {
    logger.debug("user connected");

    let game = undefined;

    socket.on(PLAYER_MODE, (mode) => {

        game = assign_to_room();
        socket.join(game.room_name);
        game.session_ids.push(socket.id);
        game.total_participants.incrementAndGet();

        if (mode === "2p") game.player_mode = "2p"
        else { game.player_mode = "1p"; game.create_distribution(); }

        //assign p1 and p2
        //use socket for individual role assignment rather than broadcast
        socket.emit(ROLE_ASSIGNMENT, game.player_number);
        //prepare for next assignment
        if (game.player_mode === "2p" && game.player_number === 1) game.player_number = 2;
        else game.player_number = 1;
    });


    socket.on(PLAYER_CLICK, (message) => {
        const args_arr = message.split(",");
        game.onBoardClick(args_arr[0], args_arr[1], args_arr[2], io);
    });

    socket.on(SERVER_DISCONNECT_EVENT, () => {
        const disconnected_game = g_lobby.find((x) => x && x.g_instance.session_ids.includes(socket.id))?.g_instance;

        if (disconnected_game) {
            io.to(disconnected_game.room_name).emit(FORCED_DISCONNECT_EVENT);
            disconnected_game.finish_game();
        }
    });
});

server.listen(8080, () => logger.debug("listening on port 8080"));


function assign_to_room() {

    let i = 0;
    let room_name = `room${i}`;

    // compact array
    g_lobby = g_lobby.filter((x) => x && x.g_instance.player_mode);
    g_lobby.sort((a, b) => collator.compare(a.r_name, b.r_name));

    // logger.debug(`lobby snapshot ${g_lobby}`);

    for (; i < g_lobby.length; i++) {

        const count = new AtomicInteger(io.sockets.adapter.rooms.get(g_lobby[i].r_name)?.size || 0);
        const game = g_lobby[i].g_instance;

        if ((count.get() === 0) || (count.get() === 1 && game.player_mode === "2p")) {
            logger.debug(`user joined ${g_lobby[i].r_name}`);
            return game;
        }
    }

    room_name = `room${i}`;
    const game = new Game(room_name, .8, logger);
    g_lobby[i] = { r_name: game.room_name, g_instance: game };
    logger.debug(`user joined ${g_lobby[i].r_name}`);
    return game;
}