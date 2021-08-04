
// btnId
const NEW = 1;
const SELECT = 2;
const MOVE = 3;

// ボタンId --> ボタン名（スプライトの名前にも使われる）
const getButtonName = (btnId) => {
    switch (btnId) {
        case NEW:
            return "New";
        case SELECT:
            return "Select";
        case MOVE:
            return "Move";
        default:
            return "";
    }
}

class CmdButtons {
    constructor() {
        this._sprs = {};
    }

    initSprite(PIXI, container) {
        this._sprs = {};

        // New Button
        let sprNewN = new PIXI.Sprite(PIXI.Texture.from("New_N"));
        sprNewN.visible = true;
        sprNewN.x = 100;
        sprNewN.y = 10;
        container.addChild(sprNewN);

        let sprNewP = new PIXI.Sprite(PIXI.Texture.from("New_P"));
        sprNewP.visible = false;
        sprNewP.x = 100;
        sprNewP.y = 10;
        container.addChild(sprNewP);

        // Select Button
        let sprSelectN = new PIXI.Sprite(PIXI.Texture.from("Select_N"));
        sprSelectN.visible = true;
        sprSelectN.x = 200;
        sprSelectN.y = 10;
        container.addChild(sprSelectN);

        let sprSelectP = new PIXI.Sprite(PIXI.Texture.from("Select_P"));
        sprSelectP.visible = false;
        sprSelectP.x = 200;
        sprSelectP.y = 10;
        container.addChild(sprSelectP);

        // Move Button
        let sprMoveN = new PIXI.Sprite(PIXI.Texture.from("Move_N"));
        sprMoveN.visible = true;
        sprMoveN.x = 300;
        sprMoveN.y = 10;
        container.addChild(sprMoveN);

        let sprMoveP = new PIXI.Sprite(PIXI.Texture.from("Move_P"));
        sprMoveP.visible = false;
        sprMoveP.x = 300;
        sprMoveP.y = 10;
        container.addChild(sprMoveP);

        this._sprs[getButtonName(NEW)] = {
            id: NEW,
            sprN: sprNewN,
            sprP: sprNewP
        };
        this._sprs[getButtonName(SELECT)] = {
            id: SELECT,
            sprN: sprSelectN,
            sprP: sprSelectP
        };
        this._sprs[getButtonName(MOVE)] = {
            id: MOVE,
            sprN: sprMoveN,
            sprP: sprMoveP
        };
    }

    // @param p {i} ヒットテスト対象
    //
    // @return ボタンID
    // 何もヒットしなかった場合は0が返る
    hitTest(p) {
        console.log(`(x, y)=(${p.x}, ${p.y})`);
        for (let key of Object.keys(this._sprs)) {
            let e = this._sprs[key];
            if ((p.x > e.sprN.x) && (p.x < (e.sprN.x + e.sprN.width)) &&
                (p.y > e.sprN.y) && (p.y < (e.sprN.y + e.sprN.height))) {
                    return e.id;
                }
        }
        return 0;
    }

    // ボタンを押した/離した
    //
    // @return 押したボタンの状態(true=押している, false=押していない)
    press(btnId, bPress) {
        let btnName = getButtonName(btnId);
        if (btnName.length > 0) {
            if (bPress) {
                // 押した状態にする
                this._sprs[btnName].sprN.visible = false;
                this._sprs[btnName].sprP.visible = true;
            } else {
                // 離した状態にする
                this._sprs[btnName].sprN.visible = true;
                this._sprs[btnName].sprP.visible = false;
            }
        }
    }

    // ボタンが押されているかを返す
    isPressed(btnId) {
        let btnName = getButtonName(btnId);
        if (btnName.length > 0) {
            if (this._sprs[btnName].sprP.visible === true) {
                // 押している
                return true;
            } else {
                // 押されていない
                return false;
            }
        }
    }
}

module.exports = {
    CmdButtons
}