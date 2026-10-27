import { dag, Directory, object, func } from "@dagger.io/dagger"

/** Package the alpha from an explicitly prepared candidate-free context. */
@object()
export class TargetedCvRelease {
  @func()
  dist(source: Directory): Directory {
    return dag.container().from("node:22-bookworm-slim")
      .withExec(["sh", "-c", "apt-get update && apt-get install -y --no-install-recommends zip unzip git ca-certificates && rm -rf /var/lib/apt/lists/*"])
      .withFile("/usr/local/bin/uv", dag.container().from("ghcr.io/astral-sh/uv:0.9.8").file("/uv"))
      .withFile("/usr/local/bin/uvx", dag.container().from("ghcr.io/astral-sh/uv:0.9.8").file("/uvx"))
      .withEnvVariable("UV_PYTHON", "3.12")
      .withExec(["corepack", "enable"])
      .withExec(["corepack", "prepare", "pnpm@10.18.3", "--activate"])
      .withDirectory("/src", source).withWorkdir("/src")
      .withNewFile("/src/.gitignore", "/outputs/\n")
      .withExec(["git", "init", "--quiet"])
      .withExec(["pnpm", "exec", "node", "release/check.cjs"])
      .withExec(["pnpm", "exec", "node", "--test", "tests/wordcraft-application-documents/contracts.test.cjs", "tests/wordcraft-application-documents/languages.test.cjs", "tests/wordcraft-application-documents/context.test.cjs"])
      .withExec(["pnpm", "exec", "node", "release/package.cjs"])
      .directory("/src/dist")
  }
}
