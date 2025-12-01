import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

// Mapeo de tipos de objeto a colores
const colorMap: { [key: string]: THREE.ColorRepresentation } = {
  tubería: "#C0C0C0", // Plata
  vacío: "#000000",   // Negro
  roca: "#8B4513",    // Marrón
  metal: "#FFD700",   // Oro
  default: "#FF00FF", // Magenta para tipos desconocidos
};

const Object3D = ({ data }: { data: any }) => {
  const { forma, posicion, dimensiones, rotacion, tipo } = data;
  const color = colorMap[tipo] || colorMap.default;

  let geometry;
  switch (forma) {
    case "cilindro":
      geometry = <cylinderGeometry args={[dimensiones.radio, dimensiones.radio, dimensiones.altura, 32]} />;
      break;
    case "esfera":
      geometry = <sphereGeometry args={[dimensiones.radio, 32, 32]} />;
      break;
    case "cubo":
      geometry = <boxGeometry args={[dimensiones.ancho, dimensiones.alto, dimensiones.profundidad]} />;
      break;
    default:
      return null;
  }

  return (
    <mesh position={[posicion.x, posicion.y, posicion.z]} rotation={[rotacion.x, rotacion.y, rotacion.z]}>
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const ThreeDViewer = ({ analysisData }: { analysisData: any }) => {
  if (!analysisData || !analysisData.volumen_3d) return null;

  const { terreno, objetos } = analysisData.volumen_3d;

  return (
    <div className="w-full h-full rounded-lg bg-[#0D0D0D] border border-[#00FF7F]/20">
      <Canvas camera={{ position: [0, 80, 120], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 5]} intensity={1} />
        
        {/* Terreno */}
        <mesh position={[terreno.posicion.x, terreno.posicion.y - 5, terreno.posicion.z]}>
          <boxGeometry args={[terreno.dimensiones.ancho, terreno.dimensiones.alto, terreno.dimensiones.profundidad]} />
          <meshStandardMaterial color="#4A2E2E" opacity={0.2} transparent />
        </mesh>

        {/* Objetos detectados */}
        {objetos.map((obj: any) => (
          <Object3D key={obj.id} data={obj} />
        ))}

        <Grid infiniteGrid sectionColor={"#00FF7F"} sectionSize={50} fadeDistance={150} />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ThreeDViewer;