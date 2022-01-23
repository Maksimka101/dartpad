import * as vscode from 'vscode';
import { DartPadController } from './commands/dart_pad_controller';

export function activate(context: vscode.ExtensionContext) {
	let dartPadController = new DartPadController();

	let openDartPad = vscode.commands.registerCommand(
		'dartPad.openDartPad',
		async () => await dartPadController.openPad(context, { inSplitView: false, withoutPackages: false })
	);

	let openDartPadInSplitView = vscode.commands.registerCommand(
		'dartPad.openDartPadInSplitView',
		async () => await dartPadController.openPad(context, { inSplitView: true, withoutPackages: false })
	);

	let openPureDartPad = vscode.commands.registerCommand(
		'dartPad.openPureDartPad',
		async () => await dartPadController.openPad(context, { inSplitView: false, withoutPackages: true })
	);

	let openPureDartPadInSplitView = vscode.commands.registerCommand(
		'dartPad.openPureDartPadInSplitView',
		async () => await dartPadController.openPad(context, { inSplitView: true, withoutPackages: true })
	);

	context.subscriptions.push(openDartPad);
	context.subscriptions.push(openDartPadInSplitView);
	context.subscriptions.push(openPureDartPad);
	context.subscriptions.push(openPureDartPadInSplitView);
}
