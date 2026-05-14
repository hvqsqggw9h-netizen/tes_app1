// --- validator.js ---
// TES学習アプリ用 データ点検ツール
// 使い方：
// 1. このファイルを validator.js として保存
// 2. index.html の下部で questions/2020.js の後に読み込む
//    <script src="questions/2020.js"></script>
//    <script src="validator.js"></script>
// 3. ブラウザの開発者ツール Console にチェック結果が表示されます。

(function validateQuestions2020(){
  const questions = window.questions2020 || [];
  const errors = [];
  const warnings = [];
  const info = [];

  if(!Array.isArray(questions)){
    console.error("❌ window.questions2020 が配列ではありません。");
    return;
  }

  const sourceMap = new Map();
  const fields = new Map();
  const detailMissing = [];
  const imageQuestions = [];

  questions.forEach((q, index) => {
    const label = q.sourceQuestion || `index:${index}`;

    // 必須項目チェック
    if(!q.year) errors.push(`${label}: year がありません。`);
    if(!q.sourceQuestion) errors.push(`index:${index}: sourceQuestion がありません。`);
    if(!q.field) warnings.push(`${label}: field がありません。`);
    if(!q.question) errors.push(`${label}: question がありません。`);
    if(!Array.isArray(q.choices) || q.choices.length < 2){
      errors.push(`${label}: choices が不足しています。`);
    }
    if(typeof q.answer !== "number"){
      errors.push(`${label}: answer が数値ではありません。`);
    }
    if(Array.isArray(q.choices) && typeof q.answer === "number"){
      if(q.answer < 0 || q.answer >= q.choices.length){
        errors.push(`${label}: answer が choices の範囲外です。 answer=${q.answer}, choices=${q.choices.length}`);
      }
    }
    if(!q.explanation) warnings.push(`${label}: explanation がありません。`);

    // sourceQuestion 重複チェック
    if(q.sourceQuestion){
      if(sourceMap.has(q.sourceQuestion)){
        errors.push(`${label}: sourceQuestion が重複しています。前回 index=${sourceMap.get(q.sourceQuestion)}, 今回 index=${index}`);
      }else{
        sourceMap.set(q.sourceQuestion, index);
      }
    }

    // detailチェック
    if(!q.detail){
      detailMissing.push(label);
    }else{
      ["answer", "reason", "compare", "practical", "memory"].forEach(key => {
        if(!q.detail[key]){
          warnings.push(`${label}: detail.${key} がありません。`);
        }
      });
    }

    // field集計
    if(q.field){
      fields.set(q.field, (fields.get(q.field) || 0) + 1);
    }

    // 画像問題集計
    if(q.image){
      imageQuestions.push(label);
    }
  });

  // 問題番号のざっくり集計
  const questionGroups = {};
  questions.forEach(q => {
    if(!q.sourceQuestion) return;
    const group = q.sourceQuestion.split("-")[0];
    questionGroups[group] = (questionGroups[group] || 0) + 1;
  });

  // 結果表示
  console.group("🧪 TES App Validator: 2020年度 科目1");
  console.log(`問題数: ${questions.length}`);
  console.log("問別件数:", questionGroups);
  console.log("分野別件数:", Object.fromEntries(fields));
  console.log("画像付き問題:", imageQuestions);

  if(detailMissing.length){
    warnings.push(`detail未設定: ${detailMissing.length}件 → ${detailMissing.join(", ")}`);
  }

  if(errors.length === 0){
    console.log("✅ 致命的エラーなし");
  }else{
    console.error(`❌ エラー ${errors.length}件`);
    errors.forEach(e => console.error(e));
  }

  if(warnings.length === 0){
    console.log("✅ 警告なし");
  }else{
    console.warn(`⚠️ 警告 ${warnings.length}件`);
    warnings.forEach(w => console.warn(w));
  }

  console.groupEnd();

  // 画面上でも確認したい場合に使えるよう、結果をグローバルに残す
  window.validationResult2020 = {
    total: questions.length,
    errors,
    warnings,
    detailMissing,
    imageQuestions,
    questionGroups,
    fields: Object.fromEntries(fields)
  };
})();
