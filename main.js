requirejs.config({
	paths : {
		unicycle : "node_modules/unicycle/unicycle",
		tweener : "node_modules/tweener/tweener"
	}
});

requirejs(["unicycle", "tweener", "Pixton"], function(Unicycle, tweener, Pixton){
	window.tweener = tweener;

	var unicycle = window.unicycle = new Unicycle;
	var pixton   = window.pixton   = new Pixton();

	document.body.appendChild(pixton.canvas);

	pixton.resize(window.innerWidth, window.innerHeight);
	window.addEventListener("resize", function(){
		pixton.resize(window.innerWidth, window.innerHeight);
	});

	unicycle.addTask(pixton.render, "pixton");
	unicycle.start();

	var sprite1 = window.sprite1 = new pixton.Sprite(new pixton.Texture("res/bg_1.jpg"));
	var sprite2 = window.sprite2 = new pixton.Sprite(new pixton.Texture("res/bg_2.jpg"))

	//pixton.root.addChild(sprite1);
	
	var container = window.container = new pixton.Node();
	//container.addChild(sprite2);

	pixton.root.addChild(container);

	var graphics = window.graphics = new pixton.Graphics();
	container.addChild(graphics);

	graphics.beginFill("#1100ff", 0.5);
	graphics.lineStyle(2, "#110000", 1);
	graphics.drawRect(400, 400, 300, 300);

	graphics.beginFill("#110022", 0.5);
	graphics.lineStyle(2, "#115500", 1);
	graphics.drawRect(100, 100, 200, 200);

	graphics.beginFill("#114022", 0.5);
	graphics.lineStyle(2, "#555500", 1);
	graphics.drawCircle(150, 150, 100);

	graphics.lineTo(200, 200);
	graphics.lineTo(300, 350);
	graphics.lineTo(450, 600);
	graphics.lineTo(200, 250);


}.bind(window));