// **************************************************
//  ParticleContainerのサンプル
//
//  ParticleContainerは大量のスプライトを高速に描画するためのコンテナです。
//  ただし、通常のContainerと比べて制約があり、動かせるプロパティが限られています。
//
//  2026/08/22
// **************************************************
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function PixiCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application>();

  useEffect(() => {
    const app = new PIXI.Application();
    appRef.current = app;

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

      // 2. 透過PNGテクスチャの読み込み
      const texture = await PIXI.Assets.load('image/medievalEnvironment_04.png');

      // 3. ParticleContainerの作成（動かすプロパティを有効化）
      const particleContainer = new PIXI.ParticleContainer({
          dynamicProperties: {
              position: true, // 位置の変更を許可
              scale: true,    // 拡大・縮小の変更を許可
              rotation: true, // 回転の変更を許可
              color: true     // アルファ値（透明度）の変更を許可
          }
      });
      app.stage.addChild(particleContainer);

      // 4. 大量スプライトの生成とコンテナへの追加
      const sprites: PIXI.Particle[] = [];
      const totalSprites = 1000; // 1000個生成（数万個でも高速に動作します）

      for (let i = 0; i < totalSprites; i++) {
          const sprite = new PIXI.Particle(texture);
          
          // 初期位置の設定
          sprite.x = Math.random() * app.screen.width;
          sprite.y = Math.random() * app.screen.height;
          // sprite.anchor.set(0.5); // 回転の中心を画像の中央にする
          
          // 独自のアニメーション用パラメータを仕込んでおく
          sprite.speedX = (Math.random() - 0.5) * 2;
          sprite.speedY = (Math.random() - 0.5) * 2;
          sprite.rotSpeed = (Math.random() - 0.5) * 0.1;
          sprite.scaleSpeed = 0.01 + Math.random() * 0.02;
          sprite.pulseTimer = Math.random() * 100;

          particleContainer.addParticle(sprite);
          sprites.push(sprite);
      }

      app.ticker.add(() => {
        const delta = app.ticker.deltaTime;

        for (let i = 0; i < sprites.length; i++) {
            const sprite = sprites[i];

            // 1. 位置の更新
            sprite.x += sprite.speedX * delta;
            sprite.y += sprite.speedY * delta;

            // 画面外に出たら反対側から戻す
            if (sprite.x < 0) sprite.x = app.screen.width;
            if (sprite.x > app.screen.width) sprite.x = 0;
            if (sprite.y < 0) sprite.y = app.screen.height;
            if (sprite.y > app.screen.height) sprite.y = 0;

            // 2. 回転の更新
            sprite.rotation += sprite.rotSpeed * delta;

            // 3. 拡大・縮小、4. アルファ値（透明度）の動的変更
            sprite.pulseTimer += 0.05 * delta;
            
            // サイン波を使って、拡大縮小と透明度を滑らかに変化させる
            const pulse = Math.sin(sprite.pulseTimer); 
            // sprite.scale.set(1 + pulse * 0.3); // 0.7倍 〜 1.3倍に拡大縮小
            sprite.alpha = 0.5 + (pulse * 0.5);  // 0.0(透明) 〜 1.0(不透明) に変化
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
