export function TextClassnames(size) {
    let sizeClassname
    switch (size) {
        case 1:
            sizeClassname = ' '
            break
        case 2:
            sizeClassname = ' text-2xl '
            break
        case 3:
            sizeClassname = ' text-4xl font-semibold '
            break
        case 4:
            sizeClassname = ' text-6xl  font-bold '
            break
        default:
            sizeClassname = ' '
            break
    }
    return " text-white " + sizeClassname
}