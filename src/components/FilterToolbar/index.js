import { useSearchParams } from 'react-router-dom'
import { Select } from '../Select'
import { useMemo, useState } from 'react'

import './styles.scss'

export function FilterToolbar ({ systemItems, onFilteredItems, onSelectedValues, children }) {
  // Query params
  const [searchParams, setSearchParams] = useSearchParams()

  // State
  const [selectedSystems, setSelectedSystems] = useState(searchParams.get('systems')?.split(',') || [])

  /*
    Memos
  */
  useMemo(() => {
    if (!systemItems) return []
    let filtered = systemItems
    // Update the query params
    const queryParams = {}

    // Filter on systems
    if (selectedSystems.length > 0) {
      filtered = filtered.filter((i) => selectedSystems.includes(i))
      queryParams.systems = selectedSystems.join(',')
    }

    if (onFilteredItems && typeof onFilteredItems === 'function') onFilteredItems(filtered)
    setSearchParams(queryParams)

    return filtered
    // eslint-disable-next-line
  }, [systemItems, selectedSystems])

  /*
    Event handlers
  */
  const handleSelectedSystems = values => {
    setSelectedSystems(values)
    if (onSelectedValues && typeof onSelectedValues === 'function') onSelectedValues(values)
  }

  return (
    <div className='systemfilter-toolbar'>
      <Select
        items={systemItems}
        selected={selectedSystems}
        placeholder='System'
        multiple
        hidePlaceholder
        hideDetails
        onSelectedValues={(e) => handleSelectedSystems(e)}
      />
      {children}
    </div>
  )
}
