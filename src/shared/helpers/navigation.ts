/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface INavNode {
  key: string
  labelKey: string
  icon?: string
  to?: string
  children?: INavNode[]
  disabled?: boolean
}

export function findNavTrail(
  nodes: INavNode[],
  path: string,
  resolve: (to: string) => string,
): INavNode[] {
  for (const node of nodes) {
    if (node.to && resolve(node.to) === path) return [node]

    const below = node.children ? findNavTrail(node.children, path, resolve) : []

    if (below.length) return [node, ...below]
  }

  return []
}

export function flattenNav(nodes: INavNode[]): INavNode[] {
  return nodes.flatMap(node => [node, ...(node.children ? flattenNav(node.children) : [])])
}
