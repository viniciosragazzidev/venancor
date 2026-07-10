# Venancor CRM - Design System

> Documento oficial de referência do design system.  
> Última atualização: Julho 2026

---

## 1. Visão Geral

### Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.2.9 | Framework (App Router) |
| React | 19.2.4 | UI Library |
| Tailwind CSS | 4.x | Estilização |
| shadcn/ui | 4.12.0 (base-nova) | Componentes base |
| Framer Motion | - | Animações |
| Recharts | - | Gráficos |
| Hugeicons | @hugeicons/core-free-icons | Ícones |
| class-variance-authority | - | Variantes (CVA) |

### Princípios

1. **Consistência** — Mesmos tokens em todas as páginas
2. **Hierarquia** — Tamanho, peso e cor definem importância
3. **Eficiência** — Máxima informação com mínimo de espaço
4. **Acessibilidade** — Contraste 4.5:1, navegação por teclado
5. **Responsivo** — Mobile-first, adaptável a qualquer tela

---

## 2. Paleta de Cores

### Light Mode

| Token | Hex | Uso Tailwind |
|-------|-----|--------------|
| `--background` | `#ffffff` | `bg-background` |
| `--foreground` | `#09090b` | `text-foreground` |
| `--card` | `#ffffff` | `bg-card` |
| `--card-foreground` | `#09090b` | `text-card-foreground` |
| `--primary` | `#3b2dff` | `bg-primary` |
| `--primary-foreground` | `#ffffff` | `text-primary-foreground` |
| `--secondary` | `#f4f3f0` | `bg-secondary` |
| `--secondary-foreground` | `#18181b` | `text-secondary-foreground` |
| `--muted` | `#f4f3f0` | `bg-muted` |
| `--muted-foreground` | `#71717a` | `text-muted-foreground` |
| `--accent` | `#f4f3f0` | `bg-accent` |
| `--accent-foreground` | `#18181b` | `text-accent-foreground` |
| `--destructive` | `#ef4444` | `bg-destructive` |
| `--destructive-foreground` | `#fafafa` | `text-destructive-foreground` |
| `--border` | `#e4e4e7` | `border-border` |
| `--input` | `#e4e4e7` | `border-input` |
| `--ring` | `#3b2dff` | `ring-ring` |
| `--success` | `#10b981` | `bg-success` |
| `--success-foreground` | `#ffffff` | `text-success-foreground` |
| `--warning` | `#f59e0b` | `bg-warning` |
| `--warning-foreground` | `#ffffff` | `text-warning-foreground` |
| `--info` | `#3b82f6` | `bg-info` |
| `--info-foreground` | `#ffffff` | `text-info-foreground` |

### Dark Mode

| Token | Hex |
|-------|-----|
| `--background` | `#09090b` |
| `--foreground` | `#fafafa` |
| `--primary` | `#1F6FE5` |
| `--secondary` / `--muted` / `--accent` | `#27272a` |
| `--border` / `--input` | `#27272a` |
| `--destructive` | `#7f1d1d` |
| `--success` | `#34d399` |
| `--warning` | `#fbbf24` |
| `--info` | `#60a5fa` |

### Status Colors (uso em badges e indicadores)

| Status | Light | Dark | Tailwind Classes |
|--------|-------|------|------------------|
| Aguardando | `#94a3b8` | `#94a3b8` | `bg-slate-50 text-slate-700 border-slate-200` |
| Em Atendimento | `#3b82f6` | `#60a5fa` | `bg-blue-50 text-blue-700 border-blue-200` |
| Proposta Enviada | `#f59e0b` | `#fbbf24` | `bg-amber-50 text-amber-700 border-amber-200` |
| Venda Concluída | `#10b981` | `#34d399` | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| Erro | `#ef4444` | `#dc2626` | `bg-red-50 text-red-700 border-red-200` |

### Cores de Gráficos

| Série | Hex | Uso |
|-------|-----|-----|
| Primary | `#3b2dff` | Leads (série principal) |
| Info | `#3b82f6` | Em Atendimento |
| Warning | `#f59e0b` | Propostas |
| Success | `#10b981` | Vendas |
| Neutral | `#94a3b8` | Sem dados / Aguardando |

---

## 3. Tipografia

### Fontes

| Fonte | Variável CSS | Uso |
|-------|--------------|-----|
| **Plus Jakarta Sans** | `--font-plus-jakarta-sans` | Fonte principal |
| **Amil Typeface** | `--font-logo` | Logo apenas |

### Escala

| Elemento | Tamanho | Peso | Line Height | Classes |
|----------|---------|------|-------------|---------|
| H1 (página) | 18-20px | 700 | 1.2 | `text-lg font-bold tracking-tight` |
| H2 (seção) | 14-16px | 600 | 1.3 | `text-sm font-semibold` |
| H3 (sub) | 13-14px | 500 | 1.4 | `text-sm font-medium` |
| Body | 12-14px | 400 | 1.5 | `text-xs font-normal` |
| Label | 10-11px | 600 | 1.2 | `text-[10px] font-semibold uppercase tracking-wider` |
| Micro | 8-9px | 600 | 1.2 | `text-[9px] font-semibold uppercase tracking-wider` |
| Caption | 9-10px | 500 | 1.2 | `text-[10px] font-medium` |
| Valor (KPI) | 24-32px | 700 | 1.0 | `text-2xl/3xl font-bold tabular-nums` |

### Tracking

| Uso | Classes |
|-----|---------|
| Títulos | `tracking-tight` |
| Labels uppercase | `tracking-wider` |
| Micro labels | `tracking-widest` |
| Valores numéricos | `tabular-nums` |

### Hierarquia Visual

```
Resumo                      → text-lg font-bold text-neutral-900 tracking-tight
Visão geral do pipeline     → text-[11px] font-semibold text-neutral-400
TOTAL DE LEADS              → text-[10px] font-semibold text-neutral-400 uppercase tracking-wider
1.247                       → text-3xl font-bold tabular-nums (cor do status)
ID | Hora | Cliente         → text-[10px] font-semibold text-neutral-400 uppercase tracking-wider
#1247 | 14:32 | Maria       → text-xs font-medium text-neutral-800
```

---

## 4. Espaçamento

### Gap Scale

| Token | Valor | Uso |
|-------|-------|-----|
| `gap-0.5` | 2px | Mínimo entre elementos |
| `gap-1` | 4px | Ícone + texto |
| `gap-1.5` | 6px | Itens relacionados |
| `gap-2` | 8px | Padrão entre elementos |
| `gap-2.5` | 10px | Interno de cards |
| `gap-3` | 12px | Seções pequenas |
| `gap-4` | 16px | Padrão entre cards |
| `gap-5` | 20px | Entre seções |
| `gap-6` | 24px | Grandes seções |
| `gap-8` | 32px | Blocos principais |

### Padding

| Contexto | Valor | Classes |
|----------|-------|---------|
| Card padrão | 16-20px | `p-4` / `p-5` |
| Card pequeno | 12px | `p-3` |
| Card grande | 24-32px | `p-6` / `p-8` |
| Botão default | 10px 12px | `px-2.5 py-2` |
| Botão sm | 8px 10px | `px-2 py-1.5` |
| Input | 10px | `px-2.5 py-1` |
| Página | 24-32px | `p-6 lg:p-8` |

### Vertical Rhythm

| Contexto | Classes |
|----------|---------|
| Seções | `space-y-5` |
| Cards no grid | `gap-4` |
| Após título | `mt-1.5` / `mt-2` |
| Após parágrafo | `mt-1` / `mt-1.5` |

---

## 5. Border Radius

| Token | Valor | Classes | Uso |
|-------|-------|---------|-----|
| `--radius-sm` | 4px | `rounded-sm` | Elementos pequenos |
| `--radius-md` | 6px | `rounded-md` | Botões, badges |
| `--radius-lg` | 8px | `rounded-lg` | Inputs |
| `--radius-xl` | 12px | `rounded-xl` | Cards |
| `--radius-2xl` | 16px | `rounded-2xl` | Cards grandes, banners |
| `--radius-3xl` | 24px | `rounded-3xl` | Modais, sheets |
| `--radius-full` | 9999px | `rounded-full` | Avatares, pills |

### Por Componente

| Componente | Radius |
|------------|--------|
| Button | `rounded-lg` |
| Button sm | `rounded-[min(var(--radius-md),10px)]` |
| Input | `rounded-lg` |
| Card | `rounded-xl` |
| Badge | `rounded-4xl` (pill) |
| Avatar | `rounded-full` |
| Sheet | `rounded-3xl` |
| Tooltip | `rounded-md` |
| Separator | sem radius |

---

## 6. Sombras e Elevação

### Shadow Scale

| Nível | Classes | Uso |
|-------|---------|-----|
| 0 | sem sombra | Fundo flat |
| 1 | `ring-1 ring-foreground/10` | Cards em repouso |
| 2 | `hover:shadow-md` | Cards hover |
| 3 | `shadow-md` | Dropdowns, tooltips |
| 4 | `shadow-lg` | Modais, sheets |
| 5 | `shadow-lg` | Popovers |

### Z-Index

| Camada | Z-Index | Uso |
|--------|---------|-----|
| Base | `z-0` | Conteúdo |
| Fixo | `z-20` | Header |
| Sidebar | `z-30` | Sidebar desktop |
| Dropdown | `z-40` | Menus, select |
| Overlay | `z-50` | Modais, tooltips, toasts |

---

## 7. Componentes UI

### 7.1 Button

**Variantes:** `default` | `outline` | `secondary` | `ghost` | `destructive` | `link`

| Variante | Estilo |
|----------|--------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` |
| `outline` | `border-border bg-background hover:bg-muted` |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `ghost` | `hover:bg-muted hover:text-foreground` |
| `destructive` | `bg-destructive/10 text-destructive hover:bg-destructive/20` |
| `link` | `text-primary underline-offset-4 hover:underline` |

**Tamanhos:** `xs` (24px) | `sm` (28px) | `default` (32px) | `lg` (36px) | `icon` (32px) | `icon-xs` (24px) | `icon-sm` (28px) | `icon-lg` (36px)

```tsx
<Button variant="default" size="default">
  <HugeiconsIcon icon={SomeIcon} data-icon="inline-start" />
  Ação Principal
</Button>

<Button variant="outline" size="sm">Cancelar</Button>

<Button variant="ghost" size="icon">
  <HugeiconsIcon icon={SettingsIcon} />
</Button>
```

### 7.2 Badge

**Variantes:** `default` | `secondary` | `destructive` | `outline` | `ghost` | `link`

Altura fixa: `h-5` (20px). Padding: `px-2 py-0.5`. Fonte: `text-xs font-medium`.

```tsx
<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
  Venda Concluída
</Badge>

<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
  <ArrowUpIcon className="size-3" /> +12.5%
</Badge>
```

### 7.3 Card

**Sub-componentes:** `Card` | `CardHeader` | `CardTitle` | `CardDescription` | `CardAction` | `CardContent` | `CardFooter`

**Tamanhos:** `default` (spacing 16px) | `sm` (spacing 12px)

Border: `ring-1 ring-foreground/10`. Radius: `rounded-xl`.

```tsx
<Card className="border border-slate-100 bg-white">
  <CardHeader>
    <CardTitle className="text-sm font-semibold text-neutral-800">Título</CardTitle>
    <CardAction><Button variant="ghost" size="icon-sm">...</Button></CardAction>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Rodapé</CardFooter>
</Card>
```

### 7.4 Input

Altura: `h-8` (32px). Border: `border border-input`. Radius: `rounded-lg`.

```
h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base
focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50
disabled:pointer-events-none disabled:opacity-50
aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
```

### 7.5 Label

Fonte: `text-sm font-medium`. Altura de linha: `leading-none`.

### 7.6 Separator

Horizontal: `h-px w-full bg-border`. Vertical: `w-px self-stretch bg-border`.

### 7.7 Tooltip

Provider: `<TooltipProvider>` no layout raiz. Trigger sem `asChild`.

```tsx
<Tooltip>
  <TooltipTrigger><Badge>Hover</Badge></TooltipTrigger>
  <TooltipContent><p>Texto</p></TooltipContent>
</Tooltip>
```

### 7.8 Table

Container: `overflow-x-auto`. Header: `[&_tr]:border-b`. Row: `border-b hover:bg-muted/50`. Head: `h-10 px-2 text-left font-medium`. Cell: `p-2 align-middle whitespace-nowrap`.

### 7.9 Select

Base: `@base-ui/react/select`. Trigger: `h-8`. Content: `rounded-lg bg-popover shadow-md ring-1 ring-foreground/10`.

### 7.10 Sheet

Base: `@base-ui/react/tooltip` (dialog). Radius: `rounded-3xl`. Posições: `right` | `left` | `top` | `bottom`.

---

## 8. Layout

### Estrutura CRM

```
┌──────────┬───────────────────────────────────────────────┐
│ Sidebar  │ Content (p-6 lg:p-8)                          │
│ w-68     │                                               │
│ (272px)  │  Header (título + refresh)                     │
│ sticky   │  Welcome Banner (rounded-2xl)                  │
│ z-30     │  Period Filter                                 │
│          │  Metrics Grid (2 cols mobile / 4 desktop)      │
│          │  Charts Row (2/3 line + 1/3 donut)             │
│          │  Recent Activity Table                         │
└──────────┴───────────────────────────────────────────────┘
```

### Breakpoints

| Prefixo | Largura | Comportamento |
|---------|---------|---------------|
| (base) | <640px | 1 coluna, sidebar oculta |
| `sm` | 640px | 2 colunas |
| `md` | 768px | Sidebar visível |
| `lg` | 1024px | 3-4 colunas |
| `xl` | 1280px | Layout completo |

### Grid Patterns

```tsx
// Métricas
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Gráficos (2/3 + 1/3)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">...</div>
  <div>...</div>
</div>

// Seções divididas
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
```

---

## 9. Navegação

### Sidebar

Grupos: `Visão Geral` | `Comercial` | `Equipe` | `Gestão`

**Item inativo:** `text-neutral-700 font-normal hover:text-neutral-600 hover:bg-slate-50/20`  
**Item ativo:** `text-neutral-900 font-semibold bg-slate-50/60` + indicador animado `w-1 bg-[#3b2dff] rounded-r-full`

**Label de grupo:** `text-[9px] font-semibold uppercase tracking-widest text-neutral-400`

**Ícones:** tamanho `size-4.5`. Cor inativo: `text-neutral-400`. Cor ativo: `text-[#3b2dff]`.

---

## 10. Animações

| Padrão | Config |
|--------|--------|
| Biblioteca | Framer Motion |
| Duração | 150-300ms (micro), 400ms (entradas) |
| Easing | `[0.16, 1, 0.3, 1]` |
| Stagger | 50ms por item |

### Padrões

**Fade + Slide Up:**
```tsx
{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }
```

**Stagger Container:**
```tsx
{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
```

**Nav Indicator (spring):**
```tsx
transition: { type: 'spring', stiffness: 380, damping: 26 }
```

**Bar Animation:**
```tsx
initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
```

### Hover Effects

| Elemento | Efeito |
|----------|--------|
| Card | `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200` |
| Botão | `hover:bg-primary/80` ou variante |
| Lista | `hover:bg-slate-50/50 transition-colors` |

---

## 11. Ícones

**Biblioteca:** Hugeicons (`@hugeicons/core-free-icons`)

### Tamanhos

| Label | Pixels | Classes |
|-------|--------|---------|
| XS | 12px | `size-3` |
| SM | 14px | `size-3.5` |
| MD | 16px | `size-4` |
| LG | 18px | `size-4.5` |
| XL | 20px | `size-5` |
| 2XL | 24px | `size-6` |

### Mapeamento

| Uso | Ícone |
|-----|-------|
| Dashboard | `GridViewIcon` |
| Clientes | `UserGroupIcon` |
| Conversas | `BubbleChatIcon` |
| Corretores | `Briefcase01Icon` |
| Planos | `Task01Icon` |
| Config | `Settings02Icon` |
| Refresh | `RefreshIcon` |
| Seta direita | `ArrowRight01Icon` |
| Seta baixo | `ArrowDown01Icon` |
| Busca | `Search01Icon` |
| Notificações | `BellIcon` |
| Sair | `Logout01Icon` |
| Menu mobile | `Menu01Icon` |
| Fechar | `Cancel01Icon` |

### Padrão de Uso

```tsx
// Em botão
<HugeiconsIcon icon={SomeIcon} data-icon="inline-start" />

// Solto
<HugeiconsIcon icon={SomeIcon} className="size-4 text-neutral-400" />

// Cor semântica
<HugeiconsIcon icon={CheckIcon} className="size-4 text-emerald-500" />
```

---

## 12. Status e Badges

### Padrão de Badge de Status

```tsx
const STATUS_CLASSES = {
  Aguardando:        'text-neutral-500 border-neutral-200 bg-neutral-50',
  'Em Atendimento':  'text-blue-700 border-blue-200 bg-blue-50',
  'Proposta Enviada':'text-amber-700 border-amber-200 bg-amber-50',
  'Venda Concluída': 'text-emerald-700 border-emerald-200 bg-emerald-50',
};

<Badge variant="outline" className={`border ${STATUS_CLASSES[status]}`}>
  {status}
</Badge>
```

### Badges de Variação (KPI)

```tsx
const trendClasses = {
  up:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  down:    'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
};

<Badge variant="outline" className={`border ${trendClasses[trend]}`}>
  {trend === 'up' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
  {change > 0 ? '+' : ''}{change.toFixed(1)}%
</Badge>
```

---

## 13. Gráficos (Recharts)

### Configuração Padrão

```tsx
<ResponsiveContainer width="100%" height={280}>
  <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
    <XAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
    <Tooltip content={<CustomTooltip />} />
    <Legend content={<CustomLegend />} />
    <Line type="monotone" dataKey="leads" stroke="#3b2dff" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
  </LineChart>
</ResponsiveContainer>
```

### Tooltip Customizado

```tsx
<div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3">
  <p className="text-xs font-semibold text-neutral-800 mb-2">{label}</p>
  <div className="space-y-1.5">
    {payload.map(item => (
      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-neutral-600">{item.dataKey}</span>
        </div>
        <span className="font-semibold text-neutral-800 tabular-nums">{item.value}</span>
      </div>
    ))}
  </div>
</div>
```

### Donut Chart

- `innerRadius={50}` / `outerRadius={70}`
- Total centralizado com `text-2xl font-bold`
- Legenda lateral com `text-xs`

---

## 14. Formulários

### Padrão

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field">Label</Label>
    <Input id="field" placeholder="Placeholder" />
    <p className="text-[10px] text-muted-foreground">Helper text</p>
  </div>
  <Button type="submit">Salvar</Button>
</div>
```

### Validação

```tsx
// Estado de erro
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" aria-invalid placeholder="email@ex.com" />
  <p className="text-[10px] text-red-500">Email inválido</p>
</div>
```

---

## 15. Responsividade

### Mobile (< 768px)

- Sidebar oculta, menu via `Sheet` (bottom)
- Métricas: 2 colunas
- Gráficos: empilhados
- Tabela: scroll horizontal
- Padding: `p-4`

### Tablet (768px - 1024px)

- Sidebar visível (`md:flex`)
- Métricas: 2-3 colunas
- Gráficos: empilhados ou 2 colunas
- Padding: `p-6`

### Desktop (> 1024px)

- Sidebar fixa
- Métricas: 4 colunas
- Gráficos: 2/3 + 1/3
- Padding: `p-6 lg:p-8`

---

## 16. Acessibilidade

| Requisito | Implementação |
|-----------|---------------|
| Contraste texto | Mínimo 4.5:1 (WCAG AA) |
| Focus ring | `focus-visible:ring-3 focus-visible:ring-ring/50` |
| Labels de formulário | `<Label htmlFor>` obrigatório |
| Keyboard nav | Tab order = visual order |
| Screen reader | `aria-label` em botões sem texto |
| Reduced motion | Respeitar `prefers-reduced-motion` |
| ARIA invalid | `aria-invalid` + `data-invalid` em erros |

---

## 17. Dark Mode

Ativado via classe `.dark` no `<html>`. Tokens mapeados em `globals.css`.

**Diferenças principais:**
- `--primary`: `#1F6FE5` (azul, não roxo)
- `--background`: `#09090b` (quase preto)
- `--border`/`--input`: `#27272a`
- Status colors: versões mais claras (`#34d399`, `#fbbf24`, `#60a5fa`)

**Regra:** Usar sempre tokens semânticos (`bg-background`, `text-foreground`), nunca hex direto.

---

## 18. Anti-Patterns (Evitar)

| Anti-Pattern | Correto |
|--------------|---------|
| `space-y-4` | `flex flex-col gap-4` |
| `w-10 h-10` | `size-10` |
| `overflow-hidden text-ellipsis whitespace-nowrap` | `truncate` |
| `bg-blue-500` direto | Usar token `bg-primary` ou `bg-info` |
| `dark:bg-gray-900` manual | Usar token semântico |
| z-index manual em Dialog/Sheet | Componente gerencia internamente |
| Ícone sem aria-label | `aria-label` ou `title` |
| Placeholder como label | `<Label>` sempre visível |
| Erro só no topo | Erro abaixo do campo |
| Cor como único indicador | Adicionar ícone/texto |
