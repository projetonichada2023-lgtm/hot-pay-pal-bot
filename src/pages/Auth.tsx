import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot, Zap, ArrowLeft, Mail } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  businessName: z.string().min(2, 'Nome do negócio deve ter no mínimo 2 caracteres'),
});

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type AuthView = 'auth' | 'forgot-password' | 'reset-password';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get('reset') === 'true';
  
  const [view, setView] = useState<AuthView>(isResetMode ? 'reset-password' : 'auth');
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Apply dark mode on auth page
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (user && !isResetMode) {
      navigate('/dashboard');
    }
  }, [user, navigate, isResetMode]);

  useEffect(() => {
    if (isResetMode) {
      setView('reset-password');
    }
  }, [isResetMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ 
      email: signupEmail, 
      password: signupPassword,
      businessName 
    });
    
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, businessName);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message.includes('already registered') 
          ? 'Este email já está cadastrado' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Bem-vindo à plataforma!',
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse({ email: resetEmail });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      setResetEmail('');
      setView('auth');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = passwordSchema.safeParse({ password: newPassword });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(newPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi alterada com sucesso.',
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md glass-card animate-fade-in relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-hot flex items-center justify-center glow-hot">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="gradient-text">Conversy</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {view === 'forgot-password' && 'Recupere sua senha'}
            {view === 'reset-password' && 'Defina sua nova senha'}
            {view === 'auth' && 'Sua plataforma de pagamentos via Telegram'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {view === 'auth' && (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-hot glow-hot" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Entrar
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-muted-foreground"
                    onClick={() => setView('forgot-password')}
                  >
                    Esqueci minha senha
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nome do Negócio</Label>
                    <Input
                      id="business-name"
                      type="text"
                      placeholder="Minha Loja"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-hot glow-hot" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full gradient-hot glow-hot" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Enviar email de recuperação
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setView('auth')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </Button>
            </form>
          )}

          {view === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full gradient-hot glow-hot" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Atualizar senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
