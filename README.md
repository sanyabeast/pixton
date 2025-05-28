# Pixton

A lightweight, flexible 2D rendering engine for JavaScript with interactive capabilities. Pixton provides a simple API for creating and manipulating graphics, sprites, and text in HTML5 Canvas.

## Features

- Object-oriented scene graph architecture
- Interactive elements with event handling (pointer events, drag, etc.)
- Sprite and texture support
- Vector graphics drawing API
- Text rendering with styling options
- DOM-like node manipulation
- Gradient support
- Resolution management

## Usage

```javascript
// Create a new Pixton instance
const pixton = new Pixton();
document.body.appendChild(pixton.canvas);

// Resize to fit window
pixton.resize(window.innerWidth, window.innerHeight);

// Create a sprite
const sprite = new pixton.Sprite(new pixton.Texture("path/to/image.png"));
sprite.scale.set(0.5);
sprite.x = 100;
sprite.y = 100;

// Make it interactive
sprite.interactive = true;
sprite.buttonMode = true;
sprite.callbacks.add("pointertap", function() {
  console.log("Sprite clicked!");
});

// Add to scene
pixton.addChild(sprite);

// Create vector graphics
const graphics = new pixton.Graphics();
graphics.beginFill("#ff0000");
graphics.drawCircle(200, 200, 50);
graphics.endFill();
pixton.addChild(graphics);

// Set up animation loop
const unicycle = new Unicycle();
unicycle.addTask(pixton.render);
unicycle.start();
```

## Dependencies

- [unicycle](https://github.com/sanyabeast/unicycle) - Animation loop manager
- [tweener](https://github.com/sanyabeast/tweener) - Animation tweening library
- [requirejs](https://requirejs.org/) - AMD module loader

## License

Created by Alex Gaivoronski (a.gvrnsk@gmail.com)
