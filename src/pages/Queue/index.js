import { relativeDateFormat } from '@vtfk/utilities'
import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogBody, DialogTitle, Heading3, IconButton, StatisticsGroup, StatisticsCard, Table, DialogActions, TextField } from '@vtfk/components'
import { isEqual } from 'lodash'
import SyntaxHighlighter from 'react-syntax-highlighter'

import { DefaultLayout } from '../../layouts/Default'

import ConfirmationDialog from '../../components/ConfirmationDialog'

import useAPI from '../../hooks/useAPI'

import './styles.scss'

export function Queue () {
  const [types, setTypes] = useState([])
  const [mulitpleTypes, setMulitpleTypes] = useState(false)
  const { allQueue, queue, itemsOptions, loading, setItemsOptions, updateQueueItem, updating } = useAPI('queue')
  const [completed, setCompleted] = useState(0)
  const [failed, setFailed] = useState(0)
  const [retired, setRetired] = useState(0)
  const [suspended, setSuspended] = useState(0)
  const [waiting, setWaiting] = useState(0)
  const [dialogItemIndex, setDialogItemIndex] = useState(-1)
  const [confirmationItem, setConfirmationItem] = useState({})

  const generateActionButtons = (item, index, view = true) => {
    return (
      <div className='item-actions'>
        <IconButton
          icon='retry'
          disabled={['completed', 'waiting', 'suspended', 'retired', 'running'].includes(item.status) || item.e18 === false}
          onClick={() => setConfirmationItem({ action: 'retry', item, index, message: 'Status satt til retry' })} //handleActionClick('retry', item, index)}
          title={item.status === 'failed' && item.e18 === true ? 'Retry' : item.status !== 'failed' ? 'Can only retry a "failed" task' : item.e18 === false ? 'Can only retry a task handled by E18' : 'Retry'} />
        <IconButton
          icon={item.status === 'suspended' ? 'play' : 'pause'}
          disabled={['completed', 'retired'].includes(item.status)}
          onClick={() => setConfirmationItem({ action: item.status === 'suspended' ? 'unsuspend' : 'suspend', item, index, message: `Status satt til ${item.status === 'suspended' ? 'waiting' : 'suspend'}` })} //handleActionClick(item.status === 'suspended' ? 'unsuspend' : 'suspend', item, index)}
          title={item.status === 'suspended' ? 'Unsuspend': 'Suspend'} />
        <IconButton
          icon='close'
          disabled={['completed', 'retired'].includes(item.status)}
          onClick={() => setConfirmationItem({ action: 'retire', item, index, message: 'Status satt til retire' })} //handleActionClick('retire', item, index)}
          title='Retire' />
        {
          view &&
            <IconButton
              icon='activity'
              onClick={() => setDialogItemIndex(index)}
              title='View' />
        }
      </div>
    )
  }

  const headers = [
    {
      label: 'System',
      value: 'system',
      onClick: () => handleSortClick(['system'])
    },
    {
      label: 'Tasks',
      value: 'tasks',
      itemRender: (value, item, header, index) => <div>{item.tasks.length > 0 ? item.tasks.map(task => task.system).join(', ') : '-'}</div>
    },
    {
      label: 'Status',
      value: 'status',
      onClick: () => handleSortClick(['status'])
    },
    {
      label: 'Task count',
      value: 'taskCount',
      onClick: () => handleSortClick(['taskCount']),
      itemRender: (value, item, header, index) => <div>{item.tasks.length.toString()}</div>
    },
    {
      label: 'Created',
      value: 'createdTimestamp',
      onClick: () => handleSortClick(['createdTimestamp']),
      itemTooltip: 'createdAt',
      itemRender: (value, item, header, index) => <div>{relativeDateFormat({ toDate: new Date(item.createdAt || item.createdTimestamp), locale: 'no', options: {  } })}</div>
    },
    {
      label: 'Modified',
      value: 'modifiedTimestamp',
      onClick: () => handleSortClick(['modifiedTimestamp']),
      itemTooltip: 'updatedAt',
      itemRender: (value, item, header, index) => <div>{relativeDateFormat({ toDate: item.updatedAt || item.modifiedTimestamp, locale: 'no' })}</div>
    },
    {
      label: 'Actions',
      value: 'actions',
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

    return queue
  }, [allQueue, queue])

  const handleActionClick = async (action, item, message) => {
    const updatePayload = {
      comment: {
        message,
        user: 'noen.andre@vtfk.no' // TODO: Endres til pålogget bruker
      }
    }
    if (['retry', 'unsuspend'].includes(action)) {
      updatePayload.status = 'waiting'
    } else if (action === 'suspend') {
      updatePayload.status = 'suspended'
    } else if (action === 'retire') {
      updatePayload.status = 'retired'
    } else {
      console.log('WHHAAATT? A new action? :O', action)
      return
    }

    const result = await updateQueueItem(item._id, updatePayload)
    console.log('Finished update', result)

    setConfirmationItem({})
  }

  function handleSortClick (properties) {
    setItemsOptions({
      ...itemsOptions,
      orderBy: properties,
      order: isEqual(itemsOptions.orderBy, properties) ? (itemsOptions.order === 'asc' ? 'desc' : 'asc') : 'desc'
    })
  }

  function handleStatsClick (item) {
    let _types = [ ...types ]

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
    <DefaultLayout>
      
      <div className='queue-stats'>
        <StatisticsGroup className='stats-group'>
          <StatisticsCard className={`${types.includes('completed') ? 'card-type-active' : ''}`} title='completed' onClick={() => handleStatsClick('completed')} value={completed} loading={loading} />
          <StatisticsCard className={`${types.includes('waiting') ? 'card-type-active' : ''}`} title='waiting' onClick={() => handleStatsClick('waiting')} value={waiting} loading={loading} />
          <StatisticsCard className={`${types.includes('failed') ? 'card-type-active' : ''}`} title='failed' onClick={() => handleStatsClick('failed')} value={failed} loading={loading} />
          <StatisticsCard className={`${types.includes('retired') ? 'card-type-active' : ''}`} title='retired' onClick={() => handleStatsClick('retired')} value={retired} loading={loading} />
          <StatisticsCard className={`${types.includes('suspended') ? 'card-type-active' : ''}`} title='suspended' onClick={() => handleStatsClick('suspended')} value={suspended} loading={loading} />
        </StatisticsGroup>
      </div>
      <div className='queue'>
        <Table
          headers={headers}
          items={queueItems}
          isLoading={loading}
        />

        <Dialog
          isOpen={dialogItemIndex > -1}
          onDismiss={() => setDialogItemIndex(-1)}
          onClickOutside={() => setDialogItemIndex(-1)}
          onPressEscape={() => setDialogItemIndex(-1)}
          height='80%'
          width='50%'>
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
                      <strong>Created</strong>: {queueItems[dialogItemIndex].createdAt || queueItems[dialogItemIndex].createdTimestamp}
                    </div>
                    <div className='dialog-item-row'>
                      <strong>Modified</strong>: {queueItems[dialogItemIndex].updatedAt || queueItems[dialogItemIndex].modifiedTimestamp}
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
                          onClick={() => { setDialogItemIndex(dialogItemIndex - 1); console.log('Heyhey', dialogItemIndex - 1) }}
                          title='Forrige' />
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
                          onClick={() => { setDialogItemIndex(dialogItemIndex + 1); console.log('Heyhey', dialogItemIndex + 1) }}
                          title='Neste' />
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
        Object.keys(confirmationItem).length > 0 &&
          <ConfirmationDialog
            open
            title={<span>Vil du sette status til <b>{confirmationItem.action}</b> ?</span>}
            okBtnText='Yes siree'
            cancelBtnText='Hell no'
            okBtnDisabled={updating}
            onClickCancel={() => setConfirmationItem({})}
            onClickOk={() => handleActionClick(confirmationItem.action, confirmationItem.item, confirmationItem.message)}
            onDismiss={() => setConfirmationItem({})}
          >
            {
              !updating &&
                <div>
                  <TextField
                    placeholder='Beskjeden som skal legges til'
                    rows={5}
                    onChange={e => { console.log(e.target.value); setConfirmationItem({ ...confirmationItem, message: e.target.value }) }}
                    value={confirmationItem.message} />
                </div>
            }
            
            {
              updating &&
                <span>Jeg OPPDATERER!</span>
            }

          </ConfirmationDialog>
      }

    </DefaultLayout>
  )
}
