import * as code from 'vscode';

/// Control dart pad or flutter pad.
export interface IPadController {
  openPad(context: code.ExtensionContext): Promise<void>;
}