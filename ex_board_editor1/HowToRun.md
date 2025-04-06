# ビルド＆実行方法

2025/4/6

おニューの環境(Surface Pro 9)に以降したら動かなくなったのでビルド＆実行方法を再度調べた．

## ビルド

```
cd このディレクトリ
npm install -D electron
```

package.jsonの"scripts"に"start"項を追加

```
  "scripts": {
    "start": "electron .",  <=== これを追加
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

## 実行

```
npm run start
```

注）コマンドラインでダイレクトに`electron .`とやっても起動しない
（パスに入っていないかららしい．electronの実行形式は`node_modules\.bin`にある）