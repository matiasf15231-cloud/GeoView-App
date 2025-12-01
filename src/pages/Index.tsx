import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Settings, LogOut, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Index = () => {
  const { user, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleStartAnalysis = () => {
    if (user) {
      navigate("/analysis");
    } else {
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0D0D0D] text-gray-200 overflow-hidden font-sans">
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[#00FF7F] hover:bg-[#00FF7F]/10 hover:text-[#00FF7F]">
              <Settings className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mr-2 bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                {user ? (
                  <p className="text-xs leading-none text-gray-400 truncate">
                    {user.email}
                  </p>
                ) : (
                  <p className="text-xs leading-none text-gray-400">
                    No has iniciado sesión
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#00FF7F]/20" />
            {user && (
              <>
                <DropdownMenuItem onSelect={signOut} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar Cuenta</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#00FF7F]/20" />
              </>
            )}
            <DropdownMenuItem disabled className="text-gray-400 focus:bg-[#00FF7F]/10 focus:text-gray-200">
              Idioma (Próximamente)
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#00FF7F]/10 focus:text-gray-200">
              <span>Versión</span>
              <span className="ml-auto text-xs tracking-widest text-gray-400">1.0.0</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción no se puede deshacer. Esto eliminará permanentemente tu
              cuenta y tus datos de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-gray-500 hover:bg-gray-700 text-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;