-- Insertar nodos (coordenadas aproximadas de una ciudad pequeña)
INSERT INTO nodos (nombre, lat, lng) VALUES
('A', 40.7128, -74.0060),
('B', 40.7135, -74.0070),
('C', 40.7140, -74.0050),
('D', 40.7150, -74.0080),
('E', 40.7160, -74.0030);

-- Insertar aristas (distancias en metros, tiempo en segundos aprox)
-- Asumiendo velocidad promedio 5 m/s (18 km/h)
INSERT INTO aristas (nodo_origen_id, nodo_destino_id, distancia, tiempo_estimado) VALUES
(1, 2, 100, 20),
(1, 3, 150, 30),
(2, 3, 80, 16),
(2, 4, 200, 40),
(3, 4, 120, 24),
(3, 5, 250, 50),
(4, 5, 180, 36);