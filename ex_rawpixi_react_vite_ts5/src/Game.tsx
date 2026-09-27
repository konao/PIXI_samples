// ************************************************************
//  ゲーム本体
// ************************************************************

import * as PIXI from 'pixi.js';
import * as Stage from './Stage';
import * as Font from './Font';
import * as Utils from './Utils';

export enum GameState {
    Title,
    Playing,
    PlayerDead,
    GameOver
}

export class Game {
    private _state: GameState = GameState.Title;
    private _containers: Utils.Containers | null = null;
    private _titleStage: Stage.TitleStage = new Stage.TitleStage();
    private _playStage: Stage.PlayStage = new Stage.PlayStage();
    private _fontManager: Font.FontManager = new Font.FontManager();
    private _playerDeadWaitCount: number = 0;
    private _gameOverWaitCount: number = 0;

    public async init(app: PIXI.Application, scrSize: Utils.Vec2) {
        // -------------------------------
        //  コンテナ作成
        // -------------------------------

        // ParticleContainerの作成（動かすプロパティを有効化）
        const particleContainer = new PIXI.ParticleContainer({
            dynamicProperties: {
                position: true, // 位置の変更を許可
                scale: true,    // 拡大・縮小の変更を許可
                rotation: true, // 回転の変更を許可
                color: true,     // アルファ値（透明度）の変更を許可
                vertex: true // 動的にパーティクルのテクスチャを変える場合に必要
            }
        });

        // 通常のContainerの作成（アニメーション付きスプライト用）
        const normalContainer = new PIXI.Container();

        // エフェクト用Containerの作成（アニメーション付きスプライト用）
        const effectContainer = new PIXI.Container();

        // UI用コンテナ
        const uiContainer = new PIXI.Container();

        // タイトル用コンテナ
        const titleContainer = new PIXI.Container();

        // ゲームオーバー画面用コンテナ
        const gameOverContainer = new PIXI.Container();

        // addChildの順番に注意
        // （後に追加したものが上に表示される）
        app.stage.addChild(particleContainer);
        app.stage.addChild(normalContainer);
        app.stage.addChild(effectContainer);
        app.stage.addChild(uiContainer);
        app.stage.addChild(titleContainer);
        app.stage.addChild(gameOverContainer);

        // -------------------------------
        //  テクスチャロード
        // -------------------------------

        // JSONファイルをAssets.loadすると、内部の画像も自動でロード・分割される
        const wholeTexture: PIXI.Spritesheet = await PIXI.Assets.load<PIXI.Spritesheet>('image/SpaceShooterAssets.json');

        // -------------------------------
        //  フォント作成
        // -------------------------------
        await this._fontManager.init();

        // -------------------------------
        //  ステージ初期化
        // -------------------------------
        const containers: Utils.Containers = new Utils.Containers(particleContainer, normalContainer, effectContainer, uiContainer, titleContainer);
        this._containers = containers;
        this._titleStage.init(this, containers, wholeTexture, scrSize);
        this._playStage.init(this, containers, wholeTexture, scrSize);

        // 最初のステートへ移行
        this.switchState(GameState.Title);
    }

    public getFontManager() {
        return this._fontManager;
    }

    public getState() {
        return this._state;
    }

    public switchState(state: GameState) {
        if (!this._containers) return;

        this._state = state;
        switch (state) {
            case GameState.Title:
                this._containers.setVisible(Utils.ContainerType.Title);
                this._playStage.hardStart();
                break;
            case GameState.Playing:
                this._containers.setVisible(Utils.ContainerType.Game);
                this._playStage.softStart();
                break;
            case GameState.PlayerDead:
                this._containers.setVisible(Utils.ContainerType.Game);
                this._playerDeadWaitCount = 400;    // 復活するまでのカウンタ
                break;
            case GameState.GameOver:
                this._containers.setVisible(Utils.ContainerType.Game);
                this._playStage.gameOver();
                this._gameOverWaitCount = 700;  // タイトル画面に戻るまでのカウンタ
                break;
        }
    }

    public update(delta: number) {
        switch (this._state) {
            case GameState.Title:
                this._titleStage.update(delta);
                break;
            case GameState.Playing:
                this._playStage.update(delta);
                break;
            case GameState.PlayerDead:
                this._playerDeadWaitCount -= 1;
                if (this._playerDeadWaitCount <= 0) {
                    // 0になったら再びプレイ状態に遷移
                    this.switchState(GameState.Playing);
                } else {
                    this._playStage.update(delta);
                }
                break;
            case GameState.GameOver:
                this._gameOverWaitCount -= 1;
                if (this._gameOverWaitCount <= 0) {
                    // 0になったらタイトル画面へ遷移
                    this.switchState(GameState.Title);
                } else {
                    this._playStage.update(delta);
                }
                break;
        }
    }
}
