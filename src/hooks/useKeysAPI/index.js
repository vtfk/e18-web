import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { orderBy } from 'lodash'

import { API } from '../../config'

export function useKeysAPI (defaultItemsOptions = {}, top = 1000000) {
  const [_keys, setKeys] = useState([])
  const [itemsOptions, setItemsOptions] = useState(defaultItemsOptions)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const getApiKeys = async () => {
      setLoading(true)
      try {
        const options = {
          headers: {
            'X-API-KEY': API.TOKEN
          }
        }

        const url = `${API.URL}/apikeys?$top=${top}`
        const { data } = await axios.get(url, options)
        setKeys(data.data)
      } catch (error) {
        console.log('Failed to get api keys')
        console.dir(error)
        setKeys([])
      }
      setLoading(false)
    }

    getApiKeys()
  }, [top])

  const options = useMemo(() => {
    return {
      filter: [],
      orderBy: ['name'],
      order: 'asc',
      ...itemsOptions
    }
  }, [itemsOptions])

  const keys = useMemo(() => {
    if (options.filter.length === 0) return orderBy(_keys, options.orderBy, options.order)

    const filtered = _keys.filter(item => options.filter.includes(item.status)) // TODO: Needs rework as status doesn't exist in keys
    return orderBy(filtered, options.orderBy, options.order)
  }, [options, _keys])

  // new keys item
  const newKeysItem = async name => {
    const options = {
      headers: {
        'X-API-KEY': API.TOKEN
      }
    }

    try {
      setUpdating(true)
      const { data } = await axios.post(`${API.URL}/apikeys?fullitem=true`, { name }, options)
      const newKey = JSON.parse(JSON.stringify(data))
      delete newKey.key
      setKeys([..._keys, newKey])
      setUpdating(false)
      return data
    } catch (error) {
      setUpdating(false)
      throw error
    }
  }

  const updateKeysItem = async (id, updateObject) => {
    const options = {
      headers: {
        'X-API-KEY': API.TOKEN
      }
    }

    try {
      setUpdating(true)
      const { data } = await axios.put(`${API.URL}/apikeys/${id}`, updateObject, options)
      const tempKeys = _keys.map(q => {
        if (q._id === data._id) {
          q = data
        }
        return q
      })
      setKeys(tempKeys)
      setUpdating(false)
      return data
    } catch (error) {
      setUpdating(false)
      throw error
    }
  }

  // remove keys item
  const removeKeysItem = async (id) => {
    const options = {
      headers: {
        'X-API-KEY': API.TOKEN
      }
    }

    try {
      setUpdating(true)
      await axios.delete(`${API.URL}/apikeys/${id}`, options)
      const tempKeys = _keys.filter(q => q._id !== id)
      setKeys(tempKeys)
      setUpdating(false)
      return true
    } catch (error) {
      setUpdating(false)
      throw error
    }
  }

  return {
    allKeys: _keys,
    itemsOptions: options,
    loading,
    keys,
    newKeysItem,
    removeKeysItem,
    setItemsOptions,
    updateKeysItem,
    updating
  }
}
