// *********************************************************
//  各種ユーティリティ
// *********************************************************
import * as PIXI from 'pixi.js';

// ----------------------------------------------
//  コンテナを格納するクラス
// ----------------------------------------------
class Containers {
    public particleContainer: PIXI.ParticleContainer;
    public effectContainer: PIXI.Container;

    constructor(_particleContainer: PIXI.ParticleContainer, _effectContainer: PIXI.Container) {
        this.particleContainer = _particleContainer;
        this.effectContainer = _effectContainer;
    }
}

// ----------------------------------------------
//  衝突判定1
//  点を中心とした円の接触状態で判定する
// ----------------------------------------------
const hitTest1 = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean => {

    const dist_p1p2_2 = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    const dist_r1r2_2 = (r1+r2)*(r1+r2);

    return dist_p1p2_2 < dist_r1r2_2;
}

export {
    Containers,
    hitTest1
}