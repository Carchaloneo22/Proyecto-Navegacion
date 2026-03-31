<?php
require_once 'config/database.php';
require_once 'models/Nodo.php';
require_once 'models/Arista.php';

class Mapa {
    private $conn;
    private $nodos = [];
    private $adyacencia = []; // lista de adyacencia: nodo_id => [ (vecino_id, peso_distancia, peso_tiempo) ]

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->cargarDatos();
    }

    private function cargarDatos() {
        // Cargar nodos
        $query = "SELECT id, nombre, lat, lng FROM nodos";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $nodo = new Nodo($row['id'], $row['nombre'], $row['lat'], $row['lng']);
            $this->nodos[$row['id']] = $nodo;
        }

        // Cargar aristas
        $query = "SELECT nodo_origen_id, nodo_destino_id, distancia, tiempo_estimado FROM aristas";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $origen = $row['nodo_origen_id'];
            $destino = $row['nodo_destino_id'];
            $distancia = (float)$row['distancia'];
            $tiempo = (int)$row['tiempo_estimado'];
            // Grafo no dirigido (agregar ambos sentidos)
            $this->adyacencia[$origen][] = ['vecino' => $destino, 'distancia' => $distancia, 'tiempo' => $tiempo];
            $this->adyacencia[$destino][] = ['vecino' => $origen, 'distancia' => $distancia, 'tiempo' => $tiempo];
        }
    }

    public function getNodos() {
        return $this->nodos;
    }

    public function getNodo($id) {
        return isset($this->nodos[$id]) ? $this->nodos[$id] : null;
    }

    public function getAdyacencia() {
        return $this->adyacencia;
    }

    public function obtenerVecinos($nodo_id) {
        return isset($this->adyacencia[$nodo_id]) ? $this->adyacencia[$nodo_id] : [];
    }
}
?>