import { rest } from 'msw'

import { API } from '../config'
import { add, get, put, remove } from './mock-data'
import { getRandomHex, getRandomNumber } from './lib/helpers'
import { getSearchParams } from '../lib/get-search-params'

import _apikeys from './data/apikeys.json'

const getTop = (req, defaultTop = 25) => {
  const params = getSearchParams(req)
  const top = typeof params.top !== 'undefined' && Number.parseInt(params.top, 10)

  if (Number.isInteger(top)) return top
  return defaultTop
}

export const handlers = [
  // jobs
  rest.get(`${API.URL}/jobs`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(get({ top: getTop(req), type: 'jobs' }))
    )
  }),
  rest.put(`${API.URL}/jobs/:id`, (req, res, ctx) => {
    const job = get({ id: req.params.id, type: 'jobs' })
    if (!job) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Job id not found' })
      )
    }

    if (req.body?.comment) {
      if (Array.isArray(job.comments)) job.comments.push(req.body.comment)
      else job.comments = [req.body.comment]

      req.body.modifiedTimestamp = new Date().toISOString()

      delete req.body.comment
    }

    const updatedJob = { ...job, ...req.body }
    put({ data: updatedJob, type: 'jobs' })

    return res(
      ctx.status(200),
      ctx.json(updatedJob)
    )
  }),
  // statistics
  rest.get(`${API.URL}/statistics`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(get({ top: getTop(req), type: 'statistics' }))
    )
  }),
  // apikeys
  rest.get(`${API.URL}/apikeys`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(get({ top: getTop(req), type: 'apikeys' }))
    )
  }),
  rest.post(`${API.URL}/apikeys`, (req, res, ctx) => {
    if (!req.body?.name) {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Error: name cannot be empty' })
      )
    }

    const apiKeys = get({ top: getTop(req), type: 'apikeys' })
    if (apiKeys.data.find(key => key.name === req.body.name)) {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Error: name must be unique' })
      )
    }

    const { fullitem } = getSearchParams(req)
    const copyApiKey = apiKeys.data.length > 0 ? apiKeys.data[0] : _apikeys[0]
    const newApiKey = JSON.parse(JSON.stringify(copyApiKey))

    newApiKey._id = `${newApiKey._id.slice(0, -10)}${getRandomHex(10)}`
    newApiKey.hash = getRandomHex(128)
    newApiKey.enabled = true
    newApiKey.createdTimestamp = new Date().toISOString()
    newApiKey.modifiedTimestamp = newApiKey.createdTimestamp
    newApiKey.name = req.body.name

    add({ data: newApiKey, type: 'apikeys' })

    if (fullitem) {
      return res(
        ctx.status(200),
        ctx.json({
          ...newApiKey,
          key: getRandomHex(getRandomNumber(100, 128))
        })
      )
    } else {
      return res(
        ctx.status(200),
        ctx.json({
          name: newApiKey.name,
          key: getRandomHex(getRandomNumber(100, 128))
        })
      )
    }
  }),
  rest.put(`${API.URL}/apikeys/:id`, (req, res, ctx) => {
    const apiKey = get({ id: req.params.id, type: 'apikeys' })
    if (!apiKey) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'ApiKey id not found' })
      )
    }

    req.body.modifiedTimestamp = new Date().toISOString()

    const updatedApiKey = { ...apiKey, ...req.body }
    put({ data: updatedApiKey, type: 'apikeys' })

    return res(
      ctx.status(200),
      ctx.json(updatedApiKey)
    )
  }),
  rest.delete(`${API.URL}/apikeys/:id`, (req, res, ctx) => {
    const apiKey = get({ id: req.params.id, type: 'apikeys' })
    if (!apiKey) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'ApiKey id not found' })
      )
    }

    remove({ id: req.params.id, type: 'apikeys' })

    return res(
      ctx.status(200)
    )
  })
]
