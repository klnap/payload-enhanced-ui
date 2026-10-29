/**
 * Optional host check: every registered component path must appear in the host
 * Payload importMap.js. Set PAYLOAD_IMPORT_MAP_PATH to the host file (absolute path).
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const importMapPath = process.env.PAYLOAD_IMPORT_MAP_PATH?.trim()

if (!importMapPath) {
  process.stderr.write(
    '[check-host-import-map] NOT EXECUTED: set PAYLOAD_IMPORT_MAP_PATH to your host importMap.js\n'
  )
  process.exit(2)
}

if (!existsSync(importMapPath)) {
  process.stderr.write(`[check-host-import-map] NOT EXECUTED: file not found: ${importMapPath}\n`)
  process.exit(2)
}

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pathsFile = join(pkgRoot, 'src/integration/import-map-paths.ts')
const PATH_RE = /@klnap\/payload-enhanced-ui\/(client|rsc)#([A-Za-z0-9_]+)/g

const referenced = new Map<string, Set<string>>()
for (const match of readFileSync(pathsFile, 'utf8').matchAll(PATH_RE)) {
  const subpath = match[1]!
  const name = match[2]!
  if (!referenced.has(subpath)) referenced.set(subpath, new Set())
  referenced.get(subpath)!.add(name)
}

const client = await import('@klnap/payload-enhanced-ui/client')
const rsc = await import('@klnap/payload-enhanced-ui/rsc')
const modules: Record<string, Record<string, unknown>> = { client, rsc }
const importMapText = readFileSync(importMapPath, 'utf8')

let failed = false
for (const [subpath, names] of referenced) {
  const mod = modules[subpath]
  if (!mod) {
    failed = true
    continue
  }
  for (const name of names) {
    const key = `@klnap/payload-enhanced-ui/${subpath}#${name}`
    if (!(name in mod)) failed = true
    if (!importMapText.includes(`"${key}"`)) failed = true
  }
}

if (failed) process.exit(1)
process.stdout.write('[check-host-import-map] Host import map includes all registered paths.\n')
