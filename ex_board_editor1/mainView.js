// *******************************************************
//  2Dボードエディタ (1)
//
//  2021/7/24
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const { CmdButtons } = require('./cmdButtons');
const { MainPanel } = require('./mainPanel');

let g_w = 0;
let g_h = 0;
let canvas = document.getElementById('myCanvas');

//Create a Pixi Application
let app = new PIXI.Application({ 
    view: canvas,
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

let contMainPanel = new PIXI.Container();   // メイン描画エリア用コンテナ
let mainPanel = new MainPanel();
let contCmdPanel = new PIXI.Container();    // コマンドパネル用コンテナ
let cmdButtons = new CmdButtons();

// ロード時とリサイズ時の両方でイベントを受け取る
// https://qiita.com/chillart/items/15bc48f98897391e12ca
$(window).on('load', () => {
    console.log(`load`);
    // g_w = window.innerWidth-30;
    // g_h = window.innerHeight-50;
    g_w = document.body.clientWidth;
    g_h = document.body.clientHeight;
    console.log(`innerSize(${window.innerWidth}, ${window.innerHeight})`);
    console.log(`clientSize(${document.body.clientWidth}, ${document.body.clientHeight})`);
    app.renderer.resize(g_w, g_h);

    const loader = PIXI.Loader.shared;
    loader.add('images/characters.json');
    loader.load((loader, resources) => {
        app.stage.addChild(contMainPanel);
        app.stage.addChild(contCmdPanel);
    
        mainPanel.initSprite(PIXI, contMainPanel);
        cmdButtons.initSprite(PIXI, contCmdPanel);
        // 操作説明
        // new Text()
        //     .initSprite(PIXI, app.stage)
        //     .setText('→/← : size up/down')
        //     .setPos(10, 10)
        //     .setFontSize(20)
        //     .setColor('cyan');
    
        app.ticker.add((delta) => {
            // 画面更新
            mainPanel.update();
        });
    });
});

$(window).on('resize', () => {
    console.log(`resize`);

    let i_w = window.innerWidth;
    let i_h = window.innerHeight;
    // canvas.width = g_w;
    // canvas.height = g_h;
    let c_w = document.body.clientWidth;
    let c_h = document.body.clientHeight;
    canvas.width = c_w;
    canvas.height = c_h;

    // // g_w = window.innerWidth-30;
    // // g_h = window.innerHeight-50;
    // // canvas.width = window.innerWidth;
    // // canvas.height = window.innerHeight;
    // canvas.width = document.body.clientWidth;
    // canvas.height = document.body.clientHeight;

    g_w = c_w;
    g_h = c_h;
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

        let id = cmdButtons.hitTest(mousePressPos);
        if (id > 0) {
            let pressed = cmdButtons.isPressed(id);
            console.log(`id=${id}, pressed=${pressed}`);
            cmdButtons.press(id, !pressed); // 反転させる
        } else {
            mainPanel.onMouseDown(mousePressPos, cmdButtons.getCurrMode());
        }
    }
});

$(window).on('mouseup', e => {
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
            contCmdPanel.visible = false;
            break;
        }
        case 39:    // right
        {
            contCmdPanel.visible = true;
            break;
        }
        case 38:    // up
        {
            contMainPanel.visible = true;
            break;
        }
        case 40:    // down
        {
            contMainPanel.visible = false;
            break;
        }
    }
});
