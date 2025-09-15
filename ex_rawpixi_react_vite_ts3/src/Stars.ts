// *****************************************************
//  星
// *****************************************************
import * as PIXI from 'pixi.js';

class Star {
    constructor(app: PIXI.Application) {
        this._app = app;
        this._g = new PIXI.Graphics();
        this._app.stage.addChild(this._g);

        this._cx = 0;
        this._cy = 0;
        this._size = 1;
        this._speed = 1;
        this._angle = 0;
        this._x = new Array<number>(10).fill(0);
        this._y = new Array<number>(10).fill(0);
        this._color = 0xffffff;

        this.init();
    }

    public init() {
        // 初期化
        const app = this._app;
        this._cx = Math.random() * app.renderer.width;
        this._cy = Math.random() * app.renderer.height;
        this._size = 10 + Math.random() * 20;
        this._speed = 0.2 + Math.random() * 1.8;
        this._color = + Math.floor(Math.random() * 0xffffff);

        // 星の頂点座標を計算
        for (let i=0; i<5; i++) {
            this._x[i*2] = this._size * Math.cos((i*360/5) * Math.PI / 180);
            this._y[i*2] = this._size * Math.sin((i*360/5) * Math.PI / 180);
            this._x[i*2+1] = this._size/2 * Math.cos((i*360/5+360/10) * Math.PI / 180);
            this._y[i*2+1] = this._size/2 * Math.sin((i*360/5+360/10) * Math.PI / 180);
        }
    }

    public update() {
        const g = this._g;
        // const t = performance.now() / 1000;
        this._angle += 0.05 * this._speed;

        // 星を描画
        g.clear();
        for (let i=0; i<10; i++) {
            const j=(i+1)%10;
            const angle = this._angle;
            const x1 = this._cx + this._x[i] * Math.cos(angle) - this._y[i] * Math.sin(angle);
            const y1 = this._cy + this._x[i] * Math.sin(angle) + this._y[i] * Math.cos(angle);
            const x2 = this._cx + this._x[j] * Math.cos(angle) - this._y[j] * Math.sin(angle);
            const y2 = this._cy + this._x[j] * Math.sin(angle) + this._y[j] * Math.cos(angle);
            g.moveTo(x1, y1).lineTo(x2, y2).lineStyle(1).stroke(this._color);  // stroke()を最後に書くこと（で線が表示される）
        }
    }
}

class Stars {
    constructor(app: PIXI.Application, numStars: number = 20) {
        this._stars = [];

        for (let i=0; i<numStars; i++) {
            this._stars.push(new Star(app));
        }
    }

    public update() {
        this._stars.forEach(star => {
            star.update();
        });
    }
}

export default Stars;