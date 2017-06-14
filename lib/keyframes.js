import Animator from 'animator.js';
import Color from 'color';
import FrameStyle from './framestyle.js';
import BezierEasing from 'bezier-easing';

/**
  {p:[0~1], style: FrameStyle}
  {p:[0~1], frame: {}, [easing: ...]}
 */
class KeyFrames {
  constructor(frames = []){
    this.frames = [];
    this.updaters = Object.assign({}, KeyFrames.defaultUpdaters);
  }
  addFrames(...frames){
    this.frames.push(...frames);
    this.frames.sort((a,b) => a.p - b.p);
  }
  applyFramesTo(el, duration){
    let style = new FrameStyle(el);
    let frames = this.frames;

    let origin = {};
    let dest = frames.reduce((a, b) => Object.assign(a, b.frame), {});
    for(let key in dest){
      origin[key] = style[key];
    }

    frames.unshift({p:0, frame:origin});
    if(frames[frames.length - 1].p !== 1){
      frames.push({p:1, frame:origin});
    }
    frames.reduce((a, b) => {
      b.frame = Object.assign({}, a.frame, b.frame);
      return b;
    });

    let animators = [];

    //start animation
    frames.reduce((from, to) => {
      let d = (to.p - from.p) * duration;

      let updaters = [];

      for(let key in to.frame){
        let updater = this.updaters[key];

        if(updater){
          updaters.push(updater(style, key, from.frame, to.frame));
        }
      }

      updaters.push(completeUpdater(style));

      if(to.easing) to.easing = BezierEasing(...to.easing);
      animators.push(new Animator(d, queue(updaters), to.easing));

      return to;
    });

    return {
      animate: async function(){
        let continued;
        for(let i = 0; i < animators.length; i++){
          continued = await animators[i].animate(continued);
        }
      }
    };
  }
}

function queue(funcs){
  return function(...args){
    return funcs.map(func => func.apply(this, args));
  }
}

function completeUpdater(style){
  return function(){
    style.update();
  }
}

function valueUpdater(style, key, from, to){
  let v0 = from[key],
      v1 = to[key];

  return function(ep, p){
    let cur = v0 + (v1 - v0) * ep;

    style[key] = cur;
  }
}

function arrayUpdater(style, key, from, to){
  let arr0 = from[key],
      arr1 = to[key];

  return function(ep, p){
    let cur = arr1.map((o, i) => arr0[i] + (o - arr0[i]) * ep);

    style[key] = cur;
  }
}

function colorUpdater(style, key, from, to){
  from = Color(from[key]);
  to = Color(to[key]);

  return function(ep, p){
    let red = from.red() + (to.red() - from.red()) * ep,
        green = from.green() + (to.green() - from.green()) * ep,
        blue = from.blue() + (to.blue() - from.blue()) * ep,
        alpha = from.alpha() + (to.alpha() - from.alpha()) * ep;

    style[key] = Color([red, green, blue, alpha]) + '';
  }
}

KeyFrames.defaultUpdaters = {
  pos: arrayUpdater,
  size: arrayUpdater,
  bgcolor: colorUpdater,
  color: colorUpdater,
  translate: arrayUpdater,
  rotate: valueUpdater,
  scale: (style, key, from, to) => {
    if(!Array.isArray(from[key])) from[key] = [from[key], from[key]];
    if(!Array.isArray(to[key])) to[key] = [to[key], to[key]];

    return arrayUpdater(style, key, from, to);    
  }
}

export default KeyFrames;
