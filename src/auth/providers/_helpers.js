/*
  Import dependencies
*/
import config from '../config'

/**
 * Retreives the config for a given provider
 * @param { String } providerName example: azuread
 * @returns { Object }
 */
export function getProviderConfig (providerName) {
  if (!providerName) return undefined
  if (config && config.providers && config.providers[providerName]) return config.providers[providerName]
  return undefined
}

/**
 * Retreives just the client config for a given provider
 * @param { String } providerName
 * @returns { Object }
 */
export function getProviderClientConfig (providerName) {
  if (!providerName) return undefined
  const providerConfig = getProviderConfig(providerName)
  if (!providerConfig || !providerConfig.client) return undefined
  return providerConfig.client
}

/**
 * Retreives just the request config for a given provider
 * @param { String } providerName
 * @returns
 */
export function getProviderLoginConfig (providerName) {
  if (!providerName) return undefined
  const providerConfig = getProviderConfig(providerName)
  if (!providerConfig || !providerConfig.login) return undefined
  return providerConfig.login
}
