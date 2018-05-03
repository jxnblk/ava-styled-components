const css = require('css')

const { getCSS, getHashes } = require('./utils')

const getClassNames = nodes =>
  nodes.reduce((classNames, node) => {
    const classNameProp =
      node.props && (node.props.class || node.props.className)

    if (classNameProp) {
      classNameProp
        .trim()
        .split(/\s+/)
        .forEach(className => classNames.push(className))
    }

    return classNames
  }, [])

const filterClassNames = (classNames, hashes) =>
  classNames.filter(className => hashes.includes(className))

const includesClassNames = (classNames, selectors) =>
  classNames.some(className =>
    selectors.some(selector => selector.includes(className))
  )

const filterRules = classNames => rule =>
  rule.type === 'rule' &&
  includesClassNames(classNames, rule.selectors) &&
  rule.declarations.length

const getAtRules = (ast, filter) =>
  ast.stylesheet.rules
    .filter(rule => rule.type === 'media' || rule.type === 'supports')
    .reduce((acc, atRule) => {
      atRule.rules = atRule.rules.filter(filter)

      if (atRule.rules.length) {
        return acc.concat(atRule)
      }

      return acc
    }, [])

const getStyle = classNames => {
  const ast = getCSS()
  const filter = filterRules(classNames)
  const rules = ast.stylesheet.rules.filter(filter)
  const atRules = getAtRules(ast, filter)

  ast.stylesheet.rules = rules.concat(atRules)

  return css.stringify(ast)
}

const replaceClassNames = (classNames, str) =>
  classNames
    .filter(className => str.includes(className))
    .reduce(
      (acc, className, index) =>
        acc.replace(new RegExp(className, 'g'), `c${index++}`),
      str
    )

const replaceHash = (str, className) =>
  str.replace(
    new RegExp(`((class|className)="[^"]*?)${className}\\s?([^"]*")`, 'g'),
    '$1$3'
  )

const replaceHashes = (hashes, str) =>
  hashes.reduce((acc, className) => replaceHash(acc, className), str)

const getStyles = (classNames, hashes) => {
  const regex = /\.(.+?)\s*{/g
  let match = true
  const styles = []

  while (match !== null) {
    match = regex.exec(getStyle(classNames))
    if (match) styles.push(match[1])
  }

  const style = replaceHashes(
    hashes,
    replaceClassNames(classNames, getStyle(classNames))
  )

  return { style, styles }
}

const getNodes = (node, nodes = []) => {
  if (typeof node === 'object') nodes.push(node)

  if (node.children) {
    node.children.forEach(child => getNodes(child, nodes))
  }

  // eslint-disable-next-line
  return nodes.map(node => ({ ...node, ['__styled-components__']: true }))
}

module.exports = wrapper => {
  const nodes = getNodes(wrapper)

  const hashes = getHashes()
  const classNames = filterClassNames([...getClassNames(nodes)], hashes)

  const { style, styles } = getStyles(classNames, hashes)

  nodes.map(node => {
    const classNameProp =
      node.props && (node.props.class || node.props.className)

    if (classNameProp) {
      let newClassName = ''

      classNameProp
        .trim()
        .split(/\s+/)
        .forEach(className => {
          const index = styles.findIndex(style => style === className)
          if (index !== -1) newClassName += `c${index}`
        })

      return (node.props.className = newClassName)
    }
    return null
  })

  return [style, nodes[0]]
}
