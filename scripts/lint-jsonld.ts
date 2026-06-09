import {
  organization,
  webSite,
  localBusiness,
  service,
  faqPage,
  breadcrumbList,
} from '../lib/schema/jsonld'

const SCHEMA_CONTEXT = 'https://schema.org'

type JsonLdObject = {
  '@context': unknown
  '@type': unknown
  [key: string]: unknown
}

const builders: Array<{ name: string; value: JsonLdObject }> = [
  { name: 'organization', value: organization() as JsonLdObject },
  { name: 'webSite', value: webSite() as JsonLdObject },
  { name: 'localBusiness', value: localBusiness() as JsonLdObject },
  {
    name: 'service',
    value: service({
      name: 'AI Audit',
      description: 'A structured review of where AI can help.',
      url: 'https://emvyai.com/services/ai-assessment',
    }) as JsonLdObject,
  },
  {
    name: 'faqPage',
    value: faqPage({
      questions: [{ question: 'What is EMVY?', answer: 'An AI consultancy.' }],
    }) as JsonLdObject,
  },
  {
    name: 'breadcrumbList',
    value: breadcrumbList([{ name: 'Home', url: 'https://emvyai.com' }]) as JsonLdObject,
  },
]

let failed = 0
for (const { name, value } of builders) {
  if (value['@context'] !== SCHEMA_CONTEXT) {
    console.error(`✗ ${name}: @context is ${JSON.stringify(value['@context'])}, expected ${SCHEMA_CONTEXT}`)
    failed += 1
    continue
  }
  if (typeof value['@type'] !== 'string' || value['@type'].length === 0) {
    console.error(`✗ ${name}: @type must be a non-empty string, got ${JSON.stringify(value['@type'])}`)
    failed += 1
    continue
  }
  try {
    const round = JSON.parse(JSON.stringify(value))
    if (JSON.stringify(round) !== JSON.stringify(value)) {
      console.error(`✗ ${name}: JSON round-trip changed the value`)
      failed += 1
      continue
    }
  } catch (err) {
    console.error(`✗ ${name}: not JSON-serializable (${(err as Error).message})`)
    failed += 1
    continue
  }
  console.log(`✓ ${name} (${value['@type']})`)
}

if (failed > 0) {
  console.error(`\n${failed} JSON-LD builder(s) failed lint`)
  process.exit(1)
}
console.log(`\nAll ${builders.length} JSON-LD builders passed lint`)
