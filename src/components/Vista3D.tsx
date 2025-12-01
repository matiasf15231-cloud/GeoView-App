import { useState, useRef, useEffect } from 'react';

interface Objeto3D {
  type: 'pipe' | 'cavity' | 'metal' | 'cable' | 'rock';
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
}

interface Vista3DProps {
  data: Objeto3D[];
}

const objectColors: Record<Objeto3D['type'], string> = {
  metal: 'rgba(255, 77, 77, 0.7)', // Rojo
  rock: 'rgba(128, 128, 128, 0.7)', // Gris
  pipe: 'rgba(50, 150, 255, 0.7)', // Azul
  cavity: 'rgba(255, 255, 0, 0.7)', // Amarillo
  cable: 'rgba(200, 100, 255, 0.9)', // Morado para cables
};

const Vista3D = ({ data }: Vista3DProps) => {
  const [rotation, setRotation] = useState({ x: -25, y: 35 });
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
    setRotation(prev => ({
      x: prev.x - dy * 0.5,
      y: prev.y + dx * 0.5,
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setZoom(prev => Math.max(0.2, Math.min(3, prev - e.deltaY * 0.001)));
  };
  
  // Limpiar el mouse up por si se suelta fuera del componente
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const renderObject = (obj: Objeto3D, index: number) => {
    const { type, position, size } = obj;
    const color = objectColors[type] || 'rgba(255, 255, 255, 0.7)';
    const style = {
      '--x': `${position.x}%`,
      '--y': `${position.y}%`,
      '--z': `${position.z}%`,
      '--w': `${size.width}%`,
      '--h': `${size.height}%`,
      '--d': `${size.depth}%`,
      '--color': color,
      '--border-color': color.replace('0.7', '1'),
    } as React.CSSProperties;

    // Simulación de formas con divs y CSS
    if (type === 'metal' || type === 'rock') { // Cubo
      return <div key={index} className="absolute w-[var(--w)] h-[var(--h)]" style={{...style, transform: `translateX(-50%) translateY(-50%) translate3d(var(--x), var(--y), var(--z))`}}>
        <div className="absolute inset-0 bg-[var(--color)] border border-[var(--border-color)]" style={{transform: `translateZ(calc(var(--d) / 2 * 1px))`}}></div>
        <div className="absolute inset-0 bg-[var(--color)] border border-[var(--border-color)] opacity-80" style={{transform: `rotateY(180deg) translateZ(calc(var(--d) / 2 * 1px))`}}></div>
      </div>
    }
    if (type === 'cavity') { // Esfera
        return <div key={index} className="absolute rounded-full" style={{...style, width: `var(--w)`, height: `var(--w)`, background: `radial-gradient(circle at 30% 30%, ${color}, #000)`, transform: `translateX(-50%) translateY(-50%) translate3d(var(--x), var(--y), var(--z))`}} />
    }
    if (type === 'pipe' || type === 'cable') { // Cilindro/Línea
        return <div key={index} className="absolute bg-[var(--color)] border-y border-[var(--border-color)]" style={{...style, width: `var(--w)`, height: `var(--h)`, transform: `translateX(-50%) translateY(-50%) translate3d(var(--x), var(--y), var(--z))`}} />
    }
    return null;
  };

  return (
    <div
      className="w-[90vw] h-[70vh] max-w-4xl max-h-[600px] border border-[#00FF7F]/30 bg-[#1A1A1A] rounded-lg cursor-grab active:cursor-grabbing"
      style={{ perspective: '1000px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="w-full h-full transition-transform duration-100 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Contenedor del volumen del suelo (cubo wireframe) */}
        <div className="absolute w-full h-full" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(-50px)' }}>
            {/* Renderizar objetos */}
            <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(50px)' }}>
                {data.map(renderObject)}
            </div>
            {/* Grid del suelo para referencia */}
            <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#00FF7F]/30" style={{transform: 'rotateX(90deg) translateZ(150px)'}}></div>
            <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#00FF7F]/30" style={{transform: 'rotateX(90deg) translateZ(-150px)'}}></div>
        </div>
      </div>
    </div>
  );
};

export default Vista3D;