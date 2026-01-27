import {
	type ClassType,
	transformAndValidateSync,
} from 'class-transformer-validator';
import type { ValidationError } from 'class-validator';
import { isEmail } from 'class-validator';
import { validate as isUUID } from 'uuid';
import { WithContext } from './WithContext';

export class ValidationHelpers extends WithContext {
	public checkUUID(id: string): string {
		if (!isUUID(id)) {
			throw this.getValidationError(`Invalid UUID: ${id}`);
		}

		return id;
	}

	public checkNumber(id: number | string): number {
		if (Number.isNaN(Number(id))) {
			throw this.getValidationError(`Invalid number: ${id}`);
		}

		return Number(id);
	}

	public checkEmail(email: string): string {
		if (!isEmail(email)) {
			throw this.getValidationError(`Invalid email: ${email}`);
		}

		return email;
	}

	public validate<T extends object>(type: ClassType<T>, value: any): T {
		if (!value) {
			throw this.getValidationError(
				`Validation failed: undefined object. Expected: ${type.name}`,
			);
		}

		try {
			return transformAndValidateSync(type, value, {
				transformer: {
					excludeExtraneousValues: true,
					exposeUnsetFields: false,
				},
			}) as T;
		} catch (e) {
			const error = (e as ValidationError[])[0];
			const allConstraints: { [type: string]: string }[] = [];

			const checkChildForErrors = (e: ValidationError) => {
				if (e.constraints) {
					allConstraints.push(e.constraints);
				}

				if (e.children) {
					for (const error of e.children) {
						/* istanbul ignore next */
						checkChildForErrors(error);
					}
				}
			};

			checkChildForErrors(error);

			const sensitive = ['password', 'twoFactorCode'];

			for (const key of sensitive) {
				Reflect.deleteProperty(value, key);
			}

			throw this.getValidationError(
				`Validation failed: 
${JSON.stringify(allConstraints, null, 4)}`,
			);
		}
	}
}
