/*
  Import dependencies
*/
import * as msal from '@azure/msal-browser'

/*
  Declarations
*/
// The name of the provider
export const name = 'azuread'
// The MSAL instance
let msalClient

/*
  Functions
*/
export async function initialize (options) {
  // Create a new MSAL instance
  msalClient = new msal.PublicClientApplication(options)
}

export async function login (clientOptions = {}, loginOptions = {}) {
  // Initialize if applicable
  if (!msalClient) initialize(clientOptions)

  // Login with redirection
  if (loginOptions.type !== 'popup') return msalClient.acquireTokenRedirect(loginOptions)

  // Login with popup
  return await msalClient.acquireTokenPopup(loginOptions)
}

export async function silentLogin (clientOptions = {}, loginOptions = {}) {
  // Initialize if applicable
  if (!msalClient) initialize(clientOptions)

  // Attempt to find a account in the cache
  const accounts = msalClient.getAllAccounts()
  if (accounts && Array.isArray(accounts) && accounts.length > 0) loginOptions.account = accounts.find((a) => a.username === loginOptions.loginHint) || accounts[0]

  // Acquire a token
  const token = await msalClient.acquireTokenSilent(loginOptions)

  // Retrun it
  return token
}

export async function handleRedirect (clientOptions = {}, loginOptions = {}) {
  // Initialize if applicable
  if (!msalClient) initialize(clientOptions)

  // Handle the redirection
  const token = await msalClient.handleRedirectPromise()

  // Return the token
  return token
}
