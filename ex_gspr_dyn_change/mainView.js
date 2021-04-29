// *******************************************************
//  PIXI.Graphicsクラスのデモ(2)
//  スプライトの画像イメージを動的に変化させる
//
//  2021/4/29 konao
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const U = require('./utils');

const { DynSpr } = require('./dynspr');

let bPause = false;
let mousePos = {x: 0, y: 0};

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

    // スプライト生成＆初期化
    let gspr = new DynSpr();
    gspr.init(PIXI, app.stage, w, h);

    app.ticker.add((delta) => {
        // 画面更新
        gspr.setMousePos(mousePos);
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

$(window).on('mousemove', e => {
    // console.log(`x=${e.clientX}, y=${e.clientY}`);
    mousePos = {
        x: e.clientX,
        y: e.clientY
    };
});