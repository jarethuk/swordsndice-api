import {Environment} from './Environment';

describe('Environment', () => {
	beforeEach(() => {
		(process.env as any).VERCEL_ENV = 'test';
	});

	describe('current', () => {
		it('Should return the current environment', () => {
			expect(Environment.current).toEqual('test');
		});
	});

	describe('isLocal', () => {
		it('Should return false when NOT local', () => {
			expect(Environment.isLocal()).toBeFalsy();
		});

		it('Should return true when local', () => {
			(process.env as any).VERCEL_ENV = 'development';
			expect(Environment.isLocal()).toBeTruthy();
		});
	});

	describe('isProduction', () => {
		it('Should return false when NOT production', () => {
			expect(Environment.isProduction()).toBeFalsy();
		});

		it('Should return true when local', () => {
			(process.env as any).VERCEL_ENV = 'production';
			expect(Environment.isProduction()).toBeTruthy();
		});
	});

	describe('isTest', () => {
		it('Should return false when NOT test', () => {
			(process.env as any).VERCEL_ENV = 'production';
			expect(Environment.isTest()).toBeFalsy();
		});

		it('Should return true when local', () => {
			expect(Environment.isTest()).toBeTruthy();
		});
	});
});
