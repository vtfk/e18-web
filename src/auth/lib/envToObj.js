/*
  Import dependencies
*/
import { set, merge } from 'lodash'

/*
  State
*/
const cache = {}

/*
  Helper functions
*/
function typeifyVariable (variable) {
  if (!variable) return variable

  function parseNumber (variable) {
    let parsed
    if (variable.match(/-|:/)) return undefined // Prevents parsing dates as numbers
    if (variable.match((/\D/))) return undefined // Prevents parsing strings with text as number
    if (variable.includes('.') || variable.includes(',')) parsed = parseFloat(variable)
    else parsed = parseInt(variable)

    return parsed || undefined
  }

  if (typeof variable === 'string') {
    // Int and float
    if (parseNumber(variable)) return parseNumber(variable)

    // Booleans
    if (variable.toLowerCase() === 'false') return false
    if (variable.toLocaleLowerCase() === 'true') return true

    // Dates
    const iso8601Date = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/m
    const iso8601DateTime = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d$/m
    const iso8601DateTimeMs = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+Z$/m
    if (iso8601Date.exec(variable) || iso8601DateTime.exec(variable) || iso8601DateTimeMs.exec(variable)) return new Date(variable)

    // Arrays
    if (variable.startsWith('[') && variable.endsWith(']')) {
      variable = variable.substring(1, variable.length - 1)
      variable = variable.split(',').map((i) => {
        if ((i.startsWith("'") && i.endsWith("'")) || (i.startsWith('"') && i.startsWith('"'))) return i.substring(1, i.length - 1).trim()
        return typeifyVariable(i)
      })
    }
  }

  return variable
}

function trimAwayMatch (regex, variable) {
  if (!regex) return variable
  if (typeof variable !== 'string') return variable

  const match = regex.exec(variable)
  if (match && match[0]) variable = variable.substring(match[0].length)

  return variable
}

/**
 * @param {Object} defaultConfig Object containing default configuration
 * @param {Object} options
 * @param {String} options.delimiter What character delimits the path parts of the environment variables?
 * @param {String || [String]} options.prefixes The prefixes of the enviroment variables to generate config from
 * @param {String || [String]} options.spreadPrefixes Drill down and spread environment variables stored in a environment variables
 * @param {Boolean} options.force Should the function run again?
 * @returns {Object}
 */
/* eslint-disable import/no-anonymous-default-export */
function envToObj (defaultConfig = {}, options = {}) {
  /*
    Defaults
  */
  const defaultOptions = {
    delimiter: '__'
  }
  Object.assign(options, defaultOptions, options || {})
  /*
    Declarations
  */
  // Destructure options
  let { prefixes, spreadPrefixes, delimiter, force } = options

  // Input validation/normalization
  if (!process.env) return
  if (!defaultConfig || typeof defaultConfig !== 'object') defaultConfig = {}
  if (prefixes && !Array.isArray(prefixes)) prefixes = [prefixes]
  if (spreadPrefixes && !Array.isArray(spreadPrefixes)) spreadPrefixes = [spreadPrefixes]

  // Check the cache if this has already been processed
  const cacheKey = prefixes ? prefixes.join('_') : '*'
  if (force !== true && cache[cacheKey]) return cache[cacheKey]

  // Determine the prefix patterns
  const systemPrefixes = /REACT_APP_|VUE_APP_/
  const prefixPattern = prefixes ? new RegExp(prefixes.map((p) => `^${p}`).join('|')) : undefined

  // Determine spread variables
  spreadPrefixes = spreadPrefixes || ['ENVIRONMENT']

  // Search for system-keys
  for (const key of Object.keys(process.env)) {
    // Strip away any system prefixes
    const path = trimAwayMatch(systemPrefixes, key)
    // If delimiter-key
    if (path === 'ENV_PATH_DELIMITER') {
      const _delimiter = process.env[key]
      if (!delimiter && _delimiter && typeof _delimiter === 'string' && _delimiter.length === 1) delimiter = _delimiter
    }
  }

  // Normalize the environment variables
  let environmentVariables = []
  const systemPaths = ['ENV_PATH_DELIMITER']
  for (const key of Object.keys(process.env)) {
    // Strip away any system prefixes
    let path = trimAwayMatch(systemPrefixes, key)

    // If any of the system paths, just skip
    if (systemPaths.includes(path)) continue

    // If a delimiter is specified, split on that and join on '.' to get a valid JSON path
    if (delimiter) path = path.split(delimiter).join('.')

    // Add the normalized key to the array
    environmentVariables.push({ key, path: path })
  }

  // Spread variables
  if (spreadPrefixes) {
    const toSpread = environmentVariables.filter((i) => spreadPrefixes.some((p) => p.startsWith(i.path)))
    for (const spreadVar of toSpread) {
      const val = process.env[spreadVar.key]
      if (!val) continue
      const rows = val.split(/\r?\n/)
      for (const row of rows) {
        if (!row.includes('=') || /^(\s)*#/.exec(row)) continue // If the row dont start includes = or it starts with # it is not a valid entry, continue

        const [key, value] = row.split(/=(.*)/) // Split on the first occurance of =
        let path = key
        // If a delimiter is specified, split on that and join on '.' to get a valid JSON path
        if (delimiter) path = key.split(delimiter).join('.')
        environmentVariables.push({ key, path: trimAwayMatch(systemPrefixes, path), value })
      }
    }
  }

  // Filter out environment variables that does not match
  if (prefixPattern) {
    const filteredEnvironmentVariables = []
    for (const envvar of environmentVariables) {
      if (!envvar) continue
      const match = prefixPattern.exec(envvar.path)
      if (!match || !match[0]) continue
      envvar.path = envvar.path.substring(match[0].length).replace(/^\.*/, '')
      filteredEnvironmentVariables.push(envvar)
    }
    environmentVariables = filteredEnvironmentVariables
  }

  // Parse values and create config object
  const environmentConfig = {}
  for (const envvar of environmentVariables) {
    const path = envvar.path
    let value = envvar.value || process.env[envvar.key]

    // Retreive the value and trim it
    if (value && typeof value === 'string') value = value.trim()
    if (!spreadPrefixes.some((i) => envvar.path.startsWith(i))) value = typeifyVariable(value)

    // Set the value to the environment config
    set(environmentConfig, path, value)
  }

  // Merge the default and environment config
  const mergedConfig = {}
  merge(mergedConfig, defaultConfig, environmentConfig)

  // Cache the result
  cache[cacheKey] = mergedConfig

  // Return the merged config
  return mergedConfig
}

export default envToObj
