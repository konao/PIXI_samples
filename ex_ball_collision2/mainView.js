// *******************************************************
//  ピンボール作成のための実験(2) メインビュー
//
//  2021/5/5 konao
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const U = require('./utils');

const { Ball } = require('./ball');
const { Wall } = require('./wall');
const { Ejector } = require('./ejector');

let w = 0;
let h = 0;
let bPause = false;

let ej = new Ejector();
let ballList = [];
let wallList = [];

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

// ロード時とリサイズ時の両方でイベントを受け取る
// https://qiita.com/chillart/items/15bc48f98897391e12ca
$(window).on('load', () => {
    w = window.innerWidth-30;
    h = window.innerHeight-50;
    app.renderer.resize(w, h);

    // loader.add('assets/characters.json');
    loader.load((loader, resources) => {

        // 壁生成
        let w0 = new Wall();
        w0.setWallPoints([
            {x: 10, y: 10},
            {x: w-10, y: 10},
            {x: w-10, y: h-10},
            {x: 10, y: h-10}
        ]);
        w0.init(PIXI, app.stage, w, h);
        wallList.push(w0);

        let w1 = new Wall();
        w1.setWallPoints([
            {x: 100, y: 200},
            {x: 300, y: 100},
            {x: 400, y: 400},
            {x: 700, y: 600},
            {x: 1000, y: 300},
            {x: 900, y: 600},
            {x: 500, y: 800}
        ]);
        w1.init(PIXI, app.stage, w, h);
        wallList.push(w1);

        let w2 = new Wall();
        w2.setWallPoints([
            {x: 600, y: 100},
            {x: 900, y: 150},
            {x: 700, y: 400}
        ]);
        w2.init(PIXI, app.stage, w, h);
        wallList.push(w2);

        // let w3 = new Wall();
        // w3.setWallPoints([
        //     {x: 1200, y: 400},
        //     {x: 1300, y: 800},
        //     {x: 800, y: 800},
        //     {x: 1000, y: 700}
        // ]);
        // w3.init(PIXI, app.stage, w, h);
        // wallList.push(w3);    

        // let w4 = new Wall();
        // w4.genCircleWallPoints(1200, 150, 50);
        // w4.init(PIXI, app.stage, w, h);
        // wallList.push(w4);

        // let w5 = new Wall();
        // w5.genCircleWallPoints(500, 300, 40);
        // w5.init(PIXI, app.stage, w, h);
        // wallList.push(w5);

        // let w6 = new Wall();
        // w6.genCircleWallPoints(200, 700, 50);
        // w6.init(PIXI, app.stage, w, h);
        // wallList.push(w6);

        // イジェクター生成
        ej.setPos({x: 0, y: 0});
        ej.init(PIXI, app.stage, w, h);

        app.ticker.add((delta) => {
            // 画面更新
            if (!bPause) {
                ej.update(wallList);
                wallList.forEach(wall => {
                    wall.update();
                });
                ballList.forEach(ball => {
                    ball.update(wallList);
                });
            }
        });
    });
});

$(window).on('resize', () => {
    w = window.innerWidth-30;
    h = window.innerHeight-50;
    app.renderer.resize(w, h);
    console.log(`resized to (${w}, ${h})`);
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
    if (e.which === 3) {
        // 右ボタンクリック
        let mousePressPos = {
            x: e.clientX,
            y: e.clientY
        };
        if (ej) ej.setMouesPressPos(mousePressPos);        
    } else if (e.which === 1) {
        // 左ボタンクリック
        if (ej) {
            // ejectorから位置、方向を得る
            let ejPos = ej.getPos();
            let ejVec = ej.getVec();

            let len = Math.sqrt(ejVec.x*ejVec.x + ejVec.y*ejVec.y);
            console.log(`len(ejVec)=${len}`);

            // ボールを生成
            let newBall = new Ball();
            newBall.setBallPos(ejPos);
            newBall.setVec(ejVec);
            const w = window.innerWidth;
            const h = window.innerHeight;
            newBall.init(PIXI, app.stage, w, h);

            console.log(`newBall: (x,y)=(${ejPos.x}, ${ejPos.y})`);
            ballList.push(newBall);
        }
    }
});