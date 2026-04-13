const escapeHeadingSlug = (slug: string) => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(slug)
  }

  return slug.replace(/"/g, '\\"')
}

export const findMuyaHeadingTarget = (
  container: Pick<HTMLElement, 'querySelector'>,
  slug: string
) => {
  const escapedSlug = escapeHeadingSlug(slug)
  const quotedSlug = slug.replace(/"/g, '\\"')
  const selectors = [
    `#${escapedSlug}`,
    `[id="${quotedSlug}"]`,
    `[data-role^="h"][id="${quotedSlug}"]`
  ]

  for (const selector of selectors) {
    const target = container.querySelector<HTMLElement>(selector)
    if (target) {
      return target
    }
  }

  return null
}

export const getMuyaScrollTopForTarget = (
  container: Pick<HTMLElement, 'scrollTop' | 'getBoundingClientRect'>,
  target: Pick<HTMLElement, 'getBoundingClientRect'>,
  offset = 80
) => {
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - offset

  return Math.max(0, nextTop)
}

export const scrollMuyaContainerToTarget = (
  container: Pick<HTMLElement, 'scrollTo' | 'scrollTop' | 'getBoundingClientRect'>,
  target: Pick<HTMLElement, 'getBoundingClientRect'>,
  offset = 80
) => {
  container.scrollTo({
    top: getMuyaScrollTopForTarget(container, target, offset),
    behavior: 'smooth'
  })
}

export const scrollMuyaToHeading = (
  container: Pick<HTMLElement, 'querySelector' | 'scrollTo' | 'scrollTop' | 'getBoundingClientRect'> | null | undefined,
  slug: string
) => {
  if (!slug || !container) {
    return false
  }

  const target = findMuyaHeadingTarget(container, slug)
  if (!target) {
    return false
  }

  scrollMuyaContainerToTarget(container, target)
  return true
}
