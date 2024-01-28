# HMOC (HTML & MD Online Converter)

HTML (MD) VSCode is built with aspose.cloud Converter allows converting Markdown to HTML and PDF format.

## Features

Converter supports the following commands:

* Convert HTML to MD
* Convert HTML to PDF
* Convert HTML to DOCX
* Export Converter settings

By default, all actions run in the current directory.

## Requirements

* An Internet connection channel

## Usage

### Command Palette

1. Open the Markdown file
1. Press `F1` or `Ctrl+Shift+P`
1. Type `A2:` and select below
   * `A2: Convert HTML to MD`
   * `A2: Convert HTML to PDF`
   * `A2: Convert HTML to DOCX`

### Menu

1. Open the Markdown file
1. Right click and select below
   * `A2: Convert HTML to MD`
   * `A2: Convert HTML to PDF`
   * `A2: Convert HTML to DOCX`

## Extension Settings

HMOC contributes the following settings:

* `hmoc.outputDirectory`: Location for output files. Default is `.` (current).
* `hmoc.paper.orientation`: Paper orientation for PDF files. Accepted values `Portrait` or `Landscape`.
* `hmoc.paper.size`: Paper Size [`A0`, `A1`, `A2`, `A3`, `A4`, `A5`, `A6`, `Letter`, `Legal`]. The value `Custom` means using options `Width` and `Height` instead Paper Size.
* `hmoc.paper.width`: Paper Width, accepts values labeled with units(mm, cm, in, px).
* `hmoc.paper.height`: Paper Height, accepts values labeled with units(mm, cm, in, px).
* `hmoc.margin.top`: Top margin (units: mm, cm, in, px).
* `hmoc.margin.bottom`: Bottom margin (units: mm, cm, in, px).
* `hmoc.margin.right`: Right margin (units: mm, cm, in, px).
* `hmoc.margin.left`: Left margin (units: mm, cm, in, px)."

## Known Issues

* MD-to-PDF conversion: The `@page` CSS at-rule can be applied incorrectly.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of HMOC

### 0.0.2

Updated to VS Code vesrion 1.85.0
