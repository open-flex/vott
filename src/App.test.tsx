import { mount } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import App from "./App";
import { IApplicationState } from "./models//applicationState";
import { ErrorHandler } from "./react/components/common/errorHandler/errorHandler";
import { KeyboardManager } from "./react/components/common/keyboardManager/keyboardManager";
import initialState from "./redux/store/initialState";
import createReduxStore from "./redux/store/store";

describe("App Component", () => {
    const defaultState: IApplicationState = initialState;
    const store = createReduxStore(defaultState);
    const electronMock = {
        ipcRenderer: {
            send: jest.fn(),
            on: jest.fn(),
        },
    };

    beforeAll(() => {
        delete (window as any).require;
    });

    function createComponent() {
        return mount(
            <Provider store={store}>
                <App />
            </Provider>,
        );
    }

    it("renders without crashing", () => {
        createComponent();
    });

    it("renders required top level components", () => {
        const wrapper = createComponent();
        expect(wrapper.find(Router).exists()).toBe(true);
        expect(wrapper.find(KeyboardManager).exists()).toEqual(true);
        expect(wrapper.find(ErrorHandler).exists()).toEqual(true);
    });
});
