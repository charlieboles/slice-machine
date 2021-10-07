import { Files, cookie } from '../utils'
import { PrismicConfigPath } from './paths'

export interface AuthConfig {
  base: string;
  cookies: string;
  oauthAccessToken?: string;
  authUrl?: string;
}

const DEFAULT_CONFIG: AuthConfig = {base: 'https://prismic.io', cookies: ''}

/**
  * A function that creates a default config
  * @param {string} [configPath] - the path to the configuration file
  * @returns {Config} - the default config.
*/
export function createDefaultAuthConfig(cwd?: string): AuthConfig {
  const configPath = PrismicConfigPath(cwd)
  Files.write(configPath, JSON.stringify(DEFAULT_CONFIG, null, '\t'), { recursive: false })
  return DEFAULT_CONFIG
}

/**
  * A function that retrieve the configuration file or create it if it doesn't exist.
  * @param {string} [configPath] - the path to the configuration file
  * @returns {Config} - the config object.
*/
export function getOrCreateAuthConfig(cwd?: string): AuthConfig {
  const configPath = PrismicConfigPath(cwd)
  if (!Files.exists(configPath)) return createDefaultAuthConfig(cwd)
  
  const conf = Files.readJson(configPath)
  const completeConf: AuthConfig = { ...DEFAULT_CONFIG, ...conf }
  return completeConf
}

/**
  * A function that update the configuration file
  * @param {string} [configPath] - the path to the configuration file
  * @param {Partial<Config>} [data] - configuration attributes to change
  * @returns {void} nothing
*/
export function updateAuthConfig(data: Partial<AuthConfig>, cwd?: string): void {
  const configPath = PrismicConfigPath(cwd)
  const oldConfig = getOrCreateAuthConfig(cwd)

  return Files.write(configPath, { ...oldConfig, ...data }, { recursive: false })
}

/**
  * A function that creates a default config
  * @param {string} [configPath] - the path to the configuration file
  * @returns {void} nothing
*/
export function removeAuthConfig(cwd?: string): void {
  const configPath = PrismicConfigPath(cwd)
  return Files.remove(configPath)
}

/**
  * A function to update the config cookies
  * @param {string} [base] - the base for which the cookies are valid
  * @param {string} [cookies] - the list of new cookies
  * @returns {void} nothing
*/
export function setAuthConfigCookies(base: string, cookies: ReadonlyArray<string> = [], cwd?: string): void {
  const { cookies: currentCookies } = getOrCreateAuthConfig(cwd)
  const oldCookies = cookie.parse(currentCookies || '')

  const newCookies = cookies.map(str => cookie.parse(str)).reduce((acc, curr) => {
    return {...acc, ...curr}
  }, {})

  const mergedCookie = Object.entries({...oldCookies, ...newCookies}).map(([key, value]) => {
    return cookie.serialize(key, value)
  }).join('; ')

  return updateAuthConfig({ base, cookies: mergedCookie })
}