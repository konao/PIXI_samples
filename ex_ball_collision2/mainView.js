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
const { Text } = require('./text');

let g_w = 0;
let g_h = 0;
let g_bPause = false;
let g_ballSize = 10; // ボールのサイズ

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

        // let w1 = new Wall();
        // w1.setWallPoints([
        //     {x: 100, y: 200},
        //     {x: 300, y: 100},
        //     {x: 400, y: 400},
        //     {x: 700, y: 600},
        //     {x: 1000, y: 300},
        //     {x: 900, y: 600},
        //     {x: 500, y: 800}
        // ]);
        // w1.init(PIXI, app.stage, g_w, g_h);
        // g_wallList.push(w1);

        let w2 = new Wall();
        w2.setWallPoints([
            {x: 800, y: 100},
            {x: 1100, y: 150},
            {x: 1000, y: 500}
        ]);
        w2.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w2);

        // let w3 = new Wall();
        // w3.setWallPoints([
        //     {x: 1200, y: 400},
        //     {x: 1300, y: 800},
        //     {x: 800, y: 800},
        //     {x: 1000, y: 700}
        // ]);
        // w3.init(PIXI, app.stage, g_w, g_h);
        // g_wallList.push(w3);    

        // let w4 = new Wall();
        // w4.genCircleWallPoints(1200, 150, 50);
        // w4.init(PIXI, app.stage, g_w, g_h);
        // g_wallList.push(w4);

        let w5 = new Wall();
        w5.genCircleWallPoints(450, 400, 300);
        w5.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w5);

        let w6 = new Wall();
        w6.genCircleWallPoints(900, 700, 50);
        w6.init(PIXI, app.stage, g_w, g_h);
        g_wallList.push(w6);

        // 操作説明
        new Text()
            .initSprite(PIXI, app.stage)
            .setText('→/← : size up/down')
            .setPos(10, 10)
            .setFontSize(20)
            .setColor('cyan');
    
        new Text()
            .initSprite(PIXI, app.stage)
            .setText('mouse left click and drag: move arrow')
            .setPos(g_w-530, 10)
            .setFontSize(20)
            .setColor('cyan');

        g_infoText = new Text()
            .initSprite(PIXI, app.stage)
            .setText(`size: ${g_ballSize}`)
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

        draw();

        app.ticker.add((delta) => {
            // 画面更新
            if (!g_bPause) {
                g_wallList.forEach(wall => {
                    wall.update();
                });
                // g_ballList.forEach(ball => {
                //     ball.update(g_wallList);
                // });

                if (g_arrowDragging > 0) {
                    draw();
                }
            }
        });
    });
});

const draw = () => {
    g_G.clear();
    if ((g_pA !== null) && (g_pB !== null)) {
        // AからBへの線を引く
        g_G.lineStyle(1, 0xffff00, 1);  // 黄色
        g_G.moveTo(g_pA.x, g_pA.y);
        g_G.lineTo(g_pB.x, g_pB.y);

        // 矢印を描く
        let rv = U.vecScalar(U.vecNorm(U.vecSub(g_pA, g_pB)), 20);
        let pB1 = U.vecAdd(g_pB, U.vecRotate(rv, 30));
        g_G.moveTo(g_pB.x, g_pB.y);
        g_G.lineTo(pB1.x, pB1.y);
        let pB2 = U.vecAdd(g_pB, U.vecRotate(rv, -30));
        g_G.moveTo(g_pB.x, g_pB.y);
        g_G.lineTo(pB2.x, pB2.y);

        // pをv方向に移動したときに交差する最も近い辺を求める --> nearestEdge
        let nearestEdge = null;
        let minDist = -1;
        g_wallList.forEach(wall => {
            let nEdge = wall.countEdges();
            let edgeList = [];   // {p1, p2} p1=開始点, p2=終了点
            for (let i=0; i<nEdge; i++) {
                // i番目の辺の端点を取得
                let e = wall.getEdge(i);
                edgeList.push(e);
            }

            let edgeInfos = edgeList.map(e => {
                // console.log(`e.p1=(${e.p1.x}, ${e.p1.y})`);
                // console.log(`e.p2=(${e.p2.x}, ${e.p2.y})`);
                let cpInfo = U.calcLinesDist(g_pA, g_pB, e.p1, e.p2, g_ballSize);
                // console.log(`cpInfo.dmin=${cpInfo.dmin}`);
                return {
                    e: e,
                    cpInfo: cpInfo
                };
            });

            // cpInfosの中から、pから接触点までの距離が最も小さい辺を選ぶ
            edgeInfos.forEach(ei => {
                if ((ei.cpInfo !== null) && (ei.cpInfo.pTangentCenter !== null)) {
                    let dist = U.vecDist(g_pA, ei.cpInfo.pTangentCenter);
                    if ((minDist < 0) || (dist < minDist)) {
                        minDist = dist
                        nearestEdge = ei;
                        // console.log(`minDist=${minDist}`);
                    }    
                }
            });
        });

        if (nearestEdge) {
            let pX = nearestEdge.e.p1;
            let pY = nearestEdge.e.p2;
            g_G.lineStyle(1, 0xff0000, 1);  // 赤
            g_G.moveTo(pX.x, pX.y);
            g_G.lineTo(pY.x, pY.y);

            let di = nearestEdge.cpInfo;
            if (di !== null) {
                if (di.dmin !== null) {
                    g_Msg.setText(`dmin=${di.dmin}`);
                } else {
                    g_Msg.setText(`dmin=null`);
                }

                if (di.pMin !== null) {
                    g_G.lineStyle(1, 0x00ffff, 1);
                    g_G.beginFill(0x00ffff);
                    g_G.drawEllipse(di.pMin.x, di.pMin.y, 7, 7);
                    g_G.endFill();
                }

                if (di.pTangentCenter !== null) {
                    g_G.lineStyle(1, 0xffffff, 1);
                    g_G.beginFill(0x008000);
                    g_G.drawEllipse(di.pTangentCenter.x, di.pTangentCenter.y, g_ballSize, g_ballSize);
                    g_G.endFill();
                }
            }
        }
    }

    if (g_focus) {
        g_G.lineStyle(1, 0x00ffff, 1);
        g_G.beginFill(0x0000ff);
        g_G.drawEllipse(g_focus.x, g_focus.y, 5, 5);
        g_G.endFill();
    }
};

const showStatus = () => {
    if (g_infoText) {
        g_infoText.setText(`size: ${g_ballSize}`);
    }
}

$(window).on('resize', () => {
    g_w = window.innerWidth-30;
    g_h = window.innerHeight-50;
    app.renderer.resize(g_w, g_h);
    console.log(`resized to (${g_w}, ${g_h})`);
});

$(window).on('mousemove', e => {
    if (true) {
        let mousePos = {
            x: e.clientX,
            y: e.clientY
        };

        if (g_arrowDragging > 0) {
            g_focus = mousePos;
            switch (g_arrowDragging) {
                case 1:
                    g_pA = mousePos;
                    break;
                case 2:
                    g_pB = mousePos;
                    break;
            }
        }
    }
});

// [TEST]
let g_pA = {x: 200, y: 750};
let g_pB = {x: 700, y: 750};
// let g_pA = {x: 400, y: 350};
// let g_pB = {x: 800, y: 350};
let g_focus = null;
let g_arrowDragging = 0;    // 1=始点、2=終点
let g_pA_pB_updated = true;
let g_G = null;
let g_Msg = null;

$(window).on('mousedown', e => {
    // console.log(`x=${e.clientX}, y=${e.clientY}`);
    // console.log(e);
    if (e.which === 1) {
        // 左ボタンクリック
        let mousePressPos = {
            x: e.clientX,
            y: e.clientY
        };

        let r1 = U.vecDist(mousePressPos, g_pA);
        let r2 = U.vecDist(mousePressPos, g_pB);
        const CLOSE_DIST = 20;
        if (r1 < CLOSE_DIST) {
            g_arrowDragging = 1;
            g_focus = g_pA;
        } else if (r2 < CLOSE_DIST) {
            g_arrowDragging = 2;
            g_focus = g_pB;
        } else {
            g_arrowDragging = 0;
            g_focus = null;
        }

        
    }
});

$(window).on('mouseup', e => {
    g_arrowDragging = 0;
    g_focus = null;
    draw();
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
                draw();
            }
            break;
        }
        case 39:    // right
        {
            // ボールサイズ拡大
            if (g_ballSize < 50) {
                g_ballSize++;
                showStatus();
                draw();
            }
            break;
        }
    }
});

// test
let dists;
dists = [
    {target: {dist: 10, insideSegment: true}, aux: 'A'},
    {target: {dist: 7, insideSegment: false}, aux: 'B'},
    {target: {dist: 5, insideSegment: true}, aux: 'C'},
    {target: {dist: -3, insideSegment: false}, aux: 'D'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: -3, insideSegment: true}, aux: 'A'},
    {target: {dist: 10, insideSegment: true}, aux: 'B'},
    {target: {dist: 5, insideSegment: true}, aux: 'C'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: 4, insideSegment: false}, aux: 'A'},
    {target: {dist: 10, insideSegment: true}, aux: 'B'},
    {target: {dist: 3, insideSegment: false}, aux: 'C'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: 1, insideSegment: false}, aux: 'A'},
    {target: {dist: 10, insideSegment: true}, aux: 'B'},
    {target: {dist: 2, insideSegment: true}, aux: 'C'},
    {target: {dist: -5, insideSegment: false}, aux: 'D'},
    {target: {dist: 8, insideSegment: true}, aux: 'E'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: 7, insideSegment: true}, aux: 'A'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: 10, insideSegment: false}, aux: 'A'},
    {target: {dist: 3, insideSegment: false}, aux: 'B'},
    {target: {dist: 7, insideSegment: false}, aux: 'C'}
];
console.log(U.getMinDist(dists));

dists = [
    {target: {dist: 8, insideSegment: false}, aux: 'A'}
];
console.log(U.getMinDist(dists));

dists = [];
console.log(U.getMinDist(dists));
