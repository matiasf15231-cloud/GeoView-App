import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    if (user) {
      navigate("/analysis");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0D0D] text-gray-200 overflow-hidden font-sans">
      {/* Fondo sutil de grid tipo radar */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 text-center p-4">
        <h1
          className="text-7xl md:text-9xl font-bold text-[#00FF7F] tracking-wider"
        >
          GeoView
        </h1>

        <p className="mt-4 text-xl md:text-2xl text-gray-300">
          Interpreta imágenes de Georadar con Inteligencia Artificial
        </p>

        <p className="mt-6 max-w-2xl mx-auto text-gray-400">
          La aplicación mejora imágenes de georadar, identifica objetos y genera
          un modelo 3D simple del subsuelo.
        </p>

        <div className="mt-10">
          <Button
            onClick={handleStartAnalysis}
            className="bg-transparent border-2 border-[#00FF7F] text-[#00FF7F] hover:bg-[#00FF7F] hover:text-[#0D0D0D] rounded-lg px-8 py-6 text-lg font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(0,255,127,0.4)] hover:shadow-[0_0_25px_rgba(0,255,127,0.7)]"
          >
            Comenzar análisis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;