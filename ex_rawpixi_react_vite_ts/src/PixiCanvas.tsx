import React from 'react';
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
      width: 600,
      height: 400,
      background: '#1099bb',
      antialias: true,
    }).then(() => {
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      const g = new PIXI.Graphics();
      g.circle(300, 200, 100).fill(0x88ff00);

      app.stage.addChild(g);
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
