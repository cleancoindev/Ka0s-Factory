import { useState, useLayoutEffect } from 'react'
import { shade } from 'polished'
import Vibrant from 'node-vibrant'
import { hex } from 'wcag-contrast'
import { Token } from 'sdk'
import uriToHttp from 'utils/uriToHttp'
import { useDarkModeManager } from '../state/user/hooks'

export function useThemeColors(): {
  bg1: string
  bg2: string
  bg3: string
  bg4: string
  bg5: string
  text1: string
  text2: string
  text3: string
  text4: string
  text5: string
  primary1: string
  primary2: string
  primary3: string
  primary4: string
  primary5: string
} {
  const [darkMode] = useDarkModeManager()

  let bg2 = darkMode ? '#222427' : '#f7f7f7'
  let bg1 = 'var(--color-background-elements)'
  let bg3 = darkMode ? '#3a3d47' : '#ededed'
  let bg4 = darkMode ? '#4c4f5c' : '#CED0D9'
  let bg5 = darkMode ? '#6C7284' : '#888D9B'

  let text1 = darkMode ? '#FFFFFF' : '#000000'

  let text2 = darkMode ? '#C3C5CB' : '#444854'
  let text3 = darkMode ? '#6C7284' : '#727782'
  let text4 = darkMode ? '#565A69' : '#95979e'
  let text5 = darkMode ? '#2C2F36' : '#ebebeb'

  let primary1 = darkMode ? '#999999' : '#262626'
  let primary2 = darkMode ? '#858585' : '#363636'
  let primary3 = darkMode ? '#737373' : '#474747'
  let primary4 = darkMode ? '#5c5c5c' : '#575757'
  let primary5 = darkMode ? '#474747' : '#6b6b6b'

  return {
    bg1,
    bg2,
    bg3,
    bg4,
    bg5,
    text1,
    text2,
    text3,
    text4,
    text5,
    primary1,
    primary2,
    primary3,
    primary4,
    primary5,
  }
}

async function getColorFromToken(token: Token): Promise<string | null> {
  const path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`

  return Vibrant.from(path)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        let detectedHex = palette.Vibrant.hex
        let AAscore = hex(detectedHex, '#FFF')
        while (AAscore < 3) {
          detectedHex = shade(0.005, detectedHex)
          AAscore = hex(detectedHex, '#FFF')
        }
        return detectedHex
      }
      return null
    })
    .catch(() => null)
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  const formattedPath = uriToHttp(uri)[0]

  return Vibrant.from(formattedPath)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        return palette.Vibrant.hex
      }
      return null
    })
    .catch(() => null)
}

export function useColor(token?: Token) {
  const [color, setColor] = useState('#2172E5')

  useLayoutEffect(() => {
    let stale = false

    if (token) {
      getColorFromToken(token).then((tokenColor) => {
        if (!stale && tokenColor !== null) {
          setColor(tokenColor)
        }
      })
    }

    return () => {
      stale = true
      setColor('#2172E5')
    }
  }, [token])

  return color
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#2172E5')

  useLayoutEffect(() => {
    let stale = false

    if (listImageUri) {
      getColorFromUriPath(listImageUri).then((color) => {
        if (!stale && color !== null) {
          setColor(color)
        }
      })
    }

    return () => {
      stale = true
      setColor('#2172E5')
    }
  }, [listImageUri])

  return color
}
