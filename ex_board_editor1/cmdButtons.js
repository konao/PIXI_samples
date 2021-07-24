
const NEW = "New";
const SELECT = "Select";
const MOVE = "Move";

class CmdButtons {
    constructor() {
        this._sprs = {};
    }

    initSprite(PIXI, container) {
        this._sprs = {};

        // New Button
        let sprNew = new PIXI.Sprite(PIXI.Texture.from(NEW));
        sprNew.visible = true;
        sprNew.x = 100;
        sprNew.y = 10;
        container.addChild(sprNew);

        // Select Button
        let sprSelect = new PIXI.Sprite(PIXI.Texture.from(SELECT));
        sprSelect.visible = true;
        sprSelect.x = 200;
        sprSelect.y = 10;
        container.addChild(sprSelect);

        // Move Button
        let sprMove = new PIXI.Sprite(PIXI.Texture.from(MOVE));
        sprMove.visible = true;
        sprMove.x = 300;
        sprMove.y = 10;
        container.addChild(sprMove);

        this._sprs = {
            NEW: sprNew,
            SELECT: sprSelect,
            MOVE: sprMove
        };
    }
}

module.exports = {
    CmdButtons
}