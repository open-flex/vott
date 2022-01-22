import os from "os";
import { appInfo } from "../../common/appInfo";
import HtmlFileReader from "../../common/htmlFileReader";
import MockFactory from "../../common/mockFactory";
import {
    AssetState, IAssetMetadata, IExportProviderOptions, IProject, RegionType,
} from "../../models/applicationState";
import registerMixins from "../../registerMixins";
import registerProviders from "../../registerProviders";
import { AssetService } from "../../services/assetService";
import { AssetProviderFactory } from "../storage/assetProviderFactory";
import { LocalFileSystemProxy } from "../storage/localFileSystemProxy";
import { CsvExportProvider, ICsvExportProviderOptions } from "./csv";
import { ExportAssetState } from "./exportProvider";
import { ExportProviderFactory } from "./exportProviderFactory";

jest.mock("../../services/assetService");

jest.mock("../storage/localFileSystemProxy");

registerMixins();

describe("CSV Format Export Provider", () => {
    const testAssets = MockFactory.createTestAssets(10, 1);
    const testProject: IProject = {
        ...MockFactory.createTestProject(),
        assets: {
            "asset-1": MockFactory.createTestAsset("1", AssetState.Tagged),
            "asset-2": MockFactory.createTestAsset("2", AssetState.Tagged),
            "asset-3": MockFactory.createTestAsset("3", AssetState.Visited),
            "asset-4": MockFactory.createTestAsset("4", AssetState.NotVisited),
        },
        exportFormat: {
            providerType: "csv",
            providerOptions: {
                assetState: ExportAssetState.All,
            },
        },
    };

    const expectedFileName = "vott-csv-export/" + testProject.name.replace(" ", "-") + "-export.csv";

    beforeAll(() => {
        HtmlFileReader.getAssetBlob = jest.fn(() => {
            return Promise.resolve(new Blob(["Some binary data"]));
        });

        AssetProviderFactory.create = jest.fn(() => {
            return {
                getAssets: jest.fn(() => Promise.resolve(testAssets)),
            };
        });
    });

    beforeEach(() => {
        registerProviders();
    });

    it("Is defined", () => {
        expect(CsvExportProvider).toBeDefined();
    });

    it("Can be instantiated through the factory", () => {
        const options: IExportProviderOptions = {
            assetState: ExportAssetState.All,
        };
        const exportProvider = ExportProviderFactory.create("csv", testProject, options);
        expect(exportProvider).not.toBeNull();
        expect(exportProvider).toBeInstanceOf(CsvExportProvider);
    });

    describe("Export variations", () => {
        beforeEach(() => {
            const assetServiceMock = AssetService as jest.Mocked<typeof AssetService>;
            assetServiceMock.prototype.getAssetMetadata = jest.fn((asset) => {
                const assetMetadata: IAssetMetadata = {
                    asset,
                    regions: [
                        {
                            id: "1",
                            type: RegionType.Rectangle,
                            tags: ["a", "b"],
                            boundingBox: {
                                left: 1,
                                top: 2,
                                width: 3,
                                height: 4,
                            },
                        },
                    ],
                    version: appInfo.version,
                };

                return Promise.resolve(assetMetadata);
            });

            const storageProviderMock = LocalFileSystemProxy as jest.Mock<LocalFileSystemProxy>;
            storageProviderMock.prototype.writeText.mockClear();
            storageProviderMock.prototype.writeBinary.mockClear();
            storageProviderMock.mockClear();
        });

        it("Exports all assets", async () => {
            const options: ICsvExportProviderOptions = {
                assetState: ExportAssetState.All,
                includeImages: false,
            };

            const exportProvider = new CsvExportProvider(testProject, options);
            await exportProvider.export();

            const storageProviderMock = LocalFileSystemProxy as any;
            const exportCsv = storageProviderMock.mock.instances[0].writeText.mock.calls[0][1];
            const records = exportCsv.split(os.EOL);

            // 10 assets - Each with 1 region and 2 tags
            expect(records.length).toEqual(testAssets.length * 2 + 1);

            expect(LocalFileSystemProxy.prototype.writeText)
                .toBeCalledWith(expectedFileName, expect.any(String));
        });

        it("Exports only visited assets (includes tagged)", async () => {
            const options: ICsvExportProviderOptions = {
                assetState: ExportAssetState.Visited,
                includeImages: false,
            };

            const exportProvider = new CsvExportProvider(testProject, options);
            await exportProvider.export();

            const storageProviderMock = LocalFileSystemProxy as any;
            const exportCsv = storageProviderMock.mock.instances[0].writeText.mock.calls[0][1];
            const records = exportCsv.split(os.EOL);

            // 2 tagged / 1 visited assets - Each with 1 region and 2 tags
            expect(records.length).toEqual(7);
        });

        it("Exports only tagged assets", async () => {
            const options: ICsvExportProviderOptions = {
                assetState: ExportAssetState.Tagged,
                includeImages: false,
            };

            const exportProvider = new CsvExportProvider(testProject, options);
            await exportProvider.export();

            const storageProviderMock = LocalFileSystemProxy as any;
            const exportCsv = storageProviderMock.mock.instances[0].writeText.mock.calls[0][1];
            const records = exportCsv.split(os.EOL);

            // 2 tagged - Each with 1 region and 2 tags
            expect(records.length).toEqual(5);
        });
    });
});
