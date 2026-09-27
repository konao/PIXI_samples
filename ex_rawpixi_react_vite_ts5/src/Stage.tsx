// ************************************************************
//  ステージ
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Game from './Game';
import * as Key from './Key';
import * as Player from './Player';
import * as PlayerBullet from './PlayerBullet';
import * as EnemyBullet from './EnemyBullet';
import * as Enemy from './Enemy';
import * as Explosions from './Explosion';
import * as Sound from './Sound';
import * as Utils from './Utils';

// ================================================
//  タイトル画面
// ================================================
export class TitleStage {
    private _game: Game.Game | null = null;
    private _containers: Utils.Containers | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };
    private _mainTitleText: PIXI.BitmapText | null = null;
    private _explText1: PIXI.BitmapText | null = null;
    private _explText2: PIXI.BitmapText | null = null;
    private _explText3: PIXI.BitmapText | null = null;
    private _otherText1: PIXI.BitmapText | null = null;
    private _count: number = 0;

    public async init(game: Game.Game, containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        this._game = game;
        this._containers = containers;
        this._scrSize = scrSize;
        this._count = 0;

        const fontManager = this._game.getFontManager();

        // ----------------------------
        const font1 = fontManager.createNewFont('MyTitleFont1', {
            fill: '#0088ff',
            fontWeight: 'bold',

            // 装飾：ドロップシャドウ（立体感が出ます）
            dropShadow: true,
            dropShadowColor: '#004466',
            dropShadowBlur: 0,      // ドット絵フォントならボカシは 0 がおすすめ
            dropShadowAngle: Math.PI / 4, // 影の方向（45度）
            dropShadowDistance: 3,  // 影の距離
        });
        this._mainTitleText = font1.createBitmapText({
            fontSize: 60
        })
        this._mainTitleText.text = `SUPER SPACE WARRIORS`;
        this._mainTitleText.x = 40;
        this._mainTitleText.y = 150;

        // ----------------------------
        const font2 = fontManager.createNewFont('MyGameFont2', {
            fill: '#0066aa',
        })
        this._explText1 = font2.createBitmapText({
            fontSize: 32
        })
        this._explText1.text = `Arrow keys: Move ship`;
        this._explText1.x = 200;
        this._explText1.y = 550;

        this._explText2 = font2.createBitmapText({
            fontSize: 32
        })
        this._explText2.text = `Space: Shot bullet`;
        this._explText2.x = 200;
        this._explText2.y = 590;

        this._explText3 = font2.createBitmapText({
            fontSize: 32
        })
        this._explText3.text = `1-4: Change weapon`;
        this._explText3.x = 200;
        this._explText3.y = 630;

        // ----------------------------
        const font3 = fontManager.createNewFont('MyGameFont3', {
            fill: '#0066aa',
            fontWeight: 'bold'
        })
        this._otherText1 = font3.createBitmapText({
            fontSize: 40
        })
        this._otherText1.text = `Press SPACE to play`;
        this._otherText1.x = 180;
        this._otherText1.y = 820;

        // コンテナに追加
        containers.titleContainer.addChild(this._mainTitleText);
        containers.titleContainer.addChild(this._explText1);
        containers.titleContainer.addChild(this._explText2);
        containers.titleContainer.addChild(this._explText3);
        containers.titleContainer.addChild(this._otherText1);
    }

    public update(delta: number) {
        if (Key.keys.Space) {
            Key.keys.Space = false;

            if (this._game) {
                this._game.switchState(Game.GameState.Playing); // プレイスタート
            }
        }

        this._count++;

        if (this._count > 30) {
            if (this._otherText1) {
                this._otherText1.visible = !this._otherText1.visible;
            }
            this._count = 0;
        }
    }
}

// ================================================
//  ゲームオーバー画面
// ================================================
export class GameOverStage {
    private _game: Game.Game | null = null;
    private _containers: Utils.Containers | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };

    public async init(game: Game.Game, containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        this._game = game;
        this._containers = containers;
        this._scrSize = scrSize;
    }

    public update(delta: number) {
    }
}

// ================================================
//  ゲーム画面本体
// ================================================
export class PlayStage {
    // private _app: PIXI.Application | null = null;
    private _game: Game.Game | null = null;
    private _containers: Utils.Containers | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };
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
    private _bulletMode: string = "single";
    private _pause: boolean = false;

    public async init(game: Game.Game, containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        // this._app = app;
        this._game = game;

        this._containers = containers;
        this._scrSize = scrSize;

        // スコアクリア
        this._score = 0;

        // プレーヤー
        this._player = new Player.Player();
        this._player.init(containers, wholeTexture);
        this._player.setPos(scrSize.x / 2 - 32, scrSize.y * 6 / 7);

        // 弾丸（プレーヤー）
        this._playerBullets = new PlayerBullet.PlayerBullets();
        this._playerBullets.init(containers, wholeTexture, scrSize);

        // 敵
        this._enemies = new Enemy.Enemies();
        this._enemies.init(containers, wholeTexture, scrSize)

        // 弾丸（敵）
        this._enemyBullets = new EnemyBullet.EnemyBullets();
        this._enemyBullets.init(containers, wholeTexture, scrSize);

        // 爆発
        this._explosions = new Explosions.Explosions();
        this._explosions.init(containers, wholeTexture);

        // テキスト
        // フォント作成
        const font1 = this._game.getFontManager().createNewFont('MyGameFont1', {
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
    }

    // ステージ開始
    public start() {
        this._count = 0;
    }

    // ステージ更新
    public update(delta: number) {
        // ポーズ切替
        if (Key.keys.KeyP) {
            this._pause = !this._pause;
            Key.keys.KeyP = false;
        }

        if (this._pause) return;  // 一時停止中なら何もしない

        // ステージカウンタ更新
        this.countUp();

        // プレーヤー更新
        this.updatePlayer(delta, Key.keys);

        // 敵更新
        this.updateEnemies();

        // 弾丸衝突判定、点数加算、他
        this.hitTest();
    }

    // プレーヤー破壊
    public playerDestroyed() {

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

    public updatePlayer(delta: number, keys: Key.KeyStatus) {
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
            keys.Space = false; // 1回押すごとに一発（これがないとスペースが押しっぱなし状態になってしまう）

            const playerPos = player.getPos();
            if (playerPos) {
                // 弾丸生成
                playerBullets.genNewBullets(this._bulletMode, playerPos.x, playerPos.y, 64, 64)

                // 発射音
                Sound.playSE("shot");
            }
        }

        // ----------------------------
        //  弾丸モード切替
        // ----------------------------
        if (keys.Digit1) {
            this._bulletMode = "single";
            console.log('single-shot');
            keys.Digit1 = false;
        }
        if (keys.Digit2) {
            this._bulletMode = "multi3";
            console.log('multi-shot');
            keys.Digit2 = false;
        }
        if (keys.Digit3) {
            this._bulletMode = "spread3";
            console.log('spread');
            keys.Digit3 = false;
        }
        if (keys.Digit4) {
            this._bulletMode = "laser";
            console.log('laser');
            keys.Digit4 = false;
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