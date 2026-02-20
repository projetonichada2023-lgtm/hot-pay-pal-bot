import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Users, TrendingUp } from 'lucide-react';
import conversyLogo from '@/assets/conversy-logo.png';
import { z } from 'zod';
import { motion, useScroll, useTransform } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

type AuthView = 'login' | 'signup' | 'forgot-password';

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

const AffiliateAuth = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const heroRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { signIn, signUpAffiliate, user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -50]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (user) {
      const redirectPath = refCode ? `/affiliate?ref=${refCode}` : '/affiliate';
      navigate(redirectPath);
    }
  }, [user, navigate, refCode]);

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
      toast({ title: 'Erro de validação', description: validation.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = signupSchema.safeParse({ email: signupEmail, password: signupPassword });
    if (!validation.success) {
      toast({ title: 'Erro de validação', description: validation.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signUpAffiliate(signupEmail, signupPassword);
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message.includes('already registered') ? 'Este email já está cadastrado' : error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Conta criada!', description: 'Verifique seu email para confirmar o cadastro.' });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = emailSchema.safeParse({ email: resetEmail });
    if (!validation.success) {
      toast({ title: 'Erro de validação', description: validation.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email enviado!', description: 'Verifique sua caixa de entrada para redefinir sua senha.' });
      setResetEmail('');
      setView('login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div className="min-h-screen flex">
      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Left Side - Affiliate Hero */}
      <div ref={heroRef} className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#000000]">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(240,137,54,0.15) 0%, transparent 70%)',
              left: `${20 + mousePosition.x * 10}%`,
              top: `${20 + mousePosition.y * 10}%`,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(196,107,78,0.1) 0%, transparent 70%)',
              right: `${10 + mousePosition.x * 5}%`,
              bottom: `${10 + mousePosition.y * 5}%`,
            }}
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(241,149,94,0.08) 0%, transparent 70%)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div style={{ y: parallaxY }} className="relative z-10 flex flex-col justify-between p-12 w-full">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <img src={conversyLogo} alt="Conversy" className="h-10 w-auto object-contain" />
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-body text-primary">Programa de Afiliados</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-display text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Ganhe <span className="text-primary">comissões</span>
              <br />
              divulgando a
              <br />
              Conversy
            </motion.h1>
            <motion.p variants={itemVariants} className="font-body text-lg text-white/50 max-w-md leading-relaxed">
              Cadastre-se no programa de afiliados e receba comissões por cada venda realizada através dos seus links.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex gap-12">
            {[
              { value: 'R$ 50k+', label: 'Pagos em comissões', icon: DollarSign },
              { value: '200+', label: 'Afiliados ativos', icon: Users },
              { value: '10%', label: 'Comissão base', icon: TrendingUp },
            ].map((stat, index) => (
              <div key={index} className="space-y-1">
                <div className="font-display text-2xl font-bold text-primary flex items-center gap-2">
                  <stat.icon className="w-5 h-5" />
                  {stat.value}
                </div>
                <div className="font-body text-sm text-white/30">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 bg-[#000000] flex items-center justify-center p-8 lg:p-16">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div variants={itemVariants} className="flex justify-center mb-10 lg:hidden">
            <img src={conversyLogo} alt="Conversy" className="h-10 w-auto object-contain" />
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-2">
              {view === 'login' && 'Acesse como Afiliado'}
              {view === 'signup' && 'Torne-se Afiliado'}
              {view === 'forgot-password' && 'Recuperar senha'}
            </h2>
            <p className="font-body text-white/40">
              {view === 'login' && 'Entre para acompanhar suas comissões'}
              {view === 'signup' && 'Crie sua conta e comece a ganhar'}
              {view === 'forgot-password' && 'Enviaremos um link de recuperação'}
            </p>
          </motion.div>

          {/* Auth Tabs */}
          {(view === 'login' || view === 'signup') && (
            <motion.div variants={itemVariants} className="flex gap-1 mb-10 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => setView('login')}
                className={`flex-1 py-3 text-sm font-body rounded-md transition-all duration-300 ${
                  view === 'login' ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white/60'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setView('signup')}
                className={`flex-1 py-3 text-sm font-body rounded-md transition-all duration-300 ${
                  view === 'signup' ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white/60'
                }`}
              >
                Criar Conta
              </button>
            </motion.div>
          )}

          {/* Login Form */}
          {view === 'login' && (
            <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleLogin} className="space-y-8">
              <motion.div variants={itemVariants}>
                <FloatingInput id="login-email" label="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FloatingInput id="login-password" label="Senha" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isLoading} />
              </motion.div>
              <motion.div variants={itemVariants} className="flex justify-end">
                <button type="button" onClick={() => setView('forgot-password')} className="text-sm font-body text-white/30 hover:text-primary transition-colors">
                  Esqueceu a senha?
                </button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group py-4 rounded-lg font-body text-base font-semibold text-white overflow-hidden transition-all duration-500 bg-gradient-to-r from-primary to-[#c46b4e] hover:shadow-[0_0_40px_rgba(240,137,54,0.4)] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Entrar
                  </span>
                </button>
              </motion.div>
            </motion.form>
          )}

          {/* Signup Form */}
          {view === 'signup' && (
            <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleSignup} className="space-y-8">
              <motion.div variants={itemVariants}>
                <FloatingInput id="signup-email" label="Email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isLoading} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <FloatingInput id="signup-password" label="Senha" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={isLoading} />
              </motion.div>
              {refCode && (
                <motion.div variants={itemVariants} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-body text-primary/80">Indicado por: <strong>{refCode}</strong></span>
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group py-4 rounded-lg font-body text-base font-semibold text-white overflow-hidden transition-all duration-500 bg-gradient-to-r from-primary to-[#c46b4e] hover:shadow-[0_0_40px_rgba(240,137,54,0.4)] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Criar Conta de Afiliado
                  </span>
                </button>
              </motion.div>
              <motion.p variants={itemVariants} className="text-xs text-center text-white/30 font-body">
                Ao criar conta, você concorda com nossos{' '}
                <a href="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</a>{' '}e{' '}
                <a href="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</a>.
              </motion.p>
            </motion.form>
          )}

          {/* Forgot Password */}
          {view === 'forgot-password' && (
            <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleForgotPassword} className="space-y-8">
              <motion.div variants={itemVariants}>
                <FloatingInput id="reset-email" label="Email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} disabled={isLoading} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group py-4 rounded-lg font-body text-base font-semibold text-white overflow-hidden transition-all duration-500 bg-gradient-to-r from-primary to-[#c46b4e] hover:shadow-[0_0_40px_rgba(240,137,54,0.4)] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enviar Link
                  </span>
                </button>
              </motion.div>
              <motion.div variants={itemVariants} className="text-center">
                <button type="button" onClick={() => setView('login')} className="text-sm font-body text-white/30 hover:text-primary transition-colors">
                  ← Voltar ao login
                </button>
              </motion.div>
            </motion.form>
          )}

          {/* Back to site */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <a href="/" className="text-sm font-body text-white/20 hover:text-white/40 transition-colors">
              ← Voltar ao site
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateAuth;
