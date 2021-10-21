// *************************************************
//  スプライトベースクラス
// *************************************************
const U = require('./utils');

class BaseSpr {
    constructor() {
        this._spr = null;

        // 位置 
        this._p = {
            x: 0.0,
            y: 0.0
        };

        // 拡大倍率
        this._scale = {
            x: 1.0,
            y: 1.0
        };

        // 回転角（度）
        this._degRot = 0.0;

        // zバッファインデックス
        this._zIndex = 0.0; // 値が大きいほど全面に出る

        // コンテナオブジェクトへの参照
        this._container = null;
    }

    getPos() {
        return this._p;
    }

    setPos(p) {
        this._p = p;

        this._update();
    }

    getScale() {
        return this._scale;
    }

    setScale(scale) {
        this._scale = scale;

        this._update();
    }

    getRot() {
        return this._degRot;
    }

    setRot(degRot) {
        this._degRot = degRot;

        this._update();
    }

    getZIndex() {
        return this._zIndex;
    }

    setZIndex(zIndex) {
        this._zIndex = zIndex;

        this._update();
    }

    // 初期化
    init(PIXI, container) {
    }

    _update() {
        // このオブジェクトの状態をPIXIスプライトオブジェクトに反映させる
        if (this._spr) {
            this._spr = this._p;
            this._spr.rotation = U.d2r(this._degRot);
            this._spr.scale = this._scale;
            this._spr.zIndex = this._zIndex;
        }
    }
}

module.exports = {
    BaseSpr
}
