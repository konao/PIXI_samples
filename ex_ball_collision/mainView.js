// *******************************************************
//  ピンボール作成のための実験(1)
//
//  2021/4/30 konao
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const U = require('./utils');

const { Ball } = require('./ball');
const { Wall } = require('./wall');

let bPause = false;
let mousePos = {x: 0, y: 0};
let mousePressPos = {x: 0, y: 0};

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
    let wall = new Wall();
    wall.setWallPoints([
        {x: 100, y: 200},
        {x: 300, y: 100},
        {x: 400, y: 400},
        {x: 700, y: 600},
        {x: 1000, y: 300},
        {x: 900, y: 600},
        {x: 500, y: 800}
    ]);
    wall.init(PIXI, app.stage, w, h);

    let ball = new Ball();
    ball.setPos({x: 0, y: 0});
    ball.init(PIXI, app.stage, w, h);

    app.ticker.add((delta) => {
        // 画面更新
        ball.setMouesPressPos(mousePressPos);
        ball.setMousePos(mousePos);
        if (!bPause) {
            ball.update(wall);
            wall.update();
        }
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

$(window).on('mousedown', e => {
    // console.log(`x=${e.clientX}, y=${e.clientY}`);
    mousePressPos = {
        x: e.clientX,
        y: e.clientY
    };
});