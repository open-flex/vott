import { mount, ReactWrapper } from "enzyme";
import React from "react";
import { toast } from "react-toastify";
import MockFactory from "../../../common/mockFactory";
import IProjectActions, * as projectActions from "../../../redux/actions/projectActions";
import { ToolbarItemGroup, ToolbarItemName } from "../../../registerToolbar";
import { SaveProject } from "./saveProject";
import { IToolbarItemProps, ToolbarItemType } from "./toolbarItem";

jest.mock("react-toastify");

describe("Save Project Toolbar Item", () => {
    const testProject = MockFactory.createTestProject("TestProject");
    const clickHandler = jest.fn();
    const actions = (projectActions as any) as IProjectActions;
    let wrapper: ReactWrapper<IToolbarItemProps> = null;

    function createComponent(props: IToolbarItemProps) {
        return mount(<SaveProject {...props} />);
    }

    function createProps(): IToolbarItemProps {
        return {
            name: ToolbarItemName.SaveProject,
            tooltip: "Save Project",
            icon: "fa-save",
            group: ToolbarItemGroup.Project,
            type: ToolbarItemType.Action,
            actions,
            active: true,
            project: testProject,
            onClick: clickHandler,
        };
    }

    beforeAll(() => {
        toast.info = jest.fn(() => 1);
        toast.success = jest.fn(() => 2);
        toast.error = jest.fn(() => 3);
    });

    it("Calls save project action with successfull result", async () => {
        actions.saveProject = jest.fn(() => Promise.resolve());
        const props = createProps();
        wrapper = createComponent(props);

        await MockFactory.flushUi(() => wrapper.simulate("click"));

        expect(actions.saveProject).toBeCalledWith(testProject);
        expect(toast.success).toBeCalled();
    });

    it("Calls save project action with failed result", async () => {
        actions.saveProject = jest.fn(() => Promise.reject("Error saving project"));
        const props = createProps();
        wrapper = createComponent(props);

        await MockFactory.flushUi(() => wrapper.simulate("click"));

        expect(actions.saveProject).toBeCalledWith(testProject);
        expect(toast.error).toBeCalled();
    });
});
