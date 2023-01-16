import tape from 'tape'
import makeFetch from 'make-fetch'
import createEventSource from './fetch-event-source.js'

tape('Parse a single event', async (t) => {
  t.plan(6)
  t.timeoutAfter(1000)

  const eventType = 'example'
  const eventId = 'whatever'
  const eventData = 'Hello World!'
  const testURL = 'example://something'

  async function * makeEvents ({ url }) {
    t.equal(url, testURL, 'Got expected request URL')
    yield `event:${eventType}\nid:${eventId}\ndata:${eventData}\n\n`
  }

  const fetch = fetchFromGenerator(makeEvents)

  const { EventSource } = createEventSource(fetch)

  t.ok(EventSource, 'Created EventSource instance')

  const source = new EventSource(testURL)

  const event = await once(source, eventType)

  t.equal(event.data, eventData, 'Got expected data')
  t.equal(event.type, eventType, 'Got expected event type')
  t.equal(event.lastEventId, eventId, 'Got expected lastEventId')

  source.close()

  t.pass('Able to close')
})

tape('Reconnect after retry interval', async (t) => {
  t.plan(3)
  t.timeoutAfter(1000)

  let count = 0
  let source = null

  async function * makeEvents () {
    t.pass('Connected ' + count)
    count++
    yield 'retry:100\n'

    if (count === 2) source.close()
  }

  const fetch = fetchFromGenerator(makeEvents)

  const { EventSource } = createEventSource(fetch)

  source = new EventSource('example://something')

  await once(source, 'close')

  t.pass('Able to close')
})

function once (source, event) {
  return new Promise((resolve, reject) => {
    source.addEventListener(event, resolve, { once: true })
    source.addEventListener('error', (e) => reject(e.error || e), { once: true })
  })
}

function fetchFromGenerator (
  generator,
  statusCode = 200,
  headers = {
    'Content-Type': 'text/event-stream'
  }) {
  return makeFetch(async (req) => {
    return {
      statusCode,
      headers,
      data: generator(req)
    }
  })
}
