import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LGPD = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">LGPD - Lei Geral de Proteção de Dados</h1>
        <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Compromisso com a LGPD</h2>
            <p className="text-muted-foreground leading-relaxed">
              A TeleGateway está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). 
              Esta página detalha como protegemos seus dados pessoais conforme a legislação brasileira.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Controlador de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              A TeleGateway atua como controladora de dados pessoais, sendo responsável pelas decisões referentes 
              ao tratamento de dados pessoais dos usuários de sua plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Bases Legais para Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Tratamos seus dados com base em:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Consentimento:</strong> Quando você autoriza expressamente</li>
              <li><strong>Execução de contrato:</strong> Para fornecer nossos serviços</li>
              <li><strong>Obrigação legal:</strong> Para cumprir leis e regulamentos</li>
              <li><strong>Legítimo interesse:</strong> Para melhorar nossos serviços</li>
              <li><strong>Proteção ao crédito:</strong> Para transações financeiras</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Seus Direitos (Art. 18 LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Como titular dos dados, você tem direito a:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Confirmação da existência de tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Eliminação dos dados tratados com consentimento</li>
              <li>Informação sobre compartilhamento de dados</li>
              <li>Revogação do consentimento</li>
              <li>Oposição ao tratamento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Encarregado de Proteção de Dados (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nosso Encarregado de Proteção de Dados está disponível para atender suas solicitações 
              e esclarecer dúvidas sobre o tratamento de dados pessoais.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              <strong>Contato:</strong> dpo@telegateway.com.br
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Medidas de Segurança</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Implementamos medidas técnicas e administrativas:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controle de acesso baseado em função</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares</li>
              <li>Treinamento de funcionários</li>
              <li>Auditorias de segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Transferência Internacional</h2>
            <p className="text-muted-foreground leading-relaxed">
              Quando necessário transferir dados para outros países, garantimos que sejam aplicadas 
              salvaguardas adequadas conforme exigido pela LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Incidentes de Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Em caso de incidente de segurança que possa causar risco aos titulares, notificaremos 
              a Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados conforme 
              determina a legislação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Como Exercer Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Para exercer seus direitos, você pode:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Enviar email para: lgpd@telegateway.com.br</li>
              <li>Acessar as configurações de privacidade em sua conta</li>
              <li>Entrar em contato com nosso DPO</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Responderemos sua solicitação em até 15 dias, conforme previsto na LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. ANPD</h2>
            <p className="text-muted-foreground leading-relaxed">
              Caso entenda que o tratamento de seus dados não está em conformidade com a legislação, 
              você pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LGPD;
