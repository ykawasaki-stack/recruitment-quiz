// 🚨 データを送信するGASのWebアプリURLに書き換えてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxjMMkzLSGhopGRY3OaB25oLHyoqjJtkIGb8JDgVMpcJDHXHaU8u1oEHu3OwEn01lwm/exec';

document.addEventListener('DOMContentLoaded', function() {
    const quizSections = document.querySelectorAll('.quiz-section');
    const nextButtons = document.querySelectorAll('.next-button');
    const submitButton = document.getElementById('submit-button');
    const progressBar = document.getElementById('progress-bar');
    const lockButton = document.getElementById('lock-button');
    let currentSection = 1;
    let isLocked = false;
    
    // 質問ごとのセクション定義
    const sectionMap = {
        'q1': 1, 'q2': 1, 'q3': 1, 'q4': 1,
        'q5': 2, 'q6': 2, 'q7': 2, 
        'q8': 3, 'q9': 3, 'q10': 3
    };

    // 提案する手法の定義
    const solutionData = {
        'ad': {
            title: '① 求人広告活用型 (費用対効果重視)',
            icon: '📢',
            desc: '幅広い層へアプローチし、コストパフォーマンス良く複数名を採用するのに適した手法です。',
            merit: '多くの候補者に貴社の魅力を視覚的に訴求でき、採用単価を抑制できる可能性があります。',
            detail: '貴社は採用における「母集団形成」や「ブランディング」を重視すべきフェーズです。特定のターゲットだけでなく、潜在層も含めて広く網羅できる「総合求人サイト」や、職種に特化した「専門求人メディア」への掲載をご提案します。'
        },
        'direct': {
            title: '② ダイレクトサービス型 (攻めの採用重視)',
            icon: '🎯',
            desc: '企業側から欲しい人材に直接アプローチし、攻めの採用を行う手法です。',
            merit: '市場に少ない希少人材や、転職潜在層に対してピンポイントでアプローチが可能です。',
            detail: '貴社には明確なターゲット像があり、かつ社内で能動的に動けるリソースがあります。データベースから条件に合う人材を検索し、直接スカウトメールを送る「ダイレクトリクルーティングサービス」の活用が最も効果的です。'
        },
        'agency': {
            title: '③ 人材紹介活用型 (確実性重視)',
            icon: '🤝',
            desc: 'プロのエージェントがスクリーニングした人材のみを紹介してもらう、成功報酬型の手法です。',
            merit: '初期費用がかからず（完全成功報酬）、採用担当者の工数を大幅に削減できます。',
            detail: '貴社は「確実性」と「工数削減」を優先すべきです。採用難易度が高いポジションや、非公開で進めたい案件については、専門特化した「人材紹介エージェント」と連携し、要件に合致した人材のみ面接するフローをご提案します。'
        },
        'staff': {
            title: '④ 人材派遣・アウトソーシング型 (スピード・柔軟性重視)',
            icon: '🏢',
            desc: '必要な期間、必要なスキルの人材を迅速に確保し、業務遂行を優先する手法です。',
            merit: '採用活動の手間をかけず、即戦力をスピーディーに確保。人件費の変動費化も可能です。',
            detail: '貴社の最優先課題は「スピード」と「欠員補充」です。正社員採用にこだわって時間を浪費するよりも、まずは「人材派遣」や「紹介予定派遣」を活用し、業務を回すことを優先する戦略をご提案します。'
        }
    };

    function updateProgress() {
        let percentage = (currentSection / 3) * 100;
        progressBar.style.width = percentage + '%';
    }

    function showSection(sectionNumber) {
        quizSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        const targetSection = document.querySelector(`.quiz-section[data-section="${sectionNumber}"]`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            currentSection = sectionNumber;
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function checkSectionAnswered(sectionNumber) {
        let isAnswered = true;
        for (let i = 1; i <= 10; i++) {
            const qName = 'q' + i;
            if (sectionMap[qName] === sectionNumber) {
                const answered = document.querySelector(`input[name="${qName}"]:checked`);
                if (!answered) {
                    isAnswered = false;
                    break;
                }
            }
        }
        return isAnswered;
    }

    // 必須入力チェック関数 (メールアドレスバリデーション強化)
    function checkRequiredFields() {
        const companyName = document.getElementById('companyName');
        const personName = document.getElementById('personName');
        const email = document.getElementById('email');

        if (!companyName.value || !personName.value || !email.value) {
            alert('診断開始には、企業名、担当者名、メールアドレスの入力が必要です。');
            return false;
        }

        // メールアドレスに "@" と "." が含まれているかチェック
        if (email.value.indexOf('@') === -1 || email.value.indexOf('.') === -1) {
            alert('有効なメールアドレス（例: example@company.com）を入力してください。');
            return false;
        }

        return true;
    }

    // 複数ページ（次へボタン）の制御
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isLocked) return;
            
            // 最初のページに進む前に必須情報をチェック
            if (currentSection === 1 && !checkRequiredFields()) {
                 return;
            }
            
            const nextSection = currentSection + 1;
            
            if (checkSectionAnswered(currentSection)) {
                if (nextSection <= 3) {
                    showSection(nextSection);
                }
            } else {
                alert('このページの質問にすべて回答してください。');
            }
        });
    });

    // 診断実行
    submitButton.addEventListener('click', function() {
        if (isLocked) return;
        
        // 最終チェック
        if (!checkRequiredFields() || !checkSectionAnswered(currentSection)) {
            alert('未入力の項目があります。質問と基本情報をご確認ください。');
            return;
        }
        
        // 基本情報の取得
        const companyName = document.getElementById('companyName').value;
        const personName = document.getElementById('personName').value;
        const email = document.getElementById('email').value;
        
        // スコア計算 (重み付け)
        const BONUS = 0.5; // adとdirectの重み
        let counts = { ad: 0, direct: 0, agency: 0, staff: 0 };
        const collectedAnswers = {}; 

        for (let i = 1; i <= 10; i++) {
            const qName = 'q' + i;
            const selectedAnswer = document.querySelector(`input[name="${qName}"]:checked`);
            if (selectedAnswer) {
                const val = selectedAnswer.value;
                
                let score = 1;
                if (val === 'ad' || val === 'direct') {
                    score += BONUS; // adとdirectの回答に1.5点を加算
                }
                counts[val] += score;
                collectedAnswers[qName] = val; // GAS用データに回答を保持
            }
        }

        // 最多得点のタイプを判定
        let maxScore = -1;
        let resultKey = '';
        
        // 1. スコアを基に最大値を見つける
        for (const [key, value] of Object.entries(counts)) {
            if (value > maxScore) {
                maxScore = value;
                resultKey = key;
            }
        }
        
        // 2. 同点の場合の優先順位調整 (ad > direct > agency > staff)
        const priorities = ['ad', 'direct', 'agency', 'staff'];
        const winningKeys = Object.entries(counts).filter(([key, value]) => value === maxScore).map(([key]) => key);

        for (const pKey of priorities) {
            if (winningKeys.includes(pKey)) {
                resultKey = pKey;
                break;
            }
        }

        const solution = solutionData[resultKey];

        // ★★ 修正箇所：ご提案方針のテキストを結果に応じて変更 ★★
        let recommendationText = '';
        if (resultKey === 'agency' || resultKey === 'staff') {
             // 人材紹介または人材派遣が最適な場合のテキスト
            recommendationText = `診断結果が示すように、貴社は確実性やスピードを重視すべきフェーズです。弊社が直接取り扱っていない商品領域となる場合がございますが、特定の媒体に縛られず、パートナー企業との連携も含めて、貴社の課題解決に最も適した戦略をご提案いたします。<br>
            `;
        } else {
             // 求人広告またはダイレクトサービスが最適な場合のテキスト（従来のテキスト）
            recommendationText = `診断結果に基づき、特定の媒体に縛られず、貴社の課題解決に最も適したプランをカスタマイズしてご提案いたします。<br>
            キャンペーンを確認の上、最適なご提案をさせていただきます。`;
        }
        // ----------------------------------------------------
        
        // 結果表示用HTMLの生成
        const resultHTML = `
            <div class="result-summary">
                <div class="result-icon">${solution.icon}</div>
                <div class="result-title" data-type="${resultKey}">${solution.title}</div>
                <p class="result-desc">${solution.desc}</p>
            </div>
            
            <div class="result-detail-box">
                <h4>📊 診断分析</h4>
                <p>${solution.detail}</p>
                <p><strong>メリット:</strong> ${solution.merit}</p>
            </div>

            <div class="recommendation-area">
                <h4>💡 弊社からのご提案方針</h4>
                <p>${recommendationText}</p>
            </div>
        `;

        // 結果を画面に反映
        document.getElementById('result-type-main').textContent = "貴社に最適な採用戦略は...";
        document.getElementById('result-details').innerHTML = resultHTML;
        
        // 表示切り替え
        document.querySelector(`.quiz-section[data-section="${currentSection}"]`).style.display = 'none';
        document.getElementById('result').classList.add('active');
        document.getElementById('result').style.display = 'block';

        lockButton.classList.remove('disabled');
        lockButton.disabled = false;
        
        // GAS送信（データ収集）
        if (GAS_URL && GAS_URL.startsWith('http')) {
            const collectedData = {
                companyName: companyName,
                personName: personName,
                email: email, // メールアドレスも送信
                resultType: solution.title,
                countAd: counts.ad.toFixed(1),
                countDirect: counts.direct.toFixed(1),
                countAgency: counts.agency.toFixed(1),
                countStaff: counts.staff.toFixed(1),
                ...collectedAnswers
            };

            fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(collectedData),
            }).then(() => console.log("Data sent to GAS")).catch(e => console.error(e));
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 診断結果のロック機能
    lockButton.addEventListener('click', function() {
        if (!isLocked) {
            isLocked = true;
            document.body.classList.add('locked-state'); 
            lockButton.textContent = '結果を確定しました';
            lockButton.disabled = true;
            lockButton.style.backgroundColor = '#7f8c8d';
            alert('診断結果を確定しました。これ以降、回答内容の変更はできません。');
        }
    });

    // 初期表示
    showSection(1);
});