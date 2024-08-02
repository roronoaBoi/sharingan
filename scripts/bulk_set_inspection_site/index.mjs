import neatCsv from 'neat-csv'
import winston from 'winston'
import fs from 'fs/promises'

const logger = winston.createLogger({
    level:'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({
            filename:'siteAssignments.log',
            level:'info'
        })
    ]
});

const token = process.argv[2]

async function assignSite(inspection, site) {
    console.log(`assigning ${inspection} to ${site}...`)
    const url = `https://api.safetyculture.io/inspections/v1/inspections/${inspection}/site`
    const callOptions = {
        method: 'PUT',
        headers: {
            accept: 'application/json',
            'sc-integration-id': 'sc-readme',
            'content-type': 'application/json',
            authorization: 'Bearer ' + token
        },
        body: JSON.stringify({site_id: site})
    }
    await fetch(url,callOptions)
    .then((callResponse) => {
        logger.log('info', `${inspection} || ${site} || ${callResponse.statusText}`)
    })
    return
}

async function reader(csvFile) {
    const textData = (await fs.readFile(csvFile)).toString()
    const csv = await neatCsv(textData)
    return csv
}

const inspectionData = await reader('setSite.csv')

for (const row of inspectionData) {
    await assignSite(row.inspection, row.site)
}
