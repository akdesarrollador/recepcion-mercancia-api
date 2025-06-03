const sanitizeFilename = (name: string): string => {
    return name
        .normalize('NFD') // Decomposes characters (e.g., ñ → n + ~)
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, tildes)
        .replace(/ñ/g, 'n') // Explicit replacement for 'ñ'
        .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters (except ., _, -)
        .replace(/\s+/g, '_'); // Replace spaces with underscores
};

export default sanitizeFilename