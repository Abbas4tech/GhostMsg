import { EventEmitter } from "node:events";

declare global {
  var __ghostmsg_event_bus: EventEmitter | undefined;
}

const eventBus: EventEmitter =
  global.__ghostmsg_event_bus || new EventEmitter();
eventBus.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  global.__ghostmsg_event_bus = eventBus;
}

export function publishNewMessage(recipientId: string, message: unknown): void {
  eventBus.emit(`recipient:${recipientId}:message`, message);
}

export function subscribeToMessages(
  recipientId: string,
  listener: (message: unknown) => void
): () => void {
  const channel = `recipient:${recipientId}:message`;
  eventBus.on(channel, listener);
  return () => {
    eventBus.off(channel, listener);
  };
}

export default eventBus;
