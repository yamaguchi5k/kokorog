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
        // 'helpScreen'
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
        btn.onclick = function() { loginWithUser(name); };
        // 作ったボタンをログイン画面のdivに追加する
        container.appendChild(btn);
    });
}

// ページが表示されたら、最初にユーザー一覧を表示する
window.onload = function() {
    refreshUserList();
    showScreen('loginScreen');
}


// 新規登録処理
function registerUser() {
    // 入力された名前を取得
    const name = document.getElementById("newUserName").value.trim();
    if (!name) {
        document.getElementById(`registerMsg`).textContent = "お名前を入力してください";
        return;
    }
    // ユーザーリストをLocalStrageから取得、または初期化
    let userList = JSON.parse(localStorage.getItem("userList")) || []
    // 重複チェック
    if (userList.includes(name)) {
        document.getElementById(`registerMsg`).textContent = "このユーザー名はすでに登録されています";
        return;
    }
    // リストに追加して保存
    userList.push(name);
    localStorage.setItem("userList", JSON.stringify(userList));
    document.getElementById("newUserName").value = "";
    document.getElementById(`registerMsg`).textContent = ""; // メッセージを消す

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

function selectMood(elem, mood) {
    document.querySelectorAll('.mood-icon').forEach(icon => {
        icon.classList.remove('selected');
    });
    // 押したマークだけ「selected」クラスをつける
    elem.classList.add('selected');
    // 選ばれたマークを変数に保存
    selectedMood = mood;
    document.getElementById("selectedMoodDisplay").textContent = "選択中の気分: " + mood;
}

// 記録保存処理
function saveRecord() {
    const memo = document.getElementById("recordMemo").value.trim(); // 入力されたメモを取得(空白は除去)
    if (!selectedMood && !memo) {
        alert("気分かメモ、どちらかは記録してください");
        return;
    }

    // 既存の記録を取得
    const allRecords = JSON.parse(localStorage.getItem("records")) || []; // 保存済みの記録一覧を取り出す(なければ空の配列)

    const newRecord = {
        user: currentUser,
        date: new Date().toLocaleString(),
        mood: selectedMood,
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
function showPastRecords() {
    // 表示画面切り替え
    showScreen('pastRecordScreen');
    // 記録データを取得＆自分の分だけに絞る
    const allRecords = JSON.parse(localStorage.getItem("records")) || [];
    // 新しい順で、currentUserの分だけ抽出
    const records = allRecords.filter(r => r.user === currentUser).reverse();

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

        // ヘッダー (日付＋気分マーク)
        const header = document.createElement("div");
        header.className = "record-card-header";
        header.innerHTML = `
            <span class="record-card-date">${record.date}</span>
            <span class="record-card-mood">${record.mood}</span>
            `;

            // 区切り線
            const divider = document.createElement("div");
            divider.className = "record-card-divider";

            // メモ
            const memo = document.createElement("div");
            memo.className = "record-card-memo";
            memo.textContent = record.memo || "";

            // カードに追加
            card.appendChild(header);
            card.appendChild(divider);
            card.appendChild(memo);

            // 一覧に追加
            list.appendChild(card);
    });
}