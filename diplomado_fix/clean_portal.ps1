$files = Get-ChildItem -Filter *.html -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Eliminar enlaces al Portal Académico y migajas de pan (breadcrumbs)
    $content = $content -replace '<a href="[^"]*index\.html"[^>]*>.*?Portal.*?</a>', ''
    $content = $content -replace '<a href="[^"]*index\.html"[^>]*>.*?<i class="fas fa-university[^>]*></i>.*?</a>', ''
    $content = $content -replace 'PORTAL / ', ''
    $content = $content -replace 'Portal / ', ''
    # Asegurar que el título de la página sea correcto
    $content = $content -replace 'Portal Académico - Prof. Frank Clemente', 'Diplomado - Contabilidad Financiera'
    Set-Content $file.FullName $content -Encoding utf8
}
