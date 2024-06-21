
## jseventhub

**jseventhub** is a JavaScript module that provides a robust event handling framework (`HubEventEmitter`) with support for event prioritization (`PriorityEvent`), event filtering, asynchronous processing, and logging capabilities. It integrates seamlessly into event-driven applications using Node.js's events module and `js-priority-queue` for efficient priority queue operations.

## Installation

You can install `jseventhub` using npm:

```bash
npm install @fadedreams7/jseventhub
```

### Example Usage
```JavaScript
const { HubEventEmitter, NotificationHandler, Notification } = require('@fadedreams7/jseventhub');
const EventEmitter = require('events');
const PriorityQueue = require('js-priority-queue');

// EventHandler defines an interface for handling events.
class EventHandler {
  handle(data) {
    throw new Error('NotImplementedError');
  }
}

class NotificationHandler extends EventHandler {
  constructor(name) {
    super();
    this.Name = name;
  }

  handle(data) {
    if (data instanceof Notification) {
      console.log(`[${this.Name}] Received notification: ID ${data.ID}, Message: ${data.Message}`);
    }
  }
}

class Notification {
  constructor(ID, Message, CreatedAt) {
    this.ID = ID;
    this.Message = Message;
    this.CreatedAt = CreatedAt;
  }
}

// PriorityEvent represents an event with its priority.
class PriorityEvent {
  constructor(event, priority, data) {
    this.event = event;
    this.priority = priority;
    this.data = data;
  }
}

// Initialize HubEventEmitter with logging enabled
const emitter = new HubEventEmitter(true);

// Register notification handlers
const handler1 = new NotificationHandler("EmailHandler");
const handler2 = new NotificationHandler("SMSHandler");

emitter.onEvent("email_notification", handler1);
emitter.onEvent("sms_notification", handler2);

// Registering listeners with filters
function emailFilter(data) {
  if (data instanceof Notification) {
    return data.ID > 0; // Example filter: process only notifications with ID > 0
  }
  return false;
}

const chEmail = emitter.on("email_notification", emailFilter);
const chSMS = emitter.on("sms_notification");

// Simulate sending notifications with priority
function sendNotifications() {
  emitter.emitWithContext(null, "email_notification", new Notification(1, "New email received", Date.now()), 2); // Higher priority
  emitter.emitWithContext(null, "sms_notification", new Notification(2, "You have a new SMS", Date.now()), 1); // Lower priority
}

// Handle notifications asynchronously
function handleNotifications() {
  const intervalId = setInterval(() => {
    emitter.processEvents(); // Process events in priority order
  }, 100);

  // Stop the interval after some time
  setTimeout(() => {
    clearInterval(intervalId);
    emitter.close();
  }, 2000);
}

// Start sending and handling notifications
sendNotifications();
handleNotifications();

// Clean up
process.on('exit', () => {
  emitter.close();
});
```

### Documentation
HubEventEmitter
The HubEventEmitter class provides methods for event handling and management.

Constructor
```javascript
new HubEventEmitter(logging = false)
```
Creates a new instance of HubEventEmitter with optional logging.

#### Methods
- setLogging(enable: boolean): Enables or disables logging.
- on(event: string, ...filters: Function[]): EventEmitter: Registers a listener for the specified event with optional filters.
- emitWithContext(ctx: any, event: string, data: any, priority: number): Emits an event with context and priority.
- processEvents(ctx?: any): Processes events in priority order.
- onEvent(event: string, handler: EventHandler): Registers an event handler for the specified event.
- off(event: string): Unregisters all listeners and handlers for the specified event.
- close(): Closes all event channels and clears the listener map.

#### Classes
- NotificationHandler: Handles notifications with a specific name.
- Notification: Represents a notification with ID, message, and creation timestamp.
- PriorityEvent: Represents an event with its priority.
