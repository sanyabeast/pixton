"use strict";
define(function(){
	/*TOOlS*/
	var Tools = function(){};
	Tools.prototype = {
		genID : function(prefix){
			return (prefix ? prefix + "-" : "") + Math.random().toString(32).substring(3, 10); 
		},
		processNumbers : function(string){
			var match = string.match(/^\d+$/g);

		},
		removeFromArrByIndex : function(arr, index){
			return arr.splice(index, 1);
		},
		removeFromArrByValue : function(arr, value){
			return this.removeFromArrByIndex(arr, arr.indexOf(value));
		},
		collectionMethod : function(coll, callback, context){
			for (var a = 0, l = coll.length; a < l; a++){
				callback.call(context, coll[a]);
			}
		},	
		coordsBelognsRect : function(x, y, rectX, rectY, rectW, rectH){
			var rectMX = rectX + rectW;
			var rectMY = rectY + rectH;

			if (x >= rectX && x <= rectMX && y >= rectY && y <= rectMY){
				return true;
			} else {
				return false;
			}

		},
		inheritCLASS : function(SuperC, prototype){
			var C = prototype.constructor;
			delete prototype.constructor;

			var CLASS = function(){
				SuperC.apply(this, arguments);
				C.apply(this, arguments);
			};

			Object.defineProperties(CLASS.prototype, SuperC.prototype._prototype);
			Object.defineProperties(CLASS.prototype, prototype);
			CLASS.prototype._prototype = prototype;

			return CLASS;
		},
		CLASS : function(prototype){
			var C = prototype.constructor;
			delete prototype.constructor;

			var CLASS = function(){
				C.apply(this, arguments);
			};


			Object.defineProperties(CLASS.prototype, prototype);
			CLASS.prototype._prototype = prototype;

			return CLASS;
		}
	};


	var tools = new Tools;

	/*Tokelist*/
	var TokensCollection = tools.CLASS({
		constructor : function(content){
			this.content = content;
			this.loop = { break : false, continue : false };
		},
		content : {
			get : function(){
				return this._content;
			},
			set : function(content){
				this._content = content || [];
			},
			configurable : true
		},
		add : {
			value : function(value){
				this.content.push(value);
				this.content.size = this.content.length;
				return this.content[this.content.size - 1];
			},
			writable : true,
			configurable : true
		},
		get : {
			value : function(id){
				return this.content[id];
			}
		},
		remove : {
			value : function(value){
				tools.removeFromArrByValue(this.content, value);
				this.content.size = this.content.length;
			},
			writable : true,
			configurable : true
		},
		iterate : {
			value : function(callback, context){
				var result;
				this.loop.break = this.loop.continue = false;

				for (var a = 0; a < this.content.size; a++){
					if (context){
						result = callback.call(context, this.content[a], a, this.loop);
					} else {
						result = callback(this.content[a], a, this.loop);
					}

					if (this.loop.break) break;
				}

				return result;

			},
			writable : true,
			configurable : true
		},
		contains : {
			value : function(value){
				return this.content.indexOf(value) > -1;
			},
			writable : true,
			configurable : true
		},
		clear : {
			value : function(){
				this._content.length = 0;
				this._content.size = 0;
			},
			writable : true,
			configurable : true
		}
	});

	var TokensList = tools.inheritCLASS(TokensCollection, {
		content : {
			get : function(){
				return this._content;
			},
			set : function(content){
				this._content = content || {};
			}
		},
		add : {
			value : function(name, value){
				this.content[name] = value;
				return this.content[name];
			}
		},
		remove : {
			value : function(name){
				delete this.content[name];
			}
		},
		iterate : {
			value : function(callback, context){
				var result;
				this.loop.break = this.loop.continue = false;

				for (var a in this.content){
					if (context){
						result = callback.call(context, this.content[a], a, this.loop);
					} else {
						result = callback(this.content[a], a, this.loop);
					}

					if (this.loop.break) break;
				}

				return result;

			},
		},
		contains : {
			value : function(name){
				return typeof this.content[name] != "undefined";
			}
		},
		clear : {
			value : function(){
				this.iterate(function(value, name){
					delete this.content[name];
				}, this)
			}
		}
	});

	/*POINT*/
	var Point = tools.CLASS({
		constructor : function(x, y){
			this._x = x || 0;
			this._y = y || 0;
		},
		tools : {
			value : new Tools
		},
		x : {
			get : function(){ return this._x },
			set : function(x){ this._x = x; }
		},
		y : {
			get : function(){ return this._y },
			set : function(y){ this._y = y; }
		},
		set : {
			value : function(x, y){
				if (typeof y == "undefined") y = x;
				this.x = x;
				this.y = y;
			}
		}
	});


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*NODE*/
	var Node = tools.CLASS({
		constructor : function(options){
			options = options || {};
			this.children = new TokensCollection();
			this.position = new Point();
			this.scale = new Point(1, 1);
			this.size = new Point(1, 1);
			this.classes = new TokensCollection(options.classes);
			this.callbacks = new TokensList();
		},
		interactive : {
			get : function(){
				if (typeof this._interactive == "undefined") this._interactive = false;
				return this._interactive;
			},
			set : function(value){
				this._interactive = value;
			}
		},
		buttonMode : {
			get : function(){
				if (typeof this._buttonMode == "undefined") this._buttonMode = false;
				return this._buttonMode;
			},
			set : function(value){
				this._buttonMode = value;
			}
		},
		checkInteractivity : {
			value : function(eventType, x, y, canvas, evt, dx, dy){
				dx += this.x;
				dy += this.y;

				if (this.interactive) this.processInteractivity(eventType, x, y, canvas, evt, dx, dy);

				this.children.iterate(function(child){
					child.checkInteractivity(eventType, x, y, canvas, evt, dx, dy);
				}, this);
			}
		},
		processInteractivity : {
			value : function(eventType, x, y, canvas, evt, dx, dy){
				var inside = tools.coordsBelognsRect(x, y, dx, dy, this.size.x, this.size.y);

				if (eventType == "pointermove" && inside && !this.hovered){
					if (this.buttonMode) canvas.style.cursor = "pointer";
					this.hovered = true;
					if (this.callbacks.contains("pointerover")) this.callbacks.get("pointerover")(evt, "pointerover");
				}

				if (eventType == "pointermove" && !inside && this.hovered){
					if (this.buttonMode) canvas.style.cursor = "default";
					this.hovered = false;
					if (this.callbacks.contains("pointerout")) this.callbacks.get("pointerout")(evt, "pointerout");
					return;
				}

				if (eventType == "pointermove" && inside && this.hovered){
					if (this.callbacks.contains("pointermove")) this.callbacks.get("pointermove")(evt, "pointermove");
				}

				if (eventType == "pointertap" && this.hovered && inside){
					if (this.callbacks.contains("pointertap")) this.callbacks.get("pointertap")(evt, "pointertap");
				}

				if (eventType == "pointerdown" && this.hovered && inside){
					if (this.callbacks.contains("pointerdown")) this.callbacks.get("pointerdown")(evt, "pointerdown");
				}

				if (eventType == "pointerup" && this.hovered && inside){
					if (this.callbacks.contains("pointerup")) this.callbacks.get("pointerup")(evt, "pointerup");
				}
			}
		},
		tools : {
			value : new Tools
		},
		id : {
			get : function(){
				if (!this._id) this._id = this.tools.genID("node");
				return this._id;
			},
			set : function(id){
				thi.id = id;
			}
		},
		x : {
			get : function(){ return this.position.x },
			set : function(x){ 
				this.position.x = x; 
			},
		},
		y : {
			get : function(){ return this.position.y },
			set : function(y){ 
				this.position.y = y; 
			},
		},
		render : {
			value : function(parent, context, dx, dy, dsx, dsy){
				dx += this.x;
				dy += this.y;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				this.children.iterate(function(child, index){
					child.render(this, context, dx, dy, dsx, dsy);
				}, this);
			},
			writable : true,
			configurable : true
		},
		addChild : {
			value : function(child){
				if (arguments.length > 1){
					tools.collectionMethod(arguments, this.addChild, this);
					return this;
				}

				child.parent = this;
				this.children.add(child);

				return this;
			},
		}
	});

	/*SPRITE*/
	var Texture = tools.CLASS({
		constructor : function(path){
			this.image = new window.Image();
			this.image.onload = this.onLoad.bind(this);
			this.image.src = path;
		},
		width : {
			get : function(){
				return this.image.width || 0;
			},
		},
		height : {
			get : function(){
				return this.image.height || 0;
			},
		},
		loaded : {
			get : function(){
				return this._loaded || false;
			},
			set : function(key){
				this._loaded = key;
			}
		},
		onLoad : {
			value : function(data){
				this._loaded = true;
			}
		}
	});

	var Sprite = tools.inheritCLASS(Node, {
		constructor : function(texture){
			this.texture = texture;
		},
		render : {
			value : function(parent, context, dx, dy, dsx, dsy){
				dx += this.x;
				dy += this.y;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				if (!this.texture.loaded) return;

				context.drawImage(this.texture.image, dx * dsx, dy * dsy, this.texture.width * dsx, this.texture.height * dsy);
				this.size.x = this.texture.width * this.scale.x;
				this.size.y = this.texture.height * this.scale.y;
			}
		}
	});

	var Graphics = tools.inheritCLASS(Node, {
		constructor : function(){
			this.primitives = new TokensCollection;
			this.activePath = null;

			this.fillAlpha = 1;
			this.fillColor = "#000000";

			this.lineAlpha = 1;
			this.lineColor = "#000000";
			this.lineWidth = 1;

			this.lineJoin = "round";
			this.lineCap = "round";
		},
		lineTo : {
			value : function(x, y){
				if (!this.activePath){
					this.moveTo(x, y);
				}

				this.activePath.path.push(x);
				this.activePath.path.push(y);

				return this;
			}
		},
		moveTo : {
			value : function(x, y){
				this.activePath = this.primitives.add({
					type : "path",
					lineColor : this.lineColor,
					lineAlpha : this.lineAlpha,
					lineWidth : this.lineWidth,
					lineJoin  : this.lineJoin,
					lineCap   : this.lineCap,
					path : [x, y]
				});

				return this;
			}
		},
		lineStyle : {
			value : function(width, color, alpha){
				this.lineWidth = width;
				this.lineAlpha = alpha;
				this.lineColor = color;

				return this;
			},
			writable : true,
			configurable : true
		},
		drawRect : {
			value : function(x, y, w, h){
				this.primitives.add({
					type : "rect",
					x : x,
					y : y,
					w : w,
					h : h,
					fillColor : this.fillColor,
					fillAlpha : this.fillAlpha,
					lineColor : this.lineColor,
					lineAlpha : this.lineAlpha,
					lineWidth : this.lineWidth
				});

				return this;
			},
		},
		drawCircle : {
			value : function(x, y, radius){
				this.primitives.add({
					type : "circle",
					x : x,
					y : y,
					radius : radius,
					fillColor : this.fillColor,
					fillAlpha : this.fillAlpha,
					lineColor : this.lineColor,
					lineAlpha : this.lineAlpha,
					lineWidth : this.lineWidth
				});

				return this;
			},
		},
		drawPolygon : {
			value : function(){}
		},
		closePath : {
			value : function(){
				this.activePath = null;
			}
		},
		beginFill : {
			value : function(color, alpha){
				this.fillAlpha = alpha;
				this.fillColor = color;

				return this;
			},
			writable : true,
			configurable : true
		},	
		endFill : {
			value : function(){


				return this;
			}
		},
		clear : {
			value : function(){
				this.primitives.clear();
				this.activePath = null;

				return this;
			}
		},
		drawPath : {
			value : function(data, context, dx, dy, dsx, dsy){
				var path = data.path;

				dx += this.x;
				dy += this.y;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				context.beginPath();
				context.moveTo((path[0] + dx) * dsx, (path[1] + dy) * dsy);

				for (var a = 2, l = path.length, x, y; a < l; a++){
					if (a % 2 == 0){
						x = (path[a] + dx) * dsx;
						continue;
					} else {
						y = (path[a] + dy) * dsy;
						context.lineTo(x, y);
					}
				}

				context.strokeStyle = data.lineColor;
				context.globalAlpha = data.lineAlpha;
				context.lineWidth = data.lineWidth;
				context.lineJoin = data.lineJoin;
				context.lineCap = data.lineCap;
				context.stroke();

				return this;

			}
		},
		render : {
			value : function(parent, context, dx, dy, dsx, dsy){
				dx += this.x;
				dy += this.y;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				this.primitives.iterate(function(current, index){
					switch(current.type){
						case "path":
							this.drawPath(current, context);
						break;
						case "rect":
							context.beginPath();
							context.lineWidth = current.lineWidth || 0;
							context.strokeStyle = current.lineColor;
							context.globalAlpha = current.lineAlpha || 1;
							context.rect((dx + current.x) * dsx, (dy + current.y) * dsy, current.w * dsx, current.h * dsy);
							context.stroke();
							context.fillStyle = current.fillColor;
							context.globalAlpha = current.fillAlpha || 1;
							context.fillRect(dx + current.x, dy + current.y, current.w, current.h);

							if ((dx + current.x) * dsx + current.w * dsx > this.size.x) this.size.x = (dx + current.x) * dsx + current.w * dsx > this.size.x;
							if ((dy + current.y) * dsy + current.h * dsy > this.size.y) this.size.y = (dy + current.y) * dsy + current.h * dsy > this.size.y;

						break;
						case "circle":
						  	context.save();
							context.beginPath();
							context.translate((dx + current.x) * dsx, (dy + current.y) * dsy);
							context.scale(dsx, dsy);
							context.arc(0, 0, current.radius, 0, 2 * Math.PI, false);
							context.restore();
							context.fillStyle = current.fillColor;
							context.globalAlpha = current.fillAlpha || 1;
							context.fill();
							context.lineWidth = current.lineWidth || 0;
							context.globalAlpha = current.lineAlpha || 1;
							context.strokeStyle = current.lineColor;
							context.stroke();

							if ((current.x) * dsx + current.radius * dsx > this.size._x) this.size._x = (current.x) * dsx + current.radius * dsx;
							if ((current.y) * dsy + current.radius * dsy > this.size._y) this.size._y = (current.y) * dsy + current.radius * dsy;


						break;
					}
				}, this);
			}
		}
	});

	var Text = tools.inheritCLASS(Node, {
		constructor : function(text, styles){
			this._text = text;
			this.styles = styles;
		},
		styles : {
			get : function(){
				return this._styles;
			},
			set : function(styles){
				styles = styles || {};
				styles.fontSize = styles.fontSize || "16px";
				styles.fontFamily = styles.fontFamily || "sans-serif";
				styles.color = styles.color || "#000000";
				styles.textAlign = styles.textAlign || "left";
				this._styles = styles;
			}
		},	
		text : {
			get : function(){ return this._text },
			set : function(text){
				this._text = text;
			}
		},	
		render : {
			value : function(parent, context, dx, dy, dsx, dsy){
				dx += this.x;
				dy += this.y;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				context.font = this.styles.fontSize + " " + this.styles.fontFamily;
				context.fillStyle = this.styles.color;
				context.textAlign = this.styles.textAlign;
				context.fillText(this.text, dx, dy);
			}
		}
	});


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*PIXTON*/
	var Pixton = tools.inheritCLASS(Node, {
		constructor : function(options){
			this.options = options = (options || {});
			this.canvas = options.canvas || document.createElement("canvas");
			this.xCanvas = document.createElement("canvas");

			this.ctx = this.canvas.getContext("2d");
			this.xCtx = this.xCanvas.getContext("2d");

			this.render = this.render.bind(this);
			this._setupInteractivity(options);

		},
		Texture : {
			value : Texture
		},
		Sprite : {
			value : Sprite
		},
		Node : {
			value : Node
		},
		Container : {
			value : Node
		},
		Graphics : {
			value : Graphics
		},
		Text : {
			value : Text
		},
		TokensCollection : {
			value : TokensCollection
		},
		TokensList : {
			value : TokensList
		},
		events : {
			get : function(){
				if (typeof this._events == "undefined"){
					this._events = {
						"mousemove"	 : "pointermove" 	,
						"mouseover"	 : "pointerover" 	,
						"mouseout"	 : "pointerout" 	,
						"mousedown"	 : "pointerdown" 	,
						"mouseup"	 : "pointerup" 		,
						"click" 	 : "pointertap" 	,
						"touchmove"	 : "pointermove"	,
						"touchstart" : "pointerdown"	,
						"touchend"	 : "pointerup"		,
						"tap"		 : "pointertap"
					};
				} 

				return this._events;
			}
		},
		_setupInteractivity : {
			value : function(){
				this.prevInteractionTime = +new Date();
				var events = this.events;
				this._onUserEvent = this._onUserEvent.bind(this);

				for (var k in events){
					this.canvas.addEventListener(k, this._onUserEvent);
				}

			}
		},
		_onUserEvent : {
			value : function(evt){
				var type = this.events[evt.type];

				if (type == "pointermove" && +new Date() - this.prevInteractionTime < (this.options.interactionFreq || 10)){
					return;
				}

				this.prevInteractionTime = +new Date();

				var x = evt.offsetX;
				var y = evt.offsetY;

				this.checkInteractivity(type, x, y, this.canvas, evt, 0, 0);
			},
			writable : true
		},
		resolution : {
			get : function(){
				if (typeof this._resolution == "undefined") this._resolution = window.devicePixelRatio || 1;
				return this._resolution;
			},
			set : function(){
				this._resolution = value;
			}
		},
		resize : {
			value : function(w, h){
				this.size.x = w;
				this.size.y = h;
				this.canvas.width = this.xCanvas.width = w;
				this.canvas.height = this.xCanvas.height = h;
			}
		},
		render : {
			value : function(){
				this.xCtx.clearRect(0, 0, this.size.x, this.size.y);
				this.ctx.clearRect(0, 0, this.size.x, this.size.y);
				this.prerender(this.ctx);
				this.ctx.drawImage(this.xCanvas, 0, 0);
			}
		},
		prerender : {
			value : function(context){
				this.children.iterate(function(child, index){
					child.render(this, context, this.position.x, this.position.y, this.scale.x, this.scale.y);
				}, this);
			}
		}
	});

	Pixton.tools = new Tools;
	Pixton.Node = Pixton.Container = Node;
	Pixton.Sprite = Sprite;
	Pixton.Point = Point;
	Pixton.Texture = Texture;
	Pixton.Graphics = Graphics;
	Pixton.Text = Text;
	Pixton.TokensCollection = TokensCollection;
	Pixton.TokensList = TokensList;

	return Pixton;

});