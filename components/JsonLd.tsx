import type { Thing } from 'schema-dts'

type JsonLdProps = {
  data: Thing | ReadonlyArray<Thing>
}

const LESS = String.fromCharCode(0x003c)
const AMP = String.fromCharCode(0x0026)
const LSEP = String.fromCharCode(0x2028)
const PSEP = String.fromCharCode(0x2029)

function escapeForScriptTag(json: string): string {
  return json
    .replaceAll(LESS, '\\u003c')
    .replaceAll(AMP, '\\u0026')
    .replaceAll(LSEP, '\\u2028')
    .replaceAll(PSEP, '\\u2029')
}

export default function JsonLd({ data }: JsonLdProps) {
  const json = escapeForScriptTag(JSON.stringify(data))
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
