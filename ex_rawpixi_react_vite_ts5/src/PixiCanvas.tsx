// **************************************************
//  ParticleContainerのサンプル
//
//  シューティングゲームの試作
//
//  2026/09/08
// **************************************************
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import * as Game from './Game';
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
const g_game = new Game.Game();

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

      const scrSize: Utils.Vec2 = { x: app.screen.width, y: app.screen.height }
      await g_game.init(app, scrSize);

      app.ticker.add((ticker) => {
        // 前のフレームからの経過時間（秒に変換するためのデルタ値）
        const delta = ticker.deltaTime;

        // ゲーム状態更新
        g_game.update(delta);
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
