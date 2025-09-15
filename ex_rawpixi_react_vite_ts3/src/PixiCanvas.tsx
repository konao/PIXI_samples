// **************************************************
//  React+素のPIXI.jsサンプルコード(3)
//
//  回転する星
// **************************************************
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Stars from './Stars';

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
    }).then(() => {
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      const stars = new Stars(app, 50);

      app.ticker.add(() => {
        stars.update();
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
