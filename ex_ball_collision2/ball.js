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

    setPosDirect(mp) {
        this._x = mp.x;
        this._y = mp.y;    
    }

    getVec() {
        return {
            x: this._vx,
            y: this._vy
        };
    }

    // @param v [i] 方向ベクトル
    setVec(v) {
        this._vx = v.x;
        this._vy = v.y;
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
        // ボールの進行線と壁の交点を計算
        let p = {x: this._x, y: this._y};
        let v = {x: this._vx, y: this._vy};
        let cpInfo = wall.calcCrossPoint(p, v);
        if (cpInfo !== null) {
            let vLen = U.getVecLen(v);
            const ballRadius = 5;
            if (cpInfo.dist <= ballRadius) {
                // 衝突した
                // 方向を変える
                let rv = cpInfo.refv;
                // let len_rv = U.getVecLen(rv);
                // console.log(`len(rv)=${len_rv}`);
                this._vx = rv.x;
                this._vy = rv.y;

                this._x += this._vx;
                this._y += this._vy;    
            } 
            else if (vLen+ballRadius >= cpInfo.dist) {
                // ボールを進めた先が壁を超えている
                let rv = cpInfo.refv;
                // let len_rv = U.getVecLen(rv);
                // console.log(`len(rv)=${len_rv}`);
                this._vx = rv.x;
                this._vy = rv.y;
                
                // ボールの位置を補正
                this._x += this._vx;
                this._y += this._vy;    
            }
        } else {
            this._x += this._vx;
            this._y += this._vy;    
        }

        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            this._g.clear();
            this._g.beginFill(0x00ffff);
            this._g.lineStyle(1, 0xffffff, 0.7);  // 太さ、色、アルファ(0=透明)
            this._g.drawEllipse(this._x, this._y, 5, 5);  // 中心(cx, cy), 半径(rx, ry)
            this._g.endFill();
        }
    }
}

module.exports = {
    Ball
}
