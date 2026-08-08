Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('c:\Users\djodiyudanto\.gemini\antigravity-ide\scratch\devops-arena\DevOps-Arena-Sprint-2-Implementation-Plan.docx')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlStr = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$text = $xmlStr -replace '<[^>]+>', ' ' -replace '\s+', ' '
Write-Host $text
