import { relativeDateFormat } from '@vtfk/utilities'
import { IconButton, Table } from '@vtfk/components'
import React, { useState } from 'react'
import { isEqual } from 'lodash'

import ConfirmationDialog from '../../components/ConfirmationDialog'

import { useKeysAPI } from '../../hooks/useKeysAPI'

import './styles.scss'

export function APIKeys () {
  const { itemsOptions, keys, loading, removeKeysItem, setItemsOptions, updating } = useKeysAPI()
  const [itemIndex, setItemIndex] = useState(-1)

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
              icon='close'
              onClick={() => setItemIndex(index)}
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

  const handleConfirmationOkClick = async id => {
    try {
      await removeKeysItem(id)
      console.log('Successfully removed key', id)
      setItemIndex(-1)
    } catch (error) {
      const removeFailed = error.response?.data?.message || error.message || error
      console.log('Failed to remove key:', removeFailed)
      // TODO: Add toast for error message
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
        itemIndex > -1 &&
          <ConfirmationDialog
            open
            title={<span>{`Delete api key ${keys[itemIndex].name} ?`}</span>}
            okBtnText='Yes'
            cancelBtnText='No'
            okBtnDisabled={updating}
            onClickCancel={() => setItemIndex(-1)}
            onClickOk={() => handleConfirmationOkClick(keys[itemIndex]._id)}
            onDismiss={() => setItemIndex(-1)}
            height='30%'
            width='30%'
          />
      }
    </div>
  )
}
