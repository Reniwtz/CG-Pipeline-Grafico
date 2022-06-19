// Cria um color buffer para armazenar a imagem final.
let color_buffer = new Canvas("canvas");
color_buffer.clear();

/******************************************************************************
* Vértices do modelo (cubo) centralizado no seu espaco do objeto. Os dois
* vértices extremos do cubo são (-1,-1,-1) e (1,1,1), logo, cada aresta do cubo
* tem comprimento igual a 2.
*****************************************************************************/
//                                   X     Y     Z    W (coord. homogênea)
let vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
                new THREE.Vector4( 1.0, -1.0, -1.0, 1.0),
                new THREE.Vector4( 1.0, -1.0,  1.0, 1.0),
                new THREE.Vector4(-1.0, -1.0,  1.0, 1.0),
                new THREE.Vector4(-1.0,  1.0, -1.0, 1.0),
                new THREE.Vector4( 1.0,  1.0, -1.0, 1.0),
                new THREE.Vector4( 1.0,  1.0,  1.0, 1.0),
                new THREE.Vector4(-1.0,  1.0,  1.0, 1.0)];

/******************************************************************************
* As 12 arestas do cubo, indicadas através dos índices dos seus vértices.
*****************************************************************************/
let edges = [[0, 1],
             [1, 2],
             [2, 3],
             [3, 0],
             [4, 5],
             [5, 6],
             [6, 7],
             [7, 4],
             [0, 4],
             [1, 5],
             [2, 6],
             [3, 7]];

/******************************************************************************
* Matriz Model (modelagem): Esp. Objeto --> Esp. Universo. 
* OBS: A matriz está carregada inicialmente com a identidade.
*****************************************************************************/
let m_model = new THREE.Matrix4();

m_model.set(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);

for (let i = 0; i < 8; ++i)
  vertices[i].applyMatrix4(m_model);

/******************************************************************************
* Parâmetros da camera sintética.
*****************************************************************************/
let cam_pos = new THREE.Vector3(1.3, 1.7, 2.0);     // posição da câmera no esp. do Universo.
let cam_look_at = new THREE.Vector3(0.0, 0.0, 0.0); // ponto para o qual a câmera aponta.
let cam_up = new THREE.Vector3(0.0, 1.0, 0.0);      // vetor Up da câmera.

/******************************************************************************
* Matriz View (visualização): Esp. Universo --> Esp. Câmera
* OBS: A matriz está carregada inicialmente com a identidade. 
*****************************************************************************/

// Derivar os vetores da base da câmera a partir dos parâmetros informados acima.

// ---------- implementar aqui ----------------------------------------------
let cam_dir = new THREE.Vector3().subVectors(cam_look_at, cam_pos);

let z_cam = cam_dir.normalize().negate();
let x_cam = new THREE.Vector3().crossVectors(cam_up, z_cam).normalize();
let y_cam = new THREE.Vector3().crossVectors(z_cam, x_cam).normalize();

// Construir 'm_bt', a inversa da matriz de base da câmera.

// ---------- implementar aqui ----------------------------------------------
let m_bt = new THREE.Matrix4();

m_bt.set(1.0, 0.0, 0.0, 0.0,
         0.0, 1.0, 0.0, 0.0,
         0.0, 0.0, 1.0, 0.0,
         0.0, 0.0, 0.0, 1.0);

m_bt.set(x_cam.getComponent(0), x_cam.getComponent(1), x_cam.getComponent(2), 0.0,
         y_cam.getComponent(0), y_cam.getComponent(1), y_cam.getComponent(2), 0.0,
         z_cam.getComponent(0), z_cam.getComponent(1), z_cam.getComponent(2), 0.0,
         0.0, 0.0, 0.0, 1.0);

// Construir a matriz 'm_t' de translação para tratar os casos em que as
// origens do espaço do universo e da câmera não coincidem.

// ---------- implementar aqui ----------------------------------------------
let m_t = new THREE.Matrix4();

m_t.set(1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0);

let t = cam_pos.negate();
//Translação da câmera

let cam_trans = new THREE.Matrix4();
m_t.set(1.0, 0.0, 0.0, -t.getComponent(0),
        0.0, 1.0, 0.0, -t.getComponent(1),
        0.0, 0.0, 1.0, -t.getComponent(2),
        0.0, 0.0, 0.0, 1.0);

// Constrói a matriz de visualização 'm_view' como o produto
//  de 'm_bt' e 'm_t'.
let m_view = m_bt.multiply(m_t);

for (let i = 0; i < 8; ++i)
  vertices[i].applyMatrix4(m_view);

/******************************************************************************
 * Matriz de Projecao: Esp. Câmera --> Esp. Recorte
 * OBS: A matriz está carregada inicialmente com a identidade. 
  *****************************************************************************/

// ---------- implementar aqui ----------------------------------------------
let m_projection = new THREE.Matrix4();

m_projection.set(1.0, 0.0, 0.0, 0.0,
                 0.0, 1.0, 0.0, 0.0,
                 0.0, 0.0, 1.0, 0.0,
                 0.0, 0.0, 0.0, 1.0);

let d = 1;
m_projection.set(1.0, 0.0,  0.0, 0.0,
                 0.0, 1.0,  0.0, 0.0,
                 0.0, 0.0,  1.0,  d,
                 0.0, 0.0, -1/d, 0.0);

for (let i = 0; i < 8; ++i)
  vertices[i].applyMatrix4(m_projection);

/******************************************************************************
* Homogeneizacao (divisao por W): Esp. Recorte --> Esp. Canônico
*****************************************************************************/

// ---------- implementar aqui ----------------------------------------------

for (let i = 0; i < 8; i++)
  vertices[i].divideScalar(vertices[i].w);

/******************************************************************************
* Matriz Viewport: Esp. Canônico --> Esp. Tela
* OBS: A matriz está carregada inicialmente com a identidade. 
*****************************************************************************/

// ---------- implementar aqui ----------------------------------------------
let m_viewport = new THREE.Matrix4();

m_viewport.set(1.0, 0.0, 0.0, 0.0,
               0.0, 1.0, 0.0, 0.0,
               0.0, 0.0, 1.0, 0.0,
               0.0, 0.0, 0.0, 1.0);


let scale = new THREE.Matrix4();
scale.set(128/2, 0.0, 0.0, 0.0,
          0.0, 128/2, 0.0, 0.0,
          0.0,  0.0, 1.0, 0.0,
          0.0,  0.0, 0.0, 1.0);


let translate = new THREE.Matrix4();
translate.set(1.0, 0.0, 0.0, 1.0,
              0.0, 1.0, 0.0, 1.0,
              0.0, 0.0, 1.0, 0.0,
              0.0, 0.0, 0.0, 1.0);


let viewport = scale.clone().multiply(translate);

for (let i = 0; i < 8; ++i) {
  vertices[i].applyMatrix4(viewport);
}

/******************************************************************************
* Rasterização
*****************************************************************************/

// ---------- implementar aqui ----------------------------------------------

function MidPointLineAlgorithm(x1, y1, x2, y2) {
  var d = 0;

  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);

  var dx2 = 2 * dx;
  var dy2 = 2 * dy;

  var ix = x1 < x2 ? 1 : -1;
  var iy = y1 < y2 ? 1 : -1;

  var x = x1;
  var y = y1;

  if (dx >= dy) {
    while (true) {
      color_buffer.putPixel(x, y, [255, 0, 0]);
      if (x == x2)
        break;
      x += ix;
      d += dy2;
      if (d > dx) {
        y += iy;
        d -= dx2;
      }
    }
  } else {
    while (true) {
      color_buffer.putPixel(x, y, [255, 0, 0]);
      if (y == y2)
        break;
      y += iy;
      d += dx2;
      if (d > dy) {
        x += ix;
        d -= dy2;
      }
    }
  }
}

for (let i = 0; i < 12; i++){

  let aux = vertices[edges[i][0]];
  let aux2 = vertices[edges[i][1]];
  aux.round()
  aux2.round()
  MidPointLineAlgorithm(aux.x, aux.y, aux2.x, aux2.y);
}