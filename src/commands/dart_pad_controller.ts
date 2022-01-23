import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as fs_utils from '../utils/fs_utils';
import { dartMainTemplate } from '../utils/dart_main_template';
import { IPadController, PadConfig } from './i_pad_controller';
import { CommandDoesNotExist, ensureCommandExist as ensureCommandExist, executeCommand, installPackagesIfNeeded } from '../utils/process_utils';

export class DartPadController implements IPadController {
  async openPad(context: vscode.ExtensionContext, config: PadConfig): Promise<void> {
    let cacheUri = context.globalStorageUri;

    let result = await this.initializePadIfNeeded(cacheUri, config);

    await vscode.window.showTextDocument(
      this.getDartPadMainUri(cacheUri),
      { viewColumn: config.inSplitView ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active },
    );

    // Need to open dart pad workspace when user has set `packages` because dart analyzer must "see" `pubspec.yaml` file.
    if (result.openDartPadWorkspace) {
      vscode.workspace.updateWorkspaceFolders(
        vscode.workspace.workspaceFolders?.length ?? 0, null,
        { uri: this.getDartPadUri(cacheUri), name: "Dart Pad workspace" },
      );
    }
  }

  async initializePadIfNeeded(cacheUri: vscode.Uri, config: PadConfig): Promise<DartPadInitializationResult> {
    await fs_utils.initializeCacheDirIfNeeded(cacheUri.path);

    let dartPadMainUri = this.getDartPadMainUri(cacheUri);
    let dartPadUri = this.getDartPadUri(cacheUri);
    let pubspecUri = this.getPubspecUri(cacheUri);

    if (! await fs_utils.isExist(dartPadMainUri.path) || ! await fs_utils.isExist(pubspecUri.path)) {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, cancellable: false, title: "Creating Dart Pad" },
        async (_) => {
          try {
            // Create dart project
            await executeCommand('dart create dart_pad --force', { cwd: cacheUri.path });

            // Update main file
            await fs.writeFile(dartPadMainUri.path, dartMainTemplate);

            // Remove useless files
            await fs.rm(vscode.Uri.joinPath(dartPadUri, '.gitignore').path);
            await fs.rm(vscode.Uri.joinPath(dartPadUri, '.packages').path);
            await fs.rm(vscode.Uri.joinPath(dartPadUri, 'CHANGELOG.md').path);
            await fs.rm(vscode.Uri.joinPath(dartPadUri, 'README.md').path);
            await fs.rm(vscode.Uri.joinPath(dartPadUri, 'analysis_options.yaml').path);
          } catch (e) {
            if (e instanceof CommandDoesNotExist) {
              vscode.window.showErrorMessage("Can't create Dart Pad. `dart` command doesn't exist");
            }

            console.log(`Failed to initialize dart pad: ${e}`);
          }
        }
      );

    }

    if (config.withoutPackages) {
      return { openDartPadWorkspace: false };
    } else {
      let packages = this.getInitialPackages();

      /// Don't wait for package initializing because it isn't necessary however it blocs interaction with dart pad.
      installPackagesIfNeeded({
        flutterPackages: false,
        cwd: dartPadUri.path,
        packages: packages,
      });

      return {
        openDartPadWorkspace: packages.length !== 0
      };
    }

  }

  getInitialPackages(): Array<string> {
    let configuration = vscode.workspace.getConfiguration('dartPad');

    let initialPackages = configuration.get<Array<string>>('packages');

    if (!initialPackages) {
      return [];
    } else {
      return initialPackages;
    }
  }

  getDartPadMainUri(cacheUri: vscode.Uri): vscode.Uri {
    return vscode.Uri.joinPath(this.getDartPadUri(cacheUri), 'bin', 'dart_pad.dart');
  }

  getPubspecUri(cacheUri: vscode.Uri): vscode.Uri {
    return vscode.Uri.joinPath(this.getDartPadUri(cacheUri), 'pubspec.yaml');
  }

  getDartPadUri(cacheUri: vscode.Uri): vscode.Uri {
    return vscode.Uri.joinPath(cacheUri, 'dart_pad');
  }
}

interface DartPadInitializationResult {
  openDartPadWorkspace: boolean;
}


