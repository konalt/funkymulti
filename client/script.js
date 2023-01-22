/**
 * @type {HTMLCanvasElement}
 */
var canvas = document.getElementById("upscaledcanvas");
var canvas2 = document.getElementById("drawcanvas");
var plyDrawCanvas = document.getElementById("playercanvas"); // we have to do all this just to bypass transparency
var navCanvas = document.getElementById("navcanvas");
var navCtx = navCanvas.getContext("2d");
var ctx = canvas2.getContext("2d");
var ctx2 = canvas.getContext("2d");
var _ctxref = ctx;

var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

var optscale = 1;
var params = new URLSearchParams(window.location.search);
if (params.get("viewportscale")) {
    optscale = parseFloat(params.get("viewportscale"))
        ? parseFloat(params.get("viewportscale"))
        : 1;
}

function properScale(cnv) {
    cnv.width = 1633 * optscale;
    cnv.height = 919 * optscale;
}

function updateOptScale() {
    if (window.innerWidth > window.innerHeight) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * (16 / 9);
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth * (9 / 16);
    }

    scale = 919 / canvas.height;

    properScale(canvas2);
    properScale(plyDrawCanvas);
    properScale(navCanvas);

    storedMouseX = storedMouseXUnscaled * scale;
    storedMouseY = storedMouseYUnscaled * scale;

    chatFontSize = 18;
}

updateOptScale();
window.onresize = () => {
    updateOptScale();
};

function sz(size) {
    var ref = refH();

    var ret = h * (size / ref);
    if (size == "__mapwidth") ret = w;
    if (size == "__mapheight") ret = h;
    return ret;
}

function un(size) {
    var ref = h;

    var ret = refH() * (size / ref);
    if (size == "__mapwidth") ret = w;
    if (size == "__mapheight") ret = h;
    return ret;
}

function sz2(size) {
    var ref = 919;

    var ret = h * (size / ref);
    if (size == "__mapwidth") ret = w;
    if (size == "__mapheight") ret = h;
    return ret;
}

function refW() {
    return 1633 * renderScale;
}

function refH() {
    return 919 * renderScale;
}

// another day of thanking god for stackoverflow
// modified version of https://stackoverfsdlow.com/a/3368118
function roundRect(x, y, w, h, radius, col, ctx = _ctxref) {
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + w - radius.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
    ctx.lineTo(x + w, y + h - radius.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
    ctx.lineTo(x + radius.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.fill();
}

function strokeRoundRect(x, y, w, h, radius, thickness, col, ctx = _ctxref) {
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
    ctx.strokeStyle = col;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + w - radius.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
    ctx.lineTo(x + w, y + h - radius.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
    ctx.lineTo(x + radius.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.stroke();
}

function drawRect(x, y, w, h, col, ctx = _ctxref) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
}

function drawStrokedRect(x, y, w, h, col, thickness, ctx = _ctxref) {
    ctx.strokeStyle = col;
    ctx.lineWidth = thickness;
    ctx.strokeRect(x, y, w, h);
}

function drawCirc(x, y, rad, col, outline = 0, ctx = _ctxref) {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, rad - outline / 2, 0, 2 * Math.PI);
    ctx.fill();
    if (outline != 0) {
        ctx.lineWidth = outline;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function drawLine(startX, startY, endX, endY, col, thickness, ctx = _ctxref) {
    ctx.strokeStyle = col;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawArrow(
    startX,
    startY,
    endX,
    endY,
    col,
    thickness,
    context = _ctxref
) {
    var headlen = 20; // length of head in pixels
    var dx = endX - startX;
    var dy = endY - startY;
    var angle = Math.atan2(dy, dx);
    context.beginPath();
    context.strokeStyle = col;
    context.lineWidth = thickness;
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineTo(
        endX - headlen * Math.cos(angle - Math.PI / 6),
        endY - headlen * Math.sin(angle - Math.PI / 6)
    );
    context.moveTo(endX, endY);
    context.lineTo(
        endX - headlen * Math.cos(angle + Math.PI / 6),
        endY - headlen * Math.sin(angle + Math.PI / 6)
    );
    context.stroke();
}

function preloadImage(path) {
    var img1 = new Image();
    img1.src = path;
    toLoad.push(path);
    img1.onload = function () {
        images[path] = img1;
        var allLoaded = true;
        toLoad.forEach((imgpath) => {
            if (!images[imgpath]) {
                allLoaded = false;
            }
        });
        if (allLoaded) {
            onAllLoaded();
        }
    };
}

var images = {};
var toLoad = [];
var onAllLoaded = () => {};

function clear() {
    ctx.clearRect(0, 0, w, h);
}

var heldKeys = [];
var justPressed = [];
var justReleased = [];
var typeKeys = [];

var pingSmoother = [0, 0, 0, 0, 0];

setInterval(() => {
    const start = Date.now();

    socket.emit("konalt_ping", () => {
        pingSmoother.shift();
        pingSmoother.push(Date.now() - start);
        netInfoMachineReadable.ping = Math.round(
            pingSmoother.reduce((a, b) => a + b, 0) / pingSmoother.length
        );
    });
}, 5000);

function font(size) {
    var fontname = "'Roboto', sans-serif";
    return size + "px " + fontname;
}

document.onkeydown = function (k) {
    if (k.key != "F5" && k.key != "F12" && k.key != "F11") k.preventDefault();
    typeKeys.push(k.key);
    if (!heldKeys.includes(k.code.toLowerCase())) {
        justPressed.push(k.code.toLowerCase());
        heldKeys.push(k.code.toLowerCase());
    }
};

document.onkeyup = function (k) {
    k.preventDefault();
    justReleased.push(k.code.toLowerCase());
    heldKeys = heldKeys.filter((hk) => {
        return hk != k.code.toLowerCase();
    });
};

canvas.onmousedown = function (e) {
    e.preventDefault();
    if (e.button == 0) {
        justPressed.push("mouse1");
        if (!heldKeys.includes("mouse1")) heldKeys.push("mouse1");
    }
};
canvas.onmouseup = function (e) {
    e.preventDefault();
    justReleased.push("mouse1");
    heldKeys = heldKeys.filter((hk) => {
        return hk != "mouse1";
    });
};
canvas.onwheel = function (event) {
    event.preventDefault();
    if (event.deltaY < 0) {
        justPressed.push("scrollup");
    } else {
        justPressed.push("scrolldown");
    }
};
var curslot = 1;

function getKey(key) {
    return heldKeys.includes(key.toLowerCase());
}

function getKeyDown(key) {
    return justPressed.includes(key.toLowerCase());
}

function getKeyUp(key) {
    return justReleased.includes(key.toLowerCase());
}

const socket = io("https://konalt.us.to:29401");
var tryConnectTime = Date.now();
var firstConnect = true;

socket.on("connect", () => {
    socket.emit("set_username", username);
    socket.emit("ply", defGameState.players.__local);
    loadSavedLoadoutData();
    firstConnect = false;
});

var isMovingUp = false;
var isMovingDown = false;
var isMovingLeft = false;
var isMovingRight = false;
var isSprinting = false;
var lastMoveData = "__nomove";
var heldGrenade = 0;

var blur = false;

function moveData() {
    return `${isMovingUp ? 1 : 0}${isMovingDown ? 1 : 0}${
        isMovingLeft ? 1 : 0
    }${isMovingRight ? 1 : 0}${isSprinting ? 1 : 0}${getAngle(
        storedMouseX,
        storedMouseY
    )}`;
}

var messagemode = false;
var typing = "";
var onMessageFinish = (message) => {};
var typingUpdate = (text) => {};
var triggerMessageFinishOnEscape = false;

var chat = [];

var cameraOffsets = [0, 0];
var forceEnableCamera = false;
var enableCamera = true;

function isCovered(ply) {
    var ret = false;
    gameState.map.geo.forEach((obj) => {
        if (!obj.layer2 || ret) return;
        switch (obj.type) {
            case "rect":
                var rectA = { x: ply.x - 0.5, y: ply.y - 0.5, w: 1, h: 1 };
                var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                ret = xOverlap && yOverlap;
                break;
            case "circ":
                var rectA = { x: ply.x - 0.5, y: ply.y - 0.5, w: 1, h: 1 };
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
                ret = xOverlap && yOverlap;
                break;
        }
    });
    gameState.smokeParticles.forEach((smk) => {
        if (ret) return;
        if (distance(smk.x, smk.y, ply.x, ply.y) < 100) ret = true;
    });
    return ret;
}

function saveLoadoutData(d) {
    var t = localStorage.getItem("funkymulti_loadout").split(":") || [
        -1, -1, -1, -1,
    ];
    t[d[0]] = d[1];
    localStorage.setItem("funkymulti_loadout", t.join(":"));
    return t;
}

function loadSavedLoadoutData() {
    var t =
        localStorage.getItem("funkymulti_loadout") ||
        [-1, -1, -1, -1].join(":");
    t.split(":").forEach((w, i) => {
        if (w == -1) return;
        socket.emit("choose_weapon", [i, w]);
    });
}

function draw() {
    try {
        clear();
        if (!document.hidden) {
            if (!gameState.players[socket.id]) {
                drawText(
                    w / 2,
                    50,
                    firstConnect || Date.now() - tryConnectTime > 5000
                        ? "Connecting..."
                        : "Unable to connect to server!",
                    "white",
                    font(24),
                    "center"
                );
            } else {
                var lp = gameState.players[socket.id];
                if (lp.isTyping != messagemode)
                    socket.emit("typing", messagemode);
                if (forceEnableCamera) {
                    enableCamera = true;
                } else {
                    enableCamera = gameState.map.camera;
                }
                if (enableCamera) {
                    if (gameState.players[socket.id].isDead) {
                        var lk = gameState.players[lp.lastKiller];
                        if (lk)
                            cameraOffsets = [
                                -lk.x + refW() / 2,
                                -lk.y + refH() / 2,
                            ];
                    } else {
                        cameraOffsets = [
                            -lp.x + refW() / 2,
                            -lp.y + refH() / 2,
                        ];
                    }
                } else {
                    cameraOffsets = [0, 0];
                }
                thisFrameCursorMode = CursorMode.Default;
                isMovingUp = getKey("keyw");
                isMovingDown = getKey("keys");
                isMovingLeft = getKey("keya");
                isMovingRight = getKey("keyd");
                isSprinting = getKey("shiftleft");
                if (
                    moveData() != lastMoveData &&
                    !messagemode &&
                    !lp.isSelectingPrimary
                ) {
                    socket.emit("move", moveData());
                    lastMoveData = moveData();
                }
                //socket.emit("ply", gameState.players.__local);
                if (getKeyDown("keyc") && !messagemode) {
                    highlighted({
                        x: storedMouseX - cameraOffsets[0],
                        y: storedMouseY - cameraOffsets[1],
                        px: lp.x,
                        py: lp.y,
                    });
                }
                if (getKeyDown("keyr") && !messagemode) {
                    socket.emit("reload_gun");
                }
                if (getKeyDown("keyy") && !messagemode) {
                    socket.emit("map_reload");
                }
                if (
                    getKeyDown("keyt") &&
                    !messagemode &&
                    !lp.isSelectingPrimary
                ) {
                    messagemode = true;
                    typing = "";
                    typeKeys = [];
                    onMessageFinish = function (text) {
                        socket.emit("send_message", text);
                    };
                    typingUpdate = () => {
                        return true;
                    };
                    triggerMessageFinishOnEscape = false;
                }
                /* if (getKeyDown("keyb") && !messagemode) {
                socket.emit("summon_russian_army");
            } */
                if (getKeyDown("bracketleft") && !messagemode) {
                    socket.emit("spawn_ai");
                }
                if (getKeyDown("keyx") && !messagemode) {
                    socket.emit("use_water");
                }
                if (gameState.players[socket.id].isDead) {
                    if (
                        getKeyDown("mouse1") &&
                        gameState.players[socket.id].respawnTimer < 0 &&
                        !messagemode
                    ) {
                        var text = "click here to respawn";
                        drawText(9999, 9999, "", "black", font(36), "left");
                        var textWidth = ctx.measureText(text).width;
                        var boxWidth = textWidth + 10;
                        var rect = {
                            x: w / 2 - boxWidth / 2,
                            y: (h / 12) * 5 - 36,
                            w: boxWidth,
                            h: 36 + 10,
                        };
                        if (
                            storedMouseX > rect.x &&
                            storedMouseX < rect.x + rect.w &&
                            storedMouseY > rect.y &&
                            storedMouseY < rect.y + rect.h
                        ) {
                            socket.emit("respawn");
                        }
                    }
                } else if (gameState.players[socket.id].isSelectingPrimary) {
                    var c = null;
                    // Primary Wep Click
                    var x = 0;
                    primaries.forEach((pline, j) => {
                        pline.forEach((_wepname, i) => {
                            var rect = {
                                x:
                                    w / 2 -
                                    (pline.length * (150 + 10)) / 2 +
                                    i * (150 + 10) +
                                    10 / 2,
                                y:
                                    h / 2 -
                                    (primaries.length * (125 + 10)) / 2 +
                                    j * (125 + 10) +
                                    10 / 2 -
                                    125 / 2,
                                w: 150,
                                h: 125,
                            };
                            if (
                                storedMouseX > rect.x &&
                                storedMouseX < rect.x + rect.w &&
                                storedMouseY > rect.y &&
                                storedMouseY < rect.y + rect.h
                            ) {
                                if (getKeyDown("mouse1")) c = [x, j];
                                setCursorMode(CursorMode.Click);
                            }
                            x++;
                        });
                    });
                    if (c != null) {
                        var slot = c[1];
                        var wep = c[0];
                        socket.emit("choose_weapon", [slot, wep]);
                        saveLoadoutData([slot, wep]);
                        if (messagemode) {
                            messagemode = false;
                            onMessageFinish(typing);
                        }
                    }
                    var rectB = {
                        x: w / 2 - 500 / 2,
                        y: (h / 12) * 10,
                        w: 500,
                        h: 52,
                    };
                    drawRect(rectB.x, rectB.y, rectB.w, rectB.h, "magenta");
                    if (
                        storedMouseX > rectB.x &&
                        storedMouseX < rectB.x + rectB.w &&
                        storedMouseY > rectB.y &&
                        storedMouseY < rectB.y + rectB.h
                    ) {
                        setCursorMode(CursorMode.Text);
                        if (getKeyDown("mouse1")) {
                            // start typing username
                            messagemode = true;
                            typing = username;
                            cursorPos = username.length;
                            typeKeys = [];
                            onMessageFinish = function (text) {
                                username = text;
                                localStorage.setItem(
                                    "funkymulti_username",
                                    text
                                );
                                socket.emit("set_username", text);
                            };
                            typingUpdate = (text) => {
                                drawText(
                                    9999,
                                    9999,
                                    "",
                                    "black",
                                    font(52),
                                    "center"
                                );
                                return (
                                    !text.includes(" ") &&
                                    ctx.measureText(text).width < 500 &&
                                    text !== "___NONAME___"
                                );
                            };
                            triggerMessageFinishOnEscape = true;
                        }
                    }
                    var text = "Join!";
                    drawText(9999, 9999, "", "black", font(52), "left");
                    var textWidth = ctx.measureText(text).width;
                    var boxWidth = textWidth + 10;
                    var rectB = {
                        x: w / 2 - boxWidth / 2 + (w / 4) * 1.5,
                        y: (h / 12) * 5 - 52,
                        w: boxWidth,
                        h: 52 + 10,
                    };
                    if (
                        storedMouseX > rectB.x &&
                        storedMouseX < rectB.x + rectB.w &&
                        storedMouseY > rectB.y &&
                        storedMouseY < rectB.y + rectB.h
                    ) {
                        // hovering over join btn
                        if (isJoinEligible) {
                            if (getKeyDown("mouse1")) {
                                socket.emit("ready");
                            }
                            setCursorMode(CursorMode.Click);
                        } else {
                            setCursorMode(CursorMode.NoEntry);
                        }
                    }
                    roundRect(
                        w / 2 - boxWidth / 2 + (w / 4) * 1.5,
                        (h / 12) * 5 - 52,
                        boxWidth,
                        52 + 10,
                        5,
                        isJoinEligible ? "white" : "gray"
                    );
                    drawText(
                        w / 2 + (w / 4) * 1.5,
                        (h / 12) * 5,
                        text,
                        "black",
                        font(52),
                        "center"
                    );
                } else {
                    var md;
                    if (!enableCamera) {
                        md = [
                            storedMouseX,
                            storedMouseY,
                            lp.x,
                            lp.y,
                            un(storedMouseX),
                            un(storedMouseY),
                            lp.x,
                            lp.y,
                        ];
                    } else {
                        md = [
                            un(storedMouseX) - cameraOffsets[0],
                            un(storedMouseY) - cameraOffsets[1],
                            lp.x,
                            lp.y,
                            un(storedMouseX) - cameraOffsets[0],
                            un(storedMouseY) - cameraOffsets[1],
                            lp.x,
                            lp.y,
                        ];
                    }
                    if (getWeaponData(lp.weapon).isAutomatic) {
                        if (getKey("mouse1") && !messagemode) {
                            socket.emit("shoot_bullet", md);
                        }
                    } else {
                        if (getKeyDown("mouse1") && !messagemode) {
                            socket.emit("shoot_bullet", md);
                        }
                    }
                }
                if (getKeyDown("digit2") && !messagemode) {
                    socket.emit("setweapon", lp.loadout[0]);
                    curslot = 0;
                }
                if (getKeyDown("digit1") && !messagemode) {
                    socket.emit("setweapon", lp.loadout[1]);
                    curslot = 1;
                }
                if (getKeyDown("digit3") && !messagemode) {
                    socket.emit("setweapon", lp.loadout[2]);
                    curslot = 2;
                }
                if (getKeyDown("scrollup") && !messagemode) {
                    curslot++;
                    if (curslot > 2) curslot = 0;
                    socket.emit("setweapon", lp.loadout[curslot]);
                }
                if (getKeyDown("scrolldown") && !messagemode) {
                    curslot--;
                    if (curslot < 0) curslot = 2;
                    socket.emit("setweapon", lp.loadout[curslot]);
                }
                if (
                    (getKeyDown("keyq") || getKeyDown("keyv")) &&
                    !messagemode
                ) {
                    heldGrenade = Math.floor(Math.random() * 16384).toString();
                    socket.emit("primegrenade", heldGrenade);
                }
                if (getKeyDown("keyn") && !messagemode) {
                    showNetInfo = !showNetInfo;
                }
                if ((getKeyUp("keyq") || getKeyUp("keyv")) && !messagemode) {
                    socket.emit("tossgrenade", [
                        storedMouseX,
                        storedMouseY,
                        lp.x + cameraOffsets[0],
                        lp.y + cameraOffsets[1],
                        heldGrenade,
                    ]);
                }
                if (getKeyUp("mouse1") && !messagemode) {
                    socket.emit("mouseup");
                }
                if (getKeyDown("mouse1") && !messagemode) {
                    socket.emit("mousedown");
                }

                drawMap(gameState.map, false);
                gameState.map.ents.spawns.forEach((prt) => {
                    if (!prt.invis) drawSpawnpoint(prt);
                });
                Object.entries(gameState.players).forEach((ply) => {
                    if (
                        ply[0] == "__local" ||
                        ply[0] == localPlayerName ||
                        !ply[1]
                    )
                        return;
                    drawPlayer(
                        ply[1],
                        false,
                        usernames[ply[0]]
                            ? usernames[ply[0]]
                            : ply[0].substring(0, 6)
                    );
                });
                if (gameState.players[localPlayerName])
                    drawPlayer(
                        gameState.players[localPlayerName],
                        true,
                        socket.id
                    );
                gameState.bullets.forEach((bul) => {
                    drawBullet(bul);
                });
                gameState.particles.forEach((prt) => {
                    drawParticle(prt);
                });
                gameState.grenades.forEach((prt) => {
                    drawGrenade(prt);
                });
                gameState.rockets.forEach((bul) => {
                    drawRocket(bul);
                });
                gameState.flames.forEach((prt) => {
                    drawFlame(prt);
                });
                gameState.smokeParticles.forEach((prt) => {
                    drawSmokeParticle(prt);
                });
                drawMap(gameState.map, true);
                if (
                    gameState.players[localPlayerName] &&
                    isCovered(gameState.players[localPlayerName])
                )
                    drawPlayer(
                        gameState.players[localPlayerName],
                        true,
                        socket.id,
                        true
                    );
                if (!gameState.lightsOn) {
                    var holeSize = lp.isDead ? 0 : 0.3;
                    var fadeSize = 0.2;
                    var holePos = [
                        lp.x + cameraOffsets[0],
                        lp.y + cameraOffsets[1],
                    ];
                    var grad = ctx.createRadialGradient(
                        holePos[0],
                        holePos[1],
                        0,
                        holePos[0],
                        holePos[1],
                        (holeSize / 0.2) * 315
                    );
                    grad.addColorStop(holeSize, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(holeSize + fadeSize, "rgba(0, 0, 0, 1)");
                    grad.addColorStop(1, "rgba(0, 0, 0, 1)");

                    drawRect(0, 0, w, h, grad);
                } else if (!lp.isDead) {
                    ctx.scale(w / 100, h / 100);
                    var holeSize = 0.5;
                    var fadeSize = 0.3;
                    var holePos = [50, 50];
                    var grad = ctx.createRadialGradient(
                        holePos[0],
                        holePos[1],
                        0,
                        holePos[0],
                        holePos[1],
                        holeSize * 1.5 * 100
                    );
                    grad.addColorStop(holeSize, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(
                        holeSize + fadeSize,
                        "rgba(0, 0, 0, 0.7)"
                    );
                    grad.addColorStop(1, "rgba(0, 0, 0, 0.7)");
                    drawRect(0, 0, 100, 100, grad);
                    ctx.scale(100 / w, 100 / h);
                }
                if (gameState.russkiyPlane.isActive) {
                    drawRussianPlane();
                }
                if (lp.isDead || lp.isSelectingPrimary) {
                    if (isFirefox) ctx._blurRect(0, 0, w, h, 1 / 32); // Other browsers use SHITTY METHODS!!!!
                }
                drawHUD();
                if (showNetInfo && gameState.players[socket.id]) {
                    fps = Math.round(1000 / (Date.now() - lastFpsTime));
                    lastFpsTime = Date.now();
                    var netinfo =
                        `Info\n` +
                        Object.entries(netInfoMachineReadable)
                            .map((e) => e.join(": "))
                            .join("\n") +
                        "\nfps: " +
                        fps +
                        "\n" +
                        Object.entries(gameState.players[socket.id])
                            .map((e) => e.join(": "))
                            .join("\n") +
                        "\nserver mem usage: " +
                        storedMem;
                    ctx.font = font(16);
                    drawText(15, 15 + 10, netinfo, "white", font(16), "left");
                    if (navData.waypoints) {
                        navData.waypoints.forEach((wpt) => {
                            drawText(
                                wpt.x + cameraOffsets[0],
                                wpt.y + cameraOffsets[1],
                                wpt.id,
                                "red",
                                font(24),
                                "center"
                            );
                            wpt.conns.forEach((id) => {
                                var wpt2 = navData.waypoints.find(
                                    (x) => x.id == id
                                );
                                drawLine(
                                    wpt.x + cameraOffsets[0],
                                    wpt.y + cameraOffsets[1],
                                    wpt2.x + cameraOffsets[0],
                                    wpt2.y + cameraOffsets[1],
                                    "lime",
                                    2
                                );
                            });
                        });
                    }
                }
                /* if (getKeyDown("keyi") && !messagemode) {
                    renderScale -= 0.1;
                }
                if (getKeyDown("keyo") && !messagemode) {
                    renderScale += 0.1;
                }
                if (getKeyDown("keyp") && !messagemode) {
                    renderScale = 1;
                }
                if (getKeyDown("keyj") && !messagemode) {
                    if (optscale < 2) {
                        optscale += 0.1;
                        updateOptScale();
                    }
                }
                if (getKeyDown("keyk") && !messagemode) {
                    if (optscale > 0.15) {
                        optscale -= 0.1;
                        updateOptScale();
                    }
                }
                if (getKeyDown("keyl") && !messagemode) {
                    optscale = 1;
                    updateOptScale();
                } */
            }
            setCursorMode(thisFrameCursorMode, true);
            //drawText(0, h / 2, lastEv, "white", "33px sans-serif", "left");
            justPressed = [];
            justReleased = [];
            typeKeys = [];
            // Upscaling, bitch!
            //grab the context from your destination canvas
            var destCtx = canvas.getContext("2d");

            //call its drawImage() function passing it the source canvas directly
            destCtx.clearRect(0, 0, canvas.width, canvas.height);
            destCtx.drawImage(
                testing ? plyDrawCanvas : canvas2,
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
    } catch (e) {
        /**
         * @type {Error}
         */
        var err = e;
        drawText(
            w / 2,
            0,
            `${err.name}: ${err.message}\n${e.stack
                .split("\n")
                .slice(0, 5)
                .join("\n")}`,
            "red",
            font(24),
            "center"
        );
        console.log(e);
        justPressed = [];
    } finally {
        requestAnimationFrame(draw);
    }
}

var testing = false;

var lastEv = "INVALID";

var storedMouseX = 0,
    storedMouseY = 0;
var storedMouseXUnscaled = 0,
    storedMouseYUnscaled = 0;
canvas.onmousemove = function (evt) {
    storedMouseX = evt.offsetX * scale;
    storedMouseY = evt.offsetY * scale;
    storedMouseXUnscaled = evt.offsetX;
    storedMouseYUnscaled = evt.offsetY;
};

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width, // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y

    return {
        x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY, // been adjusted to be relative to element
    };
}

var netInfoMachineReadable = { ping: 0 };
var showNetInfo = false;
var lastFpsTime = Date.now();
var fps = 0;
var optimizedDivisionSteps = 10;

socket.on("gs", (data) => {
    localPlayerName = socket.id;
    var newData = { ...data };
    var newGeo = [];
    newData.map.geo.forEach((obj) => {
        if (
            obj.type != "rect" ||
            obj.col.includes("rgba") ||
            obj.disableSplitting ||
            !newData.map.camera
        ) {
            newGeo.push(obj);
        } else {
            for (let x = 0; x < optimizedDivisionSteps; x++) {
                for (let y = 0; y < optimizedDivisionSteps; y++) {
                    var newObj = Object.assign(
                        { ...obj },
                        {
                            x1: obj.x1 + x * (obj.x2 / optimizedDivisionSteps),
                            y1: obj.y1 + y * (obj.y2 / optimizedDivisionSteps),
                            x2:
                                obj.x2 / optimizedDivisionSteps +
                                (x == optimizedDivisionSteps - 1
                                    ? 0
                                    : obj.x2 * 0.1),
                            y2:
                                obj.y2 / optimizedDivisionSteps +
                                (y == optimizedDivisionSteps - 1
                                    ? 0
                                    : obj.y2 * 0.1),
                        }
                    );
                    newGeo.push(newObj);
                }
            }
        }
    });
    newData.map.geo = newGeo;
    gameState = newData;
    updateOptScale();
});
socket.on("wep_clips", (d) => {
    if (gameState.players[socket.id]) gameState.players[socket.id].wepClips = d;
});
var usernames = {};
socket.on("usernames", (data) => {
    usernames = data;
    if (!usernames[socket.id]) socket.emit("set_username", username);
});
socket.on("chat_clear", () => {
    chat = [];
});

function db(i) {
    return i == "1";
}

function di(i) {
    return parseInt(i);
}

function da(i) {
    if (!i) return "0,0";
    return i.split(",");
}

function dl(i) {
    try {
        return JSON.parse(i);
    } catch {
        return {};
    }
}

function parsePlayerData(plyd) {
    var final = {};
    plyd.split("\n").forEach((plystr) => {
        var ply = plystr.split(":");
        final[ply[0]] = {
            x: di(ply[1]),
            y: di(ply[2]),
            a: di(ply[3]),
            hp: di(ply[4]),
            u: db(ply[5]),
            d: db(ply[6]),
            l: db(ply[7]),
            r: db(ply[8]),
            spr: db(ply[9]),
            isDead: db(ply[10]),
            weapon: di(ply[11]),
            canFire: db(ply[12]),
            wepClips: da(ply[13]),
            isReloading: db(ply[14]),
            reloadTime: di(ply[15]),
            startedReloadingTime: di(ply[16]),
            respawnTimer: di(ply[17]),
            deathTime: di(ply[18]),
            chosenPrimary: di(ply[19]),
            isSelectingPrimary: db(ply[20]),
            canGrenade: db(ply[21]),
            hasWater: db(ply[22]),
            lastAttack: di(ply[23]),
            loadout: dl(ply[24]),
            lastHand: di(ply[25]),
            isMouseDown: db(ply[26]),
            lastKiller: ply[27],
            hexColor: ply[28],
            isTyping: db(ply[29]),
        };
    });
    return final;
}

function getWeaponData(wt) {
    return gameState.weaponData[wt];
}

function parseBulletData(buld) {
    var final = [];
    buld.split("\n").forEach((bulstr) => {
        var bul = bulstr.split(":");
        final.push({
            x: parseInt(bul[0]),
            y: parseInt(bul[1]),
            lastPosX: parseInt(bul[2]),
            lastPosY: parseInt(bul[3]),
            bultype: parseInt(bul[4]),
        });
    });
    return final;
}

function parseRocketData(rktd) {
    var final = [];
    rktd.split("\n").forEach((bulstr) => {
        var bul = bulstr.split(":");
        final.push({
            x: parseInt(bul[0]),
            y: parseInt(bul[1]),
            lastPosX: parseInt(bul[2]),
            lastPosY: parseInt(bul[3]),
        });
    });
    return final;
}

function parseSmokeData(buld) {
    var final = [];
    buld.split("\n").forEach((bulstr) => {
        var bul = bulstr.split(":");
        final.push({
            x: parseInt(bul[0]),
            y: parseInt(bul[1]),
            alpha: parseFloat(bul[2]),
        });
    });
    return final;
}

function parseFlameData(buld) {
    var final = [];
    buld.split("\n").forEach((bulstr) => {
        var bul = bulstr.split(":");
        final.push({
            x: parseInt(bul[0]),
            y: parseInt(bul[1]),
            alpha: parseFloat(bul[2]),
        });
    });
    return final;
}

function parseGrenadeData(buld) {
    var final = [];
    buld.split("\n").forEach((bulstr) => {
        var bul = bulstr.split(":");
        final.push({
            x: parseInt(bul[0]),
            y: parseInt(bul[1]),
            a: parseInt(bul[2]),
            isSmokeGrenade: bul[3] == 1,
        });
    });
    return final;
}

function parseParticleData(buld) {
    var final = [];
    buld.split("\n").forEach((bulstr) => {
        var bul = bulstr.split(":");
        if (!parseInt(bul[0])) return;
        final.push({
            x: parseInt(bul[0]),
            y: parseInt(bul[1]),
            col: bul[2],
            r: parseInt(bul[3]),
            life: parseInt(bul[4]),
            ttl: parseInt(bul[5]),
            scaleRate: parseFloat(bul[6]),
        });
    });
    return final;
}
socket.on("plyd", (data) => {
    gameState.players = parsePlayerData(data);
});
socket.on("rktd", (data) => {
    gameState.rockets = parseRocketData(data);
});
socket.on("buld", (data) => {
    gameState.bullets = parseBulletData(data);
});
socket.on("grnd", (data) => {
    gameState.grenades = parseGrenadeData(data);
});
socket.on("smkd", (data) => {
    gameState.smokeParticles = parseSmokeData(data);
});
socket.on("flmd", (data) => {
    gameState.flames = parseFlameData(data);
});
socket.on("prtd", (data) => {
    gameState.particles = parseParticleData(data);
});
socket.on("russkiy", (plane) => {
    gameState.russkiyPlane = plane;
});
socket.on("killstreak", (data) => {
    console.log(
        "Killstreak: " + data[0] + " has " + data[2] + " kills and " + data[1]
    );
    chat.push({
        author: "___NONAME___",
        content: data[0] + " " + data[1],
    });
});
socket.on("killstreak_end", (data) => {
    console.log(
        "Killstreak Ended: " +
            data[0] +
            " ended " +
            data[1] +
            "'s killstreak of " +
            data[2] +
            " kills"
    );
    chat.push({
        author: "___NONAME___",
        content: data[0] + " ended " + data[1] + "'s killstreak",
    });
});
socket.on("recieve_message", (message) => {
    chat.push(message);
});
/* socket.on("server_tp", (data) => {
    gameState.players.__local.x = parseInt(data.split(",")[0]);
    gameState.players.__local.y = parseInt(data.split(",")[1]);
}); */
var maptimer = 5 * 60 * 1000;
socket.on("timer", (data) => {
    maptimer = data;
});

function playSound(path, cb = function () {}) {
    var a = new Audio(path);
    a.play();
    a.addEventListener("ended", cb);
    return a;
}

function stopSound(a) {
    a.pause();
    a.currentTime = 0;
}
socket.on("sound", (soundname) => {
    playByteArray(soundname);
});

var nSounds = {};

socket.on("sound_loop", (soundname) => {
    if (nSounds[soundname[1]] && nSounds[soundname[1]].playbackRate.value != 0)
        return;
    nSounds[soundname[1]] = playByteArrayLooped(soundname[0]);
});
socket.on("stopsoundloop", (n) => {
    stopSoundN(n);
});

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}
socket.on("adv_sound", (sound) => {
    if (
        distance(
            sound[1],
            sound[2],
            gameState.players[socket.id].x,
            gameState.players[socket.id].y
        ) < sound[3]
    ) {
        playByteArray(sound[0]);
    }
});

preloadImage("image.png");

function clone(o) {
    if (typeof o == "number") {
        return parseInt(`${o}`);
    } else return o;
}

var pollServer = [Date.now(), Date.now()];

function serverTime() {
    var o = Date.now() - pollServer[0];
    return pollServer[1] + o;
}

socket.on("time", (t) => {
    pollServer = [Date.now(), t];
});

var plyDrawCtx = plyDrawCanvas.getContext("2d");

function drawPlayer(ply, self, name, transparent = false) {
    if (ply.isDead || ply.isSelectingPrimary || !getWeaponData(ply.weapon))
        return;
    var color = name.startsWith("Bot") ? "#aae5a4" : ply.hexColor;
    plyDrawCtx.clearRect(0, 0, plyDrawCanvas.width, plyDrawCanvas.height);
    var usableContext = transparent ? plyDrawCtx : ctx;
    var ply2 = Object.assign({}, ply);
    ply2.x = ply2.x + cameraOffsets[0];
    ply2.y = ply2.y + cameraOffsets[1];
    usableContext.translate(ply.x + cameraOffsets[0], ply.y + cameraOffsets[1]);
    usableContext.rotate((ply.a * Math.PI) / 180);
    usableContext.translate(
        -(ply.x + cameraOffsets[0]),
        -(ply.y + cameraOffsets[1])
    );
    var h = getWeaponData(ply.weapon).hands;
    var hands = h
        ? [
              [clone(h[0][0]), clone(h[0][1]), h[0][2] ? true : false], // its a fucking stupid js thing
              [clone(h[1][0]), clone(h[1][1]), h[1][2] ? true : false],
          ]
        : [0, 0, 0, 0];
    var selHand = ply.lastHand;
    var xOffset = 0;
    if (
        getWeaponData(ply.weapon).name.startsWith("__melee_") &&
        hands[selHand]
    ) {
        var w = getWeaponData(ply.weapon);
        var t = serverTime() - ply.lastAttack;
        var x = w.fireRate / 2;
        if (t < x) {
            xOffset = (t / x) * 20;
        } else if (t < w.fireRate) {
            xOffset = Math.abs(20 - ((t - x) / x) * 20);
        }
        hands[selHand][0] += xOffset;
    }
    if (getWeaponData(ply.weapon).hands) {
        var handLeft = hands[0];
        var handRight = hands[1];
        if (handLeft[2] && handLeft[0] != 900 && handLeft[1] != 900) {
            usableContext.translate(ply2.x + handLeft[0], ply2.y + handLeft[1]);
            usableContext.rotate((xOffset * 10 * Math.PI) / 180);
            drawCirc(0, 0, 9, color, 4, usableContext);
            usableContext.rotate((-xOffset * 10 * Math.PI) / 180);
            usableContext.translate(
                -(ply2.x + handLeft[0]),
                -(ply2.y + handLeft[1])
            );
        }
        if (handRight[2] && handRight[0] != 900 && handRight[1] != 900) {
            drawCirc(
                ply2.x + handRight[0],
                ply2.y + handRight[1],
                9,
                color,
                4,
                usableContext
            );
        }
    }
    eval(getWeaponData(ply.weapon).draw)(ply2, selHand, xOffset);
    drawCirc(
        ply.x + cameraOffsets[0],
        ply.y + cameraOffsets[1],
        30,
        color,
        5,
        usableContext
    );
    usableContext.drawImage(
        images["image.png"],
        ply.x + cameraOffsets[0] - 30,
        ply.y + cameraOffsets[1] - 30,
        60,
        60
    );
    /* if (showNetInfo) drawStrokedRect(ply.x - 30, ply.y - 30, 60, 60, "red", 2); */
    if (getWeaponData(ply.weapon).hands) {
        var handLeft = hands[0];
        var handRight = hands[1];
        if (!handLeft[2] && handLeft[0] != 900 && handLeft[1] != 900) {
            usableContext.translate(ply2.x + handLeft[0], ply2.y + handLeft[1]);
            usableContext.rotate((xOffset * 10 * Math.PI) / 180);
            drawCirc(0, 0, 9, color, 4, usableContext);
            usableContext.rotate((-xOffset * 10 * Math.PI) / 180);
            usableContext.translate(
                -(ply2.x + handLeft[0]),
                -(ply2.y + handLeft[1])
            );
        }
        if (!handRight[2] && handRight[0] != 900 && handRight[1] != 900) {
            drawCirc(
                ply2.x + handRight[0],
                ply2.y + handRight[1],
                9,
                color,
                4,
                usableContext
            );
        }
    }

    //drawRect((ply.x + 27.5), (ply.y - 5), (43), (10), "black");
    usableContext.setTransform(1, 0, 0, 1, 0, 0);
    strokeRoundRect(
        ply.x - 100 / 2 + cameraOffsets[0],
        ply.y - 45 + cameraOffsets[1],
        100,
        5,
        2.5,
        6,
        "black",
        usableContext
    );
    var underhealHp = ply.hp;
    var overhealHp = 0;
    if (underhealHp > 100) {
        overhealHp = underhealHp - 100;
        underhealHp = 100;
    }
    roundRect(
        ply.x - 100 / 2 + cameraOffsets[0],
        ply.y - 45 + cameraOffsets[1],
        (underhealHp / 100) * 100,
        5,
        2.5,
        "white",
        usableContext
    );
    if (overhealHp > 5) {
        roundRect(
            ply.x - 100 / 2 + cameraOffsets[0],
            ply.y - 45 + cameraOffsets[1],
            (overhealHp / 100) * 100,
            5,
            2.5,
            "#60d1db",
            usableContext
        );
    }
    if (!self) {
        drawText(
            ply.x + cameraOffsets[0],
            ply.y - 35 - 10 - 10 + cameraOffsets[1],
            name,
            "white",
            font(20),
            "center",
            usableContext
        );
    }
    if (ply.isTyping) {
        var minAlpha = 0.2;
        var maxAlpha = 0.75;
        var spd = 0.5;
        var alphas = [0, -2, -4].map((x) =>
            Math.max(
                Math.min(Math.sin(serverTime() * spd * 0.01 + x), maxAlpha),
                minAlpha
            )
        );
        var circSize = 5;
        alphas.forEach((a, i) => {
            drawCirc(
                ply.x -
                    alphas.length * circSize +
                    i * (circSize + 10) +
                    cameraOffsets[0],
                ply.y - 35 - 10 - 10 - 20 - 5 + cameraOffsets[1],
                circSize,
                "rgba(255,255,255," + a + ")"
            );
        });
    }
    if (transparent) {
        ctx.globalAlpha = 0.2;
        plyDrawCtx.fillStyle = "rgba(255,0,0,0.1)";
        plyDrawCtx.fillRect(0, 0, w, h);
        ctx.drawImage(plyDrawCanvas, 0, 0);
        ctx.globalAlpha = 1;
    }
}

function drawBullet(bul) {
    var wepd = getWeaponData(bul.bultype);
    if (!wepd) return;
    ctx.shadowBlur = 5 * (wepd.bulletBloomMult || 1);
    ctx.shadowColor = wepd.bulletColor || "#fffac7";
    var ang = getAngleArbitrary(bul.x, bul.y, bul.lastPosX, bul.lastPosY);
    ctx.translate(bul.x + cameraOffsets[0], bul.y + cameraOffsets[1]);
    ctx.rotate((ang * Math.PI) / 180);
    ctx.translate(-(bul.x + cameraOffsets[0]), -(bul.y + cameraOffsets[1]));
    ctx.lineCap = "butt";
    drawLine(
        bul.x + cameraOffsets[0],
        bul.y + cameraOffsets[1],
        bul.x + cameraOffsets[0] - 30 * (wepd.bulletLengthMult || 1),
        bul.y + cameraOffsets[1],
        wepd.bulletColor || "#fffbd4",
        5 * (wepd.bulletThicknessMult || 1)
    );
    ctx.lineCap = "butt";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.shadowBlur = 0;
}

function drawRocket(bul) {
    var ang = getAngleArbitrary(bul.x, bul.y, bul.lastPosX, bul.lastPosY);
    ctx.translate(bul.x + cameraOffsets[0], bul.y + cameraOffsets[1]);
    ctx.rotate((ang * Math.PI) / 180);
    ctx.translate(-(bul.x + cameraOffsets[0]), -(bul.y + cameraOffsets[1]));
    ctx.lineCap = "round";
    drawLine(
        bul.x + cameraOffsets[0],
        bul.y + cameraOffsets[1],
        bul.x + cameraOffsets[0] - 40,
        bul.y + cameraOffsets[1],
        "red",
        5
    );
    ctx.lineCap = "butt";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawParticle(prt) {
    // this seems to work. dont mess with it
    var alpha = (Math.abs(prt.life / prt.ttl - prt.ttl) - prt.ttl + 1) * 100;
    var scale = prt.r + (prt.life / prt.ttl) * prt.scaleRate * 100;
    drawCirc(
        prt.x + cameraOffsets[0],
        prt.y + cameraOffsets[1],
        scale,
        "rgba(" + prt.col + "," + alpha + "%)",
        0
    );
}

function drawGrenade(grn) {
    ctx.translate(grn.x + cameraOffsets[0], grn.y + cameraOffsets[1]);
    ctx.rotate((grn.a * Math.PI) / 180);
    ctx.translate(-(grn.x + cameraOffsets[0]), -(grn.y + cameraOffsets[1]));
    if (grn.isSmokeGrenade) {
        drawRect(
            grn.x + cameraOffsets[0] - 7.5,
            grn.y + cameraOffsets[1] - 10,
            15,
            20,
            "#62945c"
        );
        drawRect(
            grn.x + cameraOffsets[0] - 7.5,
            grn.y + cameraOffsets[1] + 2,
            15,
            4,
            "#b8b8b8"
        );
        drawStrokedRect(
            grn.x + cameraOffsets[0] - 7.5,
            grn.y + cameraOffsets[1] - 10,
            15,
            20,
            "black",
            3
        );
        drawRect(
            grn.x + cameraOffsets[0] - 5,
            grn.y + cameraOffsets[1] - 10 - 7,
            10,
            6,
            "grey"
        );
        drawStrokedRect(
            grn.x + cameraOffsets[0] - 5,
            grn.y + cameraOffsets[1] - 10 - 7,
            10,
            6,
            "black",
            3
        );
    } else {
        drawRect(
            grn.x + cameraOffsets[0] - 5,
            grn.y + cameraOffsets[1] - 20,
            10,
            15,
            "#3f6b1d"
        );
        drawStrokedRect(
            grn.x + cameraOffsets[0] - 5,
            grn.y + cameraOffsets[1] - 20,
            10,
            15,
            "black",
            3
        );
        drawCirc(
            grn.x + cameraOffsets[0],
            grn.y + cameraOffsets[1],
            10,
            "#4d9119",
            3
        );
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawSmokeParticle(grn) {
    drawCirc(
        grn.x + cameraOffsets[0],
        grn.y + cameraOffsets[1],
        100,
        "rgba(200,200,200," + grn.alpha + ")",
        0
    );
}

function drawFlame(grn) {
    if (!grn.x) return;
    var grad = ctx.createRadialGradient(
        grn.x + cameraOffsets[0],
        grn.y + cameraOffsets[1],
        0,
        grn.x + cameraOffsets[0],
        grn.y + cameraOffsets[1],
        90
    );
    grad.addColorStop(0.1, "rgba(255, 128, 0, 1)");
    grad.addColorStop(1, "rgba(255, 128, 0, 0)");
    ctx.globalAlpha = grn.alpha;
    drawCirc(grn.x + cameraOffsets[0], grn.y + cameraOffsets[1], 100, grad, 0);
    ctx.globalAlpha = 1;
}

function drawRussianPlane() {
    var plane = gameState.russkiyPlane;
    drawRect(
        plane.x + cameraOffsets[0],
        plane.y + cameraOffsets[1],
        300,
        300,
        "#325200"
    );
}

function drawSpawnpoint(sp) {
    drawCirc(sp.x + cameraOffsets[0], sp.y + cameraOffsets[1], 10, "#000000");
}

function getAngle(x, y) {
    let gameY = gameState.players[socket.id].y + cameraOffsets[1];
    let gameX = gameState.players[socket.id].x + cameraOffsets[0];
    let mouseY = y;
    let mouseX = x;
    let theta = 0;

    if (mouseX > gameX) {
        theta =
            (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) / Math.PI;
    } else if (mouseX < gameX) {
        theta =
            180 +
            (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) / Math.PI;
    } else if (mouseX == gameX) {
        if (mouseY > gameY) {
            theta = 90;
        } else {
            theta = 270;
        }
    }

    return Math.round(theta);
}

function getAngleArbitrary(x, y, x2, y2) {
    let gameY = y2;
    let gameX = x2;
    let mouseY = y;
    let mouseX = x;
    let theta = 0;

    if (mouseX > gameX) {
        theta =
            (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) / Math.PI;
    } else if (mouseX < gameX) {
        theta =
            180 +
            (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) / Math.PI;
    } else if (mouseX == gameX) {
        if (mouseY > gameY) {
            theta = 90;
        } else {
            theta = 270;
        }
    }

    return Math.round(theta);
}

var Weapon = {
    Glock17: 0,
    M16: 1,
};

var defGameState = {
    players: {
        __local: {
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
            weapon: 1,
            canFire: true,
            wepClips: null,
            isReloading: false,
            reloadTime: 0,
            startedReloadingTime: Date.now(),
            respawnTimer: 0,
            deathTime: Date.now(),
            chosenPrimary: 0,
            isSelectingPrimary: true,
            canGrenade: true,
            hasWater: true,
            loadout: [-1, -1, -1, -1],
            lastKiller: "error",
            hexColor: localStorage.getItem("funkymulti_hexcode") || "None",
            isTyping: false,
        },
    },
    map: {
        name: "UNKNOWN_CLERROR",
        background: "black",
        geo: [],
        colliding: [],
    },
    lightsOn: true,
    bullets: [],
    particles: [],
    smokeParticles: [],
    flames: [],
    curTime: Date.now(),
    russkiyPlane: {},
    weaponData: [
        {
            name: "_",
            dmg: 5,
            fireRate: 1,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
        },
        {
            name: "_",
            dmg: 5,
            fireRate: 1,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
        },
        {
            name: "_",
            dmg: 5,
            fireRate: 1,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
        },
        {
            name: "_",
            dmg: 5,
            fireRate: 1,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
        },
        {
            name: "_",
            dmg: 5,
            fireRate: 1,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
        },
        {
            name: "_",
            dmg: 5,
            fireRate: 1,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
        },
        {
            name: "_",
            dmg: 5,
            fireRate: 1,
            isAutomatic: false,
            draw: () => {},
            clipSize: 0,
        },
    ],
};
var gameState = { ...defGameState };

var ccodes = [
    "#000000",
    "#0000AA",
    "#00AA00",
    "#00AAAA",
    "#AA0000",
    "#AA00AA",
    "#FFAA00",
    "#AAAAAA",
    "#555555",
    "#5555FF",
    "#55FF55",
    "#55FFFF",
    "#FF5555",
    "#FF55FF",
    "#FFFF55",
    "#FFFFFF",
];
var textEscapeCode = /&[0-9a-fk-r]/g;

function escape(text) {
    return text.replace(textEscapeCode, "");
}

function drawText(
    x,
    y,
    text = "No text supplied",
    col = "red",
    font = font(48),
    align = "center",
    ctx = _ctxref
) {
    if (typeof text != "string") text = text.toString();
    ctx.fillStyle = col;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.lineWidth = 0.01;
    var lines = text.split("\n");
    var lineheight = parseInt(font) + 5;
    var textData = {
        color: col,
        isBold: false,
        isItalic: false,
        isUnderline: false,
    };
    for (var i = 0; i < lines.length; i++) {
        if (!lines[i]) continue;
        var matches = [];
        var j = 0;
        while ((match = textEscapeCode.exec(lines[i])) != null) {
            matches.push([match[0], match.index - j * 2]);
            j++;
        }
        lines[i] = lines[i].replace(textEscapeCode, "");
        var lineWidth = align == "center" ? ctx.measureText(lines[i]).width : 0;
        var xOffset = -lineWidth / 2;
        lines[i].split("").forEach((letter, index) => {
            var match = matches.filter((m) => m[1] == index)[
                matches.filter((m) => m[1] == index).length - 1
            ];
            if (match) {
                var matchCode = parseInt(match[0][1], 16);
                textData.color = ccodes[matchCode];
            }
            var txtW = ctx.measureText(letter).width;
            /* if (showNetInfo)
                drawStrokedRect(
                    x + xOffset,
                    y +
                        i * lineheight +
                        (1 - ctx.measureText(letter).actualBoundingBoxAscent),
                    txtW,
                    ctx.measureText(letter).actualBoundingBoxAscent +
                        ctx.measureText(letter).actualBoundingBoxDescent,
                    "red",
                    1
                ); */
            ctx.lineWidth = 0.01;
            ctx.fillStyle = textData.color;
            ctx.fillText(
                letter,
                x + xOffset + (align == "center" ? txtW / 2 : 0),
                y + i * lineheight
            );
            ctx.strokeText(
                letter,
                x + xOffset + (align == "center" ? txtW / 2 : 0),
                y + i * lineheight
            );
            xOffset += txtW;
        });
    }
}

function wrap(text, width) {
    function txtW(txt) {
        return ctx.measureText(escape(txt)).width;
    }
    var lines = [];
    var curLine = [];

    text.split(" ").forEach((word) => {
        if (txtW(curLine.join(" ")) > width) {
            lines.push(curLine.join(" "));
            curLine = [word];
        } else if (word.includes("\n")) {
            curLine.push(word.split("\n")[0]);
            lines.push(curLine.join(" "));
            curLine = [word.split("\n")[1]];
        } else {
            curLine.push(word);
        }
    });
    lines.push(curLine.join(" "));
    return lines.join("\n");
}

function drawTextWrapped(
    x,
    y,
    maxwidth,
    text = "No text supplied",
    col = "red",
    font = font(48),
    align = "center"
) {
    ctx.fillStyle = col;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.lineWidth = 0.01;
    text = wrap(text, maxwidth);
    var lines = text.split("\n");
    var lineheight = parseInt(font) + 5;
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineheight);
        ctx.strokeText(lines[i], x, y + i * lineheight);
    }
}

function makeEnum(a = []) {
    var d = {};
    a.forEach((b, c) => {
        d[b] = c + "_KonaltEnum";
    });
    return d;
}

var CursorMode = makeEnum([
    "Invisible",
    "Crosshair",
    "Default",
    "NoEntry",
    "Text",
    "Click",
]);

var drawCrosshair = true;
var thisFrameCursorMode = CursorMode.Default;

function setCursorMode(mode, final = false) {
    if (final) {
        switch (mode) {
            case CursorMode.Invisible:
                drawCrosshair = false;
                canvas.style = "cursor: none;";
                break;
            case CursorMode.Crosshair:
                drawCrosshair = true;
                canvas.style = "cursor: none;";
                break;
            case CursorMode.Default:
                drawCrosshair = false;
                canvas.style = "cursor: default;";
                break;
            case CursorMode.NoEntry:
                drawCrosshair = false;
                canvas.style = "cursor: not-allowed;";
                break;
            case CursorMode.Text:
                drawCrosshair = false;
                canvas.style = "cursor: text;";
                break;
            case CursorMode.Click:
                drawCrosshair = false;
                canvas.style = "cursor: pointer;";
                break;
        }
    } else {
        if (mode == CursorMode.Default) return;
        thisFrameCursorMode = mode;
    }
}

setCursorMode(CursorMode.Default);

var onlyColliding = false;

function shouldDraw(obj) {
    var ply = gameState.players[socket.id];
    if (!gameState.map.camera) return true;
    switch (obj.type) {
        case "rect":
        case "strokerect":
        case "roundrect":
        case "strokeroundrect":
            var lk = gameState.players[ply.lastKiller] || ply;
            var rectA = {
                x: (ply.isDead ? lk.x : ply.x) - 1633 / 2,
                y: (ply.isDead ? lk.y : ply.y) - 919 / 2,
                w: 1633,
                h: 919,
            };
            var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
            var xOverlap =
                valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
            var yOverlap =
                valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
            return xOverlap && yOverlap;
        case "line":
            var rectA = {
                x: ply.x - 1633 / 2,
                y: ply.y - 919 / 2,
                w: 1633,
                h: 919,
            };
            var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
            var xOverlap =
                valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
            var yOverlap =
                valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
            return xOverlap && yOverlap;
    }
    return true;
}

ctx.imageSmoothingEnabled = false;

function drawMap(map, layer2) {
    var ply = gameState.players[socket.id];
    if (!layer2) {
        drawRect(0, 0, w, h, "black");
        if (map.background.match(/@[A-z]+\.jpg:[0-9]+/)) {
            var imageName = map.background.substring(1).split(":")[0];
            var imageSize = parseInt(map.background.split(":")[1]);
            if (!images["texture/" + imageName]) {
                console.log("failed to preload image " + imageName);
            } else {
                var rcx = Math.ceil(map.width / imageSize);
                var rcy = Math.ceil(map.height / imageSize);
                for (let x = 0; x < rcx; x++) {
                    for (let y = 0; y < rcy; y++) {
                        ctx.drawImage(
                            images["texture/" + imageName],
                            cameraOffsets[0] + x * imageSize,
                            cameraOffsets[1] + y * imageSize,
                            imageSize,
                            imageSize
                        );
                    }
                }
            }
        } else {
            if (map.camera) {
                drawRect(0, 0, 1633, 919, map.background);
            } else {
                drawRect(0, 0, w, h, map.background);
            }
        }
    }
    var u = onlyColliding ? map.colliding : map.geo;
    u.forEach((obj) => {
        if (
            (obj.layer2 && !layer2) ||
            (!obj.layer2 && layer2) ||
            !shouldDraw(obj)
        )
            return;
        if (obj.bloom) {
            ctx.shadowBlur = obj.bloom || 1;
            ctx.shadowColor = obj.col;
        }
        switch (obj.type) {
            case "line":
                drawLine(
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.x2 + cameraOffsets[0],
                    obj.y2 + cameraOffsets[1],
                    obj.col,
                    obj.thickness
                );
                break;
            case "curve":
                ctx.beginPath();
                ctx.moveTo(
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1]
                );
                ctx.quadraticCurveTo(
                    obj.x3 + cameraOffsets[0],
                    obj.y3 + cameraOffsets[1],
                    obj.x2 + cameraOffsets[0],
                    obj.y2 + cameraOffsets[1]
                );
                ctx.lineWidth = obj.thickness;
                ctx.strokeStyle = obj.col;
                ctx.stroke();
                break;
            case "rect":
                if (!obj.col.match(/@[A-z]+\.jpg/) || obj.highlighted) {
                    if (showNetInfo) {
                        drawStrokedRect(
                            obj.x1 + cameraOffsets[0],
                            obj.y1 + cameraOffsets[1],
                            obj.x2,
                            obj.y2,
                            obj.highlighted ? "magenta" : obj.col,
                            2
                        );
                    } else {
                        drawRect(
                            obj.x1 + cameraOffsets[0],
                            obj.y1 + cameraOffsets[1],
                            obj.x2,
                            obj.y2,
                            obj.highlighted ? "magenta" : obj.col
                        );
                    }
                } else {
                    var imgName = obj.col.substring(1);
                    ctx.drawImage(
                        images["texture/" + imgName],
                        obj.x1 + cameraOffsets[0],
                        obj.y1 + cameraOffsets[1],
                        obj.x2,
                        obj.y2
                    );
                }
                break;
            case "roundrect":
                roundRect(
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.x2,
                    obj.y2,
                    obj.radius,
                    obj.highlighted ? "magenta" : obj.col
                );
                ctx.drawImage(
                    images["image.png"],
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.x2,
                    obj.y2
                );
                break;
            case "strokeroundrect":
                strokeRoundRect(
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.x2,
                    obj.y2,
                    obj.radius,
                    obj.thickness,
                    obj.highlighted ? "magenta" : obj.col
                );
                ctx.drawImage(
                    images["image.png"],
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.x2,
                    obj.y2
                );
                break;
            case "text":
                drawText(
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.text,
                    obj.col,
                    font(obj.fontsize),
                    "center"
                );
            case "circ":
                drawCirc(
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.r,
                    obj.highlighted ? "magenta" : obj.col,
                    obj.thickness
                );
                break;
            case "strokerect":
                drawStrokedRect(
                    obj.x1 + cameraOffsets[0],
                    obj.y1 + cameraOffsets[1],
                    obj.x2,
                    obj.y2,
                    obj.col,
                    obj.thickness
                );
                break;
            default:
                console.log(
                    'Drawing error: unrecognized type "' +
                        obj.type +
                        '" (' +
                        obj.geoId +
                        ")"
                );
                break;
        }
        if (obj.bloom) {
            ctx.shadowBlur = 0;
        }
    });
    if (!layer2 && map.grid) {
        var i = -200;
        while (i * 200 < map.width * 2) {
            drawLine(
                i * 200 + cameraOffsets[0],
                map.height * 10 + cameraOffsets[1],
                i * 200 + cameraOffsets[0],
                -map.height * 10 + cameraOffsets[1],
                "rgba(128,128,128,0.5)",
                5
            );
            i++;
        }
        var i = -200;
        while (i * 200 < map.width * 2) {
            drawLine(
                -map.width * 10 + cameraOffsets[0],
                i * 200 + cameraOffsets[1],
                map.width * 10 + cameraOffsets[0],
                i * 200 + cameraOffsets[1],
                "rgba(128,128,128,0.5)",
                5
            );
            i++;
        }
    }
    if (layer2 && map.bglayer2) {
        drawRect(
            -400 + cameraOffsets[0],
            -400 + cameraOffsets[1],
            400,
            map.height + 800,
            map.outofbounds
        );
        drawRect(
            -400 + cameraOffsets[0],
            -400 + cameraOffsets[1],
            map.width + 800,
            400,
            map.outofbounds
        );
        drawRect(
            -400 + cameraOffsets[0],
            -400 + cameraOffsets[1],
            map.width + 800,
            400,
            map.outofbounds
        );
    }
}

var renderScale = 1;

var sounds = {};
socket.on("sound_data", (snds) => {
    snds.forEach((sound_id) => {
        fetch("snd/" + sound_id + ".mp3")
            .then((response) => response.arrayBuffer())
            .then((response) => {
                audiocontext.decodeAudioData(response, function (__) {
                    sounds[sound_id] = __;
                });
            });
    });
});
socket.on("texture_data", (txts) => {
    txts.forEach((txt_id) => {
        preloadImage("texture/" + txt_id);
    });
});

window.onload = init;
var audiocontext; // Audio context
var source;

function init() {
    if (!window.AudioContext) {
        if (!window.webkitAudioContext) {
            alert("YER BROWSER IS SHIT! NO AUDIO!!!!");
            return;
        }
        window.AudioContext = window.webkitAudioContext;
    }
    audiocontext = new AudioContext();
}

var fixerupper = {};
var sources = {};

function playByteArray(sndID) {
    var gainNode = audiocontext.createGain();
    gainNode.gain.value = 0.1;
    gainNode.connect(audiocontext.destination);
    source = audiocontext.createBufferSource();
    source.buffer = sounds[sndID];
    source.connect(gainNode);
    source.start(0);
    if (!sources[sndID]) sources[sndID] = [];
    sources[sndID].push(source);
}

function playByteArrayLooped(sndID) {
    var gainNode = audiocontext.createGain();
    gainNode.gain.value = 0.1;
    gainNode.connect(audiocontext.destination);
    source = audiocontext.createBufferSource();
    source.buffer = sounds[sndID];
    source.connect(gainNode);
    source.loop = true;
    source.start(0);
    return source;
}

function stopSoundN(n) {
    if (nSounds[n]) {
        nSounds[n].playbackRate.value = 0;
        nSounds[n].stop();
    }
}

function valueInRange(val, min, max) {
    return val >= min && val <= max;
}

var chatFontSize, charsHoriz, charsVert;

chatFontSize = 18;

var username = "";
if (localStorage.getItem("funkymulti_username")) {
    username = localStorage.getItem("funkymulti_username");
}

var formattedScoreboard = [];

socket.on("scoreboard", (data) => {
    var tmp = {};
    Object.entries(data).forEach((i) => {
        Object.entries(i[1]).forEach((j) => {
            if (!tmp[j[0]]) {
                tmp[j[0]] = {};
            }
            tmp[j[0]][i[0]] = j[1];
        });
    });
    var tmp2 = [];
    Object.entries(tmp)
        .sort((a, b) => {
            return b[1].totalKills > a[1].totalKills;
        })
        .forEach((ln) => {
            tmp2.push([ln[0], ln[1]]);
        });
    formattedScoreboard = tmp2;
});

var gameOver = false;

socket.on("game_end", () => {
    gameOver = true;
});
socket.on("game_start", () => {
    gameOver = false;
});

var primaries = [
    ["Revolver", "Laser Pistol", "Desert Eagle"],
    [
        "M16 Rifle",
        "Double-Barrel\nShotgun",
        "Sniper Rifle",
        "Flamethrower",
        "Full Auto\nShotgun",
        "M249\nMachine Gun",
    ],
    ["Fists", "Dual\nScrewdrivers"],
    ["Frag\nGrenade", "Smoke\nGrenade", "Thermite\nGrenade"],
];

var isJoinEligible = false;

socket.on("join_ok", (d) => {
    isJoinEligible = d;
});

var cursorPos = 0;

var hexColors = {
    Red: "#ff0000",
    Orange: "#ff7700",
    Yellow: "#ffe100",
    Lime: "#00ff00",
    Green: "#009900",
    Aqua: "#00ffff",
    Blue: "#0000ff",
    Purple: "#8800ff",
    Pink: "#ff00e1",
};

function rectOverlap(x, y, rect) {
    return (
        x > rect.x && x < rect.x + rect.w && y > rect.y && y < rect.y + rect.h
    );
}

function drawHUD() {
    if (!gameState.players[socket.id]) return;
    //#region Game Over Scoreboard
    if (gameOver) {
        drawRect(0, 0, w, h, "rgba(0,0,0,0.75)");
        drawText(w / 2, h / 10, "Game Over!", "white", font(56), "center");
        formattedScoreboard.forEach((both, i) => {
            var boardCount = 6;
            if (i >= boardCount) return;
            var ply_id = both[0];
            var stats = both[1];
            var name = usernames[ply_id] ? usernames[ply_id] : ply_id;
            var singleHeight = 100;
            roundRect(
                w / 2 - 600 / 2,
                h / 2 -
                    (singleHeight * boardCount) / 2 +
                    (singleHeight + 5) * i,
                600,
                singleHeight,
                5,
                "black"
            );
            var dist = 600 / 2;
            var texts = ["  " + name, stats.totalKills + "  "];
            texts.forEach((txt, j) => {
                var align = "what";
                var add = 0;
                if (j == 0) {
                    align = "left";
                } else {
                    align = "right";
                    add = 1;
                }
                drawText(
                    w / 2 - 600 / 2 + dist * (j + add),
                    h / 2 -
                        (singleHeight * boardCount) / 2 +
                        (singleHeight + 5) * i +
                        singleHeight * 0.2 * 3,
                    txt,
                    "white",
                    font(singleHeight * 0.4),
                    align
                );
            });
        });
        return;
    }
    //#endregion
    var ply = gameState.players[socket.id];
    //#region Death screen
    if (ply.isDead) {
        drawRect(0, 0, w, h, "rgba(255,64,64,0.5)");
        drawText(w / 2, (h / 6) * 2, "u ded lol", "white", font(56), "center");
        if (ply.respawnTimer > 0) {
            drawText(
                w / 2,
                (h / 12) * 5,
                "wait " +
                    Math.ceil(ply.respawnTimer / 1000) +
                    " second" +
                    (Math.ceil(ply.respawnTimer / 1000) == 1 ? "" : "s"),
                "white",
                font(36),
                "center"
            );
        } else {
            var text = "click here to respawn";
            drawText(9999, 9999, "", "black", font(36), "left");
            var textWidth = ctx.measureText(escape(text)).width;
            var boxWidth = textWidth + 10;
            roundRect(
                w / 2 - boxWidth / 2,
                (h / 12) * 5 - 36,
                boxWidth,
                36 + 10,
                5,
                "white"
            );
            drawText(w / 2, (h / 12) * 5, text, "black", font(36), "center");
        }
    }
    //#endregion
    //#region Loadout Screen
    if (ply.isSelectingPrimary) {
        drawRect(0, 0, w, h, "rgba(0,0,0, 0.5)");
        drawText(w / 2, (h / 12) * 1.5, "Loadout", "white", font(56), "center");

        var infoTextX = (w / 10) * 8;
        // map text
        drawText(
            infoTextX,
            (h / 5) * 4,
            "Current Map",
            "white",
            font(48),
            "center"
        );
        drawText(
            infoTextX,
            (h / 5) * 4 + 48,
            gameState.map.name,
            "white",
            font(32),
            "center"
        );

        // game mode name
        drawText(
            infoTextX,
            (h / 5) * 3,
            "Current Gamemode",
            "white",
            font(48),
            "center"
        );
        drawText(
            infoTextX,
            (h / 5) * 3 + 48,
            "Free for All",
            "white",
            font(32),
            "center"
        );

        // the colors
        ctx.font = font(56);
        var offsetX = ctx.measureText("Player Colour").width / 2 + 15;
        var offsetY = h / 2;
        var colorSize = 75;
        var margin = 7.5;

        var totalHeight =
            Object.values(hexColors).length * (colorSize + margin) - margin;
        drawText(
            offsetX,
            h / 2 - totalHeight / 2 - 10,
            "Player Colour",
            "white",
            font(56),
            "center"
        );
        var xMax = 3;
        var n = 0;
        for (let y = 0; n < Object.values(hexColors).length; y++) {
            var xm = Math.min(xMax, Object.values(hexColors).length - n);
            for (let x = 0; x < xm; x++) {
                if (!Object.values(hexColors)[n]) continue;
                roundRect(
                    offsetX -
                        (xm / 2) * (colorSize + margin) +
                        margin / 2 +
                        x * (colorSize + margin),
                    offsetY - totalHeight / 2 + y * (colorSize + margin) + 10,
                    colorSize,
                    colorSize,
                    colorSize * 0.1,
                    Object.values(hexColors)[n]
                );
                if (ply.hexColor == Object.values(hexColors)[n])
                    strokeRoundRect(
                        offsetX -
                            (xm / 2) * (colorSize + margin) +
                            margin / 2 +
                            x * (colorSize + margin),
                        offsetY -
                            totalHeight / 2 +
                            y * (colorSize + margin) +
                            10,
                        colorSize,
                        colorSize,
                        colorSize * 0.1,
                        colorSize * 0.05,
                        "white"
                    );
                if (
                    rectOverlap(storedMouseX, storedMouseY, {
                        x:
                            offsetX -
                            (xm / 2) * (colorSize + margin) +
                            margin / 2 +
                            x * (colorSize + margin),
                        y:
                            offsetY -
                            totalHeight / 2 +
                            y * (colorSize + margin) +
                            10,
                        w: colorSize,
                        h: colorSize,
                    })
                ) {
                    if (getKeyDown("mouse1")) {
                        socket.emit("set_color", Object.values(hexColors)[n]);
                        localStorage.setItem(
                            "funkymulti_hexcode",
                            Object.values(hexColors)[n]
                        );
                    }
                    setCursorMode(CursorMode.Click);
                }
                n++;
            }
        }

        drawText(
            w / 2,
            (h / 12) * 10 - 10,
            "Name",
            "white",
            font(56),
            "center"
        );
        roundRect(w / 2 - 500 / 2, (h / 12) * 10, 500, 52 + 2.5, 5, "white");
        drawText(
            w / 2 - 500 / 2 + 5,
            (h / 12) * 10 + (50 - 7.5),
            username && !messagemode ? username : typing,
            "black",
            font(50),
            "left"
        );
        var textWidth = ctx.measureText(
            escape(
                (username && !messagemode ? username : typing).slice(
                    0,
                    cursorPos
                )
            )
        ).width;
        if (messagemode) {
            var curX = w / 2 - 500 / 2 + 5 + textWidth + 2;
            drawLine(
                curX,
                (h / 12) * 10 + 5,
                curX,
                (h / 12) * 10 + 50,
                "black",
                2
            );
        }

        // Primary wep draw
        var x = 0;
        primaries.forEach((pline, j) => {
            pline.forEach((wepname, i) => {
                var rectB = {
                    x:
                        w / 2 -
                        (pline.length * (150 + 10)) / 2 +
                        i * (150 + 10) +
                        10 / 2,
                    y:
                        h / 2 -
                        (primaries.length * (125 + 10)) / 2 +
                        j * (125 + 10) +
                        10 / 2 -
                        125 / 2,
                    w: 150,
                    h: 125,
                };
                if (ply.loadout[j] == x) {
                    strokeRoundRect(
                        rectB.x,
                        rectB.y,
                        rectB.w,
                        rectB.h,
                        5,
                        5,
                        "white"
                    );
                }
                roundRect(rectB.x, rectB.y, rectB.w, rectB.h, 5, "gray");
                drawText(
                    rectB.x + 150 / 2,
                    rectB.y + 24,
                    wepname,
                    "white",
                    font(24),
                    "center"
                );
                x++;
            });
        });
        var text = "Join!";
        drawText(9999, 9999, "", "black", font(52), "left");
        var textWidth = ctx.measureText(escape(text)).width;
        var boxWidth = textWidth + 10;
        roundRect(
            w / 2 - boxWidth / 2 + (w / 4) * 1.5,
            (h / 12) * 5 - 52,
            boxWidth,
            52 + 10,
            5,
            isJoinEligible ? "white" : "gray"
        );
        drawText(
            w / 2 + (w / 4) * 1.5,
            (h / 12) * 5,
            text,
            "black",
            font(52),
            "center"
        );
    } else {
        setCursorMode(CursorMode.Crosshair);
    }
    //#endregion
    //#region Timer
    var timerDate = new Date(maptimer);
    var minutesLeft = timerDate.getMinutes().toString();
    var secondsLeft = timerDate.getSeconds().toString().padStart(2, "0");
    var text = `${minutesLeft}:${secondsLeft}`;
    ctx.font = font(56);
    var textWidth = ctx.measureText(escape(text)).width;
    roundRect(
        w / 2 -
            (textWidth + 10) / 2 +
            (ply.isSelectingPrimary ? (w / 4) * 1.5 : 0),
        56 + 5,
        textWidth + 10,
        56 + 10,
        5,
        "rgba(0,0,0,0.5)"
    );
    drawText(
        w / 2 + (ply.isSelectingPrimary ? (w / 4) * 1.5 : 0),
        56 * 2,
        text,
        "white",
        font(56),
        "center"
    );
    //#endregion

    //#region Health & Ammo
    if (!ply.isDead && !ply.isSelectingPrimary) {
        roundRect(20, 919 - 150 - 20, 350, 150, 5, "rgba(0,0,0,0.5)");
        roundRect(20 + 10, 919 - 150 - 20 + 10, 330, 30, 5, "rgba(0,0,0,0.5)");
        var underhealHp = ply.hp;
        var overhealHp = 0;
        if (underhealHp > 100) {
            overhealHp = underhealHp - 100;
            underhealHp = 100;
        }
        roundRect(
            20 + 10,
            919 - 150 - 20 + 10,
            (underhealHp / 100) * 330,
            30,
            5,
            "white"
        );
        if (overhealHp > 5) {
            roundRect(
                20 + 10,
                919 - 150 - 20 + 10,
                (overhealHp / 100) * 330,
                30,
                5,
                "#60d1db"
            );
        }
        if (ply.hasWater) {
            drawRect(
                20 + 10,
                919 - 150 - 20 + (150 / 3) * 2 + 10 - 10,
                20,
                40,
                "rgba(255,255,255,0.1)"
            );
            drawRect(
                20 + 10,
                919 - 150 - 20 + (150 / 3) * 2 + 10 + 10 - 10,
                20,
                30,
                "rgba(150,150,255,0.4)"
            );
            drawRect(
                20 + 10,
                919 - 150 - 20 + (150 / 3) * 2 + 10 - 10,
                20,
                40,
                "rgba(255,255,255,0.2)"
            );
        }
        if (
            getWeaponData(ply.weapon) &&
            !getWeaponData(ply.weapon).name.startsWith("__melee_")
        )
            drawText(
                20 + 350 / 2,
                919 - 150 - 20 + (150 / 3) * 2 + 15 + 5,
                ply.wepClips[ply.weapon] +
                    "/" +
                    getWeaponData(ply.weapon).clipSize,
                "white",
                font(72),
                "center"
            );
    }
    //#endregion
    //#region Reload Popup
    if (ply.isReloading) {
        roundRect(
            w / 2 - 320 / 2,
            (h / 12) * 3 - (36 + 10),
            320,
            h / 16 + 10,
            2.5,
            "rgba(0,0,0,0.5)"
        );
        drawText(
            w / 2,
            (h / 12) * 3 - 10,
            "Reloading...",
            "white",
            font(36),
            "center"
        );
        roundRect(
            w / 2 - 300 / 2,
            (h / 12) * 3 + 5,
            300,
            5,
            2.5,
            "rgba(0,0,0,0.5)"
        );
        roundRect(
            w / 2 - 300 / 2,
            (h / 12) * 3 + 5,
            (ply.reloadTime / getWeaponData(ply.weapon).reloadTime) * 300,
            5,
            2.5,
            "white"
        );
    }
    //#endregion
    //#region Chat
    if (messagemode) {
        if (getKeyDown("enter")) {
            messagemode = false;
            onMessageFinish(typing);
            typing = "";
            cursorPos = 0;
        }
        if (getKeyDown("escape")) {
            messagemode = false;
            if (triggerMessageFinishOnEscape) onMessageFinish(typing);
            typing = "";
            cursorPos = 0;
        }
        var forbiddenKeys = [
            "Shift",
            "Control",
            "Enter",
            "CapsLock",
            "ArrowUp",
            "ArrowDown",
            "Escape",
            "Tab",
            "OS",
            "F1",
            "F2",
            "F3",
            "F4",
            "F5",
            "F6",
            "F7",
            "F8",
            "F9",
            "F10",
            "F11",
            "F12",
        ];
        typeKeys.forEach((key) => {
            var old = `${typing}`;
            var oldPos = parseInt(cursorPos.toString());
            if (forbiddenKeys.includes(key)) return;
            switch (key) {
                case "Backspace":
                    typing =
                        typing.slice(0, cursorPos - 1) +
                        typing.slice(cursorPos);
                    if (cursorPos > 0) cursorPos--;
                    break;
                case "Delete":
                    typing =
                        typing.slice(0, cursorPos) +
                        typing.slice(cursorPos + 1);
                    break;
                case "ArrowLeft":
                    if (cursorPos > 0) cursorPos--;
                    break;
                case "ArrowRight":
                    if (cursorPos < typing.length) cursorPos++;
                    break;
                case "End":
                    cursorPos = typing.length;
                    break;
                case "Home":
                    cursorPos = 0;
                    break;
                default:
                    typing =
                        typing.slice(0, cursorPos) +
                        key +
                        typing.slice(cursorPos);
                    if (cursorPos < typing.length) cursorPos++;
                    break;
            }
            if (!typingUpdate(typing)) {
                typing = old;
                cursorPos = oldPos;
            }
        });
    }
    if (!ply.isSelectingPrimary) {
        roundRect(
            1633 - 20 - 300,
            20 + 250 + 5,
            300,
            chatFontSize + 5,
            5,
            "rgba(0,0,0,0.5)"
        );
        if (messagemode) {
            var writeStr = `${typing}`;
            ctx.font = font(chatFontSize);
            if (ctx.measureText(writeStr).width > 295) {
                while (ctx.measureText(writeStr).width > 295) {
                    writeStr = writeStr.substring(1);
                }
            }
            drawText(
                1633 - 20 - 300 + 5,
                20 + 250 + 5 + chatFontSize,
                writeStr,
                "white",
                font(chatFontSize),
                "left"
            );
        }
        charsVert = Math.round(250 / (chatFontSize + 5));
        roundRect(1633 - 20 - 300, 20, 300, 250, 5, "rgba(0,0,0,0.5)");
        var chatText = chat
            .map((m) => {
                return `&f${
                    m.author == "___NONAME___" ? "" : m.author + "&7: "
                }${m.content}`;
            })
            .join("\n");
        ctx.font = font(chatFontSize);
        var chatTextWrapped = wrap(chatText, 250);
        if (chatTextWrapped.split("\n").length > charsVert) {
            chatTextWrapped = chatTextWrapped
                .split("\n")
                .slice(-charsVert)
                .join("\n");
        }
        drawText(
            1633 - 20 - 300 + 5,
            20 + 12 + 5,
            chatTextWrapped,
            "white",
            font(chatFontSize),
            "left"
        );
    }
    //#endregion
    //#region Crosshair
    if (drawCrosshair) {
        var t = 2;
        drawStrokedRect(storedMouseX - 15, storedMouseY - 1, 10, 2, "black", t);
        drawStrokedRect(storedMouseX + 5, storedMouseY - 1, 10, 2, "black", t);
        drawStrokedRect(storedMouseX - 1, storedMouseY - 15, 2, 10, "black", t);
        drawStrokedRect(storedMouseX - 1, storedMouseY + 5, 2, 10, "black", t);

        drawRect(storedMouseX - 15, storedMouseY - 1, 10, 2, "white");
        drawRect(storedMouseX + 5, storedMouseY - 1, 10, 2, "white");
        drawRect(storedMouseX - 1, storedMouseY - 15, 2, 10, "white");
        drawRect(storedMouseX - 1, storedMouseY + 5, 2, 10, "white");
    }
    //#endregion
    //#region Navmesh
    if (showNetInfo) {
        /* var hue = 0;
        var sides = 360;
        forEachInShape(
            (x, y, n) => {
                hue += 360 / sides;
                var p = getBulletHitWallPos([ply.x, ply.y, x, y]);
                if (!p) return;
                drawLine(
                    ply.x + cameraOffsets[0],
                    ply.y + cameraOffsets[1],
                    p[0] + cameraOffsets[0],
                    p[1] + cameraOffsets[1],
                    "white",
                    1
                );
            },
            ply.x,
            ply.y,
            sides,
            1
        ); */
        drawStrokedRect(
            gameState.players[socket.id].x + cameraOffsets[0] - 1633 / 2,
            gameState.players[socket.id].y + cameraOffsets[1] - 919 / 2,
            1633,
            919,
            "red",
            5
        );
        /* drawLine(w / 2, 0, w / 2, h, "blue", 2);
        drawLine(0, h / 2, w, h / 2, "blue", 2); */
        if (navData.waypoints) {
            //ctx.drawImage(navCanvas, cameraOffsets[0], cameraOffsets[1]);
        }
    }
    //#endregion
}

function forEachInShape(fn, x, y, n_sides, size) {
    var a = (2 * Math.PI) / n_sides;
    for (var i = 0; i < n_sides; i++) {
        fn(x + size * Math.cos(a * i), y + size * Math.sin(a * i), i);
    }
}

function getBulletHitWallPos(md) {
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
    bullet.x = px;
    bullet.y = py;
    bullet.dx = x * 20;
    bullet.dy = y * 20;
    var hit = null;
    var done = false;
    var t = 0;
    while (!done) {
        t++;
        if (t > 500) {
            done = true;
        }
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if (!isSafeBulletPos(bullet)) {
            hit = [bullet.x, bullet.y];
            done = true;
        }
    }
    return hit;
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
            case "roundrect":
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

var navRoute = [];

socket.on("nav_route", (r) => {
    navRoute = r;
    //drawNavData(navData);
});

var navDataDrawn = false;

function drawNavData(d) {}

var tempNav = "";
var navIndex = -1;
var navmode = true;

function highlighted(ply) {
    var c = false;
    var geoItems = [...gameState.map.geo];
    geoItems.reverse();
    geoItems.forEach((obj) => {
        obj.highlighted = false;
        if (c) return;
        switch (obj.type) {
            case "rect":
                var rectA = { x: ply.x - 0.5, y: ply.y - 0.5, w: 1, h: 1 };
                var rectB = { x: obj.x1, y: obj.y1, w: obj.x2, h: obj.y2 };
                var xOverlap =
                    valueInRange(rectA.x, rectB.x, rectB.x + rectB.w) ||
                    valueInRange(rectB.x, rectA.x, rectA.x + rectA.w);
                var yOverlap =
                    valueInRange(rectA.y, rectB.y, rectB.y + rectB.h) ||
                    valueInRange(rectB.y, rectA.y, rectA.y + rectA.h);
                obj.highlighted = xOverlap && yOverlap;
                c = xOverlap && yOverlap;
                break;
            case "circ":
                var rectA = { x: ply.x - 0.5, y: ply.y - 0.5, w: 1, h: 1 };
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
                obj.highlighted = xOverlap && yOverlap;
                c = xOverlap && yOverlap;
                break;
        }
    });

    if (navmode) {
        navIndex++;

        gameState.map.geo.push({
            type: "text",
            x1: ply.px,
            y1: ply.py,
            text: navIndex.toString(),
            col: "red",
            fontsize: 24,
            layer2: true,
        });

        tempNav += navIndex + " " + ply.px + " " + ply.py + "\n";
    }

    if (c) console.log(geoItems.find((i) => i.highlighted));
}

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    console.log(gameState.players[socket.id].x, gameState.players[socket.id].y);
    highlighted({
        x: e.offsetX - cameraOffsets[0],
        y: e.offsetY - cameraOffsets[1],
    });
});

var localPlayerName = socket.id;
var moveSpeed = 3;

socket.on("connect_error", (data) => {
    console.log("CONNECT ERROR:" + data);
});

socket.on("error", () => {
    gameState = { ...defGameState };
});

var navData = {};

socket.on("nav_data", (data) => {
    navData = data;
    drawNavData(navData);
});

var storedMem = "0.0KB";

socket.on("mem", (usageData) => {
    storedMem = Math.round(usageData.heapUsed / 1000) + "KB";
});

function testNav(txt) {
    var conns = [];
    txt.split("\n").forEach((line) => {
        gameState.map.geo.push({
            type: "circ",
            x1: parseInt(line.split(" ")[1]),
            y1: parseInt(line.split(" ")[2]),
            r: 4,
            col: "magenta",
            thickness: 0,
            layer2: true,
        });
        conns[parseInt(line.split(" ")[0])] = line
            .split(" ")
            .slice(2)
            .map(parseInt);
    });
    conns = Object.entries(conns);
    conns = conns.map((c) => {
        c[1].unshift(c[0]);
        return c[1];
    });
    conns = conns.map((c) => c.sort());
}

if (typeof params.get("disablesmoothing") == "string") {
    console.log("disable");
    ctx2.imageSmoothingEnabled = false;
}

ctx.scale((919 / canvas.height) * optscale, (919 / canvas.height) * optscale);

var scale = 919 / canvas.height;

w = 1633;
h = 919;

console.log(scale);

draw();
