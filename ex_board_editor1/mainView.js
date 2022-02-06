// *******************************************************
//  2Dボードエディタ (1)
//
//  2021/7/24
// *******************************************************

const PIXI = require('pixi.js');
const $ = require('jquery');
const { CmdButtons } = require('./cmdButtons');
const { MainPanel } = require('./mainPanel');
// const ipc = require('ipc');
const { ipcRenderer } = window.native;

ipcRenderer.on('mapLoadClicked', (msg) => {
    alert('map load clicked!' + msg);
});

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
let mainPanel = null;
let contCmdPanel = new PIXI.Container();    // コマンドパネル用コンテナ
let cmdButtons = new CmdButtons();

// ロード時とリサイズ時の両方でイベントを受け取る
// https://qiita.com/chillart/items/15bc48f98897391e12ca
$(window).on('load', () => {
    console.log(`load`);

    // window.innerWidth ... スクロールバーを含んだウィンドウの横幅
    // document.body.clientWidth ... スクロールバーを含まないウィンドウの横幅（クライアントエリアの幅）
    
    // g_w = window.innerWidth-30;
    // g_h = window.innerHeight-50;
    g_w = document.body.clientWidth-20;
    g_h = document.body.clientHeight-20;
    console.log(`innerSize(${window.innerWidth}, ${window.innerHeight})`);
    console.log(`clientSize(${document.body.clientWidth}, ${document.body.clientHeight})`);
    app.renderer.resize(g_w, g_h);

    mainPanel = new MainPanel(app, g_w, g_h);

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
            mainPanel.update(cmdButtons.getCurrMode());
        });
    });
});

$(window).on('resize', () => {
    console.log(`resize`);

    g_w = document.body.clientWidth-20;
    g_h = document.body.clientHeight-20;
    app.renderer.resize(g_w, g_h);

    mainPanel.resize(g_w, g_h);
    console.log(`resized to (${g_w}, ${g_h})`);
});

$(window).on('mousemove', e => {
    let mousePos = {
        x: e.clientX,
        y: e.clientY
    };
    mainPanel.onMouseMove(mousePos, cmdButtons.getCurrMode());
});

// マウスホイールイベント
$(window).on('wheel', e => {
    // ホイール移動量
    // (100か-100しか渡ってこないようだ)
    const dY = e.originalEvent.deltaY;
    console.log(`deltaY=(${dY})`);
});

$(window).on('mousedown', e => {
    let mousePressPos = {
        x: e.clientX,
        y: e.clientY
    };

    if (e.which === 1) {
        // 左ボタンクリック
        let id = cmdButtons.hitTest(mousePressPos);
        if (id > 0) {
            let pressed = cmdButtons.isPressed(id);
            console.log(`id=${id}, pressed=${pressed}`);
            cmdButtons.press(id, !pressed); // 反転させる
        } else {
            mainPanel.onMouseDown(mousePressPos, e, cmdButtons.getCurrMode());
        }
    } else {
        mainPanel.onMouseDown(mousePressPos, e, cmdButtons.getCurrMode());
    }
});

$(window).on('mouseup', e => {
    let mouseReleasePos = {
        x: e.clientX,
        y: e.clientY
    };
    mainPanel.onMouseUp(mouseReleasePos, cmdButtons.getCurrMode());
});

$(window).on('keydown', e => {
    let mode = cmdButtons.getCurrMode();
    console.log(`keydown: (${e.which}), mode=(${mode})`);

    mainPanel.onKeyDown(e.which, mode);

    // キー入力をキャンセルする(デフォルトハンドラで処理させない)
    // （これがないと、矢印キーを押したときにクライアントエリアがスクロールしてしまう）
    return false;
});
