//#region dumbshit
/**
 * @returns {HTMLElement}
 */
function $$(id) {
    return document.getElementById(id);
}

/**
 * @type {HTMLCanvasElement}
 */
var canvas = $$("paintercanvas");
/**
 * @type {CanvasRenderingContext2D}
 */
var ctx = canvas.getContext("2d");
/**
 * @type {HTMLCanvasElement}
 */
var truecanvas = $$("truecanvas");
/**
 * @type {CanvasRenderingContext2D}
 */
var truectx = truecanvas.getContext("2d");
/**
 * @type {HTMLCanvasElement}
 */
var tempcanvas = $$("tempcanvas");
/**
 * @type {CanvasRenderingContext2D}
 */
var tempctx = tempcanvas.getContext("2d");

function roundRect(x, y, w, h, radius, col) {
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
function strokeRoundRect(x, y, w, h, radius, stroke, col) {
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
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
    ctx.strokeStyle = col;
    ctx.lineWidth = stroke;
    ctx.stroke();
}

function drawRect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
}

function drawStrokedRect(x, y, w, h, col, thickness) {
    ctx.strokeStyle = col;
    ctx.lineWidth = thickness;
    ctx.strokeRect(x, y, w, h);
}

function drawCirc(x, y, rad, col, outline = 0) {
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

function drawLine(startX, startY, endX, endY, col, thickness) {
    ctx.strokeStyle = col;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
}
function drawText(
    x,
    y,
    text = "?",
    col = "red",
    font = "48px sans-serif",
    align = "center",
    maxWidth = 999999,
    outline = 0
) {
    ctx.fillStyle = col;
    ctx.textAlign = align;
    ctx.font = font;
    if (outline > 0) ctx.lineWidth = outline;
    ctx.strokeStyle = "black";
    var lines = text.split("\n");
    var lineheight = parseFloat(font);
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineheight, maxWidth);
        if (outline > 0)
            ctx.strokeText(lines[i], x, y + i * lineheight, maxWidth);
    }
}

function wrap(text, width) {
    function txtW(txt) {
        return ctx.measureText(txt).width;
    }
    var lines = [];
    var curLine = [];
    text.split(" ").forEach((word) => {
        curLine.push(word);
        if (txtW(curLine.join(" ")) > width) {
            lines.push(curLine.join(" "));
            curLine = [];
        }
    });
    lines.push(curLine);
    return lines.join("\n");
}

function drawTextWrapped(
    x,
    y,
    maxwidth,
    text = "?",
    col = "red",
    font = "48px sans-serif",
    align = "center"
) {
    ctx.fillStyle = col;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.lineWidth = 0.01;
    text = wrap(text, maxwidth);
    var lines = text.split("\n");
    var lineheight = parseFloat(font) + 20;
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineheight);
        ctx.strokeText(lines[i], x, y + i * lineheight);
    }
}
canvas.height = canvas.clientHeight;
canvas.width = canvas.clientWidth;

var w = canvas.width;
var h = canvas.height;
//#endregion

var mouseHeldLastFrame = false;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

var map = {
    name: "unknown",
    width: 2048,
    height: 1024,
    outofbounds: "black",
    background: "dodgerblue",
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

function grid(size = 128, steps = 1) {
    var bw = clamp(1 / scale, 1, 5);
    var bwMainAxis = 1 / scale;
    var col = "white";
    var colMainAxis = "cyan";
    var w = map.width,
        h = map.height;
    for (let j = 0; j < steps; j++) {
        var i = 0;
        while (i * size <= w) {
            drawLine(
                i * size,
                0,
                i * size,
                h,
                i == 0 || i * size == w ? colMainAxis : col,
                i == 0 || i * size == w ? bwMainAxis : bw
            );
            i++;
        }
        i = 0;
        while (i * size <= h) {
            drawLine(
                0,
                i * size,
                w,
                i * size,
                i == 0 || i * size == h ? colMainAxis : col,
                i == 0 || i * size == h ? bwMainAxis : bw
            );
            i++;
        }
        size /= 2;
        bw /= 2;
    }
}

var CursorMode = makeEnum([
    "Invisible",
    "Crosshair",
    "Default",
    "NoEntry",
    "Text",
    "Click",
    "Nwse",
    "Nesw",
    "Ns",
    "Ew",
    "Move",
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
            case CursorMode.Nesw:
                drawCrosshair = false;
                canvas.style = "cursor: nesw-resize;";
                break;
            case CursorMode.Nwse:
                drawCrosshair = false;
                canvas.style = "cursor: nwse-resize;";
                break;
            case CursorMode.Ns:
                drawCrosshair = false;
                canvas.style = "cursor: ns-resize;";
                break;
            case CursorMode.Ew:
                drawCrosshair = false;
                canvas.style = "cursor: ew-resize;";
                break;
            case CursorMode.Move:
                drawCrosshair = false;
                canvas.style = "cursor: move;";
                break;
        }
    } else {
        if (mode == CursorMode.Default) return;
        thisFrameCursorMode = mode;
    }
}

setCursorMode(CursorMode.Default);

var hoveredTCirc = -1;

function drawTransform(rect) {
    var circR = 15 / scale;
    function tcirc(px, py, n) {
        if (distance(px, py, x, y) < circR) {
            if (!getKey("mouse1")) {
                var cms = [
                    "Nwse",
                    "Nesw",
                    "Nesw",
                    "Nwse",
                    "Ns",
                    "Ns",
                    "Ew",
                    "Ew",
                ];
                setCursorMode(CursorMode[cms[n]]);
            }
            if (getKeyDown("mouse1")) {
                hoveredTCirc = n;
            }
        }
        drawCirc(
            px,
            py,
            circR,
            "aqua" /* `hsl(${h}deg,100%,50%)` */,
            3 / scale
        );
        drawText(
            px,
            py + circR / 2,
            n.toString(),
            "red",
            font(circR * 2),
            "center",
            circR
        );
    }
    if (getKeyDown("mouse1") || getKeyUp("mouse1")) hoveredTCirc = -1;
    drawStrokedRect(rect.x1, rect.y1, rect.x2, rect.y2, "white", 3 / scale);
    if (
        rectOverlap(x, y, {
            x: rect.x1,
            y: rect.y1,
            w: rect.x2,
            h: rect.y2,
        })
    ) {
        setCursorMode(CursorMode.Move);
    }
    tcirc(rect.x1, rect.y1, 0);
    tcirc(rect.x1 + rect.x2, rect.y1, 1);
    tcirc(rect.x1, rect.y1 + rect.y2, 2);
    tcirc(rect.x1 + rect.x2, rect.y1 + rect.y2, 3);

    tcirc(rect.x1 + rect.x2 / 2, rect.y1, 4);
    tcirc(rect.x1 + rect.x2 / 2, rect.y1 + rect.y2, 5);
    tcirc(rect.x1 + rect.x2, rect.y1 + rect.y2 / 2, 6);
    tcirc(rect.x1, rect.y1 + rect.y2 / 2, 7);
}

var cameraOffsets = [0, 0];
var showNetInfo = false;
var images = [];

function drawMap(map, layer2) {
    var u = onlyColliding ? map.colliding : map.geo;
    u.forEach((obj) => {
        if (obj.layer2 != layer2) return;
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
                            obj.col
                        );
                        if (obj.highlighted) {
                            drawTransform(obj);
                        }
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

function getKey(key) {
    return heldKeys.includes(key.toLowerCase());
}

function getKeyDown(key) {
    return justPressed.includes(key.toLowerCase());
}

function getKeyUp(key) {
    return justReleased.includes(key.toLowerCase());
}

var selectedObjectIndex = -1;
var originalObject = {};
var moveOffset = [0, 0];
var moID = -1;

var undos = [];
function pushd() {
    console.log("push");
    undos.push(map);
}
function popd() {
    console.log("pop");
    map = undos.pop();
}

var tool = "rect";

function draw() {
    var tform = ctx.getTransform();
    thisFrameCursorMode = CursorMode.Default;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    w = canvas.width;
    h = canvas.height;
    ctx.setTransform(tform);
    ctx.clearRect(originx, originy, w / scale, h / scale);
    drawRect(0, 0, map.width, map.height, map.background);
    grid();
    drawCirc(0, 0, 3 / scale, "red");
    drawMap(map, false);
    drawMap(map, true);
    switch (tool) {
        case "select":
            if (getKey("mouse1")) {
                if (hoveredTCirc == -1) {
                    var rect = map.geo[selectedObjectIndex];
                    if (getKeyDown("mouse1") && rect) {
                        moveOffset = [rect.x1 - x, rect.y1 - y];
                        moID = selectedObjectIndex;
                    } else if (moID == selectedObjectIndex && rect) {
                        console.log(moveOffset[1]);
                        rect.x1 = x + moveOffset[0];
                        rect.y1 = y + moveOffset[1];
                    }
                    if (getKeyDown("mouse1")) {
                        highlighted({
                            x: x,
                            y: y,
                        });
                    }
                } else {
                    var obj = map.geo[selectedObjectIndex];
                    switch (hoveredTCirc) {
                        case 0:
                            if (x < originalObject.x1 + originalObject.x2) {
                                obj.x1 = x;
                                obj.x2 = Math.abs(
                                    originalObject.x2 + (originalObject.x1 - x)
                                );
                            } else {
                                obj.x1 = originalObject.x1 + originalObject.x2;
                                obj.x2 = Math.abs(
                                    originalObject.x1 + originalObject.x2 - x
                                );
                            }
                            if (y < originalObject.y1 + originalObject.y2) {
                                obj.y1 = y;
                                obj.y2 = Math.abs(
                                    originalObject.y2 + (originalObject.y1 - y)
                                );
                            } else {
                                obj.y1 = originalObject.y1 + originalObject.y2;
                                obj.y2 = Math.abs(
                                    originalObject.y1 + originalObject.y2 - y
                                );
                            }
                            break;
                        case 1:
                            if (x > originalObject.x1) {
                                obj.x2 = Math.abs(originalObject.x1 - x);
                            } else {
                                obj.x1 = x;
                                obj.x2 = Math.abs(originalObject.x1 - x);
                            }
                            if (y < originalObject.y1 + originalObject.y2) {
                                obj.y1 = y;
                                obj.y2 = Math.abs(
                                    originalObject.y2 + (originalObject.y1 - y)
                                );
                            } else {
                                obj.y1 = originalObject.y1 + originalObject.y2;
                                obj.y2 = Math.abs(
                                    originalObject.y1 + originalObject.y2 - y
                                );
                            }
                            break;
                        case 2:
                            if (x < originalObject.x1 + originalObject.x2) {
                                obj.x1 = x;
                                obj.x2 = Math.abs(
                                    originalObject.x2 + (originalObject.x1 - x)
                                );
                            } else {
                                obj.x1 = originalObject.x1 + originalObject.x2;
                                obj.x2 = Math.abs(
                                    originalObject.x1 + originalObject.x2 - x
                                );
                            }
                            if (y > originalObject.y1) {
                                obj.y2 = Math.abs(originalObject.y1 - y);
                            } else {
                                obj.y1 = y;
                                obj.y2 = Math.abs(originalObject.y1 - y);
                            }
                            break;
                        case 3:
                            if (x > originalObject.x1) {
                                obj.x2 = Math.abs(originalObject.x1 - x);
                            } else {
                                obj.x1 = x;
                                obj.x2 = Math.abs(originalObject.x1 - x);
                            }
                            if (y > originalObject.y1) {
                                obj.y2 = Math.abs(originalObject.y1 - y);
                            } else {
                                obj.y1 = y;
                                obj.y2 = Math.abs(originalObject.y1 - y);
                            }
                            break;
                        case 4:
                            if (y < originalObject.y1 + originalObject.y2) {
                                obj.y1 = y;
                                obj.y2 = Math.abs(
                                    originalObject.y2 + (originalObject.y1 - y)
                                );
                            } else {
                                obj.y1 = originalObject.y1 + originalObject.y2;
                                obj.y2 = Math.abs(
                                    originalObject.y1 + originalObject.y2 - y
                                );
                            }
                            break;
                        case 5:
                            if (y > originalObject.y1) {
                                obj.y2 = Math.abs(originalObject.y1 - y);
                            } else {
                                obj.y1 = y;
                                obj.y2 = Math.abs(originalObject.y1 - y);
                            }
                            break;
                        case 6:
                            if (x > originalObject.x1) {
                                obj.x2 = Math.abs(originalObject.x1 - x);
                            } else {
                                obj.x1 = x;
                                obj.x2 = Math.abs(originalObject.x1 - x);
                            }
                            break;
                        case 7:
                            if (x < originalObject.x1 + originalObject.x2) {
                                obj.x1 = x;
                                obj.x2 = Math.abs(
                                    originalObject.x2 + (originalObject.x1 - x)
                                );
                            } else {
                                obj.x1 = originalObject.x1 + originalObject.x2;
                                obj.x2 = Math.abs(
                                    originalObject.x1 + originalObject.x2 - x
                                );
                            }
                            break;
                    }
                }
            }
            break;

        case "rect":
            if (getKey("mouse1")) {
                drawRect(
                    lastClickX,
                    lastClickY,
                    x - lastClickX,
                    y - lastClickY,
                    "lime"
                );
            }
            if (getKeyUp("mouse1")) {
                var rx = 64;
                var rw = 64;
                var ry = 64;
                var rh = 64;
                if (x >= lastClickX) rw = x - lastClickX;
                if (x < lastClickX) rw = lastClickX - x;
                if (x >= lastClickX) rx = lastClickX;
                if (x < lastClickX) rx = x;
                if (y >= lastClickY) rh = y - lastClickY;
                if (y < lastClickY) rh = lastClickY - y;
                if (y >= lastClickY) ry = lastClickY;
                if (y < lastClickY) ry = y;
                var obj = {
                    type: "rect",
                    x1: rx,
                    x2: rw,
                    y1: ry,
                    y2: rh,
                    col: "lime",
                    layer2: false,
                };
                console.log(obj);
                map.geo.push(obj);
            }
    }
    if (getKeyDown("keyz")) {
        popd();
    }
    if (getKeyUp("mouse1")) {
        originalObject = { ...map.geo[selectedObjectIndex] };
        pushd();
    }
    mouseHeldLastFrame = isMouseHeld;
    setCursorMode(thisFrameCursorMode, true);
    justPressed = [];
    justReleased = [];
    typeKeys = [];
    requestAnimationFrame(draw);
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function makeEnum(a = []) {
    var d = {};
    a.forEach((b, c) => {
        d[b] = c + "_KonaltEnum";
    });
    return d;
}

function valueInRange(val, min, max) {
    return val >= min && val <= max;
}

function rectOverlap(x, y, rect) {
    return (
        x > rect.x && x < rect.x + rect.w && y > rect.y && y < rect.y + rect.h
    );
}

function highlighted(ply) {
    var c = -1;
    var geoItems = [...map.geo];
    geoItems.reverse();
    geoItems.forEach((obj, ind) => {
        obj.highlighted = false;
        if (c > -1) return;
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
                if (obj.highlighted) c = ind;
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
                if (obj.highlighted) c = ind;
                break;
        }
    });

    selectedObjectIndex = geoItems.length - 1 - c;
}
var onlyColliding = false;

function rsize(inf, n) {
    var ns = inf.split(",").map(parseInt);
    if (n >= ns[0] && n <= ns[2]) {
        console.log("Resized!");
        return ns[1];
    }
    return n;
}

function font(size) {
    var fontname = "monospace";
    return size + "px " + fontname;
}

function loadMap(data) {
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
    var vars = {
        Height: map.height,
        Width: map.width,
        OOBCol: map.outofbounds,
        Name: map.name,
        BGCol: map.background,
        __FORCE_DISABLE_SPLIT_OPTIMIZATION: false,
    };
    data.split("\r\n").forEach((line, num) => {
        var lineData = line.split(" ");
        if (lineData[0].startsWith("--") || !lineData[0]) return;
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
        var secobjs = [];
        if (lineData[0] == "name") {
            map.name = lineData.slice(1).join(" ");
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
                invis: typeof vars["__SET_INVIS_SPAWNS"] !== "undefined",
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
            secobjs.push({
                type: "circ",
                x1: lineData[2],
                y1: lineData[3],
                r: 3,
                col: "red",
                layer2: true,
            });
            secobjs.push({
                type: "text",
                x1: lineData[2],
                y1: lineData[3],
                text: lineData.join(" "),
                col: "white",
                fontsize: 12,
                layer2: true,
            });
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
                    (lineData[1] == 0 || lineData[1] + lineData[3] == map.width
                        ? 10
                        : 0) + lineData[3],
                y2:
                    (lineData[2] == 0 || lineData[2] + lineData[4] == map.height
                        ? 10
                        : 0) + lineData[4],
                col: lineData[5],
                geoId: lineData[6],
                layer2: layer2,
                collides: collides,
                destructible: destructible,
                health: 100,
                playerclip: playerclip,
                disableSplitting:
                    vars["__FORCE_DISABLE_SPLIT_OPTIMIZATION"] == 1,
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
        if (secobjs.length) {
            secobjs.forEach((x) => {
                map.geo.push(x);
                if (x.collides || x.playerclip) map.colliding.push(x);
            });
        }
        if (obj) {
            map.geo.push(obj);
            if (collides || playerclip) map.colliding.push(obj);
        }
    });
}

fetch("https://konalt.us.to/funstuff/funkymulti/v2/server/maps/dunmiff.map")
    .then((r) => r.text())
    .then(loadMap);

let scale = 1;
let originx = -w / 2;
let originy = -h / 2;
let visibleWidth = w;
let visibleHeight = h;
let zoomIntensity = 0.2;
ctx.translate(-originx, -originy);

var ctrl = false;
var shift = false;
var alt = false;

var heldKeys = [];
var justPressed = [];
var justReleased = [];
var typeKeys = [];

document.onkeydown = (k) => {
    if (k.code == "ControlLeft") ctrl = true;
    if (k.code == "ShiftLeft") shift = true;
    if (k.code == "AltLeft") alt = true;
    if (k.key != "F5" && k.key != "F12" && k.key != "F11") k.preventDefault();
    typeKeys.push(k.key);
    if (!heldKeys.includes(k.code.toLowerCase())) {
        justPressed.push(k.code.toLowerCase());
        heldKeys.push(k.code.toLowerCase());
    }
};

document.onkeyup = (e) => {
    e.preventDefault();
    if (e.code == "ControlLeft") ctrl = false;
    if (e.code == "ShiftLeft") shift = false;
    if (e.code == "AltLeft") alt = false;
};

var brushSize = 32;

canvas.onwheel = function (event) {
    event.preventDefault();
    if (ctrl) {
        const mousex = event.clientX - canvas.offsetLeft;
        const mousey = event.clientY - canvas.offsetTop;
        const wheel = event.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        ctx.translate(originx, originy);
        originx -= mousex / (scale * zoom) - mousex / scale;
        originy -= mousey / (scale * zoom) - mousey / scale;
        ctx.scale(zoom, zoom);
        ctx.translate(-originx, -originy);
        scale *= zoom;
        visibleWidth = w / scale;
        visibleHeight = h / scale;
        updateXY(event);
    } else if (isPlacingImg) {
        const wheel = event.deltaY > 0 ? 1 : -1;
        imgScale += 0.25 * wheel * 20 * (imgScale * 0.025);
    } else {
        const wheel = event.deltaY > 0 ? 1 : -1;
        brushSize += zoomIntensity * wheel * 20 * (brushSize * 0.025);
    }
};

function readFile(input, cb) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            cb(reader.result);
        },
        false
    );
    if (file) {
        reader.readAsDataURL(file);
    }
}

var isMouseHeld = false;
var x = 0;
var y = 0;
var lastClickX = 0;
var lastClickY = 0;

function updateXY(event, mclick) {
    if (mclick) {
        if (event.button == 0) {
            justPressed.push("mouse1");
            if (!heldKeys.includes("mouse1")) heldKeys.push("mouse1");
        }
        lastClickX = originx + event.offsetX / scale;
        lastClickY = originy + event.offsetY / scale;
    }
    x = originx + event.offsetX / scale;
    y = originy + event.offsetY / scale;
}

canvas.addEventListener(
    "mousedown",
    (e) => ((isMouseHeld = true), updateXY(e, true))
);
canvas.addEventListener(
    "mouseup",
    (e) => (
        (isMouseHeld = false),
        updateXY(e),
        justReleased.push("mouse1"),
        (heldKeys = heldKeys.filter((hk) => {
            return hk != "mouse1";
        }))
    )
);
document.addEventListener("mouseup", (e) => (isMouseHeld = false));
canvas.addEventListener("mousemove", (e) => updateXY(e));

var isPlacingImg = false;
var curImg = null;

draw();
