// *******************************************************
//  壁
//
//  1つの壁は複数個の辺からなる多角形
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');

class Wall extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)

        this._pts = []; // 壁を構成する点の座標のリスト．各点のフォーマットは{x, y}

        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;        
    }

    init(PIXI, container, w, h) {
        this._w = w;
        this._h = h;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        this.setPos({x: 0, y: 0});
    
        container.addChild(cont);
    }

    // @param pts [i] 壁を構成する点の座標のリスト
    // ptsのフォーマット：[{x, y}]
    setWallPoints(pts) {
        this._pts = pts;
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
            let x = cx + r*Math.cos(U.d2r(deg));
            let y = cy + r*Math.sin(U.d2r(deg));
            this._pts.push({x: x, y: y});
            deg += dDeg;
        }
    }

    // 辺の数を返す
    //
    // ptsが3以上の時 ---> ptsの数
    // ptsが2の時 --> 1（辺は1個）
    // それ以外 --> 0
    countEdges() {
        const n = this._pts.length;
        if (n>=3) {
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
        } else if (i === n-1) {
            return {
                p1: this._pts[i],
                p2: this._pts[0]
            };
        } else {
            return {
                p1: this._pts[i],
                p2: this._pts[i+1]
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
        for (let i=0; i<n; i++) {
            if (i != n-1) {
                ids.push({s:i, e:i+1});
            } else {
                ids.push({s:i, e:0});
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
            for (let i=0; i<=n; i++) {
                if (i === 0) {
                    this._g.moveTo(this._pts[0].x, this._pts[0].y);
                } else if (i === n) {
                    this._g.lineTo(this._pts[0].x, this._pts[0].y);
                } else {
                    this._g.lineTo(this._pts[i].x, this._pts[i].y);
                }
            }
        }
    }
}

module.exports = {
    Wall
}
