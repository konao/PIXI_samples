const { BaseSpr } = require('./baseSpr');
const U = require('./utils');

class Wall extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)

        this._pts = []; // 壁を構成する点の座標のリスト

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
