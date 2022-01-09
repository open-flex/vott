import { mount, ReactWrapper } from "enzyme";
import React from "react";
import { appInfo } from "../../../common/appInfo";
import { StatusBar } from "./statusBar";

describe("StatusBar component", () => {
    let wrapper: ReactWrapper;

    function createComponent() {
        return mount(
            <StatusBar>
                <div className="child-component">Child Component</div>
            </StatusBar>,
        );
    }

    beforeEach(() => {
        wrapper = createComponent();
    });

    it("renders app version", () => {
        const version = wrapper.find(".status-bar-version");
        expect(version.exists()).toBe(true);
        expect(version.text()).toContain(appInfo.version);
    });

    it("renders children", () => {
        const childrenContainer = wrapper.find(".status-bar-main");
        expect(childrenContainer.find(".child-component").exists()).toBe(true);
    });
});
