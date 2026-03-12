import { Command } from 'commander'
import { SECTIONS, getBuildingReference } from '@bitborough/docs'
import { out } from '../output.js'

export function docsCommand(program: Command) {
  program
    .command('docs [section]')
    .description('view in-game documentation (omit section to list all)')
    .action((section) => {
      if (!section) {
        out({ sections: SECTIONS.map(s => ({ id: s.id, title: s.title })) })
      } else if (section === 'buildings') {
        out(getBuildingReference())
      } else {
        const s = SECTIONS.find(x => x.id === section)
        if (!s) out({ ok: false, error: `Unknown section: ${section}. Run 'bitt docs' to list sections.` })
        out({ id: s!.id, title: s!.title, body: s!.body })
      }
    })
}
