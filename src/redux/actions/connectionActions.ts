import { Dispatch } from "redux";
import { IConnection } from "../../models/applicationState";
import ConnectionService from "../../services/connectionService";
import { createPayloadAction, IPayloadAction } from "./actionCreators";
import { ActionTypes } from "./actionTypes";

/**
 * Actions to be performed in relation to connections
 */
export default interface IConnectionActions {
    loadConnection(connection: IConnection): Promise<IConnection>;
    saveConnection(connection: IConnection): Promise<IConnection>;
    deleteConnection(connection: IConnection): Promise<void>;
// eslint-disable-next-line semi
};

/**
 * Dispatches Load Connection action and resolves with IConnection
 * @param connection - Connection to load
 */
export function loadConnection(connection: IConnection): (dispatch: Dispatch) => Promise<IConnection> {
    return (dispatch: Dispatch) => {
        dispatch(loadConnectionAction(connection));
        return Promise.resolve(connection);
    };
}

/**
 * Dispatches Save Connection action and resolves with IConnection
 * @param connection - Connection to save
 */
export function saveConnection(connection: IConnection): (dispatch: Dispatch) => Promise<IConnection> {
    return async (dispatch: Dispatch) => {
        const connectionService = new ConnectionService();
        await connectionService.save(connection);
        dispatch(saveConnectionAction(connection));
        return Promise.resolve(connection);
    };
}

/**
 * Dispatches Delete Connection action and resolves with IConnection
 * @param connection - Connection to delete
 */
export function deleteConnection(connection: IConnection): (dispatch: Dispatch) => Promise<void> {
    return (dispatch: Dispatch) => {
        dispatch(deleteConnectionAction(connection));
        return Promise.resolve();
    };
}

/**
 * Load connection action type
 */
export interface ILoadConnectionAction extends IPayloadAction<string, IConnection> {
    type: ActionTypes.LOAD_CONNECTION_SUCCESS;
}

/**
 * Save connection action type
 */
export interface ISaveConnectionAction extends IPayloadAction<string, IConnection> {
    type: ActionTypes.SAVE_CONNECTION_SUCCESS;
}

/**
 * Delete connection action type
 */
export interface IDeleteConnectionAction extends IPayloadAction<string, IConnection> {
    type: ActionTypes.DELETE_CONNECTION_SUCCESS;
}

/**
 * Instance of load connection action
 */
export const loadConnectionAction = createPayloadAction<ILoadConnectionAction>(ActionTypes.LOAD_CONNECTION_SUCCESS);
/**
 * Instance of save connection action
 */
export const saveConnectionAction = createPayloadAction<ISaveConnectionAction>(ActionTypes.SAVE_CONNECTION_SUCCESS);
/**
 * Instance of delete connection action
 */
export const deleteConnectionAction =
    createPayloadAction<IDeleteConnectionAction>(ActionTypes.DELETE_CONNECTION_SUCCESS);
