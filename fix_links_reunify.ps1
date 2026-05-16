$files = Get-ChildItem 'diplomado' -Filter *.html -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Si el archivo está en la raíz de diplomado, el portal está un nivel arriba
    if ($file.DirectoryName -match 'diplomado$') {
        $content = $content -replace 'href="index\.html"', 'href="../index.html"'
    }
    # Para la biblioteca, el portal está más arriba
    if ($file.FullName -match 'biblioteca') {
         $content = $content -replace 'href="/diplomado-contabilidad-financiera/biblioteca.html"', 'href="biblioteca.html"'
    }
    Set-Content $file.FullName $content -Encoding utf8
}
