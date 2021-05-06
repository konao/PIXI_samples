// *******************************************************
//  ユーティリティ関数群
// *******************************************************
const EPSILON = 1e-5;

// =================================================
// 乱数生成
// =================================================

const randDouble = (x) => {
    return Math.random() * x;
}

const randInt = (x) => {
    return Math.trunc(Math.random() * x);
}

// =================================================
//  色々
// =================================================

// xが整数ならtrue．小数点部分があるならfalse
// eplisionで微妙な誤差でおかしくなることを防ぐ
//
// @param x {number}
const isFracZero = (x) => {
    return (Math.abs(x - Math.round(x)) < EPSILON);
}

// 実数として等しいか
const isEqual = (x, y) => {
    return (Math.abs(x-y) < EPSILON);
}

// 角度単位変換（度 --> ラジアン）
const d2r = (deg) => {
    return Math.PI * deg / 180.0;
}

// ========================================================
// ベクトル演算
// ========================================================

// -----------------------------------------------
// 加算
//
// @param v1 {x, y} [i] ベクトル1
// @param v2 {x, y} [i] ベクトル2
//
// @return v1+v2を返す
// -----------------------------------------------
const vecAdd = (v1, v2) => {
    return {
        x: v1.x+v2.x,
        y: v1.y+v2.y
    };
}

// -----------------------------------------------
// 減算
//
// @param v1 {x, y} [i] ベクトル1
// @param v2 {x, y} [i] ベクトル2
//
// @return v1-v2を返す
// -----------------------------------------------
const vecSub = (v1, v2) => {
    return {
        x: v1.x-v2.x,
        y: v1.y-v2.y
    };
}

// -----------------------------------------------
// スカラー倍
//
// @param v {x, y} [i] ベクトル
// @param k [i] 係数
//
// vをスカラー倍(k倍)したベクトルを返す
// -----------------------------------------------
const vecScalar = (v, k) => {
    return {
        x: v.x*k,
        y: v.y*k
    };
}

// -----------------------------------------------
// 内積
//
// @param v1 {x, y} [i] ベクトル1
// @param v2 {x, y} [i] ベクトル2
//
// @retutrn v1とv2の内積
// -----------------------------------------------
const vecInnerProd = (v1, v2) => {
    return v1.x*v2.x + v1.y*v2.y;
}

// -----------------------------------------------
// 長さを返す
//
// @param v {x, y} [i] ベクトル
//
// @return vの長さ
// -----------------------------------------------
const vecGetLen = (v) => {
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

// -----------------------------------------------
// 正規化する
//
// @param v {x, y} [i] ベクトル
//
// @return vを正規化したベクトル（長さ=1）
// もともとゼロベクトルだった場合はそのままゼロベクトルを返す
// -----------------------------------------------
const vecNormalize = (v) => {
    const len = vecGetLen(v);
    if (len > 0) {
        return {
            x: v.x/len,
            y: v.y/len
        };
    } else {
        return v;
    }
}

// --------------------------------------------------------------
// {x, y}とpListの最少距離と、その最少距離の点を返す
//
// @param {x, y} 対象点
// @param pList 点の集合(=[{x, y}])
//
// @return {minDist, nearestPt}
// minDist ... 最少距離．pListが空の場合は-1になる．
// nearestPt ... 最少距離を与える点．pListが空の場合はnullになる．
// --------------------------------------------------------------
const getNearestPos = ({x, y}, pList) => {
    let minDist2 = -1;  // 最少距離の二乗
    let nearestPt = null;   // 最近点

    let nps = pList.length;
    for (let i=0; i<nps; i++) {
        let p = pList[i];

        // 距離の2乗
        let dist2 = (x-p.x)*(x-p.x) + (y-p.y)*(y-p.y);

        if (minDist2 < 0) {
            // 最初
            minDist2 = dist2;
            nearestPt = p;
        }
        else if (dist2 < minDist2) {
            // より近い点を発見
            minDist2 = dist2;
            nearestPt = p;
        }
    }

    if (minDist2 < 0) {
        // 1個も点がなかった
        return { 
            minDist: -1,
            nearestPt: null 
        };
    } else {
        // 最近点が見つかった場合
        return { 
            minDist: Math.sqrt(minDist2), 
            nearestPt: nearestPt
        };
    }
}

// --------------------------------------------------------------
// ボールと壁の交点を求める
//
// @param p [i] ボールの位置
// @param v [i] ボール進行方向ベクトル（長さ1）
// pからv方向に伸びる直線（ボールの進行線）をLとする．
//
// @param q1 [i] 線分Wの端点1
// @param q2 [i] 線分Wの端点2
// q1とq2を結ぶ線分Wは壁を構成するものとする．
//
// @return {cp, dist, refv}
// cp : LとWの交点{x, y}
// dist: pからcpまでの距離
// refv: cpで反射したときの方向ベクトル（長さ1）
// 交差しない場合はnullが返る
// --------------------------------------------------------------
const getCrossPoint = (p, v, q1, q2) => {
    let M11 = v.x;
    let M21 = v.y;
    let M12 = q1.x - q2.x;
    let M22 = q1.y - q2.y;

    let D = M11*M22-M21*M12;    // Determinant
    if (D === 0) {
        // LとWは交差しない（平行）
        return null;
    } else {
        // LとWは交差する

        // Mの逆行列-->iM (inverse of M)
        let iM11 = M22 / D;
        let iM21 = -M21 / D;
        let iM12 = -M12 / D;
        let iM22 = M11 / D;

        // チェック
        // M * iM = I (単位行列)となるはず
        // let I11 = M11*iM11 + M12*iM21;
        // let I21 = M21*iM11 + M22*iM21;
        // let I12 = M11*iM12 + M12*iM22;
        // let I22 = M21*iM12 + M22*iM22;

        // console.log(`D=${D}`);
        // console.log(`[${I11} ${I12}]`);
        // console.log(`[${I21} ${I22}]`);
        // console.log('');

        // 交点までの係数t, sを計算
        let t = iM11*(q1.x-p.x) + iM12*(q1.y-p.y);
        let s = iM21*(q1.x-p.x) + iM22*(q1.y-p.y);

        if ((s >= 0) && (s <= 1.0) && (t > 0)) {
            // 線分q1, q2内、かつvの正方向で交差している
            // 交点cpを計算
            let cp = vecAdd(p, vecScalar(v, t));

            // pからcpまでの距離
            let dist = vecGetLen(vecSub(cp, p));

            // qv = q1-->q2方向の単位ベクトル
            let qv = vecNormalize(vecSub(q2, q1));

            // ip = vとqvの内積
            let ip = vecInnerProd(v, qv);

            // qv2 = vのqv方向への正射影ベクトル
            let qv2 = vecScalar(qv, ip);

            // refv = vがcpで反射したときの方向ベクトル
            let refv = vecNormalize(vecSub(vecScalar(qv2, 2), v));

            return {
                cp: cp,
                dist: dist,
                refv: refv
            };
        } else {
            return null;
        }
    }
}

// --------------------------------------------------------------
// ボールの位置、方向ベクトルと壁の線分から、
// ボールの更新された位置と方向ベクトルを返す．
// 壁に衝突したときは反射させる．
//
// @param p [i] ボールの位置
// @param v [i] ボール進行方向ベクトル（長さ1でなくてよい）
// @param r [i] ボールの半径
// pからv方向に伸びる直線（ボールの進行線）をLとする．
//
// @param q1 [i] 線分Wの端点1
// @param q2 [i] 線分Wの端点2
// q1とq2を結ぶ線分Wは壁を構成するものとする．
//
// @return {p, v, bRefrect}
// p : ボールの新しい位置
// v : ボールの新しい方向ベクトル
// bRefrect : true=ボールは壁に衝突した（反射した）
// 反射した場合、p2はボールの反射点になる．この時、v2>0なら、再度反射の可能性があるので、
// 画面に存在する他の壁との衝突判定が必要．
// （bReflect=falseになるまで再帰的にreflectを呼ぶ必要がある）
// --------------------------------------------------------------
const reflect = (p, v, r, q1, q2) => {
    // 方向ベクトルを正規化
    const nv = vecNormalize(v);

    // LとWの交点を求める
    let cpInfo = getCrossPoint(p, nv, q1, q2);
    if (cpInfo === null) {
        // 交点なし
        // pをv方向へ進める
        let p2 = vecAdd(p, v);
        return {
            p: p2,
            v: v,
            bReflect: false
        }
    } else {
        // 交点あり
        let d = vecGetLen(v);   // 移動距離
        let dist = cpInfo.dist; // pからLとWの交点までの距離
        if (dist-d > r) {
            // 衝突していない
            let p2 = vecAdd(p, v);
            return {
                p: p2,
                v: v,
                bReflect: false
            }    
        } else {
            // 衝突した
            // pを更新
            let cp = cpInfo.cp; // 交点
            let refp = vecAdd(p, vecAdd(vecSub(cp, p), vecScalar(nv, -r))); // 反射点
            let d2 = d-dist+r;
            let refv = vecScalar(cpInfo.refv, d2); // 反射後の方向ベクトル
            return {
                p: refp,
                v: refv,
                bReflect: true
            };
        }
    }
}

module.exports = {
    randDouble,
    randInt,
    isFracZero,
    isEqual,
    d2r,
    vecAdd,
    vecSub,
    vecScalar,
    vecInnerProd,
    vecGetLen,
    vecNormalize,
    getNearestPos,
    getCrossPoint,
    reflect
}