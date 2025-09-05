# Windows環境でGitTracker自動チェックを設定するスクリプト

Write-Host "🔧 GritTracker自動チェック設定（Windows）" -ForegroundColor Cyan

# PowerShell プロファイルのパスを取得
$profilePath = $PROFILE
$profileDir = Split-Path $profilePath -Parent

# プロファイルディレクトリが存在しない場合は作成
if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force
    Write-Host "✅ PowerShellプロファイルディレクトリを作成: $profileDir" -ForegroundColor Green
}

# 自動チェック関数をプロファイルに追加
$autoCheckFunction = @"

# GritTracker自動チェック関数
function Invoke-GritTrackerAutoCheck {
    `$currentPath = Get-Location
    if (`$currentPath.Path -like "*GritTracker*" -and (Test-Path "./check-before-work.sh")) {
        # 前回チェックから10分以上経過している場合のみ実行
        `$lastCheckFile = "./.last-autocheck"
        `$currentTime = [int][double]::Parse((Get-Date -UFormat %s))
        
        if (Test-Path `$lastCheckFile) {
            `$lastCheck = [int](Get-Content `$lastCheckFile)
            `$timeDiff = `$currentTime - `$lastCheck
            if (`$timeDiff -lt 600) { return }  # 10分未満なら実行しない
        }
        
        Write-Host "" 
        Write-Host "🤖 GritTracker自動チェック実行中..." -ForegroundColor Yellow
        & bash ./check-before-work.sh
        `$currentTime | Out-File `$lastCheckFile -Encoding UTF8
    }
}

# ディレクトリ変更時に自動チェック実行
function prompt {
    Invoke-GritTrackerAutoCheck
    "PS " + `$(Get-Location) + "> "
}
"@

# プロファイルに追加
if (Test-Path $profilePath) {
    $existingContent = Get-Content $profilePath -Raw
    if ($existingContent -notlike "*GritTracker自動チェック関数*") {
        Add-Content $profilePath $autoCheckFunction
        Write-Host "✅ PowerShellプロファイルに自動チェック機能を追加" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  既に設定済みです" -ForegroundColor Blue
    }
} else {
    Set-Content $profilePath $autoCheckFunction
    Write-Host "✅ PowerShellプロファイルを作成し、自動チェック機能を追加" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 設定完了！" -ForegroundColor Green
Write-Host "次回PowerShellを起動時からGritTrackerディレクトリで自動チェックが実行されます。" -ForegroundColor White
Write-Host ""
Write-Host "⚡ 即座に有効にするには:" -ForegroundColor Yellow
Write-Host ". `$PROFILE" -ForegroundColor Cyan