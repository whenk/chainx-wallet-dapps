import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { configureStore } from 'redux-starter-kit'
import { Provider } from 'react-redux'
import rootReducer from './reducers'
import { createGlobalStyle } from 'styled-components'
import { getChainx, setChainx } from './services/chainx'
import { setAccount, setExtensionAccounts } from './reducers/addressSlice'
import { setNode } from './reducers/nodeSlice'
import SnackGallery from './SnackGallery'
import { setNetwork } from './reducers/settingsSlice'
import { mainNetApi, setApi, testNetApi } from './services/api'
import $t from './locale'

const GlobalStyle = createGlobalStyle`
html {
  height: 100%;
}

body {
  margin: 0 auto;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #F0F1F2;
  overflow-x: auto;

  #root {
    display: flex;
    flex-direction: column;
    height: 100%;

    & > div.wrapper {
      display: flex;
      flex: 1;
      overflow-y: auto;

      & > div {
        &:not(.staking) {
          padding: 16px;
          margin: 0 auto;
          min-width: 1280px;
          max-width: 1440px;
        }
      }
    }
  }
}

h6, p {
  margin: 0;
}

ul, li {
  list-style: none;
  padding: 0;
  margin: 0;
}
`

function loadState() {
  try {
    const serializedState = localStorage.getItem('state')
    if (serializedState === null) {
      return {}
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return {}
  }
}

function saveState(state) {
  const serializedState = JSON.stringify(state)
  localStorage.setItem('state', serializedState)
}

const persistedState = loadState()
if (!persistedState.address) {
  persistedState.address = {
    address: '5TGy4d488i7pp3sjzi1gibqFUPLShddfk7qPY2S445ErhDGq',
    extensionAccounts: [],
    isFromExtension: false,
    name: '体验账户'
  }
}

const defaultNode = {
  name: 'w1.cn',
  url: 'wss://w1.chainx.org.cn/ws'
}
if (!persistedState.node) {
  persistedState.node = defaultNode
}
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState || {}
})

store.subscribe(() => {
  const { address, node, settings } = store.getState()

  saveState({ address, node, settings })
})

let nodeResolve
const nodePromise = new Promise(resolve => {
  nodeResolve = resolve
})

window.onload = () => {
  const { url } = store.getState().node
  if (!window.chainxProvider) {
    setChainx(url)
    nodeResolve()
    return
  }

  window.chainxProvider
    .getNetwork()
    .then(network => {
      store.dispatch(setNetwork(network))
      setApi(network === 'testnet' ? testNetApi : mainNetApi)
    })
    .then(window.chainxProvider.enable)
    .then(account => {
      if (!account) {
        store.dispatch(setExtensionAccounts([]))
        store.dispatch(
          setAccount({
            name: $t('HEADER_DEMO_ACCOUNT'),
            address: '5TGy4d488i7pp3sjzi1gibqFUPLShddfk7qPY2S445ErhDGq',
            isFromExtension: false
          })
        )
        return
      }

      const settings = store.getState().settings
      store.dispatch(
        setExtensionAccounts([{ ...account, network: settings.network }])
      )
      const address = store.getState().address
      if (address.isFromExtension && address.address !== account.address) {
        store.dispatch(
          setAccount({
            name: account.name,
            address: account.address,
            isFromExtension: true
          })
        )
      }
    })
    .then(window.chainxProvider.getCurrentNode)
    .then(node => {
      if (url !== node.url) {
        store.dispatch(setNode(node))
        setChainx(node.url)
        window.location.reload()
      } else {
        setChainx(url)
      }
      nodeResolve()
    })

  window.chainxProvider.listenNetworkChange(({ from, to }) => {
    store.dispatch(setNetwork(to))
    window.location.reload()
  })

  window.chainxProvider.listenAccountChange(({ to }) => {
    store.dispatch(setExtensionAccounts([to]))
    const address = store.getState().address
    if (address.isFromExtension) {
      store.dispatch(
        setAccount({
          name: to.name,
          address: to.address,
          isFromExtension: true
        })
      )

      window.location.reload()
    }
  })

  window.chainxProvider.listenNodeChange(({ to }) => {
    const { url } = store.getState().node
    if (url !== to.url) {
      store.dispatch(setNode(to))
      setTimeout(() => {
        window.location.reload()
      }, 0)
    }
  })
}

const render = () =>
  getChainx()
    .isRpcReady()
    .then(() => {
      ReactDOM.render(
        <React.Fragment>
          <GlobalStyle />
          <Provider store={store}>
            <SnackGallery />
            <App />
          </Provider>
        </React.Fragment>,
        document.getElementById('root')
      )
    })

nodePromise.then(render)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
