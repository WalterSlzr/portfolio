# Walter Salazar — Portafolio

Portafolio web de **Walter Salazar**, diseñador gráfico en Barranquilla, Colombia.
Contenido tomado de [behance.net/walterslzr4d8f](https://www.behance.net/walterslzr4d8f).

Sitio estático (HTML, CSS y JavaScript, sin paso de build), listo para GitHub Pages.

## Estructura

```
index.html           Única página: hero, proyectos, servicios, sobre mí, contacto
css/                 tokens · base · components · layout
├── tokens.css       Única fuente de colores, tipografía, espaciado y movimiento
js/
├── locales/
│   ├── en.js        Textos de la interfaz en inglés
│   └── es.js        Textos de la interfaz en español
├── i18n.js          Estado del idioma y traducción de la página
├── projects.js      Contenido de los proyectos, en español y en inglés (`en`)
└── main.js          Grid, filtros, visor de proyecto, menú y animaciones
assets/img/
├── avatar.jpg       Foto de perfil
├── covers/          Portadas 808×632 de cada proyecto
└── boards/          Láminas completas que se muestran en el visor
```

## Sistema de diseño

Mismo sistema que Talento ATS (Inter, espaciado base 8, tokens de radio,
sombra y movimiento; ningún archivo declara colores fuera de `tokens.css`),
con paleta **negro / blanco / azul eléctrico `#2147ff`** y grafismos
editoriales: retícula, marcas de registro de imprenta, esfera azul, sello
circular con texto, marquesina y numeración de secciones.

## Idiomas (inglés / español)

El sitio es bilingüe y **abre en inglés por defecto**. El botón `EN | ES` de la
cabecera cambia el idioma y la elección se guarda en el navegador del visitante
(`localStorage`), así que se mantiene al recargar o volver otro día hasta que
vuelva a pulsar el botón.

Para enviar un enlace en un idioma concreto: `…/?lang=en` o `…/?lang=es`.

Los textos de la página están en `js/locales/en.js` y `js/locales/es.js`; los de cada proyecto, en
`js/projects.js` (campos en español arriba, inglés dentro de `en`).

## Agregar o editar un proyecto

1. Guarda la portada en `assets/img/covers/<slug>.jpg` (808×632).
2. Guarda las láminas en `assets/img/boards/` (ancho máx. 1400 px).
3. Agrega la entrada en `js/projects.js` con `category: "branding"` o `"fotografia"`
   y su traducción en el bloque `en`.

## Ver en local

```bash
python3 -m http.server 8090
```

Abre `http://localhost:8090`.

## Publicar en GitHub Pages

En el repositorio: **Settings → Pages → Deploy from a branch → `main` / root**.
