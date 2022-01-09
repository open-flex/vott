import MockFactory from "../common/mockFactory";
import { AssetProviderFactory } from "../providers/storage/assetProviderFactory";
import ConnectionService, { IConnectionService } from "./connectionService";

describe("Connection Service", () => {
    const connectionService: IConnectionService = new ConnectionService();

    const storageProvider = MockFactory.createStorageProvider();

    AssetProviderFactory.create = jest.fn(() => storageProvider);

    it("Saves connections", async () => {
        const connection = {
            ...MockFactory.createTestConnection(),
            id: undefined,
        };

        const savedConnection = await connectionService.save(connection);
        expect(storageProvider.initialize).toBeCalled();
        expect(savedConnection.id).not.toBeUndefined();
    });
});
