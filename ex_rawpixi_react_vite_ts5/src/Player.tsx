// ************************************************************
//  宇宙船
// ************************************************************

import * as PIXI from 'pixi.js';

export class Player {
    private _container: PIXI.ParticleContainer | null = null;
    private _tex_player_b_m: PIXI.Texture | null = null;
    private _player: PIXI.Particle | null = null;

    public init(container: PIXI.ParticleContainer, wholeTexture: PIXI.Spritesheet) {
        this._container = container;
        this._tex_player_b_m = wholeTexture.textures['Player/player_b_m.png'];

        // プレーヤーのスプライト（パーティクル）を生成
        this._player = new PIXI.Particle(this._tex_player_b_m);

        // コンテナに登録
        this._container.addParticle(this._player);
    }

    public setPos(x: number, y: number) {
        if (this._player) {
            this._player.x = x;
            this._player.y = y;
        }
    }

    public getPos() {
        if (this._player) {
            return {
                x: this._player.x,
                y: this._player.y,
            }
        } else {
            return {
                x: 0,
                y: 0
            }
        }
    }

    public move(dx: number, dy: number) {
        if (this._player) {
            this._player.x += dx;
            this._player.y += dy;
        }
    }
}