<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'controllers/NavegacionController.php';

$controller = new NavegacionController();
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET' && isset($_GET['action'])) {
    $action = $_GET['action'];
    if ($action == 'nodos') {
        echo json_encode($controller->getNodos());
    } else if ($action == 'ruta') {
        $origen = isset($_GET['origen']) ? $_GET['origen'] : null;
        $destino = isset($_GET['destino']) ? $_GET['destino'] : null;
        $estrategia = isset($_GET['estrategia']) ? $_GET['estrategia'] : 'dijkstra';
        $criterio = isset($_GET['criterio']) ? $_GET['criterio'] : 'distancia';
        if ($origen && $destino) {
            echo json_encode($controller->calcularRuta($origen, $destino, $estrategia, $criterio));
        } else {
            echo json_encode(['error' => 'Faltan parámetros origen/destino']);
        }
    } else {
        echo json_encode(['error' => 'Acción no válida']);
    }
} else {
    echo json_encode(['error' => 'Método no permitido']);
}
?>