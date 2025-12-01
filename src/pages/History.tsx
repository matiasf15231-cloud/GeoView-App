import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Box, Loader2 } from "lucide-react";

interface AnalysisRecord {
  id: string;
  created_at: string;
  file_name: string;
  image_url: string;
  description: string;
  volumen_3d: any[];
}

const History = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAnalyses(data || []);
      } catch (error) {
        console.error("Error fetching analyses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#0D0D0D] text-gray-200 p-4 font-sans">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 w-full max-w-5xl my-8">
        <Card className="bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-bold text-[#00FF7F]">
              Historial de Análisis
            </CardTitle>
            <Link to="/analysis">
              <Button variant="outline" className="bg-transparent border-[#00FF7F]/30 hover:bg-[#00FF7F]/10 text-gray-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Análisis
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-[#00FF7F] animate-spin" />
              </div>
            ) : analyses.length === 0 ? (
              <p className="text-center text-gray-400 h-64 flex items-center justify-center">
                No has realizado ningún análisis todavía.
              </p>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                  {analyses.map((analysis) => (
                    <Card key={analysis.id} className="bg-[#0D0D0D] border-[#00FF7F]/20 flex flex-col">
                      <CardHeader>
                        <img src={analysis.image_url} alt={analysis.file_name} className="rounded-md aspect-video object-cover border border-gray-700" />
                        <CardTitle className="text-lg pt-2 truncate">{analysis.file_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-gray-400 line-clamp-3">{analysis.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">{new Date(analysis.created_at).toLocaleString()}</p>
                        <Link to="/vista3Danalisis" state={{ data: analysis.volumen_3d }}>
                          <Button variant="outline" size="sm" className="bg-transparent border-[#00FF7F]/30 hover:bg-[#00FF7F]/10 text-gray-200">
                            <Box className="mr-2 h-4 w-4" />
                            Ver 3D
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;