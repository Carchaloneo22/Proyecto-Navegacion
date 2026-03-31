<?php
class Nodo {
    public $id;
    public $nombre;
    public $lat;
    public $lng;

    public function __construct($id, $nombre, $lat, $lng) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->lat = $lat;
        $this->lng = $lng;
    }
}
?>