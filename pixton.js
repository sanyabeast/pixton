"use strict";
define(function(){
	/*TOOlS*/
	var Tools = function(){};
	Tools.prototype = {
		genID : function(prefix){
			return (prefix ? prefix + "-" : "") + Math.random().toString(32).substring(3, 10); 
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
		}
	});


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*NODE*/
	var Node = tools.CLASS({
		constructor : function(){
			this.children = [];
			this.position = new Point();
		},
		tools : {
			value : new Tools
		},
		id : {
			get : function(){
				if (!this._id) this._id = this.tools.genID("node");
				return this._id;
			}
		},
		x : {
			get : function(){ return this.position.x },
			set : function(x){ this.position.x = x; },
		},
		y : {
			get : function(){ return this.position.y },
			set : function(y){ this.position.y = y; },
		},
		render : {
			value : function(parent, context){
				for (var a = 0; a < this.children.size; a++){
					this.children[a].render(this, context);
				}
			},
			writable : true,
			configurable : true
		},
		addChild : {
			value : function(child){
				this.children.push(child);
				this.children.size = this.children.length;
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
				context.drawImage(this.texture.image, this.x, this.y);
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

	Pixton.prototype = {
		tools : new Tools,
		Node : Node,
		Sprite : Sprite,
		Point : Point,
		Texture : Texture,
		resize : function(w, h){
			this.size.x = w;
			this.size.y = h;
			this.canvas.width = this.xCanvas.width = w;
			this.canvas.height = this.xCanvas.height = h;
		},	
		render : function(){
			this.prerender();
			this.ctx.drawImage(this.xCanvas, 0, 0);
		},
		prerender : function(){
			this.xCtx.clearRect(0, 0, this.size.x, this.size.y);
			this.root.render(this.root, this.xCtx);
		}
	};

	return Pixton;

});