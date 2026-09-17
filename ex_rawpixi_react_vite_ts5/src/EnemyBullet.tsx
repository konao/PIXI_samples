// ************************************************************
//  弾丸（敵）
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Utils from './Utils';

export class EnemyBullets {
    private _containers: Utils.Containers | null = null;
    private _tex_bullet: PIXI.Texture | null = null;
    private _w: number = 0;
    private _h: number = 0;
    private _bullets: PIXI.Particle[] = [];

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, w: number, h: number) {
        this._containers = containers;
        this._tex_bullet = wholeTexture.textures['SpaceRage/FX/proton_01.png'];
        this._w = w;
        this._h = h;
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

    public removeBullets(indsToRemove: number[]) {
        if (indsToRemove.length > 0) {
            // Setを使って重複を消し、配列に戻す
            const indsToRemove2 = [...new Set(indsToRemove)];

            // 降順にソート
            const sortedInds = indsToRemove2.sort((a, b) => b - a)

            for (const i of sortedInds) {
                const bullet = this._bullets[i]
                this._containers?.particleContainer.removeParticle(bullet); // コンテナから消す
                this._bullets.splice(i, 1); // i番目の要素を削除して配列の長さを縮める
            }
        }
    }

    public update() {
        if (this._bullets.length > 0) {
            const indsToRemove: number[] = [];

            // 弾丸移動
            for (let i = 0; i < this._bullets.length; i++) {
                const p = this._bullets[i]
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > this._w || p.y < 0 || p.y > this._h) {
                    // 画面を外れたものを削除対象に入れる
                    indsToRemove.push(i)
                }
            }

            // 画面を外れた弾丸は消す
            this.removeBullets(indsToRemove);
        }
    }
}