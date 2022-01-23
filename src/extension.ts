import * as vscode from 'vscode';
import { DartPadController } from './commands/dart_pad_controller';

export function activate(context: vscode.ExtensionContext) {
	let dartPadController = new DartPadController();

	let openDartPad = vscode.commands.registerCommand(
		'dartPad.openDartPad',
		async () => await dartPadController.openPad(context)
	);

	context.subscriptions.push(openDartPad);
}
