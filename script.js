/**
 * document.querySelectorのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element}
 */
const $ = selector => document.querySelector(selector);

/**
 * document.querySelectorAllのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element[]}
 */
const $$ = selector => document.querySelectorAll(selector);

/**
 * 新たなWorkerを生成します。
 * @param {String} relativePath - Workerとして実行するスクリプトの相対パス
 * @returns {Worker} - 生成された新たなWorker
 */
Worker.create = relativePath => {
    try {
        return new Worker(URL.createObjectURL(new Blob(['importScripts("' + location.href.replace(/\\/g, '/').replace(/\/[^\/]*$/, '/') + relativePath + '");'], { type: 'text/javascript' })));
    } catch (e) {
        return new Worker(relativePath);
    }
};

const threads = [];
const list = [];
const checker = Worker.create("checker.js");

const intervalFn = () => {
    /* == スレッド数の調整 == */
    const d = Math.abs(threads.length - $("#threads").value);
    switch (Math.sign(threads.length - $("#threads").value)) {
        case -1: // d個増やす必要がある
            for (let i = 0; i < d; i++) {
                const newWorker = Worker.create("worker.js");
                newWorker.addEventListener("message", event => {
                    list.push(event.data);
                });
                threads.push(newWorker);
            };
            break;
        case 1: // d個減らす必要がある
            for (let i = 0; i < d; i++) threads.shift().terminate();
            break;
        default:
            break;
    }
    /* == waitingに入ってる分をまとめてlistへ移動し、被りを確認 == */
    checker.postMessage(list);
    if ($("#already").value.indexOf("yes") == -1) {
        setTimeout(intervalFn, 1000);
    }
}

checker.addEventListener("message", event => {
    if (event.data) {
        setTimeout(() => {
            /* 被りがある場合は停止処理 */
            for (let i = 0; i < threads.length; i++) threads.shift().terminate();
            if ($("#already").value.indexOf("yes") == -1) {
                $("#already").value = `yes (${list.length})`;
            }
        }, 0);
    }
});

const updateFn = () => {
    /* == 試行回数を更新 == */
    $("#attempt").value = list.length.toLocaleString();
    if ($("#already").value.indexOf("yes") == -1) {
        setTimeout(updateFn, 1000 / 24);
    }
}

window.addEventListener("load", () => {
    intervalFn();
    updateFn();
});
