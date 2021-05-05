// *******************************************************
//  ボール発射装置
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');
const Wall = require('./wall');

class Ejector extends BaseSpr {
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

        let v = {
            x: mx - this._x,
            y: my - this._y
        };
        let nv = U.vecNormalize(v);

        this._vx = nv.x;
        this._vy = nv.y;
    }

    setMouesPressPos(mp) {
        this._x = mp.x;
        this._y = mp.y;    
        // this.setPos({
        //     x: mp.x,
        //     y: mp.y
        // });
    }

    getVec() {
        return {
            x: this._vx,
            y: this._vy
        };
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

    update(wallList) {
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

            let closestCpInfo = null;
            wallList.forEach(wall => {
                // ボールの進行線と壁の交点を計算
                let p = {x: this._x, y: this._y};
                let v = {x: this._vx, y: this._vy};
                let cpInfo = wall.calcCrossPoint(p, v);

                if (cpInfo) {
                    // pに一番近い交差点をclosestCpInfoにする
                    if (closestCpInfo === null) {
                        closestCpInfo = cpInfo;
                    } else if (cpInfo.dist < closestCpInfo.dist) {
                        closestCpInfo = cpInfo;
                    }
                }
            });

            if (closestCpInfo !== null) {
                // 交点があれば描画
                let cp = closestCpInfo.cp;
                this._g.beginFill(0x0000ff);
                this._g.drawEllipse(cp.x, cp.y, 5, 5);
                this._g.endFill();

                // 反射ベクトル
                let rv = closestCpInfo.refv;
                this._g.lineStyle(1, 0x0ff00, 0.5);
                this._g.moveTo(cp.x, cp.y);
                this._g.lineTo(cp.x+rv.x*2000, cp.y+rv.y*2000);
            }
        }
    }
}

module.exports = {
    Ejector
}
