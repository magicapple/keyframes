import Color from 'color';

const _target = Symbol('target');
const _style  = Symbol('style');
const _dirty  = Symbol('dirty');

export default class FrameStyle{
  constructor(el){
    this[_target] = el;
    this[_style] = Object.assign({}, window.getComputedStyle(el));
    this[_dirty] = new Set();
  }
  
  dirty(...keys){
    keys.forEach(key => this[_dirty].add(key));
  }
  update(){
    let el = this[_target],
        style = this[_style];

    for(let key of this[_dirty]){
      el.style[key] = style[key];
    }

    this[_dirty].clear();
  }

  get pos(){
    return [parseInt(this[_style].top), parseInt(this[_style].left)];
  }
  set pos(xy){
    this.dirty('left', 'top');
    this[_style].left = parseInt(xy[0]) + 'px';
    this[_style].top  = parseInt(xy[1]) + 'px';
  }

  get size(){
    return [parseInt(this[_style].width), parseInt(this[_style].height)];
  }
  set size(wh){
    this.dirty('width', 'height');
    this[_style].width = parseInt(wh[0]) + 'px';
    this[_style].height  = parseInt(wh[1]) + 'px';    
  }

  get color(){
    let color = Color(this[_style].color);
    return [color.red(), color.green(), color.blue(), color.alpha()];
  }
  set color(color){
    this.dirty('color');
    this[_style].color = Color(color) + '';
  }

  get bgcolor(){
    let color = Color(this[_style].backgroundColor);
    return [color.red(), color.green(), color.blue(), color.alpha()];
  }
  set bgcolor(color){
    this.dirty('backgroundColor');
    this[_style].backgroundColor = Color(color) + '';
  }

  get translate(){
    let style = this[_style];

    let translate = style.transform.match(/translate\w*\((.*?)\)/);
    if(translate){
      return translate[1].split(',').map(s => parseInt(s));
    }else{
      return [0, 0, 0];
    }
  }
  set translate(values){
    this.dirty('transform');
    let style = this[_style];

    let translate = style.transform.match(/translate\w*\(.*?\)/g),
        scale = style.transform.match(/scale\(.*?\)/g),
        rotate = style.transform.match(/rotate\(.*?\)/g);   

    let [x, y, z] = values;
    translate = `translate3d(${x|0}px, ${y|0}px, ${z|0}px)`; 

    style.transform = [translate, scale, rotate].filter(o => o).join(' ');
  }

  get rotate(){
    let style = this[_style];

    let rotate = style.transform.match(/rotate\((.*?)\)/);
    if(rotate){
      return parseFloat(rotate[1]);
    }else{
      return 0;
    }
  }
  set rotate(value){
    this.dirty('transform');
    let style = this[_style];

    let translate = style.transform.match(/translate\w*\(.*?\)/g),
        scale = style.transform.match(/scale\(.*?\)/g),
        rotate = style.transform.match(/rotate\(.*?\)/g);   

    rotate = `rotate(${value}deg)`; 

    style.transform = [translate, scale, rotate].filter(o => o).join(' ');    
  }

  get scale(){
    let style = this[_style];

    let scale = style.transform.match(/scale\((.*?)\)/);
    if(scale){
      return scale[1].split(',').map(s => parseInt(s));
    }else{
      return [1, 1];
    }
  }
  set scale(values){
    this.dirty('transform');
    let style = this[_style];

    let translate = style.transform.match(/translate\w*\(.*?\)/g),
        scale = style.transform.match(/scale\(.*?\)/g),
        rotate = style.transform.match(/rotate\(.*?\)/g);   

    let [x, y] = values;
    if(y == null) y = x;

    scale = `scale(${x}, ${y})`; 

    style.transform = [translate, scale, rotate].filter(o => o).join(' ');    
  }
}
