// Builds the shadcn demo locally and uploads it to the Vercel project
// `shadcn-huet` (https://shadcn-huet.vercel.app). See README.md, "Deploying".
//
//   pnpm shadcn:deploy               deploy current origin/master to production
//   pnpm shadcn:deploy --any-commit  deploy whatever is checked out
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "../..")
const shadcn = resolve(root, "vendor/shadcn-ui")
const project = "shadcn-huet"
const anyCommit = process.argv.includes("--any-commit")

function fail(message) {
  console.error(`\n${message}`)
  process.exit(1)
}

function step(label) {
  console.log(`\n→ ${label}`)
}

function run(command, args, cwd) {
  return spawnSync(command, args, { cwd, stdio: "inherit" }).status === 0
}

function output(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" })
  return result.status === 0 ? result.stdout.trimEnd() : null
}

function vercel(...args) {
  if (!run("vercel", args, shadcn)) fail(`vercel ${args.join(" ")} failed.`)
}

// `vercel build` rejects Node 26, and the project is set to 24.x.
const nodeMajor = Number(process.versions.node.split(".")[0])
if (nodeMajor !== 24) fail(`Node ${process.versions.node} is running. Deploys need Node 24.x.`)

if (output("vercel", ["--version"], root) === null) {
  fail("The Vercel CLI isn't installed. Install it with: pnpm add -g vercel")
}

// The live site should match master: an earlier deploy was built from a stale
// worktree and shipped without four merged PRs.
if (!anyCommit) {
  step("Checking the checkout is at origin/master")
  if (!run("git", ["fetch", "--quiet", "origin", "master"], root)) fail("git fetch origin master failed.")
  const head = output("git", ["rev-parse", "HEAD"], root)
  const master = output("git", ["rev-parse", "origin/master"], root)
  if (head !== master) {
    fail(
      `HEAD is ${head?.slice(0, 7)}, but origin/master is ${master?.slice(0, 7)}.\n` +
        "Check out origin/master, or pass --any-commit to deploy this checkout anyway.",
    )
  }
  const dirty = output("git", ["status", "--porcelain", "--ignore-submodules=dirty"], root)
  if (dirty) fail(`The checkout has uncommitted changes:\n${dirty}\nCommit or discard them, or pass --any-commit.`)
}

step("Setting up the shadcn site (pnpm shadcn:setup)")
// In a fresh worktree the first run can fail in apps/v4's postinstall, and a
// second run succeeds.
if (!run("node", [resolve(here, "setup.mjs")], root)) {
  console.log("\nSetup failed. Retrying once…")
  if (!run("node", [resolve(here, "setup.mjs")], root)) fail("pnpm shadcn:setup failed twice.")
}

// Run vercel from the pnpm root, not apps/v4: the built functions point into
// the root node_modules.
if (!existsSync(resolve(shadcn, ".vercel/project.json"))) {
  step(`Linking vendor/shadcn-ui to the Vercel project ${project}`)
  const gitignoreClean = output("git", ["diff", "--quiet", "--", ".gitignore"], shadcn) !== null
  vercel("link", "--yes", "--project", project)
  // `vercel link` appends `.env*` to the submodule's .gitignore. Upstream
  // already ignores .env.local, so drop the edit to keep the submodule clean.
  if (gitignoreClean) run("git", ["checkout", "--", ".gitignore"], shadcn)
}

step("Pulling production settings and env")
vercel("pull", "--yes", "--environment=production")

step("Building")
vercel("build", "--prod")

// The output has about 39,000 files, over Vercel's 15,000-file upload limit,
// so it goes up as one archive.
step("Deploying to production")
vercel("deploy", "--prebuilt", "--prod", "--archive=tgz")

console.log(`\nDeployed. Live at https://${project}.vercel.app`)
