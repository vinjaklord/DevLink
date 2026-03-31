import { afterEach } from 'vitest';
import * as actualZustand from 'zustand';

const actualCreate = actualZustand.create;

export const create = (stateCreator: any) => {
  const store = actualCreate(stateCreator);
  const initialState = store.getState();

  // Reset store to initial state after each test
  afterEach(() => {
    store.setState(initialState, true);
  });

  return store;
};

export const createStore = create;
