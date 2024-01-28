const vscode = require("vscode");
const path = require("node:path");
const uuidv4 = require("uuid").v4;
const Buffer = require("node:buffer").Buffer;
const existsSync = require("node:fs").existsSync;
const writeFile = require("node:fs/promises").writeFile;
//const apiURL = "https://tools.andruhovski.com/api/convert"
const apiURL = "http://localhost:5236/api/convert";

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Extension "HTML & MD Online Converter" is active now!');

  const commands = {
    "hmoc.convertHTMLtoMarkdown": async () => await convertHTMLtoFormat("md"),
    "hmoc.convertHTMLtoPDF": async () => await convertHTMLtoFormat("pdf"),
    "hmoc.convertHTMLtoDOCX": async () => await convertHTMLtoFormat("docx"),
  };

  for (const [commandId, callback] of Object.entries(commands)) {
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, callback)
    );
  }
}

/**
 * @param {vscode.TextEditor} editor
 * @param {string} languageId
 */
function validateEditor(editor, languageId) {
  if (!editor) {
    return "No active Editor!";
  }

  if (editor.document.languageId !== languageId) {
    return `It is not a ${languageId} mode!`;
  }

  if (editor.document.isUntitled) {
    return "File not saved. Please, save before converting!";
  }

  if (!existsSync(editor.document.uri.fsPath)) {
    return "File name does not get!";
  }

  return "";
}

/**
 * @param {string} conversionType
 */
async function convertHTMLtoFormat(conversionType) {
  const editor = vscode.window.activeTextEditor;
  const errorMessage = validateEditor(editor, "html");

  if (errorMessage !== "") {
    vscode.window.showWarningMessage(errorMessage);
    return;
  }

  let htmlFileName = editor.document.uri.fsPath;

  const data = {
    guid: uuidv4(),
    content: editor.document.getText(),
    mode: vscode.workspace.getConfiguration("hmoc")[conversionType]["mode"],
    githubFlavored: true,
    removeComments: true,
  };

  try {
    const ext = path.extname(htmlFileName);
    const response = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "HTML & MD Online Converter",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: "Conversion in progress..." });
        return fetch(apiURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
    );

    const outputDirectory =
      vscode.workspace.getConfiguration("hmoc")["outputDirectory"] || ".";
    const outputFileName = htmlFileName.replace(ext, "." + conversionType);
    const outputFullPath = path.resolve(
      path.join(outputDirectory, path.basename(outputFileName))
    );
    const buffer = await response.arrayBuffer();
    await writeFile(outputFullPath, Buffer.from(buffer));
    vscode.window.showInformationMessage("File saved: " + outputFullPath);
  } catch (err) {
    vscode.window.showErrorMessage(`Converter: ${err.message}`);
    return;
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
