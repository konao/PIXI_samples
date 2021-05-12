// *******************************************************
//  ユーティリティ関数群

const { DEG_TO_RAD } = require("pixi.js");

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
const vecNormalize = (v) => {
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
        let d = vecLen(v);   // 移動距離
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

// calcLinesDist用の補助関数．
// オブジェクトのdistメンバーの値が最小の要素を配列から検索する
//
// @param xs [i] 距離情報の配列 (=[x])
// 各要素(=x)は、targetとauxメンバを持つ．
// targetにセットされているオブジェクトのdistメンバの値を比較し、
// それが最小のxを返す．
// auxには任意のオブジェクトをセットできる．（=補助情報）
//
// @return distの最小値を含む要素．全要素のdistがnullの場合はnullが返る
//
// @example
// getMinDist([
//     {
//         target: {dist: 3},
//         aux: 'A'
//     },
//     {
//         target: {dist: null},
//         aux: 'B'
//     },
//     {
//         target: {dist: 2},
//         aux: 'C'
//     }
// ]);
// --> {
//     target: {dist: 2},
//     aux: 'C'
// }
//
// getMinDist([
//     {
//         target: {dist: null},
//         aux: 'A'
//     }
// ]);
// ---> null
const getMinDist = (xs) => {
    let result = xs.reduce((prev, curr) => {
        if (!curr.target.insideSegment) {
            return prev;
        } else if ((prev === null) || (curr.target.dist < prev.target.dist)) {
            return curr;
        } else {
            return prev;
        }
    }, null);
    return result;
}

// 2つの線分間の最短距離を求める．
// 後続の計算に必要な補助情報も返す．
//
// @param pA [i] 線分gの端点1
// @param pB [i] 線分gの端点2
// @param pX [i] 線分lの端点1
// @param pY [i] 線分lの端点2
// @param r [i] ボールの半径
//
// @return 距離情報（フォーマットは以下）
// {
//    dmin : number, // 最短距離
//    (1) dmin>0:lとgは交差しない
//    (2) dmin==0:lとgは交差する
//    (3) dmin==null:lとgは接触しない
//    注）(1)(2)は共に直線mが線分lに交わる場合．ただし(1)は線分mが線分lに交わるが、(2)は交わらない場合
//        (3)は直線mが線分lに交わらない場合．
//
//    pTangentCenter : Vec  // ボールがlと接触する時の中心座標(dmin >= 0のときのみ意味あり)
//    pMin: Vec  // 最短距離を与える点 (dmin>0のとき：pA, pB, pX, pYのいずれか)
//               // lとgの交点(dmin==0のとき)
//    (for debug)
// }
const calcLinesDist = (pA, pB, pX, pY, r) => {
    // lの方向ベクトル
    let v =  vecSub(pY, pX);

    // lの垂線のベクトル
    let u = {
        x: v.y,
        y: -v.x
    }

    // pAからlへの垂線の足を計算 --> pA_l
    let pA_l = calcDist_PointToLine(pA, u, pX, pY);

    // pBからmへの垂線の足を計算 --> pB_l
    let pB_l = calcDist_PointToLine(pB, u, pX, pY);

    // pXを通ってlに垂直な直線とgの交点への距離 --> pX_g
    let pX_g = calcDist_PointToLine(pX, u, pA, pB);

    // pYを通ってlに垂直な直線とgの交点への距離 --> pY_g
    let pY_g = calcDist_PointToLine(pY, u, pA, pB);
    
    if ((pX_g !== null) && (pY_g !== null)) {
        // 直線mと直線lが垂直に交わっていない場合

        if (pA_l.a * pB_l.a > 0) {
            // console.log('[1] pA and pB are in same side');
            // pAとpBはlの同じ側にある
            // ---> gとlは交差しない(dmin>0)        
        } else {
            // console.log('[2] pA and pB are in other side');
            // pAとpBはlの反対側にある
            // ---> gとlは交差する
    
            // gとlの交点を求める --> pC
            let pC = calcDist_PointToLine(pA, vecSub(pB, pA), pX, pY);
    
            if ((pC.b >= 0) && (pC.b <= 1.0)) {
                // pCがl上にある --> dmin=0
                // console.log('[2-1] cross point is on XY');
    
                // pTCを求める
                let b = pA_l.dist;
                let k = r/b;
                // console.log(`[0] b=${b}, k=${k}`);
                let pTC = vecAdd(pA, vecScalar(vecSub(pC.pF, pA), (1-k)));
                // let pTC = pA;

                // pTCからpQを求め、それが線分lにあるかチェックする
                pQ = calcDist_PointToLine(pTC, u, pX, pY);
                if (!pQ.insideSegment) {
                    // QはXY上にない
                    pTC = null;
                }

                console.log(`[1] b=${b}, k=${k}, pQ.b=${pQ.b}`);
                // console.log(`[1] b=${b}, k=${k}`);
                return {
                    dmin: 0,
                    pTangentCenter: pTC,
                    pMin: pC.pF
                };
            } else {
                // console.log('[2-1] cross point is outside of XY');
                // ない --> pA, pBからlへの垂線の距離と、pX, pYからgへの直線の交点までの距離（計4つ）
                // のうちの、最も小さい値をdminとする．
            }
        }
    
        // pA_l.dist, pB_l.dist, pX_g.dist, pY_g.distのうちで、最も小さい値を最短距離とする．
        let minElem = getMinDist([{
            target: pA_l,
            aux: pA
        }, {
            target: pB_l,
            aux: pB
        }, {
            target: pX_g,
            aux: pX
        }, {
            target: pY_g,
            aux: pY
        }]);
    
        if (minElem === null) {
            return {
                dmin: null,
                pTangentCenter: null,
                pMin: null
            }
        } else {
            // pTCを求める 
            // （pTCは線分lに半径rで接する円の中心座標）
            let pTC = null;
    
            if (minElem.target.dist < r) {
                // lへの最短距離がrより小さい = ボールがlに接触する
                let a = minElem.target.dist;
                let b = pA_l.dist;
                if (minElem.aux === pB) {
                    let k = (r-a)/(b-a);
                    pTC = vecAdd(pA, vecScalar(vecSub(pB, pA), (1-k)));
                    
                    pQ = calcDist_PointToLine(pTC, u, pX, pY);
                    console.log(`[2-1] a=${a}, b=${b}, k=${k}, pQ.b=${pQ.b}`);
                    if (!pQ.insideSegment) {
                        // QはXY上にない
                        pTC = null;
                    }
                } else if ((minElem.aux === pX) || (minElem.aux === pY)) {
                    if ((minElem.target.b >= 0) && (minElem.target.b <= 1)) {
                        // XgまたはYgが線分g上にある場合のみpTCを求める
                        let k = (r-a)/(b-a);
                        pTC = vecAdd(pA, vecScalar(vecSub(minElem.target.pF, pA), (1-k)));
                        // さらにpTCからQを求め、Qが線分l上にあるかもチェックする
                        // （Qが線分lになければボールは線分lには接触しない）
                        pQ = calcDist_PointToLine(pTC, u, pX, pY);
                        console.log(`[2-2] a=${a}, b=${b}, k=${k}, pQ.b=${pQ.b}`);
                        if (!pQ.insideSegment) {
                            // QはXY上にない
                            pTC = null;
                        }

                        if (pTC === null) {
                            let pC = null;
                            let dmin = -1;
                            // ボールがpX, pYに接するのではなくぶつかる場合があるかチェック
                            // ぶつかる場合は、pAからの距離が短いほうをpCとする．
                            let pCX = calcPoint_CircCenterOnEdge(pA, pB, pX, r);
                            if (pCX !== null) {
                                dmin = vecDist(pA, pCX);
                                pC = pCX;
                            }
                            let pCY = calcPoint_CircCenterOnEdge(pA, pB, pY, r);
                            if (pCY !== null) {
                                dmin2 = vecDist(pA, pCY);
                                if (dmin2 < dmin) {
                                    dmin = dmin2;
                                    pC = pCY;
                                }
                            }
                            
                            if (pC !== null) {
                                pTC = pC;
                            }
                        }
                    }
                }
            }
            
    
            return {
                dmin: (pTC !== null) ? minElem.target.dist : null,
                pTangentCenter: pTC,
                pMin: minElem.aux
            }
        }    
    } else {
        // 直線mと直線lが垂直に交わっている場合

        // pA_l, pB_lのうち、distが小さいほうをdminとする．
        let minElem = getMinDist([{
            target: pA_l,
            aux: pA
        }, {
            target: pB_l,
            aux: pB
        }]);

        if (minElem === null) {
            return {
                dmin: null,
                pTangentCenter: null,
                pMin: null
            }
        } else {
            // pTCを求める 
            let pTC = null;
    
            // if (minElem.target.dist < r) {
            //     // lへの最短距離がrより小さい = ボールがlに接触する
            //     let a = minElem.target.dist;
            //     let b = pA_l.dist;
            //     if (minElem.aux === pB) {
            //         let k = (r-a)/(b-a);
            //         console.log(`[1] a=${a}, b=${b}, k=${k}`);
            //         pTC = vecAdd(pA, vecScalar(vecSub(pB, pA), (1-k)));
            //     } else if ((minElem.aux === pX) || (minElem.aux === pY)) {
            //         if (minElem.target.b > 0) {
            //             // XgまたはYgが線分g上にある場合のみpTCを求める
            //             let k = (r-a)/(b-a);
            //             console.log(`[2] a=${a}, b=${b}, k=${k}`);
            //             pTC = vecAdd(pA, vecScalar(vecSub(minElem.target.pF, pA), (1-k)));
            //         }
            //     }
            // }
            console.log(`[3]`);
    
            return {
                dmin: (pTC !== null) ? minElem.target.dist : null,
                pTangentCenter: pTC,
                pMin: minElem.aux
            }
        }
    }
}

// pXが中心で半径rの円が、線分g(pA-->pB)上で交わる点を返す（2点あるが、pAに近い方）
const calcPoint_CircCenterOnEdge = (pA, pB, pX, r) => {
    let nv = vecNormalize(vecSub(pB, pA)); // pA --> pBの単位ベクトル
    // nvに直交するベクトル
    let nu = {
        x: nv.y,
        y: -nv.x
    }

    // pXから線分gへの垂線の足(pX_g)を求める
    let pX_g = calcDist_PointToLine(pX, nu, pA, pB);
    if ((pX_g !== null) && (pX_g.insideSegment)) {
        let d = pX_g.dist;  // pXからpX_gまでの距離
        if (r > d) {
            let k = Math.sqrt(r*r-d*d);
            // pC=求める円の中心
            let pC = vecAdd(pX_g.pF, vecScalar(nv, -k));

            // pCが線分g上にあるか確認
            // (pA-->pC方向のベクトルとpA-->pC方向のベクトルが同じ方向を向いていればOK)
            let vAC = vecNormalize(vecSub(pC, pA));
            if (vecInnerProd(nv, vAC) > 0) {
                // pCは線分g上にある
                return pC;
            }
        }
    }

    return null;
}

// pを通って方向ベクトルuの直線mと線分l(pX-->pX)の交点pFを求め、
// pからpFまでの距離他の情報を返す
//
// @param p [i] 基準点
// @param u [i] mの方向ベクトル
// @param pX [i] lの端点1
// @param pY [i] lの端点2
//
// @return 距離情報
// {
//    pF: {x, y},   // mとlの交点
//    dist: number,  // pからlへの距離(>=0)
//    insideSegment: boolean,   // true=pFが線分l上にある, false=ない
//    a: number,    // pFにおける線分mのパラメータ
//    b: number     // pFにおける線分lのパラメータ
// }
const calcDist_PointToLine = (p, u, pX, pY) => {
    let v = vecSub(pY, pX);    // pX --> pYへのベクトル

    let M11 = u.x;
    let M21 = u.y;
    let M12 = -v.x;
    let M22 = -v.y;

    let D = M11*M22-M21*M12;    // Determinant
    if (D === 0) {
        // mとkが平行（ここには来ないはず）
        return null;
    } else {
        // Mの逆行列-->iM (inverse of M)
        let iM11 = M22 / D;
        let iM21 = -M21 / D;
        let iM12 = -M12 / D;
        let iM22 = M11 / D;

        let a = iM11*(pX.x-p.x) + iM12*(pX.y-p.y);
        let b = iM21*(pX.x-p.x) + iM22*(pX.y-p.y);

        let pF = vecAdd(p, vecScalar(u, a));
        let dist = vecDist(p, pF);    // pからpF(垂線の足)までの距離

        // Fが線分m上にあるか？
        let insideSegment = ((0 <= b) && (b <= 1)) ? true : false;

        return {
            dist: dist,
            pF: pF,
            insideSegment: insideSegment,
            a: a,
            b: b
        };
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
    vecLen,
    vecDist,
    vecNormalize,
    vecRotate,
    getNearestPos,
    getCrossPoint,
    reflect,
    getMinDist,
    calcLinesDist,
    calcDist_PointToLine
}