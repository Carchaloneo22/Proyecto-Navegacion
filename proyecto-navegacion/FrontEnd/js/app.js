let map;
let markers = {};
let rutaLayer = null;
let nodosData = [];

// Inicializar mapa
function initMap() {
    map = L.map('map').setView([40.714, -74.006], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB'
    }).addTo(map);
}

// Cargar nodos desde la API
async function cargarNodos() {
    try {
        const response = await fetch('http://localhost/proyecto-navegacion/backend/index.php?action=nodos');
        const data = await response.json();
        nodosData = data;
        const selectOrigen = document.getElementById('origen');
        const selectDestino = document.getElementById('destino');
        selectOrigen.innerHTML = '';
        selectDestino.innerHTML = '';
        data.forEach(nodo => {
            const optionOrigen = document.createElement('option');
            optionOrigen.value = nodo.id;
            optionOrigen.textContent = `${nodo.nombre} (${nodo.lat}, ${nodo.lng})`;
            selectOrigen.appendChild(optionOrigen);
            
            const optionDestino = document.createElement('option');
            optionDestino.value = nodo.id;
            optionDestino.textContent = `${nodo.nombre} (${nodo.lat}, ${nodo.lng})`;
            selectDestino.appendChild(optionDestino);
            
            // Añadir marcadores al mapa
            const marker = L.marker([nodo.lat, nodo.lng]).addTo(map);
            marker.bindPopup(`<b>${nodo.nombre}</b>`);
            markers[nodo.id] = marker;
        });
        // Por defecto seleccionar primer y último nodo
        if (data.length >= 2) {
            selectOrigen.value = data[0].id;
            selectDestino.value = data[data.length-1].id;
        }
    } catch (error) {
        console.error('Error cargando nodos:', error);
    }
}

// Dibujar ruta en el mapa
function dibujarRuta(rutaNodos) {
    if (rutaLayer) {
        map.removeLayer(rutaLayer);
    }
    const latlngs = rutaNodos.map(nodo => [nodo.lat, nodo.lng]);
    rutaLayer = L.polyline(latlngs, { color: '#e74c3c', weight: 5, opacity: 0.7 }).addTo(map);
    map.fitBounds(rutaLayer.getBounds());
}

// Calcular ruta con la API
async function calcularRuta() {
    const origen = document.getElementById('origen').value;
    const destino = document.getElementById('destino').value;
    const estrategia = document.getElementById('estrategia').value;
    const criterio = document.getElementById('criterio').value;
    
    if (!origen || !destino) {
        alert('Selecciona origen y destino');
        return;
    }
    
    const url = `http://localhost/proyecto-navegacion/backend/index.php?action=ruta&origen=${origen}&destino=${destino}&estrategia=${estrategia}&criterio=${criterio}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            alert(data.error);
            return;
        }
        if (data.ruta && data.ruta.length > 0) {
            dibujarRuta(data.ruta);
            const info = document.getElementById('infoRuta');
            info.innerHTML = `📏 Distancia total: ${data.distancia_total.toFixed(2)} metros | ⏱️ Tiempo estimado: ${data.tiempo_total} segundos<br>🗺️ Ruta: ${data.ruta.map(n => n.nombre).join(' → ')}`;
        } else {
            alert('No se encontró ruta entre esos puntos');
        }
    } catch (error) {
        console.error('Error calculando ruta:', error);
        alert('Error al conectar con el servidor');
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    cargarNodos();
    document.getElementById('calcularBtn').addEventListener('click', calcularRuta);
});