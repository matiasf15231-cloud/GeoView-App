import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface ObjectDimensions {
  radius?: number;
  height?: number;
  orientation?: 'horizontal-x' | 'horizontal-z' | 'vertical';
  size?: [number, number, number];
  points?: [number, number, number][];
}

interface DetectedObject {
  type: 'tuberia' | 'cavidad' | 'metalico' | 'cable';
  position: [number, number, number];
  dimensions: ObjectDimensions;
  material?: string;
}

interface ThreeDViewerProps {
  data: DetectedObject[];
}

const materialColors: { [key: string]: THREE.ColorRepresentation } = {
  metal: '#ff4d4d',      // Rojo
  roca: '#808080',      // Gris
  pvc: '#4d4dff',       // Azul
  vacio: '#ffff4d',     // Amarillo
  default: '#ffffff',
};

const Object3D = ({ obj }: { obj: DetectedObject }) => {
  const color = materialColors[obj.material || 'default'] || materialColors.default;
  const position = new THREE.Vector3(...obj.position);

  switch (obj.type) {
    case 'tuberia': {
      const { radius = 0.1, height = 1, orientation = 'horizontal-x' } = obj.dimensions;
      const rotation: [number, number, number] = 
        orientation === 'horizontal-x' ? [0, 0, Math.PI / 2] :
        orientation === 'horizontal-z' ? [Math.PI / 2, 0, 0] :
        [0, 0, 0];
      return (
        <Cylinder args={[radius, radius, height, 32]} position={position} rotation={rotation}>
          <meshStandardMaterial color={color} />
        </Cylinder>
      );
    }
    case 'cavidad': {
      const { radius = 0.5 } = obj.dimensions;
      return (
        <Sphere args={[radius, 32, 32]} position={position}>
          <meshStandardMaterial color={color} />
        </Sphere>
      );
    }
    case 'metalico': {
      const { size = [1, 1, 1] } = obj.dimensions;
      return (
        <Box args={size} position={position}>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </Box>
      );
    }
    case 'cable': {
        const { points = [] } = obj.dimensions;
        if (points.length < 2) return null;
        const vecPoints = points.map(p => new THREE.Vector3(...p));
        return <Line points={vecPoints} color={color} lineWidth={3} />;
    }
    default:
      return null;
  }
};

export const ThreeDViewer = ({ data }: ThreeDViewerProps) => {
  return (
    <div className="w-full h-full bg-[#0D0D0D] rounded-lg">
      <Canvas camera={{ position: [10, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Box args={[10, 10, 10]} position={[0, -5, 0]}>
          <meshStandardMaterial color="#00FF7F" transparent opacity={0.1} />
        </Box>
        <gridHelper args={[10, 10]} />

        {data.map((obj, index) => (
          <Object3D key={index} obj={obj} />
        ))}

        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
    </div>
  );
};