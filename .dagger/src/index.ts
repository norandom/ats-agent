import { dag, Directory, object, func } from "@dagger.io/dagger"

/** Validate only the explicitly selected generic source context. */
@object()
export class TargetedCvRelease {
  @func()
  dist(source: Directory, sourceRevision: string, sourceEpoch: string, runId: string): Directory {
    if (!runId.trim()) throw new Error("A fresh build attempt ID is required")
    return dag.container().from("node:22.23.4-bookworm-slim")
      .withExec(["sh", "-c", "apt-get update && apt-get install -y --no-install-recommends zip unzip git ca-certificates && rm -rf /var/lib/apt/lists/*"])
      .withFile("/usr/local/bin/uv", dag.container().from("ghcr.io/astral-sh/uv:0.9.8").file("/uv"))
      .withFile("/usr/local/bin/uvx", dag.container().from("ghcr.io/astral-sh/uv:0.9.8").file("/uvx"))
      .withEnvVariable("UV_PYTHON", "3.12")
      .withExec(["corepack", "enable"])
      .withExec(["corepack", "prepare", "pnpm@10.18.3", "--activate"])
      .withExec(["uvx", "--from", "check-jsonschema==0.38.2", "check-jsonschema", "--version"])
      .withDirectory("/source", source).withWorkdir("/source")
      // Vary the execution key before every validation and production command.
      .withEnvVariable("RELEASE_BUILD_ATTEMPT", runId)
      .withEnvVariable("SOURCE_REVISION", sourceRevision)
      .withEnvVariable("SOURCE_EPOCH", sourceEpoch)
      .withExec(["node", "release/prepare.cjs", "verify", "--root", "/source", "--source-revision", sourceRevision, "--source-epoch", sourceEpoch])
      .withExec(["sh", "-c", "cp -R /source /work && find /work -type f -exec chmod 644 {} + && printf '/outputs/\\n' > /work/.gitignore && cd /work && git init --quiet && node release/check.cjs && node --test tests/portable-skill-release/*.test.cjs tests/wordcraft-application-documents/contracts.test.cjs tests/wordcraft-application-documents/languages.test.cjs tests/wordcraft-application-documents/context.test.cjs"])
      .withNewFile("/production.json", JSON.stringify({prepared:{root:"/source",sourceRevision,sourceEpoch:Number(sourceEpoch)},dist:"/dist"}))
      .withExec(["node", "/source/release/pipeline.cjs", "produce", "/production.json"])
      .directory("/dist")
  }
}
