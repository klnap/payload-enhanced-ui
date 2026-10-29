import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const srcRoot = join(import.meta.dir, '../../src')

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

describe('architecture — client runtime boundary', () => {
  test('client components do not import node: built-ins', () => {
    const violations: string[] = []
    for (const file of walk(srcRoot)) {
      const r = rel(file)
      if (!r.startsWith('components/')) continue
      const text = readFileSync(file, 'utf8')
      if (!text.includes("'use client'") && !text.includes('"use client"')) continue
      if (/from ['"]node:/.test(text) || /import ['"]node:/.test(text)) {
        violations.push(r)
      }
    }
    expect(violations).toEqual([])
  })
})
