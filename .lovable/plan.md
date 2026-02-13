
# Adicionar "Afiliados" na Sidebar do Dashboard

## Objetivo
Adicionar um item de menu "Afiliados" na sidebar do dashboard que redireciona para o painel de afiliados existente em `/affiliate`.

## O que sera feito

1. **Adicionar item "Afiliados" no grupo "Gestao" da sidebar** (`src/components/dashboard/Sidebar.tsx`)
   - Adicionar o icone `UserPlus` (ou `Handshake`) do Lucide
   - Inserir o item no array `menuGroups`, no grupo "Gestao", antes de "Configuracoes"
   - O path sera `/affiliate` (link externo ao dashboard, abre o painel de afiliados)

## Detalhes tecnicos

- O item usara `navigate('/affiliate')` ao inves de um path relativo ao dashboard
- Como `/affiliate` e uma rota separada (nao esta dentro de `/dashboard/*`), o clique redirecionara o usuario para o painel de afiliados completo
- O estilo seguira o mesmo padrao dos demais itens da sidebar
