// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const fetch = require("node-fetch");
const uuidv4 = require('uuid/v4');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "html-md-converter" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json    
    let disposable = vscode.commands.registerCommand('extension.convertHTMLtoMarkdown', async function() { await convertHTMLtoMarkdown(); });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

async function convertHTMLtoMarkdown() {
    // check active window         
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active Editor!');
        return;
    }

    // check markdown mode          
    if (editor.document.languageId !== 'html') {
        vscode.window.showWarningMessage('It is not a html mode!');
        return;
    }

    let htmlFileName = editor.document.uri.fsPath;
    let ext = path.extname(htmlFileName);
    if (!fs.existsSync(htmlFileName)) {
        if (editor.document.isUntitled) {
            vscode.window.showWarningMessage('File not saved. Please, save before converting!');
            return;
        }
        vscode.window.showWarningMessage('File name does not get!');
        return;
    };

    let data = {
        guid: uuidv4(),
        content: editor.document.getText(),
        mode: "html-md"
    };

    // convert and export html to markdown
    try {
        let response = await fetch('https://tools.andruhovski.com/api/convert', {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        let mdFileName = htmlFileName.replace(ext, '.md');
        let blob = await response.blob();
        let readableStream = blob.stream().on('end', () => {
            vscode.window.showInformationMessage("File saved: " + mdFileName);
        });
        let writableStream = fs.createWriteStream(mdFileName);
        readableStream.pipe(writableStream);
    } catch (err) {
        vscode.window.showErrorMessage(`Converter: ${err.message}`);
        return;
    }

}
// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}