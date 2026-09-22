import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import local from './eslint-rules/index.js'

const RAW_CONTROLS = {
  selector: 'JSXOpeningElement[name.name=/^(button|input|select|textarea|dialog)$/]',
  message: 'Use o componente de @/components/ui em vez do elemento cru (L13b).',
}
const INLINE_STYLE = {
  selector: "JSXAttribute[name.name='style']",
  message: 'style={} é proibido: use classes Tailwind com tokens (L13d).',
}
const IMPORT_PAGES = {
  group: ['@/pages', '@/pages/*', '**/pages', '**/pages/*'],
  message: 'Não importe páginas daqui (L13c).',
}

export default defineConfig(
  { ignores: ['dist', 'node_modules', 'src/**/*.jsx'] },
  {
    files: ['eslint.config.js', 'eslint-rules/**/*.js'],
    extends: [js.configs.recommended],
    plugins: { local },
    rules: { 'local/no-comments': 'error' },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { local },
    rules: {
      'local/no-comments': 'error',
      'local/no-raw-color': 'error',
      'local/no-arbitrary-value': 'error',
      'no-restricted-syntax': ['error', RAW_CONTROLS, INLINE_STYLE],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Só src/lib/api/** chama fetch (L13c).' },
      ],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'local/no-arbitrary-value': 'off',
      'react-refresh/only-export-components': 'off',
      'no-restricted-syntax': ['error', INLINE_STYLE],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'cn', message: 'Use cn de @/lib/utils (o registry do shadcn gera "cn").' },
            { name: 'next-themes', message: 'Use useTheme de @/contexts/ThemeContext.' },
          ],
          patterns: [IMPORT_PAGES],
        },
      ],
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@radix-ui/*'],
              message: 'Páginas usam @/components/ui, não Radix direto (L13c).',
            },
            IMPORT_PAGES,
            { group: ['./*', '../*'], message: 'Em páginas, importe via alias @/ (L13c).' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/api/**/*.{ts,tsx}'],
    rules: { 'no-restricted-globals': 'off' },
  },
  prettier,
)
