// *******************************************************
//  ボール
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./physics');
const Wall = require('./wall');

const e = 0.9;  // 反射係数

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
    
        // 方向ベクトル（このベクトルの絶対値が速さ）
        this._vec = {
            x: 0.0,
            y: 0.0
        }

        this._m = 0;    // 質量(=半径の2乗*定数係数、とする)
    
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
        let dest = U.vecAdd(this._p, this.getVec());
        return dest;
    }

    // @param v [i] 方向ベクトル
    setVec(v) {
        this._vec = v;
        return this;
    }

    getVec() {
        return this._vec;
    }

    // 移動方向をdirに変更
    // 現在のボールの速さは変えない
    setDir(dir) {
        const speed = U.vecLen(this._vec);
        this._vec = U.vecScalar(U.vecNorm(dir), speed);
        return this;
    }

    // 速さをspeedに変更
    // 現在のボールの移動方向は変えない
    setSpeed(speed) {
        if (speed >= 0) {
            const newDir = U.vecScalar(U.vecNorm(this._vec), speed);
            this._vec = newDir;
        }
        return this;
    }

    // 現在のボールの速さを返す
    getSpeed() {
        return U.vecLen(this._vec);
    }

    setRadius(r) {
        this._r = r;
        this._m = r*r;
        return this;
    }

    getRadius() {
        return this._r;
    }

    getMass() {
        return this._m;
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
        this._vec.y += (9.8 * G_RATIO);
    }

    // ----------------------------------------
    // 他のボールとの衝突計算
    // ----------------------------------------
    update1(ball2) {
        // 最初にこのボールとball2の距離dを計算
        // dがr1+r2より小さければ衝突判定はしないで帰る
        let d = U.vecDist(this._p, ball2.getBallPos());
        let R = this._r + ball2.getRadius();
        if (d<R) return;

        let pB = this.getBallDestPos();
        let pY = ball2.getBallDestPos();
        let cpInfo = U.calcCollisionPoint2(this._p, pB, this._r, this._m, ball2.getBallPos(), pY, ball2.getRadius(), ball2.getMass(), e);
        if (cpInfo !== null) {
            // 衝突した
            
            // このボールの位置と方向ベクトルを修正
            this.setBallPos(cpInfo.pRefB);
            this.setDir(cpInfo.vRefDirB);

            // 他のボールの位置と方向ベクトルを修正
            ball2.setBallPos(cpInfo.pRefY);
            ball2.setDir(cpInfo.vRefDirY);
        }
    }

    // ----------------------------------------
    // 壁との衝突計算
    // ----------------------------------------
    update2(wallList) {
        // this.applyGravity();
        let v = this.getVec();

        this.update2Sub(v, wallList);

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

    // 反射のたびにこのオブジェクトの保持する方向とスピードが更新される
    // vは残りの移動変位
    update2Sub(v, wallList) {
        let p = this._p;

        // pをv方向に移動したときに交差する最も近い辺を求める --> nearestEdge
        let nearestEdge = null;
        let minDist = -1;
        if (wallList.length > 0) {
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
                        cpInfo: U.calcCollisionPoint1(p, U.vecAdd(p, v), e.p1, e.p2, this._r, e)
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
        }
        
        if (nearestEdge) {
            // 反射判定
            let pB = U.vecAdd(p, v);
            let cpInfo = U.calcCollisionPoint1(p, pB, nearestEdge.p1, nearestEdge.p2, this._r, e);

            if (cpInfo !== null) {
                // 辺と衝突した

                // 位置と方向を更新
                this.setBallPos(cpInfo.pRefB);
                this.setDir(cpInfo.vRefDir);

                // スピード更新
                let newSpeed = e * this.getSpeed();
                this.setSpeed(newSpeed);
                
                // 再度反射の判定を再帰的に行う
                // （反射しなくなるまで）
                let newV = U.vecSub(cpInfo.pRefB, cpInfo.pC);
                return this.update2Sub(newV, wallList);
            }
        }

        this._p = U.vecAdd(this._p, v);
    }
}

module.exports = {
    Ball
}
