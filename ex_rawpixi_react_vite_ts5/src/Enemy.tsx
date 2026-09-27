// ************************************************************
//  敵
// ************************************************************
import * as PIXI from 'pixi.js';
import * as Utils from './Utils';
import * as EnemyBullet from './EnemyBullet';
import * as Explosion from './Explosion';
import * as Sound from './Sound';

// 敵（1機）
export class Enemy {
    private _containers: Utils.Containers | null = null;
    private _tex_enemy: PIXI.Texture | null = null;
    private _parEnemy: PIXI.Particle | null = null;  // 敵スプライト（パーティクル）
    private _aid: number = 0;   // 攻撃パターンid
    private _count: number = 0; // カウント
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 }   // 画面サイズ
    private _attackRoute: AttackRoute | null = null;

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, texName: string, posEnemy: Utils.Vec2, scrSize: Utils.Vec2, aid: number, route: AttackRoute) {
        this._containers = containers;
        this._tex_enemy = wholeTexture.textures[texName];
        this._parEnemy = new PIXI.Particle(this._tex_enemy)
        this._parEnemy.x = posEnemy.x;
        this._parEnemy.y = posEnemy.y;
        this._parEnemy.init_x = posEnemy.x;  // x座標の初期値
        this._parEnemy.init_y = posEnemy.y;  // y座標の初期値
        this._parEnemy.anchorX = 0.5;   // スプライトの中心を移動、回転の中心にする．
        this._parEnemy.anchorY = 0.5;
        // this._parEnemy.rotation = Math.PI/6;
        this._parEnemy.rotation = 0;    // 初期状態では回転なし
        this._parEnemy.w = this._tex_enemy.width;   // テクスチャのサイズをパーティクルにもセットしておく
        this._parEnemy.h = this._tex_enemy.height;
        this._aid = aid;
        this._count = 0;
        this._containers.particleContainer.addParticle(this._parEnemy);
        this._scrSize = scrSize;
        this._attackRoute = route;
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
                            targetX = this._scrSize.x * 1.2;    // 画面の右端を少し過ぎたあたりを目標
                            break;
                        case 1:
                            targetX = -this._scrSize.y * 0.2;  // 画面の左端を少し過ぎたあたりを目標
                            break;
                    }
                    const dx = (targetX - this._parEnemy.x) / this._scrSize.y * diffY;
                    this._parEnemy.x += dx;
                } else {
                    const yposRatio = this._parEnemy.y / this._scrSize.y;  // 画面の縦位置でどこにいるか(0=一番上、1=一番下)
                    let dx = 0;
                    switch (this._aid) {
                        case 2:
                            // 蛇行ルート
                            dx = (this._scrSize.x * 0.6) * Math.sin(yposRatio * Math.PI);
                            if (this._parEnemy.init_x < this._scrSize.x / 2) dx = -dx;   // 出現x座標が画面真ん中より左なら左に曲がるようにする
                            break;
                        case 3:
                            // 蛇行ルート（その2）
                            dx = (this._scrSize.x * 0.6) * Math.sin(yposRatio * Math.PI * 2);
                            break;
                    }
                    this._parEnemy.x = this._parEnemy.init_x + dx;
                }
            }
        }
    }

    public isOutOfStage() {
        if (this._parEnemy) {
            if (this._parEnemy.y > this._scrSize.y) {
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

// 敵（全体）
export class Enemies {
    private _containers: Utils.Containers | null = null;
    private _wholeTextures: PIXI.Spritesheet | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };
    private _formations: EnemyFormation[] = [];

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, w: number, h: number) {
        this._containers = containers;
        this._wholeTextures = wholeTexture;
        this._scrSize.x = w;
        this._scrSize.y = h;
    }

    public genEnemies(posPlayer: Utils.Vec2) {
        if (this._containers?.particleContainer && this._wholeTextures) {
            const nEnemies = 10;

            const eid = Math.trunc(Math.random() * 7);  // 敵id(=0-6)
            const aid = Math.trunc(Math.random() * 4);  // 攻撃パターンid(=0-3)

            const formation = new EnemyFormation();
            formation.init(this._containers, this._wholeTextures, this._scrSize);
            formation.genFormation(nEnemies, eid, aid, posPlayer);

            this._formations.push(formation);
        }
    }

    // ヒットテスト(1) - 弾丸
    public hitTest_bullet(posPlayerBullet: Utils.Vec2, playerBulletSize: number, explosions: Explosion.Explosions): number {
        let scorePoints = 0;    // 加算スコア
        const indsToRemoveFormations: number[] = [];
        for (let i = 0; i < this._formations.length; i++) {
            const formation = this._formations[i];
            const pEnemies = formation.getEnemies();
            const indsToRemoveEnemies: number[] = [];
            let nHitEnemies = 0;    // 弾丸が当たった敵の個数
            for (let j = 0; j < pEnemies.length; j++) {
                const parEnemy = pEnemies[j].getParEnemy();
                if (parEnemy) {
                    const posEnemy = {
                        x: parEnemy.x,
                        y: parEnemy.y
                    }
                    const enemy_r = parEnemy.w * 0.8;   // 大体の半径を適当に計算
                    if (Utils.hitTest1(posPlayerBullet, playerBulletSize, posEnemy, enemy_r)) {
                        // 当たった
                        indsToRemoveEnemies.push(j);
                        nHitEnemies += 1;
                        if (pEnemies.length - nHitEnemies == 0) {
                            // 編隊の最後の1機だった（編隊は全滅した）
                            // ボーナスポイント加算
                            scorePoints += 300;
                            console.log(`Bonus point! formation destroyed.`);

                            // [TODO] ボーナス点数表示を行う場合はここで行う

                            indsToRemoveFormations.push(i); // 削除するformationのインデックスを記録（消すのは後で）
                        }

                        // 爆発アニメーションを追加
                        explosions.addNewExplosion(posEnemy);

                        // 爆発音
                        Sound.playSE("explosion");

                        // 点数加算
                        scorePoints += 10;
                    }
                }
            }
            formation.removeEnemies(indsToRemoveEnemies);
        }

        // 全滅したformationがあれば消す．
        if (indsToRemoveFormations.length > 0) {
            this.removeFormations(indsToRemoveFormations);
        }

        return scorePoints;
    }

    // ヒットテスト(2) - レーザー
    public hitTest_laser(posLaser1: Utils.Vec2, posLaser2: Utils.Vec2, explosions: Explosion.Explosions): number {
        let scorePoints = 0;    // 加算スコア
        const indsToRemoveFormations: number[] = [];
        for (let i = 0; i < this._formations.length; i++) {
            const formation = this._formations[i];
            const pEnemies = formation.getEnemies();
            const indsToRemoveEnemies: number[] = [];
            let nHitEnemies = 0;    // 弾丸が当たった敵の個数
            for (let j = 0; j < pEnemies.length; j++) {
                const parEnemy = pEnemies[j].getParEnemy();
                if (parEnemy) {
                    const posEnemy = {
                        x: parEnemy.x,
                        y: parEnemy.y
                    }
                    const enemy_r = parEnemy.w * 0.8;   // 大体の半径を適当に計算
                    if (Utils.hitTest2(posLaser1, posLaser2, posEnemy, enemy_r)) {
                        // 当たった
                        indsToRemoveEnemies.push(j);
                        nHitEnemies += 1;
                        if (pEnemies.length - nHitEnemies == 0) {
                            // 編隊の最後の1機だった（編隊は全滅した）
                            // ボーナスポイント加算
                            scorePoints += 300;
                            console.log(`Bonus point! formation destroyed.`);

                            // [TODO] ボーナス点数表示を行う場合はここで行う

                            indsToRemoveFormations.push(i); // 削除するformationのインデックスを記録（消すのは後で）
                        }

                        // 爆発アニメーションを追加
                        explosions.addNewExplosion(posEnemy);

                        // 爆発音
                        Sound.playSE("explosion");

                        // 点数加算
                        scorePoints += 10;
                    }
                }
            }
            formation.removeEnemies(indsToRemoveEnemies);
        }

        // 全滅したformationがあれば消す．
        if (indsToRemoveFormations.length > 0) {
            this.removeFormations(indsToRemoveFormations);
        }

        return scorePoints;
    }

    private removeFormations(indsToRemove: number[]) {
        if (indsToRemove.length > 0) {
            // Setを使って重複を消し、配列に戻す
            const indsToRemove2 = [...new Set(indsToRemove)];

            // 降順にソート
            const sortedInds = indsToRemove2.sort((a, b) => b - a)

            for (const i of sortedInds) {
                this._formations.splice(i, 1); // i番目の要素を削除して配列の長さを縮める
            }
        }
    }

    public update() {
        for (const formation of this._formations) {
            formation.update();
        }
    }

    public attack(posPlayer: Utils.Vec2, enemyBullets: EnemyBullet.EnemyBullets) {
        for (const formation of this._formations) {
            formation.attack(posPlayer, enemyBullets);
        }
    }
}

type AttackRouteParam = {
    posPlayer: Utils.Vec2,
    scrSize: Utils.Vec2
}

type AttackRouteElem = {
    d: Utils.Vec2,  // 移動変位
    rot: number,    // 回転量（ラジアン）
    scale: Utils.Vec2   // 拡大係数
}

// 攻撃（飛行）ルート
class AttackRoute {
    private _routes: AttackRouteElem[] = [];

    // ルートを生成する
    public genRoute(aid: number, param: AttackRouteParam) {

    }
}

// 編隊（複数の敵機からなる単位）
class EnemyFormation {
    private _containers: Utils.Containers | null = null;
    private _wholeTextures: PIXI.Spritesheet | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };

    private _aid: number = 0;   // 攻撃パターン
    private _enemies: Enemy[] = [];

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        this._containers = containers;
        this._wholeTextures = wholeTexture;
        this._scrSize = scrSize;
    }

    // 編隊を生成する
    public genFormation(nEnemies: number, eid: number, aid: number, posPlayer: Utils.Vec2) {
        if (!this._containers || !this._wholeTextures) return;

        // 敵idからテクスチャパスを得る
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

        const x = Math.random() * this._scrSize.x;  // 出現位置
        for (let i = 0; i < nEnemies; i++) {
            const y = i * (-80);
            const posEnemy: Utils.Vec2 = { x, y };
            const route = new AttackRoute();
            const attackParam: AttackRouteParam = {
                posPlayer,
                scrSize: this._scrSize
            }
            route.genRoute(aid, attackParam);
            const enemy = new Enemy();
            enemy.init(this._containers, this._wholeTextures, etex, posEnemy, this._scrSize, aid, route);

            this._enemies.push(enemy);
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

    public attack(posPlayer: Utils.Vec2, enemyBullets: EnemyBullet.EnemyBullets) {
        const attackRatio = 0.005;  // 攻撃頻度（大きいほど攻撃が多くなる）
        const bulletSpeed = 5; // 弾丸の速さ（大きいほど弾丸が速い）[TODO] aidによって変えてもいい

        for (let i = 0; i < this._enemies.length; i++) {
            const enemy = this._enemies[i];
            if (enemy && Math.random() < attackRatio) { // 攻撃を行うか？
                const parEnemy = enemy.getParEnemy();
                if (parEnemy) {
                    // 攻撃
                    const posEnemy = { x: parEnemy.x, y: parEnemy.y };
                    const sizeEnemy = { x: 64, y: 64 };
                    enemyBullets.genNewBullets(posPlayer, posEnemy, sizeEnemy, bulletSpeed);
                }
            }
        }
    }
}