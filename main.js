requirejs.config({
	paths : {
		unicycle : "node_modules/unicycle/unicycle",
		tweener : "node_modules/tweener/tweener"
	}
});

requirejs(["demo"], function(Demo){
	window.demo = new Demo();
});