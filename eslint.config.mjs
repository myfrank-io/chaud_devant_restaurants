import next from 'eslint-config-next'

// eslint-config-next 16 expose directement une config plate : pas besoin du
// pont FlatCompat, qui casse sur ESLint 10.
const config = [
  ...next,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
]

export default config
