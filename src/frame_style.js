const { addClass } = require('./class_utils')

const attachBaseStyle = element => {
  const style = document.createElement('style')
  style.id = 'tco-base-style'
  addClass(style, 'atco-injected-style')
  style.innerHTML = `
  .anu-chat-overlay-inner:not(.hovered) {
    background: none !important;
  }

  /* Скрытие лишних элементов, если нужно */
  .anu-chat-overlay-inner .stream-chat-header,
  .anu-chat-overlay-inner .channel-leaderboard {
    display: none !important;
  }

  .anu-chat-overlay-inner * {
    visibility: hidden;
  }

  .anu-chat-overlay-inner.hovered * {
    visibility: visible;
  }

  /* Пример для скрытия поля ввода (замените на актуальный класс, если нужно) */
  .anu-chat-overlay-inner:not(.atco-dettached):not(.hovered) .chat-input__textarea {
    display: none !important;
  }

  /* Новый контейнер сообщений */
  .anu-chat-overlay-inner .chat-scrollable-area__message-container {
    overflow-x: hidden;
    visibility: visible;
    margin-bottom: -5px;
  }

  .anu-chat-overlay-inner .chat-scrollable-area__message-container * {
    visibility: visible;
  }

  .anu-chat-overlay-inner .chat-scrollable-area__message-container .chat-line__message {
    color: inherit;
  }
`
  element.append(style)
  addClass(element, 'anu-chat-overlay-inner')
}

const STYLE_ATTRS = {
  POSITION: ['left', 'right', 'top', 'bottom'],
  FONT: ['color', 'text-shadow', 'font-weight', 'font-family', 'font-size'],
  BACKGROUND: ['background-color'],
  TOGGLES: ['username', 'autoclaim', 'timestamp']
}

const SETTINGS_TO_STYLE_FN = {
  'text-shadow': v => `-1px -1px 0 ${ v }, 1px -1px 0 ${ v }, 1px 1px 0 ${ v }, -1px 1px 0 ${ v }`,
  'background-color': v => `${ v } !important`
}

const STYLE_TO_SETTINGS_FN = {
  'text-shadow': v => v.match(/(rgba\([^)]+\))/)[1],
  'background-color': v => v.replace(' !important', '')
}

const TOGGLES_SELECTORS = {
  username: '.chat-line__message > *:nth-child(-n+3)',
  timestamp: '.anu-chat-overlay-container .vod-message > .vod-message__header'
}

const settingsToStyle = (settings, attrNames, { raw } = { raw: false }) => {
  const attrs = settings.split('_'),
        out = {},
        rawFn = v => v
  for (let i = 0; i < attrNames.length; i++) {
    const fn = raw ? rawFn : (SETTINGS_TO_STYLE_FN[attrNames[i]] || rawFn)
    out[attrNames[i]] = fn(attrs[i])
  }
  
  return out
}

const styleToSettings = (style, attrNames) => attrNames.map(attr => (STYLE_TO_SETTINGS_FN[attr] || (v => v))(style[attr])).join('_')

const applyStyle = (body, id, selector, style) => {
  const fullId = `tco-style-${ id }`,
        css = `${ selector } {${Object.entries(style).map(([property, value]) => `${ property }: ${ value };`).join('')}}`
  let existingStyleNode = body.querySelector(`style#${ fullId }`)
  if (!existingStyleNode) {
    existingStyleNode = document.createElement('style')
    existingStyleNode.id = fullId
    addClass(existingStyleNode, 'atco-injected-style')
    body.append(existingStyleNode)
  }
  existingStyleNode.innerHTML = css
}

const iframeBody = _ => document.querySelector('.anu-chat-overlay-container .atco-dettached') || document.querySelector('.anu-chat-overlay-container iframe').contentDocument.body

const applyBackground = backgroundStyle => applyStyle(
  iframeBody(),
  'simplebarBackground',
  `.anu-chat-overlay-inner .chat-scrollable-area__message-container`,
  backgroundStyle
)

const applyFont = fontStyle => {
  const fullStyle = { ...fontStyle, 'line-height': `calc(${ fontStyle['font-size'] } * 5 / 3)` }
  applyStyle(
    iframeBody(),
    'chatFontStyle',
    `.anu-chat-overlay-inner .chat-line__message`,
    fullStyle
  )
}

const applyToggles = toggles => {
  for (const t in TOGGLES_SELECTORS)
    applyStyle(iframeBody(), `toggleStyle-${ t }`, TOGGLES_SELECTORS[t], toggles[t] === 'true' ? {} : { display: 'none !important' })
}

module.exports = {
  attachBaseStyle,
  settingsToStyle,
  styleToSettings,
  applyStyle,
  applyBackground,
  applyFont,
  applyToggles,
  STYLE_ATTRS,
  SETTINGS_TO_STYLE_FN,
  STYLE_TO_SETTINGS_FN
}