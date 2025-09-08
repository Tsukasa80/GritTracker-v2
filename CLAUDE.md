# GritTracker開発ガイド

## マージコンフリクト防止システム v2.0

このプロジェクトでは、マージコンフリクトを防ぐための包括的な自動化システムを導入しています。

### 🔍 Git同期管理システム（推奨）

**新機能**: 包括的なGit同期管理システムを追加しました。

```bash
# 同期状況の確認
./git-sync.sh status  # または git sync

# 安全なプル（コンフリクト自動検知）
./git-sync.sh pull    # または git safe-pull  

# 安全なプッシュ（事前チェック付き）
./git-sync.sh push    # または git safe-push
```

### 🔍 作業開始前のチェック（従来版）

**基本チェック**: 作業開始前に以下のコマンドを実行してください：

```bash
# 方法1: 専用スクリプト
./check-before-work.sh

# 方法2: Gitエイリアス
git check
```

### 🛡️ 自動保護機能

#### v2.0の新機能
- **分岐状況の自動検知**: ローカルとリモートの分岐を自動検出
- **未コミット変更の事前チェック**: 作業ディレクトリの状態確認
- **段階的同期処理**: 状況に応じた最適な同期方法を提案
- **VS Code統合**: タスクランナーからワンクリック実行

#### 従来機能（v1.0）
- **Pre-pushフック**: プッシュ前に自動でコンフリクトリスクをチェック
- **リモートとの差分検知**: プッシュが失敗する前に警告
- **自動プル提案**: コンフリクトリスクがある場合の対処方法を提示

### 📋 推奨ワークフロー v2.0

1. **作業開始**
   ```bash
   git sync     # 同期状況確認（新）
   # または
   git check    # 基本チェック（従来）
   ```

2. **最新の取得**
   ```bash
   git safe-pull  # 安全なプル（新）
   ```

3. **開発作業**
   - ファイル編集
   - テスト実行
   - ビルド確認

4. **コミット**
   ```bash
   git add .
   git commit -m "変更内容"
   ```

5. **プッシュ**
   ```bash
   git safe-push  # 安全なプッシュ（改良版）
   ```

### 🖥️ VS Code統合

`Ctrl+Shift+P` → `Tasks: Run Task` → 以下を選択：
- `Git Safe Sync Check` - 同期状況確認
- `Git Safe Pull` - 安全なプル
- `Git Safe Push` - 安全なプッシュ
- `Build and Check` - ビルド実行

### 🆘 コンフリクトが発生した場合

1. **予防が最優先**: 作業前の`git check`を必ず実行
2. **発生時の対処**:
   ```bash
   git pull origin main  # リモートの変更を取得
   # コンフリクトを手動解決
   git add .
   git commit -m "Resolve merge conflict"
   git push origin main
   ```

### ⚡ 便利なエイリアス

- `git check` - 作業前チェック
- `git safe-push` - 安全なプッシュ
- `git sync` - リモートとの同期状況確認

### 🤖 自動チェック機能

以下の方法で`git check`を自動実行できます：

#### 方法1: ブランチ切り替え時（既に設定済み）
```bash
git checkout main  # 自動でチェック実行
git switch feature # 自動でチェック実行
```

#### 方法2: VS Code Task
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Git Status Check`

#### 方法3: Windows PowerShell自動設定
```powershell
# 管理者権限でPowerShellを起動し実行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
./setup-windows-autocheck.ps1
```

#### 方法4: 手動でシェル設定
```bash
# .bashrc または .zshrc に追加
source ./.grittracker-autocheck.sh
```

### 📊 自動チェックの特徴

- **頻度制限**: 10分間隔でチェック（無駄な実行を防止）
- **対象限定**: GritTrackerディレクトリでのみ動作
- **非侵入的**: 作業の邪魔にならないタイミングで実行

### 🔧 テストとビルド

変更後は必ず以下を実行：

```bash
# テスト実行（プロジェクト固有のコマンドを確認）
npm test        # または yarn test
npm run build   # または yarn build
npm run lint    # または yarn lint
```

### 📝 コミットメッセージ規約

```
Fix: 機能修正の説明
Add: 新機能追加の説明  
Update: 既存機能改善の説明
Refactor: リファクタリング

例：
Fix: ご褒美ページのボタン位置を修正
Add: ダークモード機能を追加
Update: UIレスポンシブ対応を改善
```

### 🤝 チーム開発時の注意点

- 同じファイルの同時編集を避ける
- 大きな変更は複数の小さなコミットに分割
- UIの変更は必ずモバイル・デスクトップ両方で確認
- テストが通ることを確認してからプッシュ

---

**重要**: このシステムを使用することで、マージコンフリクトのリスクを大幅に削減できます。必ず作業前に`git check`を実行する習慣を身につけてください。