/* istanbul ignore file */
import {render} from '@react-email/render';
import nodemailer from 'nodemailer';
import LoginEmail from '../emails/login';
import {devLog} from '../helpers';
import type {Context} from './Context';
import {Environment} from './Environment';
import {WithContext} from './WithContext';

interface SendConfig {
	from: string;
	to: string;
	subject: string;
	template: any;
	text: string;
}

interface SendLoginEmailProps {
	email: string;
	code: string;
}

export class EmailManager extends WithContext {
	private transporter;

	constructor(context: Context) {
		super(context);

		const { user, password } = context.env.email;

		this.transporter = nodemailer.createTransport({
			host: 'smtp.ionos.co.uk',
			port: 465,
			requireTLS: true,
			auth: {
				user,
				pass: password,
			},
		});
	}

	public async sendLoginEmail({ email, code }: SendLoginEmailProps) {
		if (Environment.isTest() || !this.context.env.email.user) {
			return;
		}

		if (email.endsWith('@test.com')) {
			devLog(`Login code: ${code}`);
			return;
		}

		return this.send({
			from: this.context.env.email.user,
			to: email,
			subject: 'Login to Swords & Dice',
			template: LoginEmail({ email, code }),
			text: `Your login code is ${code}`,
		});
	}

	private async send({ from, to, subject, template, text }: SendConfig) {
		try {
			const html = await render(template);

			const options = {
				from,
				to,
				subject,
				html,
				text,
			};

			await this.transporter.sendMail(options);
		} catch (e) {
			this.context.tracer.logError(
				'send',
				`Failed to send email: ${(e as Error).message}`,
				{
					e,
					from,
					to,
					subject,
				},
			);
		}
	}
}
