// *********************************************************
//  各種ユーティリティ
// *********************************************************
import * as PIXI from 'pixi.js';

// ----------------------------------------------
//  コンテナを格納するクラス
// ----------------------------------------------
export enum ContainerType {
    Title,
    Game
}

export class Containers {
    public particleContainer: PIXI.ParticleContainer;   // パーティクル格納用（最も高速）
    public normalContainer: PIXI.Container; // 通常スプライト格納用（主にAnimatedSptire格納用）
    public effectContainer: PIXI.Container; // エフェクト用（爆発アニメーションスプライトなど）
    public uiContainer: PIXI.Container; // UIコンテナ（スコア表示など）
    public titleContainer: PIXI.Container;  // タイトル用コンテナ（オープニング画面）

    constructor(_particleContainer: PIXI.ParticleContainer, _normalContainer: PIXI.Container, _effectContainer: PIXI.Container, _uiContainer: PIXI.Container, _titleContainer: PIXI.Container) {
        this.particleContainer = _particleContainer;
        this.normalContainer = _normalContainer;
        this.effectContainer = _effectContainer;
        this.uiContainer = _uiContainer;
        this.titleContainer = _titleContainer;
    }

    public setVisible(containerType: ContainerType) {
        switch (containerType) {
            case ContainerType.Title:
                this.particleContainer.visible = false;
                this.normalContainer.visible = false;
                this.effectContainer.visible = false;
                this.uiContainer.visible = false;
                this.titleContainer.visible = true;
                break;
            case ContainerType.Game:
                this.particleContainer.visible = true;
                this.normalContainer.visible = true;
                this.effectContainer.visible = true;
                this.uiContainer.visible = true;
                this.titleContainer.visible = false;
                break;
        }
    }
}

// ----------------------------------------------
//  ベクトルとベクトル演算
// ----------------------------------------------
export type Vec2 = {
    x: number,
    y: number
}

export const v_add = (p1: Vec2, p2: Vec2): Vec2 => {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y
    }
}

export const v_sub = (p1: Vec2, p2: Vec2): Vec2 => {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y
    }
}

export const v_scaler = (p: Vec2, k: number): Vec2 => {
    return {
        x: p.x * k,
        y: p.y * k
    }
}

export const v_dot = (p1: Vec2, p2: Vec2): number => {
    return p1.x * p2.x + p1.y * p2.y;
}

export const v_len = (p: Vec2): number => {
    return Math.sqrt(v_dot(p, p));
}

// ----------------------------------------------
//  衝突判定1
//  点を中心とした円の接触状態で判定する
// ----------------------------------------------
export const hitTest1 = (p1: Vec2, r1: number, p2: Vec2, r2: number): boolean => {

    const dist_p1p2_2 = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
    const dist_r1r2_2 = (r1 + r2) * (r1 + r2);

    return dist_p1p2_2 < dist_r1r2_2;
}

// ----------------------------------------------
//  衝突判定2
//  線分（レーザーの端点）と円（敵）の接触状態で判定する
//
//  @param A: レーザーの端点(1)
//  @param B レーザーの端点(2)
//  @param P, r 敵の位置(P)とおよその半径
//
//  ＜参考サイト＞
//  点と線分の最近傍点と距離の計算
//  https://qiita.com/deltaMASH/items/e7ffcca78c9b75710d09
// ----------------------------------------------
export const hitTest2 = (A: Vec2, B: Vec2, P: Vec2, r: number): boolean => {
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
        const unit_AB = v_scaler(AB, 1 / v_len(AB));  // AB方向の単位ベクトル
        const AI = v_scaler(unit_AB, v_dot(AP, unit_AB));
        const IP = v_sub(AP, AI);
        const dist = v_len(IP);
        return dist < r;
    }
}