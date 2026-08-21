$lines = Get-Content 'src/game/useGameStore.ts'
for ($i = 673; $i -lt 677; $i++) {
    $line = $lines[$i]
    $out = ""
    foreach ($ch in $line.ToCharArray()) {
        if ($ch -eq ' ') {
            $out += "."
        } else {
            $out += $ch
        }
    }
    Write-Host "LINE $($i+1): $($out)"
}