-- Crear tabla de nodos (intersecciones)
CREATE TABLE nodos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    lat NUMERIC(10, 7) NOT NULL,  -- latitud
    lng NUMERIC(10, 7) NOT NULL   -- longitud
);

-- Crear tabla de aristas (calles)
CREATE TABLE aristas (
    id SERIAL PRIMARY KEY,
    nodo_origen_id INT NOT NULL REFERENCES nodos(id) ON DELETE CASCADE,
    nodo_destino_id INT NOT NULL REFERENCES nodos(id) ON DELETE CASCADE,
    distancia NUMERIC(10, 2) NOT NULL, -- en metros o km
    tiempo_estimado INT NOT NULL,      -- en segundos
    CONSTRAINT aristas_unicas UNIQUE (nodo_origen_id, nodo_destino_id)
);

-- Crear tabla para almacenar rutas calculadas (opcional, histórico)
CREATE TABLE rutas_historicas (
    id SERIAL PRIMARY KEY,
    origen_id INT NOT NULL REFERENCES nodos(id),
    destino_id INT NOT NULL REFERENCES nodos(id),
    estrategia VARCHAR(20) NOT NULL, -- 'dijkstra' o 'astar'
    distancia_total NUMERIC(10, 2),
    tiempo_total INT,
    nodos_recorrido TEXT, -- JSON array de IDs
    fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);