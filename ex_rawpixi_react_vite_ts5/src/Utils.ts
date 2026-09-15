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
//  衝突判定1
//  点を中心とした円の接触状態で判定する
// ----------------------------------------------
const hitTest1 = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean => {

    const dist_p1p2_2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    const dist_r1r2_2 = (r1 + r2) * (r1 + r2);

    return dist_p1p2_2 < dist_r1r2_2;
}

export {
    Containers,
    hitTest1
}