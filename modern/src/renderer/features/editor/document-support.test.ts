import { describe, expect, it } from 'vitest'
import {
  calculateWordCount,
  extractHeadingItems,
  summarizeMarkdown
} from './document-summary-support'
import {
  createEditorPayloadPatch,
  createMarkdownUpdatePatch,
  resolveHeadingsFromToc
} from './document-payload-support'

describe('document support', () => {
  it('extracts heading items from markdown text', () => {
    expect(extractHeadingItems('# Title\n\n## Child\nText')).toEqual([
      { depth: 1, text: 'Title' },
      { depth: 2, text: 'Child' }
    ])
  })

  it('calculates word, paragraph and character counts', () => {
    expect(calculateWordCount('One two\n\nThree')).toEqual({
      word: 3,
      paragraph: 2,
      character: 14,
      all: 14
    })
  })

  it('summarizes markdown into headings, lines and word count', () => {
    expect(summarizeMarkdown('# Title\nBody')).toEqual({
      headings: [{ depth: 1, text: 'Title' }],
      lineCount: 2,
      wordCount: {
        word: 3,
        paragraph: 1,
        character: 12,
        all: 12
      }
    })
  })

  it('uses toc headings when editor payload provides them', () => {
    const summary = summarizeMarkdown('# Title\nBody')

    expect(resolveHeadingsFromToc(
      [{ content: 'Outline', lvl: 2 }],
      summary.headings
    )).toEqual([{ depth: 2, text: 'Outline' }])
  })

  it('creates markdown update and payload patches from derived summaries', () => {
    const summary = summarizeMarkdown('# Title\nBody')

    expect(createMarkdownUpdatePatch('# Old', '# Title\nBody', summary)).toEqual({
      dirty: true,
      headings: [{ depth: 1, text: 'Title' }],
      lineCount: 2,
      markdown: '# Title\nBody',
      wordCount: {
        word: 3,
        paragraph: 1,
        character: 12,
        all: 12
      }
    })

    expect(createEditorPayloadPatch(
      {
        savedMarkdown: '# Old',
        toc: []
      },
      {
        markdown: '# Title\nBody',
        toc: [{ content: 'Outline', lvl: 2 }]
      },
      summary
    )).toEqual({
      dirty: true,
      headings: [{ depth: 2, text: 'Outline' }],
      lineCount: 2,
      markdown: '# Title\nBody',
      toc: [{ content: 'Outline', lvl: 2 }],
      wordCount: {
        word: 3,
        paragraph: 1,
        character: 12,
        all: 12
      }
    })
  })
})
