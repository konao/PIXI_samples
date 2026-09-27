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
        if (this._parEnemy && this._attackRoute) {
            if (this._parEnemy.y < 0) {
                this._parEnemy.y += this._attackRoute.getRouteDefaultSpeed();
            } else {
                // カウントに応じて移動（回転、等）
                const elem = this._attackRoute.getRouteElem(this._count);
                this._parEnemy.x += elem.d.x;
                this._parEnemy.y += elem.d.y;
                this._parEnemy.rotation = elem.rot;

                // カウント更新
                this._count += 1;
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

type AttackRouteParam = {
    posEnemy: Utils.Vec2,  // 敵の位置
    posPlayer: Utils.Vec2,  // プレーヤーの位置
    scrSize: Utils.Vec2,    // 画面サイズ
    speed: number   // 移動スピード
}

class AttackRouteElem {
    public d: Utils.Vec2;  // 移動変位
    public rot: number;    // 回転量（ラジアン）
    public scale: Utils.Vec2;   // 拡大係数
    // （注）rotとscaleは（dと異なり）差分ではない

    public constructor(_d: Utils.Vec2, _rot: number = 0, _scale: Utils.Vec2 = { x: 1.0, y: 1.0 }) {
        this.d = _d;
        this.rot = _rot;
        this.scale = _scale;
    }
}

// 攻撃（飛行）ルート
class AttackRoute {
    private _routes: AttackRouteElem[] = [];    // 移動変位の配列
    private _initialPosEnemy: Utils.Vec2 = { x: 0, y: 0 };    // 出現位置
    private _speed: number = 0;

    // ルートを生成する
    public genRoute(aid: number, param: AttackRouteParam, iEnemy: number) {
        // 出現位置を計算
        this._initialPosEnemy.x = param.posEnemy.x; // x座標はiEnemyに関わらず同じ

        // 出現位置のy座標を計算．formation中の番号に応じて調整
        // (iEnemyの順に従って、画面上部の下から上に並ぶようにする)
        this._initialPosEnemy.y = iEnemy * (-80);

        // このルートのデフォルトスピードを保持しておく（敵が画面に現れるまで、この値でy座標を更新するため）
        this._speed = param.speed;

        switch (aid) {
            case 0:
                // 直線ルート
                {
                    // 飛行目標地点を計算
                    let targetX = 0;
                    const targetY = param.scrSize.y;
                    if (this._initialPosEnemy.x < param.scrSize.x / 2) {
                        // 敵の出現位置が画面中央より左
                        targetX = param.scrSize.x * 1.1;    // 画面の右端を少し過ぎたあたりを目標
                    } else {
                        // 敵の出現位置が画面中央より右
                        targetX = param.scrSize.y * (-0.1);  // 画面の左端を少し過ぎたあたりを目標
                    }

                    // 変位の配列に変換
                    const dx = (targetX - this._initialPosEnemy.x) / targetY * param.speed;    // x方向変位
                    this._routes.push(new AttackRouteElem({ x: dx, y: param.speed }));  // 最初の要素
                    let y = 0;
                    while (y <= targetY) {
                        y += param.speed;
                        this._routes.push(new AttackRouteElem({ x: dx, y: param.speed }));
                    }
                }
                break;
            case 1:
                // 蛇行ルート(1)
                {
                    let amp_w = param.scrSize.x / 2;  // ルートの振幅幅を画面の幅の半分にする

                    // 出現位置によって右周りか、左回りかを変える
                    if (this._initialPosEnemy.x > param.scrSize.x / 2) {
                        // 敵の出現位置が画面中央より右
                        amp_w *= (-1);
                    }

                    // 飛行目標地点を計算
                    const targetX = this._initialPosEnemy.x;
                    const targetY = param.scrSize.y;

                    // ルートを計算（x座標のみ）
                    const route_xs: number[] = [];
                    let y = 0;
                    while (y <= targetY) {
                        y += param.speed;
                        const theta = y / param.scrSize.y * Math.PI;
                        route_xs.push(targetX + amp_w * Math.sin(theta));
                    }

                    // 変位の配列に変換
                    for (let i = 0; i < route_xs.length - 1; i++) {
                        const dx = route_xs[i + 1] - route_xs[i];
                        this._routes.push(new AttackRouteElem({ x: dx, y: param.speed }));
                    }
                }
                break;
            case 2:
                // 蛇行ルート(2)
                {
                    let amp_w = param.scrSize.x / 2;  // ルートの振幅幅を画面の幅の半分にする

                    // 出現位置によって右周りか、左回りかを変える
                    if (this._initialPosEnemy.x > param.scrSize.x / 2) {
                        // 敵の出現位置が画面中央より右
                        amp_w *= (-1);
                    }

                    // 飛行目標地点を計算
                    const targetX = param.scrSize.x - this._initialPosEnemy.x; // 画面中央の縦ラインを基準とした反対側
                    const targetY = param.scrSize.y;

                    // ルートを計算（x座標のみ）
                    const route_xs: number[] = [];
                    let y = 0;
                    while (y <= targetY) {
                        y += param.speed;
                        const yposRatio = y / targetY;  // 画面の縦位置でどこにいるか(0=一番上、1=一番下)
                        const x1 = this._initialPosEnemy.x + (targetX - this._initialPosEnemy.x) * yposRatio;
                        const theta = y / param.scrSize.y * Math.PI * 2;
                        const x2 = amp_w * Math.sin(theta);
                        route_xs.push(x1 + x2);
                    }

                    // 変位の配列に変換
                    for (let i = 0; i < route_xs.length - 1; i++) {
                        const dx = route_xs[i + 1] - route_xs[i];
                        this._routes.push(new AttackRouteElem({ x: dx, y: param.speed }));
                    }
                }
                break;
            case 3:
                // 回転して去っていく
                {
                    // 飛行目標地点を計算
                    let targetX = param.scrSize.x - this._initialPosEnemy.x; // 画面中央の縦ラインを基準とした反対側
                    const targetY = param.scrSize.y;

                    // 出現位置によって右周りか、左回りかを変える
                    const k = (this._initialPosEnemy.x < param.scrSize.x / 2) ? 1.0 : -1.0;

                    // 回転半径
                    const r = param.scrSize.x / 4;  // 適当に変える

                    // ルートを計算（x, y座標両方と回転角）
                    const route: Utils.Vec2[] = [];
                    const rotations: number[] = [];
                    let y = 0;
                    while (y <= targetY) {
                        y += param.speed;
                        const yposRatio = y / targetY;  // 画面の縦位置でどこにいるか(0=一番上、1=一番下)
                        const theta = y / param.scrSize.y * Math.PI * 4;    // 回転角
                        const p1 = {    // 直線上の位置
                            x: this._initialPosEnemy.x + (targetX - this._initialPosEnemy.x) * yposRatio,
                            y
                        }
                        const p2 = {    // 回転成分
                            x: k * r * Math.cos(theta),
                            y: r * Math.sin(theta)
                        }
                        const p = Utils.v_add(p1, p2);
                        route.push(p);  // ルートを追加

                        rotations.push(k * theta);    // 回転角を追加
                    }

                    // 変位の配列に変換
                    for (let i = 0; i < route.length - 1; i++) {
                        const d: Utils.Vec2 = Utils.v_sub(route[i + 1], route[i]);
                        this._routes.push(new AttackRouteElem({ x: d.x, y: d.y }, rotations[i]));
                    }
                }
                break;
        }
    }

    public getRouteElem(i: number) {
        if (this._routes.length > 0) {
            if (i < this._routes.length) {
                return this._routes[i];
            } else {
                return this._routes[this._routes.length - 1];   // 最後の変位をそのまま返す
            }
        } else {
            // ルートが空
            return new AttackRouteElem({ x: 0, y: 1 }); // デフォルトの変位値を返す
        }
    }

    public getRouteDefaultSpeed() {
        return this._speed;
    }

    public getInitialPosEnemy() {
        return this._initialPosEnemy;
    }
}

class AttackRoutes {
    private _routes: AttackRoute[] = [];

    public genRoutes(aid: number, param: AttackRouteParam, nEnemies: number) {
        this._routes = [];

        // aidによって異なるが、formationに属する敵全てで同じ値の計算
        let initialPosEnemy_x = 0;  // 出現位置(x座標)
        let speed = 0;  // 移動スピード
        switch (aid) {
            case 0:
            case 1:
            case 2:
                {
                    initialPosEnemy_x = Math.random() * param.scrSize.x;
                    speed = 5;
                }
                break;
            case 3:
                {
                    if (Math.random() < 0.5) {
                        // 画面の左端から1/3のどこか
                        initialPosEnemy_x = Math.random() * param.scrSize.x / 3;
                    } else {
                        // 画面の右端から1/3のどこか
                        initialPosEnemy_x = param.scrSize.x - Math.random() * param.scrSize.x / 3;
                    }
                    speed = 3;
                }
        }
        param.posEnemy.x = initialPosEnemy_x;
        param.speed = speed;

        for (let iEnemy = 0; iEnemy < nEnemies; iEnemy++) {
            const route = new AttackRoute();
            route.genRoute(aid, param, iEnemy);
            this._routes.push(route);
        }
    }

    public getRoute(iEnemy: number) {
        return this._routes[iEnemy];
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

        const routes = new AttackRoutes();
        const attackParam: AttackRouteParam = {
            posPlayer,
            scrSize: this._scrSize,
            // 以下はダミー（genRoutes()内で計算される）
            posEnemy: { x: 0, y: 0 },
            speed: 0
        }
        routes.genRoutes(aid, attackParam, nEnemies);
        for (let i = 0; i < nEnemies; i++) {
            const route = routes.getRoute(i);
            const initPosEnemy = route.getInitialPosEnemy();
            const enemy = new Enemy();
            enemy.init(this._containers, this._wholeTextures, etex, initPosEnemy, this._scrSize, aid, route);

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

// 敵（全体）
export class Enemies {
    private _containers: Utils.Containers | null = null;
    private _wholeTextures: PIXI.Spritesheet | null = null;
    private _scrSize: Utils.Vec2 = { x: 0, y: 0 };
    private _formations: EnemyFormation[] = [];

    public init(containers: Utils.Containers, wholeTexture: PIXI.Spritesheet, scrSize: Utils.Vec2) {
        this._containers = containers;
        this._wholeTextures = wholeTexture;
        this._scrSize = scrSize;
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