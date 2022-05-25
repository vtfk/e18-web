import { useEffect, useState } from 'react'
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Skeleton } from '@vtfk/components'
import { uniqBy } from 'lodash'

import useAPI from '../../hooks/useAPI'

import { DefaultLayout } from '../../layouts/Default'

import './styles.scss'

const randomData = (labels, min, max, rounded = true) => {
  const rand = () => {
    const r = Math.random() * max
    if (rounded) return Math.round(r) + min
    return r + min
  }

  if (labels) return labels.map(() => rand())
  return rand()
}

const labelsMock = [
  'Januar',
  'Februar',
  'Mars',
  'April',
  'Mai',
  'Juni'
]

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }/* ,
    title: {
      display: true,
      text: 'Charts'
    } */
  }
}

const barDataMock = {
  labels: labelsMock,
  datasets: [
    {
      label: 'Dataset 1',
      backgroundColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
      borderColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
      data: randomData(labelsMock, 0, 1000)
    },
    {
      label: 'Dataset 2',
      backgroundColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
      borderColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
      data: randomData(labelsMock, 0, 1000)
    }
  ]
}

const doughnutData = {
  labels: labelsMock,
  datasets: [
    {
      label: 'Where is this?? 🤷‍♂️',
      data: randomData(labelsMock, 0, 100),
      backgroundColor: labelsMock.map(() => `rgba(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 1, false)})`),
      borderColor: labelsMock.map(() => `rgba(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 1, false)})`),
      borderWidth: 1
    }
  ]
}

const getSystemsData = queue => {
  const labels = uniqBy(queue.map(item => item.system), value => value.toLowerCase())
  const data = labels.map(label => queue.filter(item => item.system.toLowerCase() === label.toLowerCase()).length)

  return {
    labels,
    datasets: [
      {
        label: 'Systems',
        backgroundColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
        borderColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
        data
      }
    ]
  }
}

const getTasksData = queue => {
  const labels = []
  const internalLabels = []
  const data = []

  queue.forEach(item => {
    if (!item.tasks || item.tasks.length === 0) return

    item.tasks.forEach(task => {
      const name = task.system.toLowerCase()
      const labelIndex = internalLabels.indexOf(name)
      if (labelIndex > -1) {
        data[labelIndex]++
      } else {
        labels.push(task.system)
        internalLabels.push(name)
        data.push(1)
      }
    })
  })

  return {
    labels,
    datasets: [
      {
        label: 'Tasks',
        backgroundColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
        borderColor: `rgb(${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)}, ${randomData(undefined, 0, 255)})`,
        data
      }
    ]
  }
}

// Chart.js is tree-shakeable, so it is necessary to import and register the controllers, elements, scales and plugins we are going to use
// https://www.chartjs.org/docs/latest/getting-started/integration.html#bundlers-webpack-rollup-etc

// Bar registrations
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
// Doughnut/Pie registrations
// ChartJS.register(ArcElement, Tooltip, Legend)
// Line registrations
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
// All registrations
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export function Statistics () {
  const { allQueue, loading } = useAPI('statistics')
  const [systemsData, setSystemsData] = useState(barDataMock)
  const [tasksData, setTasksData] = useState(barDataMock)

  useEffect(() => {
    if (allQueue.length === 0) return
    const _systemsData = getSystemsData(allQueue)
    const _tasksData = getTasksData(allQueue)
    setSystemsData(_systemsData)
    setTasksData(_tasksData)
  }, [allQueue])

  return (
    <DefaultLayout>
      <div className='statistics'>
        {
          loading
            ? <div><h5>Systems</h5><Skeleton height='400' width='800' /></div>
            : <Bar options={options} data={systemsData} />
        }
      </div>
      <div className='statistics'>
        {
          loading
            ? <div><h5>Tasks</h5><Skeleton height='400' width='800' /></div>
            : <Bar options={options} data={tasksData} />
        }
      </div>
      <div className='statistics'>
        {
          loading
            ? <Skeleton height='400' width='800' />
            : <Line options={options} data={barDataMock} />
      }
      </div>
      <div className='statistics'>
        {
          loading
            ? <Skeleton height='400' width='800' />
            : <Doughnut data={doughnutData} />
      }
      </div>
      <div className='statistics'>
        {
          loading
            ? <Skeleton height='400' width='800' />
            : <Pie data={doughnutData} />
      }
      </div>

      {/* <div>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec hendrerit ac turpis eu ornare. Mauris semper nisl magna, et tincidunt arcu consequat at. Duis tempus tincidunt tempor. Morbi at mi a orci facilisis hendrerit. Duis eleifend luctus euismod. Sed vitae mi ipsum. Cras at nisl sit amet dolor placerat rutrum.</p>
        <p>Nulla facilisi. Etiam sit amet lorem ut nisl tempus rutrum nec ut tellus. Cras ac tristique erat. Quisque ultrices sem tortor, quis pharetra nisi venenatis ut. Curabitur malesuada metus eros, vel tristique enim facilisis sed. Curabitur in lectus eu arcu sodales ullamcorper. Ut id malesuada lorem, ac tempor justo. Pellentesque ut ligula a magna pellentesque dignissim. Nam aliquam, libero nec consectetur dapibus, ex nunc dapibus tortor, a tincidunt ligula ipsum eu dui. Integer ut leo id odio consectetur imperdiet non vel ligula. Ut risus mi, rutrum vel risus sed, egestas semper neque. Donec finibus ante ut est euismod, in accumsan libero interdum. Etiam mattis molestie consectetur. Quisque feugiat eu ex id consequat.</p>
        <p>Phasellus vulputate diam sem, ac imperdiet arcu tincidunt ac. Suspendisse laoreet, nisl at mattis vulputate, nunc massa mollis velit, nec semper ex orci sed justo. Suspendisse quis enim sagittis, luctus arcu ac, porttitor neque. Vestibulum quis ultricies orci, at fermentum metus. Suspendisse vel gravida sapien. Sed porttitor ullamcorper nulla id condimentum. Cras imperdiet dictum nisi, eget fermentum massa lacinia a. Maecenas scelerisque faucibus accumsan. Suspendisse porttitor eu lacus ut feugiat. Nulla imperdiet ex ac lectus fermentum, sed eleifend orci viverra. Vivamus congue massa quis venenatis rhoncus. Integer eleifend quam sapien, vel maximus magna pulvinar non. Phasellus id libero blandit, blandit nibh ac, bibendum metus. Duis ullamcorper sem enim, at scelerisque nisi rutrum sit amet. Suspendisse tincidunt purus libero, at euismod orci interdum eget. Duis malesuada, arcu vel scelerisque pellentesque, diam odio blandit nibh, a condimentum nisl nisl id leo.</p>
        <p>Duis convallis, risus sed fringilla ultricies, elit ipsum volutpat lorem, in pellentesque augue tellus interdum erat. Duis maximus nunc et turpis volutpat, at efficitur elit imperdiet. Nunc vel eros et dolor sollicitudin viverra. Donec dapibus, ex ac tristique aliquet, felis massa malesuada libero, at venenatis sem sem et ante. Phasellus auctor maximus mi. Integer sodales ante ac neque ornare gravida. Donec pulvinar efficitur purus nec mattis. Proin pellentesque suscipit efficitur.</p>
        <p>Sed pretium ex in risus commodo luctus. In non tempus erat. Nulla imperdiet, nunc ut aliquam mattis, elit dui facilisis leo, ut tempor magna quam nec nunc. Fusce ac magna fermentum, vulputate nunc eget, efficitur nunc. In pulvinar dolor id est vestibulum, vel laoreet sem rhoncus. Integer eget viverra magna, gravida fringilla augue. In quis odio non nisi faucibus accumsan. Etiam quis dolor libero</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec hendrerit ac turpis eu ornare. Mauris semper nisl magna, et tincidunt arcu consequat at. Duis tempus tincidunt tempor. Morbi at mi a orci facilisis hendrerit. Duis eleifend luctus euismod. Sed vitae mi ipsum. Cras at nisl sit amet dolor placerat rutrum.</p>
        <p>Nulla facilisi. Etiam sit amet lorem ut nisl tempus rutrum nec ut tellus. Cras ac tristique erat. Quisque ultrices sem tortor, quis pharetra nisi venenatis ut. Curabitur malesuada metus eros, vel tristique enim facilisis sed. Curabitur in lectus eu arcu sodales ullamcorper. Ut id malesuada lorem, ac tempor justo. Pellentesque ut ligula a magna pellentesque dignissim. Nam aliquam, libero nec consectetur dapibus, ex nunc dapibus tortor, a tincidunt ligula ipsum eu dui. Integer ut leo id odio consectetur imperdiet non vel ligula. Ut risus mi, rutrum vel risus sed, egestas semper neque. Donec finibus ante ut est euismod, in accumsan libero interdum. Etiam mattis molestie consectetur. Quisque feugiat eu ex id consequat.</p>
        <p>Phasellus vulputate diam sem, ac imperdiet arcu tincidunt ac. Suspendisse laoreet, nisl at mattis vulputate, nunc massa mollis velit, nec semper ex orci sed justo. Suspendisse quis enim sagittis, luctus arcu ac, porttitor neque. Vestibulum quis ultricies orci, at fermentum metus. Suspendisse vel gravida sapien. Sed porttitor ullamcorper nulla id condimentum. Cras imperdiet dictum nisi, eget fermentum massa lacinia a. Maecenas scelerisque faucibus accumsan. Suspendisse porttitor eu lacus ut feugiat. Nulla imperdiet ex ac lectus fermentum, sed eleifend orci viverra. Vivamus congue massa quis venenatis rhoncus. Integer eleifend quam sapien, vel maximus magna pulvinar non. Phasellus id libero blandit, blandit nibh ac, bibendum metus. Duis ullamcorper sem enim, at scelerisque nisi rutrum sit amet. Suspendisse tincidunt purus libero, at euismod orci interdum eget. Duis malesuada, arcu vel scelerisque pellentesque, diam odio blandit nibh, a condimentum nisl nisl id leo.</p>
        <p>Duis convallis, risus sed fringilla ultricies, elit ipsum volutpat lorem, in pellentesque augue tellus interdum erat. Duis maximus nunc et turpis volutpat, at efficitur elit imperdiet. Nunc vel eros et dolor sollicitudin viverra. Donec dapibus, ex ac tristique aliquet, felis massa malesuada libero, at venenatis sem sem et ante. Phasellus auctor maximus mi. Integer sodales ante ac neque ornare gravida. Donec pulvinar efficitur purus nec mattis. Proin pellentesque suscipit efficitur.</p>
        <p>Sed pretium ex in risus commodo luctus. In non tempus erat. Nulla imperdiet, nunc ut aliquam mattis, elit dui facilisis leo, ut tempor magna quam nec nunc. Fusce ac magna fermentum, vulputate nunc eget, efficitur nunc. In pulvinar dolor id est vestibulum, vel laoreet sem rhoncus. Integer eget viverra magna, gravida fringilla augue. In quis odio non nisi faucibus accumsan. Etiam quis dolor libero</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec hendrerit ac turpis eu ornare. Mauris semper nisl magna, et tincidunt arcu consequat at. Duis tempus tincidunt tempor. Morbi at mi a orci facilisis hendrerit. Duis eleifend luctus euismod. Sed vitae mi ipsum. Cras at nisl sit amet dolor placerat rutrum.</p>
        <p>Nulla facilisi. Etiam sit amet lorem ut nisl tempus rutrum nec ut tellus. Cras ac tristique erat. Quisque ultrices sem tortor, quis pharetra nisi venenatis ut. Curabitur malesuada metus eros, vel tristique enim facilisis sed. Curabitur in lectus eu arcu sodales ullamcorper. Ut id malesuada lorem, ac tempor justo. Pellentesque ut ligula a magna pellentesque dignissim. Nam aliquam, libero nec consectetur dapibus, ex nunc dapibus tortor, a tincidunt ligula ipsum eu dui. Integer ut leo id odio consectetur imperdiet non vel ligula. Ut risus mi, rutrum vel risus sed, egestas semper neque. Donec finibus ante ut est euismod, in accumsan libero interdum. Etiam mattis molestie consectetur. Quisque feugiat eu ex id consequat.</p>
        <p>Phasellus vulputate diam sem, ac imperdiet arcu tincidunt ac. Suspendisse laoreet, nisl at mattis vulputate, nunc massa mollis velit, nec semper ex orci sed justo. Suspendisse quis enim sagittis, luctus arcu ac, porttitor neque. Vestibulum quis ultricies orci, at fermentum metus. Suspendisse vel gravida sapien. Sed porttitor ullamcorper nulla id condimentum. Cras imperdiet dictum nisi, eget fermentum massa lacinia a. Maecenas scelerisque faucibus accumsan. Suspendisse porttitor eu lacus ut feugiat. Nulla imperdiet ex ac lectus fermentum, sed eleifend orci viverra. Vivamus congue massa quis venenatis rhoncus. Integer eleifend quam sapien, vel maximus magna pulvinar non. Phasellus id libero blandit, blandit nibh ac, bibendum metus. Duis ullamcorper sem enim, at scelerisque nisi rutrum sit amet. Suspendisse tincidunt purus libero, at euismod orci interdum eget. Duis malesuada, arcu vel scelerisque pellentesque, diam odio blandit nibh, a condimentum nisl nisl id leo.</p>
        <p>Duis convallis, risus sed fringilla ultricies, elit ipsum volutpat lorem, in pellentesque augue tellus interdum erat. Duis maximus nunc et turpis volutpat, at efficitur elit imperdiet. Nunc vel eros et dolor sollicitudin viverra. Donec dapibus, ex ac tristique aliquet, felis massa malesuada libero, at venenatis sem sem et ante. Phasellus auctor maximus mi. Integer sodales ante ac neque ornare gravida. Donec pulvinar efficitur purus nec mattis. Proin pellentesque suscipit efficitur.</p>
        <p>Sed pretium ex in risus commodo luctus. In non tempus erat. Nulla imperdiet, nunc ut aliquam mattis, elit dui facilisis leo, ut tempor magna quam nec nunc. Fusce ac magna fermentum, vulputate nunc eget, efficitur nunc. In pulvinar dolor id est vestibulum, vel laoreet sem rhoncus. Integer eget viverra magna, gravida fringilla augue. In quis odio non nisi faucibus accumsan. Etiam quis dolor libero</p>
      </div> */}
    </DefaultLayout>
  )
}
