export const API = {
  URL: process.env.REACT_APP_API_URL,
  TOKEN: process.env.REACT_APP_API_TOKEN
}

export const APP = {
  IS_MOCK: (process.env.REACT_APP_MOCK && process.env.REACT_APP_MOCK.toLowerCase() === 'true') || false
}
