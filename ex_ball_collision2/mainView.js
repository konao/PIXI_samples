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
const { Text } = require('./text');

let g_w = 0;
let g_h = 0;
let g_bPause = false;
let g_nBalls = 0;   // ボールの個数
let g_ballSize = 5; // ボールのサイズ
let g_ballSpeed = 1;    // ボールのスピード

let g_ej = new Ejector();
let g_ballList = [];
let g_wallList = [];

let g_infoText = null;

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
    g_w = window.innerWidth-30;
    g_h = window.innerHeight-50;
    app.renderer.resize(g_w, g_h);

    // loader.add('assets/characters.json');
    loader.load((loader, resources) => {

        // 壁生成
        let w0 = new Wall();
        w0.setWallPoints([
            {x: 10, y: 10},
            {x: g_w-10, y: 10},
            {x: g_w-10, y: g_h-10},
            {x: 10, y: g_h-10}
        ]);
        w0.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w0);

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
        w1.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w1);

        let w2 = new Wall();
        w2.setWallPoints([
            {x: 600, y: 100},
            {x: 900, y: 150},
            {x: 700, y: 400}
        ]);
        w2.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w2);

        let w3 = new Wall();
        w3.setWallPoints([
            {x: 1200, y: 400},
            {x: 1300, y: 800},
            {x: 800, y: 800},
            {x: 1000, y: 700}
        ]);
        w3.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w3);    

        let w4 = new Wall();
        w4.genCircleWallPoints(1200, 150, 50);
        w4.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w4);

        let w5 = new Wall();
        w5.genCircleWallPoints(500, 300, 40);
        w5.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w5);

        let w6 = new Wall();
        w6.genCircleWallPoints(200, 700, 50);
        w6.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w6);

        // イジェクター生成
        g_ej.setPos({x: g_w/2, y: g_h/2});
        g_ej.init(PIXI, app.stage, g_w, g_h);

        // 操作説明
        new Text()
            .initSprite(PIXI, app.stage)
            .setText('→/← : size up/down  ↑/↓ : speed up/down')
            .setPos(10, 10)
            .setFontSize(20)
            .setColor('cyan');
    
        new Text()
            .initSprite(PIXI, app.stage)
            .setText('mouse left click : eject ball / right click : ejector pos move')
            .setPos(g_w-530, 10)
            .setFontSize(20)
            .setColor('cyan');

        g_infoText = new Text()
            .initSprite(PIXI, app.stage)
            .setText(`balls: ${g_nBalls}  size: ${g_ballSize}  speed: ${g_ballSpeed}`)
            .setPos(10, 30)
            .setFontSize(20)
            .setColor('cyan');

        // [TEST]
        g_G = new PIXI.Graphics();
        app.stage.addChild(g_G);
        g_Msg = new Text()
            .initSprite(PIXI, app.stage)
            .setText(`dist`)
            .setPos(10, 850)
            .setFontSize(20)
            .setColor('cyan');

        app.ticker.add((delta) => {
            // 画面更新
            if (!g_bPause) {
                g_ej.update(g_wallList);
                g_wallList.forEach(wall => {
                    wall.update();
                });
                g_ballList.forEach(ball => {
                    ball.update(g_wallList);
                });
            }
        });
    });
});

const showStatus = () => {
    if (g_infoText) {
        g_infoText.setText(`balls: ${g_nBalls}  size: ${g_ballSize}  speed: ${g_ballSpeed}`);
    }
}

$(window).on('resize', () => {
    g_w = window.innerWidth-30;
    g_h = window.innerHeight-50;
    app.renderer.resize(g_w, g_h);
    console.log(`resized to (${g_w}, ${g_h})`);
});

$(window).on('mousemove', e => {
    // console.log(`x=${e.clientX}, y=${e.clientY}`);
    if (g_ej) {
        let mousePos = {
            x: e.clientX,
            y: e.clientY
        };
        g_ej.setMousePos(mousePos);
    }
});

// [TEST]
let g_cc = 0;
let g_pA = null;
let g_pB = null;
let g_pX = null;
let g_pY = null;
let g_G = null;
let g_Msg = null;

$(window).on('mousedown', e => {
    // console.log(`x=${e.clientX}, y=${e.clientY}`);
    console.log(e);
    if (e.which === 3) {
        // 右ボタンクリック
        let mousePressPos = {
            x: e.clientX,
            y: e.clientY
        };
        if (g_ej) g_ej.setMouesPressPos(mousePressPos);

        switch (g_cc) {
            case 0: {
                g_pA = mousePressPos;
                g_cc++;
                break;
            }
            case 1: {
                g_pB = mousePressPos;
                g_cc++;
                break;
            }
            case 2: {
                g_pX = mousePressPos;
                g_cc++;
                break;
            }
            case 3: {
                g_pY = mousePressPos;
                g_cc=0;
                break;
            }
        }
        if ((g_pA !== null) && (g_pB !== null) && (g_pX !== null) && (g_pY !== null)) {
            g_G.clear();
            g_G.lineStyle(1, 0xffff00, 1);  // 黄色
            g_G.moveTo(g_pA.x, g_pA.y);
            g_G.lineTo(g_pB.x, g_pB.y);

            g_G.lineStyle(1, 0xff0000, 1);  // 赤
            g_G.moveTo(g_pX.x, g_pX.y);
            g_G.lineTo(g_pY.x, g_pY.y);

            let di = U.calcLinesDist(g_pA, g_pB, g_pX, g_pY, 0);
            if (di !== null) {
                if (di.dmin !== null) {
                    g_Msg.setText(`dmin=${di.dmin}`);
                } else {
                    g_Msg.setText(`dmin=null`);
                }

                if (di.pMin !== null) {
                    g_G.lineStyle(1, 0x00ffff, 1);
                    g_G.beginFill(0x0000ff);
                    g_G.drawEllipse(di.pMin.x, di.pMin.y, 7, 7);
                    g_G.endFill();
                }
            }
        }

    } else if (e.which === 1) {
        // 左ボタンクリック
        if (g_ej) {
            // ejectorから位置、方向を得る
            let ejPos = g_ej.getPos();
            let ejVec = g_ej.getVec();
            ejVec = U.vecScalar(ejVec, g_ballSpeed);

            // ボールを生成
            let newBall = new Ball();
            newBall.setRadius(g_ballSize)
                .setBallPos(ejPos)
                .setVec(ejVec);
            newBall.init(PIXI, app.stage, g_w, g_h);

            g_ballList.push(newBall);
            g_nBalls++;
            showStatus();
        }
    }
});

$(window).on('keydown', e => {
    // console.log(`keydown (${e.which})`);
    switch (e.which) {
        case 32:    // space
        {
            g_bPause = !g_bPause;
            break;
        }
        case 37:    // left
        {
            // ボールサイズ縮小
            if (g_ballSize > 1) {
                g_ballSize--;
                showStatus();
            }
            break;
        }
        case 39:    // right
        {
            // ボールサイズ拡大
            if (g_ballSize < 30) {
                g_ballSize++;
                showStatus();
            }
            break;
        }
        case 38:    // up
        {
            // ボールスピードアップ
            if (g_ballSpeed < 50) {
                g_ballSpeed++;
                showStatus();
            }
            break;
        }
        case 40:    // down
        {
            // ボールスピードダウン
            if (g_ballSpeed > 1) {
                g_ballSpeed--;
                showStatus();
            }
            break;
        }
    }
});

// test
let dists;
dists = [
    {target: {dist: 10}, aux: 'A'},
    {target: {dist: null}, aux: 'B'},
    {target: {dist: 5}, aux: 'C'},
    {target: {dist: null}, aux: 'D'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: -3}, aux: 'A'},
    {target: {dist: 10}, aux: 'B'},
    {target: {dist: 5}, aux: 'C'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: null}, aux: 'A'},
    {target: {dist: 10}, aux: 'B'},
    {target: {dist: null}, aux: 'C'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: null}, aux: 'A'},
    {target: {dist: 10}, aux: 'B'},
    {target: {dist: 2}, aux: 'C'},
    {target: {dist: null}, aux: 'D'},
    {target: {dist: 8}, aux: 'E'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: 7}, aux: 'A'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: null}, aux: 'A'},
    {target: {dist: null}, aux: 'B'},
    {target: {dist: null}, aux: 'C'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: null}, aux: 'A'}
];
console.log(U.getMinDist(dists));

dists = [];
console.log(U.getMinDist(dists));
