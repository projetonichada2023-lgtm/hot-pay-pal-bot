import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
        <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e usar a plataforma UniPay, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              A UniPay é uma plataforma de automação de vendas via Telegram que permite aos usuários criar e gerenciar 
              lojas virtuais, processar pagamentos e automatizar interações com clientes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas e completas. 
              Você é responsável por manter a confidencialidade de sua conta e senha.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Você concorda em não usar a plataforma para:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Vender produtos ou serviços ilegais</li>
              <li>Violar direitos de propriedade intelectual</li>
              <li>Enviar spam ou conteúdo malicioso</li>
              <li>Realizar atividades fraudulentas</li>
              <li>Violar leis ou regulamentos aplicáveis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Pagamentos e Taxas</h2>
            <p className="text-muted-foreground leading-relaxed">
              As taxas de serviço são claramente informadas antes de qualquer transação. A UniPay pode alterar 
              suas taxas mediante aviso prévio de 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo da plataforma, incluindo logos, textos e software, é propriedade da UniPay ou 
              de seus licenciadores e está protegido por leis de propriedade intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A UniPay não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes 
              do uso ou impossibilidade de uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Modificações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão 
              em vigor após a publicação no site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato através do email: suporte@unipay.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
