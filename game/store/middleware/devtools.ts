import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type DevtoolsImpl = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, [...Mps, ['zustand/devtools', never]], Mcs>,
  options?: DevtoolsOptions
) => StateCreator<T, Mps, [['zustand/devtools', never], ...Mcs]>;

interface DevtoolsOptions {
  name?: string;
  enabled?: boolean;
  anonymousActionType?: string;
  serialize?: {
    options?: boolean | {
      date?: boolean;
      regex?: boolean;
      undefined?: boolean;
      error?: boolean;
      symbol?: boolean;
      map?: boolean;
      set?: boolean;
    };
  };
}

export const createDevtoolsMiddleware = (options: DevtoolsOptions = {}) => {
  const {
    name = 'TiltRiftStore',
    enabled = process.env.NODE_ENV === 'development',
  } = options;

  if (!enabled) {
    return <T>(config: StateCreator<T>) => config;
  }

  return <T>(config: StateCreator<T>): StateCreator<T> => {
    return (set, get, api) => {
      const wrappedSet: typeof set = (partial, replace) => {
        const actionName = typeof partial === 'function'
          ? 'anonymous action'
          : Object.keys(partial as object).join(', ');

        console.debug(`[${name}] ${actionName}`);
        if (replace === true) {
          return set(partial as T, true);
        }
        return set(partial as T | Partial<T>);
      };

      return config(wrappedSet, get, api);
    };
  };
};

export const logAction = (actionName: string, payload?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[Action] ${actionName}`);
    if (payload !== undefined) {
      console.log('Payload:', payload);
    }
    console.groupEnd();
  }
};

export const logStateChange = (storeName: string, prevState: unknown, nextState: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[${storeName}] State Change`);
    console.log('Previous:', prevState);
    console.log('Next:', nextState);
    console.groupEnd();
  }
};
