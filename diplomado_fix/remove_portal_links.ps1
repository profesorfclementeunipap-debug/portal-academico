# remove_portal_links.ps1
# Script to remove Portal breadcrumb links from library folder index pages

$path = "diplomado\recursos\biblioteca"
$pattern = '(?s)<a href="\.\./\.\./\.\./(?:\.\./)?index\.html".*?</a>\s*<span class="text-slate-300">/</span>\s*'

Get-ChildItem -Path $path -Filter "index.html" -Recurse | ForEach-Object {
    Write-Host "Processing: $($_.FullName)"
    $content = Get-Content $_.FullName -Raw
    if ($content -match $pattern) {
        $newContent = $content -replace $pattern, ''
        Set-Content $_.FullName $newContent -NoNewline
        Write-Host "Success: Removed Portal link from $($_.Name)" -ForegroundColor Green
    } else {
        Write-Host "Skipped: Portal link not found in $($_.Name)" -ForegroundColor Yellow
    }
}
