import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/analysis');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0D0D0D] p-4">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,255,127,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,127,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="relative z-10 w-full max-w-md">
            <Card className="bg-[#1A1A1A] border-[#00FF7F]/20 text-gray-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-[#00FF7F]">
                        Iniciar Sesión o Registrarse
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        providers={['google']}
                        theme="dark"
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'Correo electrónico',
                                    password_label: 'Contraseña',
                                    email_input_placeholder: 'Tu correo electrónico',
                                    password_input_placeholder: 'Tu contraseña',
                                    button_label: 'Iniciar sesión',
                                    social_provider_text: 'Iniciar sesión con {{provider}}',
                                    link_text: '¿Ya tienes una cuenta? Inicia sesión',
                                },
                                sign_up: {
                                    email_label: 'Correo electrónico',
                                    password_label: 'Contraseña',
                                    email_input_placeholder: 'Tu correo electrónico',
                                    password_input_placeholder: 'Crea una contraseña',
                                    button_label: 'Registrarse',
                                    social_provider_text: 'Registrarse con {{provider}}',
                                    link_text: '¿No tienes una cuenta? Regístrate',
                                },
                                forgotten_password: {
                                    email_label: 'Correo electrónico',
                                    email_input_placeholder: 'Tu correo electrónico',
                                    button_label: 'Enviar instrucciones',
                                    link_text: '¿Olvidaste tu contraseña?',
                                },
                            },
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default Login;