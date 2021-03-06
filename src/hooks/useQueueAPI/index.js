import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { orderBy } from 'lodash'

import { API } from '../../config'

export function useQueueAPI (defaultDatabase, defaultQueue = [], defaultItemsOptions = {}, top = 1000000) {
  const [_queue, setQueue] = useState(defaultQueue)
  const [itemsOptions, setItemsOptions] = useState(defaultItemsOptions)
  const [database] = useState(defaultDatabase === 'queue' ? 'jobs' : defaultDatabase === 'statistics' ? 'statistics' : '')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

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
        const { data } = await axios.get(url, options)
        setQueue(data.data)
      } catch (error) {
        console.log('Failed to get queue')
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
      orderBy: ['modifiedTimestamp'],
      order: 'desc',
      ...itemsOptions
    }
  }, [itemsOptions])

  const queue = useMemo(() => {
    if (options.filter.length === 0) return orderBy(_queue, options.orderBy, options.order)

    const filtered = _queue.filter(item => options.filter.includes(item.status))
    return orderBy(filtered, options.orderBy, options.order)
  }, [options, _queue])

  const updateQueueItemData = async data => {
    if (!Array.isArray(data)) {
      data = [data]
    }

    const tempQueue = _queue.map(q => {
      const dataItem = data.find(d => d._id === q._id)
      if (dataItem) {
        q = dataItem
      }
      return q
    })

    setQueue(tempQueue)
  }

  const updateQueueItem = async (id, updateObject, updateQueue = true) => {
    const options = {
      headers: {
        'X-API-KEY': API.TOKEN
      }
    }

    try {
      setUpdating(true)
      const { data } = await axios.put(`${API.URL}/jobs/${id}`, updateObject, options)
      if (updateQueue) updateQueueItemData(data)
      setUpdating(false)
      return data
    } catch (error) {
      setUpdating(false)
      throw error
    }
  }

  return {
    allQueue: _queue,
    itemsOptions: options,
    loading,
    queue,
    setItemsOptions,
    updateQueueItem,
    updateQueueItemData,
    updating
  }
}
