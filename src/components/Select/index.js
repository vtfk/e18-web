import { Checkbox, Icon } from '@vtfk/components'
import { nanoid } from 'nanoid'
import { useEffect, useMemo, useState } from 'react'

import './styles.scss'

function isArray (item) {
  if (!item && !Array.isArray(item)) return false
  return true
}

export function Select ({ id, items, selected, placeholder, hint, open, multiple, showClear = true, disabled, required, noDataText, noDataElement, alwaysPlaceholder, hidePlaceholder, hideDetails, style, containerStyle, onChange, onSelectedValues, onSelectedItems, onClickOutside, onClose }) {
  /*
    State
  */
  const [_id, setId] = useState(id || `${nanoid()}`)
  const [selectedValues, setSelectedValues] = useState(isArray(selected) ? selected : [])
  const [isOpen, setIsOpen] = useState(open || false)

  /*
    Effects
  */
  useEffect(() => {
    // Update items if applicable
    if (id !== undefined) setId(id)
    if (selected !== undefined) {
      if (!Array.isArray(selected)) setSelectedValues([selected])
      else setSelectedValues(selected)
    }
    if (open !== undefined) setIsOpen(open)

    function handleKeyDown (e) {
      if (e?.key === 'Escape') handleClose()
    }

    function handleMouseUp (e) {
      if (!e) return
      const path = e.path || (e.composedPath && e.composedPath())
      const clickedInside = path.map((i) => i.id).includes(`select-dropdown-${_id}`)

      if (!clickedInside) {
        if (onClickOutside && typeof onClickOutside === 'function') onClickOutside(e)
        handleClose()
      }
    }

    // Setup & Cleanup event handlers
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  // eslint-disable-next-line
  }, [id, _id, items, selected, open])

  /*
    Event handlers
  */
  function handleClose () {
    setIsOpen(false)
    if (onClose && typeof onClose === 'function') onClose()
  }

  function handleSelectedItem (value, close = true) {
    if (value === undefined || value === null) return

    // Handle a bit differently if the mode is multiple or not
    if (!multiple) {
      setSelectedValues([value])
      if (onChange && typeof onChange === 'function') onChange(value)
      if (onSelectedValues && typeof onSelectedValues === 'function') onSelectedValues(value)
      if (onSelectedItems && typeof onSelectedItems === 'function') onSelectedItems(getSelectedItems([value])[0])
    } else {
      let newValues = []
      if (!selectedValues.includes(value)) newValues = [...selectedValues, value]
      else { newValues = selectedValues.filter((i) => i !== value) }

      setSelectedValues(newValues)
      if (onChange && typeof onChange === 'function') onChange(newValues)
      if (onSelectedValues && typeof onSelectedValues === 'function') onSelectedValues(newValues)
      if (onSelectedItems && typeof onSelectedItems === 'function') onSelectedItems(getSelectedItems(newValues))
    }

    // Handle closing the dropdown
    if (close) handleClose()
  }

  function clearItems () {
    const newValues = multiple ? [] : undefined

    setSelectedValues([])
    if (onChange && typeof onChange === 'function') onChange(newValues)
    if (onSelectedValues && typeof onSelectedValues === 'function') onSelectedValues(newValues)
    if (onSelectedItems && typeof onSelectedItems === 'function') onSelectedItems(newValues)
  }

  /*
    Memos
  */
  const hasSelectedValues = useMemo(() => Array.isArray(selectedValues) && selectedValues.length > 0, [selectedValues])

  const selectClasses = useMemo(() => {
    let classes = 'vtfk-select'
    if (selectedValues && selectedValues.length > 0) classes += ' has-selected'
    if (disabled) classes += ' disabled'
    classes += ' rounded'

    return classes
  }, [disabled, selectedValues])

  /*
    Functions
  */
  function getSelectedItems (values) {
    if (!items || !Array.isArray(items) || !values || !Array.isArray(values)) return []

    return items.filter((i) => values.includes(i))
  }

  /*
    Render
  */
  return (
    <span id={`select-${_id}`} className={selectClasses} style={containerStyle}>
      {
        !hidePlaceholder &&
          <div className='input-placeholder'>
            {
            placeholder && (selectedValues.length !== 0 || alwaysPlaceholder) &&
              <label htmlFor={`select-${_id}`} required={required || false} title={placeholder}>{placeholder}</label>
          }

          </div>
      }
      <button
        id={`btn-${_id}`}
        className={`${required && !placeholder ? 'required' : ''} rounded`}
        style={style}
        disabled={disabled || false}
        required={required}
        aria-expanded={open}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='vtfk-select-content'>
          {
            !hasSelectedValues
              ? <span className='placeholder'>{placeholder || 'Gjør ett valg'}</span>
              : getSelectedItems(selectedValues).join(', ')
          }
        </div>
        <div className='vtfk-select-button-group'>
          {showClear && <Icon name='close' size='auto' onClick={(e) => { clearItems(); e.preventDefault(); e.stopPropagation() }} alt='clear select' disabled={disabled || false} />}
          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size='auto' alt='open/close select' disabled={disabled || false} />
        </div>
        {
        isOpen &&
          <div id={`select-dropdown-${_id}`} className='vtfk-select-dropdown'>
            {
            (!items || items.length === 0) &&
              <div className='no-data'>{noDataElement || noDataText || 'Ingen valg tilgjengelig'}</div>
          }
            {
            isArray(items) && items.length > 0 &&
              <>
                {
                items.map(item => {
                  return (
                    <div className='item' key={`${item}}`} onClick={() => handleSelectedItem(item)}>
                      {multiple &&
                        <Checkbox
                          checked={hasSelectedValues && selectedValues.includes(item)}
                          onClick={(e) => { e.stopPropagation() }}
                          onChange={() => { handleSelectedItem(item, false) }}
                          style={{ marginRight: '0' }}
                        />}
                      <span>{item}</span>
                    </div>
                  )
                })
              }
              </>
          }
          </div>
      }
      </button>
      {
        !hideDetails &&
          <div className='input-details'>
            {
            hint &&
              <span>
                {hint}
              </span>
          }
          </div>
      }
    </span>
  )
}
