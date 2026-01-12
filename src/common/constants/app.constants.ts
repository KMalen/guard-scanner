export const APP_CONSTANTS = {
	SCAN_RESULTS_DIR: 'scan-results',

	SCAN_QUEUE_NAME: 'scan',

	JOB_TRIVY_SCAN: 'tryvi-job',
	JOB_JSON_PARSE: 'json-parse',

	SEVERITY_CRITICAL: 'CRITICAL',

	HTTP_TIMEOUT: 60000,

	STREAM_FILTER_REGEX: /Results\.\d+\.Vulnerabilities\.\d+/,
	VULNERABILITY_BATCH_SIZE: 100,
	VULNERABILITY_MAX_IN_FLIGHT: 2,
} as const;
