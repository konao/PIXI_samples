// ************************************************************
//  ステージ
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Player from './Player';
import * as Bullet from './Bullet';
import * as Enemy from './Enemy';

export class Stage {
    private _container: PIXI.ParticleContainer | null = null;
    private _w: number = 0;
    private _h: number = 0;
    private _player: Player.Player | null = null;
    private _bullets: Bullet.Bullets | null = null;
    private _enemies: Enemy.Enemies| null = null;
    private _stageNo: number = 1;
    private _count: number = 0;

    public init(container: PIXI.ParticleContainer, wholeTexture: PIXI.Spritesheet, w: number, h: number) {
        this._container = container;
        this._w = w;
        this._h = h;

        // プレーヤー
        this._player = new Player.Player();
        this._player.init(container, wholeTexture);
        this._player.setPos(w / 2 - 32, h * 4/5);

        // 弾丸
        this._bullets = new Bullet.Bullets();
        this._bullets.init(container, wholeTexture, w, h);

        // 敵
        this._enemies = new Enemy.Enemies();
        this._enemies.init(container, wholeTexture, w, h)
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

    public countUp() {
        this._count += 1;
    }

    public getCount() {
        return this._count;
    }
}