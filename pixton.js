"use strict";
define(function(){
	var IS_TOUCH_DEVICE = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

	var Pixton;

	/*TOOlS*/
	var multiDispatchedEvents = {
		"pointerout" : true,
		"pointerup" : true
	};

	var Tools = function(){};
	Tools.prototype = {
		superTrimString : function(input){
			input = input.replace(/\s\s+/g, " ");
			input = input.replace(/(\r\n|\n|\r)/gm,"");
			input = input.trim();
			return input;
		},
		numberize : function(data){
			return Number(data) || 0;
		},
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
		inheritCLASS : function(SuperC, prototype, name){
			var _super;
			var C = prototype.constructor;
			delete prototype.constructor;

			var CLASS = function(){
				SuperC.apply(this, arguments);
				C.apply(this, arguments);
			};

			Object.defineProperties(CLASS.prototype, SuperC.prototype._prototype);
			Object.defineProperties(CLASS.prototype, prototype);

			for (var k in prototype){
				if (prototype[k].static){
					CLASS[k] = CLASS.prototype[k];
				}
			}

			name = name || "inherited class";

			Object.defineProperty(CLASS.prototype, "CLASS_NAME", {
				writable : false,
				configurable : false,
				value : name + " extends " + SuperC.CLASS_NAME
			});

			Object.defineProperty(CLASS, "CLASS_NAME", {
				writable : false,
				configurable : false,
				value : name + " extends " + SuperC.CLASS_NAME
			});

			Object.defineProperty(CLASS.prototype, "super", {
				writable : false,
				configurable : false,
				value : function(name){
					return SuperC.prototype[name].apply(this, Array.prototype.splice.call(arguments, 1, arguments.length));
				}
			});
			
			CLASS.prototype._prototype = prototype;

			return CLASS;
		},
		CLASS : function(prototype, name){
			var C = prototype.constructor;
			delete prototype.constructor;

			var CLASS = function(){
				C.apply(this, arguments);
			};


			Object.defineProperties(CLASS.prototype, prototype);

			for (var k in prototype){
				if (prototype[k].static){
					CLASS[k] = CLASS.prototype[k];
				}
			}

			name = name || "class";

			Object.defineProperty(CLASS.prototype, "CLASS_NAME", {
				writable : false,
				configurable : false,
				value : name
			});

			Object.defineProperty(CLASS, "CLASS_NAME", {
				writable : false,
				configurable : false,
				value : name
			});

			

			CLASS.prototype._prototype = prototype;

			return CLASS;
		},
		joinArray : function(target, source){
			return target.concat(source);
		},
		transCoord : function(coord, srcResolution, targetResolution){
			return coord * (targetResolution / srcResolution);
		},
		calcOffsetX : function(){

		},
		calcOffsetY : function(){
			
		},
		distancePoints2 : function(x0, y0, x1, y1){
			return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
		},
	};

	var tools = new Tools;

	/*scene builder*/
	var SceneBuilder = tools.CLASS({
		constructor : function(){

		},

		make : {
			value : function(data){
				var description = this.convert2Obj(data);
				var scene = this.buildScene(description);
				return scene;
			}
		},

		buildScene : {
			value : function(description){

				var result = iterate(description);

				function iterate(description){
					var node;

					switch(description.type.toLowerCase()){
						case "sprite":
							node = new Pixton.Sprite();
						break;
						case "graphics":
							node = new Pixton.Graphics();
						break;
						case "text":
							node = new Pixton.Text();
						break;
						default:
							node = new Pixton.Node();
						break;
					}

					node.setup(description);

					for (var a = 0; a < description.children.length; a++){
						node.addChild(iterate(description.children[a]));
					}


					return node;

				}

				return result;
			}
		},

		convert2Obj : {
			value : function(data){
				var type = this.typeof(data);


				switch(type){
					case "html":
						return this.DOM2OBJ(this.HTML2DOM(data));
					break;
					case "dom":
						return this.DOM2OBJ(data);
					break;
					case "tpl":
						return this.DOM2OBJ(data.content.cloneNode(true).children[0]);
					break;
					case "json":
						return JSON.parse(data);
					break;
					case "obj":
						return data;
					break;
				}

			}
		},

		typeof : {
			value : function(data){
				if (typeof data == "string"){
					if (data.indexOf("<") == 0 && data.indexOf(">") == data.length - 1){
						return "html";
					} else {
						return "json";
					}
				} else if (typeof data == "object"){
					if (data instanceof window.Node){
						if (data.tagName == "TEMPLATE"){
							return "tpl";
						} else {
							return "dom";							
						}
					} else {
						return "obj";
					}
				}
			}
		},

		HTML2DOM : {
			value : function(html){
				var el = document.createElement("div");
				el.innerHTML = html;
				var result = el.children[0];
				el.remove();
				return result;
			}
		},

		DOM2OBJ : {
			value : function(dom){
				var result = iterate(dom);

				function iterate(node){
					var description = {};

					for (var a = 0; a < node.attributes.length; a++){
						description[node.attributes[a].name] = node.attributes[a].value;
					}

					if(node.childNodes[0]) description.value = tools.superTrimString(node.childNodes[0].nodeValue);
					description.type = node.tagName;
					description.children = [];

					for (var a = 0; a < node.children.length; a++){
						description.children.push(iterate(node.children[a]));
					}

					return description;

				}

				return result;

			}
		}



	}, "SceneBuilder");


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
		removeByIndex : {
			value : function(index){
				tools.removeFromArrByIndex(this.content, index);
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
			writable : true,
			configurable : true
		},
		reverseIterate : {
			value : function(callback, context){
				var result;
				this.loop.break = this.loop.continue = false;

				for (var a = this.content.size - 1; a >= 0; a--){
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
	}, "TokensCollection");

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
	}, "TokensList");

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
	}, "Point");


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*NODE*/
	var Node = tools.CLASS({
		constructor : function(options){
			options = options || {};
			this.children = new TokensCollection();
			this.position = new Point();
			this.pointerPosition = new Point(0, 0),
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
					prevY : 0,
					panningStarted : false,
					prevPanningDistance : 1,
					panningDelta : 1
				},
				type : null,
				target : this
			};

		},
		setup : {
			value : function(data){
				if (data.x) this.position.x = tools.numberize(data.x);
				if (data.y) this.position.y = tools.numberize(data.y);
				if (data.scale) this.position.scale.set(tools.numberize(data.scale) || 1);
				if (data.scaleX) this.position.scale.x = tools.numberize(data.scaleX) || 1;
				if (data.scaleY) this.position.scale.y = tools.numberize(data.scaleY) || 1;
				if (data.id) this.id = data.id;
				if (data.class) this.classes.content = data.class.split(" ");
				if (data.invisible) this.visible = false;

			},
			writable : true
		},
		childIndex : {
			get : function(){
				return this._childIndex;
			},	
			set : function(value){
				this._childIndex = value;
			}
		},
		type : {
			get : function(){
				return "node";
			},
			configurable : true
		},
		drawDebug : {
			value : function(context){
				return;
				var strokeStyle = context.strokeStyle;
				context.lineWidth = 1;
				context.strokeStyle = "#ffffff";
				context.rect(this.calculated.position.x, this.calculated.position.y, this.size.x, this.size.y);
				context.stroke();
				context.font = "16px Monospace";
				context.fillStyle = "#ffffff";
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
			value : function(eventType, x, y, canvas, evt, dx, dy, dispatched){
				dx += this.calculated.position.x;
				dy += this.calculated.position.y;

				if (multiDispatchedEvents[eventType]){
					dispatched = false;
				}

				if (dispatched){
					return;
				}

				var result = false;

				if (this.interactive && !dispatched){
					result = this.processInteractivity(eventType, x, y, canvas, evt, dx, dy);
				} 		

				dispatched = false;

				this.children.reverseIterate(function(child, id, loop){
					if (child.checkInteractivity(eventType, x, y, canvas, evt, dx, dy, dispatched)){
						dispatched = true;
					}
				}, this);

				return result;
			}
		},
		processInteractivity : {
			value : function(eventType, x, y, canvas, evt, dx, dy){
				var inside = tools.coordsBelognsRect(x, y, dx, dy, this.size.x, this.size.y);
				var result = false;

				this.eventData.originalEvent = evt;
				this.eventData.pointer.x = x;
				this.eventData.pointer.y = y;

				this.eventData.extra.deltaX = x - this.eventData.extra.prevX;
				this.eventData.extra.deltaY = y - this.eventData.extra.prevY;

				this.eventData.extra.prevX = x;
				this.eventData.extra.prevY = y;


				// console.log("original pointer",this.eventData.pointer.x, this.eventData.pointer.y);

				this.eventData.extra.wheelDeltaX = evt.wheelDeltaX || this.eventData.extra.wheelDeltaX;
				this.eventData.extra.wheelDeltaY = evt.wheelDeltaY || this.eventData.extra.wheelDeltaY;
				
				if (eventType == "mousewheel" && this.hovered){
					result = this.runCallback("mousewheel");
				}

				if (eventType == "pointerout"){
					if (this.hovered){
						this.hovered = false;
						result = this.runCallback("pointerout");
					}
				}

				if (eventType == "pointerup" && evt.isTouchEvent){
					this.hovered = false;
					this.captured = false;
					result = this.runCallback("pointerout");
				}

				if (eventType == "pointerdown" && evt.isTouchEvent && inside){
					this.hovered = true;
					result = this.runCallback("pointerover");
				}

				if (eventType == "pointermove" && inside && !this.hovered){
					if (this.buttonMode) canvas.style.cursor = "pointer";
					this.hovered = true;
					result = this.runCallback("pointerover");
				}

				if ((eventType == "pointermove") && !inside && this.hovered){
					if (this.buttonMode) canvas.style.cursor = "default";
					this.hovered = false;
					result = this.runCallback("pointerout");
				}

				if (eventType == "pointermove" && inside && this.hovered){
					result = this.runCallback("pointermove");
				}

				if (eventType == "pointertap" && this.hovered && inside){
					this.captured = false;
					result = this.runCallback("pointertap");
				}

				if (eventType == "pointerdown" && this.hovered && inside){
					this.captured = true;
					result = this.runCallback("pointerdown");
				}

				if (eventType == "pointerup" && inside){
					this.captured = false;
					this.eventData.extra.panningStarted = false;
					result = this.runCallback("pointerup");
				}

				if (eventType == "pointerup" && !inside){
					this.hovered = this.captured = false;
					result = this.runCallback("pointerupoutside");
				}

				if (eventType == "pointerdown" && !inside){
					this.hovered = this.captured = false;
					result = this.runCallback("pointerdownoutside");
				}

				if (eventType == "pointertap" && !inside){
					this.hovered = this.captured = false;
					result = this.runCallback("pointertapoutside");
				}

				if (eventType == "pointermove" && this.captured){
					result = this.runCallback("pointerdrag");
				}

				if (eventType == "panning"){

					if (this.eventData.extra.panningStarted){
						var distance = tools.distancePoints2(evt.touch1X, evt.touch1Y, evt.touch2X, evt.touch2Y);
						this.eventData.extra.panningDelta = this.eventData.extra.prevPanningDistance / distance;
						this.eventData.extra.prevPanningDistance = distance;
					} else {
						this.eventData.extra.panningStarted = true;
						this.eventData.extra.prevPanningDistance = tools.distancePoints2(evt.touch1X, evt.touch1Y, evt.touch2X, evt.touch2Y);
						this.eventData.extra.panningDelta = 1;
					}


					this.eventData.pointer.x = x;
					this.eventData.pointer.y = y;

					result = this.runCallback("panning");
				}

				return result;

			}
		},
		runCallback : {
			value :  function(eventName){
				if (this.callbacks.contains(eventName)) {
					this.callbacks.get(eventName)(this.eventData, eventName);
					return true;
				}

				return false;
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

				dx += this.x;
				dy += this.y;

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

				// this.drawDebug(context);

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
				child.childIndex = this.children.content.size - 1;

				return this;
			},
		},
		remove : {
			value : function(){
				if (this.parent){
					this.parent.removeChild(this);
				}

				return this;
			}
		},
		removeChild : {
			value : function(child){
				this.children.removeByIndex(child.childIndex);
				this.children.iterate(function(child, index){
					child.childIndex = index;
				});

				return this;
			}
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
	}, "Node");

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
	}, "Texture");

	var Sprite = tools.inheritCLASS(Node, {
		constructor : function(texture){
			if (texture) this.texture = texture;	
		},
		texture : {
			get : function(){
				return this._texture;
			},
			set : function(texture){
				if (texture instanceof Texture){
					this._texture = texture;
				} else if (typeof texture == "string"){
					this._texture = new Texture(texture);
				}	
			}
		},
		setup : {
			value : function(data){
				this.super("setup", data);

				if (data.texture) {
					this.texture = data.texture;
				}

			},
			writable : true
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

				// this.drawDebug(context);

			}
		}
	}, "Sprite");

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
		drawArc : {
			value : function(x, y, radius, startAngle, endAngle){
				this.primitives.add({
					type : "arc",
					x : x,
					y : y,
					radius : radius,
					startAngle : startAngle, 
					endAngle : endAngle,
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
							context.fillRect((dx + current.x) * dsx, (dy + current.y) * dsy, current.w * dsx, current.h * dsy);

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
							context.translate((dx + current.x) * dsx, (dy + current.y) * dsy);
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
						case "arc":
						  	context.save();
							context.beginPath();
							context.translate((dx + current.x) * dsx, (dy + current.y) * dsy);
							context.scale(dsx, dsy);


							context.arc(0, 0, current.radius, current.startAngle, current.endAngle);
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


				// this.drawDebug(context);


			}
		}
	}, "Graphics");

	var Text = tools.inheritCLASS(Node, {
		constructor : function(text, styles){
			this._text = text;
			this.styles = styles;

			this.classes.add("text-node");

		},
		setup : {
			value :function(data){
				this.super("setup", data);

				var styles = {};

				if (data.fontsize) styles.fontSize = data.fontsize;
				if (data.fontfamily) styles.fontFamily = data.fontfamily;
				if (data.color) styles.color = data.color;
				if (data.textalign) styles.textAlign = data.textalign;

				if (data.value) this.text = data.value;

				this.styles = styles;

			}
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
				context.fillText(this.text, dx * dsx, dy * dsy);
			}
		}
	}, "Text");

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*PIXTON*/
	Pixton = tools.inheritCLASS(Node, {
		constructor : function(options){
			this._fps = 0;
			this.options = options = (options || {});
			this.canvas = options.canvas || document.createElement("canvas");
			this.canvas.classList.add("pixton");
			this.xCanvas = document.createElement("canvas");

			this.ctx = this.canvas.getContext("2d");
			this.xCtx = this.xCanvas.getContext("2d");

			this.render = this.render.bind(this);
			this._onUserEvent = this._onUserEvent.bind(this);
			this.setupInteractivity();

		},
		sceneBuilder : {
			value : new SceneBuilder(),
			static : true
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
						"mousemove"	 		: "pointermove" 	,
						"mouseover"	 		: "pointerover" 	,
						"mouseout"	 		: "pointerout" 		,
						"mousedown"	 		: "pointerdown" 	,
						"mouseup"	 		: "pointerup" 		,
						"click" 	 		: "pointertap" 		,
						"touchmove"	 		: "pointermove"		,
						"touchstart" 		: "pointerdown"		,
						"touchend"	 		: "pointerup"		,
						"tap"		 		: "pointertap"		,
						"mousewheel" 		: "mousewheel"		,
						"DOMMouseScroll" 	: "mousewheel"
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
				this.interactionElement = element;

			}
		},
		_onUserEvent : {
			value : function(evt){
				if (evt.type == "mousemove"){
					IS_TOUCH_DEVICE = false;
				}


				var isTouchEvent = ("TouchEvent" in window && evt instanceof TouchEvent);

				if (isTouchEvent){
					IS_TOUCH_DEVICE = true;
				}

				if (IS_TOUCH_DEVICE && !isTouchEvent){
					return;
				}

				var touchCount = 0;
				var eventType = this.events[evt.type];
				var bounds = this.interactionElement.getBoundingClientRect();
				var x, y;


				evt.isTouchEvent = isTouchEvent;

				if (isTouchEvent){
					touchCount = evt.touches.length;
					evt.touchCount = touchCount;

					if (touchCount == 1){
						x = tools.transCoord((evt.touches[0].pageX - bounds.left), this.interactionElement.clientWidth, this.canvas.width) / this.scale.x;
						y = tools.transCoord((evt.touches[0].pageY - bounds.top), this.interactionElement.clientHeight, this.canvas.height) / this.scale.y;
					} else if (touchCount == 2){

						evt.touch1X = tools.transCoord((evt.touches[0].pageX - bounds.left), this.interactionElement.clientWidth, this.canvas.width) / this.scale.x;
						evt.touch1Y = tools.transCoord((evt.touches[0].pageY - bounds.top), this.interactionElement.clientHeight, this.canvas.height) / this.scale.y;

						evt.touch2X = tools.transCoord((evt.touches[1].pageX - bounds.left), this.interactionElement.clientWidth, this.canvas.width) / this.scale.x;
						evt.touch2Y = tools.transCoord((evt.touches[1].pageY - bounds.top), this.interactionElement.clientHeight, this.canvas.height) / this.scale.y;

						x = (evt.touch1X + evt.touch2X) / 2;
						y = (evt.touch1Y + evt.touch2Y) / 2;

						eventType = "panning";
					}

					if (touchCount > 0){
						

						if (touchCount == 2){
							
						}

					} else {
						x = this.pointerPosition.x;
						y = this.pointerPosition.y;
					}

					if (eventType == "pointerdown"){
						this.prevPointerDownTime = +new Date();
					}

					if (eventType == "pointerup"){
						if (+new Date() - this.prevPointerDownTime < 250){
							eventType = "pointertap";
						}
					}

				} else {
					x = tools.transCoord((evt.pageX - bounds.left), this.interactionElement.clientWidth, this.canvas.width) / this.scale.x;
					y = tools.transCoord((evt.pageY - bounds.top), this.interactionElement.clientHeight, this.canvas.height) / this.scale.y;
				}

				this.pointerPosition.x = x;
				this.pointerPosition.y = y;

				if (eventType == "mousewheel"){
					evt.preventDefault();
				}


				if (eventType == "pointermove" || eventType == "mousewheel" || eventType == "panning"){

					if (+new Date() - this.prevPointerEventTime < (this.interactionFreq || 10)){
						return;
					} 

					this.prevPointerEventTime = +new Date();

					this.interactionElement.testEvent = evt
				};

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
			set : function(value){
				this._resolution = value;
			}
		},
		resize : {
			value : function(w, h){
				var  resolution = this.resolution || window.devicePixelRatio || 1;
				this.scale.set(resolution);
				this.size.x = w;
				this.size.y = h;
				this.canvas.width =  w * resolution;
				this.canvas.height = h * resolution;
				this.xCanvas.width = w * resolution;
				this.xCanvas.height = h * resolution;
			}
		},
		resizeToFitParent : {
			value : function(){
				var parent = this.canvas.parentNode;

				if (parent){
					this.resize(parent.clientWidth || this.canvas.width || 1, parent.clientHeight || this.canvas.height || 1);
				}

			}
		},
		fps : {
			get : function(){
				return this._fps;
			},
		},
		render : {
			value : function(absDelta, relDelta){
				this._fps = (this._fps + 60 / relDelta) / 2; 

				this.xCtx.clearRect(0, 0, this.xCanvas.width, this.xCanvas.height);
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.prerender(this.ctx);
				// console.log(this.xCanvas.width, this.xCanvas.height);
				//this.ctx.drawImage(this.xCanvas, 0, 0);
			}
		},
		
		prerender : {
			value : function(context){
				this.children.iterate(function(child, index){
					child.render(this, context, this.position.x, this.position.y, this.scale.x, this.scale.y);
				}, this);
			}
		}
	}, "Pixton");

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