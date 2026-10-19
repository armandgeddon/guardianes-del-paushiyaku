/**
 * Guardianes del Paushiyaku - data_layers.js
 * Definición de capas, simbología, leyendas y plantillas de popups para el Visor WebGIS.
 */

const LAYERS_CONFIG = {
  // --- GRUPO 1: HIDROGRAFÍA Y LÍMITES ---
  limite_cuenca: {
    id: 'limite_cuenca',
    title: 'Límite Microcuenca Paushiyaku',
    group: 'hidrografia',
    file: 'data/limite_cuenca.geojson',
    visible: true,
    style: {
      color: '#047857',
      weight: 3,
      dashArray: '6, 4',
      fillColor: '#10b981',
      fillOpacity: 0.08
    },
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-emerald">
          <span class="badge">Cuenca Hidrográfica</span>
          <h4>${f.properties.nombre || 'Microcuenca Estero Paushiyaku'}</h4>
        </div>
        <div class="popup-body">
          <table class="popup-table">
            <tr><td><strong>Área:</strong></td><td>${f.properties.area_ha ? Number(f.properties.area_ha).toFixed(2) + ' ha' : '486.20 ha'}</td></tr>
            <tr><td><strong>Perímetro:</strong></td><td>${f.properties.perim_m ? (Number(f.properties.perim_m) / 1000).toFixed(2) + ' km' : '11.45 km'}</td></tr>
            <tr><td><strong>Cantón:</strong></td><td>Tena, Napo, Ecuador</td></tr>
            <tr><td><strong>Estado:</strong></td><td>Cuenca Urbana Priorizada</td></tr>
          </table>
        </div>
      </div>`
  },

  subcuencas_hms: {
    id: 'subcuencas_hms',
    title: 'Subcuencas Hidrológicas HEC-HMS',
    group: 'hidrografia',
    file: 'data/subcuencas_hms.geojson',
    visible: false,
    style: (feature) => ({
      color: '#0284c7',
      weight: 1.5,
      fillColor: '#38bdf8',
      fillOpacity: 0.12
    }),
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-sky">
          <span class="badge">Modelación HEC-HMS</span>
          <h4>Subcuenca ${f.properties.nombre || f.properties.Name || f.properties.id || ''}</h4>
        </div>
        <div class="popup-body">
          <p>Unidad hidrológica modelada para estimación de caudales pico y escorrentía superficial.</p>
          <table class="popup-table">
            <tr><td><strong>Área:</strong></td><td>${f.properties.area_ha ? Number(f.properties.area_ha).toFixed(2) + ' ha' : (f.properties.Area ? Number(f.properties.Area).toFixed(2) + ' ha' : 'S/D')}</td></tr>
            <tr><td><strong>Modelo:</strong></td><td>HEC-HMS 4.10</td></tr>
          </table>
        </div>
      </div>`
  },

  red_hidrica: {
    id: 'red_hidrica',
    title: 'Espejo de Agua / Cauce Poligonal',
    group: 'hidrografia',
    file: 'data/red_hidrica.geojson',
    visible: true,
    style: {
      color: '#0284c7',
      weight: 1.5,
      fillColor: '#0ea5e9',
      fillOpacity: 0.65
    },
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-blue">
          <span class="badge">Hidrografía</span>
          <h4>${f.properties.nombre || 'Cauce del Estero Paushiyaku'}</h4>
        </div>
        <div class="popup-body">
          <p>Cuerpo hídrico principal receptor y tributario natural en la zona urbana de Tena.</p>
        </div>
      </div>`
  },

  eje_talweg: {
    id: 'eje_talweg',
    title: 'Eje Fluvial Talweg (Calados HEC-RAS)',
    group: 'hidrografia',
    file: 'data/eje_talweg.geojson',
    visible: true,
    style: {
      color: '#1d4ed8',
      weight: 3.5,
      opacity: 0.95
    },
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-blue">
          <span class="badge">Eje Hidráulico</span>
          <h4>${f.properties.nombre || 'Eje Talweg Principal'}</h4>
        </div>
        <div class="popup-body">
          <table class="popup-table">
            <tr><td><strong>Longitud:</strong></td><td>${f.properties.longitud_m ? (Number(f.properties.longitud_m)).toFixed(1) + ' m' : '5,420 m'}</td></tr>
            <tr><td><strong>Calado medio modelado:</strong></td><td>${f.properties.calado_medio_m ? Number(f.properties.calado_medio_m).toFixed(2) + ' m' : '1.45 m'}</td></tr>
            <tr><td><strong>Pendiente media:</strong></td><td>1.2 - 2.8%</td></tr>
          </table>
        </div>
      </div>`
  },

  buffer_30m: {
    id: 'buffer_30m',
    title: 'Franja Legal de Protección (30 m)',
    group: 'hidrografia',
    file: 'data/buffer_30m.geojson',
    visible: true,
    style: {
      color: '#16a34a',
      weight: 1.8,
      dashArray: '4, 4',
      fillColor: '#22c55e',
      fillOpacity: 0.15
    },
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-green">
          <span class="badge">Retiro Legal OGT</span>
          <h4>Franja de Protección Hídrica (30 m)</h4>
        </div>
        <div class="popup-body">
          <p>Área de amortiguamiento y conservación obligatoria según la Ley Orgánica de Recursos Hídricos y Ordenanzas Municipales de Tena.</p>
          <table class="popup-table">
            <tr><td><strong>Ancho de retiro:</strong></td><td>30 metros a cada margen</td></tr>
            <tr><td><strong>Área total:</strong></td><td>${f.properties.area_ha ? Number(f.properties.area_ha).toFixed(2) + ' ha' : '32.40 ha'}</td></tr>
            <tr><td><strong>Uso permitido:</strong></td><td>Restauración ecológica y protección estricta</td></tr>
          </table>
        </div>
      </div>`
  },

  buffer_50m: {
    id: 'buffer_50m',
    title: 'Franja de Amortiguamiento Ecológico (50 m)',
    group: 'hidrografia',
    file: 'data/buffer_50m.geojson',
    visible: false,
    style: {
      color: '#eab308',
      weight: 1.2,
      dashArray: '5, 5',
      fillColor: '#facc15',
      fillOpacity: 0.08
    },
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-amber">
          <span class="badge">Buffer Referencial</span>
          <h4>Franja de Amortiguamiento (50 m)</h4>
        </div>
        <div class="popup-body">
          <p>Zona extendida de análisis de vulnerabilidad socioambiental y conectividad biológica riparia.</p>
        </div>
      </div>`
  },

  // --- GRUPO 2: CALIDAD DE AGUA Y DESCARGAS ---
  calidad_agua: {
    id: 'calidad_agua',
    title: 'Estaciones de Monitoreo de Agua (9 puntos)',
    group: 'calidad',
    file: 'data/calidad_agua.geojson',
    visible: true,
    isPoint: true,
    pointType: 'circleMarker',
    pointStyle: {
      radius: 9,
      fillColor: '#0284c7',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.95
    },
    popup: (f) => {
      const p = f.properties;
      const dqo = p.dqo !== undefined && p.dqo !== null ? Number(p.dqo).toFixed(1) : 'S/D';
      const turb = p.turbidez !== undefined && p.turbidez !== null ? Number(p.turbidez).toFixed(1) : 'S/D';
      const od = p.oxigeno_disuelto !== undefined && p.oxigeno_disuelto !== null ? Number(p.oxigeno_disuelto).toFixed(2) : 'S/D';
      const ph = p.ph !== undefined && p.ph !== null ? Number(p.ph).toFixed(2) : 'S/D';
      const nitrato = p.nitrato !== undefined && p.nitrato !== null ? Number(p.nitrato).toFixed(2) : 'S/D';
      const cloruro = p.cloruro !== undefined && p.cloruro !== null ? Number(p.cloruro).toFixed(1) : 'S/D';

      return `
      <div class="popup-card">
        <div class="popup-header bg-cyan">
          <span class="badge">Monitoreo Físico-Químico</span>
          <h4>Estación #${p.ID || p.id || ''}: ${p.Sitio || 'Punto de Calidad'}</h4>
        </div>
        <div class="popup-body">
          <div class="stat-grid">
            <div class="stat-pill"><span class="lbl">DQO:</span> <strong>${dqo} mg/L</strong></div>
            <div class="stat-pill"><span class="lbl">OD:</span> <strong>${od} mg/L</strong></div>
            <div class="stat-pill"><span class="lbl">pH:</span> <strong>${ph}</strong></div>
            <div class="stat-pill"><span class="lbl">Turbidez:</span> <strong>${turb} NTU</strong></div>
            <div class="stat-pill"><span class="lbl">Nitratos:</span> <strong>${nitrato} mg/L</strong></div>
            <div class="stat-pill"><span class="lbl">Cloruros:</span> <strong>${cloruro} mg/L</strong></div>
          </div>
          <div class="tulsma-alert">
            <span class="warning-dot"></span> <strong>Evaluación TULSMA:</strong> Alteración crítica de la calidad por descargas domésticas directas en zonas consolidadas.
          </div>
        </div>
      </div>`;
    }
  },

  descargas_residuales: {
    id: 'descargas_residuales',
    title: 'Puntos de Descarga Residual (24 puntos)',
    group: 'calidad',
    file: 'data/descargas_residuales.geojson',
    visible: true,
    isPoint: true,
    pointType: 'circleMarker',
    pointStyle: (f) => {
      const tipo = (f.properties['Referencia / Tipo de Descarga'] || '').toLowerCase();
      let color = '#ef4444'; // Directa = Rojo
      if (tipo.includes('pluvial')) color = '#0284c7';
      else if (tipo.includes('combinada')) color = '#f97316';
      return {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      };
    },
    popup: (f) => {
      const p = f.properties;
      const tipo = p['Referencia / Tipo de Descarga'] || 'No especificado';
      let tagClass = 'tag-red';
      if (tipo.toLowerCase().includes('pluvial')) tagClass = 'tag-blue';
      else if (tipo.toLowerCase().includes('combinada')) tagClass = 'tag-orange';

      return `
      <div class="popup-card">
        <div class="popup-header bg-rose">
          <span class="badge ${tagClass}">Descarga Directa</span>
          <h4>Punto ${p.Punto || 'Descarga'} (${p.Margen || 'Margen'} Izq/Der)</h4>
        </div>
        <div class="popup-body">
          <table class="popup-table">
            <tr><td><strong>Tipo de descarga:</strong></td><td><span class="tag ${tagClass}">${tipo}</span></td></tr>
            <tr><td><strong>Margen:</strong></td><td>${p.Margen || 'S/D'}</td></tr>
            <tr><td><strong>Latitud:</strong></td><td>${p.Latitude ? Number(p.Latitude).toFixed(5) : 'S/D'}</td></tr>
            <tr><td><strong>Longitud:</strong></td><td>${p.Longitude ? Number(p.Longitude).toFixed(5) : 'S/D'}</td></tr>
            <tr><td><strong>Acción sugerida:</strong></td><td>Intercepción a colector marginal sanitario</td></tr>
          </table>
        </div>
      </div>`;
    }
  },

  // --- GRUPO 3: RIESGOS E INUNDACIÓN ---
  huella_inundacion_tr50: {
    id: 'huella_inundacion_tr50',
    title: 'Huella de Inundación TR 50 Años (Calado > 10cm)',
    group: 'riesgos',
    file: 'data/huella_inundacion_tr50.geojson',
    visible: true,
    style: {
      color: '#dc2626',
      weight: 1.5,
      fillColor: '#f87171',
      fillOpacity: 0.45
    },
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-rose">
          <span class="badge badge-alert">Amenaza Hidráulica</span>
          <h4>Inundación TR 50 Años (HEC-RAS)</h4>
        </div>
        <div class="popup-body">
          <p>Zona con calados de inundación superiores a 10 cm calculados para eventos extremos con periodo de retorno de 50 años.</p>
          <table class="popup-table">
            <tr><td><strong>Área inundable:</strong></td><td>${f.properties.area_m2 ? (Number(f.properties.area_m2) / 10000).toFixed(2) + ' ha' : '9.18 ha'}</td></tr>
            <tr><td><strong>Calado de diseño:</strong></td><td>&gt; 0.10 m hasta 2.80 m</td></tr>
            <tr><td><strong>Nivel de riesgo:</strong></td><td><strong style="color:#b91c1c;">ALTO / CRÍTICO</strong></td></tr>
          </table>
        </div>
      </div>`
  },

  obras_mitigacion: {
    id: 'obras_mitigacion',
    title: 'Obras Existentes (Muros de Gaviones)',
    group: 'riesgos',
    file: 'data/obras_mitigacion.geojson',
    visible: true,
    style: {
      color: '#7c3aed',
      weight: 4,
      dashArray: '3, 5',
      opacity: 0.95
    },
    popup: (f) => `
      <div class="popup-card">
        <div class="popup-header bg-purple">
          <span class="badge">Mitigación</span>
          <h4>Muro de Gavión / Contención</h4>
        </div>
        <div class="popup-body">
          <p>Estructuras de protección de márgenes fluviales construidas para estabilizar taludes y proteger viviendas colindantes.</p>
        </div>
      </div>`
  },

  // --- GRUPO 4: CATASTRO Y BARRIOS ---
  barrios_cuenca: {
    id: 'barrios_cuenca',
    title: 'Barrios Urbanos en la Cuenca (14 barrios)',
    group: 'catastro',
    file: 'data/barrios_cuenca.geojson',
    visible: true,
    style: {
      color: '#6366f1',
      weight: 1.5,
      dashArray: '4, 3',
      fillColor: '#a5b4fc',
      fillOpacity: 0.12
    },
    popup: (f) => {
      const p = f.properties;
      return `
      <div class="popup-card">
        <div class="popup-header bg-indigo">
          <span class="badge">Barrio Urbano de Tena</span>
          <h4>${p.nombre_barrio || 'Barrio'}</h4>
        </div>
        <div class="popup-body">
          <table class="popup-table">
            <tr><td><strong>Área en cuenca:</strong></td><td>${p.area_en_cuenca_ha ? Number(p.area_en_cuenca_ha).toFixed(2) + ' ha' : 'S/D'}</td></tr>
            <tr><td><strong>% del barrio en cuenca:</strong></td><td>${p.pct_en_cuenca ? Number(p.pct_en_cuenca).toFixed(1) + '%' : 'S/D'}</td></tr>
            <tr><td><strong>Población estimada en cuenca:</strong></td><td>${p.pob_est_en_cuenca || p.POBLAC_EST || 'S/D'} hab.</td></tr>
            <tr><td><strong>Prioridad de restauración:</strong></td><td><strong class="tag tag-orange">${p.prioridad_restauracion || 'Alta'}</strong></td></tr>
          </table>
        </div>
      </div>`;
    }
  },

  predios_intervenidos: {
    id: 'predios_intervenidos',
    title: 'Predios Catastrales en Retiro Hídrico (134)',
    group: 'catastro',
    file: 'data/predios_intervenidos.geojson',
    visible: false,
    style: {
      color: '#e11d48',
      weight: 1.2,
      fillColor: '#f43f5e',
      fillOpacity: 0.25
    },
    popup: (f) => {
      const p = f.properties;
      return `
      <div class="popup-card">
        <div class="popup-header bg-rose">
          <span class="badge">Predio Catastral</span>
          <h4>Clave: ${p.clave_cata || 'S/D'}</h4>
        </div>
        <div class="popup-body">
          <table class="popup-table">
            <tr><td><strong>Propietario:</strong></td><td>${p.propietari || 'Registrado'}</td></tr>
            <tr><td><strong>Sector:</strong></td><td>${p.sector || p.direccion || 'Tena'}</td></tr>
            <tr><td><strong>Área total predio:</strong></td><td>${p.area_pred_m2 ? Number(p.area_pred_m2).toFixed(1) + ' m²' : 'S/D'}</td></tr>
            <tr><td><strong>Área afectada en buffer:</strong></td><td>${p.area_buf_m2 ? Number(p.area_buf_m2).toFixed(1) + ' m²' : 'S/D'}</td></tr>
            <tr><td><strong>% de afectación:</strong></td><td>${p.pct_buf ? Number(p.pct_buf).toFixed(1) + '%' : 'S/D'}</td></tr>
          </table>
        </div>
      </div>`;
    }
  },

  viviendas_consolidadas: {
    id: 'viviendas_consolidadas',
    title: 'Viviendas Consolidadas en Riesgo (149)',
    group: 'catastro',
    file: 'data/viviendas_consolidadas.geojson',
    visible: false,
    style: {
      color: '#9333ea',
      weight: 1.2,
      fillColor: '#a855f7',
      fillOpacity: 0.55
    },
    popup: (f) => {
      const p = f.properties;
      return `
      <div class="popup-card">
        <div class="popup-header bg-purple">
          <span class="badge">Vivienda Consolidada</span>
          <h4>Vivienda #${p.id_casa || p.id || 'Consolidada'}</h4>
        </div>
        <div class="popup-body">
          <table class="popup-table">
            <tr><td><strong>Tipo:</strong></td><td>${p.tipo || 'Vivienda habitacional'}</td></tr>
            <tr><td><strong>Área huella:</strong></td><td>${p.area_m2 ? Number(p.area_m2).toFixed(1) + ' m²' : 'S/D'}</td></tr>
            <tr><td><strong>Perímetro:</strong></td><td>${p.perimetro_m ? Number(p.perimetro_m).toFixed(1) + ' m' : 'S/D'}</td></tr>
            <tr><td><strong>Situación:</strong></td><td>Ubicada dentro de la franja de riesgo o retiro de 30m</td></tr>
          </table>
        </div>
      </div>`;
    }
  },

  // --- GRUPO 5: RESTAURACIÓN ECOLÓGICA (EMC) ---
  zonificacion_restauracion: {
    id: 'zonificacion_restauracion',
    title: 'Zonificación de Restauración EMC (754 zonas)',
    group: 'restauracion',
    file: 'data/zonificacion_restauracion.geojson',
    visible: false,
    style: (feature) => {
      const col = feature.properties.color_hex || '#10b981';
      return {
        color: col,
        weight: 1,
        fillColor: col,
        fillOpacity: 0.65
      };
    },
    popup: (f) => {
      const p = f.properties;
      return `
      <div class="popup-card">
        <div class="popup-header" style="background-color: ${p.color_hex || '#059669'}; color: white;">
          <span class="badge" style="background: rgba(255,255,255,0.25);">Prioridad: ${p.nivel_prioridad || '1'}</span>
          <h4>${p.categoria || 'Zona de Intervención'}</h4>
        </div>
        <div class="popup-body">
          <p><strong>Acción Recomendada:</strong> ${p.descripcion_accion || 'Intervención de restauración'}</p>
          <table class="popup-table">
            <tr><td><strong>Área:</strong></td><td>${p.area_m2 ? Number(p.area_m2).toFixed(1) + ' m²' : 'S/D'}</td></tr>
            <tr><td><strong>Código:</strong></td><td>CAT-${p.codigo_cat || p.id_zona || ''}</td></tr>
          </table>
        </div>
      </div>`;
    }
  }
};

const GROUPS_CONFIG = [
  { id: 'hidrografia', name: 'Cuenca e Hidrografía', icon: '🌊' },
  { id: 'calidad', name: 'Calidad de Agua y Saneamiento', icon: '🔬' },
  { id: 'riesgos', name: 'Riesgos e Inundaciones', icon: '⚠️' },
  { id: 'catastro', name: 'Catastro y Barrios', icon: '🏘️' },
  { id: 'restauracion', name: 'Restauración Ecológica (EMC)', icon: '🌱' }
];
