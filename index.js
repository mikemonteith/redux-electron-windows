const { BrowserWindow } = require('electron')


// TODO: is this the right convention to use '@@'?
const CLOSE_WINDOW = '@@redux-electron-windows/CLOSE_WINDOW';
const INIT_WINDOWS = '@@redux-electron-windows/INIT_WINDOWS';

function createWindow(createWindowCallback, state, windowConfig, dispatch) {
  let { id, closedCallback } = windowConfig;

  let win = new BrowserWindow();

  // Emitted when the window is closed.
  win.on('close', (e) => {
    if (!(id in registry) || registry[windowConfig.id].closing === true) {
      // The app has removed from the registry, go ahead close the window

      // Dereference the window object, usually you would store windows
      win = null
    } else {
      // The app hasn't removed the window, trigger callback instead of closing
      // down the window
      e.preventDefault()
      closedCallback()
    }
  })

  createWindowCallback(win, state, id, dispatch);

  return win;
};

/**
 * Registry of existing windows.
 * New windows should be added to this registry
 */
const registry = {};

module.exports.createWindowMiddleware = (createWindowCallback, stateKey) => ({dispatch, getState}) => next => action => {
  stateKey = stateKey || 'windows'

  // Get the value that should be returned by this middleware
  const returnValue = next(action);

  // The current state
  const state = getState();
  // Target state that we are trying to get to
  const target = state[stateKey] || {};

  // loop over the target and create any windows that do not already exist
  Object.keys(target).forEach(id => {
    if(!id) {
      // All windows must have an id
      throw new Error('Window id is undefined');
    }

    if(id in registry) {
      // window already exists, do nothing
    } else {
      let closedCallback = () => {
        dispatch({type: CLOSE_WINDOW, id});
      }
      const state = target[id]
      const windowConfig = {id, closedCallback}
      let ref = createWindow(createWindowCallback, state, windowConfig, dispatch);
      // Add the new window reference to the internal registry
      registry[id] = ref;
    }
  });

  // loop over the registry and remove any windows that are not needed any more
  Object.keys(registry).forEach(id => {
    if(id in target) {
      // window exists and should remain, do nothing
    } else {
      // destroy the window, it has been removed from target
      registry[id].closing = true;
      registry[id].close();
      // now remove the reference from the registry
      delete registry[id];
    }
  });

  return returnValue;
};

module.exports.CLOSE_WINDOW = CLOSE_WINDOW;
module.exports.INIT_WINDOWS = INIT_WINDOWS;
