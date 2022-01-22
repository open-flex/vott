import HtmlFileReader from "../../common/htmlFileReader";
import { IAssetMetadata, IExportProviderOptions, IProject } from "../../models/applicationState";
import { ExportProvider } from "./exportProvider";

interface IObjectInfo {
    name: string;
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
}

interface IImageInfo {
    width: number;
    height: number;
    objects: IObjectInfo[];
}

export interface IYoloExportProviderOptions extends IExportProviderOptions {
    testTrainSplit?: number;
}

export class YoloExportProvider extends ExportProvider<IYoloExportProviderOptions> {
    private imagesInfo = new Map<string, IImageInfo>();
    private tags: string[];

    constructor(project: IProject, options?: IYoloExportProviderOptions) {
        super(project, options);
        this.tags = project.tags.map(item => item.name);
    }

    /**
     * export project to Yolo
     */
    public async export(): Promise<void> {
        const allAssets = await this.getAssetsForExport();

        // Create Export Folder
        const exportFolderName = `${this.project.name.replace(/\s/g, "-")}-yolo-export`;
        await this.storageProvider.createContainer(exportFolderName);

        await this.exportImages(exportFolderName, allAssets);
        await this.exportLabels(exportFolderName, allAssets);
        await this.exportTags(exportFolderName);
    }

    private async exportImages(exportFolderName: string, allAssets: IAssetMetadata[]) {
        const imagesFolderName = `${exportFolderName}/images`;
        await this.storageProvider.createContainer(imagesFolderName);
        await allAssets.mapAsync(async (assetMetadata) => {
            await this.exportSingleImage(imagesFolderName, assetMetadata);
        });
    }

    private async exportLabels(exportFolderName: string, allAssets: IAssetMetadata[]) {
        // Create Labels Sub Folder
        const labelsFolderName = `${exportFolderName}/labels`;
        await this.storageProvider.createContainer(labelsFolderName);

        try {
            // Save Labels
            await this.imagesInfo.forEachAsync(async (imageInfo, imageName) => {
                const imageFilePath = `${labelsFolderName}/${imageName}`;
                const assetFilePath = `${imageFilePath.substr(0, imageFilePath.lastIndexOf("."))
                    || imageFilePath}.txt`;

                const objects = imageInfo.objects.map((o) => {
                    const index = this.tags.indexOf(o.name);
                    const cx = (o.xmin + o.xmax) / 2;
                    const cy =(o.ymin + o.ymax) / 2;
                    const w = o.xmax - o.xmin;
                    const h = o.ymax - o.ymin;

                    return `${index} ${cx / imageInfo.width} ${cy / imageInfo.height} ${w / imageInfo.width} ${h / imageInfo.height}`;
                });

                // Save Annotation File
                await this.storageProvider.writeText(assetFilePath, objects.join("\n"));
            });
        } catch (err) {
            console.log("Error writing yolo label file");
        }
    }

    private async exportTags(exportFolderName: string) {
        const tagsFilPath = `${exportFolderName}/tags.txt`;
        try {
            await this.storageProvider.writeText(tagsFilPath, this.tags.join(" "));
        }
        catch (err) {
            console.log("Error writing yolo tags file");
        }
    }

    private async exportSingleImage(imagesFolderName: string, assetMetadata: IAssetMetadata): Promise<void> {
        try {
            const arrayBuffer = await HtmlFileReader.getAssetArray(assetMetadata.asset);
            const buffer = Buffer.from(arrayBuffer);
            const imageFileName = `${imagesFolderName}/${assetMetadata.asset.name}`;

            // Write Binary
            await this.storageProvider.writeBinary(imageFileName, buffer);

            // Get Array of all Box shaped tag for the Asset
            const tagObjects = this.getAssetTagArray(assetMetadata);

            const imageInfo: IImageInfo = {
                width: assetMetadata.asset.size ? assetMetadata.asset.size.width : 0,
                height: assetMetadata.asset.size ? assetMetadata.asset.size.height : 0,
                objects: tagObjects,
            };

            this.imagesInfo.set(assetMetadata.asset.name, imageInfo);

            if (!assetMetadata.asset.size ||
                assetMetadata.asset.size.width === 0 ||
                assetMetadata.asset.size.height === 0) {
                await this.updateImageSizeInfo(arrayBuffer, imageFileName, assetMetadata.asset.name);
            }
        } catch (err) {
            // Ignore the error at the moment
            // TODO: Refactor ExportProvider abstract class export() method
            //       to return Promise<object> with an object containing
            //       the number of files successfully exported out of total
            console.log(`Error downloading asset ${assetMetadata.asset.path} - ${err}`);
        }
    }

    private async updateImageSizeInfo(imageBuffer: ArrayBuffer, imageFileName: string, assetName: string) {
        // Get Base64
        const image64 = btoa(new Uint8Array(imageBuffer).
            reduce((data, byte) => data + String.fromCharCode(byte), ""));

        if (image64.length < 10) {
            // Ignore the error at the moment
            // TODO: Refactor ExportProvider abstract class export() method
            //       to return Promise<object> with an object containing
            //       the number of files successfully exported out of total
            console.log(`Image not valid ${imageFileName}`);
        } else {
            const assetProps = await HtmlFileReader.readAssetAttributesWithBuffer(image64);
            const imageInfo = this.imagesInfo.get(assetName);
            if (imageInfo && assetProps) {
                imageInfo.width = assetProps.width;
                imageInfo.height = assetProps.height;
            } else {
                console.log(`imageInfo for element ${assetName} not found (${assetProps})`);
            }
        }
    }

    private getAssetTagArray(element: IAssetMetadata): IObjectInfo[] {
        const tagObjects = [];
        element.regions.forEach((region) => {
            region.tags.forEach((tagName) => {
                const objectInfo: IObjectInfo = {
                    name: tagName,
                    xmin: region.boundingBox.left,
                    ymin: region.boundingBox.top,
                    xmax: region.boundingBox.left + region.boundingBox.width,
                    ymax: region.boundingBox.top + region.boundingBox.height,
                };

                tagObjects.push(objectInfo);
            });
        });

        return tagObjects;
    }
}
