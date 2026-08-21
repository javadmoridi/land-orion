$f = 'src/game/GameWorld.tsx'
$content = Get-Content $f
$content = $content -replace '^\s*// Grant the 100 Gem welcome reward\.', '        // Grant the 100 Gem welcome reward.'
Set-Content -Path $f -Value $content
Write-Host "DONE"