# Frontend — Design system

> Fase 2 do plano [`../tasks/lowh-fundacao-design-system-2026-09-22.md`](../tasks/lowh-fundacao-design-system-2026-09-22.md) (L10, L11, L13, L14). Tokens e temas: [`tema.md`](tema.md). Vitrine viva: rota **`/ui`** (todos os componentes e variantes, com o toggle de tema).

## Em uma frase

Tudo que desenha vive em `frontend/src/components/ui/`: primitivos do **shadcn/ui** (Radix + Tailwind v4) ajustados pra marca, e compostos do domínio (PageShell, StatusBadge…) montados em cima deles. Página só compõe esses componentes — não tem cor crua, controle cru, `style` nem valor arbitrário (o lint barra).

## Tokens

Vocabulário do shadcn (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `radius`) + `overlay` + status (`success`, `warning`, `danger`, `delay`). Tabela completa com valores claro/escuro em [`tema.md`](tema.md). Regra: fundo `bg-X` → texto `text-X-foreground`.

## Catálogo

### Primitivos (shadcn, `./fsc ui add`)

| Componente | Arquivo | Uso nas telas | Ajuste de marca |
|------------|---------|---------------|-----------------|
| Button | `button.tsx` | CTAs, ações de modal | pílula, semibold, `h-11`; variantes `default secondary outline ghost link destructive success`; tamanhos `xs sm default lg icon*` |
| Input, Label | `input.tsx`, `label.tsx` | todos os formulários | pílula `bg-input`, sem borda |
| Field | `field.tsx` | formulários com react-hook-form + zod | — |
| Select | `select.tsx` | tipo de carga, cargo, linha, setor | trigger em pílula igual ao Input |
| Switch | `switch.tsx` | termos/localização no login, tema | — |
| Card | `card.tsx` | blocos do dashboard, linhas | sem borda/sombra |
| Badge | `badge.tsx` | status | variantes `success warning danger delay` |
| Tabs | `tabs.tsx` | carga/passageiros/relatório | pílulas, ativa em `primary` |
| Dialog, AlertDialog | `dialog.tsx`, `alert-dialog.tsx` | modais de cadastro, confirmação | overlay pelo token |
| Sheet | `sheet.tsx` | gaveta mobile (detalhe de vagão/manutenção) | overlay pelo token |
| Table | `table.tsx` | tabela de carga no desktop | — |
| Sonner (Toaster) | `sonner.tsx` | toasts de sucesso/erro | tema lido do `ThemeContext` |
| Avatar | `avatar.tsx` | foto de funcionário/perfil | — |
| Skeleton | `skeleton.tsx` | carregamento | — |
| Tooltip | `tooltip.tsx` | rótulos do dock | — |
| Progress | `progress.tsx` | capacidade do vagão | `<progress>` nativo (o gerado usava `style`) |
| Separator | `separator.tsx` | divisória do dashboard | — |

### Compostos do domínio

| Componente | Arquivo | O que faz |
|------------|---------|-----------|
| `PageShell` | `page-shell.tsx` | Layout das telas logadas: `main` centrado (`max-w-6xl`) + dock fixo embaixo (porta do `BottomNav`: item ativo em pílula com rótulo, tooltip nos outros, inclinação 3D). |
| `AuthLayout` | `auth-layout.tsx` | Layout das telas de auth: logo + card arredondado no mobile; coluna 45% + foto no desktop. Props `title`, `description?`. |
| `ScreenHeader` | `screen-header.tsx` | `h1` da tela, botão voltar opcional (`back`), slot `actions`. |
| `StatusBadge` | `status-badge.tsx` | Status do banco → rótulo/cor (L7): `normal alerta falha manutencao atraso fechado na_estacao ja_partiu`. Tipo `Status` exportado. |
| `MetricCard` | `metric-card.tsx` | Indicador do dashboard: ícone, rótulo, valor, bolinha de `tone` (com texto pra leitor de tela). |
| `LineCard` | `line-card.tsx` | Card de rota: "Rota {numero}", `StatusBadge`, ativo/inativo. |
| `UserCard` | `user-card.tsx` | Card de funcionário do grid: foto, nome, cargo, ativo. Clicável. |
| `ThemeToggle` | `theme-toggle.tsx` | Switch claro/escuro com sol/lua. |
| `PasswordInput` | `password-input.tsx` | Input de senha com mostrar/ocultar. |
| `LoadError` | `load-error.tsx` | Estado de erro de uma query (`role="alert"`) + `mensagemDeErro(error)`: `detail` da API ou "Sem conexão com o servidor". |

## Como montar uma tela

1. Página em `src/pages/**/*.tsx`, importando só de `@/components/ui/*` (e libs), sempre por `@/`.
2. Tela logada: **não** embrulhe em `<PageShell>` — o `ProtectedLayout` do `App.tsx` já envolve toda rota logada (embrulhar de novo dá dois docks). Comece com `<ScreenHeader title="…" />`. Tela de auth: `<AuthLayout title="…">`. Só a vitrine `/ui` (rota pública) monta o `PageShell` na mão.
3. Layout mobile-first com utilitários (`grid grid-cols-2 lg:grid-cols-4`), cor só por token.
4. Formulário: `useForm({ resolver: zodResolver(schema) })` + `<Controller>` renderizando `<Field data-invalid>` / `<FieldLabel>` / controle com `aria-invalid` / `<FieldError errors={[fieldState.error]} />`. Exemplo completo em `src/pages/Vitrine.tsx` (`DemoForm`).
5. Confirmação destrutiva: `AlertDialog`. Feedback: `toast()` do `sonner` (o `<Toaster />` já está no `main.tsx`). Erro de carregamento: `<LoadError error={error} />`. `422` da API: `if (marcarErrosDeCampo(erro, form)) return` (de `@/lib/api`). Data `criado_em`: `dataHora()` de `@/lib/utils`.
6. Faltou algo? Primitivo novo → `./fsc ui add <nome>`; padrão do domínio que se repete → composto novo em `ui/`. Nunca estilo solto na página.
7. Confira em `/ui` e na própria tela, 414px e 1440px, nos dois temas.

## Legado

Não existe mais: os `src/components/<Nome>/*.jsx` foram apagados no fechamento da fase 4 (D5), quando as 13 telas já estavam em TSX sobre o DS. Telas por área: [`telas/`](telas/).
