import { StatisticsGroup, StatisticsCard } from '@vtfk/components'

import { DefaultLayout } from '../../layouts/Default'

import './styles.scss'

export function Queue () {
  function handleStatsClick (type) {
    console.log(type, 'clicked')
  }

  return (
    <DefaultLayout>
      
      <div className='stats'>
        <StatisticsGroup>
          <StatisticsCard className='card-type' title='Completed' onClick={() => handleStatsClick('Completed')} value={69} />
          <StatisticsCard className='card-type' title='Failed' onClick={() => handleStatsClick('Failed')} value={42} />
          <StatisticsCard className='card-type' title='Retired' onClick={() => handleStatsClick('Retired')} value={12} />
          <StatisticsCard className='card-type' title='Suspended' onClick={() => handleStatsClick('Suspended')} value={7.5} />
        </StatisticsGroup>
      </div>
      <div className='queue'>
        Her kommer det en masse queue shit
      </div>

    </DefaultLayout>
  )
}
