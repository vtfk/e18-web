import { relativeDateFormat } from '@vtfk/utilities'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Dialog, DialogActions, DialogBody, DialogTitle, ErrorMessage, Heading3, IconButton, StatisticsGroup, StatisticsCard, Table, TextField } from '@vtfk/components'
import { isEqual, uniqBy } from 'lodash'
import { toast } from 'react-toastify'
import SyntaxHighlighter from 'react-syntax-highlighter'

import ConfirmationDialog from '../../components/ConfirmationDialog'
import { FilterToolbar } from '../../components/FilterToolbar'
import { Select } from '../../components/Select'

import { useQueueAPI } from '../../hooks/useQueueAPI'

import './styles.scss'

const actions = [
  'complete',
  'retire',
  'retry',
  'suspend',
  'unsuspend'
]

const defaultConfirmationItem = {
  message: '',
  action: '',
  index: -1,
  item: {},
  updateFailed: false
}

export function Queue () {
  const [types, setTypes] = useState([])
  const [mulitpleTypes, setMulitpleTypes] = useState(false)
  const { allQueue, queue, itemsOptions, loading, setItemsOptions, updateQueueItem, updateQueueItemData, updating } = useQueueAPI('queue')
  const [queueFilter, setQueueFilter] = useState([])
  const [selectedValues, setSelectedValues] = useState([])
  const [selectedBulkAction, setSelectedBulkAction] = useState(undefined)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [completed, setCompleted] = useState(0)
  const [failed, setFailed] = useState(0)
  const [retired, setRetired] = useState(0)
  const [suspended, setSuspended] = useState(0)
  const [waiting, setWaiting] = useState(0)
  const [dialogItemIndex, setDialogItemIndex] = useState(-1)
  const [confirmationItem, setConfirmationItem] = useState(defaultConfirmationItem)

  const generateActionButtons = (item, index, view = true) => {
    const getTitle = type => {
      if (item.e18 === false && type !== 'retire') return `Can only ${type} a task handled by E18`
      if (type === 'retry') return item.status !== 'failed' ? `Can't retry a ${item.status} task` : 'Retry'
      if (type === 'suspend') return ['completed', 'retired'].includes(item.status) ? `Can't suspend a ${item.status} task` : item.status === 'suspended' ? 'Unsuspend' : 'Suspend'
      if (type === 'retire') return ['completed', 'retired'].includes(item.status) ? `Can't retire a ${item.status} task` : 'Retire'
      return `OI 😱 (${type})`
    }

    return (
      <div className='item-actions'>
        <IconButton
          icon='retry'
          disabled={['completed', 'waiting', 'suspended', 'retired', 'running'].includes(item.status) || item.e18 === false}
          onClick={() => setConfirmationItem({ action: 'retry', item, index, message: 'Status changed to retry' })}
          title={getTitle('retry')}
        />
        <IconButton
          icon={item.status === 'suspended' ? 'play' : 'pause'}
          disabled={['completed', 'retired'].includes(item.status) || item.e18 === false}
          onClick={() => setConfirmationItem({ action: item.status === 'suspended' ? 'unsuspended' : 'suspended', item, index, message: `Status changed to ${item.status === 'suspended' ? 'waiting' : 'suspended'}` })}
          title={getTitle('suspend')}
        />
        <IconButton
          icon='close'
          disabled={['completed', 'retired'].includes(item.status)}
          onClick={() => setConfirmationItem({ action: 'retire', item, index, message: 'Status changed to retire' })}
          title={getTitle('retire')}
        />
        {
          view &&
            <IconButton
              icon='activity'
              onClick={() => setDialogItemIndex(index)}
              title='View'
            />
        }
      </div>
    )
  }

  const headers = [
    {
      label: 'System',
      value: 'system',
      itemTooltip: 'type',
      onClick: () => handleSortClick(['system'])
    },
    {
      label: 'Tasks',
      itemTooltip: (value, item, header, index) => item.tasks.length > 0 ? item.tasks.map(task => `${task.system} -> ${task.method} (${task.status}) (${task.retries})`).join('\n') : undefined,
      itemRender: (value, item, header, index) => <div>{item.tasks.length > 0 ? item.tasks.map(task => task.system).join(', ') : '-'}</div>
    },
    {
      label: 'Status',
      value: 'status',
      onClick: () => handleSortClick(['status'])
    },
    {
      label: 'Task count',
      onClick: () => handleSortClick(['taskCount']),
      itemRender: (value, item, header, index) => <div>{item.tasks.length.toString()}</div>
    },
    {
      label: 'E18',
      onClick: () => handleSortClick(['e18']),
      itemRender: (value, item, header, index) => <div>{item.e18.toString()}</div>
    },
    {
      label: 'Created',
      onClick: () => handleSortClick(['createdTimestamp']),
      itemTooltip: 'createdTimestamp',
      itemRender: (value, item, header, index) => <div>{relativeDateFormat({ toDate: new Date(item.createdTimestamp), locale: 'no', options: { } })}</div>
    },
    {
      label: 'Modified',
      onClick: () => handleSortClick(['modifiedTimestamp']),
      itemTooltip: 'modifiedTimestamp',
      itemRender: (value, item, header, index) => <div>{relativeDateFormat({ toDate: new Date(item.modifiedTimestamp), locale: 'no' })}</div>
    },
    {
      label: 'Actions',
      itemRender: (value, item, header, index) => generateActionButtons(item, index)
    }
  ]

  useEffect(() => {
    const handleKeyUp = e => {
      if (e.key === 'Shift') {
        setMulitpleTypes(false)
      }
    }

    const handleKeyDown = e => {
      if (e.key === 'Shift') {
        setMulitpleTypes(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const queueItems = useMemo(() => {
    setCompleted(allQueue.filter(item => item.status === 'completed').length)
    setFailed(allQueue.filter(item => item.status === 'failed').length)
    setRetired(allQueue.filter(item => item.status === 'retired').length)
    setSuspended(allQueue.filter(item => item.status === 'suspended').length)
    setWaiting(allQueue.filter(item => item.status === 'waiting').length)

    return queue.filter(item => queueFilter.includes(item.system))
  }, [allQueue, queue, queueFilter])
  
  const queueItemsForBulkAction = useMemo(() => {
    return queueItems.filter(item => {
      if (selectedBulkAction === 'complete' && item.status !== 'completed') return true
      if (selectedBulkAction === 'retire' && !['completed', 'retired'].includes(item.status)) return true
      if (selectedBulkAction === 'retry' && !['completed', 'waiting', 'suspended', 'retired', 'running'].includes(item.status) && item.e18) return true
      if (selectedBulkAction === 'suspend' && !['completed', 'retired', 'suspended'].includes(item.status) && item.e18) return true
      if (selectedBulkAction === 'unsuspend' && item.status === 'suspended' && item.e18) return true

      return false
    })
  }, [selectedBulkAction, queueItems])

  const handleActionClick = async (action, item, message, updateQueue = true) => {
    const updatePayload = {
      comment: {
        message,
        user: 'noen.andre@vtfk.no' // TODO: Endres til pålogget bruker
      }
    }

    if (['retry', 'unsuspended', 'unsuspend'].includes(action)) {
      updatePayload.status = 'waiting'
    } else if (['suspended', 'suspend'].includes(action)) {
      updatePayload.status = 'suspended'
    } else if (action === 'retire') {
      updatePayload.status = 'retired'
    } else if (action === 'complete') {
      updatePayload.status = 'completed'
    } else {
      console.log('WHHAAATT? A new action? :O', action)
      return
    }

    try {
      const updatedData = await updateQueueItem(item._id, updatePayload, updateQueue)
      setConfirmationItem(defaultConfirmationItem)
      return { item: updatedData, success: true}
    } catch (error) {
      const updateFailed = error.response?.data?.message || error.message || error
      console.log('Failed to update queue item:', error)
      toast.error(<>{`Failed to update queue item (${action}):`}<br /><b>{updateFailed}</b></>)
      setConfirmationItem({ ...confirmationItem, updateFailed })
      return { item, success: false }
    }
  }

  function handleSortClick (properties) {
    setItemsOptions({
      ...itemsOptions,
      orderBy: properties,
      order: isEqual(itemsOptions.orderBy, properties) ? (itemsOptions.order === 'asc' ? 'desc' : 'asc') : 'desc'
    })
  }

  function handleStatsClick (item) {
    let _types = [...types]

    if (!mulitpleTypes) {
      if (types.length === 1 && types[0] === item) {
        _types = []
      } else {
        _types = [item]
      }
    } else {
      if (!_types.includes(item)) {
        _types.push(item)
      }
    }

    setTypes(_types)
    setItemsOptions({ ...itemsOptions, filter: _types })
  }

  async function handleBulkActionClick () {
    const tempQueueItemsForBulkAction = []
    const failed = []

    setBulkUpdating(true)
    for await (const item of queueItemsForBulkAction) {
      const updatedItemData = await handleActionClick(selectedBulkAction, item, `Status changed to ${selectedBulkAction}`, false)
      if (updatedItemData.success) tempQueueItemsForBulkAction.push(updatedItemData.item)
      else failed.push(updatedItemData.item)
    }
    updateQueueItemData(tempQueueItemsForBulkAction)
    setBulkUpdating(false)

    toast.success(`Bulk ${selectedBulkAction} finished on ${tempQueueItemsForBulkAction.length} items${failed.length > 0 ? `, ${failed.length} failed` : ''}`)
  }
  }

  function getDialogTitleColor () {
    let color
    if (queueItems[dialogItemIndex].status === 'failed') {
      color = '#FF0000'
    }
    if (queueItems[dialogItemIndex].status === 'retired') {
      color = '#FFFF33'
    }
    if (queueItems[dialogItemIndex].status === 'suspended') {
      color = '#0000FF'
    }
    if (queueItems[dialogItemIndex].status === 'completed') {
      color = '#00FF33'
    }
    if (queueItems[dialogItemIndex].status === 'waiting') {
      color = '#000000'
    }

    return color
  }

  return (
    <div className='queue-container'>
      <div className='queue-stats'>
        <StatisticsGroup className='stats-group'>
          <StatisticsCard className={`${types.includes('completed') ? 'card-type-active' : ''}`} title='completed' onClick={() => handleStatsClick('completed')} value={completed} loading={loading} />
          <StatisticsCard className={`${types.includes('waiting') ? 'card-type-active' : ''}`} title='waiting' onClick={() => handleStatsClick('waiting')} value={waiting} loading={loading} />
          <StatisticsCard className={`${types.includes('failed') ? 'card-type-active' : ''}`} title='failed' onClick={() => handleStatsClick('failed')} value={failed} loading={loading} />
          <StatisticsCard className={`${types.includes('retired') ? 'card-type-active' : ''}`} title='retired' onClick={() => handleStatsClick('retired')} value={retired} loading={loading} />
          <StatisticsCard className={`${types.includes('suspended') ? 'card-type-active' : ''}`} title='suspended' onClick={() => handleStatsClick('suspended')} value={suspended} loading={loading} />
        </StatisticsGroup>
      </div>
      <div className='queue-filter'>
        <FilterToolbar
          systemItems={uniqBy(allQueue, 'system').map(item => item.system).sort()}
          onFilteredItems={filter => { if (!isEqual(queueFilter, filter)) setQueueFilter(filter) }}
          onSelectedValues={values => setSelectedValues(values)}>
            {
              selectedValues.length > 0 &&
                <div className='queue-filter-bulk-section'>
                  <Select
                    items={actions}
                    onChange={action => setSelectedBulkAction(action)}
                    placeholder='Choose bulk action'
                    hidePlaceholder
                    hideDetails
                    showClear={false} />
                  {
                    selectedBulkAction &&
                      <Button disabled={queueItemsForBulkAction.length === 0 || bulkUpdating} onClick={() => handleBulkActionClick()} title={queueItemsForBulkAction.length === 0 ? `No jobs to ${selectedBulkAction}` : `Bulk ${selectedBulkAction} ${queueItemsForBulkAction.length} ${queueItemsForBulkAction.length > 1 ? 'items' : 'item'}`}>{`Bulk ${selectedBulkAction} ${queueItemsForBulkAction.length > 0 ? `${queueItemsForBulkAction.length} ${queueItemsForBulkAction.length > 1 ? 'items' : 'item'}` : ''}`}</Button>
                  }
                </div>
            }
        </FilterToolbar>
      </div>
      <div className='queue'>
        <Table
          headers={headers}
          items={queueItems}
          isLoading={loading || bulkUpdating}
        />

        <Dialog
          isOpen={dialogItemIndex > -1}
          onDismiss={() => setDialogItemIndex(-1)}
          onClickOutside={() => setDialogItemIndex(-1)}
          onPressEscape={() => setDialogItemIndex(-1)}
          showCloseButton
          height='80%'
          width='50%'
        >
          {
              dialogItemIndex > -1 &&
                <>
                  <DialogTitle isShowCloseButton style={{ color: `${getDialogTitleColor()}`, borderBottom: '1px solid black', paddingBottom: '10px' }}>
                    <Heading3>{`${queueItems[dialogItemIndex].status}`}</Heading3>
                  </DialogTitle>
                  <DialogBody>
                    <div className='dialog-item-row'>
                      <strong>Id</strong>: {queueItems[dialogItemIndex]._id}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Executed by E18</strong>: {queueItems[dialogItemIndex].e18.toString()}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Run in parallel</strong>: {queueItems[dialogItemIndex].parallel.toString()}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Retries</strong>: {queueItems[dialogItemIndex].retries.toString()}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Status</strong>: {queueItems[dialogItemIndex].status}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>System</strong>: {queueItems[dialogItemIndex].system}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Type</strong>: {queueItems[dialogItemIndex].type}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Tags</strong>: {JSON.stringify(queueItems[dialogItemIndex].tags)}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Created</strong>: {queueItems[dialogItemIndex].createdTimestamp}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Modified</strong>: {queueItems[dialogItemIndex].modifiedTimestamp}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Comments</strong>:
                      {
                        queueItems[dialogItemIndex].comments?.length > 0 &&
                          <ul>
                            {
                              queueItems[dialogItemIndex].comments.map((comment, index) => {
                                return (
                                  <li key={index}><strong>{comment.user}</strong>: <i>{comment.message}</i></li>
                                )
                              })
                            }
                          </ul>
                      }
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Tasks</strong>:
                      <SyntaxHighlighter language='json' wrapLines>
                        {JSON.stringify(queueItems[dialogItemIndex].tasks, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  </DialogBody>
                  <DialogActions style={{ display: 'inline-block', borderTop: '1px solid black', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <IconButton
                          disabled={dialogItemIndex === 0}
                          icon='arrowLeft'
                          onClick={() => setDialogItemIndex(dialogItemIndex - 1)}
                          title='Forrige'
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        {
                          generateActionButtons(queueItems[dialogItemIndex], dialogItemIndex, false)
                        }
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <IconButton
                          disabled={dialogItemIndex === (queueItems.length - 1)}
                          icon='arrowRight'
                          onClick={() => setDialogItemIndex(dialogItemIndex + 1)}
                          title='Neste'
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', height: '1.5em', paddingTop: '0.5em' }}>
                      <b>{dialogItemIndex + 1} / {queueItems.length}</b>
                    </div>
                  </DialogActions>
                </>
            }
        </Dialog>
      </div>

      {
        Object.keys(confirmationItem.item).length > 0 &&
          <ConfirmationDialog
            open
            title={<span>Change status ?</span>}
            okBtnText='Yes'
            cancelBtnText='No'
            okBtnDisabled={updating}
            onClickCancel={() => setConfirmationItem(defaultConfirmationItem)}
            onClickOk={() => handleActionClick(confirmationItem.action, confirmationItem.item, confirmationItem.message)}
            onDismiss={() => setConfirmationItem(defaultConfirmationItem)}
            height='30%'
            width='30%'
          >
            {
              confirmationItem.updateFailed &&
                <ErrorMessage>Failed to update...</ErrorMessage>
            }
            <div style={{ marginTop: '15px' }}>
              <TextField
                disabled={updating}
                onChange={e => setConfirmationItem({ ...confirmationItem, message: e.target.value })}
                placeholder='Message / Reason'
                rows={5}
                value={confirmationItem.message}
              />
            </div>
          </ConfirmationDialog>
      }

    </div>
  )
}
