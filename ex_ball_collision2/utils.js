// *******************************************************
//  ユーティリティ関数群
// *******************************************************
const EPSILON = 1e-7;

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
// 直交ベクトル
//
// @param v {x, y} [i] ベクトル
//
// @return vに直交するベクトルを返す
// -----------------------------------------------
const vecCross = (v) => {
    return {
        x: v.y,
        y: -v.x
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
const vecLen = (v) => {
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

// -----------------------------------------------
// 2点間の距離を返す
//
// @param v1 {x, y} [i] ベクトル1
// @param v2 {x, y} [i] ベクトル2
//
// @retutrn v1とv2の距離
// -----------------------------------------------
const vecDist = (v1, v2) => {
    return vecLen(vecSub(v1, v2));
}

// -----------------------------------------------
// 正規化する
//
// @param v {x, y} [i] ベクトル
//
// @return vを正規化したベクトル（長さ=1）
// もともとゼロベクトルだった場合はそのままゼロベクトルを返す
// -----------------------------------------------
const vecNorm = (v) => {
    const len = vecLen(v);
    if (len > 0) {
        return {
            x: v.x/len,
            y: v.y/len
        };
    } else {
        return v;
    }
}

// -----------------------------------------------
// ベクトルを回転させる
//
// @param v {x, y} [i] ベクトル
// @param deg [i] 回転角（時計回り）
//
// @return vを角度deg回転させたベクトル
// -----------------------------------------------
const vecRotate = (v, deg) => {
    const theta = Math.PI * deg / 360;
    return {
        x: Math.cos(theta)*v.x + Math.sin(theta)*v.y,
        y: -Math.sin(theta)*v.x + Math.cos(theta)*v.y
    };
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
            let dist = vecLen(vecSub(cp, p));

            // qv = q1-->q2方向の単位ベクトル
            let qv = vecNorm(vecSub(q2, q1));

            // ip = vとqvの内積
            let ip = vecInnerProd(v, qv);

            // qv2 = vのqv方向への正射影ベクトル
            let qv2 = vecScalar(qv, ip);

            // refv = vがcpで反射したときの方向ベクトル
            let refv = vecNorm(vecSub(vecScalar(qv2, 2), v));

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
// 反射した場合、pはボールの反射点になる．この時、v>0なら、再度反射の可能性があるので、
// 画面に存在する他の壁との衝突判定が必要．
// （bReflect=falseになるまで再帰的にreflectを呼ぶ必要がある）
// --------------------------------------------------------------
const reflect = (p, v, r, q1, q2) => {
    let pB = vecAdd(p, v);
    let cpInfo = calcCollisionPoint(p, pB, q1, q2, r);

    if ((cpInfo !== null) && (cpInfo.pC !== null)) {
        let newP = cpInfo.pRefB;
        let newV = vecSub(newP, cpInfo.pC);
        return {
            p: newP,
            v: newV,
            bReflect: true
        };
    } else {
        return {
            p: pB,
            v: v,
            bReflect: false
        };
    }
}

// calcContactPoint用の補助関数．
// オブジェクトのdistメンバーの値が最小の要素を配列から検索する
//
// @param xs [i] 距離情報の配列 (=[x])
// @param isValid [i] 要素が「有効」か判定する関数
// @param cmp [i] 要素の大小を比較する関数
// @return 最終的に選ばれた要素．条件を満たす要素が一つもない場合はnullが返る．
//
// isValid(x)
// @param x [i]
// @return true(=xは有効な比較対象), false(=xは比較対象ではない)
//
// cmp(x, y)
// @param x [i] 比較対象
// @param y [i] 被比較対象
// @return true(=xでyを置き換える), false(=置き換えない)
const getMinElem = (xs, isValid, cmp) => {
    let result = xs.reduce((prev, curr) => {
        if (!isValid(curr)) {
            return prev;
        } else if ((prev === null) || cmp(curr, prev)) {
            return curr;
        } else {
            return prev;
        }
    }, null);
    return result;
}

// pAからpBに移動する半径rのボールが、線分m(pX-->pY)に衝突する点を計算する
//
// @param pA [i] ボールの始点(線分gの端点1)
// @param pB [i] ボールの終点(線分gの端点2)
// @param pX [i] 線分mの端点1
// @param pY [i] 線分mの端点2
// @param r [i] ボールの半径
//
// @return 距離情報（フォーマットは以下）
// {
//    pC : Vec  // ボールが線分mと衝突する時の円の中心座標(衝突しない場合はnull）
//    pCm : Vec // ボールが線分mと衝突する点(線分m上の点)
//    pRefB: Vec // ボールがpCで反射した場合の到達点(=更新後のpB)
// }
const calcCollisionPoint = (pA, pB, pX, pY, r) => {
    let dist_pA_m = calcDist_PointToSeg(pA, pX, pY);
    if (dist_pA_m <= r) {
        // pAと線分mの距離がボールの半径以下
        // --> 衝突判定はしない
        // （何かの拍子で線分mから距離rの領域内にボールが入り込んでしまうと、
        // 内側の壁に反射されて、領域から出ていかなくなってしまう．
        // この現象を回避するために追加）
        return {
            pC: null,
            pCm: null,
            pRefB: null
        };
    }

    let cps = [];

    // (1) pX, pY中心で半径rの円と、線分lの交点（のうち、pAに近い方）を求める
    let pX_C = calcPoint_CircCenterOnEdge(pA, pB, pX, r);
    if (pX_C !== null) {
        cps.push({
            pC: pX_C.pC,
            pCm: pX,
            dist: vecDist(pA, pX_C.pC),
            vRefLine: vecCross(vecNorm(vecSub(pX, pX_C.pC)))
        });
    }

    let pY_C = calcPoint_CircCenterOnEdge(pA, pB, pY, r);
    if (pY_C !== null) {
        cps.push({
            pC: pY_C.pC,
            pCm: pY,
            dist: vecDist(pA, pY_C.pC),
            vRefLine: vecCross(vecNorm(vecSub(pY, pY_C.pC)))
        });
    }

    // (2) 線分mに平行で、距離r離れている線分(線分m1, m2)と線分lの交点(2点)を求める
    let nu = vecNorm(vecSub(pY, pX));    // pX-->pY方向の単位ベクトル
    let pnu1 = vecCross(nu);   // uに直交するベクトル
    let pu1 = vecScalar(pnu1, r);   // pnu1方向の長さrのベクトル
    let pnu2 = vecScalar(pnu1, -1);   // pnu1の反対方向
    let pu2 = vecScalar(pnu2, r);   // pnu2方向の長さrのベクトル

    // pX1-->pY1（線分m1）
    let pX1 = vecAdd(pX, pu1);
    let pY1 = vecAdd(pY, pu1);
    // pX2-->pY2（線分m2）
    let pX2 = vecAdd(pX, pu2);
    let pY2 = vecAdd(pY, pu2);

    let v = vecSub(pB, pA);

    let pA_m1 = calcDist_PointToLine(pA, v, pX1, pY1);
    if ((pA_m1 !== null) && (pA_m1.on_sAB) && (pA_m1.on_sXY)) {
        cps.push({
            pC: pA_m1.pF,   // 衝突した時のボールの中心
            pCm: vecAdd(pA_m1.pF, vecScalar(pu1, -1)),  // 衝突点(線分m1上)
            dist: vecDist(pA, pA_m1.pF),    // pAとボールの中心間の距離
            vRefLine: nu // ボールが反射する直線の方向ベクトル
        });
    }

    let pA_m2 = calcDist_PointToLine(pA, v, pX2, pY2);
    if ((pA_m2 !== null) && (pA_m2.on_sAB) && (pA_m2.on_sXY)) {
        cps.push({
            pC: pA_m2.pF,
            pCm: vecAdd(pA_m2.pF, vecScalar(pu2, -1)),
            dist: vecDist(pA, pA_m2.pF),
            vRefLine: nu
        });
    }

    // (3) cpsに含まれる点の内、pAに最も近い点が、ボールと線分mの衝突点
    let minCp = getMinElem(
        cps,
        (x) => { return true },
        (x, y) => { return (x.dist < y.dist )}
    );

    if (minCp !== null) {
        // 衝突点があった

        // pRefBを計算する
        let CB = vecSub(pB, minCp.pC);
        let CH = vecScalar(minCp.vRefLine, vecInnerProd(CB, minCp.vRefLine));
        let pRefB = vecAdd(pB, vecScalar(vecSub(CH, CB), 2));

        return {
            pC: minCp.pC,
            pCm: minCp.pCm,
            pRefB: pRefB
        };
    } else {
        // 衝突点はなかった
        return {
            pC: null,
            pCm: null,
            pRefB: null
        };
    }
}

// pを通って方向ベクトルvの直線lと線分m(pX-->pY)の交点pFを求める．
// pからpFまでの距離他の情報を返す．
// lとmが平行の場合はnullを返す．
//
// @param p [i] 基準点
// @param v [i] lの方向ベクトル
// @param pX [i] 線分mの端点1
// @param pY [i] 線分mの端点2
//
// @return 距離情報
// {
//    pF: {x, y},   // lとmの交点
//    dist: number,  // pからpFまでの距離(>=0)
//    insideSegment: boolean,   // true=pFが線分m上にある, false=ない
//    on_sAB: boolean  // true=pFが線分AB上にある, false=ない
//    on_sXY: boolean  // true=pFが線分XY上にある, false=ない
//    a: number,    // pFにおける線分lのパラメータ
//    b: number     // pFにおける線分mのパラメータ
// }
const calcDist_PointToLine = (p, v, pX, pY) => {
    let u = vecSub(pY, pX);    // pX --> pYへのベクトル

    let M11 = v.x;
    let M21 = v.y;
    let M12 = -u.x;
    let M22 = -u.y;

    let D = M11*M22-M21*M12;    // Determinant
    if (D === 0) {
        // lとmが平行
        return null;
    } else {
        // Mの逆行列-->iM (inverse of M)
        let iM11 = M22 / D;
        let iM21 = -M21 / D;
        let iM12 = -M12 / D;
        let iM22 = M11 / D;

        let a = iM11*(pX.x-p.x) + iM12*(pX.y-p.y);
        let b = iM21*(pX.x-p.x) + iM22*(pX.y-p.y);

        let pF = vecAdd(p, vecScalar(v, a));
        let dist = vecDist(p, pF);    // pからpF(垂線の足)までの距離

        // Fが線分m上にあるか？
        let insideSegment = ((0 <= b) && (b <= 1)) ? true : false;

        let on_sAB = ((0 <= a) && (a <= 1)) ? true : false;
        let on_sXY = ((0 <= b) && (b <= 1)) ? true : false;

        return {
            dist: dist,
            pF: pF,
            insideSegment: insideSegment,
            a: a,
            b: b,
            on_sAB: on_sAB,
            on_sXY: on_sXY
        };
    }
}

// pから線分m(pX-->pY)までの距離を計算する
//
// @param p [i] 基準点
// @param pX [i] 線分mの端点1
// @param pY [i] 線分mの端点2
//
// @return pから線分mまでの距離
const calcDist_PointToSeg = (p, pX, pY) => {
    let nu = vecNorm(vecSub(pY, pX));    // pX --> pYへの単位ベクトル
    let pnu = vecCross(nu);

    // pを通って線分mに直交する直線と線分mの交点を求める
    let pH = calcDist_PointToLine(p, pnu, pX, pY);

    if ((pH !== null) && (pH.on_sXY)) {
        // 交点が線分m上にある --> pから交点までの距離
        return pH.dist;
    } else {
        // 交点が線分m上にない --> pからXまたはYの距離のうち、短いほうを求める
        dist_X = vecDist(p, pX);
        dist_Y = vecDist(p, pY);
        return (dist_X < dist_Y) ? dist_X : dist_Y;
    }
}

// 線分AB上の半径rの円が、pXで衝突するか調べる．
// 衝突する場合は、円の中心座標pCと、pAからpCまでの距離を返す．
//
// ＜アルゴリズム＞
// pXが中心で半径rの円が、線分g(pA-->pB)上で交わる点(pC)があるかで判断する．
// （pCは2点求まるが、pAに近い方を採用）
//
// @return {
//      pC: {x, y}, // 円の中心（pCを中心とした半径rの円が、pXで衝突する）
//      dAC: numeric   // pAとpCの距離
// }
// pCが線分g上に存在しない場合はnullを返す
const calcPoint_CircCenterOnEdge = (pA, pB, pX, r) => {
    let nv = vecNorm(vecSub(pB, pA)); // pA --> pBの単位ベクトル

    // nvに直交するベクトル
    let nu = vecCross(nv);

    // pXから線分gへの垂線の足(pX_g)を求める
    let pX_g = calcDist_PointToLine(pX, nu, pA, pB);
    if (pX_g !== null) {
        let d = pX_g.dist;  // pXからpX_gまでの距離
        if (r > d) {
            let k = Math.sqrt(r*r-d*d);
            // pC=求める円の中心
            let pC = vecAdd(pX_g.pF, vecScalar(nv, -k));

            // pCが線分g上にあるか確認
            // (pA-->pC方向のベクトルとpA-->pB方向のベクトルが同じ方向を向いていればOK)
            let vAC = vecSub(pC, pA);
            let lenAC = vecLen(vAC);
            let lenAB = vecDist(pA, pB);
            if ((vecInnerProd(nv, vAC) > 0) && (lenAC <= lenAB)) {
                // pCは線分g上にある
                // --> pCを中心とした半径rの円が、pXで衝突する．
                return {
                    pC: pC,
                    dAC: lenAC
                }
            }
        }
    }

    // 線分AB上の半径rの円が、pXで衝突することはない
    return null;
}

module.exports = {
    randDouble,
    randInt,
    isFracZero,
    isEqual,
    d2r,
    vecAdd,
    vecSub,
    vecCross,
    vecScalar,
    vecInnerProd,
    vecLen,
    vecDist,
    vecNorm,
    vecRotate,
    getNearestPos,
    getCrossPoint,
    reflect,
    getMinElem,
    calcCollisionPoint,
    calcDist_PointToLine
}