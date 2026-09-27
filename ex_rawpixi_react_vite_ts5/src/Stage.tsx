// ************************************************************
//  ステージ
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Player from './Player';
import * as PlayerBullet from './PlayerBullet';
import * as EnemyBullet from './EnemyBullet';
import * as Enemy from './Enemy';
import * as Explosions from './Explosion';
import * as Font from './Font';
import * as Sound from './Sound';
import * as Utils from './Utils';

export class Stage {
    private _app: PIXI.Application | null = null;
    private _containers: Utils.Containers | null = null;
    private _w: number = 0;
    private _h: number = 0;
    private _player: Player.Player | null = null;
    private _playerBullets: PlayerBullet.PlayerBullets | null = null;
    private _enemies: Enemy.Enemies | null = null;
    private _enemyBullets: EnemyBullet.EnemyBullets | null = null;
    private _explosions: Explosions.Explosions | null = null;
    private _stageNo: number = 1;
    private _count: number = 0;
    private _score: number = 0;
    private _hiscore: number = 0;
    private _scoreText: PIXI.BitmapText | null = null;
    private _hiscoreText: PIXI.BitmapText | null = null;

    public async init(app: PIXI.Application, containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, w: number, h: number) {
        this._app = app;

        this._containers = containers;
        this._w = w;
        this._h = h;

        // プレーヤー
        this._player = new Player.Player();
        this._player.init(containers, wholeTexture);
        this._player.setPos(w / 2 - 32, h * 4 / 5);

        // 弾丸（プレーヤー）
        this._playerBullets = new PlayerBullet.PlayerBullets();
        this._playerBullets.init(containers, wholeTexture, w, h);

        // 敵
        this._enemies = new Enemy.Enemies();
        this._enemies.init(containers, wholeTexture, w, h)

        // 弾丸（敵）
        this._enemyBullets = new EnemyBullet.EnemyBullets();
        this._enemyBullets.init(containers, wholeTexture, w, h);

        // 爆発
        this._explosions = new Explosions.Explosions();
        this._explosions.init(containers, wholeTexture);

        // テキスト
        // フォント作成
        const fontManager = new Font.FontManager();
        await fontManager.init();
        const font1 = fontManager.createNewFont('MyGameFont1', {
            fontSize: 36,
            fill: '#ffffff',
            fontWeight: 'bold',

            // 装飾：ドロップシャドウ（立体感が出ます）
            dropShadow: true,
            dropShadowColor: '#0080ff',
            dropShadowBlur: 0,      // ドット絵フォントならボカシは 0 がおすすめ
            dropShadowAngle: Math.PI / 4, // 影の方向（45度）
            dropShadowDistance: 5,  // 影の距離
        });

        // 複数個のフォントを作成できる
        // const font2 = fontManager.createNewFont('MyGameFont2', {
        //     fontSize: 36,
        //     fill: '#ffffff',
        // })

        // テキスト表示エリア作成
        this._scoreText = font1.createBitmapText({
            fontSize: 36
        })
        this._hiscoreText = font1.createBitmapText({
            fontSize: 36
        });

        // 表示位置を設定
        this._scoreText.x = 30;
        this._scoreText.y = 20;

        this._hiscoreText.x = 420;
        this._hiscoreText.y = 20;

        this.updateScoreText();

        // 通常のコンテナレイヤー（uiContainerなど）に追加
        containers.uiContainer.addChild(this._scoreText); // ⚠️ ParticleContainerには入れないでください
        containers.uiContainer.addChild(this._hiscoreText);

        // addChildの順番に注意
        // （後に追加したものが上に表示される）
        app.stage.addChild(containers.particleContainer);
        app.stage.addChild(containers.effectContainer);
        app.stage.addChild(containers.uiContainer);
    }

    public getPlayer() {
        return this._player;
    }

    public getPlayerBullets() {
        return this._playerBullets;
    }

    public getEnemies() {
        return this._enemies;
    }

    public getEnemyBullets() {
        return this._enemyBullets;
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

    public updateScoreText() {
        if (this._scoreText) {
            this._scoreText.text = `SCORE: ${String(this._score).padStart(6, '0')}`;
        }
        if (this._hiscoreText) {
            this._hiscoreText.text = `HISCORE: ${String(this._hiscore).padStart(6, '0')}`;
        }
    }

    public hitTest1(player: Player.Player, bullets: PlayerBullet.PlayerBullets, enemies: Enemy.Enemies) {
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

                                // 爆発音
                                Sound.playSE("explosion");

                                // 点数加算
                                this._score += 10;
                                this.updateScoreText();
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

    public enemyAttack() {
        if (this._enemies && this._enemyBullets) {
            const playerPos = this._player?.getPos();
            if (playerPos) {
                this._enemies.attack(playerPos.x, playerPos.y, this._enemyBullets);
            }
        }
    }
}