const css = require('css')
const { isStyledComponent } = require('styled-components')

let StyleSheet

/* eslint-disable */
if (!!isStyledComponent) {
  const secretInternals = require('styled-components')
    .__DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS

  if (
    secretInternals === undefined ||
    secretInternals.StyleSheet === undefined
  ) {
    throw new Error(
      'Could neither find styled-components secret internals nor styled-components/lib/models/StyleSheet.js'
    )
  } else {
    StyleSheet = secretInternals.StyleSheet
  }
} else {
  StyleSheet = require('styled-components/lib/models/StyleSheet').default
}
/* eslint-enable */

const getHTML = () => StyleSheet.instance.toHTML()

const extract = regex => {
  let style = ''
  let matches

  while ((matches = regex.exec(getHTML())) !== null) {
    style += `${matches[1]} `
  }

  return style.trim()
}

const getStyle = () => extract(/<style[^>]*>([^<]*)</g)

const getClassNames = () =>
  extract(/data-styled-components="([^"]*)"/g).split(/\s/)

const getComponentIDs = () =>
  extract(/sc-component-id: ([^\\*\\/]*) \*\//g).split(/\s/)

exports.getCSS = () => css.parse(getStyle())

exports.getHashes = () =>
  getClassNames()
    .concat(getComponentIDs())
    .filter(Boolean)
