import { relativeDateFormat } from '@vtfk/utilities'
import { Button, Dialog, DialogBody, DialogTitle, Heading3, IconButton, Table, TextField } from '@vtfk/components'
import { toast } from 'react-toastify'
import React, { useRef, useState } from 'react'
import { isEqual } from 'lodash'
import { words as capitalizeWords } from 'capitalize'

import ConfirmationDialog from '../../components/ConfirmationDialog'

import { useKeysAPI } from '../../hooks/useKeysAPI'

import './styles.scss'

export function APIKeys () {
  const { itemsOptions, keys, loading, newKeysItem, removeKeysItem, setItemsOptions, updateKeysItem, updating } = useKeysAPI()
  const [confirmationItem, setConfirmationItem] = useState(null)
  const [openNewKeyDialog, setOpenNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState(null)

  const keyRef = useRef(null)

  const headers = [
    {
      label: 'Name',
      value: 'name',
      onClick: () => handleSortClick(['name'])
    },
    {
      label: 'Created',
      itemTooltip: 'createdTimestamp',
      itemRender: (value, item, header, index) => <div>{relativeDateFormat({ toDate: new Date(item.createdTimestamp), locale: 'no' })}</div>,
      onClick: () => handleSortClick(['createdTimestamp'])
    },
    {
      label: 'Modified',
      itemTooltip: 'modifiedTimestamp',
      itemRender: (value, item, header, index) => <div>{relativeDateFormat({ toDate: new Date(item.modifiedTimestamp), locale: 'no' })}</div>,
      onClick: () => handleSortClick(['modifiedTimestamp'])
    },
    {
      label: 'Hash',
      itemRender: (value, item, header, index) => <span>{`${item.hash.substring(0, 5)}*****`}</span>
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
    const { _id, name } = keys[confirmationItem.index]
    try {
      if (confirmationItem.action === 'delete') {
        await removeKeysItem(_id)
      } else if (['enable', 'disable'].includes(confirmationItem.action)) {
        await updateKeysItem(_id, { enabled: confirmationItem.action === 'enable', name })
      }
      console.log(`Successfully ${confirmationItem.action}d key`, _id)
      toast.success(`Successfully ${confirmationItem.action}d key '${name}'`)
    } catch (error) {
      const failed = error.response?.data?.message || error.message || error
      console.log(`Failed to ${confirmationItem.action} key:`, error)
      toast.error(<>{`Failed to ${confirmationItem.action} key '${name}':`}<br /><b>{failed}</b></>)
    }

    setConfirmationItem(null)
  }

  const handleNewKeyOkClick = async () => {
    try {
      const key = await newKeysItem(newKeyName)
      console.log(`Successfully added key '${newKeyName}'`)
      toast.success(`Successfully added key '${newKeyName}'`)
      setNewKey(key)
    } catch (error) {
      const failed = error.response?.data?.message || error.message || error
      console.log('Failed to add key:', error)
      toast.error(<>{`Failed to add key '${newKeyName}':`}<br /><b>{failed}</b></>)
    }

    setOpenNewKeyDialog(false)
    setNewKeyName('')
  }

  const copyKey = () => {
    navigator.clipboard.writeText(keyRef.current.value)
    setNewKey(null)
    toast.info('Copied key to clipboard')
  }

  return (
    <div className='apikeys-container'>
      <div className='apikeys'>
        <IconButton
          className='add-key-button'
          bordered
          icon='add'
          onClick={() => setOpenNewKeyDialog(true)}
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
            title={<span>{`${capitalizeWords(confirmationItem.action)} api key "${keys[confirmationItem.index]?.name}" ?`}</span>}
            okBtnText='Yes'
            cancelBtnText='No'
            okBtnDisabled={updating}
            onClickCancel={() => setConfirmationItem(null)}
            onClickOk={() => handleConfirmationOkClick()}
            onDismiss={() => setConfirmationItem(null)}
          />
      }

      {
        openNewKeyDialog &&
          <ConfirmationDialog
            open
            title='Create new api key'
            okBtnText='Create'
            cancelBtnText='Cancel'
            okBtnDisabled={updating}
            onClickCancel={() => setOpenNewKeyDialog(false)}
            onClickOk={() => handleNewKeyOkClick()}
            onDismiss={() => setOpenNewKeyDialog(false)}
          >
            <TextField
              placeholder='Key name'
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </ConfirmationDialog>
      }

      {
        newKey && newKey.key &&
          <Dialog
            isOpen
            onDismiss={() => setNewKey(null)}
          >
            <DialogTitle isShowCloseButton>
              <Heading3>{newKey.name}</Heading3>
            </DialogTitle>
            <DialogBody>
              <div className='new-key-title'>Copy your key and save it somewhere secure. You won't be able to see it again!</div>
              <TextField
                disabled
                hidePlaceholder
                value={newKey.key}
              />
              <input type='hidden' value={newKey.key} ref={keyRef} />
              <Button onClick={() => copyKey()} type='secondary'>
                Copy key
              </Button>
            </DialogBody>
          </Dialog>
      }
    </div>
  )
}
