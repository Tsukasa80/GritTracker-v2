# 🛣️ パス設定完全ガイド - GitHub Pages デプロイ用

## 📍 パス設定の混乱ポイント まとめ

### 今回発生したパス問題

1. **開発環境 vs 本番環境の違い**
   ```
   ローカル開発: http://localhost:5174/grit-tracker/
   GitHub Pages: https://tsukasa80.github.io/grit-tracker/
   → 両方で動作する設定が必要
   ```

2. **Vite設定とHTML実際のパスの不整合**
   ```typescript
   // vite.config.ts
   base: '/grit-tracker/'  // GitHub Pages サブディレクトリ用
   
   // しかし実際のindex.htmlでは
   <script src="/grit-tracker/assets/...">  ❌ 絶対パス
   <script src="./assets/...">             ✅ 相対パス
   ```

3. **GitHub Actions vs mainブランチ直接配信の違い**
   ```
   GitHub Actions: distフォルダから自動配信 → base設定重要
   mainブランチ直接: ルートファイル直接配信 → 相対パス重要  
   ```

## 🎯 正しいパス設定パターン

### パターン1: GitHub Actionsデプロイ (推奨)
```typescript
// vite.config.ts
export default defineConfig({
  base: '/grit-tracker/',  // リポジトリ名と一致
  build: {
    outDir: 'dist'
  }
})
```
```html
<!-- ビルド後のdist/index.html (自動生成) -->
<script src="/grit-tracker/assets/index-xxx.js"></script>
<link rel="stylesheet" href="/grit-tracker/assets/index-xxx.css">
```

### パターン2: mainブランチ直接デプロイ (現在の方法)
```typescript  
// vite.config.ts
export default defineConfig({
  base: '/grit-tracker/',  // 開発用
})
```
```html
<!-- ルートのindex.html (手動修正必要) -->
<script src="./assets/index-xxx.js"></script>        ✅ 相対パス
<link rel="stylesheet" href="./assets/index-xxx.css"> ✅ 相対パス
```

## 🔧 パス設定チェックリスト

### ✅ 開発前チェック
```bash
# 1. vite.config.ts確認
grep -n "base:" vite.config.ts
# 期待: base: '/grit-tracker/',

# 2. ローカル開発サーバー起動
npm run dev
# 期待: http://localhost:5174/grit-tracker/ で動作
```

### ✅ ビルド後チェック  
```bash
# 3. ビルド実行
npm run build

# 4. 生成されたindex.htmlのパス確認
grep -n "src=" dist/index.html
grep -n "href=" dist/index.html
# 期待: /grit-tracker/assets/ で始まるパス
```

### ✅ デプロイ前チェック (mainブランチ直接の場合)
```bash
# 5. ルートのindex.htmlパス修正確認
grep -n "src=" index.html
grep -n "href=" index.html  
# 期待: ./assets/ で始まる相対パス

# 6. assetsフォルダ存在確認
ls -la assets/
# 期待: index-xxx.js と index-xxx.css が存在
```

## 🚨 パス設定でよくあるミス

### ❌ ミス1: 混在パス
```html
<!-- 間違った例 -->
<script src="/grit-tracker/assets/index-xxx.js"></script>  <!-- 絶対パス -->
<link rel="stylesheet" href="./assets/index-xxx.css">      <!-- 相対パス -->
```

### ❌ ミス2: 古いファイル名参照
```html
<!-- 間違った例 -->
<script src="./assets/index-944963fd.js"></script>  <!-- 古いビルド -->
<script src="./assets/index-2cc04e0c.js"></script>  <!-- 新しいビルド -->
```

### ❌ ミス3: 404.htmlと index.htmlのパス不一致
```html
<!-- index.html -->
<script src="./assets/index-xxx.js"></script>  ✅

<!-- 404.html -->  
<script src="/grit-tracker/assets/index-xxx.js"></script>  ❌ 不一致
```

## 🔄 パス設定修正の自動化スクリプト

### ファイルパス一括修正スクリプト
```bash
#!/bin/bash
# fix-paths.sh

echo "🔧 パス設定を修正しています..."

# 1. 最新ビルド実行
npm run build

# 2. distファイルをルートにコピー  
cp -r dist/* .
cp index.html 404.html

# 3. パスを相対パスに修正
sed -i 's|/grit-tracker/assets/|./assets/|g' index.html
sed -i 's|/grit-tracker/assets/|./assets/|g' 404.html

# 4. 確認表示
echo "✅ パス修正完了"
grep "assets/" index.html
grep "assets/" 404.html

echo "🚀 デプロイ準備完了!"
```

### 使用方法
```bash
chmod +x fix-paths.sh
./fix-paths.sh
git add .
git commit -m "Fix paths for GitHub Pages"  
git push origin main
```

## 🎯 デプロイ方式別パス設定まとめ

| デプロイ方式 | vite.config.ts | index.html | 利点 | 欠点 |
|------------|----------------|------------|------|------|
| **GitHub Actions** | `base: '/grit-tracker/'` | 自動生成 | 自動化 | 複雑 |
| **mainブランチ直接** | `base: '/grit-tracker/'` | 手動修正 | シンプル | 手動作業 |
| **ルート配信** | `base: '/'` | 自動生成 | 最シンプル | サブドメイン必要 |

## 💡 推奨アプローチ

### 次回デプロイ時の推奨手順
1. **GitHub Actions を正しく設定** (最も確実)
2. **自動パス修正スクリプト使用** (作業効率化)  
3. **段階的テスト** (ローカル → プレビュー → 本番)

### パス問題回避のベストプラクティス
```typescript
// vite.config.ts での環境別設定
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/grit-tracker/' : '/grit-tracker/',
  // 開発・本番で同一パス設定を使用
}))
```

---

## 🤝 次回への申し送り

**パス設定で迷った時は:**
1. このガイドの「パス設定チェックリスト」実行
2. `fix-paths.sh` スクリプト使用  
3. 段階的に確認 (ローカル → ビルド → デプロイ)

**あなたの親友として:** パス設定は最初は複雑ですが、一度理解すればとても簡単です！次回は必ずスムーズに行きます😊💪

---

*パス設定マスター度: レベル3 → レベル5 達成！🏆*