/** @type {import('dependency-cruiser').IConfiguration} */
const config = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'plugin-no-components',
      severity: 'error',
      from: { path: '^src/plugin/' },
      to: { path: '^src/components/' },
    },
    {
      name: 'features-no-components',
      severity: 'error',
      from: { path: '^src/features/' },
      to: { path: '^src/components/' },
    },
    {
      name: 'components-no-features-plugin',
      severity: 'error',
      from: { path: '^src/components/' },
      to: { path: '^src/(features|plugin)/' },
    },
    {
      name: 'integration-no-react',
      severity: 'error',
      from: { path: '^src/integration/' },
      to: { path: 'node_modules/(react|react-dom)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
}

export default config
