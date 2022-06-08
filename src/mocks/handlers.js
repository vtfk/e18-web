import { rest } from 'msw'
import { API } from '../config'

export const handlers = [
  rest.get(`${API.URL}/jobs`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        "__metadata": {
          "pagination": {
            "$skip": 1,
            "$top": 2,
            "items": 2,
            "totalItems": 155,
            "last_page": 78,
            "next_page": 2,
            "first_page_url": "https://test-app-e18-api/api/v1/jobs?%24top=2",
            "last_page_url": "https://test-app-e18-api/api/v1/jobs?%24top=2",
            "next_page_url": "https://test-app-e18-api/api/v1/jobs?%24top=2"
          },
          "timestamp": "2022-06-08T12:42:33.084Z"
        },
        "data": [
          {
            "_id": "6272276106aa81c00a4b7ecd",
            "system": "test",
            "type": "test",
            "status": "retired",
            "projectId": 144,
            "e18": false,
            "parallel": false,
            "retries": 0,
            "tasks": [
              {
                "system": "test",
                "method": "test",
                "status": "completed",
                "retries": 0,
                "tags": [],
                "createdTimestamp": "2022-04-28T12:26:38.262Z",
                "_id": "6272276119097bf39cdd6d17",
                "operations": []
              }
            ],
            "tags": [],
            "createdTimestamp": "2022-05-04T07:12:33.926Z",
            "modifiedTimestamp": "2022-05-04T07:12:33.926Z",
            "__v": 0
          },
          {
            "_id": "6272316506aa81c00a4b7ece",
            "system": "test2",
            "type": "test2",
            "status": "waiting",
            "projectId": 144,
            "e18": true,
            "parallel": false,
            "retries": 0,
            "tasks": [
              {
                "system": "test2",
                "method": "test2",
                "status": "completed",
                "retries": 0,
                "tags": [],
                "createdTimestamp": "2022-04-28T12:26:38.262Z",
                "_id": "6272316519097bf39cdd6d1a",
                "operations": []
              }
            ],
            "tags": [],
            "createdTimestamp": "2022-05-04T07:55:17.580Z",
            "modifiedTimestamp": "2022-05-04T07:55:17.580Z",
            "__v": 0
          }
        ]
      }))
  })
]
