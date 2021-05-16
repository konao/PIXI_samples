// *******************************************************
//  ボール
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');
const Wall = require('./wall');

// このクラスはボールの描画をPIXI.Graphicsオブジェクトへの
// 直接描画により行う．そのため、スプライト自身(=PIXI.Graphics)は
// 移動せず、位置を固定(=(0, 0))のままにする．
// そのため、BaseSpr._update()を呼ばない経路でのsetterを用意している．
// （例：setBallPos）
class Ball extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)
        
        this._r = 0;    // 半径
    
        // 移動ベクトル
        this._v = {
            x: 0.0,
            y: 0.0
        }
    
        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;
    }

    setBallPos(mp) {
        this._p = mp;
        // ここでBaseSpr._update()を呼ばない
        // （スプライトオブジェクト自身は移動させない）
        return this;
    }

    getVec() {
        return this._v;
    }

    // @param v [i] 方向ベクトル
    setVec(v) {
        this._v = v;
        return this;
    }

    setRadius(r) {
        this._r = r;
        return this;
    }

    init(PIXI, container, w, h) {
        this._w = w;
        this._h = h;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        container.addChild(cont);
    }

    update(wallList) {
        let speed = U.vecLen(this._v);

        this.updateSub(wallList);

        // [TODO] **** 後で修正 ****
        // this._vを元のスピードに戻す
        let vOrigSpeed = U.vecScalar(U.vecNorm(this._v), speed);
        this._v = vOrigSpeed;

        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            this._g.clear();
            this._g.beginFill(0x0088ff);
            this._g.lineStyle(1, 0xffffff, 0.7);  // 太さ、色、アルファ(0=透明)
            this._g.drawEllipse(this._p.x, this._p.y, this._r, this._r);  // 中心(cx, cy), 半径(rx, ry)
            this._g.endFill();
        }
    }

    updateSub(wallList) {
        let p = this._p;
        let v = this._v;

        // pをv方向に移動したときに交差する最も近い辺を求める --> nearestEdge
        let nearestEdge = null;
        let minDist = -1;
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
                    cpInfo: U.calcContactPoint(p, U.vecAdd(p, v), e.p1, e.p2, this._r)
                };
            });

            // cpInfosの中から、pから接触点までの距離が最も小さい辺を選ぶ
            edgeInfos.forEach(ei => {
                if ((ei.cpInfo !== null) && (ei.cpInfo.pC !== null)) {
                    let dist = U.vecDist(p, ei.cpInfo.pC);
                    if ((minDist < 0) || (dist < minDist)) {
                        minDist = dist
                        nearestEdge = ei.e;
                        // console.log(`minDist=${minDist}`);
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
            this._p = newPosInfo.p;
            this._v = newPosInfo.v;

            if (newPosInfo.bReflect) {
                // 反射した
                // 再度反射の判定を再帰的に行う
                // （反射しなくなるまで）
                this.updateSub(wallList);
            }
        } else {
            this._p = U.vecAdd(this._p, this._v);
        }
    }
}

module.exports = {
    Ball
}
