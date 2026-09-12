// ************************************************************
//  爆発
// ************************************************************
import * as PIXI from 'pixi.js';
import * as Utils from './Utils';

export class Explosions {
    private _containers: Utils.Containers | null = null;
    private _tex_explotions: PIXI.Texture[] = [];
    
    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet) {
        this._containers = containers;
        for (let i=1; i<=9; i++) {
            const texPath = `Explosions/explosion_2_${String(i).padStart(2, '0')}.png`;
            this._tex_explotions.push(wholeTexture.textures[texPath]);
        }
    }

    public addNewExplosion(x: number, y: number) {
        const parExplosion = new PIXI.AnimatedSprite(this._tex_explotions);
        parExplosion.x = x;
        parExplosion.y = y;
        parExplosion.anchor.set(0.5);
        parExplosion.animationSpeed = 1.0;  // 値が大きいほど速い
        parExplosion.loop = false;  // ループしない

        parExplosion.onComplete = () => {
            parExplosion.destroy(); // 再生が終わったら破棄（コンテナからも自動的に削除される）
        }

        this._containers?.effectContainer.addChild(parExplosion);
        parExplosion.play();    // アニメーション再生開始
    }
}