import SnapModule from 'snapsvg'

const Snap = (SnapModule as typeof SnapModule & { default?: typeof SnapModule }).default ?? SnapModule

export default Snap
