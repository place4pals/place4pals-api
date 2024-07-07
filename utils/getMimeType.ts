export const getMimeType = (extension) => mimeTypesDict[extension];
export const getMimeExtension = (type) => Object.entries(mimeTypesDict).find(([, value]) => value === type)[0];

const mimeTypesDict = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
};