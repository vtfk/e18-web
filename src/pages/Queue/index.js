import { relativeDateFormat } from '@vtfk/utilities'

import React, { useMemo, useState } from 'react'

import { StatisticsGroup, StatisticsCard, Table, IconButton } from '@vtfk/components'

import { isEqual } from 'lodash'

import { DefaultLayout } from '../../layouts/Default'

import useAPI from '../../hooks/useAPI'

import './styles.scss'

export function Queue () {
  const [type, setType] = useState('')
  const { allQueue, queue, itemsOptions, loading, setItemsOptions } = useAPI('queue')
  const [completed, setCompleted] = useState(0)
  const [failed, setFailed] = useState(0)
  const [retired, setRetired] = useState(0)
  const [suspended, setSuspended] = useState(0)

  const headers = [
    {
      label: 'System',
      value: 'system',
      onClick: () => handleSortClick(['system'])
    },
    {
      label: 'Tasks',
      value: 'tasks'
    },
    {
      label: 'Status',
      value: 'status',
      onClick: () => handleSortClick(['status'])
    },
    {
      label: 'Task count',
      value: 'taskCount',
      onClick: () => handleSortClick(['taskCount'])
    },
    {
      label: 'Created',
      value: 'createdTimestamp',
      onClick: () => handleSortClick(['createdTimestamp'])
    },
    {
      label: 'Modified',
      value: 'modifiedTimestamp',
      onClick: () => handleSortClick(['modifiedTimestamp'])
    },
    {
      label: 'Actions',
      value: 'actions'
    }
  ]

  const queueItems = useMemo(() => {
    setCompleted(allQueue.filter(item => item.status === 'completed').length)
    setFailed(allQueue.filter(item => item.status === 'failed').length)
    setRetired(allQueue.filter(item => item.status === 'retired').length)
    setSuspended(allQueue.filter(item => item.status === 'suspended').length)

    return queue.map(item => {
      item._elements = {
        createdTimestamp: relativeDateFormat({ toDate: new Date(item.createdTimestamp), locale: 'no', options: {  } }),
        modifiedTimestamp: relativeDateFormat({ toDate: item.modifiedTimestamp, locale: 'no' }),
        taskCount: item.tasks.length.toString(),
        tasks: item.tasks.map(task => task.system).join(', '),
        actions: <div className='item-actions'>
          <IconButton
            icon='retry'
            onClick={() => handleActionClick('retry', item._id)}
            title='Retry' />
          <IconButton
            icon='pause'
            onClick={() => handleActionClick('suspend', item._id)}
            title='Suspend' />
          <IconButton
            icon='close'
            onClick={() => handleActionClick('retire', item._id)}
            title='Retire' />
        </div>
      }

      return item
    })
  }, [allQueue, queue])

  const handleActionClick = (action, id) => {
    console.log(action, 'clicked on', id)
  }

  function handleSortClick (properties) {
    setItemsOptions({
      ...itemsOptions,
      orderBy: properties,
      order: isEqual(itemsOptions.orderBy, properties) ? (itemsOptions.order === 'asc' ? 'desc' : 'asc') : 'desc'
    })
  }

  function handleStatsClick (item) {
    if (item === type) {
      setType('')
      setItemsOptions({ ...itemsOptions, filter: item === itemsOptions.filter ? '' : item})
    } else {
      setType(item)
      setItemsOptions({ ...itemsOptions, filter: item })
    }
  }

  return (
    <DefaultLayout>
      
      <div className='queue-stats'>
        <StatisticsGroup className='stats-group'>
          <StatisticsCard className={`${type === 'completed' ? 'card-type-active' : ''}`} title='completed' onClick={() => handleStatsClick('completed')} value={completed} loading={loading} />
          <StatisticsCard className={`${type === 'failed' ? 'card-type-active' : ''}`} title='failed' onClick={() => handleStatsClick('failed')} value={failed} loading={loading} />
          <StatisticsCard className={`${type === 'retired' ? 'card-type-active' : ''}`} title='retired' onClick={() => handleStatsClick('retired')} value={retired} loading={loading} />
          <StatisticsCard className={`${type === 'suspended' ? 'card-type-active' : ''}`} title='suspended' onClick={() => handleStatsClick('suspended')} value={suspended} loading={loading} />
        </StatisticsGroup>
      </div>
      <div className='queue'>
        <Table
          headers={headers}
          items={queueItems}
          isLoading={loading}
        />
      </div>

    </DefaultLayout>
  )
}
