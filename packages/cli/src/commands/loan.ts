import { Command } from 'commander'
import { FailReason } from '@bitborough/core'
import { loadEngine, saveEngine } from '../state.js'
import { out, outErr } from '../output.js'

export function loanCommand(program: Command) {
  const cmd = program
    .command('loan')
    .description('loan management')

  cmd
    .command('take <amount>')
    .description('take a loan (min $10,000, max 48x monthly tax income)')
    .option('--file <path>', 'game file', 'game.json')
    .action((amount, opts) => {
      const engine = loadEngine(opts.file)
      const result = engine.takeLoan(parseInt(amount))
      if (result.ok) saveEngine(engine, opts.file)
      const s = engine.getState()
      const response = {
        ok: result.ok,
        reason: result.ok ? undefined : FailReason[(result as { reason: FailReason }).reason],
        funds: s.funds,
        loan: s.loan,
      }
      if (result.ok) out(response); else outErr(response)
    })

  cmd
    .command('repayment <amount>')
    .description('set monthly loan repayment amount')
    .option('--file <path>', 'game file', 'game.json')
    .action((amount, opts) => {
      const engine = loadEngine(opts.file)
      const result = engine.setLoanRepayment(parseInt(amount))
      if (result.ok) saveEngine(engine, opts.file)
      const s = engine.getState()
      const response = {
        ok: result.ok,
        reason: result.ok ? undefined : FailReason[(result as { reason: FailReason }).reason],
        loanRepaymentAmount: s.loanRepaymentAmount,
      }
      if (result.ok) out(response); else outErr(response)
    })

  cmd
    .command('status')
    .description('show current loan details')
    .option('--file <path>', 'game file', 'game.json')
    .action((opts) => {
      const engine = loadEngine(opts.file)
      const s = engine.getState()
      out({
        loan: s.loan,
        loanRepaymentAmount: s.loanRepaymentAmount,
      })
    })
}
