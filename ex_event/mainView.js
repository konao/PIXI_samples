// *******************************************************
//  各種イベント（ウィンドウ、キーボード、マウス）捕捉実験
//
//  2021/7/17
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');

let g_w = 0;
let g_h = 0;

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
    console.log(`load`);
    g_w = window.innerWidth-30;
    g_h = window.innerHeight-50;
    app.renderer.resize(g_w, g_h);

    // loader.add('assets/characters.json');
    loader.load((loader, resources) => {

        // 操作説明
        // new Text()
        //     .initSprite(PIXI, app.stage)
        //     .setText('→/← : size up/down')
        //     .setPos(10, 10)
        //     .setFontSize(20)
        //     .setColor('cyan');
    
        app.ticker.add((delta) => {
            // 画面更新
        });
    });
});

// const draw = () => {
//     g_G.clear();
//     if ((g_pA !== null) && (g_pB !== null) && (g_pX !== null) && (g_pY !== null)) {
//         // AからBへの線を引く
//         g_G.lineStyle(1, 0xffff00, 1);  // 黄色
//         g_G.moveTo(g_pA.x, g_pA.y);
//         g_G.lineTo(g_pB.x, g_pB.y);
//     }
// };

$(window).on('resize', () => {
    console.log(`resize`);
    g_w = window.innerWidth-30;
    g_h = window.innerHeight-50;
    app.renderer.resize(g_w, g_h);
    console.log(`resized to (${g_w}, ${g_h})`);
});

$(window).on('mousemove', e => {
    console.log(`mousemove`);
});

// マウスホイールイベント
$(window).on('wheel', e => {
    // ホイール移動量
    // (100か-100しか渡ってこないようだ)
    const dY = e.originalEvent.deltaY;
    console.log(`deltaY=(${dY})`);
});

$(window).on('mousedown', e => {
    console.log(`mousedown`);
    if (e.which === 1) {
        // 左ボタンクリック
        let mousePressPos = {
            x: e.clientX,
            y: e.clientY
        };
    }
});

$(window).on('mouseup', e => {
    // g_arrowDragging = 0;
    // g_focus = null;
    // draw();
    console.log(`mouseup`);
});


$(window).on('keydown', e => {
    console.log(`keydown (${e.which})`);
    switch (e.which) {
        case 32:    // space
        {
            break;
        }
        case 78:    // N
        {
            break;
        }
        case 37:    // left
        {
            break;
        }
        case 39:    // right
        {
            break;
        }
        case 38:    // up
        {
            break;
        }
        case 40:    // down
        {
            break;
        }
    }
});
