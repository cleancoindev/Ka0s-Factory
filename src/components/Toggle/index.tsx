import React from 'react'
import styled, { keyframes } from 'styled-components'

const turnOnToggle = keyframes`
  from {
    margin-left: 0em;
    margin-right: 2.2em;
  }
  to {
    margin-left: 2.2em;
    margin-right: 0em;
  }
`

const turnOffToggle = keyframes`
  from {
    margin-left: 2.2em;
    margin-right: 0em;
  }
  to {
    margin-left: 0em;
    margin-right: 2.2em;
  }
`

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>`
  animation: 0.12s ${({ isActive }) => (isActive ? turnOnToggle : turnOffToggle)} ease-in;
  background: ${({ theme, isActive }) => (isActive ? 'var(--color-brand)' : theme.bg3)};
  border-radius: 50%;
  height: 24px;
  width: 24px;
  margin-left: ${({ isActive }) => isActive && '2.2em'};
  margin-right: ${({ isActive }) => !isActive && '2.2em'};
`

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  align-items: center;
  background: ${({ isActive }) => (isActive ? 'var(--color-brand-background)' : 'transparent')};
  border: 1px solid ${({ isActive }) => (isActive ? 'transparent' : `var(--color-border)`)};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  outline: none;
  padding: 4px;
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: VoidFunction
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  return (
    <StyledToggle id={id} isActive={isActive} onClick={toggle}>
      <ToggleElement isActive={isActive} />
    </StyledToggle>
  )
}
