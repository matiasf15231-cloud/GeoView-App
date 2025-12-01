import { useState, useRef, useEffect } from 'react';

// Define los tipos para nuestros objetos 3D
interface Objeto3D {
  type: 'pipe' | 'cavity' | 'metal' | 'cable' | 'rock';
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
}

interface Vista3DProps {
  data: Objeto3D[];
}

// Define colores para cada tipo de objeto
const objectColors: Record<Objeto3D['type'], string> = {
  metal: 'rgba(192, 192, 192, 0.7)', // Plata
  rock: 'rgba(139, 69, 19, 0.7)',   // Marrón
  pipe: 'rgba(50, 150, 255, 0.7)',  // Azul
  cavity: 'rgba(255, 255, 0, 0.7)', // Amarillo
  cable: 'rgba(200, 100, 255, 0.9)',// Morado
};

const Vista3D = ({ data }: Vista3DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: -0.5 }); // Rotación inicial en radianes
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Manejadores de interacción del ratón
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotation(prev => ({
      x: prev.x - dy * 0.01,
      y: prev.y + dx * 0.01,
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.2, Math.min(3, prev - e.deltaY * 0.001)));
  };

  // Lógica principal de dibujado en useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar para pantallas de alta densidad (Retina)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // --- Funciones de Ayuda ---

    // Rotación de un punto 3D
    const rotate = (x: number, y: number, z: number) => {
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;
      return { x: x2, y: y1, z: z2 };
    };

    // Proyección isométrica
    const project = (x: number, y: number, z: number) => {
      const rotated = rotate(x, y, z);
      const isoX = (rotated.x - rotated.z);
      const isoY = (rotated.y + (rotated.x + rotated.z) / 2);
      return {
        x: centerX + isoX * zoom,
        y: centerY + isoY * zoom,
        depth: rotated.z,
      };
    };

    // --- Funciones de Dibujado ---

    const drawCube = (obj: Objeto3D) => {
        const { position, size } = obj;
        const w = size.width / 2;
        const h = size.height / 2;
        const d = size.depth / 2;
        
        const objX = position.x - 50;
        const objY = position.y - 50;
        const objZ = position.z - 50;

        const vertices = [
            { x: objX - w, y: objY - h, z: objZ - d }, { x: objX + w, y: objY - h, z: objZ - d },
            { x: objX + w, y: objY + h, z: objZ - d }, { x: objX - w, y: objY + h, z: objZ - d },
            { x: objX - w, y: objY - h, z: objZ + d }, { x: objX + w, y: objY - h, z: objZ + d },
            { x: objX + w, y: objY + h, z: objZ + d }, { x: objX - w, y: objY + h, z: objZ + d },
        ];

        const projected = vertices.map(v => project(v.x, v.y, v.z));

        const faces = [
            [0, 1, 2, 3], [4, 5, 6, 7], [0, 4, 7, 3], 
            [1, 5, 6, 2], [0, 1, 5, 4], [3, 2, 6, 7],
        ];

        const faceNormals = [
            { x: 0, y: 0, z: -1 }, { x: 0, y: 0, z: 1 }, { x: -1, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }, { x: 0, y: 1, z: 0 },
        ];

        const avgZ = (face: number[]) => face.reduce((sum, i) => sum + projected[i].depth, 0) / face.length;
        
        const sortedFaces = faces
            .map((face, i) => ({ face, index: i, z: avgZ(face) }))
            .sort((a, b) => b.z - a.z);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = objectColors[obj.type];

        sortedFaces.forEach(({ face, index }) => {
            const normal = rotate(faceNormals[index].x, faceNormals[index].y, faceNormals[index].z);
            if (normal.z > -0.2) { // Descarte de caras traseras (Back-face culling)
                ctx.beginPath();
                ctx.moveTo(projected[face[0]].x, projected[face[0]].y);
                for (let i = 1; i < face.length; i++) {
                    ctx.lineTo(projected[face[i]].x, projected[face[i]].y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        });
    };

    const drawSphere = (obj: Objeto3D) => {
        const { position, size } = obj;
        const p = project(position.x - 50, position.y - 50, position.z - 50);
        const radius = (size.width / 2) * zoom;

        const gradient = ctx.createRadialGradient(p.x - radius * 0.3, p.y - radius * 0.3, radius * 0.1, p.x, p.y, radius);
        gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(1, objectColors[obj.type]);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
    };
    
    const drawCylinder = (obj: Objeto3D) => {
        const { position, size } = obj;
        const x = position.x - 50;
        const y = position.y - 50;
        const z = position.z - 50;
        const w = size.width;
        const h = size.height / 2;
        
        const p1 = project(x - w/2, y, z);
        const p2 = project(x + w/2, y, z);

        ctx.strokeStyle = objectColors[obj.type].replace('0.7', '1');
        ctx.fillStyle = objectColors[obj.type];
        ctx.lineWidth = h * zoom * 2;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    };

    const drawCable = (obj: Objeto3D) => {
        const { position, size } = obj;
        const x = position.x - 50;
        const y = position.y - 50;
        const z = position.z - 50;
        const w = size.width;
        
        const p1 = project(x - w/2, y, z);
        const p2 = project(x + w/2, y, z);

        ctx.strokeStyle = objectColors.cable;
        ctx.lineWidth = 3 * zoom;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    };

    // --- Bucle Principal de Renderizado ---
    
    // Ordenar objetos de atrás hacia adelante para dibujarlos correctamente
    const sortedData = [...data].sort((a, b) => {
        const posA = rotate(a.position.x - 50, a.position.y - 50, a.position.z - 50);
        const posB = rotate(b.position.x - 50, b.position.y - 50, b.position.z - 50);
        return posA.z - posB.z;
    });

    sortedData.forEach(obj => {
        switch (obj.type) {
            case 'metal':
            case 'rock':
                drawCube(obj);
                break;
            case 'cavity':
                drawSphere(obj);
                break;
            case 'pipe':
                drawCylinder(obj);
                break;
            case 'cable':
                drawCable(obj);
                break;
        }
    });

  }, [data, rotation, zoom]);

  return (
    <div
      className="w-[90vw] h-[70vh] max-w-4xl max-h-[600px] border border-[#00FF7F]/30 bg-[#1A1A1A] rounded-lg cursor-grab active:cursor-grabbing touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Vista3D;