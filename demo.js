"use strict";
define(["pixton", "tweener", "unicycle"], function(Pixton, tweener, Unicycle){

	window.tweener = tweener;

	var Demo = function(){
		this.setupRenderer();

		var sprite1 = new pixton.Sprite(new pixton.Texture("http://bio-gram.com/assets/svg/logo-en.svg"));
		sprite1.interactive = sprite1.buttonMode = true;

		var sprite2 = new pixton.Sprite(new pixton.Texture("http://bio-gram.com/assets/svg/logo-en.svg"));
		sprite2.interactive = sprite2.buttonMode = true;
		
		var sprite3 = new pixton.Sprite(new pixton.Texture("http://bio-gram.com/assets/svg/logo-en.svg"));
		sprite3.interactive = sprite3.buttonMode = true;
		
		var container = new pixton.Container();

		container.addChild(sprite1, sprite2);

		this.pixton.addChild(sprite3);
		this.pixton.addChild(container);

		container.y = 300;
		sprite2.x = 300;

		// tweener.to(sprite3, 2, {
		// 	x : 50,
		// 	repeat : -1,
		// 	yoyo : true,
		// 	ease: "easeOutQuad"
		// });

		sprite1.callbacks.add("pointerover", function(evt, eventType){
			console.log(evt, eventType);
		});

		sprite3.callbacks.add("pointerout", function(evt, eventType){
			console.log(evt, eventType);
		});

		sprite2.callbacks.add("pointertap", function(){
			console.log("Hello world");
		});

		var text = new pixton.Text("000000", {
			fontSize : "64px",
			color : "#000000"
		});

		pixton.addChild(text);

		window.text = text;
		text.y = 150;

		window.sprite1 =sprite1;
		window.container = container;

		var graphics = new pixton.Graphics();

		graphics.beginFill("#000000", 1);
		graphics.drawCircle(10, 10, 10);
		container.addChild(graphics);

		graphics.y = 300;
		graphics.x = 150;
		graphics.interactive = true;
		graphics.buttonMode = true;

		graphics.callbacks.add("pointerover", function(){
			console.log("pointerover");
		});

		graphics.callbacks.add("pointerout", function(){
			console.log("pointerout");
		});

		graphics.callbacks.add("pointertap", function(){
			console.log("pointertap");
		});

		graphics.callbacks.add("pointerdown", function(){
			console.log("pointerdown");
		});

		graphics.callbacks.add("pointerup", function(){
			console.log("pointerup");
		});

		graphics.callbacks.add("pointermove", function(){
			console.log("pointermove");
		});

		graphics.callbacks.add("pointerdownoutside", function(){
			console.log("pointerdownoutside");
		});

		graphics.callbacks.add("pointerupoutside", function(){
			console.log("pointerupoutside");
		});

		graphics.callbacks.add("pointertapoutside", function(){
			console.log("pointertapoutside");
		});

		window.graphics = graphics;

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
		setupChart : function(){
			var demo = this;


			this.chartData = {
				x : +new Date() - (demo.pixton.size.x * 140) / 2,
				_scale : 140,
				get scale(){
					return this._scale;
				},
				set scale(val){
					//this.accuracy = Math.ceil(val * 5 / (this.accuracy)) * (this.accuracy);
					this._scale = val;
				},
				minY : 0,
				maxY : 1,
				accuracy : 1000,
				storage : [],
				graphics : new pixton.Graphics,
				moveChart : function(x){
					this.x = Math.round(this.x + x * this.scale);
				},
				sma : function(point, p){

					if (point.sma && point.sma[p]) return point.sma[p];

					for (var a = 0, sum = point.y; a < p; a++){
						sum += this.getPoint(point.x - this.accuracy * a).y;
					}

					point.sma = point.sma || {};
					point.sma[p] = sum / p;
					return point.sma[p];
				},
				getPoint : function(x){
					//if (x >= +new Date()) return null;

					var point;


					if (this.storage[x]){
						point = this.storage[x];
					} else {
						point = { 
							x : x, 
							y : (Math.random()) 
						};


						this.storage[x] = point;
					}

					
					return point;
				},
				transX : function(x){
					return (x - this.x) / this.scale;
				},
				transY : function(y){
					return demo.pixton.size.y - (y / (this.maxY - this.minY)) * demo.pixton.size.y;
				},
				nearest : function(src, divider, bigger){
					return bigger ? Math.ceil((src + 1) / divider) * divider : Math.floor((src - 1) / divider) * divider
				},
				render : function(){
					var endX = this.x + (demo.pixton.size.x) * this.scale;
					var move = false;

					this.graphics.clear();

					this.graphics.beginFill("#0d1126", 1);
					this.graphics.drawRect(0,0,demo.pixton.size.x, demo.pixton.size.y);


					endX = this.nearest(endX, this.accuracy, true);

					this.graphics.lineStyle(1, "#ffffff", 0.1);

					for (var a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
						point = this.getPoint(a);

						if (!point){
							move = false;
							continue;
						}

						x = point.x;
						y = point.y;


						// y = this.sma(point, 15);
						x = this.transX(x);
						y = this.transY(y);

						if (!move){
							move = true;
							this.graphics.moveTo(x, y);
						} else {
							this.graphics.lineTo(x, y);							
						}
					}

					this.graphics.lineStyle(3, "#25040f", 0.75);
					move = false;

					for (var a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
						point = this.getPoint(a);

						if (!point){
							move = false;
							continue;
						}

						x = point.x;
						y = point.y;


						y = this.sma(point, 5);
						x = this.transX(x);
						y = this.transY(y);

						if (!move){
							move = true;
							this.graphics.moveTo(x, y);
						} else {
							this.graphics.lineTo(x, y);							
						}
					}

					this.graphics.lineStyle(3, "#f44336", 0.75);
					move = false;

					for (var a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
						point = this.getPoint(a);

						if (!point){
							move = false;
							continue;
						}

						x = point.x;
						y = point.y;


						y = this.sma(point, 15);
						x = this.transX(x);
						y = this.transY(y);

						if (!move){
							move = true;
							this.graphics.moveTo(x, y);
						} else {
							this.graphics.lineTo(x, y);							
						}
					}

					this.graphics.lineStyle(3, "#ffc107", 0.75);
					move = false;

					for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
						point = this.getPoint(a);

						if (!point){
							move = false;
							continue;
						}

						x = point.x;
						y = point.y;


						y = this.sma(point, 30);
						x = this.transX(x);
						y = this.transY(y);

						if (!move){
							move = true;
							this.graphics.moveTo(x, y);
						} else {
							this.graphics.lineTo(x, y);							
						}
					}

					this.graphics.lineStyle(3, "#03a9f4", 0.75);
					move = false;

					for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
						point = this.getPoint(a);

						if (!point){
							move = false;
							continue;
						}

						x = point.x;
						y = point.y;


						y = this.sma(point, 45);
						x = this.transX(x);
						y = this.transY(y);

						if (!move){
							move = true;
							this.graphics.moveTo(x, y);
						} else {
							this.graphics.lineTo(x, y);							
						}
					}

					this.graphics.lineStyle(3, "#8bc34a", 0.75);
					move = false;

					for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
						point = this.getPoint(a);

						if (!point){
							move = false;
							continue;
						}

						x = point.x;
						y = point.y;


						y = this.sma(point, 60);
						x = this.transX(x);
						y = this.transY(y);

						if (!move){
							move = true;
							this.graphics.moveTo(x, y);
						} else {
							this.graphics.lineTo(x, y);							
						}
					}

					this.graphics.lineStyle(3, "#8bc14a", 0.75);
					move = false;

					for (a = this.nearest(this.x, this.accuracy, false), x, y, point; a < endX; a += this.accuracy){
						point = this.getPoint(a);

						if (!point){
							move = false;
							continue;
						}

						x = point.x;
						y = point.y;


						y = this.sma(point, 120);
						x = this.transX(x);
						y = this.transY(y);

						if (!move){
							move = true;
							this.graphics.moveTo(x, y);
						} else {
							this.graphics.lineTo(x, y);							
						}
					}
				}
			};

			this.pixton.addChild(this.chartData.graphics);
			this.unicycle.addTask(this.chartData.render.bind(this.chartData));
			this.unicycle.addTask(function(absDelta, relDelta){
				demo.chartData.moveChart(1);
			});


			return this;

		}
	};

	return Demo;

});