# fetch-event-source
Implements the EventSource API on top of `fetch()`

```
npm i --save @rangermauve/fetch-event-source
```

## API

```JavaScript
// Uses EcmaScript modules, load the source from wherever
import createEventSource from './fetch-event-source.js'
// Can also import from NPM in node.js
import createEventSource from '@rangermauve/fetch-event-source'
// For CJS users, the imports are a bit wonky due to rollup transpiling
const {default: createEventSource} = require('@rangermauve/fetch-event-source')

// By default it'll use `globalThis.fetch`
const {EventSource} = createEventSource()

const source = new EventSource('http://example.com/example-source')

// Listen for the default `message` events.
source.addEventListener('message', ({data, lastEventId}) => console.log('message', lastEventId, data))

// When you're done with it
source.close()

// Full list of returned values and constructor options
const {
  EventSource,

  // In case you want all the message classes for `instanceOf`
  MessageEvent,
  OpenEvent,
  CloseEvent,
  ErrorEvent,

  // In case you want the sources being subclassed and used
  EventTarget,
  Event,
  fetch
} = createEventSource(
  // Uses `globalThis.fetch` by default
  fetch,
  {
    // You can specify EventTarget and Event classes to extend
    EventTarget: globalThis.EventTarget,
    Event: globalThis.Event,

    // You can specify the default timeout before retrying
    defaultRetry: 5000,
})
```
