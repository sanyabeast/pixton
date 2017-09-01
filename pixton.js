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
		},
		joinArray : function(target, source){
			return target.concat(source);
		}
	};


	var tools = new Tools;

	/*Tokelist*/
	var TokensCollection = tools.CLASS({
		constructor : function(content){
			this.content = content;
			if (content) this.content.size = content.length;
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
			this.anchor = new Point(0, 0);
			this.classes = new TokensCollection(options.classes);
			this.callbacks = new TokensList();
			this.debug = new TokensList();
			this.selectorsCache = new TokensList();
			this.id = options.id;

			this.calculated = {
				size : this.size,
				position : new Point(1, 1)
			};

			this.eventData = {
				originalEvent : null,
				pointer : {
					x : 0,
					y : 0
				},
				extra : {
					deltaX : 0,
					deltaY : 0,
					prevX : 0,
					prevY : 0
				},
				type : null,
				target : this
			};

		},
		type : {
			get : function(){
				return "node";
			},
			configurable : true
		},
		drawDebug : {
			value : function(context){
				var strokeStyle = context.strokeStyle;
				context.lineWidth = 1;
				context.strokeStyle = "#000000";
				context.rect(this.calculated.position.x, this.calculated.position.y, this.size.x, this.size.y);
				context.stroke();
				context.font = "16px Monospace";
				context.fillStyle = "#000000";
				context.fillText(this.type, this.calculated.position.x + 8, this.calculated.position.y + 16);
				context.strokeStyle = strokeStyle;

			}
		},
		visible : {
			get : function(){
				if (typeof this._visible == "undefined") this._visible = true;
				return this._visible;
			},
			set : function(value){
				this._visible = value;
			}
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
				dx += this.calculated.position.x;
				dy += this.calculated.position.y;

				if (this.interactive) this.processInteractivity(eventType, x, y, canvas, evt, dx, dy);

				this.children.iterate(function(child){
					child.checkInteractivity(eventType, x, y, canvas, evt, dx, dy);
				}, this);
			}
		},
		processInteractivity : {
			value : function(eventType, x, y, canvas, evt, dx, dy){
				var inside = tools.coordsBelognsRect(x, y, dx, dy, this.size.x, this.size.y);

				this.eventData.originalEvent = evt;
				this.eventData.pointer.x = x;
				this.eventData.pointer.y = y;
				// thsis.eventData.type = eventType;

				this.eventData.extra.deltaX = x - this.eventData.extra.prevX;
				this.eventData.extra.deltaY = y - this.eventData.extra.prevY;

				this.eventData.extra.prevX = x;
				this.eventData.extra.prevY = y;

				if (eventType == "pointerout"){
					this.hovered = false;
					return;
				}

				if (eventType == "pointermove" && inside && !this.hovered){
					if (this.buttonMode) canvas.style.cursor = "pointer";
					this.hovered = true;
					this.runCallback("pointerover");
					console.log(this.type, this);
					//if (this.callbacks.contains("pointerover")) this.callbacks.get("pointerover")(this.eventData);
				}

				if (eventType == "pointermove" && !inside && this.hovered){
					if (this.buttonMode) canvas.style.cursor = "default";
					this.hovered = false;
					this.runCallback("pointerout");
					// if (this.callbacks.contains("pointerout")) this.callbacks.get("pointerout")(this.eventData);
				}

				if (eventType == "pointermove" && inside && this.hovered){
					this.runCallback("pointermove");
					// if (this.callbacks.contains("pointermove")) this.callbacks.get("pointermove")(this.eventData);
				}

				if (eventType == "pointertap" && this.hovered && inside){
					this.runCallback("pointertap");
					// if (this.callbacks.contains("pointertap")) this.callbacks.get("pointertap")(this.eventData);
				}

				if (eventType == "pointerdown" && this.hovered && inside){
					this.captured = true;
					this.runCallback("pointerdown");
					// if (this.callbacks.contains("pointerdown")) this.callbacks.get("pointerdown")(this.eventData);
				}

				if (eventType == "pointerup" && this.hovered && inside){
					this.captured = false;
					this.runCallback("pointerup");
					// if (this.callbacks.contains("pointerup")) this.callbacks.get("pointerup")(this.eventData);
				}

				if (eventType == "pointerup" && this.hovered && !inside){
					this.hovered = this.captured = false;
					this.runCallback("pointerupoutside");
					// if (this.callbacks.contains("pointerupoutside")) this.callbacks.get("pointerupoutside")(this.eventData);
				}

				if (eventType == "pointerdown" && !inside){
					this.hovered = this.captured = false;
					this.runCallback("pointerdownoutside");
					// if (this.callbacks.contains("pointerdownoutside")) this.callbacks.get("pointerdownoutside")(this.eventData);
				}

				if (eventType == "pointertap" && !inside){
					this.hovered = this.captured = false;
					this.runCallback("pointertapoutside");
					// if (this.callbacks.contains("pointertapoutside")) this.callbacks.get("pointertapoutside")(this.eventData);
				}

				if (eventType == "pointermove" && this.captured){
					//this.hovered = this.captured = false;
					this.runCallback("pointerdrag");
					// if (this.callbacks.contains("pointerdrag")) this.callbacks.get("pointerdrag")(this.eventData);
				}

			}
		},
		runCallback : {
			value :  function(eventName){
				// this.eventData.type = eventName;
				if (this.callbacks.contains(eventName)) this.callbacks.get(eventName)(this.eventData, eventName);
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
				this._id = id;
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
				if (!this.visible){
					return;
				}

				dx += this.calculated.position.x;
				dy += this.calculated.position.y;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				var sw = 0, sh = 0;

				this.children.iterate(function(child, index){
					child.render(this, context, dx, dy, dsx, dsy);
					if (child.x + child.size.x > sw) sw = child.x + child.size.x;
					if (child.y + child.size.y > sh) sh = child.y + child.size.y;
					if (child.x < 0){
						this.calculated.position.x += child.calculated.position.x
					} else {
						this.calculated.position.x = this.position.x;
					}

					if (child.y < 0){
						this.calculated.position.y += child.calculated.position.y
					} else {
						this.calculated.position.y = this.position.y;
					}
				}, this);

				this.size.x = sw;
				this.size.y = sh;

				this.drawDebug(context);

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
		},
		matchClassSelector : {
			value : function(selector){
				var classes = selector.split(".");
				var matches = 0;
				var targetMatchCount = classes.length;

				for (var a = 0; a < classes.length; a++){
					if (classes[a].length == 0){
						targetMatchCount--;
						continue;
					}

					if (this.classes.contains(classes[a])){
						matches++;
					} else {
						matches--;
						break;
					}

				}

				return matches > 0 && (matches == targetMatchCount);

			}
		},
		matchIdSelector : {
			value : function(selector){
				return this.id == selector.split("#")[1];
			}
		},
		matchSelector : {
			value : function(selector){
				if (selector.indexOf("#") == 0){
					return this.matchIdSelector(selector);
				} else if (selector.indexOf(".") > -1){
					return this.matchClassSelector(selector);
				}

			},
		},
		selectIteration : {
			value : function(selector){
				var result = [];

				this.children.iterate(function(child){
					if (child.matchSelector(selector)){
						result.push(child);
					};

					result = tools.joinArray(result, child.selectIteration(selector));
				});

				return result;

			}
		},
		select : {
			value : function(selector, cache, callback, context){
				var result;

				if (typeof cache == "function"){
					context = callback;
					callback = cache;
					cache = true;
				}

				if (cache && this.selectorsCache.contains(selector)){
					result = this.selectorsCache.get(selector);
				} else {
					result = new TokensCollection(this.selectIteration(selector));
					this.selectorsCache.add(selector, result);
				}

				if (callback){
					result.iterate(callback, context)
				};

				return result;

			}
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
			if (texture instanceof Texture){
				this.texture = texture;
			} else if (typeof texture == "string"){
				this.texture = new Texture(texture);
			}		

		},
		type : {
			get : function(){
				return "sprite";
			},
			configurable : true
		},
		render : {
			value : function(parent, context, dx, dy, dsx, dsy){
				if (!this.visible){
					return;
				}

				dx += this.x;
				dy += this.y;

				this.calculated.position.x = dx;
				this.calculated.position.y = dy;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				if (!this.texture.loaded) return;

				context.drawImage(this.texture.image, dx, dy, this.texture.width * dsx, this.texture.height * dsy);
				this.size._x = this.texture.width * this.scale.x;
				this.size._y = this.texture.height * this.scale.y;

				this.drawDebug(context);

			}
		}
	});

	var Graphics = tools.inheritCLASS(Node, {
		constructor : function(){
			this.primitives = new TokensCollection;
			this.activePath = null;

			this.fillAlpha = 1;
			this.fillColor = "#000000";Graphics

			this.lineAlpha = 1;
			this.lineColor = "#000000";
			this.lineWidth = 1;

			this.lineJoin = "round";
			this.lineCap = "round";
		},
		type : {
			get : function(){
				return "graphics";
			},
			configurable : true
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
			value : function(path){
				this.primitives.add({
					type : "polygon",
					path : path,
					fillColor : this.fillColor,
					fillAlpha : this.fillAlpha,
					lineColor : this.lineColor,
					lineAlpha : this.lineAlpha,
					lineWidth : this.lineWidth
				})
			}
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
		renderPolygon : {
			value : function(data, context, dx, dy, dsx, dsy){
				var path = data.path;

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
				context.closePath();
				context.stroke();

				context.fillStyle = data.fillColor;
				context.globalAlpha = data.fillAlpha;
				context.fill();

			}
		},
		renderPath : {
			value : function(data, context, dx, dy, dsx, dsy){
				var path = data.path;

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
				if (!this.visible){
					return;
				}

				dx += this.x;
				dy += this.y;

				dsx *= this.scale.x;
				dsy *= this.scale.y;

				var sw = 0, sh = 0;

				this.calculated.position.x = this.position.x;
				this.calculated.position.y = this.position.y;

				this.primitives.iterate(function(current, index){
					switch(current.type){
						case "path":
							this.renderPath(current, context, dx, dy, dsx, dsy);
						break;
						case "polygon":
							this.renderPolygon(current, context, dx, dy, dsx, dsy);
						break;
						case "rect":
							context.beginPath();
							context.globalAlpha = current.lineAlpha || 1;
							context.rect((dx + current.x) * dsx, (dy + current.y) * dsy, current.w * dsx, current.h * dsy);
							context.fillStyle = current.fillColor;
							context.globalAlpha = current.fillAlpha || 1;
							context.fillRect(dx + current.x, dy + current.y, current.w, current.h);

							if (current.lineWidth){
								context.lineWidth = current.lineWidth || 0;
								context.globalAlpha = current.lineAlpha;
								context.strokeStyle = current.lineColor;
								context.stroke();
							}

							

							if ((dx + current.x) * dsx + current.w * dsx > sw) sw = (dx + current.x) * dsx + current.w * dsx;
							if ((dy + current.y) * dsy + current.h * dsy > sh) sh = (dy + current.y) * dsy + current.h * dsy;

						break;
						case "circle":
						  	context.save();
							context.beginPath();
							context.translate((dx + current.x), (dy + current.y));
							context.scale(dsx, dsy);
							context.arc(0, 0, current.radius, 0, 2 * Math.PI, false);
							context.restore();
							context.fillStyle = current.fillColor;
							context.globalAlpha = current.fillAlpha || 1;
							context.fill();

							if (current.lineWidth){
								context.lineWidth = current.lineWidth || 0;
								context.globalAlpha = current.lineAlpha || 1;
								context.strokeStyle = current.lineColor;
								context.stroke();
							}

							

							if ((current.x) + current.radius * 2 > sw) sw = (current.x) + (current.radius * 2);
							if ((current.y) + current.radius * 2 > sh) sh = (current.y) + (current.radius * 2);

							if (current.x < current.radius){
								if (this.x + current.x - current.radius < this.calculated.position.x) {
									this.calculated.position.x = this.x + (current.x - current.radius)
								}
							}

							if (current.y < current.radius){
								if (this.y + current.y - current.radius < this.calculated.position.y) {
									this.calculated.position.y = this.y + (current.y - current.radius)
								}
							}

						break;
					}

					this.size._x = sw;
					this.size._y = sh;

				}, this);


				this.drawDebug(context);


			}
		}
	});

	var Text = tools.inheritCLASS(Node, {
		constructor : function(text, styles){
			this._text = text;
			this.styles = styles;
		},
		type : {
			get : function(){
				return "text";
			},
			configurable : true
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
				if (!this.visible){
					return;
				}

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
			this._onUserEvent = this._onUserEvent.bind(this);
			this.setupInteractivity();

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
		setupInteractivity : {
			value : function(element){
				if (this.interactionElement){
					clearInterval(this.interactionElement.customEventCheckingID);
					delete this.interactionElement;
				}


				element = element || this.canvas;

				if (!element){
					return;
				}

				var events = this.events;
				
				for (var k in events){
					element.addEventListener(k, this._onUserEvent);
				}

				element.testEvent = new Event("mousemove");
				// element.customEventCheckingID = setInterval(function(){
				// 	element.dispatchEvent(element.testEvent);
				// }, this.options.interactionFreq || 250);

				this.interactionElement = element;

			}
		},
		_onUserEvent : {
			value : function(evt){
				var eventType = this.events[evt.type];

				if (eventType == "pointermove") this.interactionElement.testEvent = evt;

				var x = evt.offsetX;
				var y = evt.offsetY;

				if (this.interactive) this.processInteractivity(eventType, x, y, this.canvas, evt, this.calculated.position.x, this.calculated.position.y);

				this.checkInteractivity(eventType, x, y, this.canvas, evt, 0, 0);
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
				this.size.x = w * this.resolution;
				this.size.y = h * this.resolution;
				this.canvas.width = this.xCanvas.width = w * this.resolution;
				this.canvas.height = this.xCanvas.height = h * this.resolution;
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