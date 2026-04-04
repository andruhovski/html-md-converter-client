const vscode = require("vscode");
const path = require("node:path");
const uuidv4 = require("uuid").v4;
const Buffer = require("node:buffer").Buffer;
const existsSync = require("node:fs").existsSync;
const writeFile = require("node:fs/promises").writeFile;
const PROD_API_BASE_URL = "https://tools.andruhovski.com/api/";
const REQUEST_TIMEOUT_MS = 60000;

/**
 * Returns the full API endpoint URL, resolved from VS Code configuration.
 * @returns {string}
 */
function getApiUrl() {
  const config = vscode.workspace.getConfiguration("hmoc");
  const baseUrl = config.get("apiBaseUrl") || PROD_API_BASE_URL;
  return (baseUrl.endsWith("/") ? baseUrl : baseUrl + "/") + "convert";
}

let conversionInProgress = false;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Extension "HTML & MD Online Converter" is active now!');

  const commands = {
    "hmoc.convertHTMLtoMarkdown": async () => await convertHTMLtoFormat("md"),
    "hmoc.convertHTMLtoPDF": async () => await convertHTMLtoFormat("pdf"),
    "hmoc.convertHTMLtoDOCX": async () => await convertHTMLtoFormat("docx"),
    "hmoc.convertHTMLtoXLSX": async () => await convertHTMLtoFormat("xlsx"),
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
    return "File not found on disk!";
  }

  return "";
}

/**
 * @param {string} conversionType
 */
async function convertHTMLtoFormat(conversionType) {
  if (conversionInProgress) {
    vscode.window.showWarningMessage("A conversion is already in progress.");
    return;
  }

  const editor = vscode.window.activeTextEditor;
  const errorMessage = validateEditor(editor, "html");

  if (errorMessage !== "") {
    vscode.window.showWarningMessage(errorMessage);
    return;
  }

  const htmlFileName = editor.document.uri.fsPath;
  const config = vscode.workspace.getConfiguration("hmoc");

  const data = {
    guid: uuidv4(),
    content: editor.document.getText(),
    mode: config.get(`${conversionType}.mode`),
    githubFlavored: true,
    removeComments: true,
    paper: {
      size: config.get("paper.size"),
      orientation: config.get("paper.orientation"),
      width: config.get("paper.width"),
      height: config.get("paper.height"),
    },
    margins: {
      top: config.get("margins.top"),
      bottom: config.get("margins.bottom"),
      left: config.get("margins.left"),
      right: config.get("margins.right"),
    },
  };

  conversionInProgress = true;
  let timeoutId;
  try {
    const ext = path.extname(htmlFileName);
    const abortController = new AbortController();
    timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    const response = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "HTML & MD Online Converter",
        cancellable: true,
      },
      async (progress, token) => {
        token.onCancellationRequested(() => {
          clearTimeout(timeoutId);
          abortController.abort();
        });
        progress.report({ message: "Conversion in progress..." });
        return fetch(getApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: abortController.signal,
        });
      }
    );

    if (response.ok) {
      let outputDirectory = config.get("outputDirectory") || "<current>";
      if (outputDirectory === "<current>") {
        outputDirectory = path.dirname(htmlFileName);
      }
      const outputFileName = htmlFileName.replace(ext, "." + conversionType);
      const outputFullPath = path.resolve(
        path.join(outputDirectory, path.basename(outputFileName))
      );
      const buffer = await response.arrayBuffer();
      await writeFile(outputFullPath, Buffer.from(buffer));
      vscode.window.showInformationMessage("File saved: " + outputFullPath);
    } else {
      let errorDetail = response.statusText;
      try {
        const errorBody = await response.text();
        if (errorBody) errorDetail = errorBody;
      } catch (_) { /* ignore */ }
      vscode.window.showErrorMessage(`Converter error (${response.status}): ${errorDetail}`);
    }
  } catch (err) {
    if (err.name === "AbortError") {
      vscode.window.showWarningMessage("Conversion cancelled or timed out.");
    } else {
      vscode.window.showErrorMessage(`Converter: ${err.message}`);
    }
  } finally {
    clearTimeout(timeoutId);
    conversionInProgress = false;
  }
}

function deactivate() { }

module.exports = {
  activate,
  deactivate,
  validateEditor,
  getApiUrl,
};
