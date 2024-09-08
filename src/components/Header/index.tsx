/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import TempLogo from 'assets/images/templogo.png'
import { RiArrowRightUpLine } from 'react-icons/ri'
import { useActiveWeb3React } from 'hooks'
import { useAppState } from 'state/application/hooks'
import Menu from '../Menu'
import { LightCard } from '../Card'
import { CURRENCY } from 'assets/images'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import networks from 'networks.json'

const HeaderFrame = styled.header`
  width: 100vw;
  margin: 0.4rem auto;
  padding: 0.4rem 1.6rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
  `};
`

const NavlLinks = styled(Row)`
  width: auto;
  padding: 0.3rem;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 0;
    margin-left: 4%;
    margin-right: auto;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: fixed;
    margin-left: 0;
    bottom: 0;
    padding: 0.6rem;
    width: 100%;
    left: 0%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--color-background-elements);
  border-radius: 0.5rem;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  box-shadow: var(--box-shadow);
  pointer-events: auto;

  :focus {
    border: 1px solid blue;
  }
`

const HideSmall = styled.div`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const NetworkCard = styled(LightCard)`
  border-radius: 0.5rem;
  padding: 8px 12px;
  box-shadow: var(--box-shadow);
  word-break: keep-all;
  white-space: nowrap;
  display: flex;
  align-items: center;
  background-color: var(--color-background-elements);
  border: none;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
`

const Icon = styled.div`
  width: 4rem;
  transition: transform 0.2s ease;
  :hover {
    transform: scale(1.1);
  }
`

const LogoImage = styled.img`
  width: 100%;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: var(--color-notice);
  width: fit-content;
  padding: 0.3rem 0.6rem;
  font-weight: 500;
  transition: 0.12s;

  &:not(:last-child) {
    margin-right: 0.16rem;
  }

  &:hover,
  &.${activeClassName} {
    color: ${({ theme }) => theme.text1};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 10rem;
    width: 100%;
    margin: .1rem;
    padding: 0.4rem 6%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${({ theme }) => theme.bg3};
    font-size: 1.1em;
  `};
`

const StyledExternalLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  font-size: 0.9rem;
  width: fit-content;
  padding: 0.3rem 0.5rem;
  font-weight: 500;
  color: var(--color-notice);
  transition: 0.12s;
  word-break: keep-all;
  white-space: nowrap;

  &:not(:last-child) {
    margin-right: 0.16rem;
  }

  &:hover,
  &.${activeClassName} {
    color: ${({ theme }) => theme.text1};
  }

  .name {
    margin-right: 0.1rem;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 10rem;
    width: 100%;
    margin: .1rem;
    padding: 0.4rem 6%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${({ theme }) => theme.bg3};
    font-size: 1.1em;
  `};
`

const StyledNetworkImg = styled.img`
  max-width: 1.2rem;
  margin-right: 0.3rem;
`

const NetworkInfo = (chainId?: number) => {
  if (!chainId) return null
  // @ts-ignore
  const networkConfig = networks[chainId]
  // @ts-ignore
  const networkImage = CURRENCY[chainId]

  return (
    networkConfig?.name && (
      <NetworkCard title={`${networkImage.name} network`}>
        {!!networkImage && <StyledNetworkImg src={networkImage} alt="network logo" />}
        {networkConfig.name}
      </NetworkCard>
    )
  )
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const { logo: logoUrl, navigationLinks } = useAppState()

  return (
    <HeaderFrame>
      <HeaderRow>
        <Title href=".">
          <Icon>
            <LogoImage src={logoUrl || TempLogo} alt="logo" />
          </Icon>
        </Title>
        <NavlLinks>
          <StyledNavLink id="header-swap-nav-link" to={'/swap'}>
            {t('swap')}
          </StyledNavLink>
          <StyledNavLink
            id="header-pool-nav-link"
            to="/pool"
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/create') ||
              pathname.startsWith('/find')
            }
          >
            {t('pool')}
          </StyledNavLink>

          {Boolean(navigationLinks.length) &&
            navigationLinks.map((item: { source: string; name: string }, index) => (
              <StyledExternalLink href={item.source} key={index} target="_blank">
                <span className="name">{item.name}</span> <RiArrowRightUpLine />
              </StyledExternalLink>
            ))}
        </NavlLinks>
      </HeaderRow>

      <HeaderControls>
        <HeaderElement>
          <HideSmall>{NetworkInfo(chainId)}</HideSmall>
          <AccountElement active={!!account}>
            <Web3Status />
          </AccountElement>
        </HeaderElement>

        <HeaderElementWrap>
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}
