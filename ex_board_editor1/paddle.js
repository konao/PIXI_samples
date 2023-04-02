// *******************************************************
//  パドル(Paddle)とパドルのリスト(Paddles)
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const { Spline } = require('./spline');
const U = require('./physics');

// ===================================================
//  1個のパドル
// ===================================================
class Paddle extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)

        this._p = { // パドルの位置（回転の中心点）
            x: 0,
            y: 0
        }
        this._r1 = 0;   // 半径1
        this._r2 = 0;   // 半径2
        this._L = 0;  // パドルの腕の長さ
        this._angle = 0;  // 回転角（度）

        this._pts = []; // 壁を構成する点の座標のリスト．

        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;

        this._bFill = true;
    }

    // @param r1 ... 半径1
    // @param r2 ... 半径2
    // @param L ... パドルの腕の長さ
    init(PIXI, container, w, h, bFill, r1, r2, L) {
        this._w = w;
        this._h = h;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        this.setPos({ x: 0, y: 0 });

        this._bFill = bFill;

        this._r1 = r1;
        this._r2 = r2;
        this._L = L;

        container.addChild(cont);
    }

    // 位置設定
    setPos(p) {
        this._p = p;
    }

    // 回転角取得
    getAngle() {
        return this._angle;
    }

    // 回転角設定
    setAngle(angle) {
        this._angle = angle;
    }

    // セーブ用データを返す
    getPaddleData() {
        // if (this._pivots.length > 0) {
        //     return {
        //         pivots: this._pivots,
        //         bFill: this._bFill
        //     }
        // } else {
        //     // pivot点がない場合（一番外側の壁など）
        //     return {
        //         pts: this._pts,
        //         bFill: this._bFill
        //     }
        // }
        return null;    // [TODO]
    }

    // @param pts [i] 壁を構成する点の座標のリスト
    // ptsのフォーマット：[{x, y}]
    setWallPoints(pts) {
        this._pts = pts;
    }

    setFillFlag(bFill) {
        this._bFill = bFill;
    }

    // @param p パドルの位置 (={x, y})
    //
    // this._p, this._r1, this._r2, this._Lからthis._ptsを生成
    genPaddlePoints(p) {
        this._pts = [];

        this._p = p;
        const C1 = p;
        const C2 = U.vecAdd(C1, U.vecScalar({x:0, y:-1}, this._L));

        const theta1 = Math.acos((this._r1 - this._r2)/this._L);
        const theta2 = 2*Math.PI - theta1;
        const phai1 = Math.PI - theta1;
        const phai2 = 2*Math.PI - phai1;

        const d = U.d2r(15); // 刻み幅（ラジアン）
        for (let theta = theta1; theta <= theta2; theta += d) {
            const P = U.vecAdd(C1, U.vecScalar({x: Math.sin(theta), y: -Math.cos(theta)}, this._r1));
            this._pts.push(P);
        }
        for (let phai = phai2; phai >= phai1; phai -= d) {
            const Q = U.vecAdd(C2, U.vecScalar({x: Math.sin(phai), y: Math.cos(phai)}, this._r2));
            this._pts.push(Q);
        }
   }

    // pに最も近いピボット点を返す
    //
    // @return {
    //      pt: {x, y},   // pに最も近いピボット点
    //      dist: number    // pからptまでの距離
    //      idx: number     // ピボット点のインデックス
    // }
    //
    // pのスレッショルド半径内に入っている点のみ選択ピボット点の候補になる
    // 見つからなかった場合はnullが返る
    getNearestPivot(p) {
        // const THRESHOLD_RADIUS = 30;    // スレッショルド半径
        // const TR2 = THRESHOLD_RADIUS * THRESHOLD_RADIUS;    // あらかじめ二乗した値を計算しておく

        // if (this._pivots.length <= 0) return null;

        // let nearestPivot = null;
        // let minDist2 = null;
        // let idx = -1;
        // for (let i = 0; i < this._pivots.length; i++) {
        //     let pivot = this._pivots[i];
        //     let dist2 = U.vecDist2(p, pivot);   // 毎回sqrtを計算すると遅いので距離の二乗値で比較
        //     if (dist2 < TR2) {
        //         if (minDist2 === null || dist2 < minDist2) {
        //             minDist2 = dist2;
        //             nearestPivot = pivot;
        //             idx = i;
        //         }
        //     }
        // }

        // return (nearestPivot === null) ? null : {
        //     pt: nearestPivot,
        //     dist: Math.sqrt(minDist2),
        //     idx: idx
        // };
        return null;
    }

    // 辺の数を返す
    //
    // ptsが3以上の時 ---> ptsの数
    // ptsが2の時 --> 1（辺は1個）
    // それ以外 --> 0
    countEdges() {
        const n = this._pts.length;
        if (n >= 3) {
            return n;
        } else if (n === 2) {
            return 1;
        } else {
            return 0;
        }
    }

    // @param i [i] 0<=i<countEdge()
    //
    // @return {p1, p2}
    // i番目の辺の端点
    // p1, p2共にフォーマットは{x, y}
    // iが範囲オーバーの時はnullが返る
    getEdge(i) {
        const n = this._pts.length;
        if ((i < 0) || (i >= n)) {
            return null;
        } else if (i === n - 1) {
            return {
                p1: this._pts[i],
                p2: this._pts[0]
            };
        } else {
            return {
                p1: this._pts[i],
                p2: this._pts[i + 1]
            };
        }
    }

    // @param p {x, y} [i] ボールの位置
    // @param v {x, y} [i] ボールの進行方向ベクトル
    //
    // @return cpInfo .. pに最も近い交点とその情報
    // 交点がない場合はnullが返る
    calcCrossPoint(p, v) {
        // let n = this._pts.length;
        // let ids = [];   // {s, e} s=開始点, e=終了点
        // for (let i = 0; i < n; i++) {
        //     if (i != n - 1) {
        //         ids.push({ s: i, e: i + 1 });
        //     } else {
        //         ids.push({ s: i, e: 0 });
        //     }
        // }
        // let cpInfos = ids.map(idx => {
        //     return U.getCrossPoint(p, v, this._pts[idx.s], this._pts[idx.e]);
        // });
        // // cpInfosの中から、最もdistの小さいもの(=pに最も近い交点)を選ぶ
        let nearestCpInfo = null;
        // let minDist = -1;
        // cpInfos.forEach(cpInfo => {
        //     if (cpInfo !== null) {
        //         if ((minDist < 0) || (cpInfo.dist < minDist)) {
        //             minDist = cpInfo.dist;
        //             nearestCpInfo = cpInfo;
        //         }
        //     }
        // });

        return nearestCpInfo;
    }

    update() {
        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            // このセルをgに描画
            this._g.clear();
            this._g.lineStyle(1, 0xffffff, 0.7);  // 太さ、色、アルファ(0=透明)

            let n = this._pts.length;
            if (n > 0) {
                if (this._bFill) {
                    this._g.beginFill(0x002010);
                }
                for (let i = 0; i <= n; i++) {
                    const targetIdx = (i === n) ? 0 : i;

                    // パドルの各点をthis._angle度回転させる
                    // p0=回転前、p1=回転後
                    const p0 = this._pts[targetIdx];
                    const p1 = U.vecAdd(this._p, U.vecRotate(U.vecSub(p0, this._p), this._angle));

                    // 描画
                    if (i === 0) {
                        this._g.moveTo(p1.x, p1.y);
                    } else {
                        this._g.lineTo(p1.x, p1.y);
                    }
                }
                if (this._bFill) {
                    this._g.endFill();
                }    
            }
        }
    }
}

// ===================================================
//  複数個のパドル
// ===================================================
class Paddles {
    constructor() {
        this.clear();
    }

    clear() {
        this._paddles = [];
    }

    addPaddle(paddle) {
        this._paddles.push(paddle);
    }

    getPaddleList() {
        return this._paddles;
    }

    // ファイルセーブ用データを取得
    getPaddleData() {
        let paddleData = [];
        for (let i = 0; i < this._paddles.length; i++) {
            const pd = this._paddles[i].getPaddleData();
            paddleData.push(pd);
        }
        return paddleData;
    }

    // セーブデータからパドルを復活させる（ロード）
    loadPaddleData(paddleData, PIXI, container, w, h) {
        this.clear();
        for (let pd of paddleData) {
            let paddle = new Paddle();
            paddle.init(PIXI, container, w, h, false);

            if (pd.pivots) {
                // pivotがある場合
                paddle.setPivotPoints(pd.pivots);
                paddle.genPaddlePoints();
            } else {
                // pivotがない場合
                paddle.setWallPoints(pd.pts);
            }

            paddle.setFillFlag(pd.bFill);

            this.addPaddle(paddle);
        }
    }

    // setPivotPoint(idxWall, idx, p) {
    //     if (idxWall >= 0 && idxWall < this._paddles.length) {
    //         let paddle = this._paddles[idxWall];
    //         if (paddle !== null) {
    //             // ピボット点移動
    //             paddle.setPivotPoint(idx, p);
    //             // 壁の点を再生成
    //             paddle.genPaddlePoints();
    //         }
    //     }
    // }

    // すべての壁のピボット点の中から、pに最も近いものを返す．
    //
    // @return {
    //      pt: {x, y},   // pに最も近いピボット点
    //      dist: number    // pからptまでの距離
    //      idx: number     // ピボット点のインデックス
    //      idxWall: number  // ピボット点を含むwallへのインデックス
    // }
    // 見つからなかった場合はnullが返る
    // getNearestPivot(p) {
    //     // 各wall中のpに最も近いピボット点のリストを作る
    //     let nearestPivots = [];
    //     for (let i = 0; i < this._paddles.length; i++) {
    //         let paddle = this._paddles[i];
    //         let np = paddle.getNearestPivot(p);
    //         if (np !== null) {
    //             nearestPivots.push({
    //                 idxWall: i,
    //                 ...np
    //             })
    //         }
    //     }

    //     // その中からさらに一番pに近いものを取り出す
    //     let result = null;
    //     if (nearestPivots.length > 0) {
    //         result = nearestPivots.reduce((prev, curr) => {
    //             if ((prev === null) || (curr !== null && curr.dist < prev.dist)) {
    //                 return curr;
    //             } else {
    //                 return prev;
    //             }
    //         });
    //     }

    //     return result;
    // }

    onPressLeftFlip() {
        const a = 40;
        const b = 10;
        const f = (x) => b/(a*a)*(x-a)*(x-a);
        let count = 0;
        let mode = 1;   // 1=increase, -1=decrease
        let timerId = setInterval(()=>{
            const dAngle = f(count) * mode;
            for (let paddle of this._paddles) {
                const curAngle = paddle.getAngle();
                paddle.setAngle(curAngle + dAngle);
            }
            if (mode > 0) {
                count++;
                if (count >= 30) {
                    mode = -mode;
                }    
            } else {
                count--;
                if (count < 0) {
                    clearInterval(timerId);
                }    
            }
        }, 10);
    }

    onPressRightFlip() {
        for (let paddle of this._paddles) {
            const curAngle = paddle.getAngle();
            paddle.setAngle(curAngle - 5);
        }
    }

    update() {
        this._paddles.forEach(paddle => {
            paddle.update();
        });
    }
}

module.exports = {
    Paddle,
    Paddles
}
