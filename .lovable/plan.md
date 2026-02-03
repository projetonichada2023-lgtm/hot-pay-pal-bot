

# Plano: Adicionar Mockup Visual do Dashboard no Hero

## Objetivo
Adicionar um mockup visual flutuante do dashboard na seção Hero com efeito 3D de perspectiva e animação de entrada suave, aumentando o impacto visual e a credibilidade da landing page.

---

## Visao Geral da Implementacao

O mockup sera um componente React que simula a interface do dashboard real da aplicacao, utilizando elementos visuais similares aos componentes existentes (MetricCard, SalesChart) mas de forma estatica e estilizada para a landing page.

---

## Componentes a Criar

### 1. `src/components/landing/DashboardMockup.tsx`

Componente principal contendo:
- Container com efeito 3D de perspectiva CSS
- Cards de metricas simulados (miniatura)
- Grafico de vendas estilizado (SVG estatico)
- Efeito de glassmorphism e bordas brilhantes
- Animacao de flutuacao sutil continua

### 2. Estrutura Visual do Mockup

```text
+--------------------------------------------------+
|  Dashboard Mockup (perspectiva 3D)               |
|  +--------+  +--------+  +--------+  +--------+  |
|  | Metrica|  | Metrica|  | Metrica|  | Metrica|  |
|  | R$2.5k |  |  127   |  | 34.2%  |  | R$89   |  |
|  +--------+  +--------+  +--------+  +--------+  |
|                                                  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |     [Grafico de Area - Vendas]             |  |
|  |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~            |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  +-------------------+  +--------------------+   |
|  | Pedidos Recentes  |  | Produtos Top      |   |
|  +-------------------+  +--------------------+   |
+--------------------------------------------------+
```

---

## Detalhes Tecnicos

### Efeito 3D com CSS

```css
.dashboard-mockup-container {
  perspective: 1200px;
  perspective-origin: 50% 50%;
}

.dashboard-mockup {
  transform: rotateX(8deg) rotateY(-12deg) scale(0.95);
  transform-style: preserve-3d;
}
```

### Animacao de Entrada (Framer Motion)

- Delay inicial de 0.8s (apos hero text)
- Duracao de 1s com easing suave
- Movimento de baixo para cima com scale
- Rotacao 3D progressiva

```typescript
const mockupVariants = {
  hidden: {
    opacity: 0,
    y: 100,
    rotateX: 25,
    rotateY: -20,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 8,
    rotateY: -12,
    scale: 1,
    transition: {
      duration: 1.2,
      delay: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}
```

### Animacao de Flutuacao Continua

```typescript
animate={{
  y: [-5, 5, -5],
  rotateX: [8, 6, 8],
  rotateY: [-12, -10, -12]
}}
transition={{
  duration: 6,
  repeat: Infinity,
  ease: "easeInOut"
}}
```

---

## Alteracoes em Arquivos Existentes

### `src/components/landing/HeroSection.tsx`

1. Importar o novo componente `DashboardMockup`
2. Reorganizar layout para acomodar o mockup:
   - Mobile: Mockup abaixo do CTA, antes dos stats
   - Desktop: Layout side-by-side ou mockup abaixo centralizado
3. Ajustar padding/spacing da secao

### Layout Proposto (Desktop)

```text
+----------------------------------------------------------+
|                     [Badge]                               |
|                                                           |
|              Venda Produtos Digitais                      |
|              Direto no Telegram                           |
|                                                           |
|              [Descricao do produto]                       |
|                                                           |
|         [CTA Comecar]    [Ver Demo]                       |
|                                                           |
|         +-----------------------------------+              |
|         |                                   |              |
|         |    [Dashboard Mockup 3D]          |              |
|         |                                   |              |
|         +-----------------------------------+              |
|                                                           |
|     [500+ Negocios]  [R$2M+]  [98% Satisfacao]            |
|                                                           |
|              [UniPay Partnership Badge]                   |
+----------------------------------------------------------+
```

---

## Estilos Visuais

### Glassmorphism do Mockup

- Background: `rgba(10, 10, 10, 0.8)`
- Backdrop blur: `blur(24px)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Box shadow com glow laranja sutil

### Elementos do Mockup

- Mini metric cards com icones e valores fictícios
- Grafico SVG estatico com gradiente laranja
- Linhas de lista (pedidos recentes) como placeholders
- Efeito de brilho no canto superior

---

## Responsividade

| Viewport | Comportamento |
|----------|---------------|
| Mobile (<640px) | Mockup oculto ou versao simplificada (apenas grafico) |
| Tablet (640-1024px) | Mockup em escala menor, abaixo do CTA |
| Desktop (>1024px) | Mockup em tamanho completo com efeito 3D |

---

## Performance

1. **Lazy loading**: Mockup carrega apos hero text
2. **will-change**: Aplicado para otimizar transforms
3. **Reducao em mobile**: Versao simplificada ou hidden
4. **prefers-reduced-motion**: Desativa flutuacao para usuarios sensíveis

---

## Arquivos Envolvidos

| Arquivo | Acao |
|---------|------|
| `src/components/landing/DashboardMockup.tsx` | Criar (novo) |
| `src/components/landing/HeroSection.tsx` | Editar (adicionar mockup) |
| `src/index.css` | Editar (adicionar estilos 3D) |

