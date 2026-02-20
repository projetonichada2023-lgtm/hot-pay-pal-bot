
# Pagina de Login Separada para Afiliados

## Resumo
Criar uma pagina de autenticacao exclusiva em `/affiliate/auth` com visual proprio voltado para afiliados, sem mencao ao dashboard de clientes. Apos login, redireciona direto para `/affiliate`.

## O que sera feito

### 1. Nova pagina: `src/pages/affiliate/AffiliateAuth.tsx`
- Layout split-screen seguindo o mesmo estilo da pagina `/auth` atual (gradiente mesh, floating inputs, animacoes)
- Lado esquerdo: hero com textos focados em afiliados ("Ganhe comissoes", "Programa de Afiliados Conversy")
- Lado direito: formulario com abas "Entrar" e "Criar Conta"
  - **Entrar**: email + senha (redireciona para `/affiliate` apos login)
  - **Criar Conta**: email + senha (sem campo "Nome do negocio" -- nao cria registro de `client`)
- Suporte a `?ref=CODIGO` na URL para vincular subafiliado automaticamente
- Links de "Esqueci minha senha" e "Voltar ao site"
- Apos signup, o usuario e redirecionado para o formulario de registro de afiliado (ja existente)

### 2. Ajuste no `useAuth` / signup
- O signup de afiliado **nao** criara um registro na tabela `clients`
- Usar `supabase.auth.signUp` diretamente sem o `businessName`
- Alternativa: criar uma funcao `signUpAffiliate` no hook que so faz signup sem criar client

### 3. Rota no `App.tsx`
- Adicionar rota `/affiliate/auth` apontando para `AffiliateAuth`
- Manter a logica atual do `AffiliateDashboard` que redireciona para `/affiliate/auth` se nao logado (em vez de `/auth?redirect=/affiliate`)

### 4. Ajuste de redirecionamento
- No `AffiliateDashboard.tsx`, trocar o redirect de `/auth?redirect=/affiliate` para `/affiliate/auth`
- Na pagina `/auth` principal, manter o redirect para `/dashboard` (sem mudanca)

## Detalhes Tecnicos

### AffiliateAuth.tsx
- Reutiliza o componente `FloatingInput` da pagina Auth atual (extrair para componente compartilhado ou copiar)
- Usa `framer-motion` para animacoes consistentes
- Hero com stats de afiliados: "R$ 50k+ pagos", "200+ afiliados", "10% comissao"
- Cores e branding iguais ao auth principal (fundo preto, gradientes laranja)

### Fluxo de cadastro do afiliado
```text
1. Usuario acessa /affiliate/auth
2. Cria conta (so email + senha, sem business_name)
3. Apos login, vai para /affiliate
4. Como nao tem registro de afiliado, ve o formulario AffiliateRegister
5. Preenche dados (nome, PIX, etc)
6. Aguarda aprovacao (AffiliatePending)
7. Apos aprovado, acessa o dashboard de afiliados
```

### Arquivos modificados
- **Criar**: `src/pages/affiliate/AffiliateAuth.tsx`
- **Editar**: `src/App.tsx` (nova rota)
- **Editar**: `src/pages/affiliate/AffiliateDashboard.tsx` (redirect)
- **Editar**: `src/hooks/useAuth.tsx` (funcao signUpAffiliate sem criar client)
