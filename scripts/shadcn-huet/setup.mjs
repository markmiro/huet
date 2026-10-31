import { spawnSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "../..")
const shadcn = resolve(root, "vendor/shadcn-ui")
const v4 = resolve(shadcn, "apps/v4")
const marker = "huet-configurator"

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function patch(file, needle, transform) {
  const path = resolve(v4, file)
  const source = readFileSync(path, "utf8")
  if (source.includes(needle) && needle !== 'attribute="class"') return
  const next = transform(source)
  if (next === source) return
  writeFileSync(path, next)
}

if (!existsSync(resolve(shadcn, "package.json"))) {
  console.error("Missing vendor/shadcn-ui. Run: git submodule update --init vendor/shadcn-ui")
  process.exit(1)
}

// The submodule stays pinned to upstream, so replay the vendor edits
// (surfaces, charts, the SVG opt-ins for the QR code and directory logos)
// unless they're already there.
const integration = resolve(here, "integration.patch")
const git = (...args) => spawnSync("git", args, { cwd: shadcn, encoding: "utf8" })
if (git("apply", "--reverse", "--check", integration).status !== 0) {
  const check = git("apply", "--check", integration)
  if (check.status !== 0) {
    console.error(check.stderr.trim())
    console.error(
      "vendor/shadcn-ui has edits that conflict with scripts/shadcn-huet/integration.patch.\n" +
        "Commit or discard them in vendor/shadcn-ui (git -C vendor/shadcn-ui status), then rerun.",
    )
    process.exit(1)
  }
  run("git", ["apply", integration], shadcn)
}

const shadcnPackagePath = resolve(shadcn, "package.json")
const shadcnPackage = JSON.parse(readFileSync(shadcnPackagePath, "utf8"))
const requiredBuilds = ["esbuild", "unrs-resolver"]
const buildScripts = new Set(shadcnPackage.pnpm?.onlyBuiltDependencies ?? [])
const missingBuilds = requiredBuilds.filter((name) => !buildScripts.has(name))
if (missingBuilds.length) {
  for (const name of missingBuilds) buildScripts.add(name)
  shadcnPackage.pnpm = { ...shadcnPackage.pnpm, onlyBuiltDependencies: [...buildScripts] }
  writeFileSync(shadcnPackagePath, JSON.stringify(shadcnPackage, null, 2) + "\n")
}

mkdirSync(resolve(v4, "components/huet"), { recursive: true })
cpSync(resolve(here, "huet-configurator.tsx"), resolve(v4, "components/huet/huet-configurator.tsx"))

patch("app/layout.tsx", marker, (source) => {
  const imported = source.includes(marker)
    ? source
    : source.replace(
        'import "@/app/globals.css"',
        `import { HuetConfigurator } from "@/components/huet/${marker}"\n\nimport "@/app/globals.css"`,
      )
  if (imported.includes("<HuetConfigurator />")) return imported
  return imported.replace("<TailwindIndicator />", "<TailwindIndicator />\n            <HuetConfigurator />")
})

patch("components/theme-provider.tsx", 'attribute="data-theme"', (source) =>
  source.replace('attribute="class"', 'attribute="data-theme"'),
)

if (!existsSync(resolve(root, "node_modules"))) run("pnpm", ["install"], root)
run("pnpm", ["build:packages"], root)

const packed = resolve(shadcn, ".huet-packages")
mkdirSync(packed, { recursive: true })
const tarballs = ["huet", "huet-react"].map((name) => {
  const dir = resolve(root, "packages", name)
  run("pnpm", ["pack", "--pack-destination", packed], dir)
  const version = JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8")).version
  return resolve(shadcn, ".huet-packages", `${name}-${version}.tgz`)
})

const pnpm = ["--config.package-manager-strict=false"]
if (!existsSync(resolve(shadcn, "node_modules"))) run("pnpm", [...pnpm, "install"], shadcn)
else if (missingBuilds.length) run("pnpm", [...pnpm, "rebuild", ...missingBuilds], shadcn)
// The configurator imports chroma-js itself, and pnpm doesn't expose Huet's copy to the app.
run("pnpm", [...pnpm, "--filter=v4", "add", "chroma-js", ...tarballs], shadcn)

if (!existsSync(resolve(v4, "styles/base-nova/ui"))) {
  run("pnpm", [...pnpm, "--filter=@shadcn/react", "build"], shadcn)
  run("pnpm", [...pnpm, "--filter=@shadcn/helpers", "build"], shadcn)
  run("pnpm", [...pnpm, "--filter=shadcn...", "build"], shadcn)
  // Upstream runs this with Bun. Bun 1.1 cannot load the current undici,
  // and tsx compiles the registry's JSX as classic React. A current Bun does both.
  const version = spawnSync("bun", ["--version"], { encoding: "utf8" }).stdout?.trim() ?? ""
  const [major, minor] = version.split(".").map(Number)
  const bun = major > 1 || (major === 1 && minor >= 2) ? ["bun"] : ["pnpm", ...pnpm, "dlx", "bun@1.3.1"]
  run(bun[0], [...bun.slice(1), "run", "./scripts/build-registry.mts", "--style", "all"], v4)
}

console.log("shadcn is wired to Huet. Start it with: pnpm shadcn:dev")
