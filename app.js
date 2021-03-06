window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

$( document ).ready(function() {
    app.init();
	app.drawSomeEquerres(app.howMuch);
	$(window).bind("resize", function(){
	    var w = $(window).width();
	    var h = $(window).height();
	});
});

var app = {
	$debug: $('#debug'),
	baseY: null,
	baseX: null,
	w: null,
	h: null,

	lineIterations: 0,
	fullIterations: 0,
	howMuch : 100,
	angle: 3.6, //360/howMuch

	equerre: {
		set: function(x, y, l, a){
			if (a==0) {
				this.coord.a.x = x,
				this.coord.a.y = y,
				this.coord.length = l,
				this.coord.angle = a,

				this.coord.b.x = this.coord.a.x + l;
				this.coord.b.y = this.coord.a.y;

				this.coord.c.x = this.coord.a.x;
				this.coord.c.y = this.coord.a.y - l/1.68;	
			} else {
				this.coord.a.x = x;
				this.coord.a.y = y;
				this.coord.length = l;
				this.coord.angle = a;

				this.coord.b = app.rotate(this.coord.a.x, this.coord.a.y, this.coord.a.x + l, this.coord.a.y, a);
				this.coord.c = app.rotate(this.coord.a.x, this.coord.a.y, this.coord.a.x, this.coord.a.y - l/1.68, a);
			}
		},
		render: function(){
			app.ctx.beginPath();

			// VERSION TRACEE
			app.ctx.moveTo(this.coord.a.x, this.coord.a.y);
			app.ctx.lineTo(this.coord.b.x, this.coord.b.y);
			app.ctx.lineTo(this.coord.c.x, this.coord.c.y);
			app.ctx.lineTo(this.coord.a.x, this.coord.a.y);
			
			app.ctx.stroke();

			/*app.ctx.rect(this.coord.a.x, this.coord.a.y, this.coord.length/100, this.coord.length/100);
			app.ctx.rect(this.coord.b.x, this.coord.b.y, 2, 2);
			app.ctx.rect(this.coord.c.x, this.coord.c.y, 2, 2);
			app.ctx.fill();*/
		},
		coord: {
			a: {
				x: null,
				y: null
			},
			b: {
				x: null,
				y: null
			},
			c: {
				x: null,
				y: null
			},
			length: null,
			angle: null,
		},
		// TODO: DECOUVRIR A QUOI SERT CE PARAMETRE
		rapportInnerOuter: 2,
	},

	length: 2000,
	height: 2000/1.66,
	maxLength: 2000,
	colorChangeThreshold: 20,
	// OK, alors cette variable mal nommée correspond à la couleur opposée de celle courament utilisée
	eraserColor: 255,

	alpha: false,

	colorOffset: {red: 0, green: 1, blue: 2, alpha: 3, grey: 4},

	init: function(){
		// Va chercher les paramètres modifiés par l'utilisateur s'ils existent
		// les initialise dans cas contraire
		app.retrieveSettings();

		app.w = window.innerWidth;
		app.h = window.innerHeight;

		this.baseY = app.h*.5;
		this.baseX = app.w*.5;

		// Récupère canvas via jQuery pour modifier ses dimensions
		var $canvasElement = $("#myCanvas");
		$canvasElement.attr('height', app.h);
		$canvasElement.attr('width', app.w);

		// C'EST PAS SAIN D'AVOIR TOUS CES ELEMENTS QUI REPRESENTENT UN SEUL CANVAS
		// Récupère canvas DOM
		this.$canvas = document.getElementById('myCanvas');
		this.ctx = this.$canvas.getContext("2d");
		this.ctx.lineWidth = 50;
		this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';

		// Récupère placeholder pour afficher paramètres
		this.debug= $('#debug');
		this.debug_length = $('#length');
		this.debug_density = $('#density');
		this.debug_speed = $('#speed');
		this.debug_currentSpeed = $('#currentSpeed');
		app.debug_speed.html('Vitesse: '+app.speed+'ms');
		app.debug_length.html('Longueure moyenne: '+app.maxLength);
		app.debug_density.html('Densité max: '+app.densityMax);

		// Récupère inputs depuis DOM, définie leur valeure en fonction de leur modèle
		var $inputSpeed = $('#input-speed');
		var $inputLength = $('#input-length');
		var $inputDensity = $('#input-density');
		$inputLength.val(app.maxLength);
		$inputSpeed.val(app.speed);
		$inputDensity.val(app.densityMax);

		$inputSpeed.change(function(){
			app.speed = $inputSpeed.val();
			localStorage.setItem("param_speed", app.speed);
			app.debug_speed.html('Vitesse: '+app.speed+'ms');
		});
		$inputLength.change(function(){
			app.maxLength = $inputLength.val();
			localStorage.setItem("param_maxLength", app.maxLength);
			app.debug_length.html('Longueure moyenne: '+app.maxLength);
		});
		$inputDensity.change(function(){
			app.densityMax = $inputDensity.val();
			localStorage.setItem("param_densityMax", app.densityMax);
			app.debug_density.html('Densité max: '+app.densityMax);
		});

		this.ctx.beginPath();
		this.ctx.rect(0, 0, app.w, app.h);
		this.ctx.fillStyle = 'white';
	    this.ctx.fill();
	},
	retrieveSettings: function () {
		app.speed = localStorage.getItem("param_speed") || 20;
		app.densityMax = localStorage.getItem("param_densityMax") || 100;
		app.maxLength = localStorage.getItem("param_maxLength") || 2000;
		app.howMuch = Math.floor(Math.random()*app.densityMax);
		app.angle = 360/app.howMuch;
	},
	rotate: function(cx, cy, x, y, angle) {
	    var radians = (Math.PI / 180) * angle,
	        cos = Math.cos(radians),
	        sin = Math.sin(radians),
	        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
	        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
	        return {x: nx, y: ny}
	},
	drawSomeEquerres: function (howMuch){
		setTimeout(app.draw, app.speed);
	},
	draw: function(){
		/*CHANGER DE COULEUR A CHAQUE FORME
		randR = Math.floor(Math.random()*255);
		randG = Math.floor(Math.random()*255);
		randB = Math.floor(Math.random()*255);
		app.ctx.strokeStyle = 'rgba('+randR+','+randG+','+randB+',0.2)';*/

		// TODO N'APPELER RENDER QU'UNE FOIS PAR ITERATION! DESSINER LES DEUX EQUERRE D'UN COUP
			//Triangle exterieur
			app.equerre.set(
				app.baseX,
				app.baseY,
				app.length,
				app.equerre.coord.angle
			);
			app.equerre.render();
			//Triangle interieur
			var innerACoord = app.rotate(
				app.equerre.coord.a.x,
				app.equerre.coord.a.y,
				app.equerre.coord.a.x + app.equerre.coord.length/10,
				app.equerre.coord.a.y - app.equerre.coord.length/10,
				app.equerre.coord.angle
			);
			app.equerre.set(
				innerACoord.x,
				innerACoord.y,
				app.length/2,
				app.equerre.coord.angle
			);
			app.equerre.render();

		app.equerre.coord.angle += app.angle;

		// UPDATE SPEED
		app.rgb = app.getMainColor();
		var percent = Math.floor((app.rgb.r/255)*100);
		app.speed = app.speed -= (100-percent);
		console.log(100-percent);
		app.debug_currentSpeed.html('Vitesse: '+app.speed+'ms');

		app.lineIterations++;

		if (app.lineIterations>app.howMuch) {
			
			app.lineIterations=0;
			app.fullIterations++;
			
			// Je réinitialise l'angle
			app.equerre.coord.angle = 0;

			app.length = Math.floor(Math.random()*app.maxLength)+app.h;
			app.height = app.length/1.66;
			app.baseX = Math.floor(Math.random()*app.w);
			app.baseY = Math.floor(Math.random()*app.h);
			app.howMuch = Math.floor(Math.random()*app.densityMax)+1;
			app.angle = 360/app.howMuch;

			// app.rgb = app.getMainColor();

			if (app.fullIterations>1 && app.doIneedToSwitchStrokeStyle()) {
				app.speed = localStorage.getItem("param_speed") || 20;
				app.switchStrokeStyle(app.eraserColor);
			};

			// A décommenter pour effacer le canvas a chaque fois qu'une forme est complétée
			// app.ctx.clearRect(0, 0, app.$canvas.width, app.$canvas.height);
			
			setTimeout(app.draw, app.speed);
		} else {
			setTimeout(app.draw, app.speed);	
		}
	},
	switchStrokeCount: 0,
	getMainColor: function () {
	    var canvasData = app.ctx.getImageData(0, 0, app.$canvas.width, app.$canvas.height);
        var pix = canvasData.data;
        var rgba = {r:0,g:0,b:0,a:0};
        var test = null;
	    
	    /* R - G - B - A
	    	pix[0] correspond à la couleur rouge du 1er pixel,
	    	pix[1] correspond à la couleur verte du 1er pixel,
	    	pix[2] correspond à la couleur bleue  du 1er pixel,
	    	pix[3] correspond à l'opacité du premier pixel,
	    	pix[4] correspond à la couleur rouge du 2nd pixel... etc etc
	    	C'est pour cela que j'incrémente i de 4 plutot que d'1 dans la boucle
	   	*/
	   	// for (var i = 0; i <pix.length; i += 4) {
	   	var increment = 4000;
		for (var i = 0; i <pix.length; i += increment) {
	        rgba.r += pix[i];
	        rgba.g += pix[i+1];
	        rgba.b += pix[i+2];
	        rgba.a += pix[i+3];
	    }

	    // var pixNumber = pix.length/4;
	    var pixNumber = pix.length/increment;
	    rgba.r = Math.floor(rgba.r/pixNumber);
	    rgba.g = Math.floor(rgba.g/pixNumber);
	    rgba.b = Math.floor(rgba.b/pixNumber);
	    rgba.a = Math.floor(rgba.a/pixNumber);

	    return rgba;
	},
	doIneedToSwitchStrokeStyle: function(){
		var rgb = app.rgb;
		var color = app.eraserColor;
		if (color==255) {
			if (rgb.r <= 4, rgb.g <= 4, rgb.b <= 4) {
				app.eraserColor=0;
				return true;
			} else {
				return false;
			}
		} else {
			//console.log('2');
			// Si on est en train de faire des points blancs on passe noir
			if (rgb.r >= 250, rgb.g >= 250, rgb.b >= 250) {
				app.eraserColor=255;
				return true;
			} else {
				return false;
			}
		}
	},
	switchStrokeStyle: function(color){
		//console.log('current style:'+app.eraserColor);
		if (color==0) {
			app.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
			app.eraserColor=0;
			app.fullIterations = 0;
			//console.log('switchStrokeStyle 1');
		} else {
			//app.ctx.clearRect(0, 0, app.$canvas.width, app.$canvas.height);
			app.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
			app.eraserColor=255;
			app.fullIterations = 0;
			//console.log('switchStrokeStyle 1');
		}
	}
};