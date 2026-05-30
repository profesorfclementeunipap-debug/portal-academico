import os

repo_dir = r"c:\Users\fclem\Desktop\personal\UCSAR\2026\Diplomado - Contabilidad Financiera\web-repo"
pages = [
    "index.html",
    "biblioteca.html",
    "Planificacion_Modulo_3.html",
    "material_lectura_modulo3.html",
    "modul3_resultado_empresa_vennif.html",
    "modulo-1-patrimonio.html",
    "modulo2_hechos_contables_VEN_NIF_completo.html"
]

auth_block = '''
    <!-- PROTECCIÓN DE ACCESO - Portal Académico UCSAR -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/auth.js?v=4"></script>
</body>'''

for page in pages:
    path = os.path.join(repo_dir, page)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'auth.js' not in content:
            content = content.replace('</body>', auth_block)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Protected: {page}")
        else:
            print(f"Already protected: {page}")
