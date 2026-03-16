var colour = "rgb(230, 195, 207)"
;
var sparkles = 100;

var dustCount = 10;
var x = 0;
var y = 0;
var ox = 400;
var oy = 300;
var swide = 800;
var shigh = 600;
var sleft = 0;
var sdown = 0;
var colours = ["rgb(230, 203, 212)"];

var dustDots = [];
var tiny = [];
var star = [];
var starv = [];
var starx = [];
var stary = [];
var tinyx = [];
var tinyy = [];
var tinyv = [];

function createDiv(height, width) {
	var div = document.createElement("div");
	div.style.position = "absolute";
	div.style.height = height + "px";
	div.style.width = width + "px";
	div.style.overflow = "hidden";
	div.style.pointerEvents = "none";
	return div;
}

function newColour() {
	var c = [];
	c[0] = 255;
	c[1] = Math.floor(Math.random() * 256);
	c[2] = Math.floor(Math.random() * (256 - c[1] / 2));
	c.sort(function() {
		return 0.5 - Math.random();
	});
	return "rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ")";
}

function set_scroll() {
	sdown = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	sleft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
}

function set_width() {
	swide = window.innerWidth || document.documentElement.clientWidth || 800;
	shigh = window.innerHeight || document.documentElement.clientHeight || 600;
}

function mouse(e) {
	x = e.pageX;
	y = e.pageY;
}

function initDust() {
	for (var i = 0; i < dustCount; i++) {
		var dot = createDiv(i / 2, i / 2);
		dot.style.background = "#ff0000";
		dot.style.fontSize = i / 2 + "px";
		dot.style.zIndex = "1001";
		document.body.appendChild(dot);
		dustDots.push(dot);
	}
}

function animateDust() {
	for (var i = 0; i < dustCount; i++) {
		var dot = dustDots[i];
		dot.style.background = colours[Math.floor(Math.random() * colours.length)];

		if (i < dustCount - 1) {
			var nextDot = dustDots[i + 1];
			dot.style.top = nextDot.style.top;
			dot.style.left = nextDot.style.left;
		} else {
			dot.style.top = y + "px";
			dot.style.left = x + "px";
		}
	}

	window.requestAnimationFrame(animateDust);
}

function initSparkles() {
	for (var i = 0; i < sparkles; i++) {
		var tinyDot = createDiv(3, 3);
		tinyDot.style.visibility = "hidden";
		tinyDot.style.zIndex = "999";
		document.body.appendChild(tinyDot);
		tiny[i] = tinyDot;
		tinyv[i] = 0;
		starv[i] = 0;

		var sparkle = createDiv(5, 5);
		sparkle.style.backgroundColor = "transparent";
		sparkle.style.visibility = "hidden";
		sparkle.style.zIndex = "999";

		var vertical = createDiv(1, 5);
		var horizontal = createDiv(5, 1);
		vertical.style.top = "2px";
		vertical.style.left = "0px";
		horizontal.style.top = "0px";
		horizontal.style.left = "2px";

		sparkle.appendChild(vertical);
		sparkle.appendChild(horizontal);
		document.body.appendChild(sparkle);
		star[i] = sparkle;
	}
}

function update_star(i) {
	if (--starv[i] === 25) {
		star[i].style.clip = "rect(1px, 4px, 4px, 1px)";
	}

	if (starv[i]) {
		stary[i] += 1 + Math.random() * 3;
		starx[i] += (i % 5 - 2) / 5;

		if (stary[i] < shigh + sdown) {
			star[i].style.top = stary[i] + "px";
			star[i].style.left = starx[i] + "px";
		} else {
			star[i].style.visibility = "hidden";
			starv[i] = 0;
		}
		return;
	}

	tinyv[i] = 50;
	tiny[i].style.top = (tinyy[i] = stary[i]) + "px";
	tiny[i].style.left = (tinyx[i] = starx[i]) + "px";
	tiny[i].style.width = "2px";
	tiny[i].style.height = "2px";
	tiny[i].style.backgroundColor = star[i].childNodes[0].style.backgroundColor;
	star[i].style.visibility = "hidden";
	tiny[i].style.visibility = "visible";
}

function update_tiny(i) {
	if (--tinyv[i] === 25) {
		tiny[i].style.width = "1px";
		tiny[i].style.height = "1px";
	}

	if (tinyv[i]) {
		tinyy[i] += 1 + Math.random() * 3;
		tinyx[i] += (i % 5 - 2) / 5;

		if (tinyy[i] < shigh + sdown) {
			tiny[i].style.top = tinyy[i] + "px";
			tiny[i].style.left = tinyx[i] + "px";
		} else {
			tiny[i].style.visibility = "hidden";
			tinyv[i] = 0;
		}
		return;
	}

	tiny[i].style.visibility = "hidden";
}

function sparkleLoop() {
	set_scroll();

	if (Math.abs(x - ox) > 1 || Math.abs(y - oy) > 1) {
		ox = x;
		oy = y;

		for (var i = 0; i < sparkles; i++) {
			if (starv[i]) {
				continue;
			}

			star[i].style.left = (starx[i] = x) + "px";
			star[i].style.top = (stary[i] = y + 1) + "px";
			star[i].style.clip = "rect(0px, 5px, 5px, 0px)";
			star[i].childNodes[0].style.backgroundColor =
				star[i].childNodes[1].style.backgroundColor =
				colour === "random" ? newColour() : colour;
			star[i].style.visibility = "visible";
			starv[i] = 50;
			break;
		}
	}

	for (var j = 0; j < sparkles; j++) {
		if (starv[j]) {
			update_star(j);
		}
		if (tinyv[j]) {
			update_tiny(j);
		}
	}

	window.setTimeout(sparkleLoop, 40);
}

function initSparkleEffects() {
	set_width();
	set_scroll();
	initDust();
	initSparkles();
	document.addEventListener("mousemove", mouse);
	window.addEventListener("scroll", set_scroll);
	window.addEventListener("resize", set_width);
	animateDust();
	sparkleLoop();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initSparkleEffects);
} else {
	initSparkleEffects();
}
