export function out(data: unknown): never {
  console.log(JSON.stringify(data, null, 2))
  process.exit(0)
}

export function outErr(data: unknown): never {
  console.log(JSON.stringify(data, null, 2))
  process.exit(1)
}

export function err(error: string, code = 1): never {
  console.error(JSON.stringify({ ok: false, error }))
  process.exit(code)
}
