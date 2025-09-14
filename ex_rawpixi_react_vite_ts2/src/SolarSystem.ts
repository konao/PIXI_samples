// *****************************************************
//  太陽系クラス
// *****************************************************
import * as PIXI from 'pixi.js';

class SolarSystem {
    constructor(app: PIXI.Application) {
        this._app = app;
        this._g = new PIXI.Graphics();
        this._app.stage.addChild(this._g);
    }

    public update() {
        const g = this._g;
        const app = this._app;
        const t = performance.now() / 1000;

        // 中心座標
        const cx = app.renderer.width / 2;
        const cy = app.renderer.height / 2;

        // 画面クリア
        g.clear();

        // 太陽
        g.circle(cx, cy, 30).fill(0xffff00)

        // 地球
        const rEarth = 100;
        g.circle(cx, cy, rEarth).stroke(0x0000ff);        
        const xEarth = cx + rEarth * Math.cos(t);
        const yEarth = cy + rEarth * Math.sin(t);
        g.circle(xEarth, yEarth, 10).fill(0x00ffff);

        // 火星
        const rMars = 150;
        g.circle(cx, cy, rMars).stroke(0x0000ff);
        const xMars = cx + rMars * Math.cos(t * 0.8);
        const yMars = cy + rMars * Math.sin(t * 0.8);
        g.circle(xMars, yMars, 8).fill(0xff8800);
    }
}

export default SolarSystem;