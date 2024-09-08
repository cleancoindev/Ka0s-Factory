export enum Log {
  error,
  warning,
  default,
}

const style = {
  [Log.error]: 'color: red;',
  [Log.warning]: 'color: yellow;  background-color: brown;',
  [Log.default]: 'color: gray;',
}

export const consoleLog = ({ value, title, type }: { value: any; title: string; type?: Log }) => {
  console.group(`%c ${title || ''}`, style[type || Log.default])

  if (type === Log.error) {
    console.error(value)
  } else if (type === Log.warning) {
    console.warn(value)
  } else {
    console.log(value)
  }

  console.groupEnd()
}
