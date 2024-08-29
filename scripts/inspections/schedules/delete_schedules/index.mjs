import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

const bToken = 'TOKEN_HERE';

const inputCsvPath = 'input.csv';
const outputCsvPath = 'output.csv';

const processCsv = async () => {
  const results = [];

  // Read the CSV file
  fs.createReadStream(inputCsvPath)
    .pipe(csv())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      // Process each row
      for (const row of results) {
        const scheduleId = row.scheduleId;

        const options = {
          method: 'DELETE',
          headers: {
            accept: 'application/json',
            'sc-integration-id': 'sc-readme',
            'content-type': 'application/json',
            authorization: `Bearer ${bToken}`,
          }
        };

        try {
          const response = await fetch(`https://api.safetyculture.io/schedules/v1/schedule_items/${scheduleId}`, options);

          // Log the full response for debugging
          const responseText = await response.text();
          
          if (response.ok) {
            row.status = 'SUCCESS';
            console.log(`SUCCESS For: ${scheduleId}`);
          } else {
            row.status = 'ERROR';
            console.error(`Error for user ${scheduleId}: ${responseText}`);
          }
        } catch (err) {
          row.status = 'ERROR';
          console.error(`Network error for user ${scheduleId}:`, err);
        }
      }

      // Write the results to a new CSV file
      const csvWriter = createCsvWriter({
        path: outputCsvPath,
        header: [
          { id: 'scheduleId', title: 'scheduleId' },
          { id: 'status', title: 'status' },
        ],
      });

      await csvWriter.writeRecords(results);
      console.log('CSV file has been processed and saved as output.csv');
    });
};

processCsv();