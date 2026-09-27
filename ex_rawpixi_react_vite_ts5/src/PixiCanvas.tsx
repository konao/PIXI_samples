// **************************************************
//  ParticleContainerのサンプル
//
//  シューティングゲームの試作
//
//  2026/09/08
// **************************************************
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
// import * as Texture from './Texture';
// import * as Terrain from './Terrain';

// ── windowオブジェクトの型定義を追加 ──
// declare global {
//   interface Window {
//     electronAPI: {
//       getData: () => Promise<any>; // 必要に応じて 'any' を適切なJSONの型に書き換えてもOKです
//     };
//   }
// }

// キーボードの入力状態を管理するオブジェクト
const keys: { [key: string]: boolean } = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// 2. イベントリスナーを登録（キーが押されたか離されたかを記録）
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault(); // 画面がブラウザでスクロールするのを防ぐ
    }
    if (e.code === 'Space') {
        keys.Space = true;
        e.preventDefault(); // スクロール防止
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
              color: true     // アルファ値（透明度）の変更を許可
          }
      });
      app.stage.addChild(particleContainer);

      // JSONファイルをAssets.loadすると、内部の画像も自動でロード・分割される
      const wholeTexture = await PIXI.Assets.load('image/SpaceRage.json');

      // JSON内で定義した「スプライト名」で個別テクスチャを取り出せる
      const tex_player_b_m = wholeTexture.textures['Player/player_b_m.png'];
      const tex_bullet = wholeTexture.textures["FX/vulcan_3.png"]

      // プレーヤーのスプライト（パーティクル）を生成
      const player = new PIXI.Particle(tex_player_b_m);

      // 初期位置の設定
      player.x = app.screen.width / 2 - 32;
      player.y = app.screen.height * 4/5;
      // player.anchor.set(0.5); // 回転の中心を画像の中央にする
      
      particleContainer.addParticle(player);

      // 移動速度（1秒間に移動するピクセル数）
      const moveSpeed = 300;

      // 弾丸
      const bullets: PIXI.Particle[] = []

      app.ticker.add((ticker) => {
        // 前のフレームからの経過時間（秒に変換するためのデルタ値）
        const delta = ticker.deltaTime;
        
        // 1フレームあたりの実際の移動量
        const distance = (moveSpeed / 60) * delta; 

        // 上下左右の移動計算
        if (keys.ArrowUp)    player.y -= distance;
        if (keys.ArrowDown)  player.y += distance;
        if (keys.ArrowLeft)  player.x -= distance;
        if (keys.ArrowRight) player.x += distance;
        if (keys.Space) {
          keys.Space = false; // 1回押すごとに一発

          // 弾丸のスプライトを生成
          const bullet = new PIXI.Particle(tex_bullet)
          bullet.x = player.x + 32;
          bullet.y = player.y - 10;
          bullets.push(bullet)
          particleContainer.addParticle(bullet)
        }

        if (bullets.length > 0) {
          const indsToRemove: number[] = [];

          // 弾丸移動
          for (let i=0; i<bullets.length; i++) {
            const p = bullets[i]
            p.y -= 10;
            if (p.y < 0) {
              // 画面を外れたものを削除対象に入れる
              indsToRemove.push(i)
            }
          }

          // 画面を外れた弾丸は消す
          if (indsToRemove.length > 0) {
            // 降順にソート
            const sortedInds = indsToRemove.sort((a, b) => b-a)

            for (const i of sortedInds) {
              const bullet = bullets[sortedInds[i]]
              particleContainer.removeParticle(bullet); // コンテナから消す
              bullets.splice(i, 1); // i番目の要素を削除して配列の長さを縮める
            }
          }
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
