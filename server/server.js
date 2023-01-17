//deno-lint-ignore-file
// Require some files
const fs = require("fs");
const https = require("https");
const sio = require("socket.io");
const express = require("express");
const flaps = require("./plugins/flaps");
const { debuglog } = require("util");
const { strict } = require("assert");

// HTTPS certificates
const options = {
    key: fs.readFileSync(
        "C:/Certbot/live/konalt.us.to-0002/privkey.pem",
        "utf8"
    ),
    cert: fs.readFileSync(
        "C:/Certbot/live/konalt.us.to-0002/fullchain.pem",
        "utf8"
    ),
};

// Actually make the server
const app = express();
const server = https.createServer(options, app);
const io = sio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    pingInterval: 5000,
});

flaps.init(io);

server.listen(29401);
console.log(`Server listening on port 29401`);

var gameState = {
    players: {},
    map: {},
    curTime: Date.now(),
    hasMapData: true,
    moveSpeed: 5,
    bullets: [],
    bulletSpeed: 3.00001,
    particles: [],
    grenades: [],
    rockets: [],
    smokeParticles: [],
    flames: [],
    gameTimer: 5 * 60 * 1000,
    roundStartTime: Date.now(),
    lightsOn: true,
    russkiyPlane: {
        isActive: false,
        activatedTime: Date.now(),
        timeActive: 0,
        x: 1633 + 100,
        y: 919 + 100,
        dx: 2 * 4,
        dy: -3 * 4,
    },
    weaponData: [
        {
            name: "Revolver",
            dmg: 50,
            fireRate: 60000 / 250,
            isAutomatic: false,
            draw: (ply, _ctx, cameraOffsets) => {
                roundRect(
                    ply.x + 20,
                    ply.y - 5,
                    53,
                    10,
                    5,
                    "gray",
                    usableContext
                );
                strokeRoundRect(
                    ply.x + 20,
                    ply.y - 5,
                    53,
                    10,
                    5,
                    4,
                    "black",
                    usableContext
                );
            },
            hands: [
                [40, 10],
                [900, 900, true],
            ],
            clipSize: 6,
            reloadTime: 1800,
            spread: 15,
            bulletCount: 1,
            moveMult: 1,
            barrelLength: 43,
            id: "revolver",
        },
        {
            name: "Laser Pistol",
            dmg: 10,
            fireRate: 60000 / 400,
            isAutomatic: false,
            draw: (ply, _ctx, cameraOffsets) => {
                roundRect(
                    ply.x + 20,
                    ply.y - 5,
                    53,
                    10,
                    5,
                    "#330000",
                    usableContext
                );
                strokeRoundRect(
                    ply.x + 20,
                    ply.y - 5,
                    53,
                    10,
                    5,
                    4,
                    "black",
                    usableContext
                );
            },
            hands: [
                [40, 10],
                [900, 900, true],
            ],
            clipSize: 12,
            reloadTime: 1800,
            spread: 15,
            bulletCount: 1,
            moveMult: 1,
            barrelLength: 43,
            id: "laser",
        },
        {
            name: "M16 Rifle",
            dmg: 10,
            fireRate: 60000 / 1200,
            isAutomatic: true,
            draw: (ply, _ctx, cameraOffsets) => {
                roundRect(
                    ply.x + 30,
                    ply.y - 5,
                    70,
                    10,
                    5,
                    "black",
                    usableContext
                );
            },
            clipSize: 30,
            reloadTime: 1000,
            spread: 1,
            bulletCount: 1,
            moveMult: 1,
            hands: [
                [40, -5],
                [80, 5],
            ],
            barrelLength: 70,
            id: "ar",
        },
        {
            name: "Shotgun",
            dmg: 12.5,
            fireRate: 100,
            isAutomatic: false,
            draw: (ply, _ctx, cameraOffsets) => {
                roundRect(
                    ply.x + 30,
                    ply.y - 5,
                    70,
                    10,
                    5,
                    "brown",
                    usableContext
                );
                strokeRoundRect(
                    ply.x + 30,
                    ply.y - 5,
                    70,
                    10,
                    5,
                    2,
                    "black",
                    usableContext
                );
            },
            clipSize: 2,
            reloadTime: 1000,
            spread: 40,
            bulletCount: 8,
            moveMult: 1,
            hands: [
                [40, -5],
                [80, 5],
            ],
            barrelLength: 70,
            id: "shotgun",
        },
        {
            name: "Sniper Rifle",
            dmg: 199,
            fireRate: 60000 / 1200,
            isAutomatic: false,
            draw: (ply, _ctx, cameraOffsets) => {
                roundRect(
                    ply.x + 30,
                    ply.y - 13 / 2,
                    80,
                    13,
                    13 / 2,
                    "#000033",
                    usableContext
                );
            },
            clipSize: 1,
            reloadTime: 1200,
            spread: 0,
            bulletCount: 1,
            moveMult: 1,
            bulletSpeedMult: 2,
            barrelLength: 80,
            id: "shotgun",
        },
        {
            name: "Flamethrower",
            dmg: 0,
            fireRate: 80,
            isAutomatic: true,
            draw: (ply, _ctx, cameraOffsets) => {
                roundRect(
                    ply.x + 30 + 5,
                    ply.y - 30 / 2,
                    45,
                    30,
                    5,
                    "#c94238",
                    usableContext
                );
                strokeRoundRect(
                    ply.x + 30 + 5,
                    ply.y - 30 / 2,
                    45,
                    30,
                    5,
                    4,
                    "black",
                    usableContext
                );
                drawRect(
                    ply.x + 30,
                    ply.y - 7 / 2,
                    70,
                    7,
                    "#e3e3e3",
                    usableContext
                );
                drawStrokedRect(
                    ply.x + 30,
                    ply.y - 7 / 2,
                    70,
                    7,
                    "black",
                    4,
                    usableContext
                );
                drawRect(
                    ply.x + 30 + 70 - 5,
                    ply.y - 15 / 2,
                    20,
                    15,
                    "#222",
                    usableContext
                );
                drawStrokedRect(
                    ply.x + 30 + 70 - 5,
                    ply.y - 15 / 2,
                    20,
                    15,
                    "black",
                    4,
                    usableContext
                );
            },
            hands: [
                [40, 17, true],
                [80, -10],
            ],
            clipSize: 200,
            reloadTime: 1000,
            spread: 4,
            bulletCount: 1,
            moveMult: 1,
            bulletSpeedMult: 0,
            barrelLength: 70 + 20 + 2,
            isFlamethrower: true,
            id: "flamethrower",
        },
        {
            name: "__melee_fists",
            dmg: 20,
            fireRate: 180,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
            reloadTime: 0,
            spread: 0,
            bulletCount: 1,
            moveMult: 1.5,
            bulletSpeedMult: 0,
            hands: [
                [25, -20],
                [25, 20],
            ],
            barrelLength: 0,
            id: "fists",
        },
        {
            name: "__melee_Dual Screwdrivers",
            dmg: 20,
            fireRate: 100,
            isAutomatic: false,
            draw: (ply, selHand, xOffset) => {
                function _drawSai(yOff, xOffset) {
                    drawLine(
                        ply.x + 30 + 5 + xOffset,
                        ply.y - yOff,
                        ply.x + 30 + 5 + 15 + xOffset,
                        ply.y - yOff,
                        "#111122",
                        8,
                        usableContext
                    );
                    drawLine(
                        ply.x + 30 + 5 + 15 + xOffset,
                        ply.y - yOff,
                        ply.x + 30 + 5 + 15 + 30 + xOffset,
                        ply.y - yOff,
                        "#eeeeee",
                        5,
                        usableContext
                    );
                }
                if (selHand == 0) {
                    _drawSai(20, xOffset);
                    _drawSai(-20, 0);
                } else {
                    _drawSai(20, 0);
                    _drawSai(-20, xOffset);
                }
            },
            clipSize: 0,
            reloadTime: 0,
            spread: 0,
            bulletCount: 1,
            moveMult: 1.1,
            bulletSpeedMult: 0,
            hands: [
                [25, -20],
                [25, 20],
            ],
            barrelLength: 0,
            id: "screwdrivers",
        },
        {
            name: "Frag Grenade",
            dmg: 10,
            draw: () => {},
            isSmokeGrenade: false,
            id: "grenade_frag",
        },
        {
            name: "Smoke Grenade",
            dmg: 0,
            draw: () => {},
            isSmokeGrenade: true,
            id: "grenade_smoke",
        },
    ],
};
gameState.weaponData = gameState.weaponData.map((wep) => {
    wep.draw = wep.draw.toString();
    return wep;
});

var BulletType = {
    Glock17: 0,
    AssaultRifle: 1,
    Shotgun: 2,
    SamSword: 3,
};

var botIndex = 0;

function getMaxWepClips() {
    return gameState.weaponData.map((w) => w.clipSize);
}

function spawnBot() {
    var botname = "Bot" + (botIndex++).toString().padStart(3, "0");
    gameState.players[botname] = {
        x: 9999,
        y: 9999,
        a: 0,
        hp: 100,
        u: false,
        d: false,
        l: false,
        r: false,
        spr: false,
        isDead: false,
        weapon: botSettings.weapon,
        canFire: true,
        wepClips: getMaxWepClips(),
        isReloading: false,
        reloadTime: 0,
        startedReloadingTime: Date.now(),
        respawnTimer: 0,
        deathTime: Date.now(),
        chosenPrimary: botSettings.weapon,
        isSelectingPrimary: false,
        canGrenade: true,
        hasWater: true,
        loadout: [0, botSettings.weapon, 6, 8],
    };
    initScoreboardData(botname);
    io.emit("recieve_message", {
        author: "___NONAME___",
        content: botname + " has joined the game",
    });
}

function encodePlayerData(plyd) {
    var final = "";
    Object.entries(plyd).forEach((ply, i) => {
        if (!ply[1]) return;
        final += `${i == 0 ? "" : "\n"}${ply[0]}:${ply[1].x}:${ply[1].y}:${
            ply[1].a
        }:${ply[1].hp}:${ply[1].u ? "1" : "0"}:${ply[1].d ? "1" : "0"}:${
            ply[1].l ? "1" : "0"
        }:${ply[1].r ? "1" : "0"}:${ply[1].spr ? "1" : "0"}:${
            ply[1].isDead ? "1" : "0"
        }:${ply[1].weapon}:${ply[1].canFire ? "1" : "0"}:${ply[1].wepClips.join(
            ","
        )}:${ply[1].isReloading ? "1" : "0"}:${ply[1].reloadTime}:${
            ply[1].startedReloadingTime
        }:${ply[1].respawnTimer}:${ply[1].deathTime}:${ply[1].chosenPrimary}:${
            ply[1].isSelectingPrimary ? "1" : "0"
        }:${ply[1].canGrenade ? "1" : "0"}:${ply[1].hasWater ? "1" : "0"}:${
            ply[1].lastAttack
        }:${ply[1].timeSinceLastAttack}:${JSON.stringify(ply[1].loadout)}:${
            ply[1].lastHand
        }:${ply[1].isMouseDown ? "1" : "0"}:${ply[1].lastKiller}`;
    });
    return final;
}

function flamePlayerCheck(flame) {
    Object.entries(gameState.players).forEach((plydata) => {
        var plyname = plydata[0];
        var ply = plydata[1];

        if (plyname == flame.owner) return;

        if (distance(flame.x, flame.y, ply.x, ply.y) < 90) {
            dealPlyDamage(
                plydata,
                ply.loadout[1] == 4 ? 0.5 : 1,
                [9999, 9999],
                flame.owner
            );
        }
    });
}

function initScoreboardData(id) {
    if (!scoreboardData.highestKillstreak[id]) {
        scoreboardData.highestKillstreak[id] = 0;
    }
    if (!scoreboardData.totalDeaths[id]) {
        scoreboardData.totalDeaths[id] = 0;
    }
    if (!scoreboardData.totalKills[id]) {
        scoreboardData.totalKills[id] = 0;
    }
    if (!scoreboardData.totalScore[id]) {
        scoreboardData.totalScore[id] = 0;
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

var dmgReductionMin = 0.4;

function getDamageReduction(plyname) {
    var kills = killCounts[plyname];
    if (!kills) kills = 0;
    var d = 1 - Math.floor(kills / 5) * 0.1;
    if (d < dmgReductionMin) d = dmgReductionMin;
    return d;
}

function dealPlyDamage(ply, dmg, hitLoc, notify) {
    /* console.log(
        "Dealing " +
        dmg +
        " damage to player " +
        (usernames[ply[0]] ? usernames[ply[0]] : ply[0])
    ); */
    ply[1].hp -= dmg;
    if (ply[1].hp < 1) {
        gameState.particles.push({
            x: hitLoc[0],
            y: hitLoc[1],
            col: "255,0,0",
            scaleRate: 1.05,
            creationTime: Date.now(),
            life: 0,
            ttl: 1000,
            r: 30,
        });
        ply[1].isDead = true;
        ply[1].x = 9999;
        ply[1].y = 9999;
        ply[1].hp = 0;
        ply[1].hasWater = true;
        ply[1].respawnTimer = 5;
        ply[1].deathTime = Date.now();
        ply[1].lastKiller = notify;
        console.log(
            `${usernames[notify] ? usernames[notify] : notify} killed ${
                usernames[ply[0]] ? usernames[ply[0]] : ply[0]
            }`
        );
        if (!killCounts[ply[0]]) {
            killCounts[ply[0]] = 0;
        }
        if (killCounts[ply[0]] > 5) {
            io.emit("killstreak_end", [
                usernames[notify] ? usernames[notify] : notify,
                usernames[ply[0]] ? usernames[ply[0]] : ply[0],
                killCounts[ply[0]],
            ]);
            console.log(
                usernames[ply[0]]
                    ? usernames[ply[0]]
                    : ply[0] + " is no longer on a killstreak"
            );
        }
        killCounts[ply[0]] = 0;
        if (!killCounts[notify]) {
            killCounts[notify] = 0;
        }
        initScoreboardData(notify);
        initScoreboardData(ply[0]);
        killCounts[notify]++;
        if (scoreboardData.highestKillstreak[notify] < killCounts[notify]) {
            scoreboardData.highestKillstreak[notify] = parseInt(
                killCounts[notify].toString()
            );
        }
        scoreboardData.totalDeaths[ply[0]]++;
        scoreboardData.totalScore[ply[0]]--;
        scoreboardData.totalKills[notify]++;
        scoreboardData.totalScore[notify]++;
        io.emit("scoreboard", scoreboardData);
        var n = usernames[notify] ? usernames[notify] : notify;
        switch (killCounts[notify]) {
            case 5:
                console.log(n + " is on a KILLING SPREE! [5]");
                if (
                    !(notify.startsWith("Bot") && botSettings.show_ks) ||
                    !notify.startsWith("Bot")
                )
                    io.emit("killstreak", [
                        n,
                        "is on a KILLING SPREE!",
                        killCounts[notify],
                    ]);
                break;
            case 10:
                console.log(n + " is UNSTOPPABLE! [10]");
                if (
                    (notify.startsWith("Bot") && botSettings.show_ks) ||
                    !notify.startsWith("Bot")
                )
                    io.emit("killstreak", [
                        n,
                        "is UNSTOPPABLE!",
                        killCounts[notify],
                    ]);
                break;
            case 15:
                console.log(n + " is on a RAMPAGE! [15]");
                if (
                    (notify.startsWith("Bot") && botSettings.show_ks) ||
                    !notify.startsWith("Bot")
                )
                    io.emit("killstreak", [
                        n,
                        "is on a RAMPAGE!",
                        killCounts[notify],
                    ]);
                break;
            case 20:
                console.log(n + " is GODLIKE! [20]");
                if (
                    (notify.startsWith("Bot") && botSettings.show_ks) ||
                    !notify.startsWith("Bot")
                )
                    io.emit("killstreak", [
                        n,
                        "is GODLIKE!",
                        killCounts[notify],
                    ]);
                break;
            case 25:
                console.log(n + " is PSYCHOPATHIC! [25]");
                if (
                    (notify.startsWith("Bot") && botSettings.show_ks) ||
                    !notify.startsWith("Bot")
                )
                    io.emit("killstreak", [
                        n,
                        "is PSYCHOPATHIC!",
                        killCounts[notify],
                    ]);
                break;

            default:
                break;
        }
        if (gameState.players[notify]) {
            gameState.players[notify].hp += 30;
            if (gameState.players[notify].hp > 200)
                gameState.players[notify].hp = 200;
        }
    } else {
        gameState.particles.push({
            x: hitLoc[0],
            y: hitLoc[1],
            col: "255,0,0",
            creationTime: Date.now(),
            scaleRate: 0,
            life: 0,
            ttl: 1000,
            r: 5,
        });
    }
}

function bulletPlayerCheck(bullet, melee = false) {
    var r = false;
    Object.entries(gameState.players).forEach((ply) => {
        if (
            (melee || !opt.bulletSelfDamage ? ply[0] == bullet.owner : false) ||
            !ply[1] ||
            ply[1].isDead ||
            ply[1].isSelectingPrimary ||
            r
        )
            return;
        if (distance(ply[1].x, ply[1].y, bullet.x, bullet.y) < 30) {
            var notify = `${bullet.owner}`;
            if (bullet.owner.startsWith("GRENADE_")) {
                notify = notify.substring("GRENADE_".length);
            }
            if (io.sockets.sockets.get(notify))
                io.sockets.sockets.get(notify).emit("sound", "hitmark");
            gameState.bullets = gameState.bullets.filter((b) => {
                return b != bullet;
            });
            var isSafe = true;
            var len = 0;
            var sx = bullet.x;
            var sy = bullet.y;
            while (isSafe) {
                if (len > 100) {
                    isSafe = false;
                    console.log("[warning] bullet was never safe?");
                    sx = bullet.x;
                    sy = bullet.y;
                } else {
                    sx -= bullet.dx * 0.5;
                    sy -= bullet.dy * 0.5;
                    isSafe = distance(ply[1].x, ply[1].y, sx, sy) < 30;
                    len++;
                }
            }

            r = ply;
            if (melee) return;
            dealPlyDamage(
                ply,
                getWeaponData(bullet.bultype).dmg *
                    getDamageReduction(ply[0]) *
                    1,
                [sx, sy],
                notify
            );
        }
    });
    return r;
}

var gameIsEnding = false;

function tick() {
    // Hibernation
    /* if (Object.keys(gameState.players).filter((k) => !k.startsWith("Bot")))
        return; */
    gameState.gameTimer =
        5 * 60 * 1000 - (Date.now() - gameState.roundStartTime);
    io.emit("timer", gameState.gameTimer);
    if (gameState.gameTimer <= 0 && !gameIsEnding) {
        console.log("Game over!");
        gameIsEnding = true;
        io.emit("scoreboard", scoreboardData);
        io.emit("game_end");
        io.emit("chat_clear");
        setTimeout(() => {
            mapIndex++;
            if (mapIndex == maplist.length) mapIndex = 0;
            gameState.map = loadMap(maplist[mapIndex]);
            navData.waypoints = auto
                ? loadWaypointsAuto(gameState.map)
                : loadWaypoints(maplist[mapIndex]);
            io.emit("nav_data", navData);
            scoreboardData = {
                highestKillstreak: {},
                totalDeaths: {},
                totalScore: {},
                totalKills: {},
            };
            Object.entries(gameState.players).forEach((ply) => {
                gameState.players[ply[0]].x = 9999;
                gameState.players[ply[0]].y = 9999;
                gameState.players[ply[0]].hp = 100;
                gameState.players[ply[0]].isDead = false;
                gameState.players[ply[0]].canFire = true;
                gameState.players[ply[0]].hasWater = true;
                gameState.players[ply[0]].canGrenade = true;
                gameState.players[ply[0]].wepClips = getMaxWepClips();
                gameState.players[ply[0]].startedReloadingTime = Date.now();
                gameState.players[ply[0]].isReloading = false;
                initScoreboardData(ply[0]);
                killCounts[ply[0]] = 0;
            });
            gameState.bullets = [];
            gameState.grenades = [];
            gameState.particles = [];
            gameState.rockets = [];
            gameState.smokeParticles = [];
            gameState.flames = [];
            gameState.russkiyPlane = {
                isActive: false,
                activatedTime: Date.now(),
                timeActive: 0,
                x: -300,
                y: 919 + 100,
                dx: 5 * 4,
                dy: -3 * 4,
            };
            botData = {};
            gameState.roundStartTime = Date.now();
            gameIsEnding = false;
            io.emit("gs", gameState);
            io.emit("game_start");
        }, 10000);
    }
    if (!gameIsEnding) {
        if (gameState.russkiyPlane.isActive) {
            gameState.russkiyPlane.timeActive =
                Date.now() - gameState.russkiyPlane.activatedTime;
            gameState.russkiyPlane.x += gameState.russkiyPlane.dx;
            gameState.russkiyPlane.y += gameState.russkiyPlane.dy;
            if (isSafeBulletPos(gameState.russkiyPlane)) {
                var grenCount = 2;
                for (let i = 0; i < grenCount; i++) {
                    setTimeout(() => {
                        var mx = gameState.russkiyPlane.x + 150;
                        var my = gameState.russkiyPlane.y + 150;
                        var px = gameState.russkiyPlane.x + 150;
                        var py = gameState.russkiyPlane.y + 150;
                        var grenade2 = {
                            x: 0,
                            y: 0,
                            dx: 0,
                            dy: 0,
                            owner: "VladimirPutin",
                            createTime: Date.now(),
                            primeTime: Date.now(),
                            life: 0,
                            isMoving: true,
                            isPrimed: false,
                            id: "PlaneGrenade." + i,
                            isSmokeGrenade: false,
                        };
                        var x = mx - px;
                        var y = my - py;
                        x = x + (Math.random() * 20 - 20 / 2);
                        y = y + (Math.random() * 20 - 20 / 2);
                        var l = Math.sqrt(x * x + y * y);
                        x = (x / l) * 300;
                        y = (y / l) * 300;
                        var l = Math.sqrt(x * x + y * y);
                        x = x / l;
                        y = y / l;
                        grenade2.x = gameState.russkiyPlane.x;
                        grenade2.y = gameState.russkiyPlane.y;
                        grenade2.dx = x * 3;
                        grenade2.dy = y * 3;
                        grenade2.createTime = Date.now();
                        if (!isSafeGrenadePos(grenade2)) return;
                        //gameState.particles.push({ x: grenade2.dx + grenade.x, y: grenade2.dy + grenade.y, col: "255,0,255", creationTime: Date.now(), scaleRate: 0, life: 0, ttl: 100, r: 7.5 });
                        gameState.grenades.push(grenade2);
                    }, i * 100);
                }
            }
            if (
                gameState.russkiyPlane.x > 1633 + 500 &&
                gameState.russkiyPlane.y < -500
            ) {
                gameState.russkiyPlane.isActive = false;
            }
            io.emit("russkiy", gameState.russkiyPlane);
        }
        Object.entries(gameState.players).forEach((plydata) => {
            var ply = plydata[1];
            var isbot = plydata[0].startsWith("Bot");
            if (!ply) return;
            if (ply.hp < 1) {
                ply.isDead = true;
            }
            if (ply.isDead && ply.respawnTimer > -1) {
                ply.respawnTimer = -(Date.now() - ply.deathTime - 5000);
            }
            ply.timeSinceLastAttack = Date.now() - ply.lastAttack;
            if (ply.x == 9999 && ply.y == 9999) {
                var spawn =
                    gameState.map.ents.spawns[
                        Math.floor(
                            Math.random() * gameState.map.ents.spawns.length
                        )
                    ];
                if (!spawn) {
                    console.log("[error] no valid spawn points!!!");
                    ply.x = 100;
                    ply.y = 100;
                } else {
                    ply.x = spawn.x;
                    ply.y = spawn.y;
                }
            }
            if (
                getWeaponData(ply.loadout[1]) &&
                getWeaponData(ply.loadout[1]).isFlamethrower &&
                !ply.isMouseDown
            )
                io.emit("stopsoundloop", plydata[0]);
            if (isbot && botSettings.ai_enabled) doBotAI(ply, plydata[0]);
            if (!ply.isDead && !ply.isSelectingPrimary) {
                var vector = [0, 0];
                if (ply.u) vector[1]--;
                if (ply.d) vector[1]++;
                if (ply.l) vector[0]--;
                if (ply.r) vector[0]++;
                ply.x +=
                    vector[0] *
                    gameState.moveSpeed *
                    (ply.spr ? 2.5 : 1) *
                    (ply.isReloading ? 0.75 : 1) *
                    (getWeaponData(ply.weapon)
                        ? getWeaponData(ply.weapon)
                        : { moveMult: 1 }
                    ).moveMult;
                if (!isSafePos(ply)) {
                    var isSafe = false;
                    var sx = ply.x;
                    while (!isSafe) {
                        sx += -vector[0];
                        isSafe = isSafePos({ x: sx, y: ply.y });
                    }
                    ply.x = sx;
                }
                ply.y +=
                    vector[1] *
                    gameState.moveSpeed *
                    (ply.spr ? 2.5 : 1) *
                    (ply.isReloading ? 0.75 : 1) *
                    getWeaponData(ply.weapon).moveMult;
                if (!isSafePos(ply)) {
                    var isSafe = false;
                    var sy = ply.y;
                    while (!isSafe) {
                        sy += -vector[1];
                        isSafe = isSafePos({ x: ply.x, y: sy });
                    }
                    ply.y = sy;
                }
                if (ply.isReloading)
                    ply.reloadTime = Date.now() - ply.startedReloadingTime;
            }
        });
        gameState.bullets.forEach((bullet) => {
            // ???? what the fuck ???????
            if (!bullet.y) return;
            bullet.lastPosX = parseInt(bullet.x.toString());
            bullet.lastPosY = parseInt(bullet.y.toString());
            var mult = 1;
            if (getWeaponData(bullet.bultype).bulletSpeedMult)
                mult = getWeaponData(bullet.bultype).bulletSpeedMult;
            var steps = 8;
            var destroyed = false;
            var decal = true;
            for (let i = 0; i < steps; i++) {
                var ricochet = Math.random() * 100 < opt.ricochet_chance;
                if (destroyed) continue;
                if (!opt.bullet_ricochet_alt) {
                    bullet.x +=
                        bullet.dx * gameState.bulletSpeed * mult * (1 / steps);
                    if (!isSafeBulletPos(bullet)) {
                        if (ricochet) {
                            var isSafe = false;
                            var sx = bullet.x;
                            while (!isSafe) {
                                sx -= bullet.dx;
                                isSafe = isSafeBulletPos({
                                    x: sx,
                                    y: bullet.y,
                                });
                            }
                            bullet.x = sx;
                            bullet.dx = -bullet.dx;
                        } else {
                            destroyed = true;
                        }
                    }
                    bullet.y +=
                        bullet.dy * gameState.bulletSpeed * mult * (1 / steps);
                    if (!isSafeBulletPos(bullet)) {
                        if (ricochet) {
                            var isSafe = false;
                            var sy = bullet.y;
                            while (!isSafe) {
                                sy -= bullet.dy;
                                isSafe = isSafeBulletPos({
                                    x: bullet.x,
                                    y: sy,
                                });
                            }
                            bullet.y = sy;
                            bullet.dy = -bullet.dy;
                        } else {
                            destroyed = true;
                        }
                    }
                } else {
                    bullet.x +=
                        bullet.dx * gameState.bulletSpeed * mult * (1 / steps);
                    bullet.y +=
                        bullet.dy * gameState.bulletSpeed * mult * (1 / steps);
                    if (!isSafeBulletPos(bullet)) {
                        if (ricochet) {
                            var isSafe = false;
                            while (!isSafe) {
                                bullet.y -= bullet.dy;
                                bullet.x -= bullet.dx;
                                isSafe = isSafeBulletPos(bullet);
                            }
                            bullet.dx = -bullet.dx;
                            bullet.dy = -bullet.dy;
                        } else {
                            destroyed = true;
                        }
                    }
                }
                if (bulletPlayerCheck(bullet, false)) {
                    destroyed = true;
                    decal = false;
                }
                if (ricochet) {
                    if (!bullet.ricochetCount) bullet.ricochetCount = 0;
                    bullet.ricochetCount++;
                }
                if (destroyed) {
                    var obj = getCollidedObject(bullet);
                    if (obj) {
                        if (obj.destructible) {
                            obj.health -= getWeaponData(bullet.bultype).dmg;
                            if (obj.health < 1) {
                                var old = JSON.parse(JSON.stringify(obj));
                                gameState.map.geo = gameState.map.geo.filter(
                                    (g) => {
                                        return g != obj;
                                    }
                                );
                                gameState.map.colliding =
                                    gameState.map.colliding.filter((g) => {
                                        return g != obj;
                                    });
                                io.emit("sound", "glass_break");
                                io.emit("gs", gameState);
                                setTimeout(() => {
                                    gameState.map.geo.push(old);
                                    gameState.map.colliding.push(old);
                                    io.emit("gs", gameState);
                                }, 100);
                            }
                        }
                    }

                    var isSafe = false;
                    var t = 0;
                    while (!isSafe) {
                        bullet.x -= bullet.dx * 0.5;
                        bullet.y -= bullet.dy * 0.5;
                        isSafe =
                            isSafeBulletPos({ x: bullet.x, y: bullet.y }) ||
                            t > 10000;
                        t++;
                    }
                    gameState.bullets = gameState.bullets.filter((b) => {
                        return b != bullet;
                    });
                    if (decal)
                        gameState.particles.push({
                            x: bullet.x,
                            y: bullet.y,
                            col: "0,0,0",
                            creationTime: Date.now(),
                            scaleRate: 0,
                            life: 0,
                            ttl: 1000,
                            r: 5,
                        });
                }
            }
        });
        gameState.particles.forEach((particle) => {
            particle.life = Date.now() - particle.creationTime;
            if (Date.now() - particle.creationTime > particle.ttl) {
                gameState.particles = gameState.particles.filter(
                    (d) => d != particle
                );
            }
        });
        gameState.rockets.forEach((rocket) => {
            rocket.lastPosX = parseInt(rocket.x.toString());
            rocket.lastPosY = parseInt(rocket.y.toString());
            rocket.x += rocket.dx * gameState.bulletSpeed;
            rocket.y += rocket.dy * gameState.bulletSpeed;
            if (!isSafeBulletPos(rocket)) {
                gameState.particles.push({
                    x: rocket.x,
                    y: rocket.y,
                    col: "0,0,0",
                    creationTime: Date.now(),
                    scaleRate: 1.5,
                    life: 0,
                    ttl: 400,
                    r: 20,
                });
                var bulletCount = 100;
                var mx = rocket.x;
                var my = rocket.y;
                var px = rocket.x;
                var py = rocket.y;
                for (let i = 0; i < bulletCount; i++) {
                    var bullet = {
                        x: 0,
                        y: 0,
                        dx: 0,
                        dy: 0,
                        radius: 5,
                        lastPosX: 0,
                        lastPosY: 0,
                        owner: "GRENADE_" + rocket.owner,
                        bultype: 100,
                    };
                    var x = mx - px;
                    var y = my - py;
                    x = x + (Math.random() * 15 - 15 / 2);
                    y = y + (Math.random() * 15 - 15 / 2);
                    var l = Math.sqrt(x * x + y * y);
                    x = (x / l) * 100;
                    y = (y / l) * 100;
                    var l = Math.sqrt(x * x + y * y);
                    x = x / l;
                    y = y / l;
                    bullet.x = rocket.x;
                    bullet.y = rocket.y;
                    bullet.lastPosX = rocket.x;
                    bullet.lastPosY = rocket.y;
                    bullet.dx = x * 15;
                    bullet.dy = y * 15;
                    gameState.bullets.push(bullet);
                }
                gameState.rockets = gameState.rockets.filter((rkd) => {
                    return rkd != rocket;
                });
            }
        });
        gameState.grenades.forEach((grenade) => {
            grenade.life = Date.now() - grenade.createTime;
            grenade.timeUntilDet = Date.now() - grenade.primeTime;
            var throwTime = 1500;
            var maxLife = throwTime + 1500;
            var thing =
                Math.abs(grenade.life / throwTime - throwTime) - throwTime + 1;
            if (!grenade.isPrimed) {
                if (thing > 0) {
                    if (!grenade.a) grenade.a = 0;
                    grenade.a += thing * (Math.random() * 3 + 2);
                }
                var vector = [grenade.dx, grenade.dy];
                if (thing > 0)
                    grenade.x += grenade.dx * gameState.bulletSpeed * thing;
                if (!isSafeGrenadePos(grenade)) {
                    var isSafe = false;
                    var sx = grenade.x;
                    while (!isSafe) {
                        sx -= vector[0];
                        isSafe = isSafeGrenadePos({ x: sx, y: grenade.y });
                    }
                    grenade.x = sx;
                    grenade.dx = -vector[0];
                    // IMPACT GRENADES -- FOR LATER
                    /*  maxLife = 0;
                grenade.timeUntilDet = 1000; */
                }
                if (thing > 0)
                    grenade.y += grenade.dy * gameState.bulletSpeed * thing;
                if (!isSafeGrenadePos(grenade)) {
                    var isSafe = false;
                    var sy = grenade.y;
                    while (!isSafe) {
                        sy += -vector[1];
                        isSafe = isSafeGrenadePos({ x: grenade.x, y: sy });
                    }
                    grenade.y = sy;
                    grenade.dy = -vector[1];
                    // IMPACT GRENADES -- FOR LATER
                    /*  maxLife = 0;
                grenade.timeUntilDet = 1000; */
                }
            } else {
                grenade.x = gameState.players[grenade.owner].x;
                grenade.y = gameState.players[grenade.owner].y;
            }
            if (grenade.timeUntilDet > maxLife) {
                // BOOM
                var maxDmg = 200;
                var maxDist = 200;
                gameState.particles.push({
                    x: grenade.x,
                    y: grenade.y,
                    col: "0,0,0",
                    creationTime: Date.now(),
                    scaleRate: 1.5,
                    life: 0,
                    ttl: 400,
                    r: 20,
                });
                var bulletCount = grenade.isSmokeGrenade
                    ? 50
                    : grenade.owner == "VladimirPutin"
                    ? 10
                    : 50;
                var mx = grenade.x;
                var my = grenade.y;
                var px = grenade.x;
                var py = grenade.y;
                for (let i = 0; i < bulletCount; i++) {
                    if (!grenade.isSmokeGrenade) {
                        var bullet = {
                            x: 0,
                            y: 0,
                            dx: 0,
                            dy: 0,
                            radius: 5,
                            lastPosX: 0,
                            lastPosY: 0,
                            owner: "GRENADE_" + grenade.owner,
                            bultype: 100,
                        };
                        var x = mx - px;
                        var y = my - py;
                        x = x + (Math.random() * 15 - 15 / 2);
                        y = y + (Math.random() * 15 - 15 / 2);
                        var l = Math.sqrt(x * x + y * y);
                        x = (x / l) * 100;
                        y = (y / l) * 100;
                        var l = Math.sqrt(x * x + y * y);
                        x = x / l;
                        y = y / l;
                        bullet.x = grenade.x;
                        bullet.y = grenade.y;
                        bullet.lastPosX = grenade.x;
                        bullet.lastPosY = grenade.y;
                        bullet.dx = x * 15;
                        bullet.dy = y * 15;
                        //gameState.particles.push({ x: bullet.dx + ply.x, y: bullet.dy + ply.y, col: "255,0,255", creationTime: Date.now(), scaleRate: 0, life: 0, ttl: 100, r: 7.5 });
                        gameState.bullets.push(bullet);
                    } else {
                        var grenade2 = {
                            x: 0,
                            y: 0,
                            dx: 0,
                            dy: 0,
                            createTime: Date.now(),
                            primeTime: Date.now(),
                            life: 0,
                            isMoving: true,
                        };
                        var x = mx - px;
                        var y = my - py;
                        x = x + (Math.random() * 15 - 15 / 2);
                        y = y + (Math.random() * 15 - 15 / 2);
                        var l = Math.sqrt(x * x + y * y);
                        x = (x / l) * 100;
                        y = (y / l) * 100;
                        var l = Math.sqrt(x * x + y * y);
                        x = x / l;
                        y = y / l;
                        grenade2.x = grenade.x;
                        grenade2.y = grenade.y;
                        grenade2.dx = x * (i * 0.1);
                        grenade2.dy = y * (i * 0.1);
                        grenade2.createTime = Date.now();
                        gameState.smokeParticles.push(grenade2);
                    }
                }
                io.emit("adv_sound", [
                    "grenade_boom",
                    grenade.x,
                    grenade.y,
                    999999,
                ]);
                gameState.grenades = gameState.grenades.filter((g) => {
                    return g != grenade;
                });
            }
        });
        gameState.smokeParticles.forEach((grenade) => {
            grenade.life = Date.now() - grenade.createTime;
            var throwTime = 4000;
            var maxLifeTime = throwTime + 8000;
            var fadeTime = 3000;
            var l =
                grenade.life - maxLifeTime > 0 ? grenade.life - maxLifeTime : 0;
            grenade.alpha = Math.abs(l / fadeTime - fadeTime) - fadeTime + 1;
            if (grenade.alpha < 0) {
                gameState.smokeParticles = gameState.smokeParticles.filter(
                    (smk) => smk != grenade
                );
                return;
            }
            if (!grenade.isPrimed) {
                var vector = [grenade.dx, grenade.dy];
                if (
                    (Math.abs(grenade.life / throwTime - throwTime) -
                        throwTime +
                        1) *
                        1 >
                    0
                )
                    grenade.x +=
                        grenade.dx *
                        gameState.bulletSpeed *
                        (Math.abs(grenade.life / throwTime - throwTime) -
                            throwTime +
                            1) *
                        1;
                if (!isSafeGrenadePos(grenade)) {
                    var isSafe = false;
                    var sx = grenade.x;
                    while (!isSafe) {
                        sx -= vector[0];
                        isSafe = isSafeGrenadePos({ x: sx, y: grenade.y });
                    }
                    grenade.x = sx;
                    grenade.dx = -vector[0];
                    // IMPACT GRENADES -- FOR LATER
                    /*  maxLife = 0;
                grenade.timeUntilDet = 1000; */
                }
                if (
                    (Math.abs(grenade.life / throwTime - throwTime) -
                        throwTime +
                        1) *
                        1 >
                    0
                )
                    grenade.y +=
                        grenade.dy *
                        gameState.bulletSpeed *
                        (Math.abs(grenade.life / throwTime - throwTime) -
                            throwTime +
                            1) *
                        1;
                if (!isSafeGrenadePos(grenade)) {
                    var isSafe = false;
                    var sy = grenade.y;
                    while (!isSafe) {
                        sy += -vector[1];
                        isSafe = isSafeGrenadePos({ x: grenade.x, y: sy });
                    }
                    grenade.y = sy;
                    grenade.dy = -vector[1];
                    // IMPACT GRENADES -- FOR LATER
                    /*  maxLife = 0;
                grenade.timeUntilDet = 1000; */
                }
            }
        });
        gameState.flames.forEach((flame) => {
            flame.life = Date.now() - flame.createTime;
            var maxLifeTime = 400;
            var fadeTime = 400;
            var grenade = flame;
            var l =
                grenade.life - maxLifeTime > 0 ? grenade.life - maxLifeTime : 0;
            grenade.alpha = Math.abs(l / fadeTime - fadeTime) - fadeTime + 1;

            flame.x += flame.dx;
            if (!isSafeBulletPos(flame)) {
                // yes i know this is for grenades no i dont care
                var st = false;
                var sx = flame.x;
                while (!st) {
                    sx += -flame.dx;
                    st = isSafeBulletPos({ x: sx, y: flame.y });
                }
                grenade.x = sx;
                grenade.dx = 0;
            }
            flame.y += flame.dy;
            if (!isSafeBulletPos(flame)) {
                // yes i know this is for grenades no i dont care
                var st = false;
                var sy = flame.y;
                while (!st) {
                    sy += -flame.dy;
                    st = isSafeBulletPos({ x: flame.x, y: sy });
                }
                grenade.y = sy;
                grenade.dy = 0;
            }

            flamePlayerCheck(flame);

            if (flame.alpha < 0) {
                gameState.flames = gameState.flames.filter(
                    (flm) => flm != flame
                );
            }
        });
    }
    io.emit("plyd", encodePlayerData(gameState.players));
    io.emit("buld", encodeBulletData(gameState.bullets));
    io.emit("grnd", encodeGrenadeData(gameState.grenades));
    io.emit("prtd", encodeParticleData(gameState.particles));
    io.emit("rktd", encodeRocketData(gameState.rockets));
    io.emit("smkd", encodeSmokeData(gameState.smokeParticles));
    io.emit("flmd", encodeFlameData(gameState.flames));
    io.emit("pckd", encodePickupData(gameState.map.ents.pickups));
}

var usernames = {};

setInterval(() => {
    io.emit("usernames", usernames);
    io.emit("mem", process.memoryUsage());
}, 1000);

function valueInRange(val, min, max) {
    return val >= min && val <= max;
}

function isSafePos(ply) {
    var ret = true;
    if (ply.x < 0 + 30) ret = false;
    if (ply.x > gameState.map.width - 30) ret = false;
    if (ply.y < 0 + 30) ret = false;
    if (ply.y > gameState.map.height - 30) ret = false;
    gameState.map.colliding.forEach((obj) => {
        if (!ret) return;
        switch (obj.type) {
            case "rect":
                var rectA = { x: ply.x - 30, y: ply.y - 30, w: 60, h: 60 };
                var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                ret = !(yOverlap && xOverlap);
                break;
            case "circ":
                var rectA = { x: ply.x - 30, y: ply.y - 30, w: 60, h: 60 };
                var rectB = {
                    x: obj.x1 - obj.r,
                    y: obj.y1 - obj.r,
                    w: obj.r * 2,
                    h: obj.r * 2,
                };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                ret = !(yOverlap && xOverlap);
                break;
        }
    });
    return ret;
}

function isSafeBulletPos(ply) {
    var ret = true;
    if (ply.x < -gameState.map.width) ret = false;
    if (ply.x > gameState.map.width * 2) ret = false;
    if (ply.y < -gameState.map.height) ret = false;
    if (ply.y > gameState.map.height * 2) ret = false;
    gameState.map.colliding.forEach((obj) => {
        if (!ret || obj.playerclip) return;
        switch (obj.type) {
            case "rect":
                var rectA = { x: ply.x - 1, y: ply.y - 1, w: 2, h: 2 };
                var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                ret = !(yOverlap && xOverlap);
                break;
            case "circ":
                ret = distance(ply.x, ply.y, obj.x1, obj.y1) > obj.r * 3;
                break;
        }
    });
    return ret;
}

function isSafeGrenadePos(ply) {
    var ret = true;
    if (ply.x < 0 + 5) ret = false;
    if (ply.x > gameState.map.width - 5) ret = false;
    if (ply.y < 0 + 5) ret = false;
    if (ply.y > gameState.map.height - 5) ret = false;
    gameState.map.colliding.forEach((obj) => {
        if (!ret || obj.playerclip) return;
        switch (obj.type) {
            case "rect":
                var rectA = { x: ply.x - 5, y: ply.y - 5, w: 10, h: 10 };
                var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                ret = !(yOverlap && xOverlap);
                break;
            case "circ":
                var rectA = { x: ply.x - 5, y: ply.y - 5, w: 10, h: 10 };
                var rectB = {
                    x: obj.x1 - obj.r,
                    y: obj.y1 - obj.r,
                    w: obj.r * 2,
                    h: obj.r * 2,
                };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                ret = !(yOverlap && xOverlap);
                break;
        }
    });
    return ret;
}

function getCollidedObject(ply) {
    var ret = null;
    gameState.map.colliding.forEach((obj) => {
        if (ret || obj.playerclip) return;
        switch (obj.type) {
            case "rect":
                var rectA = { x: ply.x - 1, y: ply.y - 1, w: 2, h: 2 };
                var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                if (yOverlap && xOverlap) ret = obj;
                break;
            case "circ":
                var rectA = { x: ply.x - 1, y: ply.y - 1, w: 2, h: 2 };
                var rectB = {
                    x: obj.x1 - obj.r,
                    y: obj.y1 - obj.r,
                    w: obj.r * 2,
                    h: obj.r * 2,
                };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                if (!(yOverlap && xOverlap)) ret = obj;
        }
    });
    return ret;
}

function encodeBulletData(buld) {
    var final = "";
    buld.forEach((b, i) => {
        final += `${i == 0 ? "" : "\n"}${b.x}:${b.y}:${b.lastPosX}:${
            b.lastPosY
        }:${b.bultype}`;
    });
    return final;
}

function encodeRocketData(rktd) {
    var final = "";
    rktd.forEach((b, i) => {
        final += `${i == 0 ? "" : "\n"}${b.x}:${b.y}:${b.lastPosX}:${
            b.lastPosY
        }`;
    });
    return final;
}

function encodeGrenadeData(grnd) {
    var final = "";
    grnd.forEach((g, i) => {
        final += `${i == 0 ? "" : "\n"}${g.x}:${g.y}:${g.a}`;
    });
    return final;
}

function encodeSmokeData(grnd) {
    var final = "";
    grnd.forEach((g, i) => {
        final += `${i == 0 ? "" : "\n"}${g.x}:${g.y}:${g.alpha}`;
    });
    return final;
}

function encodeFlameData(grnd) {
    var final = "";
    grnd.forEach((g, i) => {
        final += `${i == 0 ? "" : "\n"}${g.x}:${g.y}:${g.alpha}`;
    });
    return final;
}

function encodeParticleData(buld) {
    var final = "";
    buld.forEach((b, i) => {
        final += `${i == 0 ? "" : "\n"}${b.x}:${b.y}:${b.col}:${b.r}:${
            b.life
        }:${b.ttl}:${b.scaleRate}`;
    });
    return final;
}

function encodePickupData(grnd) {
    var final = "";
    grnd.forEach((g, i) => {
        final += `${i == 0 ? "" : "\n"}${g.x}:${g.y}:${g.type}:${g.active}`;
    });
    return final;
}

var scoreboardData = {
    totalKills: {},
    totalDeaths: {},
    totalScore: {},
    highestKillstreak: {},
};

function clone(o) {
    if (typeof o == "number") {
        return parseInt(`${o}`);
    } else return o;
}

function spawnDebugParticle(x, y, col) {
    gameState.particles.push({
        x: x,
        y: y,
        col: col,
        creationTime: Date.now(),
        scaleRate: 0,
        life: 0,
        ttl: 1000,
        r: 7.5,
    });
}

var aimingDebug = false;

function checkShit(md, barrelLength) {
    var mx = md[4];
    var my = md[5];
    var px = md[6];
    var py = md[7];
    var x = mx - px;
    var y = my - py;
    var l = Math.sqrt(x * x + y * y);
    x = x / l;
    y = y / l;
    var ret = false;
    var done = false;
    var cx = clone(px);
    var cy = clone(py);
    var t = 0;
    while (!done) {
        if (ret) {
            done = true;
        } else {
            cx += x;
            cy += y;
            if (distance(cx, cy, px, py) > barrelLength) {
                if (aimingDebug) spawnDebugParticle(cx, cy, "0,255,0");
                ret = false;
                done = true;
            }
            if (!isSafeBulletPos({ x: cx, y: cy })) {
                if (aimingDebug) spawnDebugParticle(cx, cy, "255,0,255");
                ret = true;
                done = true;
            }
            if (t > 10000) {
                console.log(cx, cy, px, py);
                console.log(distance(cx, cy, px, py));
                console.log(barrelLength);
                done = true;
                ret = false;
            }
            t++;
        }
    }
    return ret;
}

function melee(md, owner) {
    var mx = md[4] || md[0];
    var my = md[5] || md[1];
    var px = md[6] || md[2];
    var py = md[7] || md[3];
    var x = mx - px;
    var y = my - py;
    var l = Math.sqrt(x * x + y * y);
    x = x / l;
    y = y / l;
    var ret = false;
    var done = false;
    var cx = clone(px);
    var cy = clone(py);
    var t = 0;
    while (!done) {
        if (ret) {
            done = true;
        } else {
            cx += x;
            cy += y;
            if (distance(cx, cy, px, py) > 42) {
                if (aimingDebug) spawnDebugParticle(cx, cy, "0,255,0");
                ret = false;
                done = true;
            }
            var p = bulletPlayerCheck({ x: cx, y: cy, owner: owner[0] }, true);
            if (p) {
                if (aimingDebug) spawnDebugParticle(cx, cy, "255,0,255");
                ret = p;
                done = true;
            }
            if (t > 10000) {
                console.log(cx, cy, px, py);
                console.log(distance(cx, cy, px, py));
                done = true;
                ret = false;
            }
            t++;
        }
    }
    return ret;
}

var opt = {
    randomspread: true,
    ricochet_chance: 10,
    bulletSelfDamage: false,
    smokeGrenades: false,
    bullet_ricochet_alt: false,
};

function useWeapon(wep, plyd, md, od) {
    var plyname = plyd[0];
    var ply = plyd[1];
    var ox = od ? od[0] : ply.x,
        oy = od ? od[1] : ply.y;
    var mx = md[0],
        my = md[1],
        px = md[2],
        py = md[3];
    if (!wep.isFlamethrower) {
        for (let i = 0; i < wep.bulletCount; i++) {
            var bullet = {
                x: 0,
                y: 0,
                dx: 0,
                dy: 0,
                radius: 5,
                lastPosX: 0,
                lastPosY: 0,
                owner: plyname,
                bultype: ply.weapon,
            };
            var x = mx - px;
            var y = my - py;
            var sp = wep.spread;
            var l = Math.sqrt(x * x + y * y);
            x = (x / l) * 100;
            y = (y / l) * 100;
            if (opt.randomspread) {
                x = x + (Math.random() * sp - sp / 2);
                y = y + (Math.random() * sp - sp / 2);
            } else {
                x = x + i * (sp * 0.2) - (sp * 0.2 * wep.bulletCount) / 2;
                y = y + i * (sp * 0.2) - (sp * 0.2 * wep.bulletCount) / 2;
            }
            if (aimingDebug)
                gameState.particles.push({
                    x: x + ply.x,
                    y: y + ply.y,
                    col: "255,255,255",
                    creationTime: Date.now(),
                    scaleRate: 0,
                    life: 0,
                    ttl: 1000,
                    r: 7.5,
                });
            var l = Math.sqrt(x * x + y * y);
            x = x / l;
            y = y / l;
            bullet.x = ox;
            bullet.y = oy;
            bullet.lastPosX = ox;
            bullet.lastPosY = oy;
            bullet.dx = x * 10;
            bullet.dy = y * 10;
            if (aimingDebug)
                gameState.particles.push({
                    x: bullet.dx + ply.x,
                    y: bullet.dy + ply.y,
                    col: "255,0,255",
                    creationTime: Date.now(),
                    scaleRate: 0,
                    life: 0,
                    ttl: 100,
                    r: 7.5,
                });
            gameState.bullets.push(bullet);
        }
    } else {
        if (ply.isMouseDown) io.emit("sound_loop", ["flamethrower", plyname]);
        var grenade2 = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            createTime: Date.now(),
            primeTime: Date.now(),
            life: 0,
            isMoving: true,
            owner: plyname,
        };
        var x = mx - px;
        var y = my - py;
        var sp = wep.spread;
        var l = Math.sqrt(x * x + y * y);
        x = (x / l) * 100;
        y = (y / l) * 100;
        x = x + (Math.random() * sp - sp / 2);
        y = y + (Math.random() * sp - sp / 2);
        if (aimingDebug)
            gameState.particles.push({
                x: x + ply.x,
                y: y + ply.y,
                col: "255,255,255",
                creationTime: Date.now(),
                scaleRate: 0,
                life: 0,
                ttl: 1000,
                r: 7.5,
            });
        var l = Math.sqrt(x * x + y * y);
        x = x / l;
        y = y / l;
        grenade2.x = ox;
        grenade2.y = oy;
        grenade2.dx = x * 10;
        grenade2.dy = y * 10;
        grenade2.createTime = Date.now();
        gameState.flames.push(grenade2);
    }
}

io.on("connection", (socket) => {
    console.log(socket.id + " has joined");
    socket.emit("gs", gameState);
    socket.emit("usernames", usernames);
    socket.emit("scoreboard", scoreboardData);
    socket.emit("nav_data", navData);
    socket.emit("wep_clips", getMaxWepClips());
    if (gameIsEnding) socket.emit("game_end");
    socket.emit("sound_data", sounds);
    socket.emit("texture_data", textures);
    initScoreboardData(socket.id);
    socket.on("move", (data) => {
        if (gameIsEnding) return;
        var ply = gameState.players[socket.id];
        if (!ply) return;
        if (ply.isDead) return;
        ply.u = data[0] == "1";
        ply.d = data[1] == "1";
        ply.l = data[2] == "1";
        ply.r = data[3] == "1";
        ply.spr = data[4] == "1";
        ply.a = parseFloat(data.slice(5));
    });
    var ply;
    socket.on("ply", (pl) => {
        gameState.players[socket.id] = pl;
        if (
            gameState.players[socket.id] &&
            gameState.players[socket.id].wepClips == null
        )
            gameState.players[socket.id].wepClips = getMaxWepClips();
        ply = pl;
    });
    socket.on("set_username", (name) => {
        var ply = gameState.players[socket.id];
        usernames[socket.id] = name;
        socket.emit("usernames", usernames);
        if (ply && !ply.loadout.includes(-1) && usernames[socket.id]) {
            socket.emit("join_ok", true);
        } else {
            socket.emit("join_ok", false);
        }
    });
    socket.on("respawn", () => {
        if (gameIsEnding) return;
        var spawn =
            gameState.map.ents.spawns[
                Math.floor(Math.random() * gameState.map.ents.spawns.length)
            ];
        if (!spawn) {
            console.log("[error] no valid spawn points!!!");
            ply.x = 100;
            ply.y = 100;
        } else {
            ply.x = spawn.x;
            ply.y = spawn.y;
        }
        ply.hp = 100;
        ply.hasWater = true;
        ply.isDead = false;
        ply.weapon = ply.loadout[1];
        ply.canFire = true;
        ply.wepClips = getMaxWepClips();
        ply.isReloading = false;
    });
    socket.on("send_message", (msg) => {
        if (msg.startsWith("!bot")) {
            switch (msg.split(" ")[1]) {
                case "weapon":
                    botSettings.weapon = gameState.weaponData[
                        parseInt(msg.split(" ")[2])
                    ]
                        ? parseInt(msg.split(" ")[2])
                        : 1;
                    Object.entries(gameState.players).forEach((a) => {
                        if (a[0].startsWith("Bot")) {
                            a[1].weapon = botSettings.weapon;
                            a[1].loadout[1] = botSettings.weapon;
                        }
                    });
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content: "Bot weapon set.",
                    });
                    saveSettings();
                    break;
                case "ignore_players":
                    botSettings.ignore_players = msg.split(" ")[2] == 1;
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content:
                            "Bots will now " +
                            (msg.split(" ")[2] == "1" ? "ignore" : "attack") +
                            " players.",
                    });
                    saveSettings();
                    break;
                case "ai":
                    botSettings.ai_enabled = msg.split(" ")[2] == 1;
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content:
                            "Bot AI " +
                            (msg.split(" ")[2] == "1"
                                ? "enabled"
                                : "disabled") +
                            ".",
                    });
                    saveSettings();
                    break;
                case "ignore_bots":
                    botSettings.ignore_bots = msg.split(" ")[2] == 1;
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content:
                            "Bots will now " +
                            (msg.split(" ")[2] == "1" ? "ignore" : "attack") +
                            " other bots.",
                    });
                    saveSettings();
                    break;
                case "show_ks":
                    botSettings.show_ks = msg.split(" ")[2] == 1;
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content:
                            "Bots will now " +
                            (msg.split(" ")[2] == "1" ? "show" : "not show") +
                            " killstreaks",
                    });
                    saveSettings();
                    break;
                case "add":
                    if (parseInt(msg.split(" ")[2])) {
                        for (let i = 0; i < parseInt(msg.split(" ")[2]); i++) {
                            spawnBot();
                        }
                    } else {
                        spawnBot();
                    }
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content: "Bot(s) added.",
                    });
                    break;
                case "count":
                    var count = Object.keys(gameState.players).filter((p) =>
                        p.startsWith("Bot")
                    ).length;
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content: `There are ${count} bots ingame.`,
                    });
                    break;
                case "clear":
                    var filtered = {};
                    Object.entries(gameState.players).forEach((ply) => {
                        if (!ply[0].startsWith("Bot"))
                            filtered[ply[0]] = ply[1];
                    });
                    gameState.players = filtered;
                    var tmp = {};
                    Object.entries(scoreboardData).forEach((scoreboardType) => {
                        tmp[scoreboardType[0]] = {};
                        Object.entries(scoreboardType[1]).forEach(
                            (scoreboardInfo) => {
                                if (!scoreboardInfo[0].startsWith("Bot")) {
                                    tmp[scoreboardType[0]][scoreboardInfo[0]] =
                                        scoreboardInfo[1];
                                }
                            }
                        );
                    });
                    scoreboardData = tmp;
                    io.emit("scoreboard", scoreboardData);
                    socket.emit("recieve_message", {
                        author: "ServerBot",
                        content: `Cleared all bots.`,
                    });
                    break;
                default:
                    io.emit("recieve_message", {
                        author: "ServerBot",
                        content:
                            "Unrecognized bot command: " + msg.split(" ")[1],
                    });
            }
            return;
        } else if (msg.startsWith("!lightsoff")) {
            gameState.lightsOn = false;
            io.emit("gs", gameState);
            io.emit("recieve_message", {
                author: "ServerBot",
                content: "Toggled lights",
            });
            return;
        } else if (msg.startsWith("!setweapon")) {
            gameState.players[socket.id].weapon = gameState.weaponData[
                parseInt(msg.split(" ")[1])
            ]
                ? parseInt(msg.split(" ")[1])
                : 1;
            socket.emit("recieve_message", {
                author: "ServerBot",
                content: "Weapon set.",
            });
            return;
        } else if (msg.startsWith("!tickrate")) {
            if (msg.split(" ")[1]) {
                if (parseInt(msg.split(" ")[1])) {
                    restartTick(parseInt(msg.split(" ")[1]));
                    io.emit("recieve_message", {
                        author: "ServerBot",
                        content: "Tickrate changed to " + tickrate + " tps",
                    });
                } else if (msg.split(" ")[1] == "inf") {
                    restartTick(NaN);
                    io.emit("recieve_message", {
                        author: "ServerBot",
                        content: "Tickrate changed to Infinity",
                    });
                } else {
                    io.emit("recieve_message", {
                        author: "ServerBot",
                        content: "Tickrate must be either a number or inf",
                    });
                }
            } else {
                io.emit("recieve_message", {
                    author: "ServerBot",
                    content: "Current tickrate: " + tickrate + " tps",
                });
            }
            return;
        }
        var newContent = flaps.onMessage({
            author: usernames[socket.id]
                ? usernames[socket.id]
                : socket.id.substring(0, 4),
            content: msg,
        });
        if (typeof newContent === "undefined") newContent = msg;
        if (newContent.length == 0) return;
        io.emit("recieve_message", {
            author: usernames[socket.id]
                ? usernames[socket.id]
                : socket.id.substring(0, 4),
            content: newContent,
        });
    });
    socket.on("choose_weapon", (wep) => {
        if (gameIsEnding) return;
        if (!ply) return;
        ply.loadout[wep[0]] = wep[1];
        if (!ply.loadout.includes(-1) && usernames[socket.id]) {
            socket.emit("join_ok", true);
        } else {
            socket.emit("join_ok", false);
        }
    });
    socket.on("ready", () => {
        if (!ply.loadout.includes(-1) && usernames[socket.id]) {
            ply.weapon = ply.loadout[1];
            ply.isSelectingPrimary = false;
            ply.canFire = true;
            io.emit("recieve_message", {
                author: "___NONAME___",
                content: usernames[socket.id] + " has joined the game",
            });
        }
    });
    socket.on("map_reload", () => {
        gameState.map = loadMap(maplist[mapIndex]);
        io.emit("gs", gameState);
    });
    socket.on("spawn_ai", () => {
        if (gameIsEnding) return;
        spawnBot();
    });
    socket.on("use_water", () => {
        if (gameIsEnding) return;
        if (!ply.hasWater || ply.isDead || ply.hp >= 100) return;
        ply.hasWater = false;
        ply.hp = 100;
        socket.emit("gs", gameState);
    });
    socket.on("disconnect", () => {
        console.log(socket.id + " has left");
        io.emit("recieve_message", {
            author: "___NONAME___",
            content: usernames[socket.id] + " has left the game",
        });
        gameState.players[socket.id] = undefined;
        delete gameState.players[socket.id];
        usernames[socket.id] = undefined;
        delete usernames[socket.id];
        killCounts[socket.id] = undefined;
        delete killCounts[socket.id];
        var tmp = {};
        Object.entries(scoreboardData).forEach((scoreboardType) => {
            tmp[scoreboardType[0]] = {};
            Object.entries(scoreboardType[1]).forEach((scoreboardInfo) => {
                if (scoreboardInfo[0] != socket.id) {
                    tmp[scoreboardType[0]][scoreboardInfo[0]] =
                        scoreboardInfo[1];
                }
            });
        });
        scoreboardData = tmp;
        io.emit("scoreboard", scoreboardData);
    });
    socket.on("reload_gun", () => {
        if (gameIsEnding) return;
        var ply = gameState.players[socket.id];
        if (!ply)
            return console.log("[warning] invalid player attempted reload?");
        if (
            ply.isDead ||
            ply.wepClips[ply.weapon] == getWeaponData(ply.weapon).clipSize ||
            ply.isReloading ||
            !ply.canFire ||
            getWeaponData(ply.weapon).name.startsWith("__melee_")
        )
            return;
        ply.isReloading = true;
        ply.canFire = false;
        ply.startedReloadingTime = Date.now();
        reloadSound(ply.weapon);
        setTimeout(() => {
            ply.isReloading = false;
            ply.canFire = true;
            ply.wepClips[ply.weapon] = getWeaponData(ply.weapon).clipSize;
        }, getWeaponData(ply.weapon).reloadTime);
    });
    socket.on("mousedown", () => {
        var ply = gameState.players[socket.id];
        if (!ply) return console.log("[warning] invalid player shot bullet?");
        if (ply.isDead || ply.isSelectingPrimary) return;
        var wep = getWeaponData(ply.weapon);
        ply.isMouseDown = true;
    });
    socket.on("mouseup", () => {
        var ply = gameState.players[socket.id];
        if (!ply) return console.log("[warning] invalid player shot bullet?");
        if (ply.isDead || ply.isSelectingPrimary) return;
        var wep = getWeaponData(ply.weapon);
        ply.isMouseDown = false;
    });
    socket.on("shoot_bullet", (md) => {
        if (gameIsEnding) return;
        var ply = gameState.players[socket.id];
        if (!ply) return console.log("[warning] invalid player shot bullet?");
        if (ply.isDead || ply.isSelectingPrimary) {
            io.emit("stopsoundloop", socket.id);
            return;
        }
        var res = false;
        var wep = getWeaponData(ply.weapon);
        if (!wep.name.startsWith("__melee_"))
            res = checkShit(md, 30 + wep.barrelLength);
        var mx = md[0];
        var my = md[1];
        var px = md[2];
        var py = md[3];
        var x = mx - px;
        var y = my - py;
        if (aimingDebug) spawnDebugParticle(mx, my, "255,0,0");
        if (aimingDebug) spawnDebugParticle(px, py, "0,0,255");
        if (res || !ply.canFire) {
            if (res) io.emit("stopsoundloop", socket.id);
            return;
        }
        ply.lastAttack = Date.now();
        var l = Math.sqrt(x * x + y * y);
        x = (x / l) * (30 + wep.barrelLength);
        y = (y / l) * (30 + wep.barrelLength);
        var ox = ply.x + x;
        var oy = ply.y + y;
        if (!wep.name.startsWith("__melee_")) {
            useWeapon(wep, [socket.id, ply], md, [ox, oy]);
        } else {
            var m = melee(md, [socket.id, ply]);
            ply.lastHand = Math.floor(Math.random() * 2);
            if (m) dealPlyDamage(m, 20, [m.x, m.y], socket.id);
        }
        ply.canFire = false;
        ply.wepClips[ply.weapon]--;
        shootSound(ply.weapon, socket.id);

        if (ply.wepClips[ply.weapon] == 0 && !wep.name.startsWith("__melee_")) {
            var ply = gameState.players[socket.id];
            if (!ply)
                return console.log(
                    "[warning] invalid player attempted reload?"
                );
            if (
                ply.isDead ||
                ply.wepClips[ply.weapon] == getWeaponData(ply.weapon).clipSize
            )
                return;
            ply.isReloading = true;
            ply.canFire = false;
            ply.startedReloadingTime = Date.now();
            reloadSound(ply.weapon);
            setTimeout(() => {
                ply.isReloading = false;
                ply.canFire = true;
                ply.wepClips[ply.weapon] = getWeaponData(ply.weapon).clipSize;
            }, getWeaponData(ply.weapon).reloadTime);
            return;
        } else {
            setTimeout(() => {
                ply.canFire = true;
            }, getWeaponData(ply.weapon).fireRate);
        }
    });
    socket.on("primegrenade", (gi) => {
        if (gameIsEnding) return;
        var ply = gameState.players[socket.id];
        if (!ply)
            return console.log("[warning] invalid player primed grenade?");
        if (
            !ply.canFire ||
            ply.isDead ||
            ply.isSelectingPrimary ||
            !ply.canGrenade
        )
            return;
        var grenade = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            owner: socket.id,
            createTime: Date.now(),
            primeTime: Date.now(),
            life: 0,
            isMoving: false,
            isPrimed: true,
            id: gi,
            isSmokeGrenade: getWeaponData(ply.loadout[3]).isSmokeGrenade,
            a: Math.floor(Math.random() * 360),
        };
        grenade.x = ply.x;
        grenade.y = ply.y;
        gameState.grenades.push(grenade);
        ply.canGrenade = true; // ! change
        io.emit("sound", "grenade_pin");
    });
    socket.on("summon_russian_army", () => {
        if (gameIsEnding) return;
        gameState.russkiyPlane.isActive = true;
        gameState.russkiyPlane.x = -300;
        gameState.russkiyPlane.y = gameState.map.height + 100;
        gameState.russkiyPlane.activatedTime = Date.now();
    });
    socket.on("use_melee", (md) => {
        if (gameIsEnding) return;
        var ply = gameState.players[socket.id];
        if (!ply) return console.log("[warning] invalid player used melee");
        if (!ply.canFire || ply.isDead || ply.isSelectingPrimary) return;
        ply.lastAttack = Date.now();
        var mx = md[0];
        var my = md[1];
        var px = md[2];
        var py = md[3];
        var x = mx - px;
        var y = my - py;
        var l = Math.sqrt(x * x + y * y);
        x = (x / l) * 30;
        y = (y / l) * 30;
        Object.entries(gameState.players).forEach((playerdata) => {
            var player = playerdata[1];
            if (player == ply) return;
            if (distance(player.x, player.y, ply.x + x, ply.y + y) < 30) {
                player.hp -= 20;
                if (player.hp < 1) {
                    gameState.particles.push({
                        x: player.x,
                        y: player.y,
                        col: "255,0,0",
                        scaleRate: 1.05,
                        creationTime: Date.now(),
                        life: 0,
                        ttl: 1000,
                        r: 30,
                    });
                    player.isDead = true;
                    player.x = 9999;
                    player.y = 9999;
                    player.hp = 0;
                    player.hasWater = true;
                    player.respawnTimer = 5;
                    player.deathTime = Date.now();
                    console.log(
                        `${
                            usernames[socket.id]
                                ? usernames[socket.id]
                                : socket.id.substring(4)
                        } killed ${ply[0]} with a melee attack`
                    );
                } else {
                    //gameState.particles.push({ x: sx, y: sy, col: "255,0,0", creationTime: Date.now(), scaleRate: 0, life: 0, ttl: 1000, r: 5 });
                }
            }
        });
        //gameState.particles.push({ x: ply.x + x, y: ply.y + y, col: "255,0,255", creationTime: Date.now(), scaleRate: 0, life: 0, ttl: 1000, r: 30 });
        /* var rectA = { x: ply.x, y: ply.y, w: 2, h: 2 };
        var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
        var xOverlap = valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
            valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
        var yOverlap = valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
            valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
        if (yOverlap && xOverlap) ret = obj;
        gameState.grenades.push(grenade);
        ply.canGrenade = false; */
    });
    socket.on("tossgrenade", (md) => {
        if (gameIsEnding) return;
        var ply = gameState.players[socket.id];
        if (!ply)
            return console.log("[warning] invalid player tossed grenade?");
        if (!ply.canFire || ply.isDead || ply.isSelectingPrimary) return;
        var mx = md[0];
        var my = md[1];
        var px = md[2];
        var py = md[3];
        var gi = md[4];
        var x = mx - px;
        var y = my - py;
        var l = Math.sqrt(x * x + y * y);
        x = x / l;
        y = y / l;
        var grenade = gameState.grenades.find((g) => {
            return g.id == gi;
        });
        if (!grenade) {
            return setTimeout(() => {
                ply.canGrenade = true;
            }, 6000);
        }
        grenade.x = ply.x;
        grenade.y = ply.y;
        grenade.dx = x * 3;
        grenade.dy = y * 3;
        grenade.isPrimed = false;
        grenade.isMoving = true;
        grenade.createTime = Date.now();
        io.emit("sound", "grenade_toss");
        setTimeout(() => {
            ply.canGrenade = true;
        }, 6000);
    });
    socket.on("rocket", (md) => {
        if (gameIsEnding) return;
        var ply = gameState.players[socket.id];
        ply.lastAttack = Date.now();
        var mx = md[0];
        var my = md[1];
        var px = md[2];
        var py = md[3];
        var bullet = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            lastPosX: 0,
            lastPosY: 0,
            owner: socket.id,
        };
        var x = mx - px;
        var y = my - py;
        var sp = 0;
        var l = Math.sqrt(x * x + y * y);
        x = (x / l) * 100;
        y = (y / l) * 100;
        x = x + (Math.random() * sp - sp / 2);
        y = y + (Math.random() * sp - sp / 2);
        var l = Math.sqrt(x * x + y * y);
        x = x / l;
        y = y / l;
        bullet.x = ply.x;
        bullet.y = ply.y;
        bullet.lastPosX = ply.x;
        bullet.lastPosY = ply.y;
        bullet.dx = x * 10;
        bullet.dy = y * 10;
        gameState.rockets.push(bullet);
    });
    socket.on("setweapon", (wep) => {
        if (gameIsEnding) return;
        if (!gameState.players[socket.id]) return;
        gameState.players[socket.id].weapon = wep;
        if (!enableInfiniteAmmoGlitch) {
            gameState.players[socket.id].isReloading = false;
            if (
                gameState.players[socket.id].wepClips[wep] == 0 &&
                !enableInfiniteAmmoGlitch &&
                !gameState.players[socket.id].isReloading
            ) {
                ply.isReloading = true;
                ply.canFire = false;
                ply.startedReloadingTime = Date.now();
                reloadSound(ply.weapon);
                setTimeout(() => {
                    ply.isReloading = false;
                    ply.canFire = true;
                    ply.wepClips[ply.weapon] = getWeaponData(
                        ply.weapon
                    ).clipSize;
                }, getWeaponData(ply.weapon).reloadTime);
            }
        }
    });
    socket.on("konalt_ping", (callback) => {
        callback();
    });
});

setInterval(() => {
    // Overheal drain
    Object.values(gameState.players).forEach((p) => {
        if (!p) return;
        if (p.hp > 100) p.hp--;
    });
}, 500);

var enableInfiniteAmmoGlitch = false;

function getWeaponData(wt) {
    if (wt == 100) {
        return { dmg: 10, name: "GrenadeBullet", draw: () => {} };
    }
    return gameState.weaponData[wt];
}

function rsize(inf, n) {
    var ns = inf.split(",").map(parseInt);
    if (n >= ns[0] && n <= ns[2]) {
        console.log("Resized!");
        return ns[1];
    }
    return n;
}

function loadMap(mapname) {
    try {
        var data = fs.readFileSync("./maps/" + mapname + ".map").toString();

        function bParse(str) {
            if (str.startsWith("$")) {
                return vars[str.substring(1)] ? vars[str.substring(1)] : 0;
            } else
                return parseInt(str).toString() == str
                    ? vars["__RECT_SIZER_INFO"]
                        ? rsize(vars["__RECT_SIZER_INFO"], parseInt(str))
                        : parseInt(str)
                    : str;
        }
        var map = {
            name: "unknown",
            width: 1633,
            height: 919,
            outofbounds: "black",
            background: "white",
            camera: true,
            geo: [],
            colliding: [],
            ents: {
                spawns: [],
                pickups: [],
            },
            gradients: [],
            grid: false,
        };
        var vars = {
            Height: map.height,
            Width: map.width,
            OOBCol: map.outofbounds,
            Name: map.name,
            BGCol: map.background,
        };
        data.split("\r\n").forEach((line, num) => {
            var lineData = line.split(" ");
            if (lineData[0].startsWith("--")) return;
            lineData = lineData.map((w) => bParse(w));
            lineData = lineData
                .join(" ")
                .split(" ")
                .map((w) => bParse(w)); // we do this to accomodate variables with spaces
            console.log(lineData);
            var layer2 = false;
            var collides = false;
            var destructible = false;
            var playerclip = false;
            if (lineData[0].startsWith("layer2-")) {
                layer2 = true;
                lineData[0] = lineData[0].substring("layer2-".length);
            }
            if (lineData[0].startsWith("collides-")) {
                collides = true;
                lineData[0] = lineData[0].substring("collides-".length);
            }
            if (lineData[0].startsWith("playerclip-")) {
                playerclip = true;
                lineData[0] = lineData[0].substring("playerclip-".length);
            }
            if (lineData[0].startsWith("destroy-")) {
                destructible = true;
                lineData[0] = lineData[0].substring("destroy-".length);
            }
            var obj;
            var obj2;
            if (lineData[0] == "name") {
                map.name = lineData[1];
            } else if (lineData[0] == "background") {
                map.background = lineData[1];
            } else if (lineData[0] == "outofbounds") {
                map.outofbounds = lineData[1];
            } else if (lineData[0] == "width") {
                map.width = lineData[1];
            } else if (lineData[0] == "height") {
                map.height = lineData[1];
            } else if (lineData[0] == "camera") {
                map.camera = lineData[1] != "0";
            } else if (lineData[0] == "bglayer2") {
                map.bglayer2 = lineData[1] != "0";
            } else if (lineData[0] == "grid") {
                map.grid = lineData[1] != "0";
            } else if (lineData[0] == "var") {
                vars[lineData[1]] = lineData.slice(2).join(" ");
            } else if (lineData[0] == "spawnpoint") {
                map.ents.spawns.push({
                    x: lineData[1],
                    y: lineData[2],
                });
            } else if (lineData[0] == "line") {
                obj = {
                    type: "line",
                    x1: lineData[1],
                    y1: lineData[2],
                    x2: lineData[3],
                    y2: lineData[4],
                    col: lineData[5],
                    thickness: parseInt(lineData[6]),
                    geoId: lineData[7],
                    layer2: layer2,
                    collides: collides,
                    health: 100,
                    playerclip: playerclip,
                };
            } else if (lineData[0] == "ent") {
                switch (lineData[1]) {
                    case "scarface_line":
                        obj = {
                            type: "line",
                            x1: lineData[2],
                            y1: lineData[3],
                            x2: lineData[2] + 145,
                            y2: lineData[3],
                            col: "black",
                            thickness: 4,
                            geoId: "x",
                            layer2: false,
                            collides: false,
                            health: 100,
                            playerclip: false,
                        };
                        break;
                    case "window":
                        var vertical = lineData[5] == "v";
                        var walled = false;
                        var thickness = 12;
                        collides = true;
                        destructible = true;
                        obj = {
                            type: "rect",
                            x1:
                                (vertical ? thickness / 2 - 1 : 0) +
                                lineData[2],
                            y1:
                                (vertical ? 0 : thickness / 2 - 1) +
                                lineData[3],
                            x2: vertical ? thickness : lineData[4],
                            y2: vertical ? lineData[4] : thickness,
                            col: "rgba(131, 220, 252, 0.5)",
                            geoId: "Window" + num,
                            layer2: false,
                            collides: true,
                            destructible: true,
                            health: 1,
                            playerclip: false,
                        };
                        obj2 = {
                            type: "rect",
                            x1: lineData[2],
                            y1: lineData[3],
                            x2: vertical ? 22 : lineData[4],
                            y2: vertical ? lineData[4] : 22,
                            col: vars["wdark"],
                            geoId: "Door" + num,
                            layer2: false,
                            collides: false,
                            destructible: false,
                            health: 100,
                            playerclip: true,
                        };
                        break;
                    case "door":
                        var vertical = lineData[5] == "v";
                        var thickness = 15;
                        collides = true;
                        obj = {
                            type: "rect",
                            x1:
                                (vertical ? thickness - 22 / 2 : 0) +
                                lineData[2],
                            y1:
                                (vertical ? 0 : thickness - 22 / 2) +
                                lineData[3],
                            x2: vertical ? thickness : lineData[4],
                            y2: vertical ? lineData[4] : thickness,
                            col: "#8c4100",
                            geoId: "Door" + num,
                            layer2: false,
                            collides: true,
                            destructible: false,
                            health: 100,
                            playerclip: false,
                        };
                        break;
                    case "healthpack":
                        map.ents.pickups.push({
                            type: "healthpack",
                            x: lineData[2],
                            y: lineData[3],
                            active: true,
                        });
                        break;
                    default:
                        console.log(
                            '[warning] unrecognized ent "' +
                                lineData[1] +
                                '" on line ' +
                                num
                        );
                }
            } else if (lineData[0] == "grad") {
                map.gradients.push({
                    type: "linear",
                    x1: lineData[1],
                    y1: lineData[2],
                    x2: lineData[3],
                    y2: lineData[4],
                    col1: lineData[5],
                    col2: lineData[6],
                    id: lineData[7],
                });
            } else if (lineData[0] == "curve") {
                obj = {
                    type: "curve",
                    x1: lineData[1],
                    y1: lineData[2],
                    x2: lineData[3],
                    y2: lineData[4],
                    x3: lineData[5],
                    y3: lineData[6],
                    col: lineData[7],
                    thickness: parseInt(lineData[8]),
                    geoId: lineData[9],
                    layer2: layer2,
                    collides: collides,
                    health: 100,
                    playerclip: playerclip,
                };
            } else if (lineData[0] == "rect") {
                obj = {
                    type: "rect",
                    x1: lineData[1] == 0 ? -10 : lineData[1],
                    y1: lineData[2] == 0 ? -10 : lineData[2],
                    x2:
                        (lineData[1] == 0 ||
                        lineData[1] + lineData[3] == map.width
                            ? 10
                            : 0) + lineData[3],
                    y2:
                        (lineData[2] == 0 ||
                        lineData[2] + lineData[4] == map.height
                            ? 10
                            : 0) + lineData[4],
                    col: lineData[5],
                    geoId: lineData[6],
                    layer2: layer2,
                    collides: collides,
                    destructible: destructible,
                    health: 100,
                    playerclip: playerclip,
                };
            } else if (lineData[0] == "strokerect") {
                obj = {
                    type: "strokerect",
                    x1: lineData[1],
                    y1: lineData[2],
                    x2: lineData[3],
                    y2: lineData[4],
                    col: lineData[5],
                    thickness: parseInt(lineData[6]),
                    geoId: lineData[7],
                    layer2: layer2,
                    collides: collides,
                    health: 100,
                    playerclip: playerclip,
                };
            } else if (lineData[0] == "roundrect") {
                obj = {
                    type: "roundrect",
                    x1: lineData[1],
                    y1: lineData[2],
                    x2: lineData[3],
                    y2: lineData[4],
                    col: lineData[5],
                    radius: parseInt(lineData[6]),
                    geoId: lineData[7],
                    layer2: layer2,
                    collides: collides,
                    health: 100,
                    playerclip: playerclip,
                };
            } else if (lineData[0] == "strokeroundrect") {
                obj = {
                    type: "strokeroundrect",
                    x1: lineData[1],
                    y1: lineData[2],
                    x2: lineData[3],
                    y2: lineData[4],
                    col: lineData[5],
                    radius: parseInt(lineData[6]),
                    thickness: parseInt(lineData[7]),
                    geoId: lineData[8],
                    layer2: layer2,
                    collides: collides,
                    health: 100,
                    playerclip: playerclip,
                };
            } else if (lineData[0] == "circ") {
                obj = {
                    type: "circ",
                    x1: lineData[1],
                    y1: lineData[2],
                    r: lineData[3],
                    col: lineData[4],
                    thickness: parseInt(lineData[5]),
                    geoId: lineData[6],
                    layer2: layer2,
                    collides: collides,
                    health: 100,
                    playerclip: playerclip,
                };
            } else {
                console.log(
                    '[warning] unknown declaration "' +
                        lineData[0] +
                        '" in ' +
                        mapname +
                        ".map" +
                        " at line " +
                        num
                );
            }
            if (obj2) {
                map.geo.push(obj2);
                if (obj2.collides || obj2.playerclip) map.colliding.push(obj2);
            }
            if (obj) {
                map.geo.push(obj);
                if (collides || playerclip) map.colliding.push(obj);
            }
        });
        // out of bounds drawing
        map.geo.push({
            type: "rect",
            x1: -1633 / 2,
            y1: -919 / 2,
            x2: map.width + 1633,
            y2: 919 / 2,
            col: map.outofbounds,
            geoId: "#OOBRect0",
            layer2: map.bglayer2,
            collides: false,
            destructible: false,
            health: 100,
            playerclip: false,
        });
        map.geo.push({
            type: "rect",
            x1: -1633 / 2,
            y1: -919 / 2,
            x2: 1633 / 2,
            y2: map.height + 919,
            col: map.outofbounds,
            geoId: "#OOBRect1",
            layer2: map.bglayer2,
            collides: false,
            destructible: false,
            health: 100,
            playerclip: false,
        });
        map.geo.push({
            type: "rect",
            x1: map.width,
            y1: -919 / 2,
            x2: 1633 / 2,
            y2: map.height + 919 / 2,
            col: map.outofbounds,
            geoId: "#OOBRect2",
            layer2: map.bglayer2,
            collides: false,
            destructible: false,
            health: 100,
            playerclip: false,
        });
        map.geo.push({
            type: "rect",
            x1: -1633 / 2,
            y1: map.height,
            x2: map.width + 1633,
            y2: 919 / 2,
            col: map.outofbounds,
            geoId: "#OOBRect3",
            layer2: map.bglayer2,
            collides: false,
            destructible: false,
            health: 100,
            playerclip: false,
        });
        return map;
    } catch (e) {
        console.log("Unable to load map " + mapname);
        console.log(e);
    }
}

var botData = {};
var navData = {};

var killCounts = {};

var botSettings = {
    ignore_bots: false,
    ignore_players: false,
    show_ks: false,
    weapon: 0,
    ai_enabled: true,
};

function shootSound(wep) {
    switch (getWeaponData(wep).name) {
        case "Revolver":
            io.emit("sound", "revolver_shoot");
            break;
        case "Laser Pistol":
            io.emit("sound", "laser_shoot");
            break;
        case "M16 Rifle":
            io.emit("sound", "ar_shoot");
            break;
        case "Shotgun":
            io.emit("sound", "shotgun_shoot");
            break;
        case "Flamethrower":
            // do nothing, flamethrower has a different
            // sound method!
            break;
        case "Sniper Rifle":
            io.emit("sound", "sniper_shoot");
            break;
        case "__melee_fists":
            io.emit("sound", "melee_fist");
            break;
        case "__melee_Dual Screwdrivers":
            io.emit("sound", "melee_fist");
            break;
        default:
            console.log(
                "Please add a shoot sound effect for weapon " +
                    getWeaponData(wep).name
            );
            break;
    }
}

function reloadSound(wep) {
    switch (getWeaponData(wep).name) {
        case "Revolver":
            io.emit("sound", "revolver_reload");
            break;
        case "Laser Pistol":
            io.emit("sound", "laser_reload");
            break;
        case "M16 Rifle":
            io.emit("sound", "ar_reload");
            break;
        case "Shotgun":
            io.emit("sound", "shotgun_reload");
            break;
        case "Sniper Rifle":
            io.emit("sound", "sniper_reload");
            break;
        default:
            console.log(
                "Please add a reload sound effect for weapon " +
                    getWeaponData(wep).name
            );
            break;
    }
}

function botGetRoute(source, dest, lwid) {
    var cr =
        botCachedRoutes.find(
            (route) =>
                route.from == source.id &&
                route.to == dest.id &&
                route.map == gameState.map.name
        ) ||
        botCachedRoutes.find(
            (route) =>
                route.to == source.id &&
                route.from == dest.id &&
                route.map == gameState.map.name
        );
    if (cr) {
        if (cr.to == source.id) cr.route.reverse();
        return cr.route;
    }
    var routes = [];

    function walk(wpt, vis, array = false) {
        vis.push(wpt.id);
        var conns = wpt.conns.filter((w) => !vis.includes(w));
        if (conns.length == 0 || conns.includes(dest.id)) {
            if (conns.includes(dest.id)) {
                vis.push(dest.id);
                return array
                    ? [100, vis.filter((y) => y != null).map(getWptFromId)]
                    : vis;
            } else {
                if (vis.includes(dest.id)) {
                    return array
                        ? [
                              100,
                              vis
                                  .slice(0, vis.indexOf(dest.id))
                                  .filter((y) => y != null)
                                  .map(getWptFromId),
                          ]
                        : vis.slice(0, vis.indexOf(dest.id));
                } else {
                    return null;
                }
            }
        }
        var x = [];
        for (let i = 0; i < conns.length; i++) {
            const w = conns[i];
            if (w == lwid) continue;
            if (array) {
                x.push(walk(getWptFromId(w), [...vis], false));
            } else {
                return walk(getWptFromId(w), vis, false);
            }
        }
        x = x.filter((y) => y != null).map((r) => r.map(getWptFromId));
        var rds = x
            .map(getRouteDist)
            .map((rd) => {
                return [Math.floor(rd[0]), rd[1]];
            })
            .sort((a, b) => a[0] - b[0]);
        return rds[rds.length - 1];
    }
    if (source.id == dest.id)
        return [source.conns[Math.floor(Math.random() * source.conns.length)]];
    source.conns.forEach((c) => {
        routes.push(walk(getWptFromId(c), [], true));
    });
    routes = routes.filter((r) => r != null);
    routes = routes.sort((a, b) => a[0] - b[0]);
    var ret = !routes[0] ? [source] : routes[0][1];
    botCachedRoutes.push({
        from: source.id,
        to: dest.id,
        route: ret,
        map: gameState.map.name,
    });
    logDebug("[route-caching] Caching route WP" + source.id + "-WP" + dest.id);
    return ret;
}

function botBulletWillHitWall(ply, md, tgt = null, isPlayer = true) {
    if (!ply) return console.log("[warning] invalid bot shot bullet?");
    if (isPlayer && (!ply.canFire || ply.isDead || ply.isSelectingPrimary))
        return true;
    var mx = md[0];
    var my = md[1];
    var px = md[2];
    var py = md[3];
    var bullet = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
    };
    var x = mx - px;
    var y = my - py;
    var l = Math.sqrt(x * x + y * y);
    x = x / l;
    y = y / l;
    bullet.x = ply.x;
    bullet.y = ply.y;
    bullet.dx = x * 10;
    bullet.dy = y * 10;
    var hit = false;
    var done = false;
    var t = 0;
    while (!done) {
        t++;
        if (t > 500) {
            done = true;
        }
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if (tgt == null) {
            Object.values(gameState.players).forEach((ply2) => {
                if (
                    !Object.is(ply, ply2) ||
                    ply2.isDead ||
                    ply2.isSelectingPrimary
                )
                    return;
                if (distance(ply2.x, ply2.y, bullet.x, bullet.y) < 30) {
                    done = true;
                    hit = false;
                }
            });
        } else if (distance(tgt.x, tgt.y, bullet.x, bullet.y) < 30) {
            done = true;
            hit = false;
        }
        if (isPlayer ? !isSafeBulletPos(bullet) : !isSafePos(bullet)) {
            hit = true;
            done = true;
        }
    }
    return hit;
}

function getWptFromId(id) {
    if (!navData.waypoints.find((wpt) => wpt.id == id))
        console.log("WAYPOINT ERROR: NO EXISTANT WAYPOINT " + id);
    return navData.waypoints.find((wpt) => wpt.id == id);
}

function getRouteDist(route) {
    var e = 0;
    for (let i = 0; i < route.length; i++) {
        const cur = route[i];
        const next = route[i + 1];
        if (!next) continue;
        e += distance(cur.x, cur.y, next.x, next.y);
    }
    return [e, route];
}

var botCachedRoutes = [];

function doBotAI(bot, botname) {
    function botGetClosestPlayer(skipDead) {
        var ignore_players = botSettings.ignore_players;
        var ignore_bots = botSettings.ignore_bots;
        var nearest = null;
        Object.entries(gameState.players).forEach((plydata) => {
            var ply = plydata[1];
            if (
                ply == bot ||
                ((ply.isSelectingPrimary || ply.isDead) && skipDead)
            )
                return;
            if (ignore_players && !plydata[0].startsWith("Bot")) return;
            if (ignore_bots && plydata[0].startsWith("Bot")) return;
            if (!nearest) nearest = plydata;
            if (
                distance(ply.x, ply.y, bot.x, bot.y) <
                distance(nearest[1].x, nearest[1].y, bot.x, bot.y)
            )
                nearest = plydata;
        });
        return nearest;
    }

    function getAngleToPos(x, y) {
        let gameY = bot.y;
        let gameX = bot.x;
        let mouseY = y;
        let mouseX = x;
        let theta = 0;

        if (mouseX > gameX) {
            theta =
                (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) /
                Math.PI;
        } else if (mouseX < gameX) {
            theta =
                180 +
                (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) /
                    Math.PI;
        } else if (mouseX == gameX) {
            if (mouseY > gameY) {
                theta = 90;
            } else {
                theta = 270;
            }
        }
        return Math.round(theta);
    }

    function botShootBullet(ply, md) {
        if (!ply) return console.log("[warning] invalid bot shot bullet?");
        if (!ply.canFire || ply.isDead || ply.isSelectingPrimary) return;
        ply.lastAttack = Date.now();
        var res = false;
        var wep = getWeaponData(ply.weapon);
        if (!wep.name.startsWith("__melee_"))
            res = checkShit(md, 30 + wep.barrelLength);
        var mx = md[0];
        var my = md[1];
        var px = md[2];
        var py = md[3];
        var x = mx - px;
        var y = my - py;
        if (aimingDebug) spawnDebugParticle(mx, my, "255,0,0");
        if (aimingDebug) spawnDebugParticle(px, py, "0,0,255");
        if (res || !ply.canFire) return;
        ply.lastAttack = Date.now();
        var l = Math.sqrt(x * x + y * y);
        x = (x / l) * (30 + wep.barrelLength);
        y = (y / l) * (30 + wep.barrelLength);

        if (!wep.name.startsWith("__melee_")) {
            useWeapon(getWeaponData(ply.weapon), [botname, ply], md, [
                ply.x + x,
                ply.y + y,
            ]);
        } else {
            var m = melee(md, [botname, ply]);
            ply.lastHand = Math.floor(Math.random() * 2);
            if (m) dealPlyDamage(m, 20, [m.x, m.y], botname);
        }
        ply.canFire = false;
        ply.wepClips[ply.weapon]--;
        shootSound(ply.weapon, botname);

        if (ply.wepClips[ply.weapon] == 0) {
            if (!ply)
                return console.log(
                    "[warning] invalid player attempted reload?"
                );
            if (
                ply.isDead ||
                ply.wepClips[ply.weapon] == getWeaponData(ply.weapon).clipSize
            )
                return;
            ply.isReloading = true;
            ply.canFire = false;
            ply.startedReloadingTime = Date.now();
            reloadSound(ply.weapon);
            setTimeout(() => {
                ply.isReloading = false;
                ply.canFire = true;
                ply.wepClips[ply.weapon] = getWeaponData(ply.weapon).clipSize;
            }, getWeaponData(ply.weapon).reloadTime);
            return;
        } else {
            setTimeout(() => {
                ply.canFire = true;
            }, getWeaponData(ply.weapon).fireRate);
        }
    }

    function botGetMoveVector(md) {
        var mx = md[0];
        var my = md[1];
        var px = md[2];
        var py = md[3];
        var x = mx - px;
        var y = my - py;
        var l = Math.sqrt(x * x + y * y);
        x = x / l;
        y = y / l;
        return [x * 10, y * 10];
    }

    function respawn(ply) {
        var spawn =
            gameState.map.ents.spawns[
                Math.floor(Math.random() * gameState.map.ents.spawns.length)
            ];
        if (!spawn) {
            console.log("[error] no valid spawn points!!!");
            ply.x = 100;
            ply.y = 100;
        } else {
            ply.x = spawn.x;
            ply.y = spawn.y;
        }
        ply.hp = 100;
        ply.hasWater = true;
        ply.isDead = false;
        ply.weapon = botSettings.weapon;
        ply.canFire = true;
        ply.wepClips = getMaxWepClips();
        ply.isReloading = false;
    }

    var data = botData[botname];

    if (!data) {
        r = reroute();
        botData[botname] = {
            current: botGetClosestWaypoint(bot),
            next: r[0],
            route: r,
            lastPosX: 9999,
            lastPosY: 9999,
            lastPosTime: Date.now(),
        };
        data = botData[botname];
    }

    function botHasVisitedWpt(wpt, visited) {
        return visited.filter((w) => w.id == wpt.id).length > 0;
    }

    function botGetClosestWaypoint(cur = null, skip = []) {
        var nearest = null;
        if (!cur) cur = { x: 9999, y: 9999, id: 9999 };
        navData.waypoints.forEach((wpt) => {
            if (botHasVisitedWpt(wpt, skip)) return;
            if (
                botBulletWillHitWall(
                    cur,
                    [wpt.x, wpt.y, cur.x, cur.y],
                    wpt,
                    false
                )
            )
                return;
            if (!nearest) {
                nearest = JSON.parse(JSON.stringify(wpt));
                return;
            }
            if (
                distance(wpt.x, wpt.y, cur.x, cur.y) <
                distance(nearest.x, nearest.y, cur.x, cur.y)
            ) {
                nearest = JSON.parse(JSON.stringify(wpt));
            }
        });
        return nearest;
    }

    function botGetFurthestWaypoint(cur = null, skip = []) {
        var nearest = null;
        if (!cur) cur = { x: 9999, y: 9999, id: 9999 };
        navData.waypoints.forEach((wpt) => {
            if (botHasVisitedWpt(wpt, skip)) return;
            if (!nearest) {
                nearest = JSON.parse(JSON.stringify(wpt));
                return;
            }
            if (
                distance(wpt.x, wpt.y, cur.x, cur.y) >=
                distance(nearest.x, nearest.y, cur.x, cur.y)
            ) {
                nearest = JSON.parse(JSON.stringify(wpt));
            }
        });
        return nearest;
    }

    function reroute(lw) {
        var lobotomy = false;
        if (!lobotomy) {
            var cp = botGetClosestPlayer(true) || botGetClosestPlayer(false);
            var cw = botGetClosestWaypoint(bot, []);
            var wp = cp
                ? botGetClosestWaypoint(cp[1], [])
                : botGetFurthestWaypoint(bot, []);
            var r;
            if (!wp || !cw || cw.id == wp.id) {
                return [wp];
            } else {
                var log = true;
                if (cw.conns.includes(wp.id)) {
                    r = [wp];
                    log = false;
                } else {
                    r = botGetRoute(cw, wp, lw);
                }
                if (r.length == 1) log = false;
                if (log)
                    logDebug(
                        "[bot] Bot route from WP" +
                            cw.id +
                            " to WP" +
                            wp.id +
                            ": " +
                            r.map((x) => x.id).join(" ")
                    );
                if (data) {
                    data.next = r[0];
                    data.route = r;
                }
                io.emit("nav_route", r);
                return r;
            }
        } else {
            var cp = botGetClosestPlayer(true) || botGetClosestPlayer(false);
            var cw = botGetClosestWaypoint(bot, []);
            var nw = null;
            cw.conns.forEach((pwi) => {
                if (pwi == lw) return;
                var pw = getWptFromId(pwi);
                var pd = distance(pw.x, pw.y, cp[1].x, cp[1].y);
                var nd = nw ? distance(nw.x, nw.y, cp[1].x, cp[1].y) : Infinity;
                if (pd < nd) {
                    nw = pw;
                }
            });
            logDebug("[fast-waypoints] next wp: " + nw.id);
            if (data) {
                data.next = nw;
                data.route = [nw];
                data.current = cw;
            }
            return [nw];
        }
    }
    var closestPlayer = botGetClosestPlayer(true);
    if (!data.next) reroute(NaN);
    if (distance(bot.x, bot.y, data.next.x, data.next.y) < 30) {
        if (data.route.length == 1) {
            reroute(data.current.id);
        }
    }
    if (closestPlayer && !closestPlayer[1].isDead) {
        if (
            distance(bot.x, bot.y, closestPlayer[1].x, closestPlayer[1].y) <
                30 + getWeaponData(bot.weapon).barrelLength &&
            !getWeaponData(bot.weapon).name.startsWith("__melee_")
        ) {
            bot.weapon = bot.loadout[2];
        } else {
            bot.weapon = bot.loadout[1];
        }
        if (
            !botBulletWillHitWall(
                bot,
                [closestPlayer[1].x, closestPlayer[1].y, bot.x, bot.y],
                closestPlayer[1]
            ) &&
            bot.canFire
        ) {
            bot.a = getAngleToPos(closestPlayer[1].x, closestPlayer[1].y);
            botShootBullet(bot, [
                closestPlayer[1].x,
                closestPlayer[1].y,
                bot.x,
                bot.y,
                closestPlayer[1].x,
                closestPlayer[1].y,
                bot.x,
                bot.y,
            ]);
        } else {
            // showoff moves
            bot.spr =
                distance(closestPlayer[1].x, closestPlayer[1].y, bot.x, bot.y) >
                400;
            bot.a += 10;
        }
    } else {
        // showoff moves
        bot.spr = false;
        bot.a += 10;
    }

    bot.u = false;
    bot.l = false;
    bot.d = false;
    bot.r = false;
    if (!data.next) reroute(NaN);
    var vec = botGetMoveVector([data.next.x, data.next.y, bot.x, bot.y]);
    var t = 0.4;
    if (vec[0] > t) bot.r = true;
    if (vec[0] < -t) bot.l = true;
    if (vec[1] > t) bot.d = true;
    if (vec[1] < -t) bot.u = true;
    if (!bot.isDead) {
        if (data.lastPosX == bot.x && data.lastPosY == bot.y) {
            if (data.lastPosTime > 300) {
                botData[botname] = false;
                data = botData[botname];
            }
        } else {
            data.lastPosX = parseInt(bot.x.toString());
            data.lastPosY = parseInt(bot.y.toString());
            data.lastPosTime = Date.now();
        }
    }
    if (bot.isDead && bot.respawnTimer < 0) {
        respawn(bot);
        botData[botname] = false;
        data = botData[botname];
    }
}

// this is a test !

function loadWaypoints(mapname) {
    try {
        var data = fs.readFileSync("./maps/" + mapname + ".nav").toString();
        var wpts = [];
        data.split("\r\n").forEach((line) => {
            var pconns = line
                .split(" ")
                .slice(3)
                .map((i) => {
                    return parseInt(i);
                })
                .sort();
            wpts.push({
                id: parseInt(line.split(" ")[0]),
                x: parseInt(line.split(" ")[1]),
                y: parseInt(line.split(" ")[2]),
                conns: pconns ? pconns : [],
            });
        });
        if (navSnap) {
            wpts = wpts.map((wpt) => {
                wpt.x = Math.round(wpt.x / 20) * 20;
                wpt.y = Math.round(wpt.y / 20) * 20;
                return wpt;
            });
        }
        navAutoFindConns(wpts);
        navData.waypoints = wpts;
        navAutoFindRoutes(wpts);
        return wpts;
    } catch (e) {
        console.log("Unable to load navfile " + mapname);
        console.log(e);
    }
}

function loadWaypointsAuto(map) {
    var steps = 50;
    var wpts = navAutoGetWaypoints(map, steps);
    navAutoFindConns(wpts, map.width / steps);
    navData.waypoints = wpts;
    navAutoFindRoutes(wpts);
    return wpts;
}

var tickrate = 60;

function loadSettings() {
    var data = fs.readFileSync("./settings.txt").toString();
    var options = {};
    data.split("\r\n").forEach((line) => {
        var a = line.split(" ")[0];
        var b = line.split(" ")[1];
        if (
            !isNaN(parseInt(line.split(" ")[1])) &&
            !line.split(" ")[1].endsWith("int")
        )
            b = parseInt(line.split(" ")[1]) == 1;
        if (
            !isNaN(parseInt(line.split(" ")[1])) &&
            line.split(" ")[1].endsWith("int")
        )
            b = parseInt(line.split(" ")[1]);
        options[a] = b;
    });
    console.log(options);
    enableInfiniteAmmoGlitch = options.infinite_ammo_glitch;
    navSnap = options.nav_snap;
    opt.bulletSelfDamage = options.bullet_self_damage;
    opt.bullet_ricochet_alt = options.bullet_ricochet_alt;
    opt.smokeGrenades = options.smoke_grenades;
    botSettings.weapon = gameState.weaponData[parseInt(options.bot_weapon)]
        ? parseInt(options.bot_weapon)
        : 1;
    tickrate = parseInt(options.sv_tickrate);
    opt.ricochet_chance = parseInt(options.bullet_ricochet_chance);
    botSettings.ignore_bots = options.bot_ignore_bots;
    botSettings.show_ks = options.bot_show_ks;
    botSettings.ignore_players = options.bot_ignore_players;
}

var navSnap = false;

function saveSettings() {
    var options = {};
    options.enable_infinite_ammo = enableInfiniteAmmoGlitch ? 1 : 0;
    options.nav_snap = navSnap ? 1 : 0;
    options.bot_show_ks = botSettings.show_ks ? 1 : 0;
    options.bot_ignore_bots = botSettings.ignore_bots ? 1 : 0;
    options.bot_ignore_players = botSettings.ignore_players ? 1 : 0;
    options.bot_weapon = botSettings.weapon + "int";
    options.sv_tickrate = tickrate + "int";
    options.bullet_ricochet_chance = opt.ricochet_chance + "int";
    options.bullet_self_damage = opt.bulletSelfDamage ? 1 : 0;
    options.bullet_ricochet_alt = opt.bullet_ricochet_alt ? 1 : 0;
    options.smoke_grenades = opt.smokeGrenades ? 1 : 0;
    var text = "";
    Object.entries(options).forEach((e) => {
        text += e.join(" ") + "\r\n";
    });
    fs.writeFileSync("./settings.txt", text.trim());
}

var maplist = fs.readFileSync("maps/maplist.txt").toString().split("\r\n");
var mapIndex = 0;

var sounds = fs.readFileSync("sounds.txt").toString().split("\r\n");
var textures = fs.readFileSync("textures.txt").toString().split("\r\n");

loadSettings();

var ticking = setInterval(tick, 1000 / tickrate);

function restartTick(newRate) {
    clearInterval(ticking);
    ticking = setInterval(tick, 1000 / newRate);
    tickrate = newRate;
    saveSettings();
}

function logDebug(text) {
    if (aimingDebug) console.log("[debug] " + text);
}

function navFindConnsSingular(wpt1, data, maxDist = Infinity) {
    var c = [...wpt1.conns];
    data.forEach((wpt2) => {
        if (wpt1.id == wpt2.id) return;
        if (distance(wpt1.x, wpt1.y, wpt2.x, wpt2.y) >= maxDist) return;
        var h = botBulletWillHitWall(
            wpt1,
            [wpt2.x, wpt2.y, wpt1.x, wpt1.y],
            wpt2,
            false
        );
        if (!h) {
            logDebug(
                "[nav] Found connection between waypoints " +
                    wpt1.id +
                    " and " +
                    wpt2.id
            );
            c.push(wpt2.id);
        }
    });
    return c;
}

function navAutoFindConns(wpts, maxDist) {
    var din = [...wpts];
    din.forEach((wpt1, i) => {
        logDebug("[nav] Finding connections for waypoint " + wpt1.id);
        din[i].conns = navFindConnsSingular(wpt1, wpts, maxDist);
    });
    return din;
}

function dumpNavRoutes(name) {
    var d = "";
    botCachedRoutes.forEach((r) => {
        d += `${r.from}-${r.to} ${r.route.map((x) => x.id).join("-")}\n`;
    });
    d = d.trim();
    fs.writeFileSync(name, d);
}

function loadNavRoutes(name) {
    var data = fs
        .readFileSync("maps/" + name + ".rts")
        .toString()
        .split("\n")
        .map((l) =>
            l.split(" ").map((s) =>
                s
                    .split("-")
                    .filter((n) => n.length > 0)
                    .map((n) => (isNaN(parseInt(n)) ? null : parseInt(n)))
            )
        );
    var t = [];
    data.forEach((line) => {
        var o = line[1]
            ? {
                  from: line[0][0],
                  to: line[0][1],
                  route: line[1].map(getWptFromId),
                  map: name,
              }
            : {
                  from: line[0][0],
                  to: line[0][1],
                  route: [],
                  map: name,
              };
        t.push(o);
    });
    botCachedRoutes = t;
}

function navAutoFindRoutes(wpts) {
    if (fs.existsSync("maps/" + maplist[mapIndex] + ".rts")) {
        loadNavRoutes(maplist[mapIndex]);
        return;
    }
    [...wpts].forEach((wpt1, i) => {
        [...wpts].forEach((wpt2) => {
            botGetRoute(wpt1, wpt2);
        });
    });
    dumpNavRoutes("maps/" + maplist[mapIndex] + ".rts");
}

function navAutoGetWaypoints(map, steps) {
    var o = [];
    var i = 0;
    for (let xm = 0; xm < steps; xm++) {
        for (let ym = 0; ym < steps; ym++) {
            var x = (map.width / steps) * xm;
            var y = (map.height / steps) * ym;
            if (!isSafePos({ x: x, y: y })) continue;
            o.push({
                id: clone(i),
                x: x,
                y: y,
                conns: [],
            });
            i++;
        }
    }
    return o;
}

gameState.map = loadMap(maplist[mapIndex]);

var auto = false;
navData.waypoints = auto
    ? loadWaypointsAuto(gameState.map)
    : loadWaypoints(maplist[mapIndex]);
