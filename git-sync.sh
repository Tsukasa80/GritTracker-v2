#!/bin/bash

# Git同期とコンフリクト防止のための包括的スクリプト
# 使用方法: ./git-sync.sh [pull|push|status]

set -e  # エラー時に停止

# カラーコード定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 関数定義
print_header() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${CYAN}🔄 Git 同期管理システム v2.0${NC}"
    echo -e "${BLUE}===========================================${NC}"
}

check_git_status() {
    echo -e "${BLUE}📍 Gitステータス確認中...${NC}"
    
    # 未コミットの変更をチェック
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}⚠️  未コミットの変更があります${NC}"
        echo -e "${YELLOW}   変更されたファイル:${NC}"
        git diff --name-only | sed 's/^/   - /'
        return 1
    fi
    
    # 未追跡ファイルをチェック
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        echo -e "${YELLOW}⚠️  未追跡のファイルがあります${NC}"
        echo -e "${YELLOW}   未追跡ファイル:${NC}"
        git ls-files --others --exclude-standard | sed 's/^/   - /'
        return 1
    fi
    
    echo -e "${GREEN}✅ ワーキングディレクトリはクリーンです${NC}"
    return 0
}

fetch_remote() {
    echo -e "${BLUE}🌐 リモートから最新情報を取得中...${NC}"
    git fetch origin
    echo -e "${GREEN}✅ リモート情報を更新しました${NC}"
}

check_sync_status() {
    echo -e "${BLUE}🔍 同期状況を確認中...${NC}"
    
    local ahead=$(git rev-list --count HEAD..origin/main)
    local behind=$(git rev-list --count origin/main..HEAD)
    
    if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
        echo -e "${RED}❌ ブランチが分岐しています（ahead: $behind, behind: $ahead）${NC}"
        echo -e "${RED}   マージまたはリベースが必要です${NC}"
        return 2
    elif [ "$ahead" -gt 0 ]; then
        echo -e "${YELLOW}⬇️  リモートが $ahead コミット進んでいます${NC}"
        return 1
    elif [ "$behind" -gt 0 ]; then
        echo -e "${YELLOW}⬆️  ローカルが $behind コミット進んでいます${NC}"
        return 3
    else
        echo -e "${GREEN}✅ リモートと完全に同期済み${NC}"
        return 0
    fi
}

safe_pull() {
    echo -e "${PURPLE}⬇️  安全プルを実行中...${NC}"
    
    # ステータスチェック
    if ! check_git_status; then
        echo -e "${RED}❌ 未コミットの変更があるため、プルを中止します${NC}"
        echo -e "${YELLOW}   先に変更をコミットまたはstashしてください${NC}"
        return 1
    fi
    
    fetch_remote
    
    local sync_status
    check_sync_status
    sync_status=$?
    
    case $sync_status in
        0)
            echo -e "${GREEN}✅ 既に最新です${NC}"
            ;;
        1)
            echo -e "${PURPLE}⬇️  リモートの変更を取得中...${NC}"
            git pull origin main
            echo -e "${GREEN}✅ プル完了${NC}"
            ;;
        2)
            echo -e "${RED}❌ ブランチが分岐しているため、手動対応が必要です${NC}"
            return 1
            ;;
        3)
            echo -e "${GREEN}✅ ローカルが進んでいます（プル不要）${NC}"
            ;;
    esac
}

safe_push() {
    echo -e "${PURPLE}⬆️  安全プッシュを実行中...${NC}"
    
    # まず最新情報を取得
    fetch_remote
    
    local sync_status
    check_sync_status
    sync_status=$?
    
    case $sync_status in
        0)
            echo -e "${YELLOW}⚠️  プッシュする新しいコミットがありません${NC}"
            ;;
        1)
            echo -e "${RED}❌ リモートが進んでいます。先にプルしてください${NC}"
            echo -e "${YELLOW}   推奨: ./git-sync.sh pull${NC}"
            return 1
            ;;
        2)
            echo -e "${RED}❌ ブランチが分岐しています。手動でマージしてください${NC}"
            return 1
            ;;
        3)
            echo -e "${PURPLE}⬆️  ローカルの変更をプッシュ中...${NC}"
            git push origin main
            echo -e "${GREEN}✅ プッシュ完了${NC}"
            ;;
    esac
}

show_status() {
    echo -e "${BLUE}📊 現在のGitステータス${NC}"
    echo ""
    
    echo -e "${CYAN}ブランチ情報:${NC}"
    git branch -vv
    echo ""
    
    echo -e "${CYAN}最新コミット履歴:${NC}"
    git log --oneline -5
    echo ""
    
    fetch_remote
    check_sync_status
    echo ""
    
    check_git_status || echo ""
}

# メイン処理
print_header

case "${1:-status}" in
    "pull")
        safe_pull
        ;;
    "push")
        safe_push
        ;;
    "status")
        show_status
        ;;
    *)
        echo -e "${YELLOW}使用方法: $0 [pull|push|status]${NC}"
        echo ""
        echo -e "${CYAN}コマンド:${NC}"
        echo -e "  pull   - 安全にリモートの変更を取得"
        echo -e "  push   - 安全にローカルの変更をプッシュ"  
        echo -e "  status - 現在の同期状況を表示（デフォルト）"
        exit 1
        ;;
esac

echo -e "${BLUE}===========================================${NC}"