import * as PIXI from 'pixi.js';

export class Texture {
    private baseTexture: PIXI.Spritesheet | null = null;
    private terrain2tex: any = null;
    private textureMap: { [key: string]: PIXI.Texture } = {};

    constructor() {
    }

    public async createTexture(terrain2tex: any) {
        this.terrain2tex = terrain2tex;

        // JSONファイルをAssets.loadすると、内部の画像も自動でロード・分割されます
        this.baseTexture = await PIXI.Assets.load('image/MiniWorldSpritesSheet.json');

        // JSON内で定義した「スプライト名」で個別テクスチャを取り出せる
        //   const tex_nature_trees = sheet.textures['Nature/Trees.png'];
        //   const tex_ground_cliff = sheet.textures['Ground/Cliff.png'];

        // ここで、terrain2tex.jsonの内容をもとに、必要なテクスチャを作成してtextureMapに格納する
        for (const textureInfo of this.terrain2tex["texmap"]) {
            const name = textureInfo["name"];
            const textureName = textureInfo["texture"];
            const tex = this.baseTexture?.textures[textureName];

            if (!tex) {
                console.warn(`Texture ${textureName} not found in spritesheet.`);
                continue;
            }

            if (textureInfo["subtexture"]) {
                const subtexture = textureInfo["subtexture"];
                const subW = subtexture["width"];
                const subH = subtexture["height"];
                const ix = subtexture["ix"];
                const iy = subtexture["iy"];
                this.textureMap[name] = this.createSubTexture(tex, ix, iy, subW, subH);
                console.log(`Created subtexture for ${name} from ${textureName} at (${ix}, ${iy}) with size (${subW}, ${subH})`);
            } else {
                this.textureMap[name] = tex;
            }
        }

        console.log('Texture map created:', this.textureMap);
    }

    public createSubTexture(texture: PIXI.Texture, ix: number, iy: number, subW: number, subH: number): PIXI.Texture {
        if (!this.baseTexture) {
            throw new Error('Texture has not been created');
        }

        const targetX = texture.frame.x + (ix * subW);
        const targetY = texture.frame.y + (iy * subH);

        return new PIXI.Texture({
            source: texture.source,
            frame: new PIXI.Rectangle(targetX, targetY, subW, subH)
        });
    }

    public getTextureByName(name: string): PIXI.Texture | undefined {
        return this.textureMap[name];
    }
}
