import * as vscode from "vscode";
import * as cp from "child_process";
import { logger } from "./extension";

/** Maximum number of files to include in context commands */
const MAX_CONTEXT_FILES = 16000;

/**
 * Maintains a live index of files in the workspace.
 *
 * - Initializes from `git ls-files` (respects .gitignore)
 * - Falls back to `workspace.findFiles` for non-git workspaces
 * - Uses FileSystemWatcher for live updates
 * - Tracks open editor tabs (even files outside workspace)
 */
export class WorkspaceFileIndex {
  #workspaceFolder: vscode.WorkspaceFolder;
  #files: Set<string> = new Set();
  #watcher: vscode.FileSystemWatcher | undefined;
  #openTabsDisposable: vscode.Disposable | undefined;
  #onDidChange = new vscode.EventEmitter<void>();
  #isGitRepo: boolean = false;

  /** Fires when the file list changes */
  readonly onDidChange = this.#onDidChange.event;

  constructor(workspaceFolder: vscode.WorkspaceFolder) {
    this.#workspaceFolder = workspaceFolder;
  }

  /** Initialize the index - call this before using */
  async initialize(): Promise<void> {
    // Try git ls-files first
    this.#isGitRepo = await this.#tryGitLsFiles();

    if (!this.#isGitRepo) {
      // Fall back to workspace.findFiles
      await this.#fallbackFindFiles();
    }

    // Set up file watcher for live updates
    this.#setupWatcher();

    // Track open tabs
    this.#setupOpenTabsTracking();

    logger.info("fileIndex", "Initialized workspace file index", {
      workspace: this.#workspaceFolder.name,
      fileCount: this.#files.size,
      isGitRepo: this.#isGitRepo,
    });
  }

  /** Get all indexed files as relative paths */
  getFiles(): string[] {
    // Combine workspace files with open tabs, limit to MAX_CONTEXT_FILES
    const allFiles = new Set(this.#files);

    // Add open tabs (may include files outside workspace)
    for (const tabGroup of vscode.window.tabGroups.all) {
      for (const tab of tabGroup.tabs) {
        if (tab.input instanceof vscode.TabInputText) {
          const uri = tab.input.uri;
          const relativePath = this.#getRelativePath(uri);
          if (relativePath) {
            allFiles.add(relativePath);
          }
        }
      }
    }

    // Convert to sorted array and limit
    const sorted = Array.from(allFiles).sort();
    if (sorted.length > MAX_CONTEXT_FILES) {
      logger.info("fileIndex", "Truncating file list", {
        total: sorted.length,
        limit: MAX_CONTEXT_FILES,
      });
      return sorted.slice(0, MAX_CONTEXT_FILES);
    }
    return sorted;
  }

  /** Get the workspace folder this index is for */
  get workspaceFolder(): vscode.WorkspaceFolder {
    return this.#workspaceFolder;
  }

  /** Try to populate from git ls-files */
  async #tryGitLsFiles(): Promise<boolean> {
    return new Promise((resolve) => {
      const cwd = this.#workspaceFolder.uri.fsPath;

      cp.exec(
        "git ls-files",
        { cwd, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout) => {
          if (error) {
            logger.info("fileIndex", "git ls-files failed, will use fallback", {
              error: error.message,
            });
            resolve(false);
            return;
          }

          const files = stdout
            .split("\n")
            .map((f) => f.trim())
            .filter((f) => f.length > 0);

          for (const file of files) {
            this.#files.add(file);
          }

          resolve(true);
        },
      );
    });
  }

  /** Fallback: use workspace.findFiles for non-git workspaces */
  async #fallbackFindFiles(): Promise<void> {
    // Use a reasonable exclude pattern
    const excludePattern =
      "**/node_modules/**,**/.git/**,**/target/**,**/dist/**,**/build/**";

    const uris = await vscode.workspace.findFiles(
      new vscode.RelativePattern(this.#workspaceFolder, "**/*"),
      excludePattern,
      MAX_CONTEXT_FILES,
    );

    for (const uri of uris) {
      const relativePath = this.#getRelativePath(uri);
      if (relativePath) {
        this.#files.add(relativePath);
      }
    }
  }

  /** Set up file watcher for live updates */
  #setupWatcher(): void {
    // Watch all files in workspace
    this.#watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.#workspaceFolder, "**/*"),
    );

    this.#watcher.onDidCreate((uri) => {
      const relativePath = this.#getRelativePath(uri);
      if (relativePath && this.#shouldIncludeFile(relativePath)) {
        this.#files.add(relativePath);
        logger.info("fileIndex", "File created", { path: relativePath });
        this.#onDidChange.fire();
      }
    });

    this.#watcher.onDidDelete((uri) => {
      const relativePath = this.#getRelativePath(uri);
      if (relativePath && this.#files.has(relativePath)) {
        this.#files.delete(relativePath);
        logger.info("fileIndex", "File deleted", { path: relativePath });
        this.#onDidChange.fire();
      }
    });

    // Note: We don't listen to onDidChange (file content changes) as that
    // doesn't affect the file list
  }

  /** Set up tracking for open editor tabs */
  #setupOpenTabsTracking(): void {
    this.#openTabsDisposable = vscode.window.tabGroups.onDidChangeTabs(() => {
      // When tabs change, the file list might include new external files
      this.#onDidChange.fire();
    });
  }

  /** Get relative path for a URI, or undefined if outside workspace */
  #getRelativePath(uri: vscode.Uri): string | undefined {
    // Check if it's within the workspace
    const workspacePath = this.#workspaceFolder.uri.fsPath;
    const filePath = uri.fsPath;

    if (filePath.startsWith(workspacePath)) {
      // Inside workspace - return relative path
      let relative = filePath.slice(workspacePath.length);
      if (relative.startsWith("/") || relative.startsWith("\\")) {
        relative = relative.slice(1);
      }
      return relative;
    } else {
      // Outside workspace - return full path
      return filePath;
    }
  }

  /** Check if a file should be included (basic filtering for non-git) */
  #shouldIncludeFile(relativePath: string): boolean {
    // For git repos, git ls-files already filters
    if (this.#isGitRepo) {
      // But watcher might catch files not in git - check common excludes
      const excludePatterns = [
        /node_modules\//,
        /\.git\//,
        /target\//,
        /dist\//,
        /build\//,
        /\.DS_Store$/,
      ];
      return !excludePatterns.some((p) => p.test(relativePath));
    }
    return true;
  }

  /** Dispose of resources */
  dispose(): void {
    this.#watcher?.dispose();
    this.#openTabsDisposable?.dispose();
    this.#onDidChange.dispose();
  }
}
