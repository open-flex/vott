import { mount, ReactWrapper, shallow } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import { Route, StaticRouter as Router } from "react-router-dom";
import { AnyAction, Store } from "redux";
import createReduxStore from "../../../redux/store/store";
import { IApplicationState } from "./../../../models/applicationState";
import SettingsPage from "./../pages/appSettings/appSettingsPage";
import ConnectionsPage from "./../pages/connections/connectionsPage";
import HomePage, { IHomePageProps } from "./../pages/homepage/homePage";
import MainContentRouter from "./mainContentRouter";


describe("Main Content Router", () => {
    const badRoute: string = "/index.html";

    function createComponent(routerContext, route, store, props: IHomePageProps): ReactWrapper {
        return mount(
            <Provider store={store}>
                <Router location={route} context={routerContext}>
                    <HomePage {...props} />
                </Router>
            </Provider>,
        );
    }

    function createWrapper(route = badRoute, store = createStore(), props = null): ReactWrapper {
        const context = {};
        return createComponent(context, route, store, props);
    }

    it("renders correct routes", () => {
        const wrapper = shallow(<MainContentRouter />);
        const pathMap = wrapper.find(Route).reduce((pathMap, route) => {
            const routeProps = route.props();
            pathMap[routeProps.path] = routeProps.component;
            return pathMap;
        }, {});

        expect(pathMap["/"]).toBe(HomePage);
        expect(pathMap["/settings"]).toBe(SettingsPage);
        expect(pathMap["/connections"]).toBe(ConnectionsPage);
    });

    it("renders a redirect when no route is matched", () => {
        const wrapper = createWrapper();

        const homePage = wrapper.find(HomePage);
        expect(homePage.find(".app-homepage").exists()).toEqual(true);
    });
});

function createStore(state?: IApplicationState): Store<any, AnyAction> {
    return createReduxStore(state);
}
