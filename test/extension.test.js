const assert = require('assert');
const vscode = require('vscode');
const { validateEditor, getApiUrl } = require('../extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	suite('validateEditor', () => {
		test('returns error when editor is undefined', () => {
			const result = validateEditor(undefined, 'html');
			assert.strictEqual(result, 'No active Editor!');
		});

		test('returns error when document language is not html', () => {
			const mockEditor = {
				document: {
					languageId: 'markdown',
					isUntitled: false,
					uri: { fsPath: '/some/file.md' },
				},
			};
			const result = validateEditor(mockEditor, 'html');
			assert.strictEqual(result, 'It is not a html mode!');
		});

		test('returns error when document is untitled', () => {
			const mockEditor = {
				document: {
					languageId: 'html',
					isUntitled: true,
					uri: { fsPath: '' },
				},
			};
			const result = validateEditor(mockEditor, 'html');
			assert.strictEqual(result, 'File not saved. Please, save before converting!');
		});
	});

	suite('getApiUrl', () => {
		test('returns URL ending with /convert', () => {
			const url = getApiUrl();
			assert.ok(url.endsWith('/convert'), `Expected URL to end with /convert, got: ${url}`);
		});

		test('uses development API base URL from workspace settings', () => {
			const url = getApiUrl();
			assert.strictEqual(url, 'https://localhost:7141/api/convert');
		});
	});
});
