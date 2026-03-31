<?php
require_once 'EstrategiaRuta.php';

class Dijkstra implements EstrategiaRuta {
    public function calcularRuta($mapa, $origen_id, $destino_id, $criterio = 'distancia') {
        $adyacencia = $mapa->getAdyacencia();
        $dist = [];
        $prev = [];
        $pq = new SplPriorityQueue();
        
        // Inicializar distancias infinito
        foreach ($mapa->getNodos() as $id => $nodo) {
            $dist[$id] = INF;
            $prev[$id] = null;
        }
        $dist[$origen_id] = 0;
        $pq->insert($origen_id, 0);
        
        while (!$pq->isEmpty()) {
            $u = $pq->extract();
            if ($u == $destino_id) break;
            if (!isset($adyacencia[$u])) continue;
            foreach ($adyacencia[$u] as $arista) {
                $v = $arista['vecino'];
                $peso = ($criterio == 'distancia') ? $arista['distancia'] : $arista['tiempo'];
                $alt = $dist[$u] + $peso;
                if ($alt < $dist[$v]) {
                    $dist[$v] = $alt;
                    $prev[$v] = $u;
                    $pq->insert($v, -$alt); // max-heap via negativo
                }
            }
        }
        
        // Reconstruir ruta
        $ruta_ids = [];
        $current = $destino_id;
        while ($current !== null) {
            array_unshift($ruta_ids, $current);
            $current = $prev[$current];
        }
        // Verificar si se encontró ruta
        if ($ruta_ids[0] != $origen_id) {
            return ['ruta' => [], 'distancia_total' => INF, 'tiempo_total' => INF];
        }
        
        // Calcular distancia y tiempo total de la ruta
        $distancia_total = 0;
        $tiempo_total = 0;
        for ($i = 0; $i < count($ruta_ids)-1; $i++) {
            $u = $ruta_ids[$i];
            $v = $ruta_ids[$i+1];
            foreach ($adyacencia[$u] as $arista) {
                if ($arista['vecino'] == $v) {
                    $distancia_total += $arista['distancia'];
                    $tiempo_total += $arista['tiempo'];
                    break;
                }
            }
        }
        
        return [
            'ruta' => $ruta_ids,
            'distancia_total' => $distancia_total,
            'tiempo_total' => $tiempo_total
        ];
    }
}
?>