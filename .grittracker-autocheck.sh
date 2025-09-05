#!/bin/bash

# GritTracker自動チェック関数
grittracker_autocheck() {
    # GritTrackerディレクトリにいる場合のみ実行
    if [[ "$PWD" == *"GritTracker"* ]] && [ -f "./check-before-work.sh" ]; then
        # 前回チェックから10分以上経過している場合のみ実行
        LAST_CHECK_FILE="./.last-autocheck"
        CURRENT_TIME=$(date +%s)
        
        if [ -f "$LAST_CHECK_FILE" ]; then
            LAST_CHECK=$(cat "$LAST_CHECK_FILE")
            TIME_DIFF=$((CURRENT_TIME - LAST_CHECK))
            # 600秒 = 10分
            if [ $TIME_DIFF -lt 600 ]; then
                return
            fi
        fi
        
        echo ""
        echo "🤖 GritTracker自動チェック実行中..."
        bash ./check-before-work.sh
        echo "$CURRENT_TIME" > "$LAST_CHECK_FILE"
    fi
}

# PowerShell環境での自動実行
if command -v pwsh >/dev/null 2>&1 || command -v powershell >/dev/null 2>&1; then
    # Windows環境
    grittracker_autocheck
fi

# Bash環境での自動実行
if [ -n "$BASH_VERSION" ]; then
    grittracker_autocheck
fi