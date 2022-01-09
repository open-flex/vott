import { mount } from "enzyme";
import _ from "lodash";
import React from "react";
import MockFactory from "../../../common/mockFactory";
import { AssetState } from "../../../models/applicationState";
import { IStatusBarMetricsProps, StatusBarMetrics } from "./statusBarMetrics";

describe("StatusBarMetrics Component", () => {
    const testProject = MockFactory.createTestProject("TestProject");
    const testAssets = MockFactory.createTestAssets();
    testAssets[0].state = AssetState.Tagged;
    testAssets[1].state = AssetState.Tagged;
    testAssets[2].state = AssetState.Tagged;
    testAssets[3].state = AssetState.Visited;
    testAssets[4].state = AssetState.Visited;
    testProject.assets = _.keyBy(testAssets, (asset) => asset.id);

    function createComponent(props: IStatusBarMetricsProps) {
        return mount(<StatusBarMetrics {...props} />);
    }

    it("Renders simple project metrics when a project has been loaded", () => {
        const wrapper = createComponent({
            project: testProject,
        });

        expect(wrapper.find(".metric-source-connection-name").text()).toEqual(testProject.sourceConnection.name);
        expect(wrapper.find(".metric-target-connection-name").text()).toEqual(testProject.targetConnection.name);
        expect(wrapper.find(".metric-visited-asset-count").text()).toEqual("5");
        expect(wrapper.find(".metric-tagged-asset-count").text()).toEqual("3");
    });

    it("Does not render when a project hasn't been loaded", () => {
        const wrapper = createComponent({
            project: null,
        });

        expect(wrapper.find(".metric-source-connection-name").exists()).toBe(false);
        expect(wrapper.find(".metric-target-connection-name").exists()).toBe(false);
        expect(wrapper.find(".metric-visited-asset-count").exists()).toBe(false);
        expect(wrapper.find(".metric-tagged-asset-count").exists()).toBe(false);
    });
});
