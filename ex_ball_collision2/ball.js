// *******************************************************
//  ボール
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');
const Wall = require('./wall');

class Ball extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)

        this._r = 0;    // 半径
        this._vx = 0;   // 移動ベクトル
        this._vy = 0;
        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;
    }

    setMousePos(mp) {
        let mx = mp.x;
        let my = mp.y;

        let v = {
            x: mx - this._x,
            y: my - this._y
        };
        let nv = U.vecNormalize(v);

        this._vx = nv.x;
        this._vy = nv.y;
    }

    setPosDirect(mp) {
        this._x = mp.x;
        this._y = mp.y;    
    }

    getVec() {
        return {
            x: this._vx,
            y: this._vy
        };
    }

    // @param v [i] 方向ベクトル
    setVec(v) {
        this._vx = v.x;
        this._vy = v.y;
    }

    init(PIXI, container, w, h) {
        this._w = w;
        this._h = h;
        this._r = 10;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        container.addChild(cont);
    }

    update(wallList) {
        let v = {x: this._vx, y: this._vy};
        let speed = U.vecGetLen(v);

        this.updateSub(wallList);

        // [TODO] **** 修正 ****
        // this._vx, _vyを元のスピードに戻す
        let v2 = {x: this._vx, y: this._vy};
        let vOrigSpeed = U.vecScalar(U.vecNormalize(v2), speed);
        this._vx = vOrigSpeed.x;
        this._vy = vOrigSpeed.y;

        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            this._g.clear();
            this._g.beginFill(0x00ffff);
            this._g.lineStyle(1, 0xffffff, 0.7);  // 太さ、色、アルファ(0=透明)
            this._g.drawEllipse(this._x, this._y, 5, 5);  // 中心(cx, cy), 半径(rx, ry)
            this._g.endFill();
        }
    }

    updateSub(wallList) {
        let p = {x: this._x, y: this._y};
        let v = {x: this._vx, y: this._vy};

        // pをv方向に移動したときに交差する最も近い辺を求める --> nearestEdge
        let nearestEdge = null;
        wallList.forEach(wall => {
            let nEdge = wall.countEdges();
            let edgeList = [];   // {p1, p2} p1=開始点, p2=終了点
            for (let i=0; i<nEdge; i++) {
                // i番目の辺の端点を取得
                let e = wall.getEdge(i);
                edgeList.push(e);
            }

            let edgeInfos = edgeList.map(e => {
                return {
                    e: e,
                    cpInfo: U.getCrossPoint(p, v, e.p1, e.p2)
                };
            });
            // cpInfosの中から、最もdistの小さいもの(=pに最も近い交点)を選ぶ
            let minDist = -1;
            edgeInfos.forEach(ei => {
                if (ei.cpInfo !== null) {
                    if ((minDist < 0) || (ei.cpInfo.dist < minDist)) {
                        minDist = ei.cpInfo.dist;
                        nearestEdge = ei.e
                    }
                }
            });
        });
        
        if (nearestEdge) {
            // 反射判定
            let newPosInfo = U.reflect(p, v, this._r, nearestEdge.p1, nearestEdge.p2);
            // console.log(`i=${i}`);
            // console.log(`q1=(${q1.x}, ${q1.y}), q2=(${q2.x}, ${q2.y})`);
            // console.log(`newPosInfo.p=(${newPosInfo.p.x}, ${newPosInfo.p.y})`);
            // console.log(`newPosInfo.v=(${newPosInfo.v.x}, ${newPosInfo.v.y})`);
            // console.log(`newPosInfo.bRefrect=(${newPosInfo.bReflect})`);

            // 位置と方向ベクトルを更新
            this._x = newPosInfo.p.x;
            this._y = newPosInfo.p.y;
            this._vx = newPosInfo.v.x;
            this._vy = newPosInfo.v.y;

            if (newPosInfo.bReflect) {
                // 反射した
                // 再度反射の判定を再帰的に行う
                // （反射しなくなるまで）
                this.updateSub(wallList);
            }
        }
    }
}

module.exports = {
    Ball
}
