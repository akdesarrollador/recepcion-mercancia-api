import fs from 'node:fs'

const readSQL = (path: string): string => {
    const result = fs.readFileSync(`./src/queries/` + path + '.sql');
    return result.toString();
}

export default readSQL