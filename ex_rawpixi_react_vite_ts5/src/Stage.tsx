// ************************************************************
//  ステージ
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Player from './Player';
import * as Bullet from './Bullet';
import * as Enemy from './Enemy';
import * as Explosions from './Explosion';
import * as Utils from './Utils';

export class Stage {
    private _containers: Utils.Containers | null = null;
    private _w: number = 0;
    private _h: number = 0;
    private _player: Player.Player | null = null;
    private _bullets: Bullet.Bullets | null = null;
    private _enemies: Enemy.Enemies | null = null;
    private _explosions: Explosions.Explosions | null = null;
    private _stageNo: number = 1;
    private _count: number = 0;
    private _score: number = 0;

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, w: number, h: number) {
        this._containers = containers;
        this._w = w;
        this._h = h;

        // プレーヤー
        this._player = new Player.Player();
        this._player.init(containers, wholeTexture);
        this._player.setPos(w / 2 - 32, h * 4 / 5);

        // 弾丸
        this._bullets = new Bullet.Bullets();
        this._bullets.init(containers, wholeTexture, w, h);

        // 敵
        this._enemies = new Enemy.Enemies();
        this._enemies.init(containers, wholeTexture, w, h)

        // 爆発
        this._explosions = new Explosions.Explosions();
        this._explosions.init(containers, wholeTexture);
    }

    public getPlayer() {
        return this._player;
    }

    public getBullets() {
        return this._bullets;
    }

    public getEnemies() {
        return this._enemies;
    }

    public getExplosions() {
        return this._explosions;
    }

    public countUp() {
        this._count += 1;
    }

    public getCount() {
        return this._count;
    }

    public hitTest(player: Player.Player, bullets: Bullet.Bullets, enemies: Enemy.Enemies) {
        // 弾丸ヒットテスト
        const parBullets: PIXI.Particle[] = bullets.getParBullets();
        const pEnemies: Enemy.Enemy[] = enemies.getEnemies();
        let indsToRemoveBullets: number[] = [];     // 削除する弾丸のインデックス
        let indsToRemoveEnemies: number[] = [];     // 削除する敵のインデックス
        if (parBullets.length > 0 && pEnemies.length > 0) {
            for (let i = 0; i < parBullets.length; i++) {
                const parBullet = parBullets[i];
                if (parBullet) {
                    const bullet_x = parBullet.x;
                    const bullet_y = parBullet.y;
                    const bullet_r = parBullet.w * 0.8;    // 大体の半径を適当に計算
                    for (let j = 0; j < pEnemies.length; j++) {
                        const parEnemy = pEnemies[j].getParEnemy();
                        if (parEnemy) {
                            const enemy_x = parEnemy.x;
                            const enemy_y = parEnemy.y;
                            const enemy_r = parEnemy.w * 0.8;   // 大体の半径を適当に計算
                            if (Utils.hitTest1(bullet_x, bullet_y, bullet_r, enemy_x, enemy_y, enemy_r)) {
                                // 当たった
                                indsToRemoveBullets.push(i);
                                indsToRemoveEnemies.push(j);

                                // 爆発アニメーションを追加
                                this._explosions?.addNewExplosion(enemy_x, enemy_y);
                            }
                        }
                    }
                }
            }

            if (indsToRemoveBullets.length > 0) {
                // console.log(`Hit! bullets=${indsToRemoveBullets}`);
                bullets.removeBullets(indsToRemoveBullets);
            }

            if (indsToRemoveEnemies.length > 0) {
                // console.log(`Hit! enemies=${indsToRemoveEnemies}`);
                enemies.removeEnemies(indsToRemoveEnemies);
            }
        }
    }
}