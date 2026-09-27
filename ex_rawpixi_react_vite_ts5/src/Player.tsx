// ************************************************************
//  宇宙船
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Utils from './Utils';

export class Player {
    private _containers: Utils.Containers | null = null;
    private _tex_player_b: PIXI.Texture[] = [];
    private _player: PIXI.AnimatedSprite | null = null;

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet) {
        this._containers = containers;
        this._tex_player_b.push(wholeTexture.textures['Player/player_b_l1.png']); // 左向き
        this._tex_player_b.push(wholeTexture.textures['Player/player_b_m.png']);  // 正面
        this._tex_player_b.push(wholeTexture.textures['Player/player_b_r1.png']); // 右向き

        // プレーヤーのスプライトを生成
        // 表示画像を切り替えるため、AnimatedSpriteを使う．
        this._player = new PIXI.AnimatedSprite(this._tex_player_b);

        // 自動でアニメーションが動かないようにする
        this._player.autoUpdate = false;
        this._player.stop();
        this._player.currentFrame = 1;

        // コンテナに登録
        this._containers.normalContainer.addChild(this._player);
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

    public move(dx: number, dy: number, dir: string = "") {
        if (this._player) {
            this._player.x += dx;
            this._player.y += dy;
            switch (dir) {
                case "left":
                    this._player.currentFrame = 0;  // 左向きの絵にする
                    break;
                case "right":
                    this._player.currentFrame = 2;  // 右向きの絵にする
                    break;
            }
        }
    }

    public resetPic() {
        if (this._player) {
            this._player.currentFrame = 1;  // 正面の絵にリセット
        }
    }
}