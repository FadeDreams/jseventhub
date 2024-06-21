
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

// HubEventEmitter represents an event emitter.
class HubEventEmitter {
  constructor(logging = false) {
    this.eventEmitter = new EventEmitter();
    this.handlers = {};
    this.events = new PriorityQueue({ comparator: (a, b) => a.priority - b.priority });
    this.logging = logging;

    if (this.logging) {
      this.logger = console;
    } else {
      this.logger = null;
    }
  }

  // SetLogging enables or disables logging for the EventEmitter.
  setLogging(enable) {
    this.logging = enable;
    if (this.logging) {
      this.logger = console;
    } else {
      this.logger = null;
    }
  }

  // On registers a listener for the specified event.
  on(event, ...filters) {
    const ch = new EventEmitter();
    this.eventEmitter.on(event, (data) => {
      if (filters.length === 0 || filters.some(filter => filter(data))) {
        ch.emit('data', data);
      }
    });
    return ch;
  }

  // EmitWithContext emits an event with context for cancellation and timeout.
  emitWithContext(ctx, event, data, priority) {
    if (this.logging) {
      this.logger.log(`Emitting event ${event} with priority ${priority}`);
    }
    this.events.queue(new PriorityEvent(event, priority, data));
  }

  // ProcessEvents processes events in priority order.
  processEvents(ctx) {
    while (this.events.length > 0) {
      const eventToProcess = this.events.dequeue();

      if (this.logging) {
        this.logger.log(`Processing event ${eventToProcess.event} with priority ${eventToProcess.priority}`);
      }

      this.eventEmitter.emit(eventToProcess.event, eventToProcess.data);
      this.dispatch(eventToProcess.event, eventToProcess.data);
    }
  }

  // OnEvent registers an event handler for the specified event.
  onEvent(event, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  // Off unregisters all listeners and handlers for the specified event.
  off(event) {
    this.eventEmitter.removeAllListeners(event);
    delete this.handlers[event];
  }

  // Close closes all event channels and clears the listener map.
  close() {
    this.eventEmitter.removeAllListeners();
    this.handlers = {};
  }

  // Helper function to dispatch events to registered handlers
  dispatch(event, data) {
    const handlers = this.handlers[event] || [];
    handlers.forEach(handler => handler.handle(data));
  }
}

module.exports = {
  EventHandler,
  NotificationHandler,
  Notification,
  HubEventEmitter
};
