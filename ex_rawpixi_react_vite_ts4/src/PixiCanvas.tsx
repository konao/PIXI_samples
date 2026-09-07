// **************************************************
//  ParticleContainerのサンプル
//
//  ParticleContainerは大量のスプライトを高速に描画するためのコンテナ．
//  ただし、通常のContainerと比べて制約があり、動かせるプロパティが限られている．
//
//  json形式の地形データを読み込み、ParticleContainerを使って地形を描画する．
//
//  2026/09/07
// **************************************************
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import * as Texture from './Texture';
import * as Terrain from './Terrain';

// ── windowオブジェクトの型定義を追加 ──
declare global {
  interface Window {
    electronAPI: {
      getData: () => Promise<any>; // 必要に応じて 'any' を適切なJSONの型に書き換えてもOKです
    };
  }
}

export default function PixiCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application>();

  useEffect(() => {
    const app = new PIXI.Application();
    appRef.current = app;

    let textureManager: Texture.Texture;
    let terrain: Terrain.Terrain;

    // PIXI v8: 非同期初期化
    app.init({
      width: 900,
      height: 600,
      background: '#002244',
      antialias: true,
    }).then(async () => {
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      // ① メインプロセスで読み込まれているJSONデータを取得
      const data = await window.electronAPI.getData();
      console.log('メインプロセスから受け取ったJSON:', data);

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

      textureManager = new Texture.Texture();
      textureManager.createTexture(data.objTerrain2Tex).then(() => {
        console.log('テクスチャの作成が完了しました。');

        terrain = new Terrain.Terrain();
        terrain.createTerrain(data.objTerrain);

        // 4. 大量スプライトの生成とコンテナへの追加
        const sprites: PIXI.Particle[] = [];
        const xsize = terrain.getTerrainSize().xsize;
        const ysize = terrain.getTerrainSize().ysize;
        const terrainMap = terrain.getTerrainMap();
        for (let y = 0; y < ysize; y++) {
          for (let x = 0; x < xsize; x++) {
            const objs = terrainMap[y][x];
            if (objs && objs.length > 0) {
              for (const obj of objs) {
                const textureName = obj["type"];
                const tex = textureManager.getTextureByName(textureName);
                if (tex) {
                  const sprite = new PIXI.Particle(tex);
                  sprite.scaleX = 2; // 2倍に拡大
                  sprite.scaleY = 2;
                  sprite.x = x * 32; // 32ピクセルごとに配置（例）
                  sprite.y = y * 32;
                  particleContainer.addParticle(sprite);
                  sprites.push(sprite);
                } else {
                  console.warn(`Texture ${textureName} not found for terrain object.`);
                }
              }
            }
          }
        }
      });

      app.ticker.add(() => {
        // const delta = app.ticker.deltaTime;

        // for (let i = 0; i < sprites.length; i++) {
        //     const sprite = sprites[i];

        //     // 1. 位置の更新
        //     sprite.x += sprite.speedX * delta;
        //     sprite.y += sprite.speedY * delta;

        //     // 画面外に出たら反対側から戻す
        //     if (sprite.x < 0) sprite.x = app.screen.width;
        //     if (sprite.x > app.screen.width) sprite.x = 0;
        //     if (sprite.y < 0) sprite.y = app.screen.height;
        //     if (sprite.y > app.screen.height) sprite.y = 0;

        //     // 2. 回転の更新
        //     sprite.rotation += sprite.rotSpeed * delta;

        //     // 3. 拡大・縮小、4. アルファ値（透明度）の動的変更
        //     sprite.pulseTimer += 0.05 * delta;
            
        //     // サイン波を使って、拡大縮小と透明度を滑らかに変化させる
        //     const pulse = Math.sin(sprite.pulseTimer); 
        //     // sprite.scale.set(1 + pulse * 0.3); // 0.7倍 〜 1.3倍に拡大縮小
        //     sprite.alpha = 0.5 + (pulse * 0.5);  // 0.0(透明) 〜 1.0(不透明) に変化
        // }
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
