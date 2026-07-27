# eunicelopez.com — Eunice López · Historia Viva

Sitio de conferencista, publicado con GitHub Pages en el dominio `eunicelopez.com`.

Una sola página estática, sin dependencias externas: HTML y CSS en un archivo,
la foto va incrustada en base64. No hay build, no hay JavaScript.

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La página completa |
| `og-image.jpg` | Vista previa al compartir el link |
| `favicon.svg` | Ícono de la pestaña |
| `robots.txt`, `sitemap.xml` | Indexación en buscadores |
| `CNAME` | Le dice a GitHub Pages cuál es el dominio |
| `.nojekyll` | Desactiva el procesamiento de Jekyll |

## Publicar un cambio

Push a `main`. GitHub Pages redespliega solo en uno o dos minutos.

El original editable vive en el repo privado `ClaudeCodeTest`, carpeta
`historia-viva/site/`. Edita allá y corre `historia-viva/deploy.sh` para sincronizar.
