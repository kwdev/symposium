import * as vscode from "vscode";

export class SettingsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "symposium.settingsView";
  #view?: vscode.WebviewView;
  #extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.#extensionUri = extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this.#view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.#extensionUri],
    };

    webviewView.webview.html = this.#getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "get-config":
          // Send current configuration to webview
          this.#sendConfiguration();
          break;
        case "set-current-agent":
          // Update current agent setting
          const config = vscode.workspace.getConfiguration("symposium");
          await config.update(
            "currentAgent",
            message.agentName,
            vscode.ConfigurationTarget.Global,
          );
          vscode.window.showInformationMessage(
            `Switched to agent: ${message.agentName}`,
          );
          // Send updated configuration to refresh the UI
          this.#sendConfiguration();
          break;
        case "toggle-component":
          // Toggle component enabled/disabled
          await this.#toggleComponent(message.componentName);
          break;
        case "open-settings":
          // Open VSCode settings focused on Symposium
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "symposium",
          );
          break;
      }
    });
  }

  async #toggleComponent(componentName: string) {
    const config = vscode.workspace.getConfiguration("symposium");
    const components = config.get<
      Record<string, { command: string; args?: string[]; disabled?: boolean }>
    >("components", {});

    if (components[componentName]) {
      components[componentName].disabled = !components[componentName].disabled;
      await config.update(
        "components",
        components,
        vscode.ConfigurationTarget.Global,
      );
      this.#sendConfiguration();
    }
  }

  #sendConfiguration() {
    if (!this.#view) {
      return;
    }

    const config = vscode.workspace.getConfiguration("symposium");
    const agents = config.get("agents", {});
    const currentAgent = config.get("currentAgent", "");
    const components = config.get("components", {});

    this.#view.webview.postMessage({
      type: "config",
      agents,
      currentAgent,
      components,
    });
  }

  #getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Symposium Settings</title>
    <style>
        body {
            padding: 16px;
            color: var(--vscode-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }
        h2 {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 600;
        }
        .section {
            margin-bottom: 24px;
        }
        .agent-list, .component-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .agent-item, .component-item {
            padding: 8px 12px;
            background: var(--vscode-list-inactiveSelectionBackground);
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .agent-item:hover, .component-item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        .agent-item.active {
            background: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }
        .component-item.disabled {
            opacity: 0.6;
        }
        .badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .toggle {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="section">
        <h2>Current Agent</h2>
        <div class="agent-list" id="agent-list">
            <div>Loading...</div>
        </div>
    </div>

    <div class="section">
        <h2>Components</h2>
        <div class="component-list" id="component-list">
            <div>Loading...</div>
        </div>
    </div>

    <div class="section">
        <a href="#" id="configure-link" style="color: var(--vscode-textLink-foreground); text-decoration: none;">
            Configure agents and components...
        </a>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Request initial configuration
        vscode.postMessage({ type: 'get-config' });

        // Handle configure link
        document.getElementById('configure-link').onclick = (e) => {
            e.preventDefault();
            vscode.postMessage({ type: 'open-settings' });
        };

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            if (message.type === 'config') {
                renderAgents(message.agents, message.currentAgent);
                renderComponents(message.components);
            }
        });

        function renderAgents(agents, currentAgent) {
            const list = document.getElementById('agent-list');
            list.innerHTML = '';

            for (const [name, config] of Object.entries(agents)) {
                const item = document.createElement('div');
                item.className = 'agent-item' + (name === currentAgent ? ' active' : '');
                item.innerHTML = \`
                    <span>\${name}</span>
                    \${name === currentAgent ? '<span class="badge">Active</span>' : ''}
                \`;
                item.onclick = () => {
                    vscode.postMessage({ type: 'set-current-agent', agentName: name });
                };
                list.appendChild(item);
            }
        }

        function renderComponents(components) {
            const list = document.getElementById('component-list');
            list.innerHTML = '';

            for (const [name, config] of Object.entries(components)) {
                const item = document.createElement('div');
                item.className = 'component-item' + (config.disabled ? ' disabled' : '');
                item.innerHTML = \`
                    <span>\${name}</span>
                    <span class="toggle">\${config.disabled ? 'Disabled' : 'Enabled'}</span>
                \`;
                item.onclick = () => {
                    vscode.postMessage({ type: 'toggle-component', componentName: name });
                };
                list.appendChild(item);
            }
        }
    </script>
</body>
</html>`;
  }
}
