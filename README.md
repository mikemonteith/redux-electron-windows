# Redux Electron Windows

Redux middleware for orchestrating multiple windows.

## Usage

```
npm install --save redux-electron-windows
```

This usage example assumes your have already set up a redux-based electron app.
For a complete example, see [testapp/main.js](./testapp/main.js)

```js
const { INIT_WINDOWS, CLOSE_WINDOW, createWindowMiddleware } = require('redux-electron-windows')

const reducer = combineReducers({
  windows: (state, action) => {
    if(action.type === CLOSE_WINDOW) {
      let newState = Object.assign({}, state)
      // we must handle the CLOSE_WINDOW action by removing the state for this window
      delete newState[action.id]
      return newState
    }
    if(action.type) === 'NEW_WINDOW') {
      let newState = Object.assign({}, state)
      // create a new object in the state
      newState['new-window-id'] = {
        url: 'https://example.com',
        maximize: true
      }
      return newState
    }

    // initial state
    return {
      window1: {
        url: 'https://example.com/',
      }
    }
  }
})

const windowMiddleware = createWindowMiddleware((win, state, id, dispatch) => {
  // This callback is called when a new window is created.
  // Put your window setup code here
  win.loadURL(state.url)

  if(state.maximize) {
    win.maximize()
  }
})

// Add the middleware to your store
const store = createStore(
  reducer,
  {},
  applyMiddleware(windowMiddleware)
);

app.on('ready', () => {
  // Dispatch an action to let the middleware know we can now create windows
  store.dispatch({type: INIT_WINDOWS})
})
```
