const PIXI = require('pixi.js');
const { Wall } = require('./wall');
const { Spline } = require('./spline');
const { NEW, SELECT, MOVE } = require('./cmdButtons');

class MainPanel {
    constructor(pixiApp, g_w, g_h) {
        this._pixiApp = pixiApp;
        this._g_w = g_w;
        this._g_h = g_h;
        this._g = null;
        this._pts = [];
        this._wallList = [];
    }

    initSprite(PIXI, container) {
        this._g = new PIXI.Graphics();

        container.addChild(this._g);
    }

    clear() {
        this._pts = [];
    }

    onMouseDown(p, mode) {
        if (mode === NEW) {
            this._pts.push(p);
        }
    }

    onMouseUp(p, mode) {

    }

    onMouseMove(p, mode) {

    }

    onMouseWheel(d, mode) {

    }

    onKeyDown(key, mode) {
        switch (key) {
            case 32:    // space
            {
                console.log('Space');
                break;
            }
            case 27:    // Esc
            {
                console.log('Esc');
                break;
            }
            case 46:    // Del
            {
                console.log('Del');
                break;
            }
            case 13:    // Ret
            {
                console.log('Ret');

                // this._ptsに溜まっている点のリストを使って
                // スプラインオブジェクトを生成．
                // さらに補間点を求めてthis._wallistに追加

                if (this._pts.length > 0) {
                    let sp = new Spline();
                    sp.clear();

                    for (let p of this._pts) {
                        sp.addPoint(p.x, p.y);
                    }

                    sp.genSpline(); // スプライン生成

                    let ipts = [];
                    for (let t=0.0; t<1.0; t+=0.02) {
                        let ipt = sp.interp(t);
                        ipts.push({
                            x: ipt.x,
                            y: ipt.y
                        });
                    }
                    let ipt = sp.interp(1.0);
                    ipts.push({
                        x: ipt.x,
                        y: ipt.y
                    });

                    let block = new Wall();
                    block.setWallPoints(ipts);
                    block.init(PIXI, this._pixiApp.stage, this._g_w, this._g_h);
                    this._wallList.push(block);
                }

                this._pts = []; // クリア
                break;
            }
        }    
    }

    onResize(size) {

    }

    update() {
        if (this._g) {
            this._g.clear();

            // this._g.beginFill(0x00ffff);
            // this._g.drawEllipse(300, 300, 280, 280);    // 中心(cx, cy)、半径(sx, sy)
            // this._g.endFill();

            for (let pt of this._pts) {
                this._g.beginFill(0x00ffff);
                this._g.drawEllipse(pt.x, pt.y, 3, 3);
                this._g.endFill();
            }

            // 壁を描く
            this._wallList.forEach(wall => {
                wall.update();
            });
        }
    }
}

module.exports = {
    MainPanel
}