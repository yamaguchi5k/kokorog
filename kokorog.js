let currentUser = "";
let selectedMoodImage = "";

// ロゴをクリックするとログイン画面へ移動
window.onload = function() {
    document.getElementById('logoTitle').onclick = function() {
        showScreen('loginScreen');
    };
    refreshUserList();
    showScreen('loginScreen');
}



// 画面切り替え
function showScreen(screenId) {
    const screens = [
        'loginScreen',
        'registerScreen',
        'registerCompleteScreen',
        'homeScreen',
        'loginCheckScreen',
        'recordScreen',
        'pastRecordScreen',
        'helpScreen'
    ];
    // すべての画面をいったん非表示
    screens.forEach(id => {
        document.getElementById(id).style.display = "none";
    });
    // 指定された画面だけ表示
    document.getElementById(screenId).style.display = "block";

    // ユーザー名を使う画面の場合にだけ表示を更新
    if (['homeScreen', 'recordScreen', 'pastRecordScreen'].includes(screenId)) {
        document.getElementById('userWelcomeHome').textContent = currentUser;
        document.getElementById('userWelcomeRecord').textContent = currentUser;
        document.getElementById('userWelcomePast').textContent = currentUser;
    }

    // ハンバーガーメニューの表示切替
    const menuToggle = document.getElementById('menuToggle');
    if (['homeScreen', 'recordScreen', 'pastRecordScreen', 'helpScreen'].includes(screenId)) {
        menuToggle.style.display = 'flex';
    } else {
        menuToggle.style.display = 'none';
        document.getElementById('sideMenu').classList.remove('open');
    }
}


// ログイン画面処理
// ユーザー一覧をボタンで並べて表示する
function refreshUserList() {
    // LocalStrageからユーザー名リストを取得
    const userList = JSON.parse(localStorage.getItem("userList")) || [];
    const container = document.getElementById("userButtonList");
    // 中身を空にしてから、今のユーザーリストを上書きする
    container.innerHTML = "";

    // ユーザー名リストの1人ずつについて処理をする
    userList.forEach(name => {
        // ボタンを新しく作る
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.className = "app-btn";
        btn.onclick = function() { loginWithUser(name); };
        // 作ったボタンをログイン画面のdivに追加する
        container.appendChild(btn);
    });
}



// 新規登録処理
function registerUser() {
    // 入力された名前を取得
    const name = document.getElementById("newUserName").value.trim();
    if (!name) {
        const msg = document.getElementById(`registerMsg`);
        msg.textContent = "お名前を入力してください";
        msg.style.color = "#ff6347";
        msg.style.fontWeight = "bold";
        return;
    }
    // ユーザーリストをLocalStrageから取得、または初期化
    let userList = JSON.parse(localStorage.getItem("userList")) || []
    // 重複チェック
    if (userList.includes(name)) {
        const msg = document.getElementById(`registerMsg`);
        msg.textContent = "このユーザー名はすでに登録されています";
        msg.style.color = "#ff6347";
        msg.style.fontWeight = "bold";
        return;
    }
    // リストに追加して保存
    userList.push(name);
    localStorage.setItem("userList", JSON.stringify(userList));
    document.getElementById("newUserName").value = "";
    document.getElementById(`registerMsg`).textContent = ""; // メッセージを消す

    localStorage.setItem("showHelp", "yes"); // 初回登録フラグを保存
    showScreen('registerCompleteScreen'); // ログイン完了画面に移動
}


// 新規登録完了処理
function goToLoginFromComplete() {
    showScreen('loginScreen');
    refreshUserList(); // ユーザーリストを再表示
}


// ログイン画面で名前を選択したときの処理
function loginWithUser(name) {
    currentUser = name; // ユーザー名を記憶
    document.getElementById('checkLoginUser').textContent = name;
    showScreen('loginCheckScreen')
}

// 「OK」ボタンを押したらホーム画面へ
function moveToHome() {
    showScreen('homeScreen');
    showUserName(); // ホーム画面で表示
}


// 記録画面処理
let selectedMood = ""; // 選ばれた気分を一時的に保存

function selectMood(elem, mood, moodImage) {
    document.querySelectorAll('.mood-icon').forEach(icon => {
        icon.classList.remove('selected');
    });
    // 押したマークだけ「selected」クラスをつける
    elem.classList.add('selected');
    // 選ばれたマークを変数に保存
    selectedMood = mood;
    selectedMoodImage = moodImage;
    document.getElementById("selectedMoodDisplay").textContent = "選択中の気分: " + mood;
}

// 記録保存処理
function saveRecord() {
    const memo = document.getElementById("recordMemo").value.trim(); // 入力されたメモを取得(空白は除去)
    const errorMsgElem = document.getElementById("recordErrorMsg");
    errorMsgElem.textContent = "";
    if (!selectedMood && !memo) {
        errorMsgElem.textContent = "気分かメモ、どちらかは記録してください";
        return;
    }

    //記録成功時はエラーメッセージを消す
    errorMsgElem.textContent = "";
    
    // 既存の記録を取得
    const allRecords = JSON.parse(localStorage.getItem("records")) || []; // 保存済みの記録一覧を取り出す(なければ空の配列)

    const newRecord = {
        user: currentUser,
        date: new Date().toLocaleString(),
        mood: selectedMood,
        moodImage: selectedMoodImage,
        memo: memo
    };

    allRecords.push(newRecord); // 新しい記録を配列に追加
    localStorage.setItem("records", JSON.stringify(allRecords)); // 配列をJSON形式で保存(上書き保存)

    showPopup();
}

// 入力リセット関数
function resetRecordForm() {
    selectedMood = "";
    document.querySelectorAll('.mood-icon').forEach(icon => {
        icon.classList.remove('selected');
    });
    document.getElementById("recordMemo").value = "";
    document.getElementById("selectedMoodDisplay").textContent = "";
}

// 記録完了ポップ
function showPopup() {
    document.getElementById('customPopup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('customPopup').style.display = 'none';
    resetRecordForm();
}


// 過去の記録画面
let deleteTargetIdx = null; // 削除対象インデックスを記録

function showPastRecords() {
    // 表示画面切り替え
    showScreen('pastRecordScreen');
    // 記録データを取得＆自分の分だけに絞る
    const allRecords = JSON.parse(localStorage.getItem("records")) || [];
    // 新しい順で、currentUserの分だけ抽出
    const records = allRecords.map((r, idx) => ({...r, index: idx})).filter(r => r.user === currentUser).reverse();

    // 一覧を表示
    const list = document.getElementById("recordList");
    list.innerHTML = "";

    if (records.length === 0) {
        list.innerHTML = "<p>まだ記録がありません</p>";
        return;
    }

    records.forEach(record => {
        // 記録カードを作る
        const card = document.createElement("div");
        card.className = "record-card";

        // 編集状態判定
        let editing = record.editing === true; // trueなら編集モード

        // 気分クラス
        let moodClass = '';
        if (record.mood === 'にっこり' || record.mood === 'smile.png') moodClass = 'mood-smile';
        else if (record.mood === 'ふつう' || record.mood === 'neutral.png') moodClass = 'mood-neutral';
        else if (record.mood = 'しょんぼり' || record.mood === 'sad.png') moodClass = 'mood-sad';

        // ヘッダー (日付＋気分マーク)
        const header = document.createElement("div");
        header.className = "record-card-header";
        header.innerHTML = `
            <span class="record-card-date">${record.date}</span>
            <span class="mood-bg ${moodClass}">
                ${record.moodImage
                    ? `<img src="images/${record.moodImage}" alt="${record.mood}" class="record-card-mood ${moodClass}" style="width:28px; height:28px; vertical-align:middle;">` 
                    : `<span class="record-card-mood ${moodClass}">${record.mood}<span>`
                }
            </span>
            <button class="icon-btn" onclick="openDeletePopup(${record.index})" title="削除">
                <img src="images/trashbox.png" alt="削除">
            </button>
            <button class="icon-btn" onclick="editRecord(${record.index})" title="編集">
                <img src="images/pencil.png" alt="編集">
            </button>
            `;

            // 区切り線
            const divider = document.createElement("div");
            divider.className = "record-card-divider";

            // ここで編集状態ならtextareaを表示、そうでなければ普通にメモを表示
            const memo = document.createElement("div");
            memo.className = "record-card-memo";
            memo.id = `memo-${record.index}`;
            if (record.editing === true) {
                // 編集モード
                memo.innerHTML = `
                    <textarea id="editMemo-${record.index}" rows="3" class="record-edit-memo">${record.memo || ""}</textarea>
                    <div class="edit-btns">
                        <button class="app-btn save-btn" onclick="saveEditdRecord(${record.index})">保存</button>
                        <button class="app-btn cancel-btn" onclick="cancelEdit(${record.index})">キャンセル</button>
                    </div>
                `;
            } else {
                // 通常表示
                memo.textContent = record.memo || "";
            }


            // カードに追加
            card.appendChild(header);
            card.appendChild(divider);
            card.appendChild(memo);
            // 一覧に追加
            list.appendChild(card);
    });
}

// 削除ポップアップ操作
function openDeletePopup(idx) {
    deleteTargetIdx = idx;
    document.getElementById('deletePopup').style.display = 'flex';
    document.getElementById('confirmDeleteBtn').onclick = confirmDeleteRecord;
}
function closeDeletePopup() {
    document.getElementById('deletePopup').style.display = 'none';
    deleteTargetIdx = null;
}
function confirmDeleteRecord() {
    let allRecords = JSON.parse(localStorage.getItem("records")) || [];
    allRecords.splice(deleteTargetIdx, 1);
    localStorage.setItem("records", JSON.stringify(allRecords));
    closeDeletePopup();
    showPastRecords();
}

// 編集機能
function editRecord(idx) {
    let allRecords = JSON.parse(localStorage.getItem("records")) || [];
    // まず全部のeditingをfalseにしてから、該当だけtrue
    allRecords.forEach((r, i) => {
        if (i === idx) r.editing = true;
        else delete r.editing;
    });
    localStorage.setItem("records", JSON.stringify(allRecords));
    showPastRecords();
}

    

function saveEditdRecord(idx) {
    let allRecords = JSON.parse(localStorage.getItem("records")) || [];
    const newMemo = document.getElementById(`editMemo-${idx}`).value;
    if (allRecords[idx]) {
        allRecords[idx].memo = newMemo;
        allRecords.forEach(r => delete r.editing); // 編集終了！
    }
    localStorage.setItem("records", JSON.stringify(allRecords));
    showPastRecords();
}
function cancelEdit(idx) {
    let allRecords = JSON.parse(localStorage.getItem("records")) || [];
    allRecords.forEach(r => delete r.editing);
    localStorage.setItem("records", JSON.stringify(allRecords));
    showPastRecords();
}


// 新規登録直後、フラグを保存
function moveToHome() {
    // 新規登録直後かどうかチェック
    if (localStorage.getItem("showHelp") === "yes") {
        showScreen('helpScreen');
        localStorage.removeItem("showHelp"); // フラグを消す
    } else {
        showScreen('homeScreen');
        showUserName(); // 名前表示
    }
}


// ハンバーガーメニュー開閉
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    menuToggle.addEventListener('click', function() {
        sideMenu.classList.toggle('open');
    });
    // メニュー内ボタンを押したら自動で閉じる
    sideMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => sideMenu.classList.remove('open'));
    });
});