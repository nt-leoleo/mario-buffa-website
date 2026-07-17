Réplica estática aproximada del sitio https://mariobuffa.com.ar/

Archivos creados:

- index.html — Página principal (HTML)
- css/styles.css — Estilos responsivos
- js/script.js — Interactividad (menú móvil, formulario simulado)

Cómo probar:

1. Abre `index.html` en tu navegador (doble clic o "Abrir con" → navegador).
2. Para reemplazar imágenes temporales, coloca tus activos en `assets/` y actualiza las rutas en `index.html`.

Siguiente paso (opcional):
- Si quieres una copia exacta con las mismas imágenes y contenidos, súbeme un ZIP con los assets o indícame si doy permiso para descargar los recursos desde el sitio original y lo integro.

Descarga automática de imágenes (opcional):

Si quieres que las imágenes públicas del sitio se descarguen automáticamente en `assets/images`, puedes ejecutar este script en PowerShell (Windows). Crea primero la carpeta `assets/images` o el script la creará por ti.

```powershell
$root = "C:\Users\PC\Desktop\Leonardo\WEB\mario buffa"
$dest = Join-Path $root 'assets\images'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$html = (Invoke-WebRequest -Uri 'https://mariobuffa.com.ar' -UseBasicParsing -ErrorAction Stop).Content
$matches = [regex]::Matches($html, '<img[^>]+?src=["\'](?<u>[^"\']+)["\']', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$urls = $matches | ForEach-Object { $_.Groups['u'].Value } | Select-Object -Unique
foreach($u in $urls){
	if($u.StartsWith('//')){ $u = 'https:' + $u }
	elseif($u.StartsWith('/')){ $u = 'https://mariobuffa.com.ar' + $u }
	elseif($u -notmatch '^[hH][tT][tT][pP]'){ $u = 'https://mariobuffa.com.ar/' + $u }
	$file = ($u -split '\?')[0].Split('/')[-1]
	$file = ($file -replace '[^\w\.\-]','_')
	$out = Join-Path $dest $file
	Invoke-WebRequest -Uri $u -OutFile $out -ErrorAction SilentlyContinue
}
Write-Output "Descarga completada. Archivos guardados en: $dest"
```

Después de ejecutar el script, coloca (o renombra) las imágenes relevantes a:

- `assets/images/logo.png`
- `assets/images/hero.jpg`
- `assets/images/sobre.jpg`
- `assets/images/project1.jpg`
- `assets/images/project2.jpg`
- `assets/images/project3.jpg`

La plantilla ya intenta usar estas rutas locales automáticamente.
