// *******************************************************
//  ボール発射装置
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');
const Wall = require('./wall');
const { Text } = require('./text'); // [FOOT]

class Ejector extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)

        // ボール発射方向
        this._v = {
            x: 0.0,
            y: 0.0
        };

        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;        
    }

    setMousePos(mp) {
        let v = U.vecSub(mp, this._p);
        let nv = U.vecNormalize(v);
        this._v = nv;
    }

    setMouesPressPos(mp) {
        this._p = mp;
        // ここでBaseSpr._update()を呼ばない
        // （スプライトオブジェクト自身は移動させない）
    }

    getVec() {
        return this._v;
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

        // [FOOT]
        this._msg = new Text();
        this._msg.initSprite(PIXI, container)
            .setText('msg')
            .setPos(10, 800)
            .setFontSize(20)
            .setColor('cyan');
    }

    update(wallList) {
        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            this._g.clear();
            this._g.beginFill(0x500000);
            this._g.lineStyle(2, 0xffff00, 0.7);  // 太さ、色、アルファ(0=透明)
            this._g.drawEllipse(this._p.x, this._p.y, 10, 10);  // 中心(cx, cy), 半径(rx, ry)
            this._g.endFill();

            // 移動方向ベクトルを描画
            this._g.lineStyle(1, 0xffffff, 0.5);  // 太さ、色、アルファ(0=透明)
            this._g.moveTo(this._p.x, this._p.y);
            this._g.lineTo(this._p.x+(this._v.x*2000), this._p.y+(this._v.y*2000));

            let closestCpInfo = null;
            wallList.forEach(wall => {
                // ボールの進行線と壁の交点を計算
                let cpInfo = wall.calcCrossPoint(this._p, this._v);

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
                this._g.lineStyle(1, 0x00ff00, 0.5);
                this._g.moveTo(cp.x, cp.y);
                this._g.lineTo(cp.x+rv.x*2000, cp.y+rv.y*2000);
            }

            // ******* 垂線の足計算のテスト ********
            // [FOOT]
            // let pX = {x: 100, y: 300};
            // let pY = {x: 200, y: 600};
            
            // this._g.lineStyle(1, 0xffffff, 1);
            // this._g.moveTo(pX.x, pX.y);
            // this._g.lineTo(pY.x, pY.y);

            // let foot = U.calcFoot(this._p, pX, pY);
            // if (foot === null) {
            //     this._msg.setText('something wrong');
            // } else {
            //     let msg = '';
            //     if (foot.dist === null) {
            //         msg = `p is not on pX->pY (a=${foot.a}, b=${foot.b})`;
            //     } else {
            //         msg = `dist=${foot.dist}, pF=(${foot.pF.x}, ${foot.pF.y}), a=${foot.a}, b=${foot.b}`;

            //         this._g.lineStyle(1, 0x00ffff, 1);
            //         this._g.moveTo(this._p.x, this._p.y);
            //         this._g.lineTo(foot.pF.x, foot.pF.y);
            //     }
            //     this._msg.setText(msg);
            // }
        }
    }
}

module.exports = {
    Ejector
}
