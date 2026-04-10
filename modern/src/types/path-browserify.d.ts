declare module 'path-browserify' {
  const path: {
    resolve: (...segments: string[]) => string
    join: (...segments: string[]) => string
    dirname: (value: string) => string
    basename: (value: string, suffix?: string) => string
    extname: (value: string) => string
    sep: string
  }

  export const resolve: (...segments: string[]) => string
  export const join: (...segments: string[]) => string
  export const dirname: (value: string) => string
  export const basename: (value: string, suffix?: string) => string
  export const extname: (value: string) => string
  export const sep: string

  export default path
}
