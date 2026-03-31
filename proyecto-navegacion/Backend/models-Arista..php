<?php
class Arista {
    public $origen_id;
    public $destino_id;
    public $distancia;
    public $tiempo;

    public function __construct($origen_id, $destino_id, $distancia, $tiempo) {
        $this->origen_id = $origen_id;
        $this->destino_id = $destino_id;
        $this->distancia = $distancia;
        $this->tiempo = $tiempo;
    }
}
?>