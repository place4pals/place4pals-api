export const compressUuid = (uuid) => {
    return Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('base64').replace('==', '').replace(/\+/g, '-').replace(/\//g, '_');
};