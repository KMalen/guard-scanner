export function isError(error: unknown): error is Error {
	return error instanceof Error;
}

export function getErrorMessage(error: unknown): string {
	if (isError(error)) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'Unknown error';
}
