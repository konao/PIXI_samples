// ************************************************************
//  弾丸（敵）
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Utils from './Utils';
import * as M from './Monad';

export class EnemyBullets {
    private _containers: Utils.Containers | null = null;
    private _tex_bullet: PIXI.Texture | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };
    private _bullets: PIXI.Particle[] = [];

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        this._containers = containers;
        this._tex_bullet = wholeTexture.textures['SpaceRage/FX/proton_01.png'];
        this._scrSize = scrSize;
    }

    public genNewBullets(posPlayer: Utils.Vec2, posEnemy: Utils.Vec2, sizeEnemy: Utils.Vec2, bulletSpeed: number) {
        const player_x: number = posPlayer.x;
        const player_y: number = posPlayer.y;
        const enemy_x: number = posEnemy.x;
        const enemy_y: number = posEnemy.y;
        const enemy_w: number = sizeEnemy.x;
        const enemy_h: number = sizeEnemy.y;
        if (this._tex_bullet && this._containers?.particleContainer) {
            // 弾丸のスプライトを生成
            const bullet_x = enemy_x + enemy_w / 2;
            const bullet_y = enemy_y + enemy_h / 2;
            try {
                const dist = Math.sqrt((player_x - enemy_x) * (player_x - enemy_x) + (player_y - enemy_y) * (player_y - enemy_y));
                let bullet_dx = (player_x - enemy_x) / dist * bulletSpeed;
                let bullet_dy = (player_y - enemy_y) / dist * bulletSpeed;
                this.addBullet(bullet_x, bullet_y, bullet_dx, bullet_dy);
            }
            catch {
                // do nothing
            }
        }
    }

    public addBullet(x: number, y: number, dx: number, dy: number) {
        // 弾丸のスプライトを生成
        if (this._tex_bullet && this._containers?.particleContainer) {
            const bullet = new PIXI.Particle(this._tex_bullet)
            bullet.x = x;
            bullet.y = y;
            bullet.anchorX = 0.5;   // x方向真ん中を基準とする
            bullet.anchorY = 0;     // y方向は一番上を基準
            bullet.rotation = 0;
            bullet.w = this._tex_bullet.width;   // テクスチャのサイズをパーティクルにもセットしておく
            bullet.h = this._tex_bullet.height;
            bullet.dx = dx;
            bullet.dy = dy;
            this._bullets.push(bullet)
            this._containers.particleContainer.addParticle(bullet)
        }
    }

    public getParBullets() {
        return this._bullets;
    }

    public update() {
        // ローカルヘルパー関数
        const isOutOfStage = (p: PIXI.Particle): boolean => {
            return (p && (p.x < 0 || p.x > this._scrSize.x || p.y < 0 || p.y > this._scrSize.y));
        }

        this._bullets
            .map(bullet => M.Maybe.of(bullet).map(b => {
                // 弾丸移動（Maybeを使って配列上の有効なデータだけを更新する）
                b.x += b.dx;
                b.y += b.dy;

                // 画面から外れた弾をコンテナから消す
                if (isOutOfStage(b)) {
                    this._containers?.particleContainer.removeParticle(b);
                }

                return b;
            }).getOrElse(null as any))

            // nullの要素（万が一存在した空データ）を除去
            .filter(bullet => bullet !== null)

            // 画面上に残っている弾のみ配列に残す
            .filter(bullet => !isOutOfStage(bullet));
    }
}