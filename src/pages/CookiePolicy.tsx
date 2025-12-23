import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>
        <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. O que são Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita nosso site. 
              Eles nos ajudam a fornecer uma melhor experiência de uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Tipos de Cookies que Utilizamos</h2>
            
            <h3 className="text-xl font-medium mb-2 mt-4">Cookies Essenciais</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Necessários para o funcionamento básico do site, como autenticação e segurança.
            </p>
            
            <h3 className="text-xl font-medium mb-2">Cookies de Desempenho</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Coletam informações sobre como você usa o site para nos ajudar a melhorá-lo.
            </p>
            
            <h3 className="text-xl font-medium mb-2">Cookies Funcionais</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Lembram suas preferências para personalizar sua experiência.
            </p>
            
            <h3 className="text-xl font-medium mb-2">Cookies de Marketing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Usados para exibir anúncios relevantes e medir a eficácia de campanhas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cookies de Terceiros</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Utilizamos serviços de terceiros que podem definir cookies:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Google Analytics - análise de tráfego</li>
              <li>Processadores de pagamento</li>
              <li>Serviços de chat e suporte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Gerenciando Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Você pode controlar e/ou excluir cookies conforme desejar. A maioria dos navegadores permite:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Ver quais cookies estão armazenados</li>
              <li>Excluir cookies individualmente ou em massa</li>
              <li>Bloquear cookies de terceiros</li>
              <li>Bloquear todos os cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Impacto da Desativação</h2>
            <p className="text-muted-foreground leading-relaxed">
              Desativar cookies pode afetar a funcionalidade do site. Alguns recursos podem não funcionar 
              corretamente sem cookies essenciais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Atualizações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política pode ser atualizada periodicamente. Recomendamos revisá-la regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dúvidas sobre cookies? Entre em contato: suporte@telegateway.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
