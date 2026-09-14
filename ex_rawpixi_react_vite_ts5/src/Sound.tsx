// ************************************************************
//  効果音
// ************************************************************

// 効果音のファイルをあらかじめ指定
const SOUND_FILES: Record<string, string> = {
    shot: '/sounds/shot.mp3',   // 弾の発射音
    explosion: '/sounds/explosion3.mp3', // 爆発音
    hit: '/sounds/beamGun.mp3'
};

/**
 * 効果音を鳴らす関数
 * @param {string} soundName - SOUND_FILES のキー名
 */
function playSE(soundName: string) {
    const src = SOUND_FILES[soundName];
    if (!src) return;

    // 毎回新しいAudioオブジェクトを作ることで、音が途切れずに重なって鳴ります
    const audio = new Audio(src);
    audio.volume = 0.3; // 音量調節（0.0 〜 1.0）
    
    // 再生
    audio.play().catch(error => {
        // ゲーム開始直後など、ユーザーの操作前に鳴らそうとした場合のエラー回避
        console.warn("音声の再生がブロックされました:", error);
    });
}

export {
    playSE
}