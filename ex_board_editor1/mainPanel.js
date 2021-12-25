const PIXI = require('pixi.js');
const { Wall, Walls } = require('./wall');
const { NEW, SELECT, MOVE } = require('./cmdButtons');

class MainPanel {
    constructor(pixiApp, g_w, g_h) {
        this._pixiApp = pixiApp;
        this._g_w = g_w;
        this._g_h = g_h;
        this._g = null;
        this._pts = [];
        this._walls = new Walls();
        this._nearestPivot = null;
        this._bPivotDragging = false;   // ピボット点ドラッグ中フラグ
    }

    initSprite(PIXI, container) {
        this._g = new PIXI.Graphics();

        container.addChild(this._g);
    }

    clear() {
        this._pts = [];
    }

    onMouseDown(p, mode) {
        if (mode === NEW) {
            this._pts.push(p);
        }
        else if (mode === SELECT) {
            if ((this._nearestPivot !== null) && (this._bPivotDragging === false)) {
                this._bPivotDragging = true;    // ピボット点ドラッグ中
            }
        }
    }

    onMouseUp(p, mode) {
        if (mode === SELECT) {
            if (this._bPivotDragging) {
                this._bPivotDragging = false;
            }
        }
    }

    onMouseMove(p, mode) {
        if (mode === SELECT) {
            this._nearestPivot = this._walls.getNearestPivot(p);

            if (this._nearestPivot !== null && this._bPivotDragging) {
                let idxWall = this._nearestPivot.idxWall;
                let idx = this._nearestPivot.idx;

                this._walls.setPivotPoint(idxWall, idx, p); // ピボット点を移動させる
            }
        }
    }

    onMouseWheel(d, mode) {

    }

    onKeyDown(key, mode) {
        switch (key) {
            case 32:    // space
            {
                console.log('Space');
                break;
            }
            case 27:    // Esc
            {
                console.log('Esc');
                break;
            }
            case 46:    // Del
            {
                console.log('Del');
                break;
            }
            case 13:    // Ret
            {
                console.log('Ret');

                // this._ptsに溜まっている点のリストを使って新しい壁を生成
                if (this._pts.length > 0) {
                    let wall = new Wall();
                    wall.init(PIXI, this._pixiApp.stage, this._g_w, this._g_h);
                    wall.setPivotPoints(this._pts); // ピボット点をセット
                    wall.genWallPoints();   // 壁のスプライン曲線を生成

                    this._walls.addWall(wall);  // 壁リストに追加
                }

                this._pts = []; // クリア
                break;
            }
        }    
    }

    onResize(size) {

    }

    update(mode) {
        if (this._g) {
            this._g.clear();

            // マウスでクリックした点を表示
            for (let pt of this._pts) {
                this._g.beginFill(0x00ffff);
                this._g.drawEllipse(pt.x, pt.y, 3, 3);
                this._g.endFill();
            }

            // 壁を描く
            this._walls.update();

            // 選択モードのとき、マウスポインタの近くにあるピボット点を強調表示
            if (mode === SELECT && this._nearestPivot !== null) {
                let pt = this._nearestPivot.pt;
                // マウス位置に最も近いピボット点を表示
                this._g.beginFill(0xff8000);
                this._g.drawEllipse(pt.x, pt.y, 10, 10);
                this._g.endFill();
            }
        }
    }
}

module.exports = {
    MainPanel
}