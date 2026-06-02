# Mockup — Entrega 1 (referência visual da SA)

> Aberto 18/05/2026 · Vencimento 25/05/2026. Capacidades: CT6 (padrão de projeto), CT13 (especificações técnicas), CS3 (organização).
>
> **Estas imagens são a referência visual de base** que orienta o desenvolvimento de TODAS as telas ao longo da SA. Quando for implementar uma tela em React, abra a imagem correspondente aqui antes. Mobile-first (referência 390px), depois desktop (1440px).

## Onde estão

```
docs/design/
├── mobile/           # telas na versão mobile (~390px)
├── desktop/          # telas na versão desktop (~1440px)
└── guia-de-estilo/   # paleta de cores + tipografia/ícones (design system base)
```

Mesma tela em formatos diferentes tem o **mesmo nome** nas duas pastas (ex: `mobile/login-google.png` ↔ `desktop/login-google.png`).

## Guia de estilo (design system base)

| Arquivo | Conteúdo |
|---------|----------|
| [`guia-de-estilo/paleta-de-cores.png`](guia-de-estilo/paleta-de-cores.png) | Paleta de cores do app, com hex. **Fonte da verdade pros tokens de cor** quando montar o tema do frontend. |
| [`guia-de-estilo/tipografia-icones.png`](guia-de-estilo/tipografia-icones.png) | Tipografia (fonte Poppins), conjunto de ícones e logo. |

## Catálogo de telas (pareamento mobile ↔ desktop)

| Tela | Mobile | Desktop | O que é |
|------|--------|---------|---------|
| **intro** | `intro.png`, `intro-2.png` | — | Splash com a logo Ferrovia Santa Cruz |
| **boas-vindas** | `boas-vindas.png`, `boas-vindas-2.png` | — | Menu de entrada: Criar Conta / Acessar Conta / login Google |
| **login** | `login.png`, `login-preenchido.png` | — | Entrar na conta: email, senha, esqueceu senha |
| **login-google** | `login-google.png` | `login-google.png` | Modal "Faça login" do Google |
| **cadastro** | `cadastro.png`, `cadastro-2.png` | — | Criar conta: nome, email, senha, termos |
| **dashboard** | `dashboard.png` | `dashboard.png` | Visão geral do gestor: linhas ativas, manutenção, sensores + cadastro de manutenção/horário |
| **usuarios-lista** | `usuarios-lista.png` | `usuarios-lista.png` | Grid de funcionários: foto, cargo, status ativo/inativo |
| **usuarios-cadastro** | `usuarios-cadastro.png`, `usuarios-cadastro-cliente.png` | — | Cadastrar funcionário/cliente: foto, nome, email, telefone, cargo |
| **usuarios-editar** | — | `usuarios-editar.png`, `usuarios-editar-edicao.png` | Info/edição de funcionário (leitura e edição de perfil) |
| **carga-lista** | `carga-lista.png`, `carga-lista-tabela.png` | `carga-lista.png` | Monitoramento de carga/passageiros: vagões, limites (170t / 24 pessoas), mapa de poltronas |
| **carga-cadastro** | `carga-cadastro.png` | `carga-cadastro.png` | Form de cadastro de carga: tipo, peso, partida, destino, vagão |
| **linhas** | `linhas.png` | `linhas.png` | Gestão de rotas: mapa + status (manutenção/atraso/fechado/ativo) |
| **alertas** | `alertas.png` | `alertas.png` | Envio de alerta (linha/tempo/motivo/status) + notificações enviadas |

> Os sufixos (`-2`, `-preenchido`, `-cliente`, `-tabela`, `-edicao`) marcam variações/estados da mesma tela.

## Cobertura vs. as 7 telas obrigatórias da SA — ⚠️ ler

O enunciado pede 7 telas obrigatórias. O que o mockup atual cobre:

| Tela obrigatória (enunciado) | Coberta? | Observação |
|------------------------------|----------|------------|
| a) Login | ✅ | `login` + `login-google` |
| b) Cadastro | ✅ | `cadastro` |
| c) Dashboard (frota) | ⚠️ parcial | `dashboard` foca em linhas/manutenção/sensores. O enunciado pede contagem de trens (ativos/manutenção/parados), velocidade média, alertas críticos — confirmar se está contemplado. |
| d) Página de Trens | ❌ | Não há tela dedicada de lista/detalhe de **trens**. |
| e) Página de Sensores | ❌ | Não há tela dedicada de **sensores** (só citados no dashboard). |
| f) Página de Relatórios | ❌ | "Relatório" aparece como aba em carga, mas sem tela dedicada com seleção de período/tipo. |
| g) Usuários do Sistema | ✅ | `usuarios-lista` + `usuarios-cadastro` + `usuarios-editar` |

**O grupo modelou a ferrovia em torno de carga/passageiros/linhas/funcionários/manutenção/alertas** — não nos termos literais do enunciado (trens/sensores/relatórios). Isso é uma divergência consciente ou um gap? Decisão do grupo. Se for pra bater 100% com a rubrica CT13 ("todas as 7 telas contemplam os elementos especificados"), faltam **trens**, **sensores** e **relatórios** como telas próprias, e o **dashboard** precisa dos indicadores de frota. Registrado aqui pra não passar batido na hora de implementar.
