import { useLocation, Link } from "react-router-dom";
import Vista3D from "@/components/Vista3D";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Vista3DAnalisis = () => {
  const location = useLocation();
  const analysisData = location.state?.data || [];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0D0D] text-gray-200 p-4 font-sans relative">
       <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="absolute top-4 left-4 z-20">
        <Link to="/analysis">
          <Button variant="outline" className="bg-transparent border-[#00FF7F]/30 hover:bg-[#00FF7F]/10 text-gray-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Análisis
          </Button>
        </Link>
      </div>

      <div className="w-full h-full flex-grow flex flex-col items-center justify-center z-10">
        <h1 className="text-3xl font-bold text-[#00FF7F] mb-4">Visualización 3D del Subsuelo</h1>
        {analysisData.length > 0 ? (
          <Vista3D data={analysisData} />
        ) : (
          <div className="text-center text-gray-400">
            <p>No se encontraron objetos para visualizar.</p>
            <p className="text-sm">Intenta con otra imagen o un análisis diferente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vista3DAnalisis;