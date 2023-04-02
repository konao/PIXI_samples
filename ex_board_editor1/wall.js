// *******************************************************
//  壁(Wall)と壁のリスト(Walls)
//
//  1つの壁は複数個の辺からなる多角形
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const { Spline } = require('./spline');
const U = require('./physics');

// ===================================================
//  1個の壁
// ===================================================
class Wall extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)

        this._pivots = [];  // ピボット点のリスト．各点のフォーマットは{x, y}
        this._pts = []; // 壁を構成する点の座標のリスト．

        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;

        this._bFill = true;
    }

    init(PIXI, container, w, h, bFill) {
        this._w = w;
        this._h = h;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        this.setPos({ x: 0, y: 0 });

        this._bFill = bFill;

        container.addChild(cont);
    }

    // セーブ用データを返す
    getWallData() {
        if (this._pivots.length > 0) {
            return {
                pivots: this._pivots,
                bFill: this._bFill
            }
        } else {
            // pivot点がない場合（一番外側の壁など）
            return {
                pts: this._pts,
                bFill: this._bFill
            }
        }
    }

    // @param pts [i] 壁を構成する点の座標のリスト
    // ptsのフォーマット：[{x, y}]
    setWallPoints(pts) {
        this._pts = pts;
    }

    setPivotPoints(pivots) {
        this._pivots = pivots;
    }

    setPivotPoint(idx, p) {
        if (idx >= 0 && idx < this._pivots.length) {
            this._pivots[idx] = p;
        }
    }

    setFillFlag(bFill) {
        this._bFill = bFill;
    }

    // this._pivotsからスプライン関数を使ってwallPointsを生成
    genWallPoints() {
        if (this._pivots.length > 0) {
            let sp = new Spline();
            sp.clear();

            for (let p of this._pivots) {
                sp.addPoint(p.x, p.y);
            }

            sp.genSpline(); // スプライン生成

            const td = 0.05 / this._pivots.length;  // ステップ値をピボット点の個数に応じて変える
            let ipts = [];
            for (let t = 0.0; t < 1.0; t += td) {
                let ipt = sp.interp(t);
                ipts.push({
                    x: ipt.x,
                    y: ipt.y
                });
            }
            let ipt = sp.interp(1.0);
            ipts.push({
                x: ipt.x,
                y: ipt.y
            });

            this.setWallPoints(ipts);
        }
    }

    // 中心(x, y), 半径rの円形の壁を生成
    //
    // @param cx [i] 中心x座標
    // @param cy [i] 中心y座標
    // @param r [i] 半径
    genCircleWallPoints(cx, cy, r) {
        this._pts = [];

        const dDeg = 15;
        let deg = 0.0;
        while (deg < 360) {
            let x = cx + r * Math.cos(U.d2r(deg));
            let y = cy + r * Math.sin(U.d2r(deg));
            this._pts.push({ x: x, y: y });
            deg += dDeg;
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
        const THRESHOLD_RADIUS = 30;    // スレッショルド半径
        const TR2 = THRESHOLD_RADIUS * THRESHOLD_RADIUS;    // あらかじめ二乗した値を計算しておく

        if (this._pivots.length <= 0) return null;

        let nearestPivot = null;
        let minDist2 = null;
        let idx = -1;
        for (let i = 0; i < this._pivots.length; i++) {
            let pivot = this._pivots[i];
            let dist2 = U.vecDist2(p, pivot);   // 毎回sqrtを計算すると遅いので距離の二乗値で比較
            if (dist2 < TR2) {
                if (minDist2 === null || dist2 < minDist2) {
                    minDist2 = dist2;
                    nearestPivot = pivot;
                    idx = i;
                }
            }
        }

        return (nearestPivot === null) ? null : {
            pt: nearestPivot,
            dist: Math.sqrt(minDist2),
            idx: idx
        };
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
        let n = this._pts.length;
        let ids = [];   // {s, e} s=開始点, e=終了点
        for (let i = 0; i < n; i++) {
            if (i != n - 1) {
                ids.push({ s: i, e: i + 1 });
            } else {
                ids.push({ s: i, e: 0 });
            }
        }
        let cpInfos = ids.map(idx => {
            return U.getCrossPoint(p, v, this._pts[idx.s], this._pts[idx.e]);
        });
        // cpInfosの中から、最もdistの小さいもの(=pに最も近い交点)を選ぶ
        let nearestCpInfo = null;
        let minDist = -1;
        cpInfos.forEach(cpInfo => {
            if (cpInfo !== null) {
                if ((minDist < 0) || (cpInfo.dist < minDist)) {
                    minDist = cpInfo.dist;
                    nearestCpInfo = cpInfo;
                }
            }
        });

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
            if (this._bFill) {
                this._g.beginFill(0x002010);
            }
            for (let i = 0; i <= n; i++) {
                if (i === 0) {
                    this._g.moveTo(this._pts[0].x, this._pts[0].y);
                } else if (i === n) {
                    this._g.lineTo(this._pts[0].x, this._pts[0].y);
                } else {
                    this._g.lineTo(this._pts[i].x, this._pts[i].y);
                }
            }
            if (this._bFill) {
                this._g.endFill();
            }

            this._g.beginFill(0x00a000);
            this._g.lineStyle(1, 0xffff00, 0.7);  // 太さ、色、アルファ(0=透明)
            for (let pivot of this._pivots) {
                this._g.drawEllipse(pivot.x, pivot.y, 5, 5);  // 中心(cx, cy), 半径(rx, ry)
            }
            this._g.endFill();
        }
    }
}

// ===================================================
//  複数個の壁
// ===================================================
class Walls {
    constructor() {
        this.clear();
    }

    clear() {
        this._walls = [];
    }

    addWall(wall) {
        this._walls.push(wall);
    }

    getWallList() {
        return this._walls;
    }

    // ファイルセーブ用データを取得
    getWallData() {
        let wallData = [];
        for (let i = 0; i < this._walls.length; i++) {
            const wd = this._walls[i].getWallData();
            wallData.push(wd);
        }
        return wallData;
    }

    // セーブデータから壁を復活させる（ロード）
    loadWallData(wallData, PIXI, container, w, h) {
        this.clear();
        for (let wd of wallData) {
            let wall = new Wall();
            wall.init(PIXI, container, w, h, false);

            if (wd.pivots) {
                // pivotがある場合
                wall.setPivotPoints(wd.pivots);
                wall.genWallPoints();
            } else {
                // pivotがない場合
                wall.setWallPoints(wd.pts);
            }

            wall.setFillFlag(wd.bFill);

            this.addWall(wall);
        }
    }

    setPivotPoint(idxWall, idx, p) {
        if (idxWall >= 0 && idxWall < this._walls.length) {
            let wall = this._walls[idxWall];
            if (wall !== null) {
                // ピボット点移動
                wall.setPivotPoint(idx, p);
                // 壁の点を再生成
                wall.genWallPoints();
            }
        }
    }

    // すべての壁のピボット点の中から、pに最も近いものを返す．
    //
    // @return {
    //      pt: {x, y},   // pに最も近いピボット点
    //      dist: number    // pからptまでの距離
    //      idx: number     // ピボット点のインデックス
    //      idxWall: number  // ピボット点を含むwallへのインデックス
    // }
    // 見つからなかった場合はnullが返る
    getNearestPivot(p) {
        // 各wall中のpに最も近いピボット点のリストを作る
        let nearestPivots = [];
        for (let i = 0; i < this._walls.length; i++) {
            let wall = this._walls[i];
            let np = wall.getNearestPivot(p);
            if (np !== null) {
                nearestPivots.push({
                    idxWall: i,
                    ...np
                })
            }
        }

        // その中からさらに一番pに近いものを取り出す
        let result = null;
        if (nearestPivots.length > 0) {
            result = nearestPivots.reduce((prev, curr) => {
                if ((prev === null) || (curr !== null && curr.dist < prev.dist)) {
                    return curr;
                } else {
                    return prev;
                }
            });
        }

        return result;
    }

    update() {
        this._walls.forEach(wall => {
            wall.update();
        });
    }
}

module.exports = {
    Wall,
    Walls
}
