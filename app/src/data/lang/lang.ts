import english from './en.json'
import french from './fr.json'

export const langData = {
  en: english,
  fr: french,
}

export const replace = (str: string, ...replacor: string[]) => {
  let newStr = str
  replacor.forEach((r, i) => {
    newStr = newStr.replace(`{}`, r)
  })
  return newStr
}
