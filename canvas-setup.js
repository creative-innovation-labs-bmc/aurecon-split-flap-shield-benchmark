(() => {
const cfg=window.RENDERER_CONFIG;
const c=document.createElement('canvas');
c.className='wall-canvas';
c.width=cfg.internal[0];
c.height=cfg.internal[1];
document.getElementById('renderer-root').appendChild(c);
const x=c.getContext('2d');
x.setTransform(c.width/3840,0,0,c.width/3840,0,0);
window.CanvasBench={canvas:c,ctx:x};
})();