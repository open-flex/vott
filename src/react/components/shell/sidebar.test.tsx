import { mount } from "enzyme";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { IProject } from "../../../models/applicationState";
import Sidebar from "./sidebar";

describe("Sidebar Component", () => {
    it("renders correctly", () => {
        const project: IProject = null;
        const wrapper = mount(
            <Router>
                <Sidebar project={project} />
            </Router>,
        );

        expect(wrapper).not.toBeNull();

        const links = wrapper.find("ul li");
        expect(links.length).toEqual(7);
    });
});
