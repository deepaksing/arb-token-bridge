import { useCallback, useState, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import axios from 'axios'
import { useSWRConfig, unstable_serialize, Middleware } from 'swr'

import { validateTokenList } from '../util'

interface TokenList {
  id: number
  originChainID: string
  url: string
  name: string
  isDefault: boolean
  logoURI: string
}
const lists: Record<string, TokenList> = {
  '1': {
    id: 1,
    originChainID: '42161',
    url: 'token-list-42161.json',
    name: 'Arbitrum Whitelist Era',
    isDefault: true,
    logoURI:
      'https://ipfs.io/ipfs/QmTvWJ4kmzq9koK74WJQ594ov8Es1HHurHZmMmhU8VY68y'
  },
  '2': {
    id: 2,
    originChainID: '42161',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_uniswap_labs_list.json',
    name: 'Arbed Uniswap List',
    isDefault: true,
    logoURI:
      'https://ipfs.io/ipfs/QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir'
  },
  '3': {
    id: 3,
    originChainID: '42161',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_gemini_token_list.json',
    name: 'Arbed Gemini List',
    isDefault: false,
    logoURI: 'https://gemini.com/static/images/loader.png'
  },
  '4': {
    id: 4,
    originChainID: '421611',
    url: 'token-list-421611.json',
    name: 'Rinkarby Tokens',
    isDefault: true,
    logoURI:
      'https://ipfs.io/ipfs/QmTvWJ4kmzq9koK74WJQ594ov8Es1HHurHZmMmhU8VY68y'
  },
  '5': {
    id: 5,
    originChainID: '42161',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_coinmarketcap.json',
    name: 'Arbed CMC List',
    isDefault: false,
    logoURI:
      'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx'
  },
  '6': {
    id: 6,
    originChainID: '42170',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/42170_arbed_uniswap_labs_default.json',
    name: 'Arbed Uniswap List',
    isDefault: true,
    logoURI:
      'https://ipfs.io/ipfs/QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir'
  },
  '7': {
    id: 7,
    originChainID: '42170',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/42170_arbed_gemini_token_list.json',
    name: 'Arbed Gemini List',
    isDefault: true,
    logoURI: 'https://gemini.com/static/images/loader.png'
  },
  '8': {
    id: 8,
    originChainID: '421613',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/421613_arbed_coinmarketcap.json',
    name: 'Arbed CMC List',
    isDefault: true,
    logoURI:
      'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx'
  }
}
const listIds = Object.keys(lists)

const fetchTokenList = async (tokenListURL: string) =>
  await axios.get(tokenListURL, {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })

const STORAGE_KEY = 'arbitrum:bridge:token-lists'
const sessionStorageMiddleware: Middleware = useSWRNext => {
  return (key, fetcher, config) => {
    const extendedFetcher = async () => {
      const cache = sessionStorage.getItem(STORAGE_KEY)
      if (cache) {
        return JSON.parse(cache)
      }
      if (!fetcher) {
        return
      }
      const data = await fetcher(key)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return data
    }

    return useSWRNext(key, extendedFetcher, config)
  }
}

const useTokenLists = () => {
  const [activeTokenListIds, setActiveTokenListIds] = useState(new Set())
  const [tokens, setTokens] = useState(new Map())
  const { data: tokenLists } = useSWRImmutable(
    [listIds, 'useTokenLists'],
    async ids => {
      const requests = ids.map(id => {
        const tokenList = lists[id]
        return fetchTokenList(tokenList!.url)
      })

      const responses = await Promise.all(requests)
      const datas = responses
        .map(({ data }) => {
          // Validate data
          if (!validateTokenList(data)) {
            console.warn('Token List Invalid', data)
            return null
          }

          return data
        })
        .filter(Boolean)

      return datas
    },
    {
      use: [sessionStorageMiddleware]
    }
  )

  const addTokensFromList = useCallback(
    (listId: number) => {
      if (!tokenLists) {
        return
      }

      const list = tokenLists[listId]
      if (!list) {
        return
      }
      setActiveTokenListIds(new Set([...activeTokenListIds, listId]))

      list.tokens.reduce((acc, token) => {
        const address = token.address.toLowerCase()
        acc[token.address]

        return acc
      })
    },
    [activeTokenListIds, setActiveTokenListIds, tokenLists]
  )

  const removeTokensFromList = useCallback(
    (listId: number) => {
      const newListIds = new Set([...activeTokenListIds])
      newListIds.delete(listId)
      setActiveTokenListIds(newListIds)
    },
    [activeTokenListIds, setActiveTokenListIds]
  )

  return {
    tokenLists,
    addTokensFromList,
    removeTokensFromList
  }
}

export { useTokenLists }
