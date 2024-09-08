import { ZERO_ADDRESS, ZERO_HASH } from '../sdk/constants'
import FACTORY from 'contracts/build/Factory.json'
import { StorageState } from 'state/application/reducer'
import { getContractInstance } from 'utils/contract'
import { Log, consoleLog } from 'utils/logs'
import { filterTokenLists } from 'utils/list'
import { STORAGE_APP_KEY } from '../constants'

export const getCurrentDomain = (): string => {
  return window.location.hostname || document.location.host || ''
}

const validArray = (arr: any[]) => Array.isArray(arr) && !!arr.length

const defaultSettings = (): StorageState => ({
  admin: '',
  contracts: {},
  factory: '',
  router: '',
  pairHash: '',
  feeRecipient: '',
  protocolFee: undefined,
  totalFee: undefined,
  allFeeToProtocol: undefined,
  possibleProtocolPercent: [],
  totalSwaps: undefined,
  domain: '',
  projectName: '',
  logo: '',
  favicon: '',
  tokenListsByChain: {},
  tokenLists: [],
  navigationLinks: [],
  menuLinks: [],
  socialLinks: [],
  addressesOfTokenLists: [],
  defaultSwapCurrency: { input: '', output: '' },
})

const parseSettings = (settings: string, chainId: number): StorageState => {
  const appSettings = defaultSettings()

  try {
    const settingsJSON = JSON.parse(settings)

    if (!settingsJSON?.[STORAGE_APP_KEY]) {
      settingsJSON[STORAGE_APP_KEY] = {}
    }
    if (!settingsJSON[STORAGE_APP_KEY]?.contracts) {
      settingsJSON[STORAGE_APP_KEY].contracts = {}
    }
    if (!settingsJSON[STORAGE_APP_KEY]?.contracts) {
      settingsJSON[STORAGE_APP_KEY].tokenLists = {}
    }

    const { definance: parsedSettings } = settingsJSON

    const {
      contracts,
      pairHash,
      feeRecipient,
      domain,
      projectName,
      logoUrl,
      faviconUrl,
      navigationLinks,
      menuLinks,
      socialLinks,
      tokenLists,
      addressesOfTokenLists,
      defaultSwapCurrency,
    } = parsedSettings

    appSettings.contracts = contracts

    if (contracts[chainId]) {
      const { factory, router } = contracts[chainId]

      appSettings.factory = factory
      appSettings.router = router
    }

    if (pairHash !== ZERO_HASH) appSettings.pairHash = pairHash
    if (feeRecipient !== ZERO_ADDRESS) appSettings.feeRecipient = feeRecipient
    if (domain) appSettings.domain = domain
    if (projectName) appSettings.projectName = projectName

    if (logoUrl) appSettings.logo = logoUrl
    if (faviconUrl) appSettings.favicon = faviconUrl

    if (validArray(navigationLinks)) appSettings.navigationLinks = navigationLinks
    if (validArray(menuLinks)) appSettings.menuLinks = menuLinks
    if (validArray(socialLinks)) appSettings.socialLinks = socialLinks
    if (validArray(addressesOfTokenLists)) appSettings.addressesOfTokenLists = addressesOfTokenLists

    if (tokenLists && Object.keys(tokenLists).length) {
      appSettings.tokenListsByChain = tokenLists

      if (tokenLists[chainId]) {
        appSettings.tokenLists = filterTokenLists(chainId, tokenLists[chainId])
      }
    }

    if (defaultSwapCurrency) {
      const { input, output } = defaultSwapCurrency

      if (input) appSettings.defaultSwapCurrency.input = input
      if (output) appSettings.defaultSwapCurrency.output = output
    }
  } catch (error) {
    consoleLog({
      value: {
        error,
        'source settings': settings,
      },
      title: 'Storage settings',
      type: Log.error,
    })
  }

  return appSettings
}

export const fetchDomainData = async (
  chainId: undefined | number,
  library: any,
  storage: any
): Promise<StorageState | null> => {
  let fullData = defaultSettings()

  try {
    const currentDomain = getCurrentDomain()
    const { info, owner } = await storage.methods.getData(currentDomain).call()
    const settings = parseSettings(info || '{}', chainId || 0)

    fullData = { ...settings, admin: owner === ZERO_ADDRESS ? '' : owner }

    if (fullData?.factory) {
      try {
        const { factory } = fullData
        const factoryContract = getContractInstance(library.provider, factory, FACTORY.abi)
        const factoryInfo = await factoryContract.methods.allInfo().call()

        const {
          protocolFee,
          feeTo,
          totalFee,
          allFeeToProtocol,
          totalSwaps = undefined,
          POSSIBLE_PROTOCOL_PERCENT,
          INIT_CODE_PAIR_HASH,
        } = factoryInfo

        return {
          ...fullData,
          pairHash: INIT_CODE_PAIR_HASH,
          protocolFee,
          feeRecipient: feeTo,
          totalFee,
          allFeeToProtocol,
          possibleProtocolPercent: validArray(POSSIBLE_PROTOCOL_PERCENT) ? POSSIBLE_PROTOCOL_PERCENT.map(Number) : [],
          totalSwaps,
        }
      } catch (error) {
        consoleLog({ value: error, title: 'Factory info', type: Log.error })
      }
    }

    return fullData
  } catch (error) {
    consoleLog({ value: error, title: 'Domain data request', type: Log.error })
    return null
  }
}
