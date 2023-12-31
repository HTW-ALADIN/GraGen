/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    "./test/**"
  ],
  coverageThreshold: {
    global: {
      lines: 90
    }
	}
};