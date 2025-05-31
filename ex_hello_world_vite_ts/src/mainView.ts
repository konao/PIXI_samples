// *******************************************************
//  TypeScript + Vite + PIXI.jsのHello Worldサンプル
//
//  2025/5/31 konao
// *******************************************************

import * as PIXI from 'pixi.js';
// import $ from 'jquery';

(async () =>
{
    try {
    // Create a new application
    const app = new PIXI.Application();

    await app.init({
        // width: 800,
        // height: 600,
        background: '#1099bb', 
        resizeTo: window, 
        antialias: true,
    })

    document.body.appendChild(app.canvas);

    let g = new PIXI.Graphics();

    g.clear();
    g.ellipse(200, 200, 150, 150);
    g.fill("00ff00");

    // v7までの書き方（v8で大きく変わったらしい）
    // g.setStrokeStyle(10, 0x00ff00, 0.7);  // 太さ、色、アルファ(0=透明)
    // g.ellipse(300, 300, 100, 100);  // 中心(cx, cy), 半径(rx, ry)

    app.stage.addChild(g);

    } catch (error) {
        console.error('Error initializing PIXI application:', error);
    }
})();

// // ロード時とリサイズ時の両方でイベントを受け取る
// // https://qiita.com/chillart/items/15bc48f98897391e12ca
// $(window).on('load resize', () => {
//     let w = window.innerWidth-30;
//     let h = window.innerHeight-50;
//     app.renderer.resize(w, h);
// });

// $(window).on('keydown', e => {
//     // console.log(`keydown (${e.which})`);
//     switch (e.which) {
//         case 32:    // space
//         {
//             bPause = !bPause;
//             break;
//         }
//     }
// });
