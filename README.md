[README.md](https://github.com/user-attachments/files/26369797/README.md)
# Sistema de Navegación — Optimización de Rutas

Sistema web para calcular rutas óptimas en un grafo de calles urbanas usando los algoritmos **Dijkstra** y **A\***, implementado con el **patrón Strategy** para intercambiar estrategias de navegación en tiempo de ejecución.

> Proyecto académico de **Arquitectura de Software** — Patrones de Diseño aplicados a navegación.

---

##  Tabla de Contenido

- [Descripción del Problema](#-descripción-del-problema)
- [Arquitectura](#-arquitectura)
- [Patrones de Diseño](#-patrones-de-diseño)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Base de Datos](#-base-de-datos)
- [Algoritmos](#-algoritmos)
- [Diagramas UML](#-diagramas-uml)
- [Pruebas](#-pruebas)
- [Contribuidores](#-contribuidores)
- [Licencia](#-licencia)

---

##  Descripción del Problema

En el contexto de la logística y el reparto urbano, la optimización de rutas impacta directamente en costos operativos, tiempos de entrega y satisfacción del cliente. Este sistema modela una red de calles como un **grafo ponderado no dirigido** donde:

- **Nodos** = intersecciones o puntos de interés (almacenes, clientes, centros de distribución)
- **Aristas** = calles que conectan los nodos, con dos pesos: distancia (metros) y tiempo estimado (segundos)

El usuario selecciona un origen, un destino, una estrategia de búsqueda y un criterio de optimización, y el sistema calcula y visualiza la ruta óptima sobre un mapa interactivo.

---

##  Arquitectura

El sistema sigue una arquitectura de **tres capas** con API REST:

```
┌─────────────────────────────────────────────┐
│  Presentación — HTML5 / CSS3 / JS / Leaflet │
├─────────────────────────────────────────────┤
│  API REST — index.php (JSON + CORS)         │
├─────────────────────────────────────────────┤
│  Lógica de Negocio — Controller + Strategy  │
├─────────────────────────────────────────────┤
│  Datos — PostgreSQL (Nodos + Aristas)       │
└─────────────────────────────────────────────┘
```

El **Frontend** se comunica con el **Backend** mediante peticiones HTTP GET que devuelven respuestas JSON. El controlador instancia dinámicamente la estrategia de ruta seleccionada por el usuario.

---

##  Patrones de Diseño

### Strategy (principal)

El patrón Strategy encapsula los algoritmos Dijkstra y A\* como implementaciones intercambiables de la interfaz `EstrategiaRuta`:

```php
interface EstrategiaRuta {
    public function calcularRuta($mapa, $origen_id, $destino_id, $criterio = 'distancia');
}
```

Agregar un nuevo algoritmo (Bellman-Ford, Floyd-Warshall, etc.) solo requiere crear una clase que implemente esta interfaz, sin modificar el controlador.

### MVC (implícito)

| Capa       | Componente                        |
|------------|-----------------------------------|
| Modelo     | Mapa, Nodo, Arista, Database      |
| Vista      | Frontend HTML/JS/Leaflet          |
| Controlador| NavegacionController + API        |

### Principios SOLID

| Principio                  | Aplicación                                              |
|----------------------------|---------------------------------------------------------|
| Responsabilidad Única      | Cada clase tiene una sola responsabilidad               |
| Abierto/Cerrado            | Extensible con nuevos algoritmos sin modificar existente |
| Sustitución de Liskov      | Dijkstra y A\* son intercambiables vía la interfaz      |
| Segregación de Interfaces  | `EstrategiaRuta` define solo `calcularRuta()`           |
| Inversión de Dependencias  | El controlador depende de la abstracción, no de clases concretas |

---

## 🛠 Tecnologías

| Componente       | Tecnología              | Versión  |
|------------------|-------------------------|----------|
| Backend          | PHP                     | 7.4+     |
| Base de datos    | PostgreSQL              | 13+      |
| Frontend         | HTML5 / CSS3 / JavaScript | ES6+   |
| Mapa interactivo | Leaflet.js              | 1.9.4    |
| Tiles            | CartoDB (OpenStreetMap)  | —        |
| Servidor web     | Apache / Nginx          | —        |
| Modelado UML     | PlantUML                | —        |

---

##  Estructura del Proyecto

```
proyecto-navegacion/
├── Backend/
│   ├── config.php                          # Conexión a PostgreSQL
│   ├── index.php                           # API REST (punto de entrada)
│   ├── controllers-NavegacionController.php # Controlador principal
│   ├── models-Nodo.php                     # Modelo: intersección
│   ├── models-Arista..php                  # Modelo: calle
│   ├── models-mapa.php                     # Modelo: grafo (lista de adyacencia)
│   ├── EstrategiaRuta.php                  # Interfaz del patrón Strategy
│   ├── estrategies-Dijkstra.php            # Implementación Dijkstra
│   └── AStar.php                           # Implementación A*
├── FrontEnd/
│   ├── index.html                          # Página principal
│   ├── css/styles.css                      # Estilos
│   └── js/app.js                           # Lógica del frontend + Leaflet
├── Sql/Db/
│   ├── ddl.sql                             # Creación de tablas
│   └── dml.sql                             # Datos de prueba (5 nodos, 7 aristas)
├── docs/diagramas/
│   ├── Diagrama de clase.txt               # PlantUML - Clases
│   ├── diagrama de secuencia.txt           # PlantUML - Secuencia
│   ├── diagrama de actividad.txt           # PlantUML - Actividad
│   └── Diagramas UML.txt                   # PlantUML - Componentes
├── Scripts/
│   └── Configurar base de datosf.sh        # Script de configuración BD
└── README.md
```

---

## ⚙ Instalación

### Prerrequisitos

- PHP 7.4 o superior con extensión `pdo_pgsql`
- PostgreSQL 13 o superior
- Servidor web Apache o Nginx
- Navegador moderno con JavaScript habilitado

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/proyecto-navegacion.git
cd proyecto-navegacion
```

### 2. Configurar la base de datos

```bash
# Crear la base de datos
sudo -u postgres createdb navegacion_db

# Ejecutar el DDL (crear tablas)
sudo -u postgres psql -d navegacion_db -f Sql/Db/ddl.sql

# Ejecutar el DML (insertar datos de prueba)
sudo -u postgres psql -d navegacion_db -f Sql/Db/dml.sql
```

### 3. Configurar la conexión

Editar `Backend/config.php` con los datos de tu servidor PostgreSQL:

```php
private $host = 'localhost';
private $db_name = 'navegacion_db';
private $username = 'postgres';
private $password = 'tu_contraseña';
```

### 4. Configurar el servidor web

**Apache (ejemplo con XAMPP/WAMP):**

Copiar el proyecto a la carpeta `htdocs` o configurar un VirtualHost apuntando al directorio del proyecto.

**PHP built-in server (desarrollo rápido):**

```bash
cd Backend
php -S localhost:8000
```

### 5. Abrir el frontend

Abrir `FrontEnd/index.html` en el navegador. Si usas el servidor PHP built-in, ajustar la URL de la API en `FrontEnd/js/app.js`:

```javascript
const response = await fetch('http://localhost:8000/index.php?action=nodos');
```

---

##  Uso

1. Abrir la aplicación en el navegador
2. Seleccionar el **nodo de origen** en el primer selector
3. Seleccionar el **nodo de destino** en el segundo selector
4. Elegir la **estrategia** de navegación:
   - **Dijkstra**: exploración exhaustiva, óptimo garantizado
   - **A\***: búsqueda guiada por heurística, más eficiente en grafos grandes
5. Elegir el **criterio** de optimización:
   - **Distancia**: minimiza metros recorridos
   - **Tiempo**: minimiza segundos estimados
6. Presionar **"Calcular Ruta"**
7. La ruta óptima se dibuja en el mapa y se muestran las métricas (distancia total y tiempo estimado)

### Endpoints de la API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `?action=nodos` | GET | Devuelve todos los nodos con coordenadas |
| `?action=ruta&origen=1&destino=5&estrategia=dijkstra&criterio=distancia` | GET | Calcula la ruta óptima |

### Ejemplo de respuesta JSON

```json
{
  "ruta": [
    { "id": 1, "nombre": "A", "lat": 40.7128, "lng": -74.006 },
    { "id": 3, "nombre": "C", "lat": 40.714, "lng": -74.005 },
    { "id": 5, "nombre": "E", "lat": 40.716, "lng": -74.003 }
  ],
  "distancia_total": 400,
  "tiempo_total": 80
}
```

---

## 🗄 Base de Datos

### Esquema (DDL)

```
nodos (id, nombre, lat, lng)
aristas (id, nodo_origen_id, nodo_destino_id, distancia, tiempo_estimado)
rutas_historicas (id, origen_id, destino_id, estrategia, distancia_total, tiempo_total, nodos_recorrido, fecha_calculo)
```

### Grafo de prueba (DML)

```
     B(2)
    / |  \
100m  80m  200m
  /   |     \
A(1)--C(3)--D(4)
  150m  120m  180m
         \    /
         250m
          |
         E(5)
```

5 nodos (A–E) y 7 aristas bidireccionales con distancias en metros y tiempos en segundos.

---

## 📐 Algoritmos

### Dijkstra

- **Tipo**: Algoritmo voraz (greedy)
- **Complejidad**: O((V + E) log V)
- **Garantía**: Siempre encuentra la ruta óptima
- **Mecanismo**: Cola de prioridad (SplPriorityQueue), explora nodos ordenados por distancia acumulada

### A\* (A-Star)

- **Tipo**: Búsqueda informada
- **Complejidad**: O((V + E) log V)
- **Garantía**: Óptimo si la heurística es admisible
- **Heurística**: Fórmula de Haversine (distancia del gran círculo)
- **Ventaja**: Explora hasta 60-70% menos nodos que Dijkstra en grafos grandes

### Fórmula A\*

```
f(n) = g(n) + h(n)

g(n) = costo real desde el origen hasta n
h(n) = estimación heurística desde n hasta el destino (Haversine)
```

---

##  Diagramas UML

Los diagramas están documentados en formato PlantUML en `docs/diagramas/`:

| Diagrama      | Archivo                         | Descripción                                    |
|---------------|---------------------------------|------------------------------------------------|
| Clases        | `Diagrama de clase.txt`         | Estructura interna del backend                 |
| Secuencia     | `diagrama de secuencia.txt`     | Flujo de comunicación al calcular ruta         |
| Actividad     | `diagrama de actividad.txt`     | Flujo lógico del proceso                       |
| Componentes   | `Diagramas UML.txt`             | Arquitectura general del sistema               |

Para renderizar los diagramas se puede usar [PlantUML Online](https://www.plantuml.com/plantuml/uml/) o la extensión de VS Code.

---

##  Pruebas

| Caso | Origen | Destino | Estrategia       | Distancia | Tiempo |
|------|--------|---------|------------------|-----------|--------|
| 1    | A      | E       | Dijkstra         | 400 m     | 80 s   |
| 2    | A      | E       | A\*              | 400 m     | 80 s   |
| 3    | A      | D       | Dijkstra         | 270 m     | 54 s   |
| 4    | A      | D       | A\*              | 270 m     | 54 s   |
| 5    | B      | E       | Dijkstra (tiempo)| 330 m     | 66 s   |

Ambos algoritmos producen rutas óptimas idénticas, validando la correctitud de las implementaciones. La diferencia está en la eficiencia: A\* explora menos nodos al estar guiado por la heurística Haversine.

---

##  Contribuidores

| Rol                     | Integrante     |
|-------------------------|----------------|
| Líder de proyecto       | —              |
| Diseñador UML           | —              |
| Programador prototipo   | —              |
| Investigador patrones   | —              |

---

##  Licencia

Este proyecto es de uso académico. Desarrollado como parte de la materia de Arquitectura de Software.

---

##  Referencias

1. Gamma, E. et al. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
2. Cormen, T. H. et al. (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.
3. Dijkstra, E. W. (1959). A note on two problems in connexion with graphs. *Numerische Mathematik*, 1(1), 269-271.
4. Hart, P. E. et al. (1968). A Formal Basis for the Heuristic Determination of Minimum Cost Paths. *IEEE Transactions*.
