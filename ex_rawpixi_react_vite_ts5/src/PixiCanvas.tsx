// **************************************************
//  ParticleContainerのサンプル
//
//  シューティングゲームの試作
//
//  2026/09/08
// **************************************************
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import * as Stage from './Stage';
import * as Utils from './Utils';

// ── windowオブジェクトの型定義を追加 ──
// declare global {
//   interface Window {
//     electronAPI: {
//       getData: () => Promise<any>; // 必要に応じて 'any' を適切なJSONの型に書き換えてもOKです
//     };
//   }
// }

// =================================================
//  Global Variables
// =================================================
const g_stage = new Stage.Stage();

export default function PixiCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application>();

  useEffect(() => {
    const app = new PIXI.Application();
    appRef.current = app;

    // PIXI v8: 非同期初期化
    app.init({
      width: 800,
      height: 1024,
      background: '#002244',
      antialias: true,
    }).then(async () => {
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      // メインプロセスで読み込まれているJSONデータを取得
      // const data = await window.electronAPI.getData();
      // console.log('メインプロセスから受け取ったJSON:', data);

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

      // JSONファイルをAssets.loadすると、内部の画像も自動でロード・分割される
      const wholeTexture = await PIXI.Assets.load<PIXI.Spritesheet>('image/SpaceShooterAssets.json');

      // ステージ初期化
      const containers = new Utils.Containers(particleContainer, normalContainer, effectContainer, uiContainer);
      await g_stage.init(app, containers, wholeTexture, app.screen.width, app.screen.height);

      app.ticker.add((ticker) => {
        // 前のフレームからの経過時間（秒に変換するためのデルタ値）
        const delta = ticker.deltaTime;

        // ステージ更新
        g_stage.update(delta);
      });
    });

    return () => {
      // クリーンアップ
      appRef.current?.destroy(true);
      if (canvasRef.current?.firstChild) {
        canvasRef.current.removeChild(canvasRef.current.firstChild);
      }
    };
  }, []);

  return <div ref={canvasRef} />;
}
