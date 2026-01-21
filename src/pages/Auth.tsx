import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import conversyLogo from '@/assets/conversy-logo.png';
import { z } from 'zod';
import { motion } from 'framer-motion';

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

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get('reset') === 'true';
  
  const [view, setView] = useState<AuthView>(isResetMode ? 'reset-password' : 'login');
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
    document.documentElement.classList.add('dark');
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
      setView('login');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const getTitle = () => {
    switch (view) {
      case 'login':
        return 'Bem-vindo de volta';
      case 'signup':
        return 'Crie sua conta';
      case 'forgot-password':
        return 'Recuperar senha';
      case 'reset-password':
        return 'Nova senha';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login':
        return 'Entre na sua conta para continuar';
      case 'signup':
        return 'Comece sua jornada com a Conversy';
      case 'forgot-password':
        return 'Enviaremos um link para seu email';
      case 'reset-password':
        return 'Defina uma nova senha segura';
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex justify-center mb-12">
          <img 
            src={conversyLogo} 
            alt="Conversy" 
            className="h-10 w-auto object-contain opacity-90"
          />
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-2">
            {getTitle()}
          </h1>
          <p className="font-body text-[#a1a1a1] text-base">
            {getSubtitle()}
          </p>
        </motion.div>

        {/* Auth Tabs - Only show on login/signup */}
        {(view === 'login' || view === 'signup') && (
          <motion.div variants={itemVariants} className="flex mb-8 border-b border-white/10">
            <button
              onClick={() => setView('login')}
              className={`flex-1 pb-3 text-sm font-body transition-all duration-300 ${
                view === 'login'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#a1a1a1] hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setView('signup')}
              className={`flex-1 pb-3 text-sm font-body transition-all duration-300 ${
                view === 'signup'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#a1a1a1] hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </motion.div>
        )}

        {/* Login Form */}
        {view === 'login' && (
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-black font-display font-semibold py-4 text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(240,137,54,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Entrar'
                )}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="text-sm font-body text-[#a1a1a1] hover:text-primary transition-colors duration-300"
              >
                Esqueci minha senha
              </button>
            </motion.div>
          </motion.form>
        )}

        {/* Signup Form */}
        {view === 'signup' && (
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSignup}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Nome do Negócio
              </label>
              <input
                type="text"
                placeholder="Minha Loja"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-black font-display font-semibold py-4 text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(240,137,54,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Criar Conta'
                )}
              </button>
            </motion.div>
          </motion.form>
        )}

        {/* Forgot Password Form */}
        {view === 'forgot-password' && (
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleForgotPassword}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-black font-display font-semibold py-4 text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(240,137,54,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Enviar email de recuperação'
                )}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-sm font-body text-[#a1a1a1] hover:text-primary transition-colors duration-300"
              >
                ← Voltar ao login
              </button>
            </motion.div>
          </motion.form>
        )}

        {/* Reset Password Form */}
        {view === 'reset-password' && (
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleResetPassword}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Nova senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-body text-[#a1a1a1] uppercase tracking-wider">
                Confirmar senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-white font-body text-base placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors duration-300 disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-black font-display font-semibold py-4 text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(240,137,54,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Atualizar senha'
                )}
              </button>
            </motion.div>
          </motion.form>
        )}

        {/* Footer */}
        <motion.div 
          variants={itemVariants} 
          className="mt-12 text-center"
        >
          <p className="text-xs font-body text-white/30">
            © {new Date().getFullYear()} Conversy. Todos os direitos reservados.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
