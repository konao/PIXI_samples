// *********************************************************
//  各種ユーティリティ
// *********************************************************
import * as PIXI from 'pixi.js';

// ----------------------------------------------
//  コンテナを格納するクラス
// ----------------------------------------------
class Containers {
    public particleContainer: PIXI.ParticleContainer;   // パーティクル格納用（最も高速）
    public normalContainer: PIXI.Container; // 通常スプライト格納用（主にAnimatedSptire格納用）
    public effectContainer: PIXI.Container; // エフェクト用（爆発アニメーションスプライトなど）
    public uiContainer: PIXI.Container; // UIコンテナ（スコア表示など）

    constructor(_particleContainer: PIXI.ParticleContainer, _normalContainer: PIXI.Container, _effectContainer: PIXI.Container, _uiContainer: PIXI.Container) {
        this.particleContainer = _particleContainer;
        this.normalContainer = _normalContainer;
        this.effectContainer = _effectContainer;
        this.uiContainer = _uiContainer;
    }
}

// ----------------------------------------------
//  ベクトルとベクトル演算
// ----------------------------------------------
type Vec2 = {
    x: number,
    y: number
}

const v_add = (p1: Vec2, p2: Vec2): Vec2 => {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y
    }    
}

const v_sub = (p1: Vec2, p2: Vec2): Vec2 => {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y
    }
}

const v_scaler = (p: Vec2, k: number): Vec2 => {
    return {
        x: p.x * k,
        y: p.y * k
    }
}

const v_dot = (p1: Vec2, p2: Vec2): number => {
    return p1.x*p2.x + p1.y*p2.y;
}

const v_len = (p: Vec2): number => {
    return Math.sqrt(v_dot(p, p));
}

// ----------------------------------------------
//  衝突判定1
//  点を中心とした円の接触状態で判定する
// ----------------------------------------------
const hitTest1 = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean => {

    const dist_p1p2_2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    const dist_r1r2_2 = (r1 + r2) * (r1 + r2);

    return dist_p1p2_2 < dist_r1r2_2;
}

// ----------------------------------------------
//  衝突判定2
//  線分（レーザーの端点）と円（敵）の接触状態で判定する
//
//  @param x1, y1 レーザーの端点(A)
//  @param x2, y2 レーザーの端点(B)
//  @param x3, y3, r3 敵の位置(P)とおよその半径
// ----------------------------------------------
const hitTest2 = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, r3: number): boolean => {
    const A: Vec2 = {x: x1, y: y1};
    const B: Vec2 = {x: x2, y: y2};
    const P: Vec2 = {x: x3, y: y3};
    const AP = v_sub(P, A);
    const AB = v_sub(B, A);
    const BP = v_sub(P, B);
    const BA = v_sub(A, B);

    if (v_dot(AP, AB) < 0) {
        // PはAより外側
        return false;
    } else if (v_dot(BP, BA) < 0) {
        // PはBより外側
        return false;
    } else {
        // PはABの間
        // IをPから線分ABへ下した垂線の足とする
        const unit_AB = v_scaler(AB, 1/v_len(AB));  // AB方向の単位ベクトル
        const AI = v_scaler(unit_AB, v_dot(AP, unit_AB));
        const IP = v_sub(AP, AI);
        const dist = v_len(IP);
        return dist < r3;
    }
}

export {
    Containers,
    Vec2,
    hitTest1,
    hitTest2,
    v_add,
    v_sub,
    v_scaler,
    v_dot,
    v_len
}