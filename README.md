# Plataforma Web y Visor Geoespacial: Guardianes del Paushiyaku

Este repositorio y carpeta contiene la plataforma web interactiva y el visor WebGIS desarrollada para el proyecto de Vinculación con la Sociedad: **"Guardianes del Paushiyaku: diagnóstico ecohidrológico-socioambiental y plan de acción participativo para el estero urbano de Tena"**, promovido por la **Universidad Regional Amazónica IKIAM** en articulación con el **GAD Municipal de Tena**, el **GAD Provincial de Napo**, la **Unidad Educativa Monseñor Maximiliano Spiller** y los barrios ribereños.

---

## Estructura de la Plataforma

```text
portal_web/
├── index.html                    # Portal Principal: Identidad, Misión, Visión, Propósito, Hitos, Calidad de Agua, Galería y Alianzas
├── visor.html                    # Visor Geoespacial WebGIS autónomo a pantalla completa con Leaflet 1.9.4
├── serve.py                      # Script para ejecutar servidor HTTP local y abrir automáticamente el navegador
├── css/
│   ├── main.css                  # Estilos del portal: paleta amazónica moderna, glassmorphism, responsive, lightbox
│   └── visor.css                 # Estilos del WebGIS: barra lateral de capas, conmutadores modernos, buscador y leyenda
├── js/
│   ├── main.js                   # Lógica del portal: filtros de galería, contadores métricos animados, modal de fotos
│   ├── data_layers.js            # Configuración de capas espaciales, reglas de simbología y plantillas de popups
│   └── visor.js                  # Motor del WebGIS: Leaflet, mapas base satelital/callejero, búsqueda de barrios/puntos y reglas de medición
├── data/                         # Capas GeoJSON optimizadas en WGS84 (EPSG:4326)
│   ├── limite_cuenca.geojson     # Microcuenca hidrográfica del estero Paushiyaku (486.2 ha)
│   ├── subcuencas_hms.geojson    # 7 subcuencas hidrológicas modeladas en HEC-HMS
│   ├── red_hidrica.geojson       # Polígono del cauce fluvial del estero
│   ├── eje_talweg.geojson        # Eje fluvial principal con calados medios de diseño
│   ├── buffer_30m.geojson        # Franja legal de protección hídrica (30 metros)
│   ├── buffer_50m.geojson        # Franja de amortiguamiento ecológico (50 metros)
│   ├── calidad_agua.geojson      # 9 estaciones de monitoreo físico-químico y microbiológico
│   ├── descargas_residuales.geojson # 24 descargas directas de aguas servidas al cauce
│   ├── huella_inundacion_tr50.geojson # Mancha de amenaza de inundación para TR 50 años (HEC-RAS)
│   ├── predios_intervenidos.geojson # 134 predios catastrales en retiro hídrico
│   ├── viviendas_consolidadas.geojson # 149 viviendas en zona de riesgo o afectación
│   ├── zonificacion_restauracion.geojson # 754 polígonos de zonificación de restauración (EMC)
│   ├── barrios_cuenca.geojson    # 14 barrios urbanos involucrados en la cuenca
│   └── obras_mitigacion.geojson  # Estructuras de protección (muros de gaviones)
└── assets/
    └── img/
        ├── logos/                # Logos institucionales (Ikiam, GAD Tena, Guardianes, Yaku Wasi)
        ├── cartografia/          # Mapas oficiales del proyecto en alta resolución (MAPA 01 al 05)
        ├── campo/                # Registro fotográfico de descargas y cauce
        ├── talleres/             # Evidencias de talleres con estudiantes de la U.E. Spiller y líderes barriales
        └── graficas/             # Comparativas de calidad de agua frente a norma TULSMA y perfiles longitudinales
```

---

## Cómo Ejecutar Localmente

### Opción 1: Servidor Python con Auto-Apertura (Recomendado)
Abre una terminal en esta carpeta y ejecuta:
```bash
python serve.py
```
El script detectará un puerto libre (por defecto `8080`), iniciará el servidor local y abrirá automáticamente tu navegador en:
- **Portal Principal:** `http://localhost:8080/`
- **Visor Geoespacial:** `http://localhost:8080/visor.html`

### Opción 2: Abrir Directamente en el Navegador
Al estar construido con tecnologías web estándares y relativas, también puedes hacer doble clic directamente sobre `index.html` o `visor.html`.

---

## Funcionalidades del Visor Geoespacial

1. **Mapas Base Dinámicos:** Conmutación instantánea entre Satélite de alta resolución (Esri World Imagery), Callejero Urbano (OpenStreetMap) y Vista Carto Dark.
2. **Jerarquía Topológica y Clasificación Temática:**
   - **Cuenca e Hidrografía:** Límite, subcuencas HEC-HMS, cauce poligonal, eje fluvial con calados y buffers de 30m y 50m.
   - **Calidad de Agua y Saneamiento:** 9 estaciones de monitoreo con popups detallados (DQO, OD, pH, turbidez, nitratos) y 24 descargas residuales clasificadas por tipo (directa, pluvial, combinada).
   - **Riesgos e Inundaciones:** Huella hidráulica TR 50 años (calado > 10 cm) y muros de gaviones existentes.
   - **Catastro y Barrios:** 14 barrios urbanos de Tena, 134 predios afectados y 149 viviendas en riesgo de inundación/retiro.
   - **Restauración Ecológica (EMC):** 754 zonas categorizadas por color oficial (Crítica, Alta, Pasiva, Conservación y Conflicto Socio-Territorial).
3. **Herramientas de Análisis:**
   - Buscador con autocompletado para volar directamente a cualquier barrio, estación o punto de descarga.
   - Herramienta de medición de distancias lineales interactiva (en metros y kilómetros).
   - Leyenda cartográfica dinámica que se autoadapta según las capas encendidas.
   - Coordenadas geográficas y nivel de zoom en tiempo real.
