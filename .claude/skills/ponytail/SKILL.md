---
name: ponytail
description: Use ao escrever código de implementação — antes de criar função/arquivo/dependência/abstração nova e durante o GREEN do /tdd — pra forçar a solução mais enxuta que resolve a tarefa. Dispara também quando algo parecer over-engineered, inchado, cheio de boilerplate, ou quando bater o pensamento "será que precisa disso?". O melhor código é o que você não escreveu.
---

# Ponytail — o dev sênior mais preguiçoso da sala

Princípio único: **o melhor código é o que você não escreveu.** Toda linha é passivo — alguém vai ler, testar, debugar e manter ela. A pergunta antes de escrever não é "como eu faço isso?", é **"eu preciso fazer isso?"**.

## Relação com o resto (isto NÃO é regra nova)

É o *procedimento* da P0 *No Bloat, No Duplication, No Over-engineering* do [`.claude/CLAUDE.md`](../../CLAUDE.md). A P0 diz o **valor**; aqui está a **escada** pra cumprir ela na hora de escrever. Roda **dentro do GREEN do `/tdd`** (código mínimo pra passar o teste) e **depois do `/brainstorming`** ter fechado o escopo. Não substitui nenhuma — é a lente do *quanto*, enquanto o `/tdd` é a do *quando*.

## A escada — pare no primeiro degrau que resolve

Antes de escrever qualquer função, arquivo, dependência ou abstração, desça na ordem. O primeiro degrau que resolve **ganhou** — não desça mais.

1. **Precisa existir?** A tarefa PEDE isso, ou você está adivinhando que "vai precisar"? Se ninguém pediu, não escreva. (YAGNI) O degrau que mais economiza código é o que apaga a feature inteira.
2. **Já existe no codebase?** `grep`/busca antes de criar. Um endpoint parecido, um componente, um helper de conexão. Reusar > reescrever. Reescrever "porque o existente não é perfeito" é furo — melhore o existente ou use como está.
3. **Stdlib ou recurso nativo do framework resolve?** Python stdlib (`datetime`, `itertools`, `pathlib`, `json`), Pydantic/FastAPI nativo (validação, `Depends`, response models), API nativa do browser/React (`fetch`, `Intl`, `FormData`, CSS puro, `<dialog>`) — **antes** de qualquer dependência nova.
4. **Uma dependência já instalada cobre?** Olhe `requirements.txt` / `package.json`. Antes de `pip install` / `npm i` algo novo, confirme que nada que já está aí faz o serviço.
5. **Dá numa linha ou num helper bobo?** Uma função de 3 linhas antes de uma classe. Um `if` antes de uma "estratégia configurável". Não construa um sistema pro que é um valor.
6. **Só então:** a implementação mínima que passa no teste. E **para** — nada além do que o teste exige.

## A guarda — o que "enxugar" NUNCA toca

Preguiça não é desleixo. Cortar **destes** não é enxugar, é furar o trabalho:

- **Segurança** — SQL **sempre parametrizado** (`%s`, nunca f-string) e validação Pydantic na fronteira. É P0 do projeto. "Query interna" não é desculpa.
- **Perda de dados** — transação onde a operação é composta; confirmação antes de `DELETE`/`UPDATE` destrutivo no banco.
- **Acessibilidade + responsivo mobile** — é requisito da SA, não enfeite. Label em input, foco visível, layout que funciona no celular. Não é "código a mais".
- **Estado de erro pro usuário** — erro tratado e visível (4xx com mensagem clara, tela que diz o que deu errado). Nunca 500 mudo nem tela branca.

Cortar boilerplate é o objetivo. Cortar essas quatro é bug.

## Cheiros que disparam o corte

| Cheiro | O corte |
|--------|---------|
| Implementação paralela do que já existe | Apaga, usa o que já tem |
| Knob "flexível/configurável" com um valor só | Chumba o valor, tira o knob |
| Wrapper/adapter pra um único caller | Chama direto |
| Abstração "pra quando precisar" | Remove até precisar de verdade |
| Dep nova pro que a stdlib/nativo faz | Troca pelo nativo |
| 200 linhas pro que cabe em 30 | Reescreve no mínimo |
| `try/except` ou validação pra estado impossível | Tira — se não pode acontecer, não trate |

## Quando parar de cortar

Você enxugou até bater **na guarda** ou até o **mínimo que resolve a tarefa** — parou. Cortar além disso vira código que não faz o que foi pedido. Preguiça que quebra requisito não é preguiça, é retrabalho com passo extra.

## Checklist de saída

- [ ] Desci a escada — não tem nada que um degrau acima já resolvia.
- [ ] Toda linha rastreia até a tarefa pedida; nada especulativo.
- [ ] `grep` feito — não reimplementei o que já existe no codebase.
- [ ] Nenhuma dependência nova que stdlib / nativo / dep-já-instalada cobriria.
- [ ] A guarda intacta: SQL parametrizado, perda de dados, a11y/responsivo, erro pro usuário.

Marcou tudo = entregou o mínimo que resolve **e** protege. É esse o alvo.
