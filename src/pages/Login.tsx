"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { JSX, SVGProps, useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

const Logo = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
    <svg
      fill="currentColor"
      height="48"
      viewBox="0 0 40 48"
      width="40"
      {...props}
      className="text-[#00FF7F]"
    >
      <clipPath id="a">
        <path d="m0 0h40v48h-40z" />
      </clipPath>
      <g clipPath="url(#a)">
        <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
        <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
        <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
        <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
        <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
        <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
      </g>
    </svg>
);

const GoogleIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.84-4.84 1.84-5.84 0-10.62-4.7-10.62-10.52s4.78-10.52 10.62-10.52c3.36 0 5.64 1.44 6.96 2.64l2.32-2.32C19.82 1.29 16.71 0 12.48 0 5.8 0 0 5.6 0 12.32s5.8 12.32 12.48 12.32c6.96 0 12-4.82 12-11.92 0-.8-.08-1.6-.22-2.4H12.48z" />
    </svg>
);

export default function Login() {
  const { session, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) {
      navigate('/analysis');
    }
  }, [session, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUpWithEmail(email, password, { firstName, lastName });
    } else {
      await signInWithEmail(email, password);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D] p-4">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <div className="w-full max-w-md z-10">
        <Card className="bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200 shadow-lg shadow-[#00FF7F]/10">
          <CardHeader className="flex flex-col items-center space-y-2 pt-6">
            <Link to="/"><Logo className="w-12 h-12" /></Link>
            <div className="space-y-1 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-100">
                {isSignUp ? "Crear una cuenta" : "Iniciar Sesión"}
              </h2>
              <p className="text-gray-400 text-sm">
                {isSignUp ? "¡Bienvenido! Comencemos." : "¡Bienvenido de nuevo!"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pt-4">
            <Button variant="outline" className="w-full bg-transparent border-[#00FF7F]/30 hover:bg-[#00FF7F]/10 text-gray-200" onClick={signInWithGoogle}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continuar con Google
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#00FF7F]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#1A1A1A] px-2 text-gray-400">O continuar con</span>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">Nombre</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="bg-[#0D0D0D] border-[#00FF7F]/30 text-gray-200 focus:ring-[#00FF7F]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Apellido</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="bg-[#0D0D0D] border-[#00FF7F]/30 text-gray-200 focus:ring-[#00FF7F]" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Correo electrónico</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#0D0D0D] border-[#00FF7F]/30 text-gray-200 focus:ring-[#00FF7F]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 bg-[#0D0D0D] border-[#00FF7F]/30 text-gray-200 focus:ring-[#00FF7F]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:bg-transparent hover:text-[#00FF7F]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button className="w-full bg-[#00FF7F] text-[#0D0D0D] hover:bg-[#00FF7F]/80 font-bold shadow-[0_0_10px_rgba(0,255,127,0.3)] hover:shadow-[0_0_15px_rgba(0,255,127,0.5)] transition-shadow">
                {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-[#00FF7F]/20 !py-4">
            <p className="text-center text-sm text-gray-400">
              {isSignUp ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-[#00FF7F] hover:underline">
                {isSignUp ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}