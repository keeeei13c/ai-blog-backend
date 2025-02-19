require('dotenv').config();
const fs = require('fs');

// テンプレートファイルを読み込む
const template = fs.readFileSync('wrangler.template.toml', 'utf8');

// 環境変数を展開
const config = template.replace(/\${(\w+)}/g, (match, varName) => {
  const value = process.env[varName];
  if (!value) {
    console.warn(`Warning: Environment variable ${varName} is not defined!`);
    return match; // 未定義の場合はそのまま残す
  }
  return value;
});

// 結果を出力
fs.writeFileSync('wrangler.toml', config);
console.log('Configuration generated:');
console.log(config);