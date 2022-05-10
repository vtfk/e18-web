import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { orderBy } from 'lodash'

import { API } from '../../config'

export default function useAPI (defaultDatabase, defaultQueue = [], defaultItemsOptions = {}, top = 1000000) {
  const [_queue, setQueue] = useState(defaultQueue)
  const [itemsOptions, setItemsOptions] = useState(defaultItemsOptions)
  const [database] = useState(defaultDatabase === 'queue' ? 'jobs' : defaultDatabase === 'statistics' ? 'statistics' : '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getQueue = async () => {
      if (!database) {
        console.log('Database not set yet')
        return
      }

      setLoading(true)
      try {
        const options = {
          headers: {
            'X-API-KEY': API.TOKEN
          }
        }
    
        const url = `${API.URL}/${database}?$top=${top}`
        console.log('Querying', url)
        const { data } = await axios.get(url, options)
        setQueue(data.data)
        console.log('Query finished', data.data.length)
      } catch (error) {
        console.dir(error)
        setQueue([])
      }
      setLoading(false)
    }

    getQueue()
  }, [database, top])

  const options = useMemo(() => {
    return {
      filter: [],
      orderBy: ['createdTimestamp'],
      order: 'desc',
      ...itemsOptions
    }
  }, [itemsOptions])

  const queue = useMemo(() => {
    if (options.filter.length === 0) return orderBy(_queue, options.orderBy, options.order)

    const filtered = _queue.filter(item => options.filter.includes(item.status))
    return orderBy(filtered, options.orderBy, options.order)
  }, [options, _queue])

  return {
    allQueue: _queue,
    itemsOptions: options,
    loading,
    queue,
    setItemsOptions
  }
}
