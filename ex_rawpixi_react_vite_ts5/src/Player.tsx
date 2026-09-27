// ************************************************************
//  プレーヤー
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Utils from './Utils';

export class Player {
    private _containers: Utils.Containers | null = null;
    private _tex_player_b: PIXI.Texture[] = [];
    private _player: PIXI.AnimatedSprite | null = null;
    private readonly _sizePlayer: Utils.Vec2 = { x: 64, y: 64 };
    private _bAlive: boolean = true;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        this._containers = containers;
        this._tex_player_b.push(wholeTexture.textures['SpaceRage/Player/player_b_l1.png']); // 左向き
        this._tex_player_b.push(wholeTexture.textures['SpaceRage/Player/player_b_m.png']);  // 正面
        this._tex_player_b.push(wholeTexture.textures['SpaceRage/Player/player_b_r1.png']); // 右向き
        this._scrSize = scrSize;

        // プレーヤーのスプライトを生成
        // 表示画像を切り替えるため、AnimatedSpriteを使う．
        this._player = new PIXI.AnimatedSprite(this._tex_player_b);
        this._player.anchor = 0.5;  // スプライトの中心を移動、回転の中心にする．

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

    public getSize() {
        return this._sizePlayer;
    }

    public move(dx: number, dy: number, dir: string = "") {
        // ローカルヘルパー関数
        const isOutOfStage = (p: Utils.Vec2, sz: Utils.Vec2): boolean => {
            const w = sz.x / 2;
            const h = sz.y / 2;
            return (p && ((p.x - w) < 0 || (p.x + w) > this._scrSize.x || (p.y - h) < 0 || (p.y + h) > this._scrSize.y));
        }

        if (this._player) {
            const p = { x: this._player.x + dx, y: this._player.y + dy };
            if (!isOutOfStage(p, this._sizePlayer)) {   // 画面範囲チェック
                this._player.x = p.x;
                this._player.y = p.y;

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
    }

    public resetPic() {
        if (this._player) {
            this._player.currentFrame = 1;  // 正面の絵にリセット
        }
    }

    public setAlive(b: boolean) {
        this._bAlive = b;
        if (this._player) {
            this._player.visible = b;
        }
    }

    public isAlive(): boolean {
        return this._bAlive;
    }
}