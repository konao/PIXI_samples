// ************************************************************
//  ゲーム本体（ステート管理のみ）
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
    // private _state: GameState = GameState.Playing;
    private _containers: Utils.Containers | null = null;
    private _titleStage: Stage.TitleStage = new Stage.TitleStage();
    private _playStage: Stage.PlayStage = new Stage.PlayStage();
    private _gameOverStage: Stage.GameOverStage = new Stage.GameOverStage();
    private _fontManager: Font.FontManager = new Font.FontManager();

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

        // addChildの順番に注意
        // （後に追加したものが上に表示される）
        app.stage.addChild(particleContainer);
        app.stage.addChild(normalContainer);
        app.stage.addChild(effectContainer);
        app.stage.addChild(uiContainer);
        app.stage.addChild(titleContainer);

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
        this._gameOverStage.init(this, containers, wholeTexture, scrSize);

        // 最初のステートへ移行
        this.switchState(GameState.Title);
    }

    public getFontManager() {
        return this._fontManager;
    }

    public switchState(state: GameState) {
        if (!this._containers) return;

        this._state = state;
        switch (state) {
            case GameState.Title:
                this._containers.setVisible(Utils.ContainerType.Title);
                break;
            case GameState.Playing:
            case GameState.PlayerDead:
                this._containers.setVisible(Utils.ContainerType.Game);
                break;
            case GameState.GameOver:
                this._containers.setVisible(Utils.ContainerType.Title);
                break;
        }
    }

    public update(delta: number) {
        switch (this._state) {
            case GameState.Title:
                this._titleStage.update(delta);
                break;
            case GameState.Playing:
            case GameState.PlayerDead:
                this._playStage.update(delta);
                break;
            case GameState.GameOver:
                this._gameOverStage.update(delta);
                break;
        }
    }
}
