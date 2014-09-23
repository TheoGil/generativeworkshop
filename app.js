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
	$canvas: null,

	ctx: null,

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
		rapportInnerOuter: 10,
	},

	length: 2000,
	height: 2000/1.66,
	maxLength: 2000,
	colorChangeThreshold: 20,
	eraserColor: 255,

	alpha: false,

	colorOffset: {red: 0, green: 1, blue: 2, alpha: 3, grey: 4},

	init: function(){
		app.retrieveSettings();

		app.w = window.innerWidth;
		app.h = window.innerHeight;

		this.baseY = app.h*.5;
		this.baseX = app.w*.5;

		this.$canvas = document.getElementById('myCanvas');

		var $canvasElement = $("#myCanvas");
		$canvasElement.attr('height', app.h);
		$canvasElement.attr('width', app.w);


		this.ctx = this.$canvas.getContext("2d");
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
		//this.ctx.globalCompositeOperation = 'multiply';

		// Retrieve debug elements tu update them lateer
		this.debug= $('#debug');
		this.debug_length = $('#length');
		this.debug_density = $('#density');
		this.debug_speed = $('#speed');

		// Set value and listen to input change
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
		app.debug_speed.html('Vitesse: '+app.speed+'ms');

		$inputLength.change(function(){
			app.maxLength = $inputLength.val();
			localStorage.setItem("param_maxLength", app.maxLength);
			app.debug_length.html('Longueure moyenne: '+app.maxLength);
		});
		app.debug_length.html('Longueure moyenne: '+app.maxLength);

		$inputDensity.change(function(){
			app.densityMax = $inputDensity.val();
			localStorage.setItem("param_densityMax", app.densityMax);
			app.debug_density.html('Densité max: '+app.densityMax);
		});
		app.debug_density.html('Densité max: '+app.densityMax);
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

		//app.debugInfo();

		//Triangle exterieur
		app.equerre.set(app.baseX, app.baseY, app.length, app.equerre.coord.angle);
		app.equerre.render();
		//Triangle interieur
		var innerACoord = app.rotate(app.equerre.coord.a.x, app.equerre.coord.a.y, app.equerre.coord.a.x + app.equerre.coord.length/10, app.equerre.coord.a.y - app.equerre.coord.length/10, app.equerre.coord.angle);
		app.equerre.set(
			innerACoord.x,
			innerACoord.y,
			app.length/2,
			app.equerre.coord.angle
		);
		app.equerre.render();
		
		/*Je suprime le contenu du fontCanvas puis copie le contenu du premier canvas vers le deuxieme et supprime les tracés surle dernier
		//app.frontCtx.clearRect(0, 0, app.$canvasFront.width, app.$canvasFront.height);
		app.frontCtx.drawImage(app.$canvas, 0, 0);
		//app.removeLines();*/
		
		app.equerre.coord.angle += app.angle;

		app.lineIterations++;

		/*LET'S DO IT AGAIN!*/
		if (app.lineIterations>=app.howMuch) {
			
			app.lineIterations=0;
			app.fullIterations++;
			
			// Je réinitialise l'angle
			app.equerre.coord.angle = 0;

			//app.ctx.clearRect(0, 0, app.$canvas.width, app.$canvas.height);
			
			
			app.length = Math.floor(Math.random()*app.maxLength)+app.h;
			app.height = app.length/1.66;
			app.baseX = Math.floor(Math.random()*app.w);
			app.baseY = Math.floor(Math.random()*app.h);
			app.howMuch = Math.floor(Math.random()*app.densityMax);
			app.angle = 360/app.howMuch;

			if (app.fullIterations>5 && app.doIneedToSwitchStrokeStyle()) {
				app.switchStrokeStyle(app.eraserColor);
			};

			app.debugInfo();
		};

		setTimeout(app.draw, app.speed);
	},
	removeLines: function (){
	    var canvasData = app.frontCtx.getImageData(0, 0, window.innerWidth, window.innerHeight),
        //pix contient les infos rgba de tous les pixels contenu dans le canvas
        pix = canvasData.data;
	    
	    /* R - G - B - A
	    	pix[0] correspond à la couleur rouge du 1er pixel,
	    	pix[1] correspond à la couleur verte du 1er pixel,
	    	pix[2] correspond à la couleur bleue  du 1er pixel,
	    	pix[3] correspond à l'opacité du premier pixel,
	    	pix[4] correspond à la couleur rouge du 2nd pixel... etc etc
	    	C'est pour cela que j'incrémente i de 4 plutot que d'1 dans la boucle
	   	*/
		for (var i = 0, n = pix.length; i <n; i += 4) {
	        //Si le pixel ciblé n'est pas 100% opaque, je le baisse à 0%.
	    	if (pix[i+3]<150) {
	    		pix[i]=app.eraserColor;
	    		pix[i+1]=app.eraserColor;
	    		pix[i+2]=app.eraserColor;
	    		pix[i+3]=255;
	    	}
	    }
	    
	    app.frontCtx.putImageData(canvasData, 0, 0);
	},
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
		for (var i = 0; i <pix.length; i += 4) {
	        rgba.r += pix[i];
	        rgba.g += pix[i+1];
	        rgba.b += pix[i+2];
	        rgba.a += pix[i+3];
	    }


	    var pixNumber = pix.length/4;
	    rgba.r = Math.floor(rgba.r/pixNumber);
	    rgba.g = Math.floor(rgba.g/pixNumber);
	    rgba.b = Math.floor(rgba.b/pixNumber);
	    rgba.a = Math.floor(rgba.a/pixNumber);

	    return rgba;
	},
	doIneedToSwitchStrokeStyle: function(){
		var rgb = app.getMainColor();
		var color = app.eraserColor;
		if (color==255) {
			if (app.alpha==false) {
				if (rgb.a>=250) {
					app.eraserColor=0;
					app.alpha=true;
					return true;
				} else {
					return false;
				}
			} else {
				if (rgb.r <= 4, rgb.g <= 4, rgb.b <= 4) {
					app.eraserColor=0;
					return true;
				} else {
					return false;
				}
			}
		} else {
			//console.log('2');
			// Si on est en train de faire des points blancs on passe noir
			if (rgb.r >= 230, rgb.g >= 230, rgb.b >= 230) {
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
	},
	debugInfo: function () {
		rgb = app.getMainColor();
	}
};