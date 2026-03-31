<?php
require_once 'EstrategiaRuta.php';

class AStar implements EstrategiaRuta {
    private function heuristica($mapa, $nodo_id, $destino_id) {
        $nodo = $mapa->getNodo($nodo_id);
        $destino = $mapa->getNodo($destino_id);
        // Distancia euclidiana en km (aproximada)
        $lat1 = deg2rad($nodo->lat);
        $lon1 = deg2rad($nodo->lng);
        $lat2 = deg2rad($destino->lat);
        $lon2 = deg2rad($destino->lng);
        $R = 6371; // km
        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;
        $a = sin($dlat/2)*sin($dlat/2) + cos($lat1)*cos($lat2)*sin($dlon/2)*sin($dlon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $R * $c * 1000; // metros
    }

    public function calcularRuta($mapa, $origen_id, $destino_id, $criterio = 'distancia') {
        $adyacencia = $mapa->getAdyacencia();
        $g_score = [];
        $f_score = [];
        $prev = [];
        $openSet = new SplPriorityQueue();
        
        foreach ($mapa->getNodos() as $id => $nodo) {
            $g_score[$id] = INF;
            $f_score[$id] = INF;
            $prev[$id] = null;
        }
        $g_score[$origen_id] = 0;
        $f_score[$origen_id] = $this->heuristica($mapa, $origen_id, $destino_id);
        $openSet->insert($origen_id, -$f_score[$origen_id]);
        
        while (!$openSet->isEmpty()) {
            $current = $openSet->extract();
            if ($current == $destino_id) break;
            if (!isset($adyacencia[$current])) continue;
            foreach ($adyacencia[$current] as $arista) {
                $neighbor = $arista['vecino'];
                $peso = ($criterio == 'distancia') ? $arista['distancia'] : $arista['tiempo'];
                $tent_g = $g_score[$current] + $peso;
                if ($tent_g < $g_score[$neighbor]) {
                    $prev[$neighbor] = $current;
                    $g_score[$neighbor] = $tent_g;
                    $f_score[$neighbor] = $tent_g + $this->heuristica($mapa, $neighbor, $destino_id);
                    $openSet->insert($neighbor, -$f_score[$neighbor]);
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
        if ($ruta_ids[0] != $origen_id) {
            return ['ruta' => [], 'distancia_total' => INF, 'tiempo_total' => INF];
        }
        
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