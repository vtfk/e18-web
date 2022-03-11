import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

import { API } from '../../config'

export default function useQueue (defaultQueue = [], defaultType = '') {
  const [_queue, setQueue] = useState(defaultQueue)
  const [filter, setFilter] = useState(defaultType)

  const sortQueue = (a, b, property) => {
    let a1, a2, b1, b2
    if (typeof a[property] === 'object') {
      a1 = a[property].length
      a2 = a[property].length
      b1 = b[property].length
      b2 = b[property].length
    } else {
      a1 = a[property][0].toLowerCase()
      a2 = a[property][1].toLowerCase()
      b1 = b[property][0].toLowerCase()
      b2 = b[property][1].toLowerCase()
    }

    if (a1 < b1) return -1
    if (a1 > b1) return 1
    if (a1 === b1) {
      if (a2 < b2) return -1
      if (a2 > b2) return 1
    }
    return 0
  }

  useEffect(() => {
    const getQueue = async () => {
      try {
        const options = {
          headers: {
            'X-API-KEY': API.TOKEN
          }
        }
    
        const { data } = await axios.get(`${API.URL}/statistics?$top=1000000`, options)
        console.log(data.data.length)
        setQueue(data.data)
      } catch (error) {
        console.dir(error)
        setQueue([])
      }
    }

    getQueue()
  }, [])

  const queue = useMemo(() => {
    if (filter === '') return _queue.sort((a, b) => sortQueue(a, b, 'system'))

    const filtered = _queue.filter(item => item.status === filter)
    return filtered.sort((a, b) => sortQueue(a, b, 'system'))
  }, [filter, _queue])

  return {
    queue,
    setFilter
  }
}
