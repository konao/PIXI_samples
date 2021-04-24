// *******************************************************
//  PIXI.Graphicsクラスのデモ(1)
//  回転する円
//
//  PIXI.GraphicsはCanvasライクな描画プリミティブ関数を使って、
//  スプライト画像を動的に生成できるクラス
//
//  2021/4/24 konao
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const U = require('./utils');
const { Spr1 } = require('./spr1');

let bPause = false;

//Create a Pixi Application
let app = new PIXI.Application({ 
    view: document.getElementById('myCanvas'),
    width: 640, 
    height: 480,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);
app.renderer.autoResize = true;
app.stage.interactive = true;

const loader = PIXI.Loader.shared;
// loader.add('assets/characters.json');
loader.load((loader, resources) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    let gspr = new Spr1();
    gspr.init(PIXI, app.stage, w, h);

    app.ticker.add((delta) => {
        if (!bPause) gspr.update();
    });
});

// ロード時とリサイズ時の両方でイベントを受け取る
// https://qiita.com/chillart/items/15bc48f98897391e12ca
$(window).on('load resize', () => {
    let w = window.innerWidth-30;
    let h = window.innerHeight-50;
    app.renderer.resize(w, h);
});

$(window).on('keydown', e => {
    // console.log(`keydown (${e.which})`);
    switch (e.which) {
        case 32:    // space
        {
            bPause = !bPause;
            break;
        }
    }
});
