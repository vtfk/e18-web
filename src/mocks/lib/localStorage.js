const getUpdatedExpiration = (ttl) => {
  return Date.now() + (1000 * 60 * 60 * ttl)
}

export const localStorage = (key, ttl = 4) => {
  const getItems = () => {
    const val = window.localStorage.getItem(key)
    if (!val) return null

    const parsedVal = JSON.parse(val)
    if (parsedVal.expiration && parsedVal.expiration < Date.now()) {
      console.log('localStorage cache expired')
      window.localStorage.removeItem(key)
      return null
    }

    setItems(parsedVal.data)
    return parsedVal.data
  }
  const setItems = items => window.localStorage.setItem(key, JSON.stringify({ expiration: getUpdatedExpiration(ttl), data: items }))
  const getItem = id => getItems()?.find(item => item && item._id === id) || null
  const addItem = item => setItems([...(getItems() || []), item])
  const removeItem = id => setItems((getItems() || []).filter(item => item && item._id !== id))
  const updateItem = item => setItems([...(getItems() || []).filter(rep => rep._id !== item._id), item])

  return { getItem, getItems, addItem, removeItem, updateItem, setItems }
}
