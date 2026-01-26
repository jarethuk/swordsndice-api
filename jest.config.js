process.env.SESSION_KEY =
	'lijsdrglkjhsefkgjhsdfkgjhdfkgjhdfkgjhlsdkfjghsldkfjhlkdsfgsdfgsegfghj';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.POSTGRES_URL_NON_POOLING =
	'postgresql://postgres:postgres@localhost:5432/forest';
process.env.POSTGRES_PRISMA_URL =
	'postgresql://postgres:postgres@localhost:5432/forest';
process.env.NODE_ENV = 'test';

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	passWithNoTests: true,
	collectCoverage: true,
	maxConcurrency: 1,
	maxWorkers: 4,
	testTimeout: 10_000,
	testMatch: ['<rootDir>/**/*.spec.ts', '<rootDir>/**/*.test.ts'],
	reporters: ['default', 'jest-junit'],
	collectCoverageFrom: ['./{!(index),}.ts', './**/{!(index),}.ts'],
	coveragePathIgnorePatterns: ['.d.ts', '.next'],
};
