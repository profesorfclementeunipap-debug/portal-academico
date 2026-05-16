$files = Get-ChildItem -Filter *.html -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # 1. Eliminar cualquier elemento de lista (li) o enlace (a) que contenga la palabra "Portal"
    $content = $content -replace '(?s)<li[^>]*>.*?Portal.*?</li>', ''
    $content = $content -replace '(?s)<a[^>]*href="[^"]*index\.html"[^>]*>.*?Portal.*?</a>', ''
    $content = $content -replace '(?s)<a[^>]*>.*?<i class="fas fa-home[^>]*></i>.*?Portal.*?</a>', ''
    
    # 2. Eliminar migajas de pan (breadcrumbs) con Portal
    $content = $content -replace 'PORTAL / ', ''
    $content = $content -replace 'Portal / ', ''
    $content = $content -replace 'Portal', '' # Eliminación genérica por si acaso
    
    # 3. Asegurar que los enlaces a la biblioteca desde subcarpetas sean correctos
    if ($file.FullName -match 'recursos\\biblioteca') {
        $content = $content -replace 'href="\.\.\/\.\.\/\.\.\/biblioteca\.html"', 'href="/diplomado-contabilidad-financiera/biblioteca.html"'
    }

    Set-Content $file.FullName $content -Encoding utf8
}
