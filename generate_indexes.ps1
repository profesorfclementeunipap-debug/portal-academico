$dirs = Get-ChildItem 'diplomado/recursos/biblioteca' -Directory
foreach ($dir in $dirs) {
    $files = Get-ChildItem $dir.FullName -File | Where-Object { $_.Name -ne 'index.html' }
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
            <a href="../../../index.html" class="text-blue-600 hover:text-blue-800 transition flex items-center">
                <i class="fas fa-university mr-2"></i> Portal
            </a>
            <span class="text-slate-300">/</span>
            <a href="../../biblioteca.html" class="text-blue-600 hover:text-blue-800 transition">Biblioteca</a>
            <span class="text-slate-300">/</span>
            <span class="text-slate-400">$($dir.Name)</span>
        </nav>

        <div class="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100">
            <div class="flex items-center space-x-4 mb-6">
                <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <i class="fas fa-folder-open text-2xl"></i>
                </div>
                <div>
                    <h1 class="text-3xl font-bold text-slate-800">$($dir.Name)</h1>
                    <p class="text-slate-500">Listado de recursos académicos para descarga.</p>
                </div>
            </div>

            <div class="space-y-3">
"@
    foreach ($file in $files) {
        $escapedName = [Uri]::EscapeDataString($file.Name)
        $html += @"
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition group">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-file-pdf text-red-500 text-xl group-hover:scale-110 transition"></i>
                        <span class="font-medium text-slate-700 truncate max-w-[200px] md:max-w-md">$($file.Name)</span>
                    </div>
                    <a href="$escapedName" download class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-blue-200 transition">
                        Descargar
                    </a>
                </div>
"@
    }
    
    if ($files.Count -eq 0) {
        $html += '<p class="text-center py-12 text-slate-400 italic">No hay archivos disponibles en esta carpeta.</p>'
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
