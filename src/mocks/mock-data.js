import _jobs from './data/jobs.json'
import _statistics from './data/statistics.json'
import _apikeys from './data/apikeys.json'
import _statuses from './data/statuses.json'
import _operationStatuses from './data/operationStatuses.json'

import { getDate, getRandomBoolean, getRandomNumber } from './lib/helpers'
import { localStorage } from './lib/localStorage'

const storageTtl = 4 // time to live in hours

const getStorageKey = type => {
  const storageKeys = [
    'e18-mock__jobs',
    'e18-mock__statistics',
    'e18-mock__apikeys'
  ]

  return storageKeys.find(key => key.includes(type))
}

const getRandomStatus = (type = 'item') => {
  const list = type === 'item' ? _statuses : _operationStatuses
  const num = getRandomNumber(0, list.length - 1)
  return list[num]
}

const getList = type => {
  if (type === 'jobs') return _jobs
  else if (type === 'statistics') return _statistics
  else if (type === 'apikeys') return _apikeys
}

const getListCount = type => {
  if (type === 'jobs') return _jobs.length
  else if (type === 'statistics') return _statistics.length
  else if (type === 'apikeys') return _apikeys.length
}

const generateItem = (index, type) => {
  const timestampDate = getDate(getRandomNumber(0, 10))
  const list = getList(type)
  const item = JSON.parse(JSON.stringify(list[index]))

  if (['jobs', 'statistics'].includes(type)) {
    item.status = getRandomStatus()
    item.e18 = getRandomBoolean()
    item.retries = getRandomNumber(0, 100) === 42 ? getRandomNumber(1, 3) : 0
    item.tasks = item.tasks.map(task => {
      task.status = getRandomStatus()
      task.retries = item.retries > 0 ? getRandomNumber(1, 3) : 0
      task.createdTimestamp = timestampDate
      task.operations = task.operations.map(operation => {
        operation.status = getRandomStatus('operation')
        operation.retries = task.retries > 0 ? getRandomNumber(1, 3) : 0
        operation.createdTimestamp = timestampDate
        return operation
      })
      return task
    })
    item.createdTimestamp = timestampDate
    if (item.modifiedTimestamp) {
      item.modifiedTimestamp = timestampDate
    }
  } else if (type === 'apikeys') {
    item.enabled = getRandomBoolean()
    item.createdTimestamp = timestampDate
    item.modifiedTimestamp = timestampDate
  }

  return item
}

const getMetadata = (top, totalItems, type, items) => {
  return {
    __metadata: {
      pagination: {
        $skip: 1,
        $top: top,
        items: top,
        totalItems,
        last_page: 1,
        next_page: 1,
        first_page_url: `https://test-e18-api.net/api/v1/${type}`,
        last_page_url: `https://test-e18-api.net/api/v1/${type}`,
        next_page_url: `https://test-e18-api.net/api/v1/${type}`
      },
      timestamp: getDate()
    },
    data: items || []
  }
}

export function get (options) {
  let { top } = options
  const { id, type } = options
  const storageKey = getStorageKey(type)
  const { getItem, getItems, setItems } = localStorage(storageKey, storageTtl)

  if (Number.isInteger(Number.parseInt(top, 10))) {
    // return from localStorage cache
    const items = getItems()
    if (Array.isArray(items)) return getMetadata(items.length, items.length, type, items)

    // generate items
    const maxListCount = getListCount(type)
    let listCount = top
    if (top > maxListCount) {
      top = maxListCount
      listCount = top
    }

    const _items = getMetadata(top, maxListCount, type)
    const usedNums = []

    for (let i = 0; i < listCount; i++) {
      let num = -1
      while (num === -1 || usedNums.includes(num)) {
        num = getRandomNumber(0, maxListCount - 1)
      }
      usedNums.push(num)

      // generate mock item data
      const item = generateItem(num, type)
      _items.data.push(item)
    }

    // save items to localStorage cache
    setItems(_items.data)
    return _items
  } else if (id) {
    // return from localStorage cache
    const item = getItem(id)
    if (item) {
      return item
    }

    // return from mock data
    const list = getList(type)
    const num = list.findIndex(item => item._id === id)
    if (num === -1) {
      return null
    }

    return generateItem(num, type)
  }
}

export function put (options) {
  const { data, type } = options
  const storageKey = getStorageKey(type)
  const { updateItem } = localStorage(storageKey, storageTtl)

  // update in localStorage cache
  updateItem(data)
}

export function add (options) {
  const { data, type } = options
  const storageKey = getStorageKey(type)
  const { addItem } = localStorage(storageKey, storageTtl)

  // add to localStorage cache
  addItem(data)
}

export function remove (options) {
  const { id, type } = options
  const storageKey = getStorageKey(type)
  const { removeItem } = localStorage(storageKey, storageTtl)

  // remove from localStorage cache
  removeItem(id)
}
