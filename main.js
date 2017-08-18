requirejs.config({
	paths : {
		unicycle : "node_modules/unicycle/unicycle"
	}
});

requirejs(["unicycle", "Pixton"], function(Unicycle, Pixton){
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

	pixton.root.addChild(sprite1);
	pixton.root.addChild(sprite2);

}.bind(window));