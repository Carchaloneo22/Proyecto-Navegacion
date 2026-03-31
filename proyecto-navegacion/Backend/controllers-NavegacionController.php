<?php
require_once 'models/Mapa.php';
require_once 'strategies/Dijkstra.php';
require_once 'strategies/AStar.php';

class NavegacionController {
    private $mapa;
    
    public function __construct() {
        $this->mapa = new Mapa();
    }
    
    public function getNodos() {
        $nodos = $this->mapa->getNodos();
        $result = [];
        foreach ($nodos as $nodo) {
            $result[] = [
                'id' => $nodo->id,
                'nombre' => $nodo->nombre,
                'lat' => (float)$nodo->lat,
                'lng' => (float)$nodo->lng
            ];
        }
        return $result;
    }
    
    public function calcularRuta($origen_id, $destino_id, $estrategia = 'dijkstra', $criterio = 'distancia') {
        if ($estrategia == 'dijkstra') {
            $algoritmo = new Dijkstra();
        } else if ($estrategia == 'astar') {
            $algoritmo = new AStar();
        } else {
            return ['error' => 'Estrategia no válida'];
        }
        
        $resultado = $algoritmo->calcularRuta($this->mapa, (int)$origen_id, (int)$destino_id, $criterio);
        
        // Obtener detalles de nodos para la ruta
        $ruta_detalle = [];
        foreach ($resultado['ruta'] as $nodo_id) {
            $nodo = $this->mapa->getNodo($nodo_id);
            if ($nodo) {
                $ruta_detalle[] = [
                    'id' => $nodo->id,
                    'nombre' => $nodo->nombre,
                    'lat' => (float)$nodo->lat,
                    'lng' => (float)$nodo->lng
                ];
            }
        }
        
        return [
            'ruta' => $ruta_detalle,
            'distancia_total' => $resultado['distancia_total'],
            'tiempo_total' => $resultado['tiempo_total']
        ];
    }
}
?>