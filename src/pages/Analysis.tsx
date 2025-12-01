import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileImage } from "lucide-react";
import { Link } from "react-router-dom";

const Analysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0D0D] text-gray-200 p-4 font-sans">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <div className="relative z-10 w-full max-w-4xl">
        <Card className="bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-bold text-center text-[#00FF7F]">
              Análisis de Imagen de Georadar
            </CardTitle>
            <Link to="/">
              <Button variant="ghost" className="text-[#00FF7F] hover:bg-[#00FF7F]/10 hover:text-[#00FF7F]">
                Volver al inicio
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#00FF7F]/50 rounded-lg h-80">
                <label htmlFor="file-upload" className="cursor-pointer text-center flex flex-col items-center justify-center w-full h-full">
                  <UploadCloud className="h-12 w-12 text-[#00FF7F]" />
                  <p className="mt-2 text-lg">Arrastra y suelta o haz clic para seleccionar</p>
                  <p className="text-sm text-gray-400">PNG, JPG, etc.</p>
                </label>
                <Input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="flex flex-col items-center justify-center bg-[#0D0D0D] border border-[#00FF7F]/20 rounded-lg h-80 p-4">
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                    <p className="text-sm text-gray-400 mt-2 truncate w-full text-center">{fileName}</p>
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <FileImage className="mx-auto h-12 w-12" />
                    <p className="mt-2">Vista previa de la imagen</p>
                    <p className="text-xs mt-4">Para mejores resultados, utiliza una imagen de georadar clara.</p>
                     <img src="/georadar-example.png" alt="Ejemplo de Georadar" className="mt-4 mx-auto h-20 w-auto opacity-50 rounded-md" />
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <Button
                disabled={!image}
                className="bg-[#00FF7F] text-[#0D0D0D] hover:bg-[#00FF7F]/80 rounded-lg px-8 py-6 text-lg font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(0,255,127,0.4)] hover:shadow-[0_0_25px_rgba(0,255,127,0.7)] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Analizar Imagen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;