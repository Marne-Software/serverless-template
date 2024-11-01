import { Context, createContext } from 'react';
import { IAppContext } from './AppInterfaces';

export const defaultAppContext: IAppContext = {
    isOpen: false,
    setIsOpen: () => {
        return;
    }
}

export const AppContext: Context<IAppContext> = createContext(defaultAppContext);
