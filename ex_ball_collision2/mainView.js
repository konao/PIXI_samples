// *******************************************************
//  ピンボール作成のための実験(2)
//
//  2021/5/1 konao
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const U = require('./utils');

const { Ball } = require('./ball');
const { Wall } = require('./wall');
const { Ejector } = require('./ejector');

let bPause = false;
// let mousePos = {x: 0, y: 0};
// let mousePressPos = {x: 0, y: 0, which: 0};
let ej = new Ejector();
let ballList = [];

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

    ej.setPos({x: 0, y: 0});
    ej.init(PIXI, app.stage, w, h);

    app.ticker.add((delta) => {
        // 画面更新
        if (!bPause) {
            ej.update(wall);
            wall.update();
            ballList.forEach(ball => {
                ball.update(wall);
            })
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
    if (ej) {
        let mousePos = {
            x: e.clientX,
            y: e.clientY
        };
        ej.setMousePos(mousePos);
    }
});

$(window).on('mousedown', e => {
    // console.log(`x=${e.clientX}, y=${e.clientY}`);
    console.log(e);
    if (e.which === 1) {
        // 左ボタンクリック
        let mousePressPos = {
            x: e.clientX,
            y: e.clientY
        };
        if (ej) ej.setMouesPressPos(mousePressPos);        
    } else if (e.which === 3) {
        // 右ボタンクリック
        if (ej) {
            // ejectorから位置、方向を得る
            let ejPos = ej.getPos();
            let ejVec = ej.getVec();

            // ボールを生成
            let newBall = new Ball();
            newBall.setPosDirect(ejPos);
            newBall.setVec(ejVec);
            const w = window.innerWidth;
            const h = window.innerHeight;
            newBall.init(PIXI, app.stage, w, h);

            console.log(`newBall: (x,y)=(${ejPos.x}, ${ejPos.y})`);
            ballList.push(newBall);
        }
    }
});