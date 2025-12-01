import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Home, Loader2, Box } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  description: string;
  volumen_3d: any[];
}

const Analysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setFileName(file.name);
        setAnalysisResult(null); // Limpiar resultado anterior al subir nueva imagen
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    const toastId = showLoading("Analizando imagen con IA...");
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { image },
      });

      if (error) throw error;

      setAnalysisResult(data);
      showSuccess("Análisis completado.");
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      showError(error.message || "Ocurrió un error durante el análisis.");
    } finally {
      dismissToast(toastId);
      setIsAnalyzing(false);
    }
  };

  if (loading || !session) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0D0D] text-gray-200 p-4 font-sans">
            <p>Cargando...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#0D0D0D] text-gray-200 p-4 font-sans overflow-y-auto">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 w-full max-w-4xl my-8">
        <Card className="bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-3xl font-bold text-[#00FF7F]">
              Análisis de Imagen de Georadar
            </CardTitle>
            <Link to="/">
                <Button variant="ghost" size="icon" className="text-[#00FF7F] hover:bg-[#00FF7F]/10 hover:text-[#00FF7F]">
                    <Home className="h-5 w-5" />
                </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-8 flex flex-col items-center">
            
            <div className="w-full max-w-lg h-80 flex items-center justify-center">
              {image ? (
                <div className="flex flex-col items-center justify-center bg-[#0D0D0D] border border-[#00FF7F]/20 rounded-lg h-full w-full p-4">
                  <img src={image} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                  <p className="text-sm text-gray-400 mt-2 truncate w-full text-center">{fileName}</p>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#00FF7F]/50 rounded-lg h-full w-full">
                  <label htmlFor="file-upload" className="cursor-pointer text-center flex flex-col items-center justify-center w-full h-full">
                    <UploadCloud className="h-12 w-12 text-[#00FF7F]" />
                    <p className="mt-2 text-lg">Arrastra y suelta o haz clic para seleccionar</p>
                    <p className="text-sm text-gray-400">PNG, JPG, etc.</p>
                    <p className="text-xs mt-4 text-gray-500">Para mejores resultados, utiliza una imagen de georadar clara.</p>
                  </label>
                  <Input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                </div>
              )}
            </div>

            <div className="text-center">
              <Button
                disabled={!image || isAnalyzing}
                onClick={handleAnalyze}
                className="bg-[#00FF7F] text-[#0D0D0D] hover:bg-[#00FF7F]/80 rounded-lg px-8 py-6 text-lg font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(0,255,127,0.4)] hover:shadow-[0_0_25px_rgba(0,255,127,0.7)] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
              >
                {isAnalyzing && <Loader2 className="h-5 w-5 animate-spin" />}
                {isAnalyzing ? "Analizando..." : "Analizar Imagen"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysisResult && (
          <Card className="mt-8 bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-2xl text-[#00FF7F]">Resultado del Análisis</CardTitle>
              <Link to="/vista3Danalisis" state={{ data: analysisResult.volumen_3d }}>
                <Button variant="outline" className="bg-transparent border-[#00FF7F]/30 hover:bg-[#00FF7F]/10 text-gray-200">
                  <Box className="mr-2 h-4 w-4" />
                  Ver en 3D
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-wrap">{analysisResult.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">Ejemplo de imagen para análisis:</p>
          <img src="/georadar-example.png" alt="Ejemplo de Georadar" className="mt-2 mx-auto h-32 w-auto opacity-75 rounded-md border border-[#00FF7F]/20" />
        </div>
      </div>
    </div>
  );
};

export default Analysis;