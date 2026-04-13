type RegisteredIpcHandler = (...args: any[]) => unknown

type IpcHandleLike = (
  channel: string,
  listener: RegisteredIpcHandler
) => void

export const registerIpcHandleMap = (
  handle: IpcHandleLike,
  handlers: Record<string, RegisteredIpcHandler>
) => {
  for (const [channel, listener] of Object.entries(handlers)) {
    handle(channel, listener)
  }
}
