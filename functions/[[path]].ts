import type { PagesFunction } from '@cloudflare/workers-types'
import type { BunRequest, RouterTypes } from 'bun'
import { getRouter, stubServer } from '../shim/bridge'

export const onRequest: PagesFunction = async (context) => {
  const router = await getRouter()
  const { method, url } = context.request
  const { pathname } = new URL(url)
  const { handler, params } = router.find(pathname)

  if (handler instanceof Response) {
    return handler.clone()
  }

  if (handler) {
    const methods = typeof handler === 'function' ? { GET: handler } : handler
    const fn = methods[method as RouterTypes.HTTPMethod]
    if (fn) {
      const req: BunRequest = context.request as any
      req.params = params
      return fn(req, stubServer) as any
    }
  }

  return context.next()
}
