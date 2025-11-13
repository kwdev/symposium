import * as vscode from "vscode";
import { HomerActor } from "./homerActor";

interface BufferedMessage {
  type: string;
  tabId: string;
  messageId: string;
  chunk?: string;
}

interface SessionInfo {
  sessionId: string;
  state: any; // Opaque session state from agent
}

interface ExtensionState {
  version: number;
  uiState: any; // Opaque UI state from mynah-ui
  sessions: { [tabId: string]: SessionInfo };
}

// Current state version - increment when format changes
const STATE_VERSION = 1;

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "symposium.chatView";
  private static readonly STATE_KEY = "symposium.chatState";
  private _view?: vscode.WebviewView;
  private _agent: HomerActor;
  private _tabToSession: Map<string, string> = new Map(); // tabId → sessionId
  private _messageBuffer: BufferedMessage[] = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext,
  ) {
    // Create singleton agent
    this._agent = new HomerActor();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle webview visibility changes
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        console.log("Webview became visible");
        this._onWebviewVisible();
      } else {
        console.log("Webview became hidden");
        this._onWebviewHidden();
      }
    });

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "new-tab":
          // Create a new session for this tab
          const sessionId = this._agent.createSession();
          this._tabToSession.set(message.tabId, sessionId);
          console.log(`Created session ${sessionId} for tab ${message.tabId}`);

          // Save state after creating session
          await this._saveState();
          break;

        case "prompt":
          console.log(
            `Received prompt for tab ${message.tabId}, message ${message.messageId}`,
          );

          // Get the session for this tab
          const promptSessionId = this._tabToSession.get(message.tabId);
          if (!promptSessionId) {
            console.error(`No session found for tab ${message.tabId}`);
            return;
          }

          console.log(`Processing prompt with session ${promptSessionId}`);

          // Stream the response progressively
          for await (const chunk of this._agent.processPrompt(
            promptSessionId,
            message.prompt,
          )) {
            console.log(`Sending chunk for message ${message.messageId}`);
            this._sendToWebview({
              type: "response-chunk",
              tabId: message.tabId,
              messageId: message.messageId,
              chunk: chunk,
            });
          }

          // Send final message to indicate streaming is complete
          console.log(
            `Sending response-complete for message ${message.messageId}`,
          );
          this._sendToWebview({
            type: "response-complete",
            tabId: message.tabId,
            messageId: message.messageId,
          });

          // Save session state after response
          await this._saveState();
          break;

        case "save-state":
          // Save the UI state along with session state
          console.log("Saving UI state from webview");
          await this._saveState(message.state);
          break;

        case "request-saved-state":
          // Webview is requesting saved state on initialization
          await this._restoreState();
          break;
      }
    });
  }

  private async _saveState(uiState?: any) {
    // Get UI state (either provided or fetch current)
    const currentUiState =
      uiState ||
      this._context.workspaceState.get<ExtensionState>(
        ChatViewProvider.STATE_KEY,
      )?.uiState;

    // Build session state from current sessions
    const sessions: { [tabId: string]: SessionInfo } = {};
    for (const [tabId, sessionId] of this._tabToSession.entries()) {
      try {
        const state = this._agent.getSessionState(sessionId);
        sessions[tabId] = { sessionId, state };
      } catch (error) {
        console.error(`Failed to get state for session ${sessionId}:`, error);
      }
    }

    // Save all three pieces together with version
    const extensionState: ExtensionState = {
      version: STATE_VERSION,
      uiState: currentUiState,
      sessions,
    };

    console.log("Saving extension state:", extensionState);
    await this._context.workspaceState.update(
      ChatViewProvider.STATE_KEY,
      extensionState,
    );
  }

  private async _restoreState() {
    if (!this._view) {
      return;
    }

    const extensionState = this._context.workspaceState.get<ExtensionState>(
      ChatViewProvider.STATE_KEY,
    );

    if (!extensionState) {
      console.log("No saved state found");
      // Still send restore message so webview initializes
      await this._view.webview.postMessage({
        type: "restore-state",
        state: undefined,
      });
      return;
    }

    // Check version and wipe if outdated
    if (extensionState.version !== STATE_VERSION) {
      console.log(
        `State version mismatch (saved: ${extensionState.version}, current: ${STATE_VERSION}) - wiping old state`,
      );
      await this._context.workspaceState.update(
        ChatViewProvider.STATE_KEY,
        undefined,
      );
      // Send empty state to webview
      await this._view.webview.postMessage({
        type: "restore-state",
        state: undefined,
      });
      return;
    }

    console.log("Restoring extension state:", extensionState);

    // Restore sessions
    if (extensionState.sessions) {
      for (const [tabId, sessionInfo] of Object.entries(
        extensionState.sessions,
      )) {
        this._agent.resumeSession(sessionInfo.sessionId, sessionInfo.state);
        this._tabToSession.set(tabId, sessionInfo.sessionId);
        console.log(
          `Restored session ${sessionInfo.sessionId} for tab ${tabId}`,
        );
      }
    }

    // Restore UI state
    await this._view.webview.postMessage({
      type: "restore-state",
      state: extensionState.uiState,
    });
  }

  private _sendToWebview(message: any) {
    if (!this._view) {
      return;
    }

    if (this._view.visible) {
      // Webview is visible, send immediately
      this._view.webview.postMessage(message);
    } else {
      // Webview is hidden, buffer the message
      console.log("Buffering message (webview hidden):", message.type);
      this._messageBuffer.push(message);
    }
  }

  private async _onWebviewVisible() {
    if (!this._view) {
      return;
    }

    // Note: State restoration is handled by the webview's request-saved-state message
    // We only need to replay buffered messages here

    // Replay buffered messages
    if (this._messageBuffer.length > 0) {
      console.log(`Replaying ${this._messageBuffer.length} buffered messages`);
      for (const message of this._messageBuffer) {
        await this._view.webview.postMessage(message);
      }
      this._messageBuffer = [];
    }
  }

  private async _onWebviewHidden() {
    // Save current state when webview is hidden
    console.log("Webview hidden - saving state");
    await this._saveState();
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview.js"),
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Symposium Chat</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        #mynah-root {
            width: 100%;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="mynah-root"></div>
    <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}
