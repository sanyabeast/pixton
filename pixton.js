"use strict";
define(function(){
	var IS_TOUCH_DEVICE = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

	var Pixton;
	var instances = [];

	/*TOOlS*/
	var multiDispatchedEvents = {
		"pointerout" : true,
		"pointerup" : true
	};

	var Tools = function(){
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
	};

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
		getMergedPrototype : function(prototypeA, prototypeB){
			var result = {};

			for (var k in prototypeA){
				result[k] = prototypeA[k];
			}

			if (prototypeB){
				for (k in prototypeB){
					result[k] = prototypeB[k];
				}
			}

			return result;
		},
		normalizePrototype : function(prototype){
			for (var k in prototype){
				if (typeof prototype[k] == "function" && k != "constructor"){
					prototype[k] = {
						value : prototype[k],
						writable : true,
						configurable : true
					};
				}
			}

			return prototype;
		},
		extendCLASS : function(SuperC, prototype, name){
			prototype = this.normalizePrototype(prototype);

			var _constructor = prototype.constructor;
			delete prototype.constructor;

			var CLASS = function(){
				SuperC.apply(this, arguments);
				_constructor.apply(this, arguments);
			};

			CLASS = eval(["var ", name, "=", CLASS.toString(), ";", name, ";"].join(""));

			var mergedPrototype = this.getMergedPrototype(SuperC.__prototype, prototype);

			Object.defineProperties(CLASS.prototype, mergedPrototype);

			for (var k in mergedPrototype){
				if (mergedPrototype[k].static){
					Object.defineProperty(CLASS, k, mergedPrototype[k]);
				}
			}

			name = name || "inherited from " + SuperC.$name;

			CLASS.__prototype = mergedPrototype;
			CLASS.$name = name;

			return CLASS;
		},
		CLASS : function(prototype, name){
			prototype = this.normalizePrototype(prototype);

			var _constructor = prototype.constructor;
			delete prototype.constructor;

			var CLASS = function(){
				_constructor.apply(this, arguments);
			};

			CLASS = eval(["var ", name, "=", CLASS.toString(), ";", name, ";"].join(""));

			Object.defineProperties(CLASS.prototype, prototype);

			for (var k in prototype){
				if (prototype[k].static){
					Object.defineProperty(CLASS, k, prototype[k]);
				}
			}

			name = name || "Anonymous";

			CLASS.__prototype = prototype;
			CLASS.$name = name;

			return CLASS;
		},
		joinArray : function(target, source){
			return target.concat(source);
		},
		transCoord : function(coord, srcResolution, targetResolution){
			return coord * (targetResolution / srcResolution);
		},
		distancePoints2 : function(x0, y0, x1, y1){
			return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
		},
		html2dom : function(html){
			var temp = document.createElement("div");
			temp.innerHTML = html;
			var result = temp.children[0];
			temp.remove();
			return result;
		},
		dom2html : function(dom){
			var cloned = dom.cloneNode(true);
			var temp = document.createElement("div");
			temp.appendChild(cloned);
			var result = temp.innerHTML;
			temp.remove();
			return result;
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
		add : function(value){
			this.content.push(value);
			this.content.size = this.content.length;
			return this.content[this.content.size - 1];
		},
		get : function(id){
			return this.content[id];
		},
		remove : function(value){
			tools.removeFromArrByValue(this.content, value);
			this.content.size = this.content.length;
		},
		removeByIndex : function(index){
			tools.removeFromArrByIndex(this.content, index);
			this.content.size = this.content.length;
		},
		iterate : function(callback, context){
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
		reverseIterate : function(callback, context){
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
		contains : function(value){
			return this.content.indexOf(value) > -1;
		},
		clear : function(){
			this._content.length = 0;
			this._content.size = 0;
		}
	}, "TokensCollection");

	var TokensList = tools.extendCLASS(TokensCollection, {
		content : {
			get : function(){
				return this._content;
			},
			set : function(content){
				this._content = content || {};
			}
		},
		add : function(name, value){
			this.content[name] = value;
			return this.content[name];
		},
		remove : function(name){
			delete this.content[name];
		},
		iterate : function(callback, context){
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
		contains : function(name){
			return typeof this.content[name] != "undefined";
		},
		clear : function(){
			this.iterate(function(value, name){
				delete this.content[name];
			}, this)
		}
	}, "TokensList");


	/*gradient*/
	var Gradient = tools.CLASS({
		constructor : function(x0, y0, x1, y1, colors, onCreate){
			this.valueOf = this.valueOf.bind(this);
			this.stopColors = colors || [];

			this.x0 = x0;
			this.y0 = y0;
			this.x1 = x1;
			this.y1 = y1;

			this.update();

			if (typeof onCreate == "function"){
				onCreate(this);
			}
		},
		valueOf : {
			value : function(){
				return this.__gradient;
			},
			writable : true
		},
		update : function(){
			this.__gradient = tools.ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
			this.__applyStopColors();
		},
		clean : function(){
			this.stopColors.length = 0;
		},	
		addColorStop : function(offset, color){
			this.stopColors.push([offset, color]);
		},
		x0 : {
			set : function(v){
				this._x0 = v;
			},
			get : function(){
				return this._x0 || 0;
			},
		},
		y0 : {
			set : function(v){
				this._y0 = v;
			},
			get : function(){
				return this._y0 || 0;
			},
		},
		x1 : {
			set : function(v){
				this._x1 = v;
			},
			get : function(){
				return this._x1 || 0;
			},
		},
		y1 : {
			set : function(v){
				this._y1 = v;
			},
			get : function(){
				return this._y1 || 0;
			},
		},
		__applyStopColors : function(){
			for (var a = 0, offset, color, l = this.stopColors.length; a < l; a++){
				offset = this.getOffset(this.stopColors[a][0]);
				color  = this.getColor(this.stopColors[a][1]);
				this.__gradient.addColorStop(offset, color);
			}
		},
		getColor : function(token){
			return token;
		},
		getOffset : function(token){
			return token;
		},
	}, "Pixton_Gradient");


	/**DOMNode
	  */

	var DOMNodeInterface = tools.CLASS((function(){
		var prototype = {};
		var props = new TokensList([
			"classList",
			"attributes",
			"setAttribute",
			"getAttribute",
			"removeAttribute"
		]);

		props.iterate(function(name, index){
			prototype[name] = {
				get : function(){
					return this.dom[name];
				}
			};
		}, this);

		return prototype;

	}()), "Pixton_DOMNodeInterface");

	var DOMNode = tools.extendCLASS(DOMNodeInterface, {
		constructor : function(){
			this.dom = document.createElement(this.type);
		},
		$cache : {
			get : function(){
				this.__$cache = this.__$cache || {
					selectors : {},
				};
				return this.__$cache;
			}
		},
		setDOMElement : function(element){
			this.dom = element;
			this.sync(false);
		},
		sync : function(syncDOM){
			if (syncDOM){
				this.dom.pixtonNode = this;

				if (this.parent){
					this.parent.appendChild(this);
				} 

				this.dom.setAttribute(":id", this.id);
				this.dom.setAttribute("x", this.x);
				this.dom.setAttribute("y", this.y);
				this.dom.setAttribute("scale-x", this.scale.x);
				this.dom.setAttribute("scale-y", this.scale.y);
				this.dom.setAttribute("visible", this.visible);
				this.dom.setAttribute("interactive", this.interactive);
				this.dom.setAttribute("button-mode", this.buttonMode);
				
				if (this.type == "text"){
					this.dom.setAttribute("text", this.text || "");
					this.dom.setAttribute("text-color", this.styles.color);
					this.dom.setAttribute("text-font-family", this.styles.fontFamily);
					this.dom.setAttribute("text-font-size", this.styles.fontSize);
					this.dom.setAttribute("text-align", this.styles.textAlign);
				}

			} else {
				this.x = Number(this.dom.getAttribute("x") || 0);
				this.y = Number(this.dom.getAttribute("y") || 0);
				this.scale.x = Number(this.dom.getAttribute("scale-x") || 1);
				this.scale.y = Number(this.dom.getAttribute("scale-y") || 1);
				this.visible = JSON.parse(this.dom.getAttribute("visible") || true);
				this.interactive = JSON.parse(this.dom.getAttribute("interactive") || false);
				this.buttonMode = JSON.parse(this.dom.getAttribute("buttonMode") || false);
				
				if (this.type == "text"){
					if (this.dom.hasAttribute("text")) this.text = this.dom.getAttribute("text");
					if (this.dom.hasAttribute("text-color")) this.styles.color = this.dom.getAttribute("text-color");
					if (this.dom.hasAttribute("text-font-family")) this.styles.fontFamily = this.dom.getAttribute("text-font-family");
					if (this.dom.hasAttribute("text-font-size")) this.styles.fontSize = this.dom.getAttribute("text-font-size");
					if (this.dom.hasAttribute("text-align")) this.styles.textAlign = this.dom.getAttribute("text-align");
				}

				for (var a = 0, l = this.dom.children.length, newChild; a < l; a++){
					if (this.dom.children[a].getAttribute(":id") == null){
						newChild = Pixton.createElement(this.dom.children[a].tagName.toLowerCase());
						newChild.setDOMElement(this.dom.children[a]);
						this.addChild(newChild);
					}
				}

			}
		},
		fromHTML : function(data){
			if (typeof data == "string"){
				data = tools.html2dom(data);
			}

			this.dom.appendChild(data);
			this.syncBranch(false);

		},
		toHTML : function(){
			return tools.dom2html(this.dom);
		},
		select : function(selector, noCache, iteratee, context){
			var result = null;
			var temp;

			if (typeof noCache == "function"){
				context = iteratee;
				iteratee = noCache;
				noCache = false;
			}

			result = this.$cache.selectors[selector];

			if (noCache === true || !result){
				result = [];
				temp = this.dom.querySelectorAll(selector);

				for (var a = 0, l = temp.length; a < l; a++){
					result[a] = temp[a].pixtonNode;
				}

				if (noCache !== true){
					this.$cache.selectors[selector] = result;
				}
			}

			if (typeof iteratee == "function"){
				for (var a = 0, l = result.length; a < l; a++){
					iteratee.call(context, result[a], a, result);
				}
			}

			return result;

		},
		syncBranch : function(syncDOM){
			this.sync(syncDOM);
			this.children.iterate(function(child){
				child.sync(syncDOM);
				child.syncBranch(syncDOM);
			}, this);
		},
		appendChild : function(child){
			this.dom.appendChild(child.dom);
		}
	}, "Pixton_DOMNode");

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
		set : function(x, y){
			if (typeof y == "undefined") y = x;
			this.x = x;
			this.y = y;
		}
	}, "Point");


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*NODE*/
	var Node = tools.extendCLASS(DOMNode, {
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
		/**DOM-related methos
		  */
		setup : function(data){
			if (data.x) this.position.x = tools.numberize(data.x);
			if (data.y) this.position.y = tools.numberize(data.y);
			if (data.scale) this.position.scale.set(tools.numberize(data.scale) || 1);
			if (data.scaleX) this.position.scale.x = tools.numberize(data.scaleX) || 1;
			if (data.scaleY) this.position.scale.y = tools.numberize(data.scaleY) || 1;
			if (data.id) this.id = data.id;
			if (data.class) this.classes.content = data.class.split(" ");
			if (data.invisible) this.visible = false;

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
		drawDebug : function(context){
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
		checkInteractivity : function(eventType, x, y, canvas, evt, dx, dy, dispatched){
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
		},
		processInteractivity : function(eventType, x, y, canvas, evt, dx, dy){
			var inside = tools.coordsBelognsRect(x, y, dx, dy, this.size.x, this.size.y);
			var result = false;

			this.eventData.originalEvent = evt;
			this.eventData.pointer.x = x;
			this.eventData.pointer.y = y;

			this.eventData.extra.deltaX = x - this.eventData.extra.prevX;
			this.eventData.extra.deltaY = y - this.eventData.extra.prevY;

			this.eventData.extra.prevX = x;
			this.eventData.extra.prevY = y;


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

		},
		runCallback : function(eventName){
			if (this.callbacks.contains(eventName)) {
				this.callbacks.get(eventName)(this.eventData, eventName);
				return true;
			}

			return false;
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
		render : function(parent, context, dx, dy, dsx, dsy){
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
		addChild : function(child){
			if (arguments.length > 1){
				tools.collectionMethod(arguments, this.addChild, this);
				return this;
			}

			child.parent = this;
			this.children.add(child);
			child.childIndex = this.children.content.size - 1;

			this.sync(true);
			child.sync(true);

			return this;
		},
		remove : function(){
			if (this.parent){
				this.parent.removeChild(this);
			}

			return this;
		},
		removeChild : function(child){
			this.children.removeByIndex(child.childIndex);
			this.children.iterate(function(child, index){
				child.childIndex = index;
			});

			return this;
		},
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
		onLoad : function(data){
			this._loaded = true;
		}
	}, "Texture");

	var Sprite = tools.extendCLASS(Node, {
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
		setup : function(data){
			this.super("setup", data);

			if (data.texture) {
				this.texture = data.texture;
			}

		},
		type : {
			get : function(){
				return "sprite";
			},
			configurable : true
		},
		render : function(parent, context, dx, dy, dsx, dsy){
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
	}, "Sprite");

	var Graphics = tools.extendCLASS(Node, {
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

			this.shadowColor = "#000000";
			this.shadowBlur = 0;
			this.shadowOffsetX = 0;
			this.shadowOffsetY = 0;
		},
		setShadow : {
			writable : true,
			configurable : true
		},
		type : {
			get : function(){
				return "graphics";
			},
			configurable : true
		},
		lineTo : function(x, y){
			if (!this.activePath){
				this.moveTo(x, y);
			}

			this.activePath.path.push(x);
			this.activePath.path.push(y);

			return this;
		},
		moveTo : function(x, y){
			this.activePath = this.primitives.add({
				type : "path",
				lineColor : this.lineColor,
				lineAlpha : this.lineAlpha,
				lineWidth : this.lineWidth,
				lineJoin  : this.lineJoin,
				lineCap   : this.lineCap,
				path : [x, y],
				shadowColor : this.shadowColor,
				shadowBlur : this.shadowBlur,
				shadowOffsetX : this.shadowOffsetX,
				shadowOffsetY : this.shadowOffsetY
			});

			return this;
		},
		lineStyle : function(width, color, alpha){
			this.lineWidth = width;
			this.lineAlpha = alpha;
			this.lineColor = color;

			return this;
		},
		shadowStyle : function(color, blur, offsetX, offsetY){
			if (!color){
				this.shadowBlur = 0;
				return;
			}

			this.shadowColor = color || this.shadowColor || "#000000";
			this.shadowBlur = blur || this.shadowBlur || 0;
			this.shadowOffsetX = offsetX || 0;
			this.shadowOffsetY = offsetY || 0;
		},
		drawRect : function(x, y, w, h){
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
				lineWidth : this.lineWidth,
				shadowColor : this.shadowColor,
				shadowBlur : this.shadowBlur,
				shadowOffsetX : this.shadowOffsetX,
				shadowOffsetY : this.shadowOffsetY
			});

			return this;
		},
		drawCircle : function(x, y, radius){
			this.primitives.add({
				type : "circle",
				x : x,
				y : y,
				radius : radius,
				fillColor : this.fillColor,
				fillAlpha : this.fillAlpha,
				lineColor : this.lineColor,
				lineAlpha : this.lineAlpha,
				lineWidth : this.lineWidth,
				shadowColor : this.shadowColor,
				shadowBlur : this.shadowBlur,
				shadowOffsetX : this.shadowOffsetX,
				shadowOffsetY : this.shadowOffsetY
			});

			return this;
		},
		drawArc : function(x, y, radius, startAngle, endAngle){
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
		drawPolygon : function(path){
			this.primitives.add({
				type : "polygon",
				path : path,
				fillColor : this.fillColor,
				fillAlpha : this.fillAlpha,
				lineColor : this.lineColor,
				lineAlpha : this.lineAlpha,
				lineWidth : this.lineWidth,
				shadowColor : this.shadowColor,
				shadowColor : this.shadowColor,
				shadowBlur : this.shadowBlur,
				shadowOffsetX : this.shadowOffsetX,
				shadowOffsetY : this.shadowOffsetY
			})
		},
		closePath : function(){
			this.activePath = null;
		},
		beginFill : function(color, alpha){
			this.fillAlpha = alpha;
			this.fillColor = color;

			return this;
		},	
		endFill : function(){


			return this;
		},
		clear : function(){
			this.primitives.clear();
			this.activePath = null;

			return this;
		},
		renderPolygon : function(data, context, dx, dy, dsx, dsy){
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

			context.strokeStyle = data.lineColor.valueOf();
			context.globalAlpha = data.lineAlpha;
			context.lineWidth = data.lineWidth;
			context.lineJoin = data.lineJoin;
			context.lineCap = data.lineCap;
			context.closePath();

			context.shadowColor = (data.shadowColor || "#000000").valueOf();
			context.shadowBlur = data.shadowBlur || 0;
			context.shadowOffsetX = data.shadowOffsetX || 0;
			context.shadowOffsetY = data.shadowOffsetY || 0;

			context.stroke();

			// if (data.fillColor.stopColors){

			// 	console.log(data.fillColor.valueOf());
			// 	debugger;
			// }

			context.fillStyle = data.fillColor.valueOf();
			context.globalAlpha = data.fillAlpha;
			context.fill();

		},
		renderPath : function(data, context, dx, dy, dsx, dsy){
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

			context.strokeStyle = data.lineColor.valueOf();
			context.globalAlpha = data.lineAlpha;
			context.lineWidth = data.lineWidth;
			context.lineJoin = data.lineJoin;
			context.lineCap = data.lineCap;
			context.shadowColor = (data.shadowColor || "#000000").valueOf();
			context.shadowBlur = data.shadowBlur || 0;
			context.shadowOffsetX = data.shadowOffsetX || 0;
			context.shadowOffsetY = data.shadowOffsetY || 0;
			context.stroke();

			return this;

		},
		render : function(parent, context, dx, dy, dsx, dsy){
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

			// context.shadowColor = "#000000";
			// context.shadowBlur =  0;
			// context.shadowOffsetX = 0;
			// context.shadowOffsetY = 0;


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

						context.shadowColor = (current.shadowColor || "#000000").valueOf();
						context.shadowBlur = current.shadowBlur || 0;
						context.shadowOffsetX = current.shadowOffsetX || 0;
						context.shadowOffsetY = current.shadowOffsetY || 0;

						context.rect((dx + current.x) * dsx, (dy + current.y) * dsy, current.w * dsx, current.h * dsy);
						context.fillStyle = current.fillColor.valueOf();
						context.globalAlpha = current.fillAlpha || 1;
						context.fillRect((dx + current.x) * dsx, (dy + current.y) * dsy, current.w * dsx, current.h * dsy);

						if (current.lineWidth){
							context.lineWidth = current.lineWidth || 0;
							context.globalAlpha = current.lineAlpha;
							context.strokeStyle = current.lineColor.valueOf();
							context.stroke();
						}

						

						if ((dx + current.x) * dsx + current.w * dsx > sw) sw = (dx + current.x) * dsx + current.w * dsx;
						if ((dy + current.y) * dsy + current.h * dsy > sh) sh = (dy + current.y) * dsy + current.h * dsy;

					break;
					case "circle":
						context.shadowColor = (current.shadowColor || "#000000").valueOf();
						context.shadowBlur = current.shadowBlur || 0;
						context.shadowOffsetX = current.shadowOffsetX || 0;
						context.shadowOffsetY = current.shadowOffsetY || 0;

					  	context.save();
						context.beginPath();
						context.translate((dx + current.x) * dsx, (dy + current.y) * dsy);
						context.scale(dsx, dsy);
						context.arc(0, 0, current.radius, 0, 2 * Math.PI, false);
						context.restore();
						context.fillStyle = current.fillColor.valueOf();
						context.globalAlpha = current.fillAlpha || 1;
						context.fill();

						if (current.lineWidth){
							context.lineWidth = current.lineWidth || 0;
							context.globalAlpha = current.lineAlpha || 1;
							context.strokeStyle = current.lineColor.valueOf();
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
						context.shadowColor = (current.shadowColor || "#000000").valueOf();
						context.shadowBlur = current.shadowBlur || 0;
						context.shadowOffsetX = current.shadowOffsetX || 0;
						context.shadowOffsetY = current.shadowOffsetY || 0;

					  	context.save();
						context.beginPath();
						context.translate((dx + current.x) * dsx, (dy + current.y) * dsy);
						context.scale(dsx, dsy);


						context.arc(0, 0, current.radius, current.startAngle, current.endAngle);
						context.restore();
						context.fillStyle = current.fillColor.valueOf();
						context.globalAlpha = current.fillAlpha || 1;
						context.fill();

						if (current.lineWidth){
							context.lineWidth = current.lineWidth || 0;
							context.globalAlpha = current.lineAlpha || 1;
							context.strokeStyle = current.lineColor.valueOf();
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
	}, "Graphics");

	var Text = tools.extendCLASS(Node, {
		constructor : function(text, styles){
			this._text = text;
			this.styles = styles;

			this.classes.add("text-node");

		},
		setup : function(data){
			this.super("setup", data);

			var styles = {};

			if (data.fontsize) styles.fontSize = data.fontsize;
			if (data.fontfamily) styles.fontFamily = data.fontfamily;
			if (data.color) styles.color = data.color;
			if (data.textalign) styles.textAlign = data.textalign;

			if (data.value) this.text = data.value;

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
		render : function(parent, context, dx, dy, dsx, dsy){
			if (!this.visible){
				return;
			}

			dx += this.x;
			dy += this.y;

			dsx *= this.scale.x;
			dsy *= this.scale.y;

			context.font = this.styles.fontSize + " " + this.styles.fontFamily;
			context.fillStyle = this.styles.color.valueOf();
			context.textAlign = this.styles.textAlign;
			context.fillText(this.text, dx * dsx, dy * dsy);
		}
	}, "Text");

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*PIXTON*/
	Pixton = tools.extendCLASS(Node, {
		constructor : function(options){
			this._fps = 0;
			this.options = options = (options || {});
			this.canvas = options.canvas || document.createElement("canvas");
			this.canvas.classList.add("pixton");
			this.xCanvas = document.createElement("canvas");

			this.ctx = this.canvas.getContext("2d");
			this.xCtx = this.xCanvas.getContext("2d");

			this.ctx.imageSmoothingQuality  = this.xCtx.imageSmoothingQuality  = "low";

			this.render = this.render.bind(this);
			this._onUserEvent = this._onUserEvent.bind(this);
			this.setupInteractivity();

			this.Gradient = Gradient;

			// instances[this.id] = this;
			this.__instances = instances;

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
		setupInteractivity : function(element){
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
				window.element = element;
				element.addEventListener(k, this._onUserEvent);
			}

			element.testEvent = new Event("mousemove");
			this.interactionElement = element;

		},
		_onUserEvent : function(evt){
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
					x = tools.transCoord((evt.touches[0].pageX - bounds.left), bounds.width, this.canvas.width) / this.scale.x;
					y = tools.transCoord((evt.touches[0].pageY - bounds.top), bounds.height, this.canvas.height) / this.scale.y;
				} else if (touchCount == 2){

					evt.touch1X = tools.transCoord((evt.touches[0].pageX - bounds.left), bounds.width, this.canvas.width) / this.scale.x;
					evt.touch1Y = tools.transCoord((evt.touches[0].pageY - bounds.top), bounds.height, this.canvas.height) / this.scale.y;

					evt.touch2X = tools.transCoord((evt.touches[1].pageX - bounds.left), bounds.width, this.canvas.width) / this.scale.x;
					evt.touch2Y = tools.transCoord((evt.touches[1].pageY - bounds.top), bounds.height, this.canvas.height) / this.scale.y;

					x = (evt.touch1X + evt.touch2X) / 2;
					y = (evt.touch1Y + evt.touch2Y) / 2;

					eventType = "panning";
				}

				if (touchCount <= 0){
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
				x = tools.transCoord((evt.pageX - bounds.left), bounds.width, this.canvas.width) / this.scale.x;
				y = tools.transCoord((evt.pageY - bounds.top), bounds.height, this.canvas.height) / this.scale.y;
			}

			if (!isTouchEvent && eventType == "pointerover"){
				this.hovered = true;
			}


			this.pointerPosition.x = x;
			this.pointerPosition.y = y;

			if (eventType == "mousewheel"){
				if (typeof evt.detail == "number" && typeof evt.wheelDeltaX == "undefined"){
					evt.wheelDeltaY = -1 * evt.detail;
				}
				evt.preventDefault();
			}


			if (eventType == "pointermove" || eventType == "mousewheel" || eventType == "panning"){

				if (+new Date() - this.prevPointerEventTime < (Pixton.interactionFreq || 10)){
					return;
				} 

				this.prevPointerEventTime = +new Date();

				this.interactionElement.testEvent = evt
			};

			if (this.interactive) this.processInteractivity(eventType, x, y, this.canvas, evt, this.calculated.position.x, this.calculated.position.y);

			this.checkInteractivity(eventType, x, y, this.canvas, evt, 0, 0);
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
		resize : function(w, h){
			var  resolution = Pixton.resolution || this.resolution || window.devicePixelRatio || 1;
			this.scale.set(resolution);
			this.size.x = w;
			this.size.y = h;
			this.canvas.width =  w * resolution;
			this.canvas.height = h * resolution;
			this.xCanvas.width = w * resolution;
			this.xCanvas.height = h * resolution;

			this.ctx.imageSmoothingEnabled = false;
			this.xCtx.imageSmoothingEnabled = false;
		},
		resizeToFitParent : function(){
			var parent = this.canvas.parentNode;

			if (parent){
				this.resize(parent.clientWidth || this.canvas.width || 1, parent.clientHeight || this.canvas.height || 1);
			}

		},
		fps : {
			get : function(){
				return this._fps;
			},
		},
		prevRenderingTime : {
			value : +new Date(),
			configurable : true,
			writable : true
		},
		setSmartRendering : function(frameTime){
			if (frameTime === false){
				this.render = Pixton.prototype.render.bind(this);
			} else {
				this.render = function(absDelta, relDelta){
					if (!this.hovered && (+new Date() - this.prevRenderingTime) < frameTime){
						return;
					}

					Pixton.prototype.render.apply(this, arguments);
				}
			}
		},
		render : function(absDelta, relDelta){
			this.prevRenderingTime = +new Date();
			this.xCtx.clearRect(0, 0, this.xCanvas.width, this.xCanvas.height);
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.prerender(this.ctx);
			//this.ctx.drawImage(this.xCanvas, 0, 0);
		},
		
		prerender : function(context){
			this.children.iterate(function(child, index){
				child.render(this, context, this.position.x, this.position.y, this.scale.x, this.scale.y);
			}, this);
		},
		createElement : {
			value : function(elementType){
				switch(elementType){
					case "text":
						return new Pixton.Text();
					break;
					case "graphics":
						return new Pixton.Graphics();
					break;
					case "sprite":
						return new Pixton.Sprite();
					break;
					case "node":
						return new Pixton.Node();
					break;
					default:
				}
			},
			static : true
		}
	}, "Pixton");

	Pixton.Gradient = Gradient;
	Pixton.tools = new Tools;
	Pixton.Node = Pixton.Container = Node;
	Pixton.Sprite = Sprite;
	Pixton.Point = Point;
	Pixton.Texture = Texture;
	Pixton.Graphics = Graphics;
	Pixton.Text = Text;
	Pixton.TokensCollection = TokensCollection;
	Pixton.TokensList = TokensList;
	Pixton.__instances = instances;

	return Pixton;

});