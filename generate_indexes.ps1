$dirs = Get-ChildItem 'diplomado/recursos/biblioteca' -Directory -Recurse
foreach ($dir in $dirs) {
    $items = Get-ChildItem $dir.FullName | Where-Object { $_.Name -ne 'index.html' }
    
    # Calcular la ruta relativa al root para las descargas
    $currentPath = $dir.FullName.Replace((Get-Item 'diplomado').FullName, '').Replace('\', '/')
    if ($currentPath.StartsWith('/')) { $currentPath = $currentPath.Substring(1) }
    if ($currentPath -and !$currentPath.EndsWith('/')) { $currentPath += '/' }

    $html = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$($dir.Name) - Diplomado</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-50 p-6 md:p-12">
    <div class="max-w-4xl mx-auto">
        <nav class="mb-8 flex items-center space-x-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            <a href="/diplomado-contabilidad-financiera/biblioteca.html" class="text-blue-600 hover:text-blue-800 transition">Biblioteca Master</a>
            <span>/</span>
            <span>$($dir.Name)</span>
        </nav>

        <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
            <div class="flex items-center space-x-4 mb-8 text-blue-600">
                <i class="fas fa-folder-open text-4xl"></i>
                <h1 class="text-3xl font-bold text-slate-800">$($dir.Name)</h1>
            </div>

            <div class="grid gap-3">
"@
    foreach ($item in $items) {
        $escapedName = [System.Web.HttpUtility]::UrlPathEncode($item.Name)
        $icon = if ($item.Attributes -match 'Directory') { "fa-folder text-blue-400" } else { "fa-file-pdf text-red-500" }
        $actionText = if ($item.Attributes -match 'Directory') { "Abrir Carpeta" } else { "Descargar" }
        $downloadAttr = if ($item.Attributes -match 'Directory') { "" } else { "download" }
        $linkSuffix = if ($item.Attributes -match 'Directory') { "/" } else { "" }
        
        $html += @"
                <div class="flex items-center justify-between p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition group">
                    <div class="flex items-center space-x-4">
                        <i class="fas $icon text-xl group-hover:scale-110 transition"></i>
                        <span class="font-medium text-slate-700 truncate max-w-[200px] md:max-w-md">$($item.Name)</span>
                    </div>
                    <a href="$escapedName$linkSuffix" $downloadAttr class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition">
                        $actionText
                    </a>
                </div>
"@
    }
    
    if ($items.Count -eq 0) {
        $html += '<p class="text-center py-12 text-slate-400 italic">No hay archivos disponibles aquí.</p>'
    }

    $html += @"
            </div>
        </div>
        <footer class="mt-12 text-center text-slate-400 text-sm">
            © 2026 Diplomado Contabilidad Financiera
        </footer>
    </div>
</body>
</html>
"@
    Set-Content -Path (Join-Path $dir.FullName 'index.html') -Value $html -Encoding utf8
}
