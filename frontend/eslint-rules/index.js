const ALLOWED_COMMENT = /^(\/ <reference|\s*(eslint-disable|eslint-enable|@ts-expect-error))/

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/i
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab)\(/i
const PALETTE_CLASS =
  /^(?:bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|fill|stroke|from|via|to|outline|decoration|shadow|accent|caret|divide|placeholder)-(?:(?:slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)(?:\/\d+)?$/
const ARBITRARY = /(?:^|[-:!])\[/

function classTokens(text) {
  return text.split(/\s+/).map((token) =>
    token
      .split(':')
      .pop()
      .replace(/^[!-]+/, ''),
  )
}

function onStrings(check) {
  return {
    Literal(node) {
      if (typeof node.value === 'string') check(node, node.value)
    },
    TemplateElement(node) {
      check(node, node.value.cooked ?? node.value.raw)
    },
  }
}

const noComments = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    messages: { comment: 'Comentários são proibidos (L7).' },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (ALLOWED_COMMENT.test(comment.value)) continue
          context.report({
            loc: comment.loc,
            messageId: 'comment',
            fix: (fixer) => fixer.removeRange(comment.range),
          })
        }
      },
    }
  },
}

const noRawColor = {
  meta: {
    type: 'problem',
    messages: { color: 'Cor crua "{{value}}": use um token semântico do tema (L13a).' },
    schema: [],
  },
  create(context) {
    return onStrings((node, text) => {
      const match =
        text.match(HEX)?.[0] ??
        text.match(COLOR_FN)?.[0] ??
        classTokens(text).find((token) => PALETTE_CLASS.test(token))
      if (match) context.report({ node, messageId: 'color', data: { value: match } })
    })
  },
}

const noArbitraryValue = {
  meta: {
    type: 'problem',
    messages: {
      arbitrary: 'Valor arbitrário Tailwind "{{value}}": use a escala/tokens do tema (L13d).',
    },
    schema: [],
  },
  create(context) {
    return onStrings((node, text) => {
      const match = text.split(/\s+/).find((token) => ARBITRARY.test(token))
      if (match) context.report({ node, messageId: 'arbitrary', data: { value: match } })
    })
  },
}

export default {
  rules: {
    'no-comments': noComments,
    'no-raw-color': noRawColor,
    'no-arbitrary-value': noArbitraryValue,
  },
}
