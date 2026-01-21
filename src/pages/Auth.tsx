import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import conversyLogo from '@/assets/conversy-logo.png';
import { z } from 'zod';
import { motion, useScroll, useTransform } from 'framer-motion';

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

// Floating Label Input Component
const FloatingInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <motion.label
        htmlFor={id}
        initial={false}
        animate={{
          y: isActive ? -24 : 0,
          scale: isActive ? 0.75 : 1,
          color: isFocused ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.4)',
        }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
        className="absolute left-0 top-3 origin-left font-body text-base pointer-events-none"
      >
        {label}
      </motion.label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={`
          w-full bg-transparent border-0 border-b-2 px-0 py-3 text-white font-body text-base
          focus:outline-none transition-all duration-300 disabled:opacity-50
          ${isFocused ? 'border-primary shadow-[0_2px_10px_rgba(240,137,54,0.3)]' : 'border-white/10'}
        `}
      />
    </div>
  );
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get('reset') === 'true';
  const heroRef = useRef<HTMLDivElement>(null);
  
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -50]);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-screen flex">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Left Side - Hero */}
      <div 
        ref={heroRef}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-[#000000]">
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(240,137,54,0.15) 0%, transparent 70%)',
              left: `${20 + mousePosition.x * 10}%`,
              top: `${20 + mousePosition.y * 10}%`,
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(196,107,78,0.1) 0%, transparent 70%)',
              right: `${10 + mousePosition.x * 5}%`,
              bottom: `${10 + mousePosition.y * 5}%`,
            }}
            animate={{
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(241,149,94,0.08) 0%, transparent 70%)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Content with Parallax */}
        <motion.div 
          style={{ y: parallaxY }}
          className="relative z-10 flex flex-col justify-between p-12 w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img 
              src={conversyLogo} 
              alt="Conversy" 
              className="h-10 w-auto object-contain"
            />
          </motion.div>

          {/* Hero Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.h1 
              variants={itemVariants}
              className="font-display text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.1]"
            >
              Transforme seu
              <br />
              <span className="text-primary">Telegram</span> em
              <br />
              uma máquina de vendas
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="font-body text-lg text-white/50 max-w-md leading-relaxed"
            >
              A plataforma que automatiza suas vendas, pagamentos e entregas diretamente no Telegram.
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-12"
          >
            {[
              { value: '10k+', label: 'Vendas processadas' },
              { value: '500+', label: 'Negócios ativos' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="space-y-1">
                <div className="font-display text-2xl font-bold text-primary">{stat.value}</div>
                <div className="font-body text-sm text-white/30">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Decorative Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 bg-[#000000] flex items-center justify-center p-8 lg:p-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-center mb-10 lg:hidden"
          >
            <img 
              src={conversyLogo} 
              alt="Conversy" 
              className="h-10 w-auto object-contain"
            />
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-2">
              {view === 'login' && 'Acesse sua conta'}
              {view === 'signup' && 'Crie sua conta'}
              {view === 'forgot-password' && 'Recuperar senha'}
              {view === 'reset-password' && 'Nova senha'}
            </h2>
            <p className="font-body text-white/40">
              {view === 'login' && 'Entre para continuar vendendo'}
              {view === 'signup' && 'Comece a vender em minutos'}
              {view === 'forgot-password' && 'Enviaremos um link de recuperação'}
              {view === 'reset-password' && 'Defina uma senha segura'}
            </p>
          </motion.div>

          {/* Auth Tabs */}
          {(view === 'login' || view === 'signup') && (
            <motion.div variants={itemVariants} className="flex gap-1 mb-10 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => setView('login')}
                className={`flex-1 py-3 text-sm font-body rounded-md transition-all duration-300 ${
                  view === 'login'
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setView('signup')}
                className={`flex-1 py-3 text-sm font-body rounded-md transition-all duration-300 ${
                  view === 'signup'
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/40 hover:text-white/60'
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
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="login-email"
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="login-password"
                  label="Senha"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden group py-4 rounded-lg font-display font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(240,137,54,0.9) 0%, rgba(196,107,78,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(240,137,54,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="relative z-10 text-white">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Entrar'
                    )}
                  </span>
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(240,137,54,1) 0%, rgba(241,149,94,1) 100%)',
                      boxShadow: '0 0 40px rgba(240,137,54,0.4)',
                    }}
                  />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <button
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="text-sm font-body text-white/30 hover:text-primary transition-colors duration-300"
                >
                  Esqueceu sua senha?
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
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="business-name"
                  label="Nome do Negócio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="signup-email"
                  label="Email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="signup-password"
                  label="Senha"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden group py-4 rounded-lg font-display font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(240,137,54,0.9) 0%, rgba(196,107,78,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(240,137,54,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="relative z-10 text-white">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Criar Conta'
                    )}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(240,137,54,1) 0%, rgba(241,149,94,1) 100%)',
                      boxShadow: '0 0 40px rgba(240,137,54,0.4)',
                    }}
                  />
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
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="reset-email"
                  label="Email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden group py-4 rounded-lg font-display font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(240,137,54,0.9) 0%, rgba(196,107,78,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(240,137,54,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="relative z-10 text-white">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Enviar email'
                    )}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(240,137,54,1) 0%, rgba(241,149,94,1) 100%)',
                      boxShadow: '0 0 40px rgba(240,137,54,0.4)',
                    }}
                  />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-sm font-body text-white/30 hover:text-primary transition-colors duration-300"
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
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="new-password"
                  label="Nova senha"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FloatingInput
                  id="confirm-password"
                  label="Confirmar senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden group py-4 rounded-lg font-display font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(240,137,54,0.9) 0%, rgba(196,107,78,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(240,137,54,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="relative z-10 text-white">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Atualizar senha'
                    )}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(240,137,54,1) 0%, rgba(241,149,94,1) 100%)',
                      boxShadow: '0 0 40px rgba(240,137,54,0.4)',
                    }}
                  />
                </button>
              </motion.div>
            </motion.form>
          )}

          {/* Footer */}
          <motion.div 
            variants={itemVariants} 
            className="mt-12 text-center"
          >
            <p className="text-xs font-body text-white/20">
              © {new Date().getFullYear()} Conversy. Todos os direitos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
