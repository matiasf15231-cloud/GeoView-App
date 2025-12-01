import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, LogOut, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import ThreeDViewer from "@/components/ThreeDViewer";

type ToastState = {
  type: 'error';
  message: string;
} | null;

const Analysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const { user, session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (toast) {
      if (toast.type === 'error') {
        showError(toast.message);
      }
      setToast(null);
    }
  }, [toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setFileName(file.name);
        setAnalysisResult(null);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const { data, error } = await supabase.functions.invoke('interpret-georadar', {
        body: { image },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
    } catch (err: any) {
      const errorMessage = err.message || "Ocurrió un error desconocido durante el análisis.";
      setAnalysisError(errorMessage);
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setFileName("");
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  if (loading || !session) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0D0D] text-gray-200 p-4 font-sans">
            <Loader2 className="h-8 w-8 animate-spin text-[#00FF7F]" />
            <p className="mt-2">Cargando...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D] text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <Card className="bg-[#1A1A1A]/80 backdrop-blur-sm border-[#00FF7F]/20 text-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-[#00FF7F]">
              Análisis de Georadar
            </CardTitle>
            <div className="flex items-center gap-2 sm:gap-4">
                <p className="text-sm text-gray-400 hidden md:block">{user?.email}</p>
                <Button onClick={signOut} variant="ghost" size="icon" className="text-[#00FF7F] hover:bg-[#00FF7F]/10 hover:text-[#00FF7F]">
                    <LogOut className="h-5 w-5" />
                </Button>
                <Link to="/">
                    <Button variant="ghost" className="text-[#00FF7F] hover:bg-[#00FF7F]/10 hover:text-[#00FF7F] hidden sm:flex">
                        Inicio
                    </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="space-y-8 flex flex-col items-center">
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
                      </label>
                      <Input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Button
                    disabled={!image || isLoadingAnalysis}
                    onClick={handleAnalyze}
                    className="bg-[#00FF7F] text-[#0D0D0D] hover:bg-[#00FF7F]/80 rounded-lg px-8 py-6 text-lg font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(0,255,127,0.4)] hover:shadow-[0_0_25px_rgba(0,255,127,0.7)] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isLoadingAnalysis ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                    {isLoadingAnalysis ? "Analizando..." : "Analizar Imagen"}
                  </Button>
                  {analysisError && (
                    <div className="mt-4 text-red-400 flex items-center justify-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      <p>{analysisError}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Button onClick={resetAnalysis} variant="outline" className="mb-4 bg-transparent border-[#00FF7F]/30 hover:bg-[#00FF7F]/10 text-gray-200">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Analizar otra imagen
                </Button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#0D0D0D] border-[#00FF7F]/20">
                      <CardHeader><CardTitle className="text-[#00FF7F]">Visualización 3D</CardTitle></CardHeader>
                      <CardContent className="h-[400px] lg:h-[500px]">
                        <ThreeDViewer analysisData={analysisResult} />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-[#0D0D0D] border-[#00FF7F]/20">
                      <CardHeader><CardTitle className="text-[#00FF7F]">Imagen Original</CardTitle></CardHeader>
                      <CardContent>
                        <img src={image!} alt="Georadar original" className="rounded-md w-full" />
                      </CardContent>
                    </Card>
                    <Card className="bg-[#0D0D0D] border-[#00FF7F]/20">
                      <CardHeader><CardTitle className="text-[#00FF7F]">Objetos Detectados</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysisResult.objetos_detectados.map((obj: any, index: number) => (
                            <li key={index} className="text-gray-300 border-b border-[#00FF7F]/10 pb-2">
                              <p className="font-semibold capitalize">{obj.tipo}</p>
                              <p className="text-sm text-gray-400">{obj.descripcion_simple} a ~{obj.profundidad_estimada_cm} cm de profundidad.</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;