import React, { Suspense, useEffect, useState } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Route, Switch } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { AppState } from 'state'
import { ZERO_ADDRESS } from 'sdk'
import './index.css'

import useWordpressInfo from 'hooks/useWordpressInfo'
import { useAppState } from 'state/application/hooks'
import { useDarkModeManager } from 'state/user/hooks'
import { retrieveDomainData } from 'state/application/actions'
import { fetchDomainData } from 'utils/app'
import { useStorageContract } from 'hooks/useContract'
import { SUPPORTED_CHAIN_IDS } from '../connectors'
import { STORAGE_NETWORK_ID } from '../constants'
import Loader from 'components/Loader'
import Panel from '../pages/Panel'
import Connection from '../pages/Connection'
import Header from 'components/Header'
import Popups from 'components/Popups'
import GreetingScreen from 'components/GreetingScreen'
import Web3ReactManager from 'components/Web3ReactManager'
import DarkModeQueryParamReader from 'theme/DarkModeQueryParamReader'
import AddLiquidity from '../pages/AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from '../pages/AddLiquidity/redirects'
import Pool from '../pages/Pool'
import Pools from '../pages/Pools'
import PoolFinder from '../pages/PoolFinder'
import RemoveLiquidity from '../pages/RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from '../pages/RemoveLiquidity/redirects'
import Swap from '../pages/Swap'
import Footer from 'components/Footer'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly } from '../pages/Swap/redirects'

const LoaderWrapper = styled.div`
  position: absolute;
  z-index: 4;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg1};
`

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-between;
  overflow-x: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  width: 100%;
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
`

const FooterWrapper = styled.footer`
  width: 100%;
  padding: 1rem 5%;
`

export default function App() {
  const dispatch = useDispatch()
  const { active, chainId, library, account } = useWeb3React()
  const wordpressData = useWordpressInfo()
  const storage = useStorageContract()
  const [domainData, setDomainData] = useState<any>(null)
  const { admin, factory, router, projectName, pairHash } = useAppState()
  const [domainDataTrigger, setDomainDataTrigger] = useState<boolean>(false)
  const [darkMode] = useDarkModeManager()

  useEffect(() => {
    const dataset = document.body.dataset

    if (darkMode) {
      dataset.scheme = 'dark'
    } else {
      dataset.scheme = 'default'
    }
  }, [darkMode])

  useEffect(() => {
    setDomainDataTrigger((state) => !state)
  }, [chainId])

  const [isAvailableNetwork, setIsAvailableNetwork] = useState(true)
  const [greetingScreenIsActive, setGreetingScreenIsActive] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setGreetingScreenIsActive(!domainData || !domainData?.admin)

    // Set favicon
    const faviconUrl = localStorage.getItem('faviconUrl')

    if (domainData?.favicon && domainData.favicon !== faviconUrl) {
      localStorage.setItem('faviconUrl', domainData.favicon)
      window.location.reload()
    } else if (!loading && !domainData?.favicon && faviconUrl) {
      localStorage.removeItem('faviconUrl')
      window.location.reload()
    }
  }, [domainData, loading])

  useEffect(() => {
    if (chainId) {
      const lowerAcc = account?.toLowerCase()
      const appAdmin = wordpressData?.wpAdmin
        ? wordpressData?.wpAdmin?.toLowerCase() === lowerAcc
        : admin && admin !== ZERO_ADDRESS
          ? admin.toLowerCase() === lowerAcc
          : true

      const accessToStorageNetwork = appAdmin && chainId === STORAGE_NETWORK_ID

      const networkIsFine =
        !wordpressData?.wpNetworkIds?.length || accessToStorageNetwork || wordpressData.wpNetworkIds.includes(chainId)

      setIsAvailableNetwork(Boolean(SUPPORTED_CHAIN_IDS.includes(Number(chainId)) && networkIsFine))
    }
  }, [chainId, domainDataTrigger, wordpressData, admin, account])

  useEffect(() => {
    if (!storage) return

    try {
      const start = async () => {
        const data = await fetchDomainData(chainId, library, storage)

        if (data) {
          dispatch(retrieveDomainData(data))
          setDomainData(data)
        }

        setLoading(false)
      }

      if (!pairHash) start()
    } catch (error) {
      console.error(error)
    }
  }, [chainId, library, storage, dispatch, pairHash])

  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    setAppIsReady(Boolean(active && admin && factory && router))
  }, [chainId, active, admin, factory, router])

  const appManagement = useSelector<AppState, AppState['application']['appManagement']>(
    (state) => state.application.appManagement
  )

  return (
    <Suspense fallback={null}>
      <HelmetProvider>
        <Helmet>
          <title>{projectName || document.title}</title>
        </Helmet>

        <Route component={DarkModeQueryParamReader} />
        <Web3ReactManager>
          <Popups />

          {loading ? (
            <LoaderWrapper>
              <Loader size="2.8rem" />
            </LoaderWrapper>
          ) : appIsReady && isAvailableNetwork ? (
            <>
              {appManagement ? (
                <BodyWrapper>
                  <Panel setDomainDataTrigger={setDomainDataTrigger} />
                </BodyWrapper>
              ) : (
                <AppWrapper>
                  {/* addition tag for the flex layout */}
                  <div>
                    <HeaderWrapper>
                      <Header />
                    </HeaderWrapper>

                    <BodyWrapper>
                      <Switch>
                        <Route exact strict path="/swap" component={Swap} />
                        <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
                        <Route exact strict path="/find" component={PoolFinder} />
                        <Route exact strict path="/pool" component={Pool} />
                        <Route exact strict path="/pools" component={Pools} />
                        <Route exact strict path="/create" component={RedirectToAddLiquidity} />
                        <Route exact path="/add" component={AddLiquidity} />
                        <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                        <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                        <Route exact path="/create" component={AddLiquidity} />
                        <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                        <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                        <Route
                          exact
                          strict
                          path="/remove/:tokens"
                          component={RedirectOldRemoveLiquidityPathStructure}
                        />
                        <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                        <Route component={RedirectPathToSwapOnly} />
                      </Switch>
                    </BodyWrapper>
                  </div>

                  <FooterWrapper>
                    <Footer />
                  </FooterWrapper>
                </AppWrapper>
              )}
            </>
          ) : (
            <>
              {greetingScreenIsActive ? (
                <GreetingScreen setGreetingScreenIsActive={setGreetingScreenIsActive} setDomainData={setDomainData} />
              ) : (
                <Connection
                  setDomainDataTrigger={setDomainDataTrigger}
                  domainData={domainData}
                  isAvailableNetwork={isAvailableNetwork}
                />
              )}
            </>
          )}
        </Web3ReactManager>
      </HelmetProvider>
    </Suspense>
  )
}
