module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'react-app',
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
    },
    plugins: ['react', '@typescript-eslint', 'react-hooks', 'unicorn'],
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                // "@typescript-eslint/no-unused-vars": [
                //     1,
                //     {
                //         "args": "none"
                //     }
                // ],
                'no-console': 0,
                '@typescript-eslint/no-unused-vars': 'off',
                'no-unused-expressions': 'off',
                'no-restricted-syntax': 0,
                '@typescript-eslint/no-unused-expressions': 2,
                'react/jsx-boolean-value': 0,
                'import/order': 0,
                'react/jsx-curly-brace-presence': 0
            }
        }
    ],
    ignorePatterns: ['*.js'],
    rules: {
        'react/jsx-filename-extension': [
            'warn',
            {
                extensions: ['.tsx', '.ts']
            }
        ],
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-trailing-spaces': 'off',
        'no-undef': 0,
        'no-redeclare': 0,
        'sort-imports': 'off',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'react/jsx-one-expression-per-line': 0,
        'react/prop-types': 0,
        'react/forbid-prop-types': 0,
        'react/jsx-indent': 0,
        'react/jsx-wrap-multilines': [
            'error',
            {
                declaration: false,
                assignment: false
            }
        ],
        'react/self-closing-comp': 0,
        'react/state-in-constructor': 0,
        'react/jsx-props-no-spreading': 0,
        'react/destructuring-assignment': 0,
        'react/require-default-props': 0,
        'react/sort-comp': 0,
        'react/display-name': 0,
        'react/static-property-placement': 0,
        'react/no-find-dom-node': 0,
        'react/no-unused-prop-types': 0,
        'react-hooks/rules-of-hooks': 2, // Checks rules of Hooks
        'react-hooks/exhaustive-deps': 0,
        'react/jsx-uses-react': 0,
        'react/react-in-jsx-scope': 0,
        'import/no-cycle': 0,
        'import/no-extraneous-dependencies': 0,
        'jsx-a11y/no-static-element-interactions': 0,
        'jsx-a11y/anchor-has-content': 0,
        'jsx-a11y/click-events-have-key-events': 0,
        'jsx-a11y/anchor-is-valid': 0,
        'jsx-a11y/no-noninteractive-element-interactions': 0,
        'jsx-a11y/label-has-for': 0,
        'consistent-return': 0,
        'no-param-reassign': 0,
        'no-underscore-dangle': 0,
        'no-plusplus': 0,
        'no-continue': 0,
        'no-unused-vars': 0,
        'no-restricted-globals': 0,
        'max-classes-per-file': 0,
        'jest/no-test-callback': 0,
        'jest/expect-expect': 0,
        'unicorn/better-regex': 0,
        'unicorn/prefer-trim-start-end': 2,
        'unicorn/expiring-todo-comments': 2,
        'unicorn/no-abusive-eslint-disable': 2,
        semi: ['off'],
        '@typescript-eslint/semi': ['error', 'never'],
        'comma-dangle': ['off'],
        '@typescript-eslint/comma-dangle': ['error', 'never'],
        'arrow-body-style': 0,
        'jsx-quotes': ['error', 'prefer-single'],
        'import/no-webpack-loader-syntax': 0,
        'import/no-unresolved': 0,
        'import/prefer-default-export': 0,
        'react/no-array-index-key': 0,
        'react/no-unescaped-entities': 0,
        camelcase: 0,
        'jsx-a11y/no-autofocus': 0,
        'jest/valid-title': 0,
        'no-return-assign': 0,
        'no-nested-ternary': 0,
        'no-console': 1,
        'dot-notation': 0,
        'no-useless-escape': 0,
        'react/jsx-key': [0, { checkFragmentShorthand: false }],
        'react/no-danger': 0,
        'import/order': 0
    }
}
