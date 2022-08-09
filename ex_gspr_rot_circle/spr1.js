// *******************************************************
//  回転する円のスプライト
//
//  ★★★の値を変えると形がいろいろ変化する
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');

class Spr1 extends BaseSpr {
    constructor() {
        super();

        this._count = 0;    // アニメーション用カウンタ
    }

    init(PIXI, container, w, h) {
        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // オブジェクトのzIndex値でのソートをon

        let g = new PIXI.Graphics();

        const r = (w > h) ? h/2 : w/2;

        // 内側の円と外側の円を別々に回転させる
        const im = 3;   // ★★★ 内側の円の回転倍率
        const om = 7;   // ★★★ 外側の円の回転倍率
        const ir = r*0.6;   // 内側の円の半径
        const or = r*0.4;   // 外側の円の半径

        let d = 0.0;
        let first = true;
        g.lineStyle(1, 0x00ff00, 0.7);  // 太さ、色、アルファ(0=透明)
        while (d<=360) {
            let x = ir*Math.cos(U.d2r(d*im)) + or*Math.cos(U.d2r(d*om));
            let y = ir*Math.sin(U.d2r(d*im)) + or*Math.sin(U.d2r(d*om));
            if (first) {
                g.moveTo(x, y);
                first = false;
            } else {
                g.lineTo(x, y);
            }
            d += 1;
        }
        cont.addChild(g);
        this._spr = cont;

        this.setPos({x: w/2, y: h/2});
    
        container.addChild(cont);
    }

    update() {
        this._count++;
        if (this._count > 720) {
            this._count = 0;
        }

        // 回転させる
        this.setRot(this._count * 0.5);
    }
}

module.exports = {
    Spr1
}
