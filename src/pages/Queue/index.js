import React, { useState } from 'react'

import { StatisticsGroup, StatisticsCard, Table } from '@vtfk/components'

import { DefaultLayout } from '../../layouts/Default'

import useQueue from '../../hooks/useAPI'

import './styles.scss'

const headers = [
  {
    label: 'System',
    value: 'system',
    style: { textAlign: 'left', textDecoration: 'underline' },
    itemStyle: { textDecoration: 'underline' }
  },
  {
    label: 'Status',
    value: 'status',
    style: { textAlign: 'right', textDecoration: 'overline' },
    itemStyle: { textDecoration: 'overline' }
  },
  {
    label: 'Task count',
    value: 'taskCount',
    style: { textAlign: 'center', textDecoration: 'line-through' },
    itemStyle: { textDecoration: 'overline' }
  }
]

export function Queue () {
  const [type, setType] = useState('')
  const {queue, setFilter} = useQueue([], '')

  function handleStatsClick (item) {
    if (item === type) {
      console.log(item, 'clicked off')
      setType('')
      setFilter(item)
    } else {
      console.log(item, 'clicked on')
      setType(item)
      setFilter(item)
    }
  }

  return (
    <DefaultLayout>
      
      <div className='stats'>
        <StatisticsGroup>
          <StatisticsCard className={`${type === 'completed' ? 'card-type-active' : ''}`} title='completed' onClick={() => handleStatsClick('completed')} value={69} />
          <StatisticsCard className={`${type === 'failed' ? 'card-type-active' : ''}`} title='failed' onClick={() => handleStatsClick('failed')} value={42} />
          <StatisticsCard className={`${type === 'retired' ? 'card-type-active' : ''}`} title='retired' onClick={() => handleStatsClick('retired')} value={12} />
          <StatisticsCard className={`${type === 'suspended' ? 'card-type-active' : ''}`} title='suspended' onClick={() => handleStatsClick('suspended')} value={7.5} />
        </StatisticsGroup>
      </div>
      <div className='queue'>
        <Table
          headers={headers}
          items={queue}
        />
      </div>

    </DefaultLayout>
  )
}
