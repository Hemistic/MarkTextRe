import fileIconsModule from '@marktext/file-icons'

const fileIcons = (fileIconsModule as typeof fileIconsModule & { default?: typeof fileIconsModule }).default ?? fileIconsModule

export default fileIcons
