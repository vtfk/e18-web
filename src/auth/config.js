/*
  Import modules
*/
import envToObj from './lib/envToObj'

/*
  Default configuration
*/
const defaultConfig = {
  common: {
    loginUrl: '/loginredirect',
    storage: 'local',
    login: {
      type: 'redirect'
    }
  },
  providers: {
    azuread: {
      client: {
        auth: {
          clientId: '[Requred in environment variables]',
          authority: 'https://sts.windows.net/08f3813c-9f29-482f-9aec-16ef7cbf477a',
          redirectUri: 'http://localhost:3000/handlelogin',
          navigateToLoginRequestUrl: false
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false
        }
      },
      login: {
        scopes: ['clientId/.default']
      }
    }
  }
}

const config = envToObj(defaultConfig, { prefixes: 'auth' })
if (process.env.NODE_ENV === 'development') console.log('Authentication configuration', config)

export default config
