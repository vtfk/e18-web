import { relativeDateFormat } from '@vtfk/utilities'
import { IconButton, Table } from '@vtfk/components'
import React, { useState } from 'react'
import { isEqual } from 'lodash'
import { words as capitalizeWords } from 'capitalize'

import ConfirmationDialog from '../../components/ConfirmationDialog'

import { useKeysAPI } from '../../hooks/useKeysAPI'

import './styles.scss'

export function APIKeys () {
  const { itemsOptions, keys, loading, removeKeysItem, setItemsOptions, updateKeysItem, updating } = useKeysAPI()
  const [confirmationItem, setConfirmationItem] = useState(null)

  const headers = [
    {
      label: 'Name',
      value: 'name',
      onClick: () => handleSortClick(['name'])
    },
    {
      label: 'Created',
      value: 'createdTimeStamp',
      itemTooltip: (value, item, header, index) => <div>{relativeDateFormat({ toDate: new Date(item.createdTimestamp), locale: 'no' })}</div>,
      onClick: () => handleSortClick(['createdTimeStamp'])
    },
    {
      label: 'Modified',
      value: 'modifiedTimeStamp',
      itemTooltip: (value, item, header, index) => <div>{relativeDateFormat({ toDate: new Date(item.modifiedTimestamp), locale: 'no' })}</div>,
      onClick: () => handleSortClick(['modifiedTimeStamp'])
    },
    {
      label: 'Actions',
      itemRender: (value, item, header, index) => {
        return (
          <div className='item-actions'>
            <IconButton
              icon={item.enabled ? 'pause' : 'play'}
              onClick={() => setConfirmationItem({ action: item.enabled ? 'disable' : 'enable', index })}
              title={item.enabled ? 'Disable' : 'Enable'}
            />
            <IconButton
              icon='close'
              onClick={() => setConfirmationItem({ action: 'delete', index })}
              title='Delete'
            />
          </div>
        )
      }
    }
  ]

  function handleSortClick (properties) {
    setItemsOptions({
      ...itemsOptions,
      orderBy: properties,
      order: isEqual(itemsOptions.orderBy, properties) ? (itemsOptions.order === 'asc' ? 'desc' : 'asc') : 'desc'
    })
  }

  const handleConfirmationOkClick = async () => {
    try {
      const { _id, name } = keys[confirmationItem.index]
      if (confirmationItem.action === 'delete') {
        await removeKeysItem(_id)
      } else if (['enable', 'disable'].includes(confirmationItem.action)) {
        await updateKeysItem(_id, { enabled: confirmationItem.action === 'enable', name })
      }
      console.log(`Successfully ${confirmationItem.action}d key`, _id) // TODO: Add toast for success
      setConfirmationItem(null)
    } catch (error) {
      const failed = error.response?.data?.message || error.message || error
      console.log(`Failed to ${confirmationItem.action} key:`, failed) // TODO: Add toast for error message
    }
  }

  return (
    <div className='apikeys-container'>
      <div className='apikeys'>
        <IconButton
          className='add-key-button'
          bordered
          icon='add'
          onClick={() => console.log('Add new key')}
          title='Add key'

        />
        <Table
          headers={headers}
          items={keys}
          isLoading={loading}
        />
      </div>

      {
        confirmationItem && confirmationItem.index > -1 &&
          <ConfirmationDialog
            open
            title={<span>{`${capitalizeWords(confirmationItem.action)} api key "${keys[confirmationItem.index].name}" ?`}</span>}
            okBtnText='Yes'
            cancelBtnText='No'
            okBtnDisabled={updating}
            onClickCancel={() => setConfirmationItem(null)}
            onClickOk={() => handleConfirmationOkClick()}
            onDismiss={() => setConfirmationItem(null)}
          />
      }
    </div>
  )
}
