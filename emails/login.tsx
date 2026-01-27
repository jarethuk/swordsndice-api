/* istanbul ignore file */
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	Section,
	Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface Props {
	email: string;
	code: string;
}

const LoginEmail = ({ code, email }: Props) => (
	<Html>
		<Tailwind>
			<Head />
			<Preview>Login to Swords & Dice</Preview>

			<Body
				style={{
					backgroundColor: '#15082F',
				}}
				className={'font-sans'}
			>
				<Container className={'my-12 mx-auto'}>
					<Section className={'bg-white rounded-lg p-8 w-full text-center'}>
						<Img
							src={'https://api.swordsndice.com/logo.svg'}
							width="96"
							height="96"
							alt="Swords & Dice"
							style={{ margin: '0 auto' }}
						/>

						<Heading className={'text-2xl'}>Login to Swords & Dice</Heading>

						<Text>To complete your login, enter the 6-digit code below.</Text>

						<Section className={'flex justify-center py-4'}>
							<Section className={'bg-gray-200 px-6 py-4 rounded-lg'}>
								<Text className={'text-xl font-bold tracking-widest'}>
									{code}
								</Text>
							</Section>
						</Section>

						<Text className={'text-xs'}>
							If you didn't request this, don't worry it is safe to ignore this
							email. Do not forward this email or share the code.
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

LoginEmail.PreviewProps = {
	code: '123456',
	email: 'test@test.com',
} as Props;

export default LoginEmail;
