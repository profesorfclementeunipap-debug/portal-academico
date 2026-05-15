$dirs = Get-ChildItem 'diplomado/recursos/biblioteca' -Directory -Recurse
foreach ($dir in $dirs) {
    $items = Get-ChildItem $dir.FullName | Where-Object { $_.Name -ne 'index.html' }
    
    # Calcular nivel de profundidad para volver a biblioteca.html
    # biblioteca.html está en /diplomado/
    # Estamos en /diplomado/recursos/biblioteca/sub/sub...
    $relativeToRoot = ""
    $current = $dir.FullName
    $base = (Get-Item 'diplomado').FullName
    while ($current -ne $base -and $current -ne (Split-Path $current -Parent)) {
        $relativeToRoot += "../"
        $current = Split-Path $current -Parent
    }

    $html = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$($dir.Name) - Biblioteca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-50 p-6 md:p-12">
    <div class="max-w-4xl mx-auto">
        <nav class="mb-8 flex items-center space-x-3 text-sm font-bold uppercase tracking-wider">
            <a href="$($relativeToRoot)index.html" class="text-blue-600 hover:text-blue-800 transition flex items-center">
                <i class="fas fa-university mr-2"></i> Portal
            </a>
            <span class="text-slate-300">/</span>
            <a href="$($relativeToRoot)biblioteca.html" class="text-blue-600 hover:text-blue-800 transition">Biblioteca</a>
            <span class="text-slate-300">/</span>
            <span class="text-slate-400">$($dir.Name)</span>
        </nav>

        <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
            <div class="flex items-center space-x-4 mb-8">
                <div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <i class="fas fa-folder-open text-3xl"></i>
                </div>
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">$($dir.Name)</h1>
                    <p class="text-slate-500">Recursos y sub-carpetas disponibles.</p>
                </div>
            </div>

            <div class="grid gap-3">
"@
    foreach ($item in $items) {
        $escapedName = [Uri]::EscapeDataString($item.Name)
        $icon = if ($item.Attributes -match 'Directory') { "fa-folder text-blue-400" } else { "fa-file-pdf text-red-500" }
        $actionText = if ($item.Attributes -match 'Directory') { "Abrir" } else { "Descargar" }
        $downloadAttr = if ($item.Attributes -match 'Directory') { "" } else { "download" }
        
        $html += @"
                <div class="flex items-center justify-between p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition group">
                    <div class="flex items-center space-x-4">
                        <i class="fas $icon text-xl group-hover:scale-110 transition"></i>
                        <span class="font-medium text-slate-700 truncate max-w-[200px] md:max-w-md">$($item.Name)</span>
                    </div>
                    <a href="$escapedName/" $downloadAttr class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-blue-200 transition">
                        $actionText
                    </a>
                </div>
"@
    }
    
    if ($items.Count -eq 0) {
        $html += '<p class="text-center py-12 text-slate-400 italic">No hay archivos ni carpetas disponibles aquí.</p>'
    }

    $html += @"
            </div>
        </div>
        
        <footer class="mt-12 text-center text-slate-400 text-sm">
            © 2026 Portal Académico | Gestionado por Prof. Frank Clemente
        </footer>
    </div>
</body>
</html>
"@
    Set-Content -Path (Join-Path $dir.FullName 'index.html') -Value $html -Encoding utf8
}
