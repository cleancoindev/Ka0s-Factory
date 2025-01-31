import React, { useState } from 'react'
import { Token, Currency } from 'sdk'
import styled from 'styled-components'
import { TYPE, CloseIcon } from 'theme'
import Card from 'components/Card'
import { useTranslation } from 'react-i18next'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { ArrowLeft, AlertTriangle } from 'react-feather'
import { transparentize } from 'polished'
import useTheme from 'hooks/useTheme'
import { ButtonPrimary } from 'components/Button'
import { SectionBreak } from 'components/swap/styleds'
import { useAddUserToken } from 'state/user/hooks'
import { getExplorerLink } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { ExternalLink } from '../../theme/components'
import { useCombinedInactiveList } from 'state/lists/hooks'
import ListLogo from 'components/ListLogo'
import { PaddedColumn, Checkbox } from './styleds'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`

const WarningWrapper = styled(Card)<{ highWarning: boolean }>`
  background-color: ${({ theme, highWarning }) =>
    highWarning ? transparentize(0.8, theme.red1) : transparentize(0.8, theme.yellow3)};
  width: fit-content;
`

const AddressText = styled(TYPE.blue)`
  font-size: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`

interface ImportProps {
  tokens: Token[]
  onBack?: VoidFunction
  onDismiss?: VoidFunction
  handleCurrencySelect?: (currency: Currency) => void
}

export function ImportToken({ tokens, onBack, onDismiss, handleCurrencySelect }: ImportProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  const { chainId = 0 } = useActiveWeb3React()

  const [confirmed, setConfirmed] = useState(false)

  const addToken = useAddUserToken()

  // use for showing import source on inactive tokens
  const inactiveTokenList = useCombinedInactiveList(chainId)

  // higher warning severity if either is not on a list
  const fromLists =
    (chainId && inactiveTokenList?.[chainId]?.[tokens[0]?.address]?.list) ||
    (chainId && inactiveTokenList?.[chainId]?.[tokens[1]?.address]?.list)

  return (
    <Wrapper>
      <PaddedColumn gap="14px" style={{ width: '100%', flex: '1 1' }}>
        <RowBetween>
          {onBack ? <ArrowLeft style={{ cursor: 'pointer' }} onClick={onBack} /> : <div></div>}
          <TYPE.mediumHeader>
            {t('import')} {tokens.length > 1 ? 'Tokens' : 'Token'}
          </TYPE.mediumHeader>
          {onDismiss ? <CloseIcon onClick={onDismiss} /> : <div></div>}
        </RowBetween>
      </PaddedColumn>
      <SectionBreak />
      <PaddedColumn gap="md">
        {tokens.map((token) => {
          const list = chainId ? inactiveTokenList?.[chainId]?.[token.address]?.list : undefined

          return (
            <Card backgroundColor={theme.bg2} key={'import' + token.address} className=".token-warning-container">
              <AutoColumn gap="10px">
                <AutoRow align="center">
                  <CurrencyLogo currency={token} size={'24px'} />
                  <TYPE.body ml="8px" mr="8px" fontWeight={500}>
                    {token.symbol}
                  </TYPE.body>
                  <TYPE.darkGray fontWeight={300}>{token.name}</TYPE.darkGray>
                </AutoRow>
                {chainId && (
                  <ExternalLink href={getExplorerLink(chainId, token.address, 'address')}>
                    <AddressText>{token.address}</AddressText>
                  </ExternalLink>
                )}
                {list !== undefined ? (
                  <RowFixed>
                    {list.logoURI && <ListLogo logoURI={list.logoURI} size="12px" />}
                    <TYPE.small ml="6px" color={theme.text3}>
                      {list.name}
                    </TYPE.small>
                  </RowFixed>
                ) : (
                  <WarningWrapper borderRadius="4px" padding="4px" highWarning={true}>
                    <RowFixed>
                      <AlertTriangle stroke={theme.red1} size="10px" />
                      <TYPE.body color={theme.red1} ml="4px" fontSize="10px" fontWeight={500}>
                        {t('unkownSource')}
                      </TYPE.body>
                    </RowFixed>
                  </WarningWrapper>
                )}
              </AutoColumn>
            </Card>
          )
        })}

        <Card
          style={{ backgroundColor: fromLists ? transparentize(0.8, theme.yellow3) : transparentize(0.8, theme.red1) }}
        >
          <AutoColumn justify="center" style={{ textAlign: 'center', gap: '16px', marginBottom: '12px' }}>
            <AlertTriangle stroke={fromLists ? theme.yellow3 : theme.red1} size={32} />
            <TYPE.body fontWeight={600} fontSize={20} color={fromLists ? theme.yellow3 : theme.red1}>
              {t('tradeAtYourOwnRisk')}
            </TYPE.body>
          </AutoColumn>

          <AutoColumn style={{ textAlign: 'center', gap: '16px', marginBottom: '12px' }}>
            <TYPE.body fontWeight={400} color={fromLists ? theme.yellow3 : theme.red1}>
              {t('fakeTokenCreationWarning')}.
            </TYPE.body>
            <TYPE.body fontWeight={600} color={fromLists ? theme.yellow3 : theme.red1}>
              {t('fakeTokenPurchaseWarning')}.
            </TYPE.body>
          </AutoColumn>
          <AutoRow justify="center" style={{ cursor: 'pointer' }} onClick={() => setConfirmed(!confirmed)}>
            <Checkbox
              id="understand-checkbox"
              name="confirmed"
              type="checkbox"
              checked={confirmed}
              onChange={() => setConfirmed(!confirmed)}
            />
            <TYPE.body ml="10px" fontSize="16px" color={fromLists ? theme.yellow3 : theme.red1} fontWeight={500}>
              {t('iUnderstand')}
            </TYPE.body>
          </AutoRow>
        </Card>
        <ButtonPrimary
          disabled={!confirmed}
          altDisabledStyle={true}
          borderRadius="20px"
          padding="10px 1rem"
          onClick={() => {
            tokens.map((token) => addToken(token))
            handleCurrencySelect && handleCurrencySelect(tokens[0])
          }}
          id="import-current-token"
        >
          {t('import')}
        </ButtonPrimary>
      </PaddedColumn>
    </Wrapper>
  )
}
