const PIXI = require('pixi.js');
const { Wall, Walls } = require('./wall');
const { Paddle, Paddles } = require('./paddle');
const { NEW, SELECT, MOVE } = require('./cmdButtons');
const { Ball } = require('./ball');
const { Text } = require('./text');
const U = require('./physics');
const C = require('./const');

const N_BALL_TRACE = 10;    // ボールの残像の個数
const FILE_VERSION = '0.0.1';

class MainPanel {
    constructor(pixiApp, g_w, g_h) {
        this._pixiApp = pixiApp;
        this._g_w = g_w;
        this._g_h = g_h;
        this._g = null;
        this._pts = [];

        // 壁
        this._walls = new Walls();
        this._nearestPivot = null;
        this._bPivotDragging = false;   // ピボット点ドラッグ中フラグ

        // ボール
        this._pA = {x: 100, y: 650};    // 射出ベクトル開始点
        this._pB = {x: 150, y: 500};    // 射出ベクトル終了点
        this._focus = null;
        this._arrowDragging = 0;    // 1=pA, 2=pB
        this._ballSize = 15; // ボールのサイズ
        this._ballSpeed = 10;    // ボールのスピード
        this._nBalls = 0;   // ボールの個数

        this._ballList = [];
        this._infoText = null;

        // パドル
        this._paddles = new Paddles();

        this._bPause = false;
    }

    resize(w, h) {
        this._g_w = w;
        this._g_h = h;
    }

    initSprite(PIXI, container) {
        this._g = new PIXI.Graphics();

        container.addChild(this._g);

        // 一番外側の枠を生成
        let w0 = new Wall();
        w0.setWallPoints([
            {x: 10, y: 10},
            {x: this._g_w-10, y: 10},
            {x: this._g_w-10, y: this._g_h-10},
            {x: 10, y: this._g_h-10}
        ]);
        w0.init(PIXI, this._g, this._g_w, this._g_h, false);
        this._walls.addWall(w0);

        // パドル表示実験用
        let p0 = new Paddle();
        p0.init(PIXI, this._g, this._g_w, this._g_h, false, 30, 10, 100, -180, C.PADDLE_LEFT);
        p0.genPaddlePoints({x: 300, y: 500});
        this._paddles.addPaddle(p0);

        let p1 = new Paddle();
        p1.init(PIXI, this._g, this._g_w, this._g_h, false, 30, 10, 100, 180, C.PADDLE_RIGHT);
        p1.genPaddlePoints({x: 700, y: 500});
        this._paddles.addPaddle(p1);

        // ステータス表示用テキスト
        this._infoText = new Text()
            .initSprite(PIXI, container)
            .setText(`balls: ${this._nBalls}  size: ${this._ballSize}  speed: ${this._ballSpeed}`)
            .setPos(70, 20)
            .setFontSize(20)
            .setColor('cyan');
    }

    clear() {
        this._pts = [];
    }

    showStatus() {
        if (this._infoText) {
            this._infoText.setText(`balls: ${this._nBalls}  size: ${this._ballSize}  speed: ${this._ballSpeed}`);
        }
    }
    
    getSaveData() {
        if (this._walls) {
            const wallData = this._walls.getWallData();
            const saveData = {
                version: FILE_VERSION,
                wallData
            }    
            return saveData;
        } else {
            return null;
        }
    }

    loadWallData(data) {
        if (data.version === FILE_VERSION) {
            this._walls.loadWallData(data.wallData, PIXI, this._g, this._g_w, this._g_h);
        }
    }

    // @param p [i] マウスの位置
    // @param e [i] イベント情報
    // @param mode [i] 現在のモード
    onMouseDown(p, e, mode) {
        if (mode === NEW) {
            this._pts.push(p);
        }
        else if (mode === SELECT) {
            if ((this._nearestPivot !== null) && (this._bPivotDragging === false)) {
                this._bPivotDragging = true;    // ピボット点ドラッグ中
            }
        }
        else if (mode === MOVE) {
            if (e.which === 1) {
                // 左ボタンクリック
                let mousePressPos = {
                    x: e.clientX,
                    y: e.clientY
                };
        
                // マウスの位置と射出点A, Bの距離を計算
                let r1 = U.vecDist(mousePressPos, this._pA);
                let r2 = U.vecDist(mousePressPos, this._pB);

                // マウスの位置が射出点に近ければフォーカスを更新
                const CLOSE_DIST = 20;
                if (r1 < CLOSE_DIST) {
                    this._arrowDragging = 1;
                    this._focus = this._pA;
                } else if (r2 < CLOSE_DIST) {
                    this._arrowDragging = 2;
                    this._focus = this._pB;
                } else {
                    this._arrowDragging = 0;
                    this._focus = null;    
                }
            } else if (e.which === 3) {
                // 右ボタンクリック
                let ejPos = this._pA;
                let ejVec = U.vecNorm(U.vecSub(this._pB, this._pA));
                ejVec = U.vecScalar(ejVec, this._ballSpeed);
        
                // ボールを生成
                let newBall = new Ball();
                newBall.setRadius(this._ballSize)
                    .setBallPos(ejPos)
                    .setVec(ejVec);
                newBall.init(PIXI, this._pixiApp.stage, this._g_w, this._g_h, N_BALL_TRACE);
        
                this._ballList.push(newBall);
                this._nBalls++;
                this.showStatus();
            }                    
        }
    }

    onMouseUp(p, mode) {
        if (mode === SELECT) {
            if (this._bPivotDragging) {
                this._bPivotDragging = false;
            }
        }
        else if (mode === MOVE) {
            this._arrowDragging = 0;
            this._focus = null;        
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
        else if (mode === MOVE) {
            if (this._arrowDragging > 0) {
                this._focus = p;
                switch (this._arrowDragging) {
                    case 1:
                        this._pA = p;
                        break;
                    case 2:
                        this._pB = p;
                        break;
                }
            }
        }
    }

    onMouseWheel(d, mode) {

    }

    onKeyDown(key, mode) {
        switch (key) {
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
            case 32:    // space
            {
                console.log('Space');
                this._bPause = !this._bPause;
                break;
            }
            case 37:    // left
            {
                console.log('left');
                // ボールサイズ縮小
                if (this._ballSize > 1) {
                    this._ballSize--;
                    this.showStatus();
                }
                break;
            }
            case 39:    // right
            {
                // ボールサイズ拡大
                if (this._ballSize < 50) {
                    this._ballSize++;
                    this.showStatus();
                }
                break;
            }
            case 38:    // up
            {
                // ボールスピードアップ
                if (this._ballSpeed < 50) {
                    this._ballSpeed++;
                    this.showStatus();
                }
                break;
            }
            case 40:    // down
            {
                // ボールスピードダウン
                if (this._ballSpeed > 1) {
                    this._ballSpeed--;
                    this.showStatus();
                }
                break;
            }
            case 90:   // z
            {
                // console.log('flip left');
                this._paddles.onPressLeftFlip();
                break;
            }
            case 226:    // アンダーバー
            {
                // console.log('flip right');
                this._paddles.onPressRightFlip();
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

            // パドルを描く
            this._paddles.update();

            // 選択モードのとき、マウスポインタの近くにあるピボット点を強調表示
            if (mode === SELECT && this._nearestPivot !== null) {
                let pt = this._nearestPivot.pt;
                // マウス位置に最も近いピボット点を表示
                this._g.beginFill(0xff8000);
                this._g.drawEllipse(pt.x, pt.y, 10, 10);
                this._g.endFill();
            }

            if (mode === MOVE) {
                // ボール射出ベクトルを描く
                if ((this._pA !== null) && (this._pB !== null)) {
                    // AからBへの線を引く
                    this._g.lineStyle(1, 0xffff00, 1);  // 黄色
                    this._g.moveTo(this._pA.x, this._pA.y);
                    this._g.lineTo(this._pB.x, this._pB.y);
            
                    // 矢印を描く
                    let rv = U.vecScalar(U.vecNorm(U.vecSub(this._pA, this._pB)), 20);
                    let pB1 = U.vecAdd(this._pB, U.vecRotate(rv, 30));
                    this._g.moveTo(this._pB.x, this._pB.y);
                    this._g.lineTo(pB1.x, pB1.y);
                    let pB2 = U.vecAdd(this._pB, U.vecRotate(rv, -30));
                    this._g.moveTo(this._pB.x, this._pB.y);
                    this._g.lineTo(pB2.x, pB2.y);
                }

                // ボールを描く
                if (!this._bPause) {
                    let nBalls = this._ballList.length;
                    for (let i=0; i<nBalls; i++) {
                        let ball1 = this._ballList[i];

                        // 重力を適用
                        ball1.applyGravity();

                        // 衝突計算1（ボール同士）
                        for (let j=i+1; j<nBalls; j++) {
                            let ball2 = this._ballList[j];
                            ball1.update1(ball2);
                        }
                    }

                    // 衝突計算2（ボールと壁）
                    this._ballList.forEach(ball => {
                        ball.update2(this._walls.getWallList() /*, g_ballList */);
                    });

                    // if (this._arrowDragging > 0) {
                    //     draw();
                    // }
                }
            }
        }
    }
}

module.exports = {
    MainPanel
}