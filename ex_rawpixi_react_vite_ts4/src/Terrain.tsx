import * as PIXI from 'pixi.js';

export class Terrain {
    private app: PIXI.Application;
    private terrain: any;
    private terrainSize: { xsize: number; ysize: number } = { xsize: 0, ysize: 0 };
    private terrainMap: object[][] = [];

    constructor(app: PIXI.Application, terrainData: any) {
        this.app = app;
        this.terrain = terrainData;
    }

    public createTerrain() {
        // terrain.jsonの内容をもとに、terrainSizeとterrainMapを初期化
        this.terrainSize.xsize = this.terrain["xsize"];
        this.terrainSize.ysize = this.terrain["ysize"];
        this.terrainMap = Array.from({ length: this.terrainSize.ysize }, () => Array(this.terrainSize.xsize).fill(0));

        // terrain.jsonの各セルの情報をterrainMapに格納
        for (const cell of this.terrain["cells"]) {
            let x = cell["x"];
            let y = cell["y"];
            let objs = cell["objs"];
            if (objs) {
                this.terrainMap[y][x] = objs;
            } else {
                this.terrainMap[y][x] = [];
            }
        }
    }

    public getTerrainSize() {
        return this.terrainSize;
    }

    public getTerrainMap() {
        return this.terrainMap;
    }
}