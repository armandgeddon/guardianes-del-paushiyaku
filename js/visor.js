/**
 * Guardianes del Paushiyaku - visor.js
 * Lógica WebGIS interactiva para el visor geoespacial en Leaflet.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Centro aproximado de la microcuenca en Tena, Napo
  const initialCenter = [-1.003, -77.804];
  const initialZoom = 14;

  // 1. Inicializar Mapa Leaflet
  const map = L.map('map', {
    center: initialCenter,
    zoom: initialZoom,
    zoomControl: false // Lo reposicionamos luego si se requiere
  });

  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

  // 2. Mapas Base (TileLayers)
  const baseLayers = {
    satellite: L.layerGroup([
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }),
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      })
    ]),
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }),
    cartoDark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      maxZoom: 19
    })
  };

  // Activar Satélite por defecto
  baseLayers.satellite.addTo(map);

  // 3. Estado de Capas GeoJSON
  const activeGeoJsonLayers = {};
  const searchIndex = []; // { name, type, latlng, bounds, layerId }

  // 4. Construir Árbol de Capas en la Barra Lateral
  const sidebarContent = document.getElementById('layers-container');

  GROUPS_CONFIG.forEach(grp => {
    const groupEl = document.createElement('div');
    groupEl.className = 'layer-group open';
    groupEl.id = `grp-${grp.id}`;

    groupEl.innerHTML = `
      <div class="group-header" data-group="${grp.id}">
        <span class="group-title">${grp.icon} ${grp.name}</span>
        <span class="arrow">&#9656;</span>
      </div>
      <div class="group-layers" id="layers-grp-${grp.id}"></div>
    `;
    sidebarContent.appendChild(groupEl);

    // Evento desplegable del grupo
    const header = groupEl.querySelector('.group-header');
    header.addEventListener('click', () => {
      groupEl.classList.toggle('open');
    });
  });

  // 5. Cargar Capas GeoJSON
  Object.values(LAYERS_CONFIG).forEach(cfg => {
    const container = document.getElementById(`layers-grp-${cfg.group}`);
    if (!container) return;

    // Crear fila en la barra lateral
    const itemEl = document.createElement('div');
    itemEl.className = 'layer-item';

    // Dot o preview de color
    let dotColor = '#64748b';
    if (typeof cfg.style === 'object' && cfg.style.color) {
      dotColor = cfg.style.color;
    } else if (cfg.pointStyle && cfg.pointStyle.fillColor) {
      dotColor = cfg.pointStyle.fillColor;
    }

    itemEl.innerHTML = `
      <div class="layer-info">
        <span class="layer-badge-dot" style="background-color: ${dotColor};"></span>
        <span class="layer-name">${cfg.title}</span>
      </div>
      <div class="layer-controls">
        <label class="switch">
          <input type="checkbox" id="chk-${cfg.id}" ${cfg.visible ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    `;
    container.appendChild(itemEl);

    // Escuchador del switch
    const chk = itemEl.querySelector('input');
    chk.addEventListener('change', (e) => {
      toggleLayer(cfg.id, e.target.checked);
    });

    // Cargar los datos GeoJSON
    loadGeoJson(cfg);
  });

  function loadGeoJson(cfg) {
    fetch(cfg.file)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const leafletLayer = L.geoJSON(data, {
          style: (feature) => {
            if (typeof cfg.style === 'function') {
              return cfg.style(feature);
            }
            return cfg.style || {};
          },
          pointToLayer: (feature, latlng) => {
            if (cfg.isPoint) {
              const pStyle = typeof cfg.pointStyle === 'function' ? cfg.pointStyle(feature) : (cfg.pointStyle || {});
              return L.circleMarker(latlng, pStyle);
            }
            return L.marker(latlng);
          },
          onEachFeature: (feature, layer) => {
            if (cfg.popup) {
              layer.bindPopup(cfg.popup(feature), {
                maxWidth: 340,
                className: 'custom-leaflet-popup'
              });
            }

            // Indexar para la búsqueda
            indexFeatureForSearch(feature, layer, cfg);

            // Resaltado al pasar el ratón (para líneas y polígonos)
            if (!cfg.isPoint) {
              layer.on({
                mouseover: (e) => {
                  const l = e.target;
                  l.setStyle({ weight: (cfg.style?.weight || 2) + 2, opacity: 1 });
                },
                mouseout: (e) => {
                  leafletLayer.resetStyle(e.target);
                }
              });
            }
          }
        });

        activeGeoJsonLayers[cfg.id] = leafletLayer;

        if (cfg.visible) {
          leafletLayer.addTo(map);
        }

        // Si es el límite de cuenca, ajustar vista inicial a sus límites
        if (cfg.id === 'limite_cuenca') {
          map.fitBounds(leafletLayer.getBounds(), { padding: [20, 20] });
        }

        updateLegend();
      })
      .catch(err => {
        console.warn(`No se pudo cargar la capa ${cfg.id}:`, err);
      });
  }

  function toggleLayer(layerId, show) {
    const lyr = activeGeoJsonLayers[layerId];
    if (!lyr) return;
    if (show) {
      lyr.addTo(map);
    } else {
      map.removeLayer(lyr);
    }
    updateLegend();
  }

  // 6. Indexar entidades para el buscador
  function indexFeatureForSearch(feature, layer, cfg) {
    const p = feature.properties;
    let label = '';
    let category = cfg.title;

    if (cfg.id === 'barrios_cuenca' && p.nombre_barrio) {
      label = `Barrio: ${p.nombre_barrio}`;
    } else if (cfg.id === 'calidad_agua') {
      label = `Estación #${p.ID || ''}: ${p.Sitio || 'Muestreo'}`;
    } else if (cfg.id === 'descargas_residuales') {
      label = `Descarga: Punto ${p.Punto || ''} (${p['Referencia / Tipo de Descarga'] || ''})`;
    } else if (cfg.id === 'predios_intervenidos' && p.clave_cata) {
      label = `Predio: ${p.clave_cata} (${p.propietari || ''})`;
    }

    if (label) {
      searchIndex.push({
        label: label,
        category: category,
        layer: layer,
        bounds: layer.getBounds ? layer.getBounds() : null,
        latlng: layer.getLatLng ? layer.getLatLng() : null
      });
    }
  }

  // 7. Buscador con Autocompletado
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      searchResults.innerHTML = '';
      if (q.length < 2) {
        searchResults.style.display = 'none';
        return;
      }

      const matches = searchIndex.filter(item => item.label.toLowerCase().includes(q)).slice(0, 8);
      if (matches.length === 0) {
        searchResults.style.display = 'none';
        return;
      }

      searchResults.style.display = 'block';
      matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `<strong>${m.label}</strong><small>${m.category}</small>`;
        item.addEventListener('click', () => {
          searchResults.style.display = 'none';
          searchInput.value = m.label;
          if (m.bounds) {
            map.fitBounds(m.bounds, { maxZoom: 17, padding: [40, 40] });
          } else if (m.latlng) {
            map.flyTo(m.latlng, 17);
          }
          if (m.layer.openPopup) {
            setTimeout(() => m.layer.openPopup(), 400);
          }
        });
        searchResults.appendChild(item);
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sidebar-search')) {
        searchResults.style.display = 'none';
      }
    });
  }

  // 8. Selector de Mapas Base
  const baseBtns = document.querySelectorAll('.basemap-opt');
  baseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      baseBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.basemap;
      Object.values(baseLayers).forEach(l => map.removeLayer(l));
      if (baseLayers[target]) {
        baseLayers[target].addTo(map);
      }
    });
  });

  // 9. Colapso / Apertura de Barra Lateral
  const sidebar = document.getElementById('sidebar');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const openSidebarBtn = document.getElementById('open-sidebar');

  if (closeSidebarBtn && sidebar) {
    closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.add('collapsed');
      if (openSidebarBtn) openSidebarBtn.style.display = 'flex';
    });
  }

  if (openSidebarBtn && sidebar) {
    openSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('collapsed');
      openSidebarBtn.style.display = 'none';
    });
  }

  // 10. Actualización Dinámica de Leyenda
  const legendPanel = document.getElementById('legend-panel');
  const legendBody = document.getElementById('legend-content');
  const toggleLegendBtn = document.getElementById('btn-toggle-legend');
  const closeLegendBtn = document.getElementById('close-legend');

  if (toggleLegendBtn && legendPanel) {
    toggleLegendBtn.addEventListener('click', () => {
      legendPanel.classList.toggle('hidden');
      toggleLegendBtn.classList.toggle('active');
    });
  }

  if (closeLegendBtn && legendPanel) {
    closeLegendBtn.addEventListener('click', () => {
      legendPanel.classList.add('hidden');
      if (toggleLegendBtn) toggleLegendBtn.classList.remove('active');
    });
  }

  function updateLegend() {
    if (!legendBody) return;
    legendBody.innerHTML = '';

    const items = [];

    // Revisar qué capas están encendidas
    Object.values(LAYERS_CONFIG).forEach(cfg => {
      const chk = document.getElementById(`chk-${cfg.id}`);
      if (chk && chk.checked) {
        if (cfg.id === 'zonificacion_restauracion') {
          items.push(`
            <div class="legend-item"><span class="legend-sym poly" style="background:#D32F2F;"></span> Restauración Prioridad Crítica</div>
            <div class="legend-item"><span class="legend-sym poly" style="background:#F57C00;"></span> Restauración Prioridad Alta</div>
            <div class="legend-item"><span class="legend-sym poly" style="background:#FBC02D;"></span> Restauración Pasiva / Asistida</div>
            <div class="legend-item"><span class="legend-sym poly" style="background:#2E7D32;"></span> Conservación Estricta</div>
            <div class="legend-item"><span class="legend-sym poly" style="background:#8E24AA;"></span> Conflicto Socio-Territorial</div>
          `);
        } else if (cfg.id === 'calidad_agua') {
          items.push(`
            <div class="legend-item"><span class="legend-sym dot" style="background:#0284c7;"></span> Estación Calidad de Agua</div>
          `);
        } else if (cfg.id === 'descargas_residuales') {
          items.push(`
            <div class="legend-item"><span class="legend-sym dot" style="background:#ef4444;"></span> Descarga Sanitaria Directa</div>
            <div class="legend-item"><span class="legend-sym dot" style="background:#f97316;"></span> Descarga Combinada</div>
            <div class="legend-item"><span class="legend-sym dot" style="background:#0284c7;"></span> Descarga Pluvial</div>
          `);
        } else if (cfg.id === 'huella_inundacion_tr50') {
          items.push(`
            <div class="legend-item"><span class="legend-sym poly" style="background:rgba(248,113,113,0.7); border-color:#dc2626;"></span> Inundación TR50 (>10cm)</div>
          `);
        } else if (cfg.id === 'eje_talweg') {
          items.push(`
            <div class="legend-item"><span class="legend-sym line" style="background:#1d4ed8;"></span> Eje Fluvial Talweg</div>
          `);
        } else if (cfg.id === 'buffer_30m') {
          items.push(`
            <div class="legend-item"><span class="legend-sym poly" style="background:rgba(34,197,94,0.3); border: 1px dashed #16a34a;"></span> Franja Legal 30m</div>
          `);
        } else if (cfg.id === 'limite_cuenca') {
          items.push(`
            <div class="legend-item"><span class="legend-sym poly" style="background:rgba(16,185,129,0.15); border: 1px dashed #047857;"></span> Microcuenca Paushiyaku</div>
          `);
        } else if (cfg.id === 'obras_mitigacion') {
          items.push(`
            <div class="legend-item"><span class="legend-sym line" style="background:#7c3aed; border-top: 2px dashed #7c3aed;"></span> Muros de Gaviones</div>
          `);
        }
      }
    });

    if (items.length === 0) {
      legendBody.innerHTML = '<small style="color:#94a3b8;">Active capas para visualizar su simbología.</small>';
    } else {
      legendBody.innerHTML = items.join('');
    }
  }

  // 11. Botón Reset Vista a la Cuenca
  const resetBtn = document.getElementById('btn-reset-zoom');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const cuenca = activeGeoJsonLayers['limite_cuenca'];
      if (cuenca) {
        map.fitBounds(cuenca.getBounds(), { padding: [25, 25] });
      } else {
        map.setView(initialCenter, initialZoom);
      }
    });
  }

  // 12. Barra de Coordenadas en Vivo
  const coordsDisplay = document.getElementById('coords-display');
  map.on('mousemove', (e) => {
    if (coordsDisplay) {
      coordsDisplay.textContent = `Lat: ${e.latlng.lat.toFixed(5)} | Lon: ${e.latlng.lng.toFixed(5)} | Zoom: ${map.getZoom()}`;
    }
  });

  // 13. Herramienta de Medición Simple (Régla)
  let measuring = false;
  let measurePoints = [];
  let measureLine = null;
  let measureTooltip = null;
  const measureBtn = document.getElementById('btn-measure');

  if (measureBtn) {
    measureBtn.addEventListener('click', () => {
      measuring = !measuring;
      measureBtn.classList.toggle('active', measuring);

      if (!measuring) {
        cleanupMeasure();
      } else {
        map.getContainer().style.cursor = 'crosshair';
      }
    });
  }

  map.on('click', (e) => {
    if (!measuring) return;

    measurePoints.push(e.latlng);
    if (!measureLine) {
      measureLine = L.polyline(measurePoints, { color: '#f59e0b', weight: 3, dashArray: '5, 5' }).addTo(map);
    } else {
      measureLine.setLatLngs(measurePoints);
    }

    let distTotal = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      distTotal += measurePoints[i].distanceTo(measurePoints[i+1]);
    }

    const txt = distTotal > 1000 ? `${(distTotal / 1000).toFixed(2)} km` : `${distTotal.toFixed(1)} m`;

    if (!measureTooltip) {
      measureTooltip = L.tooltip({ permanent: true, className: 'measure-tooltip' })
        .setLatLng(e.latlng)
        .setContent(`Distancia: ${txt}`)
        .addTo(map);
    } else {
      measureTooltip.setLatLng(e.latlng).setContent(`Distancia: ${txt}`);
    }
  });

  function cleanupMeasure() {
    map.getContainer().style.cursor = '';
    if (measureLine) {
      map.removeLayer(measureLine);
      measureLine = null;
    }
    if (measureTooltip) {
      map.removeLayer(measureTooltip);
      measureTooltip = null;
    }
    measurePoints = [];
  }
});
