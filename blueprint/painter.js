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
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
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
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
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

const wrap = (s, w) =>
    s.replace(
        new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"),
        "$1\n"
    );

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

var tool = 0;
var mouseHeldLastFrame = false;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

var map = {
    name: "Empty Blueprint Map",
    width: 2048,
    height: 1024,
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

function draw() {
    var tform = ctx.getTransform();
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    w = canvas.width;
    h = canvas.height;
    ctx.setTransform(tform);
    ctx.clearRect(originx, originy, w / scale, h / scale);
    grid();
    drawCirc(0, 0, 3 / scale, "red");
    mouseHeldLastFrame = isMouseHeld;
    requestAnimationFrame(draw);
}

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

document.onkeydown = (e) => {
    console.log(e.target);
    if (e.code == "ControlLeft") ctrl = true;
    if (e.code == "ShiftLeft") shift = true;
    if (e.code == "AltLeft") alt = true;
    if (e.target.tagname == "BODY") {
        if (e.code == "KeyQ") tool = 0;
        if (e.code == "KeyW") tool = 1;

        if (e.code == "KeyS") imgScale += 0.25 * 20 * (imgScale * 0.025);
        if (e.code == "KeyA") imgScale -= 0.25 * 20 * (imgScale * 0.025);

        var approvedKeys = ["KeyV"];
        if (!/F[0-9]+/g.test(e.code) && !approvedKeys.includes(e.code))
            e.preventDefault();
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

function updateXY(event) {
    x = originx + event.offsetX / scale;
    y = originy + event.offsetY / scale;
}

canvas.addEventListener(
    "mousedown",
    (e) => ((isMouseHeld = true), updateXY(e))
);
canvas.addEventListener("mouseup", (e) => ((isMouseHeld = false), updateXY(e)));
document.addEventListener("mouseup", (e) => (isMouseHeld = false));
canvas.addEventListener("mousemove", (e) => updateXY(e));

var isPlacingImg = false;
var curImg = null;

draw();
