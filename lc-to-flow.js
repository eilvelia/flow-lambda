// @flow

const inputStr = process.argv[2]

if (!inputStr) {
  console.error('<input-str> is empty')
  process.exit(1)
}

const LAMBDA = ['λ', '\\']

/*::
type LambdaTerm =
  | {| type: 'Var', name: string |}
  | {| type: 'Abstr', argName: string, body: LambdaTerm |}
  | {| type: 'App', fn: LambdaTerm, value: LambdaTerm |}
*/

const Var = (name/*: string */)/*: LambdaTerm */ =>
  ({ type: 'Var', name })
const Abstr = (argName/*: string */, body/*: LambdaTerm */)/*: LambdaTerm */ =>
  ({ type: 'Abstr', argName, body })
const App = (fn/*: LambdaTerm */, value/*: LambdaTerm */)/*: LambdaTerm */ =>
  ({ type: 'App', fn, value })

/*:: type Maybe<T> = T | null */

// // (<|>) from Alternative, defined for Maybe
// /*:: declare function or<T>(Maybe<T>, Maybe<T>): Maybe<T> */
// function or(m1, m2) {
//   if (m1 != null) return m1
//   if (m2 != null) return m2
//   return null
// }

/*:: declare function orLazy<T>(() => Maybe<T>, () => Maybe<T>): Maybe<T> */
function orLazy(m1f, m2f) {
  const m1 = m1f()
  if (m1 != null) return m1
  const m2 = m2f()
  if (m2 != null) return m2
  return null
}

/*:: type Parser<T> = Maybe<[T, string]> */

function mapParser/*::<T, U>*/(p/*: Parser<T> */, f/*: T => U */)/*: Parser<U> */ {
  if (!p) return null
  return [f(p[0]), p[1]]
}

function many/*::<T>*/(pf/*: string => Parser<T>*/, source/*: string */)/*: Parser<T[]>*/ {
  const p = pf(source)
  if (p) {
    const [value, source2] = p
    const p2 = many(pf, source2)
    if (!p2) return [[value], source2]
    const [values, source3] = p2
    return [[value].concat(values), source3]
  }
  return [[], source]
}

function some/*::<T>*/(pf/*: string => Parser<T>*/, source/*: string */)/*: Parser<T[]>*/ {
  const p = many(pf, source)
  if (!p) return null
  const [values] = p
  if (values.length === 0) return null
  return p
}

const parseIdent = (source)/*: Parser<string> */ => {
  // console.log('parseIdent', source)
  const matched = source.match(/^\w/)
  if (!matched) return null
  const ident/*: string */ = matched[0]
  return [ident, source.substr(ident.length)]
}

const parseVar = (source)/*: Parser<LambdaTerm> */ => {
  // console.log('parseVar')
  const pVarName = parseIdent(source)
  return mapParser(pVarName, Var)
}

const parseAbstr = (source)/*: Parser<LambdaTerm> */ => {
  // console.log('parseAbstr', source)
  if (!LAMBDA.includes(source[0])) return null
  const source2 = source.substr(1)
  const pArgName = parseIdent(source2)
  if (!pArgName) return null
  const [argName, source3] = pArgName
  if (source3[0] !== '.') return null
  const source4 = source3.substr(1)
  const pbody = parseTerm(source4)
  return mapParser(pbody, body => Abstr(argName, body))
}

const parseApps = (source)/*: Parser<LambdaTerm> */ => {
  // console.log('parseApps', source)
  const pterms = some(parseSimpleTerm, source)
  if (!pterms) return null
  return mapParser(pterms, terms => terms.reduce(App))
}

const parseSimpleTerm = (source)/*: Parser<LambdaTerm> */ => {
  // console.log('parseSimpleTerm', source)
  if (source[0] === '(') {
    const pterm = parseTerm(source.substr(1))
    if (!pterm) return null
    const [term, source2] = pterm
    if (source2[0] !== ')') return null
    return [term, source2.substr(1)]
  }
  return parseVar(source)
}

const parseTerm = (source/*: string */)/*: Parser<LambdaTerm> */ => {
  // console.log('parseTerm', source)
  return orLazy(
    () => parseAbstr(source),
    () => orLazy(
      () => parseApps(source),
      () => parseSimpleTerm(source)))
}

const parse = (source)/*: LambdaTerm | null */ => {
  const source2 = source.replace(/\s+/g, '')
  const pterm = parseTerm(source2)
  if (!pterm) return null
  const [term, source3] = pterm
  if (source3) {
    console.error('Expected EOF, got:', source3)
    return null
  }
  return term
}

const generateFlow = (term/*: LambdaTerm */)/*: string */ => {
  switch (term.type) {
    case 'Var':
      return term.name.toUpperCase()
    case 'Abstr':
      const argName = term.argName.toUpperCase()
      return `<${argName}>(${argName}) => ${generateFlow(term.body)}`
    case 'App':
      const fn = generateFlow(term.fn)
      const value = generateFlow(term.value)
      return `$Call<${fn}, ${value}>`
    default: return (term/*: empty */)
  }
}

const ast = parse(inputStr)

if (!ast) {
  console.error('Parsing failed')
  process.exit(1)
} else {
  const outputStr = generateFlow(ast)
  console.log(outputStr)
}
