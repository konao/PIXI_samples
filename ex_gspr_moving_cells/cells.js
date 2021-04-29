// *******************************************************
//  画像イメージが動的に変化するスプライト
//
//  update()が呼ばれるたびに画像イメージが更新される
// *******************************************************

const { BaseSpr } = require('./baseSpr');
const U = require('./utils');

const N = 100;

class Cell {
    constructor() {
        this._x = 0;
        this._y = 0;
        this._count = 0;
    }

    // 初期化
    init(count) {
        this._count = count;
    }

    // 状態更新
    update() {
        this._count++;
        if (this._count >= N) {
            this._count = 0;
        }
    }

    getPos() {
        return {
            x: this._x,
            y: this._y
        };
    }

    setPos({x, y}) {
        this._x = x;
        this._y = y;
    }

    // @param g [i] PIXI.Graphics
    draw(g) {
        let r = (Math.abs(this._count - N/2))/(N/2) * 5 + 3

        // このセルをgに描画
        g.beginFill(0x700000);
        g.lineStyle(2, 0xffff00, 0.7);  // 太さ、色、アルファ(0=透明)
        g.drawEllipse(this._x, this._y, r, r);  // 中心(cx, cy), 半径(rx, ry)
        g.endFill();
    }
}

class Cells extends BaseSpr {
    constructor() {
        super();

        this._g = null; // スプライトイメージ(PIXI.Graphics)
        this._cellInfos = [];

        this._mp = {x: 0, y: 0};    // マウスの位置
        this._w = 0;    // クライアントエリアの幅と高さ
        this._h = 0;        
    }

    setMousePos(mp) {
        this._mp = mp;
    }

    init(PIXI, container, w, h) {
        this._w = w;
        this._h = h;

        let cont = new PIXI.Container();
        cont.sortableChildren = true;  // zIndex値でのソートを有効にする

        this._g = new PIXI.Graphics();

        cont.addChild(this._g);
        this._spr = cont;

        this.setPos({x: 0, y: 0});
    
        container.addChild(cont);

        // セル初期化
        for (let i=0; i<N; i++) {
            let c = new Cell();
            c.init(i);

            let x = U.randDouble(w);
            let y = U.randDouble(h);
            c.setPos({x: x, y: y});

            this._cellInfos.push(c);
        }
    }

    update() {
        if (this._g) {
            // ----------------------------------------
            //  スプライトの再描画（画像イメージの更新）
            // ----------------------------------------
            let n = this._cellInfos.length;
            if (n>0) {    
                for (let i=0; i<n; i++) {
                    let p = this._cellInfos[i].getPos();
                    let vx = (this._mp.x - p.x);
                    let vy = (this._mp.y - p.y);
                    let l = Math.sqrt(vx*vx + vy*vy);

                    let newX = p.x;
                    let newY = p.y;
                    if (l > 0) {
                        newX += (vx / l)*0.5;
                        newY += (vy / l)*0.5;    
                    }

                    this._cellInfos[i].setPos({x: newX, y: newY});
                }
                
                this._g.clear();    // 描画内容をリセット（これがないと描画内容が更新されない）
                this.drawGrid(this._g);
                this._cellInfos.forEach(cell => {
                    cell.update();  // 状態更新
                    cell.draw(this._g); // 各セルを描画
                });    
            }
        }
    }

    drawGrid(g) {
        const D = 50;

        g.lineStyle(1, 0xffffff, 0.3);  // 太さ、色、アルファ(0=透明)

        let x = 0;
        while (x < this._w) {
            g.moveTo(x, 0);
            g.lineTo(x, this._h);
            x += D;
        }

        let y = 0;
        while (y < this._h) {
            g.moveTo(0, y);
            g.lineTo(this._w, y);
            y += D;
        }
    }
}

module.exports = {
    Cells
}
