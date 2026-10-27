# Connect your agent to the open WordCraft document

Set this up once in the AI host where you will use the skill. WordCraft MCP must connect to the desktop app so you can watch and edit the same document.

## Start WordCraft with a control port

Install WordCraft desktop and its CLI. The project has exercised desktop version 0.10.0. Make `wordcraft-cli` available on PATH, or use its full installed path in your host configuration.

On Windows, start a new interactive instance from PowerShell:

```powershell
& 'C:/Program Files/WordCraft/WordCraft.exe' --control 7981
```

Adjust the executable path to your installation. Dismiss any restore prompt yourself and select the document you intend to work on. Keep this instance open. If you choose another port, use that same port below.

## Register the MCP server in your host

Configure a stdio MCP server with these values:

| Setting | Value |
| --- | --- |
| Command | `wordcraft-cli` |
| Arguments | `mcp`, `--connect`, `127.0.0.1:7981` |

For hosts that accept an `mcpServers` JSON configuration:

```json
{
  "mcpServers": {
    "wordcraft": {
      "command": "wordcraft-cli",
      "args": ["mcp", "--connect", "127.0.0.1:7981"]
    }
  }
}
```

Use your host's own configuration interface if its format differs. Restart or reconnect its MCP client after saving. The host starts the CLI server; you do not also need to run that command in another terminal.

The `--connect` argument selects the desktop connection. Plain `wordcraft-cli mcp` starts a headless session and does not provide this skill's live desktop experience. File-access root flags belong to headless mode and cannot be combined with `--connect` in the tested CLI.

## Confirm the connection before supplying personal data

Open an empty or fictional document and ask the agent to check the WordCraft connection. It should discover the available tools and read the document identity and text without changing it. Then ask it to create a short fictional draft in the visible window and save it to a new test file.

If the connection fails, check that the app is running with the selected control port, the CLI path is correct, and the host has reconnected its MCP server. Keep the port on the local machine. The tested Windows host and WordCraft app run together; a host inside WSL may need a different address and is not covered by that desktop setup. Debian WSL is used for release CI, not required for normal CV authoring.

Once the test works, follow [the application workflow](application-workflow.md). Your host handles reasoning and skill instructions; WordCraft handles document operations. Both receive the content needed for those operations, so use tools and services you trust with your candidate data.
