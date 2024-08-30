import { Injectable } from '@angular/core';
import { from, of,Observable } from 'rxjs';
import { catchError, map, mergeMap, bufferCount } from 'rxjs/operators';
import Papa from 'papaparse';



// Define the type for the CSV row with an index signature
interface CsvRow {
  [key: string]: any;  // This allows indexing with a string key
  pSymbolName?: string;
  pSymbol?: string;
  pExchSeg?: string;
  pTrdSymbol?: string;
  pOptionType?: string;
  pScripRefKey?: string;
  lExpiryDate?: string;
  dStrikePrice?: string;
}
@Injectable({
  providedIn: 'root'
})
export class CsvProcessingServiceService {

  private readonly CHUNK_SIZE = 200000;  // Adjust based on performance needs
  private readonly CONCURRENCY_LIMIT = 2;
  private desiredColumns = [
    'pSymbol', 'pExchSeg', 'pSymbolName',
    'pTrdSymbol', 'pOptionType', 'pScripRefKey',
    'lExpiryDate ', 'dStrikePrice;'
  ];

  constructor() { }

  processCsvUrls(urls: string[]): Observable<any[]> {
    //console.log('Processing URLs:', urls);
    if (urls.length === 0) {
      console.warn('No URLs provided to process.');
      return of([]);  // Return an observable with an empty array
    }
    return from(urls).pipe(
      mergeMap(url => {
       // console.log(`Processing URL: ${url}`);
        return this.processCsvUrl(url);
      }, this.CONCURRENCY_LIMIT),
      bufferCount(urls.length), // Buffer results by the number of URLs
      map(results => {
        //console.log('Buffered results:', results);
        const flattenedResults = results.flat();
       // console.log('Flattened results:', flattenedResults);
        return flattenedResults;  // Flatten the results
      }),
      catchError(error => {
        console.error('Error processing CSV URLs:', error);
        return of([]);  // Return an observable with an empty array to ensure the stream completes
      })
    );
  }
  

  private processCsvUrl(url: string): Observable<any[]> {
   // console.log(`Processing URL: ${url}`);
  
    return from(fetch(url)
      .then(response => {
       // console.log('Received response from URL:', response);
       //console.log("response in processCsvUrl ", response);
        return response.text();
      })
    ).pipe(
      mergeMap(csvData => {
       // console.log("CSV Data received:", csvData);
  
        const chunks = this.splitCsvIntoChunks(csvData); // Split CSV data into chunks
       // console.log("Chunks created:", chunks);
  
        const chunkCount = chunks.length; // Get the number of chunks
       // console.log("Number of chunks:", chunkCount);
  
        return from(chunks).pipe(
          mergeMap(chunk => {
         //   console.log("Processing chunk:", chunk);
            return this.processCsvChunk(chunk);
          }, this.CONCURRENCY_LIMIT),
          bufferCount(chunkCount), // Buffer results by the number of chunks
          map(results => {
           // console.log("Buffered results:", results);
            return results.flat();  // Flatten the chunk results
          })
        );
      }),
      catchError(error => {
        console.error(`Error processing URL ${url}:`, error);
        return [];
      })
    );
  }
  

  // Helper function to split the CSV data into chunks
private splitCsvIntoChunks(csvData: string): string[] {
  const rows = csvData.split('\n');
  const chunks: string[] = [];

  for (let i = 0; i < rows.length; i += this.CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + this.CHUNK_SIZE).join('\n'));
  }

  return chunks;
}

private processCsvChunk(chunk: string): Observable<CsvRow[]> {
  return new Observable<CsvRow[]>(observer => {
    Papa.parse(chunk, {
      header: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<CsvRow>) => {
        // First, filter rows to include only the desired columns
        const filteredRows = result.data.map((row: CsvRow) => {
          const filteredRow: Partial<CsvRow> = {};
          this.desiredColumns.forEach(column => {
            if (row[column] !== undefined) {
              filteredRow[column] = row[column];
            }
          });
          return filteredRow;
        }) //.filter((row: Partial<CsvRow>) => row.pSymbolName === pSymbolName); // Further filter if needed

        // Then, divide the `dStrikePrice;` values by 100 if it exists
        const processedData = filteredRows.map((row: Partial<CsvRow>) => {
          // Ensure the column is included in the filtered data
          const strikePriceKey = 'dStrikePrice;';
          if (row[strikePriceKey]) {
           
            const strikePrice = parseFloat(row[strikePriceKey] as any);
            if (!isNaN(strikePrice)) {
              
              row[strikePriceKey] = (strikePrice / 100).toFixed(0); // Adjust precision as needed
              //console.log("strikePrice is",row[strikePriceKey])
            }
          }
          return row;
        });

        observer.next(processedData as CsvRow[]);
        observer.complete();
      },
      error: (error: Papa.ParseError) => {
        console.error('Error parsing CSV chunk:', error);
        observer.error(error);
      }
    });
  });
}


}