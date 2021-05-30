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

        // 残像描画用位置保存リスト
        this._traces = [];

        // 残像個数
        this._nTraces = 0;

        // 現在の残像開始インデックス
        this._currTraceInd = 0;
    }

    setBallPos(mp) {
        this._p = mp;
        // ここでBaseSpr._update()を呼ばない
        // （スプライトオブジェクト自身は移動させない）
        return this;
    }

    getBallPos() {
        return this._p;
    }

    getBallDestPos() {
        let dest = U.vecAdd(this._p, this._v);
        return dest;
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

    getRadius() {
        return this._r;
    }

    init(PIXI, container, w, h, nTraces) {
        this._w = w;
        this._h = h;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        container.addChild(cont);

        // 残像用データ初期化
        this._traces = [];
        for (let i=0; i<nTraces; i++) {
            this._traces.push(null);
        }
        this._nTraces = nTraces;
        this._currTraceInd = 0;
    }

    saveCurrPos() {
        // インデックスを更新
        this._currTraceInd++;
        if (this._currTraceInd >= this._nTraces) {
            this._currTraceInd = 0;
        }

        // 現在の位置をセーブ
        this._traces[this._currTraceInd] = {
            x: this._p.x,
            y: this._p.y
        };
    }

    // @param i [i] インデックス. 0=最新、-1=一つ前の位置, -2=二つ前の位置, ...
    getInd(i) {
        let i2 = ((this._currTraceInd + i) % this._nTraces);
        if (i2 < 0) {
            i2 += this._nTraces;
        }
        return i2;
    }

    applyGravity() {
        const G_RATIO = 0.02;
        this._v.y += (9.8 * G_RATIO);
    }

    // ----------------------------------------
    // 他のボールとの衝突計算
    // ----------------------------------------
    update1(ball2) {
        // this.applyGravity();
        let speed1 = U.vecLen(this._v);
        let speed2 = U.vecLen(ball2.getVec());

        let pB = this.getBallDestPos();
        let pY = ball2.getBallDestPos();
        let cpInfo = U.calcCollisionPoint2(this._p, pB, this._r, ball2.getBallPos(), pY, ball2.getRadius());
        if (cpInfo !== null) {
            // 衝突した
            let newB = cpInfo.pRefB;
            let newY = cpInfo.pRefY;
            let newV1 = U.vecScalar(U.vecNorm(U.vecSub(newB, cpInfo.pC1)), speed1);
            let newV2 = U.vecScalar(U.vecNorm(U.vecSub(newY, cpInfo.pC2)), speed2);
            // console.log(`len(newV1)=${U.vecLen(newV1)}, len(newV2)=${U.vecLen(newV2)}`);

            // このボールの位置と移動ベクトルを修正
            this._p = newB;
            this._v = newV1;

            // 他のボールの位置と移動ベクトルを修正
            ball2.setBallPos(newY);
            ball2.setVec(newV2);
        }
    }

    // ----------------------------------------
    // 壁との衝突計算
    // ----------------------------------------
    update2(wallList) {
        // this.applyGravity();
        let speed = U.vecLen(this._v);

        this.update2Sub(wallList);

        // [TODO] **** 後で修正 ****
        // this._vを元のスピードに戻す
        let vOrigSpeed = U.vecScalar(U.vecNorm(this._v), speed);
        this._v = vOrigSpeed;

        this.saveCurrPos();  // 現在の位置をトレースリストにセーブ

        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            this._g.clear();
            // this._g.lineStyle(1, 0xffffff, 0.7);  // 太さ、色、アルファ(0=透明)

            // 昔ものから描いていく
            for (let i=-this._nTraces; i<=0; i++) {
                let p = this._traces[this.getInd(i)];
                if (p !== null) {
                    let ratio = (i + this._nTraces) / this._nTraces;    // 0<=ratio<=1.0（新しいものほど値が大きい）
                    ratio = ratio * ratio;  // 2次曲線
                    let r = 0;
                    let g = Math.floor(0x80 * ratio);
                    let b = Math.floor(0xff * ratio);
                    let color = (r << 16) + (g << 8) + b;
                    // console.log(`i=${i}, ratio=${ratio}, color=${color}`);
                    this._g.beginFill(color, ratio);    // 第2引数はalpha値(0以上1以下 - デフォルト1)
                    this._g.drawEllipse(p.x, p.y, this._r, this._r);  // 中心(cx, cy), 半径(rx, ry)
                    this._g.endFill();
                }
            }
        }
    }

    update2Sub(wallList) {
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
                    cpInfo: U.calcCollisionPoint1(p, U.vecAdd(p, v), e.p1, e.p2, this._r)
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
                this.update2Sub(wallList);
            }
        } else {
            this._p = U.vecAdd(this._p, this._v);
        }
    }
}

module.exports = {
    Ball
}
