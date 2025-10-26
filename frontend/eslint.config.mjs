import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'dist/**', 'public/**', 'coverage/**', 'prisma/generated/**', 'next.config.ts', 'src/generated/**'],
    },
    {
        rules: {
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-unused-vars': 'warn',
            eqeqeq: ['error', 'always'],
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-empty-function': 'warn',
            '@typescript-eslint/no-empty-interface': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
            '@next/next/no-img-element': 'warn',
            '@next/next/no-html-link-for-pages': 'warn',
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
        },
    },
];

export default eslintConfig;
