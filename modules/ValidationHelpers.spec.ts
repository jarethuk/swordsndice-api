import { Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { v4 as uuid } from 'uuid';
import { getEmptyContext } from '../helpers/TestHelpers';
import { ValidationHelpers } from './ValidationHelpers';

class TestClass {
	@IsBoolean()
	@Expose()
	pass!: boolean;
}

describe('ValidationHelpers', () => {
	let helper: ValidationHelpers;

	beforeAll(() => {
		helper = new ValidationHelpers(getEmptyContext());
	});

	describe('checkUUID', () => {
		it('Should throw if NOT valid', () => {
			expect(() => helper.checkUUID('stuff')).toThrow('Invalid UUID: stuff');
		});

		it('Should return the value when valid', () => {
			const id = uuid();
			const result = helper.checkUUID(id);
			expect(result).toEqual(id);
		});
	});

	describe('checkNumber', () => {
		it('Should throw if NOT valid', () => {
			expect(() => helper.checkNumber('stuff' as any)).toThrow(
				'Invalid number: stuff',
			);
		});

		it('Should return the value when valid', () => {
			const id = 1;
			const result = helper.checkNumber(id);
			expect(result).toEqual(id);
		});
	});

	describe('checkEmail', () => {
		it('Should throw if NOT valid', () => {
			expect(() => helper.checkEmail('stuff' as any)).toThrow(
				'Invalid email: stuff',
			);
		});

		it('Should return the value when valid', () => {
			const email = 'test@test.com';
			const result = helper.checkEmail(email);
			expect(result).toEqual(email);
		});
	});

	describe('validate', () => {
		it('Should error if the data is undefined', async () => {
			expect(() => helper.validate(TestClass, undefined as any)).toThrow(
				'Validation failed: undefined object.',
			);
		});

		it('Should error if the data is invalid', async () => {
			expect(() =>
				helper.validate(TestClass, {
					pass: 'stuff',
				}),
			).toThrow('pass must be a boolean value');
		});

		it('Should return the filtered object when valid', async () => {
			const result = await helper.validate(TestClass, {
				pass: true,
				other: 'stuff',
			});

			expect(result).toEqual({
				pass: true,
			});
		});

		it('Should handle empty object', async () => {
			expect(() => helper.validate(TestClass, {})).toThrow();
		});
	});
});
