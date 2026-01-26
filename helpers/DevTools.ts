/* istanbul ignore file */
// Use console log for temp logs. This for ones which are permanent
export function devLog(message: any, data?: any): void {
	console.log(message, data ?? '');
}
