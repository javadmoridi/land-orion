$f = 'src/economy/playerApi.ts'
$c = [System.IO.File]::ReadAllText($f)
$c = $c -replace '\\n', "`n"
[System.IO.File]::WriteAllText($f, $c)
Write-Host "DONE - replaced literal \n with newlines"