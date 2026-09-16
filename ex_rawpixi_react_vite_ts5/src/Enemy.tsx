// ************************************************************
//  敵
// ************************************************************
import * as PIXI from 'pixi.js';
import * as Utils from './Utils';
import * as EnemyBullet from './EnemyBullet';

export class Enemy {
    private _containers: Utils.Containers | null = null;
    private _tex_enemy: PIXI.Texture | null = null;
    private _spiecies: string = "";
    private _parEnemy: PIXI.Particle | null = null;  // 敵スプライト（パーティクル）
    private _aid: number = 0;   // 攻撃パターンid
    private _count: number = 0; // カウント
    private _sw: number = 0;    // 画面サイズ（幅）
    private _sh: number = 0;    // 画面サイズ（高さ）

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, texName: string, x: number, y: number, sw: number, sh: number, aid: number) {
        this._containers = containers;
        this._tex_enemy = wholeTexture.textures[texName];
        this._parEnemy = new PIXI.Particle(this._tex_enemy)
        this._parEnemy.x = x;
        this._parEnemy.y = y;
        this._parEnemy.init_x = x;  // x座標の初期値
        this._parEnemy.init_y = y;  // y座標の初期値
        this._parEnemy.anchorX = 0.5;   // スプライトの中心を移動、回転の中心にする．
        this._parEnemy.anchorY = 0.5;
        // this._parEnemy.rotation = Math.PI/6;
        this._parEnemy.rotation = 0;    // 初期状態では回転なし
        this._parEnemy.w = this._tex_enemy.width;   // テクスチャのサイズをパーティクルにもセットしておく
        this._parEnemy.h = this._tex_enemy.height;
        this._aid = aid;
        this._count = 0;
        this._containers.particleContainer.addParticle(this._parEnemy);
        this._sw = sw;
        this._sh = sh;
    }

    public update() {
        if (this._parEnemy) {
            // パターンidとカウントに応じて移動（回転、等）
            const diffY = 5;
            this._parEnemy.y += diffY;

            if (this._parEnemy.y >= 0) {
                // 画面に現れたら移動パターンを変える
                let targetX = 0;
                if (this._aid == 0 || this._aid == 1) {
                    switch (this._aid) {
                        case 0:
                            targetX = this._sw * 1.2;    // 画面の右端を少し過ぎたあたりを目標
                            break;
                        case 1:
                            targetX = -this._sw * 0.2;  // 画面の左端を少し過ぎたあたりを目標
                            break;
                    }
                    const dx = (targetX - this._parEnemy.x) / this._sh * diffY;
                    this._parEnemy.x += dx;
                } else {
                    const yposRatio = this._parEnemy.y / this._sh;  // 画面の縦位置でどこにいるか(0=一番上、1=一番下)
                    let dx = 0;
                    switch (this._aid) {
                        case 2:
                            // 蛇行ルート
                            dx = (this._sw * 0.6) * Math.sin(yposRatio * Math.PI);
                            if (this._parEnemy.init_x < this._sw/2) dx = -dx;   // 出現x座標が画面真ん中より左なら左に曲がるようにする
                            break;
                        case 3:
                            // 蛇行ルート（その2）
                            dx = (this._sw * 0.6) * Math.sin(yposRatio * Math.PI * 2);
                            break;
                    }
                    this._parEnemy.x = this._parEnemy.init_x + dx;
                }
            }
        }
    }

    public isOutOfStage() {
        if (this._parEnemy) {
            if (this._parEnemy.y > this._sh) {
                // 画面下を超えたらtrue
                return true;
            }
        }

        return false;
    }

    public removeFromContainer() {
        if (this._containers?.particleContainer && this._parEnemy) {
            this._containers.particleContainer.removeParticle(this._parEnemy);
        }
    }

    public getParEnemy() {
        return this._parEnemy;
    }
}

// 攻撃パターン
export class Enemies {
    private _containers: Utils.Containers | null = null;
    private _wholeTextures: PIXI.Spritesheet | null = null;
    private _w: number = 0;
    private _h: number = 0;
    private _enemies: Enemy[] = [];

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, w: number, h: number) {
        this._containers = containers;
        this._wholeTextures = wholeTexture;
        this._w = w;
        this._h = h;
    }

    public genEnemies() {
        if (this._containers?.particleContainer && this._wholeTextures) {
            const nEnemies = 10;

            const x = Math.random() * this._w;  // 出現位置
            const eid = Math.trunc(Math.random() * 7);  // 敵id(=0-6)
            const aid = Math.trunc(Math.random() * 4);  // 攻撃パターンid(=0-3)
            let etex = "";
            switch (eid) {
                case 0:
                    etex = "SpaceRage/Enemies/enemy_1_b_m.png";
                    break;
                case 1:
                    etex = "SpaceRage/Enemies/enemy_1_g_m.png";
                    break;
                case 2:
                    etex = "SpaceRage/Enemies/enemy_1_r_m.png";
                    break;
                case 3:
                    etex = "SpaceRage/Enemies/enemy_2_b_m.png";
                    break;
                case 4:
                    etex = "SpaceRage/Enemies/enemy_2_g_m.png";
                    break;
                case 5:
                    etex = "SpaceRage/Enemies/enemy_2_r_m.png";
                    break;
                case 6:
                    etex = "Others/Galaxian.png";
                    break;
            }

            for (let i = 0; i < nEnemies; i++) {
                const y = i * (-80);
                const enemy = new Enemy();
                enemy.init(this._containers, this._wholeTextures, etex, x, y, this._w, this._h, aid);

                this._enemies.push(enemy);
            }
        }
    }

    public getEnemies() {
        return this._enemies;
    }

    public removeEnemies(indsToRemove: number[]) {
        if (indsToRemove.length > 0) {
            // Setを使って重複を消し、配列に戻す
            const indsToRemove2 = [...new Set(indsToRemove)];

            // 降順にソート
            const sortedInds = indsToRemove2.sort((a, b) => b - a)

            for (const i of sortedInds) {
                const enemy = this._enemies[i]
                enemy.removeFromContainer();    // コンテナから消す
                this._enemies.splice(i, 1); // i番目の要素を削除して配列の長さを縮める
            }
        }
    }

    public update() {
        if (this._enemies.length > 0) {
            const indsToRemove: number[] = [];

            for (let i = 0; i < this._enemies.length; i++) {
                const enemy = this._enemies[i];
                if (enemy) {
                    enemy.update();

                    if (enemy.isOutOfStage()) indsToRemove.push(i);
                }
            }

            // 画面から外れた敵を消す
            this.removeEnemies(indsToRemove);
        }
    }

    public attack(player_x: number, player_y: number, enemyBullets: EnemyBullet.EnemyBullets) {
        const attackRatio = 0.005;  // 攻撃頻度（大きいほど攻撃が多くなる）
        const bulletSpeed = 3; // 弾丸の速さ（大きいほど弾丸が速い）

        for (let i = 0; i < this._enemies.length; i++) {
            const enemy = this._enemies[i];
            if (enemy && Math.random() < attackRatio) {   
                const parEnemy = enemy.getParEnemy();
                if (parEnemy) {
                    // 攻撃
                    enemyBullets.genNewBullets(player_x, player_y, parEnemy.x, parEnemy.y, 64, 64, bulletSpeed);
                }
            }
        }
    }
}