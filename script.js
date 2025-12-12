// 🚨 データを送信するGASのWebアプリURLに書き換えてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxxj1HpTroVPZOhxXFSYsogyKbrcz1H00m2FrAdWKho4LVN3SLvDWhdmqYvryk5fTpB/exec';

document.addEventListener('DOMContentLoaded', function() {
    const quizSections = document.querySelectorAll('.quiz-section');
    const nextButtons = document.querySelectorAll('.next-button');
    const submitButton = document.getElementById('submit-button');
    const progressBar = document.getElementById('progress-bar');
    const lockButton = document.getElementById('lock-button'); // HTMLで修正済み
    let currentSection = 1;
    let isLocked = false;
    
    // 質問とスコア軸の定義
    const questions = {
        'q1': { axis: 'A', section: 1 }, 'q2': { axis: 'A', section: 1 }, 'q3': { axis: 'A', section: 1 }, 'q4': { axis: 'A', section: 1 },
        'q5': { axis: 'B', section: 2 }, 'q6': { axis: 'B', section: 2 }, 'q7': { axis: 'B', section: 2 }, 'q8': { axis: 'B', section: 2 },
        'q9': { axis: 'C', section: 3 }, 'q10': { axis: 'C', section: 3 },
    };

    // 媒体情報の定義（ロゴはCSSで表現するためのHTMLタグを使用）
    const mediaData = {
        'マイナビ転職': { logo: '<div class="logo-placeholder mynavi">マイナビ転職</div>', target: '若手(20~30代)中心、エリア採用に強み', features: '新卒サイト利用者が多数登録、大規模転職フェア開催、コンタクトメールあり', type: '掲載型総合' },
        'エン転職': { logo: '<div class="logo-placeholder en">エン転職</div>', target: '35歳以下が66.1%、会員数1238万', features: '情報充実度No.1、面接来訪率98%、デイリースカウトあり', type: '掲載型総合' },
        'doda': { logo: '<div class="logo-placeholder doda">doda</div>', target: '若手・中堅層、人材紹介利用者含む', features: '人材紹介のノウハウ活用、プレミア原稿で発見性強化、転職フェア動員', type: '掲載型総合' },
        'type': { logo: '<div class="logo-placeholder type">type</div>', target: 'エンジニア職募集に特化、ソフトウェア関連20.3%', features: '行動ターゲティングスカウト、掲載期間内スカウト無制限、2職種掲載が基本', type: '掲載型専門' },
        '日経転職版': { logo: '<div class="logo-placeholder nikkei">日経転職版</div>', target: 'ハイクラス・スペシャリスト、30~50代中心', features: '日経ブランドの信頼感、高度なレコメンド機能、複数職種掲載が基本', type: '掲載型専門' },
        'Re就活': { logo: '<div class="logo-placeholder re-shukatsu">Re就活</div>', target: '20代が約8割、第二新卒中心', features: '20代向けサイトNo.1、長期掲載が可能、転職博(イベント)開催', type: '掲載型若手専門' },
        'dodaダイレクト': { logo: '<div class="logo-placeholder doda-direct">dodaダイレクト</div>', target: '人材紹介登録者を含む豊富なDB、40代以上44%', features: '職種無制限・成功報酬なし、企業自らが候補者へ直接アプローチ', type: 'ダイレクト・ソーシング' },
        'エン転職ダイレクト': { logo: '<div class="logo-placeholder en-direct">エン転職ダイレクト</div>', target: '業界最大級のスカウトDB 441万人、40代以上40%', features: '非公開求人で特別感、ポップアップでお知らせ、顧客満足度96%', type: 'ダイレクト・ソーシング' },
    };

    function updateProgress() {
        let percentage = (currentSection / quizSections.length) * 100;
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
        for (const qName in questions) {
            if (questions[qName].section === sectionNumber) {
                const answered = document.querySelector(`input[name="${qName}"]:checked`);
                if (!answered) {
                    isAnswered = false;
                    break;
                }
            }
        }
        return isAnswered;
    }

    // 複数ページ（次へボタン）の制御
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isLocked) return;
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
        
        if (!checkSectionAnswered(currentSection)) {
            alert('最後の質問にすべて回答してください。');
            return;
        }
        
        // 必須情報チェック
        const companyName = document.getElementById('companyName')?.value;
        const personName = document.getElementById('personName')?.value;
        const email = document.getElementById('email')?.value;

        if (!companyName || !personName || !email) {
            alert('企業名、担当者名、メールアドレスを全て入力してください。');
            return;
        }


        // スコア計算
        let scores = { A: 0, B: 0, C: 0 };
        let totalScore = 0;
        
        const collectedAnswers = {}; // GAS送信用のQ1-Q10回答データ

        for (const qName in questions) {
            const selectedAnswer = document.querySelector(`input[name="${qName}"]:checked`);
            if (selectedAnswer) {
                const value = parseInt(selectedAnswer.value, 10);
                scores[questions[qName].axis] += value;
                totalScore += value;
                collectedAnswers[qName] = value; // GAS用データにスコアを保持
            }
        }

        // 診断ロジック
        const scoreA = scores.A; // 組織文化・速度 (4-16点)
        const scoreB = scores.B; // リソース・効率 (4-16点)
        const scoreC = scores.C; // 柔軟性・多様性 (2-8点)
        
        let type = "";
        let description = "";
        let advice = "";
        
        // 診断ロジックの定義 (5タイプに分類)
        if (scoreA >= 13 && scoreB >= 13) {
            type = "🔥 C-Type: イノベーション・ブレイカー";
            description = "極めて高い機動力とリソースへの柔軟な投資意識を持つ、成果志向のスタートアップ型です。採用活動はスピードと企業文化への共感が鍵となります。";
            advice = `<h4>【採用戦略: 攻めのブランディングとダイレクトアプローチ】</h4><p>貴社の挑戦的なビジョンやフラットな組織文化を、鮮度の高い情報量で訴求することが最優先です。攻めの採用手法でアクティブな人材を直接狙いましょう。</p>
                <h4>【推奨媒体】</h4>
                <div class="media-list">
                    ${createMediaCard('dodaダイレクト')}
                    ${createMediaCard('エン転職ダイレクト')}
                    ${createMediaCard('エン転職')}
                </div>`;
        } else if (scoreA >= 11 && scoreC >= 7) {
            type = "🚀 A-Type: アスリート・チャレンジャー";
            description = "機動力が高く、労働環境の柔軟性も高いですが、リソースは現実的。成長機会と自由度の高いキャリアパスが最大の魅力です。";
            advice = `<h4>【採用戦略: 成長機会と柔軟性を強調】</h4><p>自立的な成長を求める若手・経験者層に対し、裁量の大きさやキャリアの自由度を具体的に提示することが重要です。特に若手層へのリーチを強化しましょう。</p>
                <h4>【推奨媒体】</h4>
                <div class="media-list">
                    ${createMediaCard('マイナビ転職')}
                    ${createMediaCard('Re就活')}
                    ${createMediaCard('type')}
                </div>`;
        } else if (scoreA <= 9 && scoreB >= 12) {
            type = "💡 B-Type: ハイブリッド・マイスター";
            description = "意思決定は慎重ですが、業務効率（デジタル化・評価制度）と育成システムが確立しています。安定した環境で質の高い成果を求める即戦力タイプです。";
            advice = `<h4>【採用戦略: 専門性と質の高さを訴求】</h4><p>確立された評価制度や、デジタルツールによる効率的な業務環境を魅力として訴求します。特定の専門職種や、質の高い成果を求める人材確保に適しています。</p>
                <h4>【推奨媒体】</h4>
                <div class="media-list">
                    ${createMediaCard('日経転職版')}
                    ${createMediaCard('doda')}
                    ${createMediaCard('type')}
                </div>`;
        } else if (scoreC <= 4 && scoreB <= 10) {
            type = "🛡️ D-Type: コーディネーター・コア";
            description = "伝統的な組織構造と規律を重視し、組織内の協調性を優先します。急激な変化よりも、確実な事業継続性と手厚いサポート体制を訴求します。";
            advice = `<h4>【採用戦略: 安定と定着率を重視】</h4></p>職場の人間関係の良さや、長期的に安心して働ける環境を具体的に説明します。広範囲な求職者にリーチし、定着率の高い人材を獲得する手法が適しています。</p>
                <h4>【推奨媒体】</h4>
                <div class="media-list">
                    ${createMediaCard('エン転職')}
                    ${createMediaCard('マイナビ転職')}
                </div>`;
        } else {
            type = "⭐ S-Type: バランス・ストラテジスト";
            description = "全軸でバランスが取れており、多様なニーズを持つ求職者に対応できます。採用課題に応じて柔軟に手法を切り替えることが可能です。";
            advice = `<h4>【提案戦略: 多角的アプローチとデータ活用】</h4><p>複数の媒体を組み合わせてリスクを分散し、データに基づき効果の高い手法に集中投資する戦略をご提案します。貴社の強みを活かした柔軟な広告運用が可能です。</p>
                <h4>【推奨媒体】</h4>
                <div class="media-list">
                    ${createMediaCard('doda')}
                    ${createMediaCard('エン転職')}
                    ${createMediaCard('マイナビ転職')}
                </div>`;
        }
        
        // 6. 収集データの準備とGASへの送信
        const collectedData = {
            companyName: companyName,
            personName: personName,
            email: email,
            type: type,
            totalScore: totalScore,
            scoreA: scoreA,
            scoreB: scoreB,
            scoreC: scoreC,
            ...collectedAnswers // Q1-Q10の回答スコアをマージ
        };

        fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(collectedData),
        })
        .then(response => {
            console.log("Data sent to Google Sheet.");
        })
        .catch(error => {
            console.error("Error sending data:", error);
        });

        // 7. 結果表示
        document.getElementById('result-type-main').textContent = type;
        document.getElementById('result-score-detail').textContent = `（A軸スコア: ${scoreA}/16, B軸スコア: ${scoreB}/16, C軸スコア: ${scoreC}/8, 合計点: ${totalScore}/40）`;
        document.getElementById('result-details').innerHTML = advice + `<h3>診断タイプ詳細:</h3><p>${description}</p>`;
        
        document.querySelector(`.quiz-section[data-section="${currentSection}"]`).style.display = 'none';
        document.getElementById('result').classList.add('active');
        document.getElementById('result').style.display = 'block';

        lockButton.classList.remove('disabled');
        lockButton.disabled = false;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 媒体カード生成関数
    function createMediaCard(mediaName) {
        const data = mediaData[mediaName];
        if (!data) return '';
        
        return `
            <div class="media-card">
                ${data.logo}
                <h4>${mediaName}</h4>
                <p><strong>特性:</strong> ${data.type}</p>
                <p><strong>主要ターゲット:</strong> ${data.target}</p>
                <p><strong>主な機能:</strong> ${data.features}</p>
            </div>
        `;
    }

    // 診断結果のロック機能（結果変更不可設定）
    lockButton.addEventListener('click', function() {
        if (!isLocked) {
            isLocked = true;
            document.body.classList.add('locked-state'); 
            
            // ③ 「結果を確定（再回答不可）」の文言を修正
            lockButton.textContent = '結果を確定しました';
            lockButton.disabled = true;
            lockButton.style.backgroundColor = '#7f8c8d';
            
            alert('診断結果を確定しました。これ以降、回答内容の変更はできません。');
        }
    });

    // 初期表示
    showSection(1);
    updateProgress();
});