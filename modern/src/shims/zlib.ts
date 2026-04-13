import { deflate } from 'pako'

const encodeBase64 = (input: Uint8Array) => {
  let output = ''
  const chunkSize = 0x8000

  for (let index = 0; index < input.length; index += chunkSize) {
    const chunk = input.subarray(index, index + chunkSize)
    output += String.fromCharCode(...chunk)
  }

  return btoa(output)
}

const zlib = {
  deflateSync (input: string, options: { level?: number } = {}) {
    const compressed = deflate(input, {
      level: options.level
    })

    return {
      toString (encoding?: string) {
        if (encoding === 'base64') {
          return encodeBase64(compressed)
        }

        return new TextDecoder().decode(compressed)
      }
    }
  }
}

export default zlib
