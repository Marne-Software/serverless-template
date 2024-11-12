import { Context, createContext } from 'react';
import { IAppContext } from './AppInterfaces';

export const defaultAppContext: IAppContext = {
    simpleContext:  "",
    setSimpleContext: () => {
        return;
    }
}

export const AppContext: Context<IAppContext> = createContext(defaultAppContext);
