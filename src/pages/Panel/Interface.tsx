import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import validUrl from 'valid-url'
import styled from 'styled-components'
import { useActiveWeb3React } from 'hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useAddPopup, useAppState } from 'state/application/hooks'
import { ButtonPrimary } from 'components/Button'
import { TokenLists } from './TokenLists'
import Input from 'components/Input'
import InputPanel from 'components/InputPanel'
import ListFactory from 'components/ListFactory'
import MenuLinksFactory, { LinkItem } from 'components/MenuLinksFactory'
import TextBlock from 'components/TextBlock'
import NetworkRelatedSettings from './NetworkRelatedSettings'
import { OptionWrapper } from './index'
import { STORAGE_NETWORK_ID, STORAGE_NETWORK_NAME } from '../../constants'
import { saveAppData } from 'utils/storage'
import { parseENSAddress } from 'utils/parseENSAddress'
import uriToHttp from 'utils/uriToHttp'
import networks from 'networks.json'

const Button = styled(ButtonPrimary)`
  font-size: 0.8em;
  margin-top: 0.3rem;
`

const Title = styled.h3`
  font-weight: 400;
  margin: 1.4rem 0 0.6rem;
`

export default function Interface(props: any) {
  const { pending, setPending, activeNetworks } = props
  const { t } = useTranslation()
  const { library, chainId, account } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const addPopup = useAddPopup()

  const {
    projectName: stateProjectName,
    logo: stateLogo,
    favicon: stateFavicon,
    navigationLinks: stateNavigationLinks,
    menuLinks: stateMenuLinks,
    socialLinks: stateSocialLinks,
    addressesOfTokenLists: stateAddressesOfTokenLists,
    tokenListsByChain: stateTokenListsByChain,
    defaultSwapCurrency,
  } = useAppState()

  const [projectName, setProjectName] = useState(stateProjectName)
  const [logoUrl, setLogoUrl] = useState(stateLogo)
  const [isValidLogo, setIsValidLogo] = useState(Boolean(validUrl.isUri(stateLogo)))
  const [faviconUrl, setFaviconUrl] = useState(stateFavicon)
  const [isValidFavicon, setIsValidFavicon] = useState(Boolean(validUrl.isUri(stateFavicon)))

  useEffect(() => {
    setIsValidLogo(logoUrl ? Boolean(validUrl.isUri(logoUrl)) : true)
  }, [logoUrl])

  useEffect(() => {
    setIsValidFavicon(faviconUrl ? Boolean(validUrl.isUri(faviconUrl)) : true)
  }, [faviconUrl])

  const [navigationLinks, setNavigationLinks] = useState<LinkItem[]>(stateNavigationLinks)
  const [menuLinks, setMenuLinks] = useState<LinkItem[]>(stateMenuLinks)
  const [socialLinks, setSocialLinks] = useState<string[]>(stateSocialLinks)
  const [addressesOfTokenLists, setAddressesOfTokenLists] = useState<string[]>(stateAddressesOfTokenLists)
  const [tokenLists, setTokenLists] = useState<any>(stateTokenListsByChain)
  const [swapInputCurrency, setSwapInputCurrency] = useState(defaultSwapCurrency.input || '')
  const [swapOutputCurrency, setSwapOutputCurrency] = useState(defaultSwapCurrency.output || '')

  const currentStrSettings = JSON.stringify({
    projectName: stateProjectName,
    logoUrl: stateLogo,
    faviconUrl: stateFavicon,
    navigationLinks: stateNavigationLinks,
    menuLinks: stateMenuLinks,
    socialLinks: stateSocialLinks,
    addressesOfTokenLists: stateAddressesOfTokenLists,
    swapInputCurrency: defaultSwapCurrency.input,
    swapOutputCurrency: defaultSwapCurrency.output,
  })

  const [settingsChanged, setSettingsChanged] = useState(false)

  useEffect(() => {
    const newStrSettings = JSON.stringify({
      projectName,
      logoUrl,
      faviconUrl,
      navigationLinks,
      menuLinks,
      socialLinks,
      addressesOfTokenLists,
      swapInputCurrency,
      swapOutputCurrency,
    })

    setSettingsChanged(newStrSettings !== currentStrSettings)
  }, [
    currentStrSettings,
    projectName,
    logoUrl,
    faviconUrl,
    navigationLinks,
    menuLinks,
    socialLinks,
    addressesOfTokenLists,
    swapInputCurrency,
    swapOutputCurrency,
  ])

  const [cannotSaveSettings, setCannotSaveSettings] = useState(true)

  useEffect(() => {
    setCannotSaveSettings(chainId !== STORAGE_NETWORK_ID || !settingsChanged || !isValidLogo || !isValidFavicon)
  }, [settingsChanged, isValidLogo, isValidFavicon, chainId])

  const saveSettings = async () => {
    setPending(true)

    try {
      const newSettings = {
        projectName,
        logoUrl,
        faviconUrl,
        navigationLinks,
        menuLinks,
        socialLinks,
        addressesOfTokenLists,
        // @todo Take into account base coins, not only tokens
        defaultSwapCurrency: {
          input: swapInputCurrency,
          output: swapOutputCurrency,
        },
      }

      await saveAppData({
        //@ts-ignore
        library,
        owner: account || '',
        data: newSettings,
        onHash: (hash: string) => {
          addTransaction(
            { hash },
            {
              summary: `Chain ${chainId}. Settings saved`,
            }
          )
        },
      })
    } catch (error) {
      addPopup({
        error: {
          message: error.message,
          code: error.code,
        },
      })
    }

    setPending(false)
  }

  const [newListChainId, setNewListChainId] = useState('')
  const [newListId, setNewListId] = useState('templatelist')
  const [isUniqueNewList, setIsUniqueNewList] = useState(false)
  const [canCreateNewList, setCanCreateNewList] = useState(false)

  useEffect(() => {
    const isUnique = newListChainId && newListId && !tokenLists[newListChainId]?.[newListId]

    setIsUniqueNewList(Boolean(isUnique))
    setCanCreateNewList(Boolean(networks[newListChainId as keyof typeof networks] && newListId && isUnique))
  }, [newListChainId, newListId, tokenLists])

  const createNewTokenList = () => {
    setTokenLists((oldData: any) => ({
      ...oldData,
      [newListChainId]: {
        ...oldData[newListChainId],
        [newListId]: {
          name: 'Template list',
          logoURI: '',
          tokens: [],
        },
      },
    }))
  }

  return (
    <section>
      <div className={`${pending ? 'disabled' : ''}`}>
        <OptionWrapper>
          <InputPanel label={`${t('projectName')}`} value={projectName} onChange={setProjectName} />
        </OptionWrapper>

        <OptionWrapper>
          <InputPanel label={`${t('logoUrl')}`} value={logoUrl} onChange={setLogoUrl} error={!isValidLogo} />
        </OptionWrapper>
        <OptionWrapper>
          <InputPanel
            label={`${t('faviconUrl')}`}
            value={faviconUrl}
            onChange={setFaviconUrl}
            error={!isValidFavicon}
          />
        </OptionWrapper>

        <OptionWrapper>
          <MenuLinksFactory
            title={t('navigationLinks')}
            items={navigationLinks}
            setItems={setNavigationLinks}
            isValidItem={(item: LinkItem) => Boolean(validUrl.isUri(item.source))}
          />
        </OptionWrapper>

        <OptionWrapper>
          <MenuLinksFactory
            title={t('menuLinks')}
            items={menuLinks}
            setItems={setMenuLinks}
            isValidItem={(item: LinkItem) => Boolean(validUrl.isUri(item.source))}
          />
        </OptionWrapper>

        <OptionWrapper>
          <ListFactory
            title={t('socialLinks')}
            placeholder="https://"
            items={socialLinks}
            setItems={setSocialLinks}
            isValidItem={(address) => Boolean(validUrl.isUri(address))}
          />
        </OptionWrapper>

        <OptionWrapper>
          <ListFactory
            title={t('addressesOfTokenLists')}
            placeholder="https:// or ipfs://"
            items={addressesOfTokenLists}
            setItems={setAddressesOfTokenLists}
            isValidItem={(address) => uriToHttp(address).length > 0 || Boolean(parseENSAddress(address))}
          />
        </OptionWrapper>

        <NetworkRelatedSettings
          activeNetworks={activeNetworks}
          onInputCurrency={setSwapInputCurrency}
          onOutputCurrency={setSwapOutputCurrency}
        />

        <Button onClick={saveSettings} disabled={cannotSaveSettings}>
          {t(chainId === STORAGE_NETWORK_ID ? 'saveSettings' : 'switchToNetwork', {
            network: STORAGE_NETWORK_NAME,
          })}
        </Button>

        <Title>{t('tokenLists')}</Title>
        <TokenLists pending={pending} setPending={setPending} tokenLists={tokenLists} />

        <OptionWrapper margin={0.4}>
          <Input
            label={`${t('listNetworkId')} *`}
            questionHelper={t('listNetworkIdDescription')}
            value={newListChainId}
            onChange={setNewListChainId}
          />
          <Input
            label={`${t('listId')} *`}
            questionHelper={t('listIdDescription')}
            value={newListId}
            onChange={setNewListId}
          />

          {newListChainId && newListId && !isUniqueNewList && <TextBlock warning>{t('youHaveSuchList')}</TextBlock>}

          <Button disabled={!canCreateNewList} onClick={createNewTokenList}>
            {t('createNewTokenList')}
          </Button>
        </OptionWrapper>
      </div>
    </section>
  )
}
