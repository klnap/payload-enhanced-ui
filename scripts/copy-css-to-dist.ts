import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const srcRoot = join(pkgRoot, 'src')
const distRoot = join(pkgRoot, 'dist')

function copyCssTree(fromDir: string, toDir: string): void {
  for (const name of readdirSync(fromDir)) {
    const from = join(fromDir, name)
    const to = join(toDir, name)
    if (statSync(from).isDirectory()) {
      mkdirSync(to, { recursive: true })
      copyCssTree(from, to)
      continue
    }
    if (!name.endsWith('.css')) continue
    mkdirSync(dirname(to), { recursive: true })
    copyFileSync(from, to)
  }
}

mkdirSync(join(distRoot, 'styles'), { recursive: true })
copyFileSync(join(srcRoot, 'styles/enhanced.entry.css'), join(distRoot, 'styles/entry.css'))

const stylesDir = join(srcRoot, 'styles')
for (const name of readdirSync(stylesDir)) {
  if (!name.endsWith('.css')) continue
  if (name === 'enhanced.entry.css' || name === 'enhanced-tailwind.css') continue
  copyFileSync(join(stylesDir, name), join(distRoot, 'styles', name))
}

copyCssTree(join(srcRoot, 'features'), join(distRoot, 'features'))
copyCssTree(join(srcRoot, 'components'), join(distRoot, 'components'))

process.stdout.write(
  `[copy-css-to-dist] Mirrored CSS under ${relative(pkgRoot, distRoot)}/features and components\n`
)
