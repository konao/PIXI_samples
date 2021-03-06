// *******************************************************
//  ピンボール作成のための実験(3) メインビュー
//
//  重力効果、壁の反射係数（定数）追加
//
//  2021/5/20 konao
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const U = require('./utils');

const { Ball } = require('./ball');
const { Wall } = require('./wall');
const { Text } = require('./text');
const { Spline } = require('./spline');

let g_w = 0;
let g_h = 0;
let g_bPause = false;
let g_ballSize = 25; // ボールのサイズ
let g_ballSpeed = 8;    // ボールのスピード
let g_nBalls = 0;   // ボールの個数

const N_BALL_TRACE = 10;    // ボールの残像の個数

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

        // buildScene1(g_wallList);
        // buildScene2(g_wallList);
        buildScene3(g_wallList);

        // 操作説明
        new Text()
            .initSprite(PIXI, app.stage)
            .setText('→/← : size up/down')
            .setPos(10, 10)
            .setFontSize(20)
            .setColor('cyan');
    
        new Text()
            .initSprite(PIXI, app.stage)
            .setText('left click and drag: move arrow / right click: eject ball')
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

        draw();

        app.ticker.add((delta) => {
            // 画面更新
            if (!g_bPause) {
                g_wallList.forEach(wall => {
                    wall.update();
                });

                // 衝突計算1（ボール同士）
                let nBalls = g_ballList.length;
                for (let i=0; i<nBalls; i++) {
                    let ball1 = g_ballList[i];
                    for (let j=i+1; j<nBalls; j++) {
                        let ball2 = g_ballList[j];
                        ball1.update1(ball2);
                    }
                }

                // 衝突計算2（ボールと壁）
                g_ballList.forEach(ball => {
                    ball.update2(g_wallList, g_ballList);
                });

                if (g_arrowDragging > 0) {
                    draw();
                }
            }
        });
    });
});

const buildScene1 = (wallList) => {
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
    // wallList.push(w1);

    let w2 = new Wall();
    w2.setWallPoints([
        {x: 800, y: 100},
        {x: 1100, y: 150},
        {x: 1000, y: 500}
    ]);
    // w2.setWallPoints([
    //     {x: 200, y: 100},
    //     {x: 400, y: 150},
    //     {x: 300, y: 500}
    // ]);
    w2.init(PIXI, app.stage, g_w, g_h);
    wallList.push(w2);

    let w3 = new Wall();
    w3.setWallPoints([
        {x: 1200, y: 400},
        {x: 1300, y: 800},
        {x: 800, y: 800},
        {x: 1000, y: 700}
    ]);
    w3.init(PIXI, app.stage, g_w, g_h);
    wallList.push(w3);    

    // let w4 = new Wall();
    // w4.genCircleWallPoints(1200, 150, 50);
    // w4.init(PIXI, app.stage, g_w, g_h);
    // wallList.push(w4);

    let w5 = new Wall();
    w5.genCircleWallPoints(450, 400, 300);
    w5.init(PIXI, app.stage, g_w, g_h);
    wallList.push(w5);

    let w5_2 = new Wall();
    w5_2.genCircleWallPoints(450, 400, 100);
    w5_2.init(PIXI, app.stage, g_w, g_h);
    wallList.push(w5_2);

    // let w6 = new Wall();
    // w6.genCircleWallPoints(900, 700, 50);
    // w6.init(PIXI, app.stage, g_w, g_h);
    // wallList.push(w6);

    let w7 = new Wall();
    w7.genCircleWallPoints(100, 800, 50);
    w7.init(PIXI, app.stage, g_w, g_h);
    wallList.push(w7);
}

const buildScene2 = (wallList) => {
    const BLOCK_WIDTH = 20;
    const BLOCK_HEIGHT = 10;
    const SPACE_WIDTH = 80;

    let x = 50;
    let y = 80;
    while (y < 700) {
        while (x < (g_w - (BLOCK_WIDTH + 50))) {
            let block = new Wall();

            block.setWallPoints([
                {x: x, y: y},
                {x: x+BLOCK_WIDTH, y: y},
                {x: x+BLOCK_WIDTH, y: y+BLOCK_HEIGHT},
                {x: x, y: y+BLOCK_HEIGHT}
            ]);
            block.init(PIXI, app.stage, g_w, g_h);
            wallList.push(block);

            x += (BLOCK_WIDTH + SPACE_WIDTH);
        }
        x = 50;
        y += (BLOCK_HEIGHT + SPACE_WIDTH);
    }
}

// スプライン関数を使って壁を生成する
const buildScene3 = (wallList) => {
    let sp = new Spline();

    let fx = (x) => {
        return x*g_w;
    }
    let fy = (y) => {
        return y*g_h;
    }
    let addBlock = (sp) => {
        sp.genSpline();

        pts = [];
        for (let t=0.0; t<1.0; t+=0.02) {
            let pt = sp.interp(t);
            pts.push({
                x: pt.x,
                y: pt.y
            });
        }
        let pt = sp.interp(1.0);
        pts.push({
            x: pt.x,
            y: pt.y
        });

        let block = new Wall();
        block.setWallPoints(pts);
        block.init(PIXI, app.stage, g_w, g_h);
        wallList.push(block);
    }

    sp.clear();
    sp.addPoint(fx(0.75), fy(0.17));
    sp.addPoint(fx(0.82), fy(0.3));
    sp.addPoint(fx(0.81), fy(0.4));
    sp.addPoint(fx(0.8), fy(0.47));
    sp.addPoint(fx(0.78), fy(0.5));
    sp.addPoint(fx(0.7), fy(0.46));
    sp.addPoint(fx(0.63), fy(0.4));
    sp.addPoint(fx(0.56), fy(0.32));
    sp.addPoint(fx(0.54), fy(0.25));
    sp.addPoint(fx(0.58), fy(0.2));
    sp.addPoint(fx(0.64), fy(0.17));
    sp.addPoint(fx(0.74), fy(0.16));
    addBlock(sp);

    // (2)
    sp.clear();
    sp.addPoint(fx(0.3), fy(0.45));
    sp.addPoint(fx(0.41), fy(0.41));
    sp.addPoint(fx(0.5), fy(0.43));
    sp.addPoint(fx(0.52), fy(0.48));
    sp.addPoint(fx(0.5), fy(0.52));
    sp.addPoint(fx(0.46), fy(0.55));
    sp.addPoint(fx(0.35), fy(0.59));
    sp.addPoint(fx(0.25), fy(0.61));
    sp.addPoint(fx(0.2), fy(0.6));
    sp.addPoint(fx(0.22), fy(0.5));
    sp.addPoint(fx(0.29), fy(0.46));
    addBlock(sp);

    // (3)
    sp.clear();
    sp.addPoint(fx(0.17), fy(0.3));
    sp.addPoint(fx(0.15), fy(0.4));
    sp.addPoint(fx(0.1), fy(0.42));
    sp.addPoint(fx(0.08), fy(0.4));
    sp.addPoint(fx(0.07), fy(0.3));
    sp.addPoint(fx(0.1), fy(0.23));
    sp.addPoint(fx(0.14), fy(0.17));
    sp.addPoint(fx(0.18), fy(0.16));
    sp.addPoint(fx(0.2), fy(0.18));
    sp.addPoint(fx(0.18), fy(0.27));
    addBlock(sp);

    // (4)
    sp.clear();
    sp.addPoint(fx(0.31), fy(0.84));
    sp.addPoint(fx(0.37), fy(0.92));
    sp.addPoint(fx(0.25), fy(0.93));
    sp.addPoint(fx(0.21), fy(0.92));
    sp.addPoint(fx(0.2), fy(0.9));
    sp.addPoint(fx(0.18), fy(0.8));
    sp.addPoint(fx(0.17), fy(0.73));
    sp.addPoint(fx(0.21), fy(0.74));
    sp.addPoint(fx(0.30), fy(0.83));
    addBlock(sp);

    // (5)
    sp.clear();
    sp.addPoint(fx(0.82), fy(0.72));
    sp.addPoint(fx(0.73), fy(0.81));
    sp.addPoint(fx(0.68), fy(0.8));
    sp.addPoint(fx(0.66), fy(0.76));
    sp.addPoint(fx(0.72), fy(0.7));
    sp.addPoint(fx(0.8), fy(0.6));
    sp.addPoint(fx(0.84), fy(0.5));
    sp.addPoint(fx(0.86), fy(0.53));
    sp.addPoint(fx(0.85), fy(0.6));
    sp.addPoint(fx(0.83), fy(0.7));
    addBlock(sp);

    // (5)
    sp.clear();
    sp.addPoint(fx(0.14), fy(0.99));
    sp.addPoint(fx(0.09), fy(0.8));
    sp.addPoint(fx(0.03), fy(0.4));
    sp.addPoint(fx(0.03), fy(0.3));
    sp.addPoint(fx(0.05), fy(0.2));
    sp.addPoint(fx(0.12), fy(0.1));
    sp.addPoint(fx(0.2), fy(0.07));
    sp.addPoint(fx(0.25), fy(0.1));
    sp.addPoint(fx(0.26), fy(0.2));
    sp.addPoint(fx(0.24), fy(0.28));
    sp.addPoint(fx(0.25), fy(0.3));
    sp.addPoint(fx(0.3), fy(0.3));
    sp.addPoint(fx(0.39), fy(0.2));
    sp.addPoint(fx(0.5), fy(0.05));
    sp.addPoint(fx(0.6), fy(0.02));
    sp.addPoint(fx(0.7), fy(0.03));
    sp.addPoint(fx(0.85), fy(0.1));
    sp.addPoint(fx(0.92), fy(0.2));
    sp.addPoint(fx(0.95), fy(0.4));
    sp.addPoint(fx(0.94), fy(0.6));
    sp.addPoint(fx(0.92), fy(0.8));
    sp.addPoint(fx(0.85), fy(0.99));
    // sp.addPoint(fx(0.84), fy(0.99));
    addBlock(sp);    
}

const draw = () => {
    g_G.clear();
    if ((g_pA !== null) && (g_pB !== null) && (g_pX !== null) && (g_pY !== null)) {
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

        // XからYへの線を引く
        g_G.lineStyle(1, 0x00ff00, 1);  // 緑
        g_G.moveTo(g_pX.x, g_pX.y);
        g_G.lineTo(g_pY.x, g_pY.y);

        // 矢印を描く
        let ru = U.vecScalar(U.vecNorm(U.vecSub(g_pX, g_pY)), 20);
        let pY1 = U.vecAdd(g_pY, U.vecRotate(ru, 30));
        g_G.moveTo(g_pY.x, g_pY.y);
        g_G.lineTo(pY1.x, pY1.y);
        let pY2 = U.vecAdd(g_pY, U.vecRotate(ru, -30));
        g_G.moveTo(g_pY.x, g_pY.y);
        g_G.lineTo(pY2.x, pY2.y);

        // --------------------------------
        // ボールと壁の衝突計算テスト
        // --------------------------------

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
                let cpInfo = U.calcCollisionPoint1(g_pA, g_pB, e.p1, e.p2, g_ballSize);

                return {
                    e: e,
                    cpInfo: cpInfo
                };
            });

            // cpInfosの中から、pから接触点までの距離が最も小さい辺を選ぶ
            edgeInfos.forEach(ei => {
                if ((ei.cpInfo !== null) && (ei.cpInfo.pC !== null)) {
                    let dist = U.vecDist(g_pA, ei.cpInfo.pC);
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
                if (di.pCm !== null) {
                    g_G.lineStyle(1, 0x00ffff, 1);
                    g_G.beginFill(0x00ffff);
                    g_G.drawEllipse(di.pCm.x, di.pCm.y, 7, 7);
                    g_G.endFill();
                }

                if (di.pC !== null) {
                    g_G.lineStyle(1, 0xffffff, 1);
                    g_G.beginFill(0x008000);
                    g_G.drawEllipse(di.pC.x, di.pC.y, g_ballSize, g_ballSize);
                    g_G.endFill();
                }

                if (di.pRefB !== null) {
                    // pCからpRefBへの線を引く
                    g_G.lineStyle(1, 0xffff00, 0.5);  // 黄色
                    g_G.moveTo(di.pC.x, di.pC.y);
                    g_G.lineTo(di.pRefB.x, di.pRefB.y);

                    // 矢印を描く
                    let rv = U.vecScalar(U.vecNorm(U.vecSub(di.pC, di.pRefB)), 20);
                    let pB1 = U.vecAdd(di.pRefB, U.vecRotate(rv, 30));
                    g_G.moveTo(di.pRefB.x, di.pRefB.y);
                    g_G.lineTo(pB1.x, pB1.y);
                    let pB2 = U.vecAdd(di.pRefB, U.vecRotate(rv, -30));
                    g_G.moveTo(di.pRefB.x, di.pRefB.y);
                    g_G.lineTo(pB2.x, pB2.y);
                }
            }
        }

        // --------------------------------
        // ボール同士の衝突計算テスト
        // --------------------------------
        let r2 = 20;    // 固定
        let cpInfo2 = U.calcCollisionPoint2(g_pA, g_pB, g_ballSize, g_ballSize*g_ballSize, g_pX, g_pY, r2, r2*r2);
        if (cpInfo2) {
            // 衝突する
            // console.log(`pA=(${g_pA.x}, ${g_pA.y})`);
            // console.log(`pB=(${g_pB.x}, ${g_pB.y})`);
            // console.log(`pX=(${g_pX.x}, ${g_pX.y})`);
            // console.log(`pY=(${g_pY.x}, ${g_pY.y})`);

            if (cpInfo2.pC1 !== null) {
                g_G.lineStyle(1, 0xffffff, 1);
                g_G.beginFill(0x008000);
                g_G.drawEllipse(cpInfo2.pC1.x, cpInfo2.pC1.y, g_ballSize, g_ballSize);
                g_G.endFill();
            }

            if (cpInfo2.pC2 !== null) {
                g_G.lineStyle(1, 0xffffff, 1);
                g_G.beginFill(0x008000);
                g_G.drawEllipse(cpInfo2.pC2.x, cpInfo2.pC2.y, r2, r2);
                g_G.endFill();
            }

            if (cpInfo2.pCm !== null) {
                g_G.lineStyle(1, 0xffffff, 1);
                g_G.beginFill(0x004040);
                g_G.drawEllipse(cpInfo2.pCm.x, cpInfo2.pCm.y, 5, 5);
                g_G.endFill();
            }

            if (cpInfo2.pRefB !== null) {
                // pC1からpRefBへの線を引く
                g_G.lineStyle(1, 0xffff00, 0.5);  // 黄色
                g_G.moveTo(cpInfo2.pC1.x, cpInfo2.pC1.y);
                g_G.lineTo(cpInfo2.pRefB.x, cpInfo2.pRefB.y);

                // 矢印を描く
                let rv1 = U.vecScalar(U.vecNorm(U.vecSub(cpInfo2.pC1, cpInfo2.pRefB)), 20);
                let pB1 = U.vecAdd(cpInfo2.pRefB, U.vecRotate(rv1, 30));
                g_G.moveTo(cpInfo2.pRefB.x, cpInfo2.pRefB.y);
                g_G.lineTo(pB1.x, pB1.y);
                let pB2 = U.vecAdd(cpInfo2.pRefB, U.vecRotate(rv1, -30));
                g_G.moveTo(cpInfo2.pRefB.x, cpInfo2.pRefB.y);
                g_G.lineTo(pB2.x, pB2.y);
            }

            if (cpInfo2.pRefY !== null) {
                // pC1からpRefBへの線を引く
                g_G.lineStyle(1, 0x00ff00, 0.5);  // 緑
                g_G.moveTo(cpInfo2.pC2.x, cpInfo2.pC2.y);
                g_G.lineTo(cpInfo2.pRefY.x, cpInfo2.pRefY.y);

                // 矢印を描く
                let rv1 = U.vecScalar(U.vecNorm(U.vecSub(cpInfo2.pC2, cpInfo2.pRefY)), 20);
                let pY1 = U.vecAdd(cpInfo2.pRefY, U.vecRotate(rv1, 30));
                g_G.moveTo(cpInfo2.pRefY.x, cpInfo2.pRefY.y);
                g_G.lineTo(pY1.x, pY1.y);
                let pY2 = U.vecAdd(cpInfo2.pRefY, U.vecRotate(rv1, -30));
                g_G.moveTo(cpInfo2.pRefY.x, cpInfo2.pRefY.y);
                g_G.lineTo(pY2.x, pY2.y);
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
                case 3:
                    g_pX = mousePos;
                    break;
                case 4:
                    g_pY = mousePos;
                    break;
            }
        }
    }
});

// マウスホイールイベント
$(window).on('wheel', e => {
    // console.log(`deltaY=(${e.originalEvent.deltaY})`);
    // ホイール移動量
    // (100か-100しか渡ってこないようだ)
    const dY = e.originalEvent.deltaY;
    if (dY < 0) {
        // ボールサイズ拡大
        if (g_ballSize < 50) {
            g_ballSize++;
            showStatus();
            draw();
        }
    } else if (dY > 0) {
        // ボールサイズ縮小
        if (g_ballSize > 1) {
            g_ballSize--;
            showStatus();
            draw();
        }
    }
});

// [TEST]
let g_pA = {x: 430, y: 650};
let g_pB = {x: 600, y: 650};
let g_pX = {x: 500, y: 550};
let g_pY = {x: 645, y: 800};
let g_focus = null;
let g_arrowDragging = 0;    // 1=pA, 2=pB, 3=pX, 4=pY
let g_G = null;

$(window).on('mousedown', e => {
    if (e.which === 1) {
        // 左ボタンクリック
        let mousePressPos = {
            x: e.clientX,
            y: e.clientY
        };

        let r1 = U.vecDist(mousePressPos, g_pA);
        let r2 = U.vecDist(mousePressPos, g_pB);
        let r3 = U.vecDist(mousePressPos, g_pX);
        let r4 = U.vecDist(mousePressPos, g_pY);
        const CLOSE_DIST = 20;
        if (r1 < CLOSE_DIST) {
            g_arrowDragging = 1;
            g_focus = g_pA;
        } else if (r2 < CLOSE_DIST) {
            g_arrowDragging = 2;
            g_focus = g_pB;
        } else if (r3 < CLOSE_DIST) {
            g_arrowDragging = 3;
            g_focus = g_pX;
        } else if (r4 < CLOSE_DIST) {
            g_arrowDragging = 4;
            g_focus = g_pY;
        } else {
            g_arrowDragging = 0;
            g_focus = null;
        }
    } else if (e.which === 3) {
        // 右ボタンクリック
        let ejPos = g_pA;
        let ejVec = U.vecNorm(U.vecSub(g_pB, g_pA));
        ejVec = U.vecScalar(ejVec, g_ballSpeed);

        // ボールを生成
        let newBall = new Ball();
        newBall.setRadius(g_ballSize)
            .setBallPos(ejPos)
            .setVec(ejVec);
        newBall.init(PIXI, app.stage, g_w, g_h, N_BALL_TRACE);

        g_ballList.push(newBall);
        g_nBalls++;
        showStatus();
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
        case 78:    // N
        {
            if (g_bPause) {

                // 衝突計算1（ボール同士）
                let nBalls = g_ballList.length;
                for (let i=0; i<nBalls; i++) {
                    for (let j=i+1; j<nBalls; j++) {
                        let ball1 = g_ballList[i];
                        let ball2 = g_ballList[j];
                        ball1.update1(ball2);
                    }
                }

                // 衝突計算2（ボールと壁）
                g_ballList.forEach(ball => {
                    ball.update2(g_wallList, g_ballList);
                });

                draw();
            }
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

// +++++++++++++++++++++++++++++++++++++++
//  getMinElem()のテスト
// +++++++++++++++++++++++++++++++++++++++

// ------------------------------
//  test 1
// ++++++++++++++++++++++++++++++++
let dists;
dists = [
    {dist: 10, on_sXY: true, aux: 'A'},
    {dist: 7, on_sXY: false, aux: 'B'},
    {dist: 5, on_sXY: true, aux: 'C'},
    {dist: -3, on_sXY: false, aux: 'D'}
];
const _isValid1 = (x) => { return x.on_sXY; }
const _cmp1 = (x, y) => { return (x.dist < y.dist) }
console.log(U.getMinElem(dists, _isValid1, _cmp1));

dists = [
    {dist: -3, on_sXY: true, aux: 'A'},
    {dist: 10, on_sXY: true, aux: 'B'},
    {dist: 5, on_sXY: true, aux: 'C'}
];
console.log(U.getMinElem(dists, _isValid1, _cmp1));

dists = [
    {dist: 4, on_sXY: false, aux: 'A'},
    {dist: 10, on_sXY: true, aux: 'B'},
    {dist: 3, on_sXY: false, aux: 'C'}
];
console.log(U.getMinElem(dists, _isValid1, _cmp1));

dists = [
    {dist: 1, on_sXY: false, aux: 'A'},
    {dist: 10, on_sXY: true, aux: 'B'},
    {dist: 2, on_sXY: true, aux: 'C'},
    {dist: -5, on_sXY: false, aux: 'D'},
    {dist: 8, on_sXY: true, aux: 'E'}
];
console.log(U.getMinElem(dists, _isValid1, _cmp1));

dists = [
    {dist: 7, on_sXY: true, aux: 'A'}
];
console.log(U.getMinElem(dists, _isValid1, _cmp1));

dists = [
    {dist: 10, on_sXY: false, aux: 'A'},
    {dist: 3, on_sXY: false, aux: 'B'},
    {dist: 7, on_sXY: false, aux: 'C'}
];
console.log(U.getMinElem(dists, _isValid1, _cmp1));

dists = [
    {dist: 8, on_sXY: false, aux: 'A'}
];
console.log(U.getMinElem(dists, _isValid1, _cmp1));

dists = [];
console.log(U.getMinElem(dists, _isValid1, _cmp1));

// ++++++++++++++++++++++++++++++++
//  test 2
// ++++++++++++++++++++++++++++++++
dists = [
    {dAC: 6, name: 'A'},
    {dAC: 4, name: 'B'},
    {dAC: 2, name: 'C'},    // 同じ値がある場合は先にあるほうが選ばれる
    {dAC: 7, name: 'D'},
    {dAC: 2, name: 'E'}
];
const _isValid2 = (x) => { return true; }
const _cmp2 = (x, y) => { return (x.dAC < y.dAC) }
console.log(U.getMinElem(dists, _isValid2, _cmp2));
