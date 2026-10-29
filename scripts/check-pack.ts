import { execSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pkgJson = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>
  publishConfig?: {
    exports?: Record<string, string | { import?: string; types?: string; default?: string }>
  }
}

const FORBIDDEN_DEPS = ['class-variance-authority', 'clsx', 'tailwind-merge'] as const
const REQUIRED_DEPS = ['@base-ui/react', 'tailwind-variants'] as const

function assertDeps(): void {
  const deps = pkgJson.dependencies ?? {}
  for (const name of FORBIDDEN_DEPS) {
    if (name in deps) {
      throw new Error(`[check:pack] forbidden direct dependency: ${name}`)
    }
  }
  for (const name of REQUIRED_DEPS) {
    if (!(name in deps)) {
      throw new Error(`[check:pack] missing required dependency: ${name}`)
    }
  }
}

function walkJs(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...walkJs(full))
      continue
    }
    if (name.endsWith('.js')) out.push(full)
  }
  return out
}

const PKG_CSS_PREFIX = '@klnap/payload-enhanced-ui/'

function resolveCssImport(fromFile: string, spec: string, root: string): string {
  if (spec.startsWith(PKG_CSS_PREFIX)) {
    const sub = spec.slice(PKG_CSS_PREFIX.length)
    const resolved = join(root, sub)
    if (!resolved.startsWith(root)) {
      throw new Error(`[check:pack] CSS import escapes package root: ${spec} from ${fromFile}`)
    }
    return resolved
  }
  const base = dirname(fromFile)
  const resolved = resolve(base, spec)
  if (!resolved.startsWith(root)) {
    throw new Error(`[check:pack] CSS import escapes package root: ${spec} from ${fromFile}`)
  }
  return resolved
}

function parseCssImports(cssPath: string): string[] {
  const text = readFileSync(cssPath, 'utf8')
  const imports: string[] = []
  for (const match of text.matchAll(/@import\s+["']([^"']+)["']/g)) {
    imports.push(match[1]!)
  }
  return imports
}

function walkCssClosure(cssPath: string, root: string, seen: Set<string>): void {
  if (seen.has(cssPath)) return
  seen.add(cssPath)
  if (!statSync(cssPath).isFile()) {
    throw new Error(`[check:pack] missing CSS file: ${cssPath}`)
  }
  for (const spec of parseCssImports(cssPath)) {
    const next = resolveCssImport(cssPath, spec, root)
    walkCssClosure(next, root, seen)
  }
}

function assertNoAliasInDist(distDir: string): void {
  for (const file of walkJs(distDir)) {
    const text = readFileSync(file, 'utf8')
    if (text.includes('@/') || text.includes('#enh-ui/')) {
      throw new Error(`[check:pack] unresolved internal alias in ${relative(pkgRoot, file)}`)
    }
  }
}

function assertPublishExports(extractRoot: string): void {
  const exportsMap = pkgJson.publishConfig?.exports
  if (!exportsMap) throw new Error('[check:pack] publishConfig.exports missing')

  for (const [subpath, target] of Object.entries(exportsMap)) {
    if (typeof target === 'string') {
      const abs = join(extractRoot, target.replace(/^\.\//, ''))
      if (!statSync(abs).isFile()) {
        throw new Error(`[check:pack] missing publish asset: ${target}`)
      }
      continue
    }
    const importPath = target.import ?? target.default
    const typesPath = target.types
    if (!importPath) throw new Error(`[check:pack] no import for ${subpath}`)
    const absImport = join(extractRoot, importPath.replace(/^\.\//, ''))
    if (!statSync(absImport).isFile()) {
      throw new Error(`[check:pack] missing publish import target: ${importPath}`)
    }
    if (typesPath) {
      const absTypes = join(extractRoot, typesPath.replace(/^\.\//, ''))
      if (!statSync(absTypes).isFile()) {
        throw new Error(`[check:pack] missing publish types target: ${typesPath}`)
      }
    }
  }
}

function assertJsCssGraph(distDir: string): void {
  const cssImportRe = /from\s+['"](\.\/[^'"]+\.css)['"]|import\s+['"](\.\/[^'"]+\.css)['"]/g
  for (const file of walkJs(distDir)) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(cssImportRe)) {
      const spec = match[1] ?? match[2]
      if (!spec) continue
      const cssPath = resolveCssImport(file, spec, distDir)
      if (!statSync(cssPath).isFile()) {
        throw new Error(
          `[check:pack] missing CSS for JS import ${spec} in ${relative(pkgRoot, file)}`
        )
      }
    }
  }

  const peuiAdmin = join(distDir, 'styles/peui-admin.css')
  walkCssClosure(peuiAdmin, distDir, new Set())

  const forbiddenDirs = [
    join(distDir, 'features/live-preview'),
    join(distDir, 'features/save-publish-menu'),
  ]
  for (const dir of forbiddenDirs) {
    try {
      if (statSync(dir).isDirectory()) {
        throw new Error(`[check:pack] removed feature dir still present: ${relative(pkgRoot, dir)}`)
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('[check:pack]')) throw e
    }
  }
}

assertDeps()

const distDir = join(pkgRoot, 'dist')
if (!statSync(distDir).isDirectory()) {
  throw new Error('[check:pack] run build:dist first (dist/ missing)')
}

assertNoAliasInDist(distDir)
assertJsCssGraph(distDir)

// dist already built by build:dist; skip prepack/postpack so stdout stays clean and dist is not deleted mid-run
const packOut = execSync('npm pack --ignore-scripts 2>/dev/null', {
  cwd: pkgRoot,
  encoding: 'utf8',
})
const tgz = packOut.trim().split('\n').pop()?.trim()
if (!tgz?.endsWith('.tgz')) throw new Error('[check:pack] npm pack produced no tarball')

const extractParent = mkdtempSync(join(tmpdir(), 'peui-pack-'))
const extractRoot = join(extractParent, 'package')
execSync(`tar -xzf "${join(pkgRoot, tgz)}" -C "${extractParent}"`, { cwd: pkgRoot })

assertPublishExports(extractRoot)

if (readFileSync(join(extractRoot, 'package.json'), 'utf8').includes('livePreviewStyling')) {
  throw new Error('[check:pack] tarball package.json still mentions livePreviewStyling')
}

rmSync(extractParent, { recursive: true, force: true })
rmSync(join(pkgRoot, tgz), { force: true })

process.stdout.write('[check:pack] publish exports, CSS graph, deps, and tarball OK\n')
