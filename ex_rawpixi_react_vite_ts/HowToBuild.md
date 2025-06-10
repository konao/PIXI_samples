# 素のPIXI + React + Vite + TypeScriptアプリのビルド方法

2025/6/10 konao

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

`tsconfig.json`に以下を追加

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
  }
}
```