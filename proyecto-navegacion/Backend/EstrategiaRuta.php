<?php
interface EstrategiaRuta {
    public function calcularRuta($mapa, $origen_id, $destino_id, $criterio = 'distancia');
}
?>