// *************************************************
//  スプライトベースクラス
// *************************************************
const U = require('./utils');

class BaseSpr {
    constructor() {
        this._spr = null;

        // 位置        
        this._x = 0.0; 
        this._y = 0.0;

        // 拡大倍率
        this._sx = 1.0;
        this._sy = 1.0;

        // 回転角（度）
        this._degRot = 0.0;

        // zバッファインデックス
        this._zIndex = 0.0; // 値が大きいほど全面に出る

        // コンテナオブジェクトへの参照
        this._container = null;
    }

    getPos() {
        return {
            x: this._x,
            y: this._y
        };
    }

    setPos({x, y}) {
        this._x = x;
        this._y = y;

        this._update();
    }

    getScale() {
        return {
            sx: this._sx,
            sy: this._sy
        };
    }

    setScale({sx, sy}) {
        this._sx = sx;
        this._sy = sy;

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
        if (this._spr) {
            this._spr.x = this._x;
            this._spr.y = this._y;
            this._spr.rotation = U.d2r(this._degRot);
            this._spr.scale.x = this._sx;
            this._spr.scale.y = this._sy;
            this._spr.zIndex = this._zIndex;
        }
    }
}

module.exports = {
    BaseSpr
}
