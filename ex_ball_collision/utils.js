const EPSILON = 1e-5;

const randDouble = (x) => {
    return Math.random() * x;
}

const randInt = (x) => {
    return Math.trunc(Math.random() * x);
}

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

const d2r = (deg) => {
    return Math.PI * deg / 180.0;
}

// {x, y}とpListの最少距離と、その最少距離の点を返す
//
// @param {x, y} 対象点
// @param pList 点の集合(=[{x, y}])
//
// @return {minDist, nearestPt}
// minDist ... 最少距離．pListが空の場合は-1になる．
// nearestPt ... 最少距離を与える点．pListが空の場合はnullになる．
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

// @param p [i] ボールの位置
// @param v [i] ボール進行方向ベクトル（長さ1）
// pからv方向に伸びる直線（ボールの進行線）をLとする．
//
// @param q1 [i] 線分Wの単点1
// @param q2 [i] 線分Wの単点2
// q1とq2を結ぶ線分Wは壁を構成するものとする．
//
// @return {cp, dist, refv}
// cp : 交点{x, y}
// dist: pからcpまでの距離
// refv: cpで反射したときの方向ベクトル
// 交差しない場合はnullが返る
const getCrossPoint = (p, v, q1, q2) => {
    let px = p.x;
    let py = p.y;
    let vx = v.x;
    let vy = v.y;
    let q1x = q1.x;
    let q1y = q1.y;
    let q2x = q2.x;
    let q2y = q2.y;

    let M11 = vx;
    let M21 = vy;
    let M12 = q1x - q2x;
    let M22 = q1y - q2y;

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
        let t = iM11*(q1x-px) + iM12*(q1y-py);
        let s = iM21*(q1x-px) + iM22*(q1y-py);

        if ((s >= 0) && (s <= 1.0) && (t > 0)) {
            // 線分q1, q2内、かつvの正方向で交差している
            // 交点Cを計算
            let cx = px + t*vx;
            let cy = py + t*vy;
            let cp = {x: cx, y: cy};

            // pからcpまでの距離
            let v2x = cx - px;
            let v2y = cy - py;
            let dist = Math.sqrt(v2x*v2x + v2y*v2y);

            // qv = q1-->q2方向の単位ベクトル
            let qvx = q2x - q1x;
            let qvy = q2y - q1y;
            let len_v3 = Math.sqrt(qvx*qvx + qvy*qvy);
            qvx /= len_v3;
            qvy /= len_v3;

            // ip = vとqvの内積
            let ip = vx*qvx + vy*qvy;
            // qv2 = vのqv方向への正射影ベクトル
            let qv2x = ip * qvx;
            let qv2y = ip * qvy;
            // rv = vがcpで反射したときの方向ベクトル
            let rvx = 2*qv2x - vx;
            let rvy = 2*qv2y - vy;
            let refv = {x: rvx, y: rvy};

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

module.exports = {
    randDouble,
    randInt,
    isFracZero,
    isEqual,
    d2r,
    getNearestPos,
    getCrossPoint
}