/**
 * Determines if the request is made by a Microsoft Teams client
 * @returns { Boolean }
 */
export function isFromTeams () {
  if (!window?.navigator?.userAgent) return false

  // Check if window is inside iFrame
  let isInsideIFrame = false
  try { isInsideIFrame = window.self !== window.top } catch { isInsideIFrame = true }

  // Get the userAgent to check if it contains teams
  const userAgent = window.navigator.userAgent.toLocaleLowerCase()
  return isInsideIFrame || userAgent.includes('teams') || false
}

/**
 * Determines if the request is made by a mobile device
 * @returns { Boolean }
 */
export function isFromMobile () {
  if (!window?.navigator?.userAgent) return false
  const userAgent = window.navigator.userAgent.toLocaleLowerCase()
  return userAgent.includes('mobile') || userAgent.includes('android') || false
}

/**
 * Retreiving the context from Teams is a bit annoying, this makes it simpler
 * @param {*} msTeamsInstance
 * @returns { Promise<Object> }
 */
export function getTeamsContext (msTeamsInstance) {
  // Attempt to retreive loginHint from TeamsContext
  return new Promise(async (resolve) => {
    try {
      // Simple function to sleep for x ms
      // We have to do this because getContext does not run the callback if no ctx was found
      function sleep (ms) { return new Promise((resolve) => setTimeout(() => resolve(), ms)) }

      // Attempt to retreive the teams context
      let msTeamsContext
      msTeamsInstance.getContext((ctx) => {
        msTeamsContext = ctx
      })
      await sleep(500)

      resolve(msTeamsContext)
    } catch { resolve(undefined) }
  })
}
