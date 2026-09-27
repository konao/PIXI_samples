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
        app.stage.addChild(containers.normalContainer);
        app.stage.addChild(containers.effectContainer);
        app.stage.addChild(containers.uiContainer);
    }

    public countUp() {
        this._count += 1;
    }

    public updateScoreText() {
        if (this._scoreText) {
            this._scoreText.text = `SCORE: ${String(this._score).padStart(6, '0')}`;
        }
        if (this._hiscoreText) {
            this._hiscoreText.text = `HISCORE: ${String(this._hiscore).padStart(6, '0')}`;
        }
    }

    public updatePlayer(delta: number, keys: Utils.KeyStatus, bulletMode: string, pause: boolean) {
        if (!this._player || !this._playerBullets) return;

        const player = this._player;
        const playerBullets = this._playerBullets;

        // ----------------------------
        // プレーヤー移動
        // ----------------------------

        // 移動速度（1秒間に移動するピクセル数）
        const moveSpeed = 300;

        // 1フレームあたりの実際の移動量
        const distance = (moveSpeed / 60) * delta;

        // 上下左右の移動計算
        let player_moved = false;
        if (keys.ArrowUp) {
            player.move(0, -distance);
            player_moved = true;
        }
        if (keys.ArrowDown) {
            player.move(0, distance);
            player_moved = true;
        }
        if (keys.ArrowLeft) {
            player.move(-distance, 0, "left");
            player_moved = true;
        }
        if (keys.ArrowRight) {
            player.move(distance, 0, "right");
            player_moved = true;
        }
        if (!player_moved) {
            player.resetPic(); // 移動していなければ正面の絵に戻す
        }
        if (keys.Space) {
            keys.Space = false; // 1回押すごとに一発

            const playerPos = player.getPos();
            if (playerPos) {
                // 弾丸生成
                playerBullets.genNewBullets(bulletMode, playerPos.x, playerPos.y, 64, 64)

                // 発射音
                Sound.playSE("shot");
            }
        }

        // ----------------------------
        // プレーヤー弾丸移動
        // ----------------------------
        this._playerBullets.update();
    }

    public updateEnemies() {
        if (!this._enemies || !this._enemyBullets || !this._player) return;

        // ----------------------------
        // 敵生成
        // ----------------------------
        if ((this._count % 200) == 0) {
            const posPlayer = this._player.getPos();
            this._enemies.genEnemies(posPlayer);
        }

        // ----------------------------
        // 敵移動
        // ----------------------------
        this._enemies.update();

        // ----------------------------
        // 敵攻撃
        // ----------------------------
        const playerPos = this._player.getPos();
        if (playerPos) {
            this._enemies.attack(playerPos, this._enemyBullets);
        }

        // ----------------------------
        // 敵弾丸移動
        // ----------------------------
        this._enemyBullets.update();
    }

    public hitTest() {
        if (!this._player || !this._playerBullets || !this._enemies || !this._explosions) return;

        // プレーヤー弾丸ヒットテスト
        const parBullets: PIXI.Particle[] = this._playerBullets.getParBullets();
        let indsToRemoveBullets: number[] = [];     // 削除する弾丸のインデックス
        if (parBullets.length > 0) {
            for (let i = 0; i < parBullets.length; i++) {
                const parBullet = parBullets[i];
                if (parBullet) {
                    switch (parBullet.type) {
                        case "bullet":
                            {
                                const posPlayerBullet = {
                                    x: parBullet.x,
                                    y: parBullet.y
                                };
                                const playerBulletSize = parBullet.w * 0.8;    // 大体の半径を適当に計算
                                const scorePoints = this._enemies.hitTest_bullet(posPlayerBullet, playerBulletSize, this._explosions);
                                if (scorePoints > 0) {
                                    // 当たった
                                    indsToRemoveBullets.push(i);    // i番目の弾丸を消す

                                    // 点数加算
                                    this._score += scorePoints;
                                    this.updateScoreText();
                                }
                            }
                            break;
                        case "laser":
                            {
                                const posLaser1 = {
                                    x: parBullet.x,
                                    y: parBullet.y
                                }
                                const posLaser2 = {
                                    x: parBullet.x,
                                    y: parBullet.y - 100 // [TODO] 適当、後で調整
                                }
                                const scorePoints = this._enemies.hitTest_laser(posLaser1, posLaser2, this._explosions);
                                if (scorePoints > 0) {
                                    // 当たった
                                    // indsToRemoveBullets.push(i);    // レーザーの時は消さない

                                    // 点数加算
                                    this._score += scorePoints;
                                    this.updateScoreText();
                                }
                            }
                            break;
                    }
                }
            }

            if (indsToRemoveBullets.length > 0) {
                this._playerBullets.removeBullets(indsToRemoveBullets);
            }
        }
    }
}