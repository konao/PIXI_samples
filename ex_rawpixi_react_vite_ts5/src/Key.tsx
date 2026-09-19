// ************************************************************
//  キーボード
// ************************************************************

//  キーボードの状態を格納する型
export type KeyStatus = { [key: string]: boolean }

// キーボードの入力状態を管理するオブジェクト
export const keys: KeyStatus = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    Digit1: false,
    Digit2: false,
    Digit3: false,
    Digit4: false,
    KeyP: false
};

// イベントリスナーを登録（キーが押されたか離されたかを記録）
window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault(); // 画面がブラウザでスクロールするのを防ぐ
    }
    switch (e.code) {
        case 'Space': {
            keys.Space = true;
            e.preventDefault(); // スクロール防止
            break;
        }
        case 'Digit1': {
            keys.Digit1 = true;
            e.preventDefault();
            break;
        }
        case 'Digit2': {
            keys.Digit2 = true;
            e.preventDefault();
            break;
        }
        case 'Digit3': {
            keys.Digit3 = true;
            e.preventDefault();
            break;
        }
        case 'Digit4': {
            keys.Digit4 = true;
            e.preventDefault();
            break;
        }
        case 'KeyP': {
            keys.KeyP = true;
            e.preventDefault();
            break;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

