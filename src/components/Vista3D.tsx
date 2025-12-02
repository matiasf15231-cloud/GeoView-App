import { useState, useRef, useEffect } from 'react';

interface Objeto3D {
  type: 'pipe' | 'cavity' | 'metal' | 'cable' | 'rock' | string; // Acepta otros strings para 'anomaly'
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
}

interface Vista3DProps {
  data: Objeto3D[];
  maxDepth: number;
}

const objectColors: Record<string, { fill: string; stroke: string; label: string }> = {
  metal: { fill: 'rgba(255, 50, 50, 0.7)', stroke: '#FFFFFF', label: 'Metal' },
  rock: { fill: 'rgba(100, 100, 100, 0.8)', stroke: '#333333', label: 'Roca/Denso' },
  pipe: { fill: 'rgba(50, 100, 255, 0.75)', stroke: '#FFFFFF', label: 'Tubería' },
  cavity: { fill: 'rgba(255, 255, 0, 0.7)', stroke: '#333333', label: 'Cavidad' },
  cable: { fill: 'rgba(0, 255, 127, 0.9)', stroke: '#FFFFFF', label: 'Cable' },
  anomaly: { fill: 'rgba(150, 150, 150, 0.6)', stroke: '#FFFFFF', label: 'Anomalía' },
};

const Vista3D = ({ data, maxDepth }: Vista3DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.6, y: -0.6 });
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotation(prev => ({ x: prev.x - dy * 0.01, y: prev.y + dx * 0.01 }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.01, Math.min(5, prev - e.deltaY * 0.001)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const sceneSize = Math.min(width, height) * 0.4;

    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const rotate = (x: number, y: number, z: number) => {
      const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
      const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
      const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
      const x2 = x * cosY + z1 * sinY, z2 = -x * sinY + z1 * cosY;
      return { x: x2, y: y1, z: z2 };
    };

    const project = (x: number, y: number, z: number) => {
      const rotated = rotate(x, y, z);
      const scale = sceneSize * zoom;
      return {
        x: centerX + (rotated.x - rotated.z) * 0.707 * scale,
        y: centerY + (rotated.y + (rotated.x + rotated.z) / 2) * 0.707 * scale,
        depth: rotated.z,
      };
    };

    const drawPath = (points: {x: number, y: number}[]) => {
        if (points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
    };

    const drawCube = (obj: Objeto3D) => {
        const { position, size } = obj;
        const scale = 3; // Exaggeration factor
        const w = size.width / 2 * scale, h = size.height / 2 * scale, d = size.depth / 2 * scale;
        const x = (position.x - 50), y = (position.y - 50), z = (position.z - 50);

        const vertices = [
            {x:x-w, y:y-h, z:z-d}, {x:x+w, y:y-h, z:z-d}, {x:x+w, y:y+h, z:z-d}, {x:x-w, y:y+h, z:z-d},
            {x:x-w, y:y-h, z:z+d}, {x:x+w, y:y-h, z:z+d}, {x:x+w, y:y+h, z:z+d}, {x:x-w, y:y+h, z:z+d}
        ];
        const projected = vertices.map(v => project(v.x, v.y, v.z));
        const faces = [[0,1,2,3], [4,5,6,7], [0,4,7,3], [1,5,6,2], [0,1,5,4], [3,2,6,7]];
        const faceNormals = [{x:0,y:0,z:-1}, {x:0,y:0,z:1}, {x:-1,y:0,z:0}, {x:1,y:0,z:0}, {x:0,y:-1,z:0}, {x:0,y:1,z:0}];
        
        const sortedFaces = faces.map((face, i) => {
            const avgZ = face.reduce((sum, idx) => sum + projected[idx].depth, 0) / face.length;
            return { face, index: i, z: avgZ };
        }).sort((a, b) => b.z - a.z);

        const colors = objectColors[obj.type] || objectColors.anomaly;
        ctx.fillStyle = colors.fill;
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = 2;

        sortedFaces.forEach(({ face, index }) => {
            const normal = rotate(faceNormals[index].x, faceNormals[index].y, faceNormals[index].z);
            if (normal.z > -0.3) {
                drawPath(face.map(i => projected[i]));
                ctx.fill();
                ctx.stroke();
            }
        });
    };
    
    const drawLabel = (obj: Objeto3D) => {
        const { position, size } = obj;
        const y = (position.y - 50) + size.height * 2; // Position label above object
        const p = project((position.x - 50), y, (position.z - 50));
        const depthM = (position.y / 100) * maxDepth;
        const colors = objectColors[obj.type] || objectColors.anomaly;
        const text = `${colors.label} (~${depthM.toFixed(1)}m)`;

        ctx.font = "bold 14px sans-serif";
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(p.x - textWidth / 2 - 5, p.y - 18, textWidth + 10, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(text, p.x, p.y);
    };

    const drawDepthLines = () => {
        ctx.strokeStyle = 'rgba(0, 255, 127, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = -50 + (i * 25); // from -50 to 50
            const p1 = project(-50, y, -50);
            const p2 = project(50, y, -50);
            const p3 = project(50, y, 50);
            const p4 = project(-50, y, 50);
            drawPath([p1, p2, p3, p4]);
            ctx.stroke();
        }
    };

    // --- Render Loop ---
    drawDepthLines();
    const sortedData = [...data].sort((a, b) => {
        const posA = rotate(a.position.x - 50, a.position.y - 50, a.position.z - 50);
        const posB = rotate(b.position.x - 50, b.position.y - 50, b.position.z - 50);
        return posA.z - posB.z;
    });

    const elementsToRender = [...sortedData.map(obj => ({...obj, type: 'object'})), ...sortedData.map(obj => ({...obj, type: 'label'}))];
    elementsToRender.sort((a, b) => {
        const posA = project(a.position.x - 50, a.position.y - 50, a.position.z - 50);
        const posB = project(b.position.x - 50, b.position.y - 50, b.position.z - 50);
        if (a.type === 'label') posA.depth += 1000; // Render labels on top
        if (b.type === 'label') posB.depth += 1000;
        return posB.depth - posA.depth;
    });

    elementsToRender.forEach(el => {
        if (el.type === 'label') {
            drawLabel(el);
        } else {
            // Aquí podrías añadir lógica para otras formas (esfera, cilindro)
            // Por simplicidad, usamos cubos para todos por ahora.
            drawCube(el);
        }
    });

  }, [data, rotation, zoom, maxDepth]);

  return (
    <div
      className="w-full h-full border border-[#00FF7F]/30 bg-[#1A1A1A]/80 rounded-lg cursor-grab active-cursor-grabbing touch-none"
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