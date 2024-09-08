import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 28rem;
  width: 100%;
  border-radius: var(--main-component-border-radius);
  box-shadow: var(--box-shadow);
  background-color: var(--color-background-elements);

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 90%;
  `}
`

export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
