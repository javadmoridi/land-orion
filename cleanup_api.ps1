$f = 'src/economy/playerApi.ts'
$lines = Get-Content $f
# Keep only lines 0 to 509 (0-indexed = 510 lines)
$lines = $lines[0..509]
Set-Content -Path $f -Value $lines
Write-Host "DONE - trimmed playerApi.ts to $($lines.Count) lines"