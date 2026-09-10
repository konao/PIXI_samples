// ************************************************************
//  弾丸
// ************************************************************

import * as PIXI from 'pixi.js';

export class Bullets {
    private _container: PIXI.ParticleContainer | null = null;
    private _tex_bullet: PIXI.Texture | null = null;
    private _w: number = 0;
    private _h: number = 0;
    private _bullets: PIXI.Particle[] = [];
    
    public init(container: PIXI.ParticleContainer, wholeTexture: PIXI.Spritesheet, w: number, h: number) {
        this._container = container;
        this._tex_bullet = wholeTexture.textures['FX/vulcan_3.png'];
        this._w = w;
        this._h = h;
    }

    public genNewBullets(bulletMode: number, player_x: number, player_y: number, player_w: number, player_h: number) {
        console.log(bulletMode);
        if (this._tex_bullet && this._container) {
            for (let i=0; i<bulletMode; i++) {
                // 弾丸のスプライトを生成
                const bullet_x = player_x + player_w/2;
                const bullet_y = player_y - player_h/2;
                let bullet_dx = 0;
                let bullet_dy = -10;
                switch (bulletMode) {
                    case 1:
                        bullet_dx = 0;
                        break;
                    case 3:
                        bullet_dx = (i-1)*2;
                        break;
                    case 5:
                        bullet_dx = (i-2)*2;
                        break;
                }
                this.addBullet(bullet_x, bullet_y, bullet_dx, bullet_dy);
            }
        }
    }

    public addBullet(x: number, y: number, dx: number, dy: number) {
        // 弾丸のスプライトを生成
        if (this._tex_bullet && this._container) {
            const bullet = new PIXI.Particle(this._tex_bullet)
            bullet.x = x;
            bullet.y = y;
            bullet.dx = dx;
            bullet.dy = dy;
            this._bullets.push(bullet)
            this._container.addParticle(bullet)
        }
    }

    public update() {
        if (this._bullets.length > 0) {
          const indsToRemove: number[] = [];

          // 弾丸移動
          for (let i=0; i<this._bullets.length; i++) {
            const p = this._bullets[i]
            p.x += p.dx;
            p.y += p.dy;
            if (p.y < 0) {
              // 画面を外れたものを削除対象に入れる
              indsToRemove.push(i)
            }
          }

          // 画面を外れた弾丸は消す
          if (indsToRemove.length > 0) {
            // 降順にソート
            const sortedInds = indsToRemove.sort((a, b) => b-a)

            for (const i of sortedInds) {
              const bullet = this._bullets[i]
              this._container?.removeParticle(bullet); // コンテナから消す
              this._bullets.splice(i, 1); // i番目の要素を削除して配列の長さを縮める
            }
          }
        }

    }
}