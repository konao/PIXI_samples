# 素のPIXI + React + Vite + TypeScriptアプリのビルド方法

2025/6/10 konao
2026/5/3 修正

## ひな形生成＆ライブラリインストール

```
npx create-electron-app@latest ex_rawpixi_react_vite_ts --template=vite-typescript
cd ex_rawpixi_react_vite_ts
npm install react react-dom
npm install -D @types/react
npm install pixi.js
```

## 実行

```
npm start
```

## ソース上の注意点

[1] `tsconfig.json`に以下を追加

```json
{
  "compilerOptions": {
    "jsx": "react-jsx", # <--- "compilerOptions"セクションは既にあるので、この行だけ追加！
  }
}
```

[2] `renderer.ts`の拡張子を`.tsx`に変え、`renderer.tsx`にする．