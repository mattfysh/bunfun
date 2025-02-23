import type { RouterTypes } from 'bun'

type Params = Record<string, string>
type Handler = RouterTypes.RouteValue<string>

class RouterNode {
  children: Record<string, RouterNode> = {}
  paramChild?: RouterNode
  wildcardChild?: RouterNode
  handler?: Handler
  constructor(public paramName?: string) {}
}

const split = (path: string) => path.replace(/^\/|\/$/g, '').split('/')

export class Router {
  root = new RouterNode()

  add(path: string, handler: Handler) {
    const node = split(path).reduce((acc: RouterNode, seg: string) => {
      switch (seg[0]) {
        case ':': {
          const param = seg.slice(1)
          acc.paramChild ??= new RouterNode(param)
          return acc.paramChild
        }
        case '*': {
          acc.wildcardChild ??= new RouterNode()
          return acc.wildcardChild
        }
        default: {
          acc.children[seg] ??= new RouterNode()
          return acc.children[seg]
        }
      }
    }, this.root)

    node.handler = handler
  }

  find(path: string) {
    let params: Params = {}
    const node = split(path).reduce((acc: RouterNode | undefined, seg: string) => {
      if (acc?.children[seg]) {
        return acc.children[seg]
      } else if (acc?.paramChild) {
        params[acc.paramChild.paramName!] = seg
        return acc.paramChild
      } else if (acc?.wildcardChild) {
        return acc.wildcardChild
      } else {
        return undefined
      }
    }, this.root)
    return { handler: node?.handler, params }

  }
}
