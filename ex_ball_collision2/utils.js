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
// 反射した場合、p2はボールの反射点になる．この時、v2>0なら、再度反射の可能性があるので、
// 画面に存在する他の壁との衝突判定が必要．
// （bReflect=falseになるまで再帰的にreflectを呼ぶ必要がある）
// --------------------------------------------------------------
const reflect = (p, v, r, q1, q2) => {
    // 方向ベクトルを正規化
    const nv = vecNorm(v);

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
const getMinDist_old = (xs) => {
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

// @param isValid [i] 要素が「有効」か判定する関数
// @param cmp [i] 要素の大小を比較する関数
// @return 最終的に選ばれた要素
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

// 2つの線分間の最短距離を求める．
// 後続の計算に必要な補助情報も返す．
//
// @param pA [i] 線分gの端点1
// @param pB [i] 線分gの端点2
// @param pX [i] 線分mの端点1
// @param pY [i] 線分mの端点2
// @param r [i] ボールの半径
//
// @return 距離情報（フォーマットは以下）
// {
//    dmin : number, // 最短距離
//    (1) dmin>0:gとmは交差しない
//    (2) dmin==0:gとmは交差する
//    (3) dmin==null:gとmは接触しない
//    注）(1)(2)は共に直線gが線分mに交わる場合．ただし(1)は線分gが線分mに交わるが、(2)は交わらない場合
//        (3)は直線gが線分mに交わらない場合．
//
//    pTangentCenter : Vec  // ボールがmと接触する時の中心座標(dmin>=0のときのみ意味あり)
//    pMin: Vec  // 最短距離を与える点 (dmin>0のとき：pA, pB, pX, pYのいずれか)
//               // gとmの交点(dmin==0のとき)
// }
const calcLinesDist = (pA, pB, pX, pY, r) => {
    // mの方向ベクトル
    let u =  vecSub(pY, pX);

    // mの垂線のベクトル
    let pu = {
        x: u.y,
        y: -u.x
    }

    // pAからmへの垂線の足を計算 --> pA_m
    let pA_m = calcDist_PointToLine(pA, pu, pX, pY);

    // pBからmへの垂線の足を計算 --> pB_m
    let pB_m = calcDist_PointToLine(pB, pu, pX, pY);

    // pXを通ってmに垂直な直線とgの交点への距離 --> pX_g
    let pX_g = calcDist_PointToLine(pX, pu, pA, pB);

    // pYを通ってmに垂直な直線とgの交点への距離 --> pY_g
    let pY_g = calcDist_PointToLine(pY, pu, pA, pB);
    
    if ((pX_g !== null) && (pY_g !== null)) {
        // 直線mと直線lが垂直に交わっていない場合

        if (pA_m.a * pB_m.a > 0) {
            // console.log('[1] pA and pB are in same side');
            // pAとpBはmの同じ側にある
            // ---> gとmは交差しない(dmin>0)        
        } else {
            // console.log('[2] pA and pB are in other side');
            // pAとpBはmの反対側にある
            // ---> gとmは交差する
    
            // gとmの交点を求める --> pC
            let pC = calcDist_PointToLine(pA, vecSub(pB, pA), pX, pY);
    
            if (pC.insideSegment) {
                // pCがm上にある --> dmin=0
                // console.log('[2-1] cross point is on XY');
    
                // pTCを求める
                let b = pA_m.dist;
                let k = r/b;
                // console.log(`[0] b=${b}, k=${k}`);
                let pTC = vecAdd(pA, vecScalar(vecSub(pC.pF, pA), (1-k)));
                // let pTC = pA;

                // pTCからpQを求め、それが線分m上にあるかチェックする
                pQ = calcDist_PointToLine(pTC, pu, pX, pY);
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
                // ない --> pA, pBからmへの垂線の距離と、pX, pYからgへの直線の交点までの距離（計4つ）
                // のうちの、最も小さい値をdminとする．
            }
        }
    
        // pA_m.dist, pB_m.dist, pX_g.dist, pY_g.distのうちで、最も小さい値を最短距離とする．
        let distArray = [
            {
                dist: pA_m.dist,
                insideSegment: pA_m.insideSegment,
                pOnAB: pA,
                pMin: pA
            },
            {
                dist: pB_m.dist,
                insideSegment: pB_m.insideSegment,
                pOnAB: pB,
                pMin: pB
            },
            {
                dist: pX_g.dist,
                insideSegment: pX_g.insideSegment,
                pOnAB: pX_g.pF,
                pMin: pX                
            },
            {
                dist: pY_g.dist,
                insideSegment: pY_g.insideSegment,
                pOnAB: pY_g.pF,
                pMin: pY
            }
        ]
        let minElem = getMinElem(
            distArray,
            (x) => { return x.insideSegment; },
            (x, y) => { return (x.dist < y.dist) }
        );
    
        if (minElem === null) {
            return {
                dmin: null,
                pTangentCenter: null,
                pMin: null
            }
        } else {
            // pTCを求める 
            // （pTCは線分mに半径rで接する円の中心座標）
            let pTC = null;

            if (minElem.pOnAB === pA) {
                return {
                    dmin: null,
                    pTangentCenter: null,
                    pMin: null
                }
            }
    
            if (minElem.dist < r) {
                // mへの最短距離がrより小さい = ボールがmに接触する
                let a = minElem.dist;
                let b = pA_m.dist;

                let k = (r-a)/(b-a);
                pTC = vecAdd(pA, vecScalar(vecSub(minElem.pOnAB, pA), (1-k)));
                
                pQ = calcDist_PointToLine(pTC, pu, pX, pY);
                // console.log(`[2-1] a=${a}, b=${b}, k=${k}, pQ.b=${pQ.b}`);
                if (!pQ.insideSegment) {
                    // QはXY上にない
                    pTC = null;
                }

                // ボールがpX, pYに接するのではなくぶつかる場合があるかチェック
                // ぶつかる場合は、pAからの距離が短いほうをpCCとする．
                let pCC = getMinElem(
                    [
                        calcPoint_CircCenterOnEdge(pA, pB, pX, r), 
                        calcPoint_CircCenterOnEdge(pA, pB, pY, r)
                    ],
                    (x) => { return (x != null) },
                    (x, y) => { return (x.dAC < y.dAC )}
                )

                if ((pTC !== null) && (pCC !== null)) {
                    if (pCC.dAC < pQ.dist) {
                        pTC = pCC.pC;
                    }
                } else if (pCC !== null) {
                    pTC = pCC.pC;
                }
            }
    
            return {
                dmin: (pTC !== null) ? minElem.dist : null,
                pTangentCenter: pTC,
                pMin: minElem.pMin
            }
        }    
    } else {
        // 直線gと直線mが垂直に交わっている場合

        if (pA_m.a * pB_m.a > 0) {
            // console.log('[1] pA and pB are in same side');
            // pAとpBはmの同じ側にある
            // ---> gとmは交差しない(dmin>0)        
            if (pA_m.insideSegment) {
                // (2)
                console.log(`[p-2]`);
                // pA_m, pB_mのうち、distが小さいほうをdminとする．
                let minElem = getMinDist_old([{
                    target: pA_m,
                    aux: pA
                }, {
                    target: pB_m,
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
                    let pTC = vecAdd(pA_m.pF, vecScalar(vecNorm(vecSub(minElem.target.pF, pA_m.pF)), r));

                    // pTCが線分g上にあるかチェックする
                    // (pA-->pB方向のベクトルとpA-->pTC方向のベクトルが同じ方向を向いていて、
                    // かつvATCの長さがvABの長さ以下ならpTCは線分g上にある）
                    let vAB = vecSub(pB, pA);
                    let vATC = vecSub(pTC, pA);
                    let len_vAB = vecLen(vAB);
                    let len_vATC = vecLen(vATC);
                    if ((vecInnerProd(vAB, vATC) < 0) || (len_vATC > len_vAB)) {
                        // pTCは線分g上にない
                        pTC = null;
                    }

                    return {
                        dmin: (pTC !== null) ? minElem.target.dist : null,
                        pTangentCenter: pTC,
                        pMin: minElem.aux
                    }
                } 
            } else {
                // (4)
                console.log(`[p-4]`);
            }
        } else {
            // console.log('[2] pA and pB are in other side');
            // pAとpBはmの反対側にある
            // ---> gとmは交差する
            if (pA_m.insideSegment) {
                // (1)
                console.log(`[p-1]`);
                // 
                // pTCを求める
                let pTC = vecAdd(pA_m.pF, vecScalar(vecNorm(vecSub(pA, pA_m.pF)), r));

                // pTCが線分g上にあるかチェックする
                // (pA-->pB方向のベクトルとpA-->pTC方向のベクトルが同じ方向を向いていて、
                // かつvATCの長さがvABの長さ以下ならpTCは線分g上にある）
                let vAB = vecSub(pB, pA);
                let vATC = vecSub(pTC, pA);
                let len_vAB = vecLen(vAB);
                let len_vATC = vecLen(vATC);
                if ((vecInnerProd(vAB, vATC) < 0) || (len_vATC > len_vAB)) {
                    // pTCは線分g上にない
                    pTC = null;
                }

                return {
                    dmin: 0,
                    pTangentCenter: pTC,
                    pMin: pA_m.pF
                };
            } else {
                // (3)
                console.log(`[p-3]`);
            }
        }
    }
}

// pXが中心で半径rの円が、線分g(pA-->pB)上で交わる点(pC)に
// 関する情報を返す（pCは2点求まるが、pAに近い方）
// @return {
//      pC: {x, y},
//      dAC: numeric   // pAとpCの距離
// }
// pCが線分g上に存在しない場合はnullを返す
const calcPoint_CircCenterOnEdge = (pA, pB, pX, r) => {
    let nv = vecNorm(vecSub(pB, pA)); // pA --> pBの単位ベクトル
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
            // (pA-->pC方向のベクトルとpA-->pB方向のベクトルが同じ方向を向いていればOK)
            let vAC = vecSub(pC, pA);
            if (vecInnerProd(nv, vAC) > 0) {
                // pCは線分g上にある
                return {
                    pC: pC,
                    dAC: vecLen(vAC)
                }
            }
        }
    }

    return null;
}

// pを通って方向ベクトルvの直線lと線分m(pX-->pX)の交点pFを求め、
// pからpFまでの距離他の情報を返す
//
// @param p [i] 基準点
// @param v [i] lの方向ベクトル
// @param pX [i] mの端点1
// @param pY [i] mの端点2
//
// @return 距離情報
// {
//    pF: {x, y},   // lとmの交点
//    dist: number,  // pからmへの距離(>=0)
//    insideSegment: boolean,   // true=pFが線分m上にある, false=ない
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
    vecNorm,
    vecRotate,
    getNearestPos,
    getCrossPoint,
    reflect,
    getMinDist_old,
    getMinElem,
    calcLinesDist,
    calcDist_PointToLine
}