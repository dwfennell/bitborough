export function out(data: unknown, exitCode = 0): never {
  console.log(JSON.stringify(data, null, 2))
  process.exit(exitCode)
}

export function outErr(data: unknown): never {
  return out(data, 1)
}

export function err(error: string, code = 1): never {
  console.error(JSON.stringify({ ok: false, error }))
  process.exit(code)
}
