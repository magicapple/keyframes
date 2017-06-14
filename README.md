# Keyframes.js

Keyframe animations implemented by JavaScript.

## Usage

In a browser:

```html
<script src="https://s2.ssl.qhres.com/!019cd0fe/KeyFrames-0.1.0.min.js"></script>
```

[Demo](https://code.h5jun.com/pigu/1/edit?js,output)

```js
let keyframes = new KeyFrames();
keyframes.addFrames(
  {
    p: 0.25,
    frame: {
      translate: [100, 0],
    },
    easing: [0.68, -0.55, 0.265, 1.55]
  },{
    p: 0.5,
    frame: {
      color: '#fff',
      scale: 2.0,
      translate: [100, 100],
    }
  },{
    p: 0.75,
    frame: {
      bgcolor: 'red',
      translate: [0, 100],
      rotate: 170
    }
  }
);

let animation = keyframes.applyFramesTo(block, 5000);

block.addEventListener('click', function(){
  animation.animate();
});
```
