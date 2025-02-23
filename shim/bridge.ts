import type { Server, serve } from 'bun'
import { Router } from './router'

let loader: Promise<Router>
export function getRouter() {
  if (!loader) {
    const router = new Router()
    globalThis.Bun = {
      serve(options: Parameters<typeof serve>[0]) {
        if ('routes' in options && options.routes) {
          for (const [path, conf] of Object.entries(options.routes)) {
            router.add(path, conf)
          }
        }
        return stubServer
      }
    } as any
    loader = import('../dist/server/index.js').then(() => router)
  }
  return loader
}

getRouter().catch(err => {
  console.error('Failed to load router:', err)
})

export const stubServer: Server = {
  url: new URL('http://stub.server'),
  stop: noimpl,
  reload: noimpl,
  fetch: noimpl,
  upgrade: noimpl,
  publish: noimpl,
  subscriberCount: noimpl,
  requestIP: noimpl,
  timeout: noimpl,
  ref: noimpl,
  unref: noimpl,
  pendingRequests: NaN,
  pendingWebSockets: NaN,
  port: NaN,
  hostname: 'stub.server',
  development: false,
  id: 'stub.server',
  [Symbol.dispose]: noimpl
}

function noimpl(): never {
  throw new Error('[stubserver] Not implemented')
}
