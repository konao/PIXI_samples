// **************************************************
//  React+素のPIXI.jsサンプルコード(2)
//
//  太陽系の簡易シミュレーションを表示
// **************************************************
import React from 'react';
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import SolarSystem from './SolarSystem';

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
      background: '#1099bb',
      antialias: true,
    }).then(() => {
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      const solarSystem = new SolarSystem(app);

      app.ticker.add(() => {
        solarSystem.update();
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
