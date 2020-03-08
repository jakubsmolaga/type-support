type Obj = { [key: string]: any }
const { isArray } = Array

// --- Basic Types ---

export const t = {
  string: '',
  number: 0,
  boolean: true,
  array: <T>(type: T): T[] => [type]
}

// --- Verify Object Schema ---

const verifyObjectSchema = (obj: Obj, schema: Obj, partially?: boolean): Error | undefined => {
  for (let key in obj) {
    let res = verifySchema(obj[key], schema[key])
    if (res instanceof Error) return new Error(`.${key}${res.message}`)
  }
  if (!partially && Object.keys(schema).length !== Object.keys(obj).length) {
    let key = findMissingProperty(obj, schema) || ''
    return new Error(`.${key}: expected ${typeof schema[key]}, found nothing`)
  }
}

const verifyArraySchema = (arr: Array<any>, schema: Array<any>): Error | undefined => {
  for (let i in arr) {
    let res = verifySchema(arr[i], schema[0])
    if (res instanceof Error) return new Error(`[${i}]${res.message}`)
  }
}

const prettyType = (obj: any): string =>
  typeof obj === 'undefined' ? 'nothing' : typeof obj

const verifySchema = (obj: any, schema: any, partially?: boolean): Error | undefined => {
  if (typeof schema !== typeof obj) return new Error(`: expected ${prettyType(schema)}, found ${typeof obj}`)
  if (isArray(schema) !== isArray(obj)) return new Error(`: expected array, found ${typeof obj}`)
  if (isArray(schema)) return verifyArraySchema(obj, schema)
  if (typeof schema === 'object') return verifyObjectSchema(obj, schema, partially)
}

const findMissingProperty = (obj: Obj, schema: Obj): string | undefined => {
  for (let key in schema)
    if (typeof obj[key] === 'undefined') return key
}

// --- Generate Helpers ---

const prettifySchemaError = (err: Error): Error =>
  new Error(`data doesnt match the schema at ${err.message}`)

type VerifyFunction = (obj: any, schema: any) => Error | undefined
type IsChecker<T> = (obj: any) => obj is T
type CastFunction<T> = (obj: any) => T
type SchemaErrorGetter = (obj: any) => string
type Helpers<T> = [IsChecker<T>, CastFunction<T>, SchemaErrorGetter]
const getCustomHelpers = <T>(schema: any, verifyFunc: VerifyFunction): Helpers<T> => {
  let is = (obj: any): obj is T =>
    !(verifyFunc(obj, schema) instanceof Error)
  let cast = (obj: any): T => {
    if (!is(obj)) throw prettifySchemaError(verifyFunc(obj, schema)!)
    return obj
  }
  let getError = (obj: any): string =>
    prettifySchemaError(verifyFunc(obj, schema)!).message
  return [is, cast, getError]
}

export const getHelpers = <T>(schema: any): Helpers<T> =>
  getCustomHelpers<T>(schema, (o, s) => verifySchema(o, s))

export const getPartialHelpers = <T>(schema: any): Helpers<T> =>
  getCustomHelpers<T>(schema, (o, s) => verifySchema(o, s, true))