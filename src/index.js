import { readFile, writeFile } from 'fs'
import { promisify } from 'util'
import minimist from 'minimist'

function prettyJSON(object) {
  return JSON.stringify(object, null, 2)
}

async function loadJSONFile(path) {
  const read = promisify(readFile)

  return JSON.parse(await read(path, { encoding: 'utf8'}))
}

async function write(path, output) {
  const write = promisify(writeFile)

  return await write(path, output, { encoding: 'utf8'})
}

function getTypes(schema) {
  return schema.data.__schema.types.filter(type => type.name.slice(0, 2) !== '__')
}

function typeNames(types) {
  return types ? types.map(type => type.name) : []
}

function printAllTypes(schema) {
  prettyPrint({ includedTypes: typeNames(getTypes(schema)) })
}

async function readOrdering(path) {
  return (await loadJSONFile(path)).types
}

function includedTypes(ordering, types) {
  return ordering.map(typeName => types.find(type => type.name === typeName))
}

function renderTypeName(type) {
  return type.kind !== 'LIST' ? type.name : `List< ${type.ofType.name} >`
}

function renderInputTypeName(inputType) {
  return inputType.name
}

function renderArgument(arg) {
  return `${arg.name}: ${renderTypeName(arg.type)}`
}

function renderImplements(implementsInterface) {
  return implementsInterface.name
}

function renderList(items, itemRenderer) {
  let num = 0
  return aggregate(items,
    (item) => {
      num += 1
      return `${itemRenderer(item)} ${(num < items.length) ? ', ' : ''}`
    }
  )
}

function renderFieldDescription(description) {
  return description.replace(/\n/g, ', ')
}

function renderField(field) {
return `
| ${field.name} | ${renderTypeName(field.type)} | ${renderList(field.args, renderArgument)} | ${renderFieldDescription(field.description)} |`
}

function renderFields(fields) {
  return `${aggregate(fields, (field) => renderField(field))}`
}

function renderInputField(inputField) {
  return  `
  | ${inputField.name} | ${renderInputTypeName(inputField.type)} | ${renderFieldDescription(inputField.description)} |`
}

function renderInputFields(inputFields) {
  return `${aggregate(inputFields, (inputField) => renderInputField(inputField))}`
}

function renderInterface(type, options) {
  return `
${options.typeNameHeading} Interface ${renderTypeName(type)}

${type.description}

| Field | Type | Arguments | Description |
|-------|------|-----------|-------------|` +
`${renderFields(type.fields)}
`
}

function renderInput(inputType, options) {
  return `
${options.typeNameHeading} Input ${renderTypeName(inputType)}

${inputType.description}

| Field | Type | Description |
|-------|------|-------------|` +
`${renderInputFields(inputType.inputFields)}
`
}

function renderType(type, options) {
  return `
${options.typeNameHeading} Type ${renderTypeName(type)} ${(type.interfaces && type.interfaces.length > 0) ? 'implements ' + renderList(type.interfaces, renderImplements) : ''}

${type.description}

| Field | Type | Arguments | Description |
|-------|------|-----------|-------------|` +
`${renderFields(type.fields)}
`
}

function renderTypes(types, options) {
  return aggregate(types,
    type => {
      if (type.kind === 'OBJECT') return renderType(type, options)
      else if (type.kind === 'INPUT_OBJECT') return renderInput(type, options)
      else if (type.kind === 'INTERFACE') return renderInterface(type, options)
      else return ''
    }
  )
}

function aggregate(items, aggregator) {
  if (!items || items.length < 1) return ''

  return items.reduce((aggregate, item) => aggregate + aggregator(item), '')
}

export function run() {
  const args = minimist(process.argv)
  const command = args._[2]

  if (!command) {
      console.log(`
md-graphql-spec

Usage: md-graphql-spec [command]

Commands:
  types:
    Write a file listing all available GraphQL types
    Usage: md-graphql-spec types --schema <Schema> --types <Types>

  document:
    Write a markdown formatted file documenting the specified GraphQL schema
    Usage: md-graphql-spec document --schema <Schema> --ordering <Ordering> --document <Document>


Schema: Path to JSON result of a GraphQL Introspection Query

Types: Path to write the list of available GraphQL types

Ordering: Path a list of desired Types to include in the markdown document

Document: Path to write the markdown document
    `)
  }
  else if (command === 'types') types()
  else if (command === 'document') markdownSpec()
  else {
    console.log('Error: Invalid command: ', command)
  }
}


function parseArgs(argNames) {
  const args = minimist(process.argv)
  return argNames.reduce((result, argName) => {
    if (!args[argName]) {
      console.log('Missing argument: ', argName)
      process.exit(9)
    }

    result[argName] = args[argName]
    return result
  }, {})
}

export async function types() {
  const args = parseArgs(['schema', 'types'])

  const schema = await loadJSONFile(args.schema)
  const types = prettyJSON({ types: getTypes(schema).map(type => type.name) })

  await write(args.types, types)
}

export async function markdownSpec() {
  const args = parseArgs(['schema', 'ordering', 'doc'])
  const schema = await loadJSONFile(args.schema)

  const types = getTypes(schema)

  const ordering = await readOrdering(args.ordering)

  const included = includedTypes(ordering, types)

  const options = {
    typeNameHeading: '##'
  }

  const markdown = renderTypes(included, options)

  write(args.doc, markdown)
}
