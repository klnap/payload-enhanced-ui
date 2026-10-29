import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const pkgRoot = join(import.meta.dir, '../..')
const srcRoot = join(pkgRoot, 'src')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
      continue
    }
    if (name.endsWith('.ts') || name.endsWith('.tsx')) out.push(full)
  }
  return out
}

function rel(file: string): string {
  return relative(srcRoot, file).replaceAll('\\', '/')
}

describe('architecture — import aliases', () => {
  test('src forbids @/ and parent-relative TS imports outside exports/', () => {
    const violations: string[] = []
    for (const file of walk(srcRoot)) {
      const r = rel(file)
      if (r.startsWith('exports/')) continue
      const text = readFileSync(file, 'utf8')
      if (text.includes('@/')) {
        violations.push(`${r}: uses @/`)
      }
      if (/from ['"]\.\.\/|import ['"]\.\.\//.test(text)) {
        violations.push(`${r}: parent-relative import`)
      }
    }
    expect(violations).toEqual([])
  })

  test('peui-admin.css uses relative feature imports (Tailwind postcss)', () => {
    const text = readFileSync(join(srcRoot, 'styles/peui-admin.css'), 'utf8')
    const imports = [...text.matchAll(/@import\s+["']([^"']+)["']/g)].map((m) => m[1]!)
    for (const spec of imports) {
      expect(spec.startsWith('../') || spec.startsWith('./')).toBe(true)
    }
  })
})
