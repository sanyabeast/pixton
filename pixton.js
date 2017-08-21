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
			}
		},
		add : {
			value : function(value){
				this.content.push(value);
				this.content.size = this.content.length;
				return this.content[this.content.size - 1];
			}
		},
		remove : {
			value : function(value){
				tools.removeFromArrByValue(this.content, value);
				this.content.size = this.content.length;
			}
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
		},
		match : function(classes){
			classes = classes.split(".");
			var result = false;

			this.iterate(function(value, index, loop){
				if (classes.indexOf(value) < 0){
					result = false;
					loop.break;
				}
			}, this);

			return result;

		},
		contains : {
			value : function(value){
				return this.content.indexOf(value) > -1;
			}
		},
		clear : {
			value : function(){
				this._content.length = 0;
				this._content.size = 0;
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
			this.classes = new TokensCollection(options.classes);
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
		absX : {
			get : function(){
				if (this.parent){
					return this.parent.absX + this.x;
				} else {
					return this.x;
				}
			}
		},
		absY : {
			get : function(){
				if (this.parent){
					return this.parent.absY + this.y;
				} else {
					return this.y;
				}
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
			value : function(parent, context){
				this.children.iterate(function(child, index){
					// console.log(child);
					child.render(this, context);
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
			value : function(parent, context){
				if (!this.texture.loaded) return;
				context.drawImage(this.texture.image, this.absX, this.absY, this.texture.width * this.scale.x, this.texture.height * this.scale.y);
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
			value : function(data, context){
				var path = data.path;

				var absX = this.absX;
				var absY = this.absY;
				var sx = this.scale.x;
				var sy = this.scale.y;

				context.beginPath();
				context.moveTo((path[0] + absX) * sx, (path[1] + absY) * sy);

				for (var a = 2, l = path.length, x, y; a < l; a++){
					if (a % 2 == 0){
						x = (path[a] + absX) * sx;
						continue;
					} else {
						y = (path[a] + absY) * sy;
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
			value : function(parent, context){
				var absX = this.absX;
				var absY = this.absY;
				var sx = this.scale.x;
				var sy = this.scale.y;

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
							context.rect((absX + current.x) * sx, (absY + current.y) * sy, current.w * sx, current.h * sy);
							context.stroke();
							context.fillStyle = current.fillColor;
							context.globalAlpha = current.fillAlpha || 1;
							context.fillRect(absX + current.x, absY + current.y, current.w, current.h);
						break;
						case "circle":
						  	context.save();
							context.beginPath();
							context.translate((absX + current.x) * sx, (absY + current.y) * sy);
							context.scale(sx, sy);
							context.arc(0, 0, current.radius, 0, 2 * Math.PI, false);
							context.restore();
							context.fillStyle = current.fillColor;
							context.globalAlpha = current.fillAlpha || 1;
							context.fill();
							context.lineWidth = current.lineWidth || 0;
							context.globalAlpha = current.lineAlpha || 1;
							context.strokeStyle = current.lineColor;
							context.stroke();
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
			value : function(parent, context){
				var absX = this.absX;
				var absY = this.absY;

				context.font = this.styles.fontSize + " " + this.styles.fontFamily;
				context.fillStyle = this.styles.color;
				context.textAlign = this.styles.textAlign;
				context.fillText(this.text, absX, absY);
			}
		}
	});


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*PIXTON*/
	var Pixton = function(options){
		options = options || {};
		this.canvas = options.canvas || document.createElement("canvas");
		this.xCanvas = document.createElement("canvas");

		this.ctx = this.canvas.getContext("2d");
		this.xCtx = this.xCanvas.getContext("2d");

		this.root = new Node();
		this.render = this.render.bind(this);

		this.size = new Point(options.width || 500, options.height || 500);
	};

	Pixton.tools = new Tools;
	Pixton.Node = Pixton.Container = Node;
	Pixton.Sprite = Sprite;
	Pixton.Point = Point;
	Pixton.Texture = Texture;
	Pixton.Graphics = Graphics;
	Pixton.Text = Text;
	Pixton.TokensCollection = TokensCollection;

	Pixton.prototype = {
		tools : new Tools,
		Node : Node,
		Container : Node,
		Sprite : Sprite,
		Point : Point,
		Texture : Texture,
		Graphics : Graphics,
		Text : Text,
		TokensCollection : TokensCollection,
		get resolution(){
			if (typeof this._resolution == "undefined") this._resolution = window.devicePixelRatio || 1;
			return this._resolution;
		},
		set resolution(value){
			this._resolution = value;
		},
		resize : function(w, h){
			this.size.x = w;
			this.size.y = h;
			this.canvas.width = this.xCanvas.width = w;
			this.canvas.height = this.xCanvas.height = h;
		},	
		render : function(){
			this.prerender();
			this.ctx.clearRect(0, 0, this.size.x, this.size.y);
			this.ctx.drawImage(this.xCanvas, 0, 0);
		},
		prerender : function(){
			this.xCtx.clearRect(0, 0, this.size.x, this.size.y);
			this.root.render(this.root, this.xCtx);
		}
	};

	return Pixton;

});