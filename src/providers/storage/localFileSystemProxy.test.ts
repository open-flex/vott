import { IpcRendererProxy } from "../../common/ipcRendererProxy";
import MockFactory from "../../common/mockFactory";
import registerProviders from "../../registerProviders";
import { ILocalFileSystemProxyOptions, LocalFileSystemProxy } from "./localFileSystemProxy";
import { StorageProviderFactory } from "./storageProviderFactory";

describe("LocalFileSystem Proxy Storage Provider", () => {
    it("Provider is registered with the StorageProviderFactory", () => {
        registerProviders();
        const storageProvider = StorageProviderFactory.create("localFileSystemProxy");
        expect(storageProvider).not.toBeNull();
    });

    it("creates an instance without options", () => {
        const storageProvider = new LocalFileSystemProxy();
        expect(storageProvider).not.toBeNull();
    });

    describe("Methods", () => {
        let provider: LocalFileSystemProxy = null;
        const options: ILocalFileSystemProxyOptions = {
            folderPath: "/test",
            relativePath: false,
        };

        beforeEach(() => {
            provider = new LocalFileSystemProxy(options);
        });

        it("selectContainer", async () => {
            const expectedFolderPath = "/test";
            IpcRendererProxy.send = jest.fn(() => Promise.resolve(expectedFolderPath));

            const actualFolderPath = await provider.selectContainer();
            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:selectContainer");
            expect(actualFolderPath).toEqual(expectedFolderPath);
        });

        it("writeText", async () => {
            IpcRendererProxy.send = jest.fn(() => Promise.resolve());

            const fileName = "test.txt";
            const contents = "Hello World!";
            const expectedFilePath = [options.folderPath, fileName].join("/");
            await provider.writeText(fileName, contents);

            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:writeText", [expectedFilePath, contents]);
        });

        it("readText", async () => {
            const expectedContents = "Hello World!";
            IpcRendererProxy.send = jest.fn(() => Promise.resolve(expectedContents));

            const fileName = "test.txt";
            const expectedFilePath = [options.folderPath, fileName].join("/");
            const actual = await provider.readText(fileName);

            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:readText", [expectedFilePath]);
            expect(actual).toEqual(expectedContents);
        });

        it("deleteFile", async () => {
            IpcRendererProxy.send = jest.fn(() => Promise.resolve());

            const fileName = "test.txt";
            const expectedFilePath = [options.folderPath, fileName].join("/");
            await provider.deleteFile(fileName);

            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:deleteFile", [expectedFilePath]);
        });

        it("createContainer", async () => {
            IpcRendererProxy.send = jest.fn(() => Promise.resolve());

            const containerName = "test";
            const expectedFolderPath = [options.folderPath, containerName].join("/");
            await provider.createContainer("test");

            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:createContainer", [expectedFolderPath]);
        });

        it("deleteContainer", async () => {
            IpcRendererProxy.send = jest.fn(() => Promise.resolve());

            const containerName = "test";
            const expectedContainerPath = [options.folderPath, containerName].join("/");
            await provider.deleteContainer(containerName);

            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:deleteContainer", [expectedContainerPath]);
        });

        it("listFiles", async () => {
            const expectedFiles = [
                "/test/file1.txt",
                "/test/file2.txt",
                "/test/file3.txt",
                "/test/file4.txt",
            ];

            IpcRendererProxy.send = jest.fn(() => Promise.resolve(expectedFiles));

            const containerName = "test";
            const expectedContainerPath = [options.folderPath, containerName].join("/");
            const actualFiles = await provider.listFiles(containerName);

            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:listFiles", [expectedContainerPath]);
            expect(actualFiles).toEqual(expectedFiles);
        });

        it("listContainers", async () => {
            const expectedFolders = [
                "/test/folder1",
                "/test/folder2",
                "/test/folder3",
                "/test/folder4",
            ];

            IpcRendererProxy.send = jest.fn(() => Promise.resolve(expectedFolders));

            const containerName = "test";
            const expectedContainerPath = [options.folderPath, containerName].join("/");
            const actualFolders = await provider.listContainers(containerName);

            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:listContainers", [expectedContainerPath]);
            expect(actualFolders).toEqual(expectedFolders);
        });

        it("sends relative path argument according to options", async () => {
            const sendFunction = jest.fn();
            IpcRendererProxy.send = sendFunction;
            await provider.getAssets();
            const { folderPath, relativePath } = options;
            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:getAssets", [folderPath, relativePath]);
            sendFunction.mockReset();

            const newFolderPath = "myFolder";
            const newRelativePath = true;

            const relativeProvider = new LocalFileSystemProxy({
                folderPath: newFolderPath,
                relativePath: newRelativePath,
            });
            await relativeProvider.getAssets();
            expect(IpcRendererProxy.send).toBeCalledWith("LocalFileSystem:getAssets", [newFolderPath, newRelativePath]);
        });

        it("adds default props to a new connection", () => {
            const connection = MockFactory.createTestConnection();
            delete connection.providerOptions["relativePath"];
            expect(connection).not.toHaveProperty("providerOptions.relativePath");
            delete connection.id;
            expect(provider.addDefaultPropsToNewConnection(connection))
                .toHaveProperty("providerOptions.relativePath", true);
        });

        it("does not add default props to existing connection", () => {
            const connection = MockFactory.createTestConnection();
            delete connection.providerOptions["relativePath"];
            expect(provider.addDefaultPropsToNewConnection(connection))
                .not.toHaveProperty("providerOptions.relativePath");
        });
    });
});
