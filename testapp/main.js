const url = require('url')
const path = require('path')
const uuid = require('uuid/v4')
const { app, BrowserWindow } = require('electron')
const { createStore, combineReducers, applyMiddleware } = require('redux')
const { handleActions } = require('redux-actions')

const { INIT_WINDOWS, CLOSE_WINDOW, createWindowMiddleware } = require('../index.js')

/* Create a reducer for the window state */
const myWindowReducer = handleActions({
  // Handle closing of the window by deleting the object from state
  [CLOSE_WINDOW]: (state, action) => {
    let newState = Object.assign({}, state)
    delete newState[action.id]
    return newState
  },
  NEW_WINDOW: (state, action) => {
    const uniqueId = uuid()
    return Object.assign({
      [uniqueId]: {
        url: 'file://' + path.join(__dirname, 'index.html'),
        maximize: true,
      }
    }, state)
  }
}, {
  window1: { url: "https://example.com" }
})

const reducer = combineReducers({
  windows: myWindowReducer,
})

const windowMiddleware = createWindowMiddleware((win, state, id, dispatch) => {
  win.loadURL(state.url)
  if(state.maximize === true) {
    win.maximize();
  }
})

const store = createStore(
  reducer,
  {},
  applyMiddleware(windowMiddleware)
);

app.on('ready', () => {
  store.dispatch({type: INIT_WINDOWS})
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  store.dispatch({type: 'NEW_WINDOW'})
})
