// **********************************************
//  テキストスプライト
// **********************************************

const { BaseSpr } = require('./baseSpr');

class Text extends BaseSpr {
    constructor() {
        super();
    }

    initSprite(PIXI, container) {
        let spr = new PIXI.Text(
            '', 
            {
                fontSize: 16,
                fill: 0xffffff
            }
        );

        spr.visible = true;

        container.addChild(spr);
        this._spr = spr;

        return this;
    }

    setText(text) {
        if (this._spr) {
            this._spr.text = text;
        }

        return this;
    }

    setPos(x, y) {
        if (this._spr) {
            this._spr.x = x;
            this._spr.y = y;
        }

        return this;
    }

    setFontSize(size) {
        if (this._spr) {
            this._spr.style.fontSize = size;
        }

        return this;
    }

    setColor(color) {
        if (this._spr) {
            this._spr.style.fill = color;
        }

        return this;
    }

    setVisible(bVisible) {
        if (this._spr) {
            this._spr.visible = bVisible;
        }

        return this;
    }
}

module.exports = {
    Text
}