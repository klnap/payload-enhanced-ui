/**
 * Validates that every @klnap/payload-enhanced-ui/client|rsc#Component path
 * registered in import-map-paths.ts is exported from the matching entry.
 */
import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pathsFile = join(pkgRoot, 'src/integration/import-map-paths.ts')

const PATH_RE = /@klnap\/payload-enhanced-ui\/(client|rsc)#([A-Za-z0-9_]+)/g

const referenced = new Map<string, Set<string>>()

if (statSync(pathsFile).isFile()) {
  for (const match of readFileSync(pathsFile, 'utf8').matchAll(PATH_RE)) {
    const subpath = match[1]!
    const name = match[2]!
    if (!referenced.has(subpath)) referenced.set(subpath, new Set())
    referenced.get(subpath)!.add(name)
  }
}

const client = await import('@klnap/payload-enhanced-ui/client')
const rsc = await import('@klnap/payload-enhanced-ui/rsc')
const modules: Record<string, Record<string, unknown>> = { client, rsc }

let failed = false
const rows: string[] = []

for (const [subpath, names] of [...referenced.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const mod = modules[subpath]
  if (!mod) {
    failed = true
    rows.push(`@klnap/payload-enhanced-ui/${subpath}#\texport=MISSING_MODULE`)
    continue
  }
  for (const name of [...names].sort()) {
    const key = `@klnap/payload-enhanced-ui/${subpath}#${name}`
    const exported = name in mod
    if (!exported) failed = true
    rows.push(`${key}\texport=${exported ? 'ok' : 'MISSING'}`)
  }
}

process.stdout.write(rows.join('\n'))
process.stdout.write('\n')

if (failed) {
  process.exit(1)
}
process.stdout.write(
  '[check-payload-component-exports] All registered component paths are exported.\n'
)
