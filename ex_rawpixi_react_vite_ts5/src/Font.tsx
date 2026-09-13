// ************************************************************
//  フォント
// ************************************************************
import * as PIXI from 'pixi.js';

// 1つのフォント
class Font {
    private _name: string = "";

    public constructor(name: string, style: object) {
        this._name = name;

        PIXI.BitmapFont.install({
            name,
            style: {
                ...style,
                fontFamily: 'MyCustomPixelFont' // 固定．以下の★に指定した名前にする．
            }
        });
    }

    public createBitmapText(style: object): PIXI.BitmapText {
        const text = new PIXI.BitmapText({
            text: "",
            style: {
                ...style,
                fontFamily: this._name
            }
        });

        return text;
    }
}

// フォント管理
class FontManager {
    private _fonts: Record<string, any> = {};

    public async init() {
        await PIXI.Assets.load({
            alias: 'MyCustomPixelFont', // 👈 ここで自由な名前をつけます（★）
            src: '/fonts/BitcountSingle-VariableFont_CRSV,ELSH,ELXP,slnt,wght.ttf', // 👈 先頭に「/」をつけてルートパスにする
            data: {
                family: 'MyCustomPixelFont' // 👈 PixiJS内部のフォントファミリー名として紐付ける（★）
            }
        });
    }

    // 引数のnameは好きな名前でok
    public createNewFont(name: string, style: object): Font {
        const font = new Font(name, style);
        this._fonts.name = font;
        return font;
    }

    public getFont(name: string): Font | undefined {
        return this._fonts[name];
    }
}

export {
    Font,
    FontManager
}