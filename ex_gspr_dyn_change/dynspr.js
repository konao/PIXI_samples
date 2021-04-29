// *******************************************************
//  画像イメージが動的に変化するスプライト
//
//  update()が呼ばれるたびに画像イメージが更新される
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');

class DynSpr extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)
        this._mp = {x: 0, y: 0};    // マウスの位置
        this._count = 0;    // アニメーション用カウンタ
    }

    setMousePos(mp) {
        this._mp = mp;
    }

    init(PIXI, container, w, h) {
        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        this.setPos({x: w/2, y: h/2});
    
        container.addChild(cont);
    }

    update() {
        this._count++;
        if (this._count > 255) {
            this._count = 0;
        }

        if (this._g) {
            let color = (255 - this._count) * 0x100;    // 色
            let r = (this._count / 255) * 300;  // 半径

            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            this._g.clear();    // 描画内容をリセット（これがないと描画内容が更新されない）
            this._g.lineStyle(1, color, 0.7);  // 太さ、色、アルファ(0=透明)
            this._g.drawEllipse(0, 0, r, r);  // 中心(cx, cy), 半径(rx, ry)
        }

        this.setPos({
            x: this._mp.x,
            y: this._mp.y
        });
    }
}

module.exports = {
    DynSpr
}
