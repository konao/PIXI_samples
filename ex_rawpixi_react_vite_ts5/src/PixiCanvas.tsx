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
import * as Player from './Player';
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

// キーボードの入力状態を管理するオブジェクト
const keys: { [key: string]: boolean } = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

let bulletMode: number = 1;
let pause: boolean = false;

// 2. イベントリスナーを登録（キーが押されたか離されたかを記録）
window.addEventListener('keydown', (e) => {
  if (e.key in keys) {
    keys[e.key] = true;
    e.preventDefault(); // 画面がブラウザでスクロールするのを防ぐ
  }
  switch (e.code) {
    case 'Space': {
      keys.Space = true;
      e.preventDefault(); // スクロール防止
      break;
    }
    case 'Digit1': {
      bulletMode = 1;
      console.log(bulletMode);
      e.preventDefault(); // スクロール防止
      break;
    }
    case 'Digit3': {
      bulletMode = 3;
      console.log(bulletMode);
      e.preventDefault(); // スクロール防止
      break;
    }
    case 'Digit5': {
      bulletMode = 5;
      console.log(bulletMode);
      e.preventDefault(); // スクロール防止
      break;
    }
    case 'KeyP': {
      pause = !pause;
      console.log(`pause: ${pause}`);
      e.preventDefault(); // スクロール防止
      break;
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key in keys) {
    keys[e.key] = false;
  }
  if (e.code === 'Space') {
    keys.Space = false;
  }
});

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
      const effectContainer = new PIXI.Container();

      // UI用コンテナ
      const uiContainer = new PIXI.Container();

      // JSONファイルをAssets.loadすると、内部の画像も自動でロード・分割される
      const wholeTexture = await PIXI.Assets.load<PIXI.Spritesheet>('image/SpaceRage.json');

      // ステージ初期化
      const containers = new Utils.Containers(particleContainer, effectContainer, uiContainer);
      await g_stage.init(app, containers, wholeTexture, app.screen.width, app.screen.height);

      // 移動速度（1秒間に移動するピクセル数）
      const moveSpeed = 300;

      app.ticker.add((ticker) => {
        if (pause) return;  // 一時停止中なら何もしない

        // 前のフレームからの経過時間（秒に変換するためのデルタ値）
        const delta = ticker.deltaTime;

        // 1フレームあたりの実際の移動量
        const distance = (moveSpeed / 60) * delta;

        const player = g_stage.getPlayer();
        const bullets = g_stage.getBullets();
        const enemies = g_stage.getEnemies();

        g_stage.countUp();

        // 上下左右の移動計算
        if (keys.ArrowUp) player?.move(0, -distance);
        if (keys.ArrowDown) player?.move(0, distance);
        if (keys.ArrowLeft) player?.move(-distance, 0);
        if (keys.ArrowRight) player?.move(distance, 0);
        if (keys.Space) {
          keys.Space = false; // 1回押すごとに一発

          const playerPos = player?.getPos();
          if (playerPos) {
            // 弾丸生成
            bullets?.genNewBullets(bulletMode, playerPos.x, playerPos.y, 64, 64)
          }
        }

        // 弾丸移動
        bullets?.update();

        if ((g_stage.getCount() % 100) == 0) {
          // 敵生成
          enemies?.genEnemies();
        }

        // 敵移動
        enemies?.update();

        // 弾丸衝突判定、点数加算、他
        if (player && bullets && enemies) {
          g_stage.hitTest(player, bullets, enemies);
        }
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
