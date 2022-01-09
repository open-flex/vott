import { ApplicationInsights, IExceptionTelemetry, SeverityLevel } from "@microsoft/applicationinsights-web";
import { Action } from "redux";
import { isElectron } from "./common/hostProcess";
import { ErrorCode } from "./models/applicationState";
import { setUpAppInsights, trackError, trackReduxAction } from "./telemetry";

jest.mock("./common/hostProcess");
jest.mock("@microsoft/applicationinsights-web");

describe("appInsights telemetry", () => {
    const isElectronMock = isElectron as jest.Mock;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("browser mode", () => {
        beforeEach(() => {
            isElectronMock.mockImplementation(() => false);
        });

        it("setUpAppInsights load an appInsights object", () => {
            const spy = jest.spyOn(ApplicationInsights.prototype, "loadAppInsights");
            setUpAppInsights();
            expect(spy).toHaveBeenCalled();
        });

        it("trackReduxAction call trackEvent", () => {
            const spy = jest.spyOn(ApplicationInsights.prototype, "trackEvent");
            setUpAppInsights();

            const action: Action = {type: "test"};
            trackReduxAction(action);

            expect(spy).toBeCalledWith({
                name: "test",
            });
        });

        it("trackError call trackException", () => {
            const spy = jest.spyOn(ApplicationInsights.prototype, "trackException");
            setUpAppInsights();

            const appError = {
                errorCode: ErrorCode.Unknown,
                message: "test message",
            };
            trackError(appError);

            const expectedExceptionTelemetry: IExceptionTelemetry = {
                error: new Error(ErrorCode.Unknown),
                properties: {
                    message: appError.message,
                },
                severityLevel: SeverityLevel.Error,
            };

            expect(spy).toBeCalledWith(expectedExceptionTelemetry);
        });
    });

    describe("electron mode", () => {
        beforeEach(() => {
            isElectronMock.mockImplementation(() => true);
        });

        it("setUpAppInsights should do nothing", () => {
            const spy = jest.spyOn(ApplicationInsights.prototype, "loadAppInsights");
            setUpAppInsights();
            expect(spy).not.toBeCalled();
        });

        it("trackError does not call trackException", () => {
            const spy = jest.spyOn(ApplicationInsights.prototype, "trackException");
            setUpAppInsights();

            const appError = {
                errorCode: ErrorCode.Unknown,
                message: "test message",
            };
            trackError(appError);
            expect(spy).not.toBeCalled();
        });

        it("trackReduxAction does not call trackEvent", () => {
            const spy = jest.spyOn(ApplicationInsights.prototype, "trackEvent");
            setUpAppInsights();

            const action: Action = {type: "test"};
            trackReduxAction(action);
            expect(spy).not.toBeCalled();
        });
    });

});
