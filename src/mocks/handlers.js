import { rest } from 'msw'

import { API } from '../config'
import { get } from './mock-data'
import { getRandomHex, getRandomNumber } from './lib/helpers'

const getReqParams = req => {
  const searchParams = new URLSearchParams(req.url.search)
  const params = {}
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }
  return params
}

const getTop = (req, defaultTop = 25) => {
  const params = getReqParams(req)
  const top = typeof params.top !== 'undefined' && Number.parseInt(params.top, 10)

  if (Number.isInteger(top)) return top
  return defaultTop
}

export const handlers = [
  // jobs
  rest.get(`${API.URL}/jobs`, (req, res, ctx) => {
    // TODO: Implement localstorage cache with 4 hours TTL
    return res(
      ctx.status(200),
      ctx.json(get({ top: getTop(req), type: 'jobs' }))
    )
  }),
  rest.put(`${API.URL}/jobs/:id`, (req, res, ctx) => {
    // TODO: Implement localstorage cache with 4 hours TTL
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

      delete req.body.comment
    }

    return res(
      ctx.status(200),
      ctx.json({
        ...job,
        ...req.body
      })
    )
  }),
  // statistics
  rest.get(`${API.URL}/statistics`, (req, res, ctx) => {
    // TODO: Implement localstorage cache with 4 hours TTL
    return res(
      ctx.status(200),
      ctx.json(get({ top: getTop(req), type: 'statistics' }))
    )
  }),
  // apikeys
  rest.get(`${API.URL}/apikeys`, (req, res, ctx) => {
    // TODO: Implement localstorage cache with 4 hours TTL
    return res(
      ctx.status(200),
      ctx.json(get({ top: getTop(req), type: 'apikeys' }))
    )
  }),
  rest.post(`${API.URL}/apikeys`, (req, res, ctx) => {
    // TODO: Implement localstorage cache with 4 hours TTL
    const { fullitem } = getReqParams(req)
    const apiKeys = get({ top: getTop(req), type: 'apikeys' })
    const newApiKey = JSON.parse(JSON.stringify(apiKeys.data[0]))

    newApiKey._id = `${newApiKey._id.slice(0, -10)}${getRandomHex(10)}`
    newApiKey.hash = getRandomHex(128)
    newApiKey.enabled = true
    newApiKey.createdTimestamp = new Date().toISOString()
    newApiKey.modifiedTimestamp = newApiKey.createdTimestamp
    newApiKey.name = req.body.name

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
    // TODO: Implement localstorage cache with 4 hours TTL
    const apiKey = get({ id: req.params.id, type: 'apikeys' })
    if (!apiKey) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'ApiKey id not found' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        ...apiKey,
        ...req.body
      })
    )
  }),
  rest.delete(`${API.URL}/apikeys/:id`, (req, res, ctx) => {
    // TODO: Implement localstorage cache with 4 hours TTL
    const apiKey = get({ id: req.params.id, type: 'apikeys' })
    if (!apiKey) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'ApiKey id not found' })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({})
    )
  })
]
