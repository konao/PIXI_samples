// *******************************************************
//  画像イメージが動的に変化するスプライト
//
//  update()が呼ばれるたびに画像イメージが更新される
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');
const Wall = require('./wall');

class Ball extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)

        this._vx = 0;   // 移動ベクトル
        this._vy = 0;
        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;        
    }

    setMousePos(mp) {
        let mx = mp.x;
        let my = mp.y;

        let vx = mx - this._x;
        let vy = my - this._y;

        let len = Math.sqrt(vx*vx + vy*vy);
        if (len > 0) {
            // 長さを1にする
            vx /= len;
            vy /= len;
        }

        this._vx = vx;
        this._vy = vy;
    }

    setMouesPressPos(mp) {
        if (mp.which === 1) {
            // 左ボタンクリック
            this._x = mp.x;
            this._y = mp.y;    
        }
        // this.setPos({
        //     x: mp.x,
        //     y: mp.y
        // });
    }

    init(PIXI, container, w, h) {
        this._w = w;
        this._h = h;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        container.addChild(cont);
    }

    update(wall) {
        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            this._g.clear();
            this._g.beginFill(0x500000);
            this._g.lineStyle(2, 0xffff00, 0.7);  // 太さ、色、アルファ(0=透明)
            this._g.drawEllipse(this._x, this._y, 10, 10);  // 中心(cx, cy), 半径(rx, ry)
            this._g.endFill();

            // 移動方向ベクトルを描画
            this._g.lineStyle(1, 0xffffff, 0.5);  // 太さ、色、アルファ(0=透明)
            this._g.moveTo(this._x, this._y);
            this._g.lineTo(this._x+(this._vx*2000), this._y+(this._vy*2000));

            // ボールの進行線と壁の交点を計算
            let p = {x: this._x, y: this._y};
            let v = {x: this._vx, y: this._vy};
            let cpInfo = wall.calcCrossPoint(p, v);
            if (cpInfo !== null) {
                // 交点があれば描画
                let cp = cpInfo.cp;
                this._g.beginFill(0x0000ff);
                this._g.drawEllipse(cp.x, cp.y, 5, 5);
                this._g.endFill();

                // 反射ベクトル
                let rv = cpInfo.refv;
                this._g.lineStyle(1, 0x0ff00, 0.5);
                this._g.moveTo(cp.x, cp.y);
                this._g.lineTo(cp.x+rv.x*2000, cp.y+rv.y*2000);
            }
        }
    }
}

module.exports = {
    Ball
}
