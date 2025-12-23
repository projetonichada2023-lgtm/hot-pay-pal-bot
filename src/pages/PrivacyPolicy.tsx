import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              A TeleGateway está comprometida em proteger sua privacidade. Esta política descreve como coletamos, 
              usamos e protegemos suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Dados Coletados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Coletamos os seguintes tipos de dados:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Dados de cadastro (nome, email, telefone)</li>
              <li>Dados de transações e pagamentos</li>
              <li>Dados de uso da plataforma</li>
              <li>Dados do Telegram (ID do usuário, nome de usuário)</li>
              <li>Dados de navegação e cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Uso dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Utilizamos seus dados para:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar transações e pagamentos</li>
              <li>Enviar comunicações sobre sua conta</li>
              <li>Prevenir fraudes e atividades ilegais</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos seus dados pessoais. Podemos compartilhar informações com processadores de pagamento, 
              prestadores de serviços e quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia, 
              controle de acesso e monitoramento de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Você tem direito a:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar exclusão de dados</li>
              <li>Portabilidade dos dados</li>
              <li>Revogar consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos seus dados pelo tempo necessário para fornecer nossos serviços ou conforme exigido por lei. 
              Dados de transações são mantidos por 5 anos para fins fiscais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas, entre em contato: privacidade@telegateway.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
