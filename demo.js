"use strict";
define(["pixton", "tweener", "unicycle"], function(Pixton, tweener, Unicycle){

	window.tweener = tweener;

	var Demo = function(){
		this.setupRenderer();

		var scene = Pixton.sceneBuilder.make(document.querySelector("#test-scene"));

		this.pixton.addChild(scene);		

		// var sprite1 = new pixton.Sprite(new pixton.Texture("res/fruits/cherry.png"));
		// sprite1.scale.set(0.35);
		// sprite1.interactive = sprite1.buttonMode = true;

		// this.pixton.addChild(sprite1);

		// sprite1.classes.add("sprite");
		// sprite1.classes.add("kek");

		// window.sprite1 = sprite1;

		// sprite1.callbacks.add("pointertap", function(){
		// 	console.log("Hello");
		// });

		// // tweener.to(sprite1, 2, {
		// // 	x : 300,
		// // 	repeat : -1,
		// // 	yoyo : true,
		// // 	ease : "easeInCubic"
		// // });

		// sprite1.x = 300;

		// var container = new pixton.Container();

		// var sprite2 = new pixton.Sprite("res/fruits/kiwi.png");

		// sprite2.id  = "hello";

		// container.addChild(sprite2);

		// window.sprite2 = sprite2;

		// sprite2.classes.add("sprite");
		// sprite2.classes.add("kek");
		// sprite2.classes.add("sprite2");

		// sprite2.scale.set(0.35);

		// container.y = 500;
		// container.x = 400;

		// window.container = container;

		// container.interactive = true;
		// container.buttonMode = true;

		// var container2 = new pixton.Container();

		// container2.addChild(container);

		// this.pixton.addChild(container2);

		// var graphics2 = new pixton.Graphics();
		// graphics2.beginFill("#ff00ff");
		// graphics2.drawCircle(0, 0, 40, 40);

		// graphics2.beginFill("#00ff00");
		// graphics2.drawCircle(0,0,15, 15)

		// pixton.addChild(graphics2);

		// graphics2.interactive = graphics2.buttonMode = true;
		// graphics2.callbacks.add("pointerdrag", function(evt){
		// 	graphics2.x += evt.extra.deltaX;
		// 	graphics2.y += evt.extra.deltaY;
		// });	

		// // container.interactive = true;
		// // container.callbacks.add("pointerdrag", function(evt){
		// // 	container.x += evt.extra.deltaX;
		// // 	container.y += evt.extra.deltaY;
		// // });

		// graphics2.x = 150;
		// graphics2.y = 150;

		// window.graphics2 = graphics2;

		// sprite2.interactive = true;

		// sprite2.callbacks.add("pointerover", function(){
		// 	console.log("hovered");
		// });

		// sprite2.callbacks.add("mousewheel", function(evt){
		// 	var currentScale = sprite2.scale.x;

		// 	if (evt.extra.wheelDeltaY > 0){
		// 		sprite2.scale.set(currentScale * 0.75, currentScale * 0.75);
		// 	} else {
		// 		sprite2.scale.set(currentScale * 1.25, currentScale * 1.25);
		// 	}
		// });

	};

	Demo.prototype = {
		setupControls : function(){
			var captured = false;
			var hovered = false;
			var prevWheelTime = +new Date();
			var prevPntX = 0;
			var prevPntY = 0;

			this.pixton.canvas.addEventListener("mousewheel", function(evt){
				if (+new Date - prevWheelTime < 100){
					return;
				}

				prevWheelTime = +new Date;

				if (evt.wheelDeltaY > 0){
					tweener.to(this.chartData, 0.1, {
						scale : this.chartData.scale - this.chartData.scale * 0.3,
						ease : "easeOutQuad"
					});
				} else {
					tweener.to(this.chartData, 0.1, {
						scale : this.chartData.scale + this.chartData.scale * 0.3,
						ease : "easeOutQuad"	
					});
				}
			}.bind(this));

			this.pixton.canvas.addEventListener("mousedown", function(evt){
				captured = true;
				prevPntX = evt.x;
				prevPntY = evt.y;
			});

			this.pixton.canvas.addEventListener("mouseup", function(){
				captured = false;
			});

			this.pixton.canvas.addEventListener("mouseout", function(){
				captured = false;
			});

			this.pixton.canvas.addEventListener("mousemove", function(evt){
				if (captured){
					var deltaX = prevPntX - evt.x;
					var deltaY = evt.y - prevPntY;
					this.chartData.moveChart(deltaX, deltaY);
					prevPntX = evt.x;
					prevPntY = evt.y;
				}
			}.bind(this));

		},
		setupRenderer : function(){
			this.unicycle = window.unicycle = new Unicycle;
			this.pixton   = window.pixton   = new Pixton();

			document.body.appendChild(pixton.canvas);

			pixton.resize(window.innerWidth, window.innerHeight);
			window.addEventListener("resize", function(){
				pixton.resize(window.innerWidth, window.innerHeight);
			});

			this.unicycle.addTask(pixton.render);
			this.unicycle.start();

			return this;

		},
		// setupChart : function(){
		// 	var demo = this;


		// 	this.chartData = {
		// 		x : +new Date() - (demo.pixton.size.x * 140) / 2,
		// 		_scale : 140,
		// 		get scale(){
		// 			return this._scale;
		// 		},
		// 		set scale(val){
		// 			//this.accuracy = Math.ceil(val * 5 / (this.accuracy)) * (this.accuracy);
		// 			this._scale = val;
		// 		},
		// 		minY : 0,
		// 		maxY : 1,
		// 		accuracy : 1000,
		// 		storage : [],
		// 		graphics : new pixton.Graphics,
		// 		moveChart : function(x){
		// 			this.x = Math.round(this.x + x * this.scale);
		// 		},
		// 		sma : function(point, p){

		// 			if (point.sma && point.sma[p]) return point.sma[p];

		// 			for (var a = 0, sum = point.y; a < p; a++){
		// 				sum += this.getPoint(point.x - this.accuracy * a).y;
		// 			}

		// 			point.sma = point.sma || {};
		// 			point.sma[p] = sum / p;
		// 			return point.sma[p];
		// 		},
		// 		getPoint : function(x){
		// 			//if (x >= +new Date()) return null;

		// 			var point;


		// 			if (this.storage[x]){
		// 				point = this.storage[x];
		// 			} else {
		// 				point = { 
		// 					x : x, 
		// 					y : (Math.random()) 
		// 				};


		// 				this.storage[x] = point;
		// 			}

					
		// 			return point;
		// 		},
		// 		transX : function(x){
		// 			return (x - this.x) / this.scale;
		// 		},
		// 		transY : function(y){
		// 			return demo.pixton.size.y - (y / (this.maxY - this.minY)) * demo.pixton.size.y;
		// 		},
		// 		nearest : function(src, divider, bigger){
		// 			return bigger ? Math.ceil((src + 1) / divider) * divider : Math.floor((src - 1) / divider) * divider
		// 		},
		// 		render : function(){
		// 			var endX = this.x + (demo.pixton.size.x) * this.scale;
		// 			var move = false;

		// 			this.graphics.clear();

		// 			this.graphics.beginFill("#0d1126", 1);
		// 			this.graphics.drawRect(0,0,demo.pixton.size.x, demo.pixton.size.y);


		// 			endX = this.nearest(endX, this.accuracy, true);

		// 			this.graphics.lineStyle(1, "#ffffff", 0.1);

		// 			for (var a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
		// 				point = this.getPoint(a);

		// 				if (!point){
		// 					move = false;
		// 					continue;
		// 				}

		// 				x = point.x;
		// 				y = point.y;


		// 				// y = this.sma(point, 15);
		// 				x = this.transX(x);
		// 				y = this.transY(y);

		// 				if (!move){
		// 					move = true;
		// 					this.graphics.moveTo(x, y);
		// 				} else {
		// 					this.graphics.lineTo(x, y);							
		// 				}
		// 			}

		// 			this.graphics.lineStyle(3, "#25040f", 0.75);
		// 			move = false;

		// 			for (var a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
		// 				point = this.getPoint(a);

		// 				if (!point){
		// 					move = false;
		// 					continue;
		// 				}

		// 				x = point.x;
		// 				y = point.y;


		// 				y = this.sma(point, 5);
		// 				x = this.transX(x);
		// 				y = this.transY(y);

		// 				if (!move){
		// 					move = true;
		// 					this.graphics.moveTo(x, y);
		// 				} else {
		// 					this.graphics.lineTo(x, y);							
		// 				}
		// 			}

		// 			this.graphics.lineStyle(3, "#f44336", 0.75);
		// 			move = false;

		// 			for (var a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
		// 				point = this.getPoint(a);

		// 				if (!point){
		// 					move = false;
		// 					continue;
		// 				}

		// 				x = point.x;
		// 				y = point.y;


		// 				y = this.sma(point, 15);
		// 				x = this.transX(x);
		// 				y = this.transY(y);

		// 				if (!move){
		// 					move = true;
		// 					this.graphics.moveTo(x, y);
		// 				} else {
		// 					this.graphics.lineTo(x, y);							
		// 				}
		// 			}

		// 			this.graphics.lineStyle(3, "#ffc107", 0.75);
		// 			move = false;

		// 			for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
		// 				point = this.getPoint(a);

		// 				if (!point){
		// 					move = false;
		// 					continue;
		// 				}

		// 				x = point.x;
		// 				y = point.y;


		// 				y = this.sma(point, 30);
		// 				x = this.transX(x);
		// 				y = this.transY(y);

		// 				if (!move){
		// 					move = true;
		// 					this.graphics.moveTo(x, y);
		// 				} else {
		// 					this.graphics.lineTo(x, y);							
		// 				}
		// 			}

		// 			this.graphics.lineStyle(3, "#03a9f4", 0.75);
		// 			move = false;

		// 			for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
		// 				point = this.getPoint(a);

		// 				if (!point){
		// 					move = false;
		// 					continue;
		// 				}

		// 				x = point.x;
		// 				y = point.y;


		// 				y = this.sma(point, 45);
		// 				x = this.transX(x);
		// 				y = this.transY(y);

		// 				if (!move){
		// 					move = true;
		// 					this.graphics.moveTo(x, y);
		// 				} else {
		// 					this.graphics.lineTo(x, y);							
		// 				}
		// 			}

		// 			this.graphics.lineStyle(3, "#8bc34a", 0.75);
		// 			move = false;

		// 			for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
		// 				point = this.getPoint(a);

		// 				if (!point){
		// 					move = false;
		// 					continue;
		// 				}

		// 				x = point.x;
		// 				y = point.y;


		// 				y = this.sma(point, 60);
		// 				x = this.transX(x);
		// 				y = this.transY(y);

		// 				if (!move){
		// 					move = true;
		// 					this.graphics.moveTo(x, y);
		// 				} else {
		// 					this.graphics.lineTo(x, y);							
		// 				}
		// 			}

		// 			this.graphics.lineStyle(3, "#8bc14a", 0.75);
		// 			move = false;

		// 			for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
		// 				point = this.getPoint(a);

		// 				if (!point){
		// 					move = false;
		// 					continue;
		// 				}

		// 				x = point.x;
		// 				y = point.y;


		// 				y = this.sma(point, 120);
		// 				x = this.transX(x);
		// 				y = this.transY(y);

		// 				if (!move){
		// 					move = true;
		// 					this.graphics.moveTo(x, y);
		// 				} else {
		// 					this.graphics.lineTo(x, y);							
		// 				}
		// 			}
		// 		}
		// 	};

		// 	this.pixton.addChild(this.chartData.graphics);
		// 	this.unicycle.addTask(this.chartData.render.bind(this.chartData));
		// 	this.unicycle.addTask(function(absDelta, relDelta){
		// 		demo.chartData.moveChart(1);
		// 	});


		// 	return this;

		// }
	};

	return Demo;

});