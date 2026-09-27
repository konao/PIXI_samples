// ************************************************************
//  弾丸（プレーヤー）
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Utils from './Utils';

export class PlayerBullets {
    private _containers: Utils.Containers | null = null;
    private _tex_bullet: PIXI.Texture | null = null;
    private _tex_laser: PIXI.Texture | null = null;
    private _tex_missile: PIXI.Texture | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };
    private _bullets: PIXI.Particle[] = [];

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        this._containers = containers;
        this._tex_bullet = wholeTexture.textures['SpaceRage/FX/vulcan_3.png'];
        this._tex_laser = wholeTexture.textures['SpaceShooterPack/laser-3.png'];
        this._tex_missile = wholeTexture.textures['SpaceShooterPack/rocket.png'];
        this._scrSize = scrSize;
    }

    public genNewBullets(bulletMode: string, player_x: number, player_y: number, player_w: number, player_h: number) {
        if (this._tex_bullet && this._tex_laser && this._containers?.particleContainer) {
            // 弾丸のスプライトを生成
            const bullet_x = player_x + player_w / 2;
            const bullet_y = player_y;
            let bullet_dx = 0;
            const bullet_dy = -10;
            const laser_dy = -20;
            switch (bulletMode) {
                case "single":
                    this.addBullet(bullet_x, bullet_y, bullet_dx, bullet_dy, this._tex_bullet);
                    break;
                case "multi3":
                    // 平行に連発
                    for (let i = 0; i < 3; i++) {
                        this.addBullet(bullet_x + (i - 1) * 15, bullet_y, bullet_dx, bullet_dy, this._tex_bullet);
                    }
                    break;
                case "spread3":
                    // 放射状に散らす
                    for (let i = 0; i < 3; i++) {
                        bullet_dx = (i - 1) * 2;
                        this.addBullet(bullet_x, bullet_y, bullet_dx, bullet_dy, this._tex_bullet);
                    }
                    break;
                case "laser":
                    // レーザー
                    this.addLaser(bullet_x, bullet_y, 0, laser_dy, this._tex_laser);
                    break;
            }
        }
    }

    public addBullet(x: number, y: number, dx: number, dy: number, tex: PIXI.Texture) {
        // 弾丸のスプライトを生成
        if (this._tex_bullet && this._containers?.particleContainer) {
            const bullet = new PIXI.Particle(tex)
            bullet.type = "bullet";
            bullet.x = x;
            bullet.y = y;
            bullet.anchorX = 0.5;   // x方向真ん中を基準とする
            bullet.anchorY = 0;     // y方向は一番上を基準
            bullet.rotation = 0;
            bullet.w = tex.width;   // テクスチャのサイズをパーティクルにもセットしておく
            bullet.h = tex.height;
            bullet.dx = dx;
            bullet.dy = dy;
            this._bullets.push(bullet)
            this._containers.particleContainer.addParticle(bullet)
        }
    }

    public addLaser(x: number, y: number, dx: number, dy: number, tex: PIXI.Texture) {
        if (this._tex_bullet && this._containers?.particleContainer) {
            const bullet = new PIXI.Particle(tex)
            bullet.type = "laser";
            bullet.x = x;
            bullet.y = y;
            bullet.anchorX = 0.5;   // x方向真ん中を基準とする
            bullet.anchorY = 0.8;   // y方向はレーザー画像の一番下あたりを基準にする
            bullet.rotation = 0;
            bullet.scaleX = 0.5;
            bullet.scaleY = 7;
            // bullet.w = tex.width;   // テクスチャのサイズをパーティクルにもセットしておく
            // bullet.h = tex.height;
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
                if (p.y < 0) {
                    // 画面を外れたものを削除対象に入れる
                    indsToRemove.push(i)
                }
            }

            // 画面を外れた弾丸は消す
            this.removeBullets(indsToRemove);
        }
    }
}