// ************************************************************
//  弾丸（プレーヤー）
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Utils from './Utils';
import * as M from './Monad';

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
            bullet.destroyed = false;
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

    // 破壊フラグがtrueになっている弾丸を削除する
    public removeDestroyedBullets() {
        this._bullets = this._bullets.filter(bullet => {
            if (bullet) {
                if (bullet.destroyed) {
                    // 破壊されている
                    this._containers?.particleContainer.removeParticle(bullet); // コンテナから消す
                    return false;   // 配列からも消す
                } else {
                    return true;    // 破壊されていない．残す
                }
            } else {
                return false;   // そもそもParticleがない．（ここは本来こないはずだが）消しておく
            }
        })
    }

    public update() {
        // ローカルヘルパー関数
        const isOutOfStage = (playerBullet: PIXI.Particle): boolean => {
            return (playerBullet && (playerBullet.y < 0));
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