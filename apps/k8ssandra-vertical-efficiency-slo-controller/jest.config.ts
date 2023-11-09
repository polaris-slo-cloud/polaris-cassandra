/* eslint-disable */
export default {
  displayName: 'k8ssandra-vertical-efficiency-slo-controller',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory:
    '../../coverage/apps/k8ssandra-vertical-efficiency-slo-controller',
};
