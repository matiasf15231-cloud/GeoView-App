import { useLocation, Link } from "react-router-dom";
import Vista3D from "@/components/Vista3D";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, HelpCircle, Layers, Maximize, Ruler } from "lucide-react";

// Mapeo de tipos a traducciones y colores para el panel
const objectDetails = {
  pipe: { name: "Tubería", color: "bg-blue-500" },
  cavity: { name: "Cavidad", color: "bg-yellow-400" },
  metal: { name: "Objeto Metálico", color: "bg-red-500" },
  cable: { name: "Cable", color: "bg-green-500" },
  rock: { name: "Roca / Objeto Denso", color: "bg-gray-500" },
  anomaly: { name: "Anomalía", color: "bg-gray-400" },
};

const Vista3DAnalisis = () => {
  const location = useLocation();
  // Aseguramos que siempre sea un array, incluso si no hay datos
  const analysisData = location.state?.data || [];
  const MAX_DEPTH_METERS = 5; // Asumimos una profundidad máxima para el cálculo

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0D0D0D] text-gray-200 font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <header className="relative z-20 flex items-center justify-between p-4 border-b border-[#00FF7F]/20">
        <h1 className="text-2xl font-bold text-[#00FF7F]">Visualización 3D del Subsuelo</h1>
        <Link to="/analysis">
          <Button variant="outline" className="bg-transparent border-[#00FF7F]/30 hover:bg-[#00FF7F]/10 text-gray-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Análisis
          </Button>
        </Link>
      </header>

      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4 z-10">
        <div className="flex-grow flex items-center justify-center md:w-2/3">
          {analysisData.length > 0 ? (
            <Vista3D data={analysisData} maxDepth={MAX_DEPTH_METERS} />
          ) : (
            <div className="text-center text-gray-400 bg-[#1A1A1A] border border-[#00FF7F]/20 rounded-lg p-8">
              <p className="text-xl font-semibold">No se encontraron objetos para visualizar.</p>
              <p className="text-sm mt-2">Intenta con otra imagen o un análisis diferente.</p>
            </div>
          )}
        </div>
        
        <aside className="w-full md:w-1/3">
          <Card className="bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl text-[#00FF7F]">Resumen del Análisis</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-300 mb-3">Leyenda de Colores</h4>
                <div className="space-y-2">
                  {Object.values(objectDetails).map((detail) => (
                    <div key={detail.name} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${detail.color}`}></div>
                      <span className="text-sm text-gray-300">{detail.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="my-4 bg-[#00FF7F]/20" />
              {analysisData.length > 0 ? (
                <ScrollArea className="flex-grow h-0">
                  <div className="space-y-4 pr-4">
                    {analysisData.map((item: any, index: number) => {
                      const details = objectDetails[item.type as keyof typeof objectDetails] || objectDetails.anomaly;
                      const depth = (item.position.y / 100) * MAX_DEPTH_METERS;
                      return (
                        <div key={index} className="p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${details.color}`}></span>
                            <h3 className="font-bold text-gray-100">{details.name}</h3>
                          </div>
                          <div className="mt-2 text-sm text-gray-400 space-y-1 pl-6">
                            <p className="flex items-center"><Layers className="w-4 h-4 mr-2 text-[#00FF7F]/70" /> Profundidad: {depth.toFixed(1)} m</p>
                            <p className="flex items-center"><Ruler className="w-4 h-4 mr-2 text-[#00FF7F]/70" /> Tamaño: ~{item.size.width}x{item.size.height}x{item.size.depth} cm</p>
                            <p className="flex items-center"><Maximize className="w-4 h-4 mr-2 text-[#00FF7F]/70" /> Posición: (X: {item.position.x}, Z: {item.position.z})</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                 <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center flex-grow">
                    <HelpCircle className="w-10 h-10 mb-4"/>
                    <p>Los detalles de los objetos detectados aparecerán aquí.</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default Vista3DAnalisis;