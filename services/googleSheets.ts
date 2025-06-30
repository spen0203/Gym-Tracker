// Note: You'll need to install axios: npm install axios
// import axios from 'axios';
import { GOOGLE_SHEETS_CONFIG, APPS_SCRIPT_URL, CSV_URL } from './constants';

export interface WorkoutTemplate {
  name: string;
  exercises: string[];
  sets: number;
  reps: string;
}

export const fetchWorkoutData = async () => {
  try {
    // Uncomment when axios is installed
    // const response = await axios.get(
    //   `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEET_NAME}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`
    // );
    
    // For now, return mock data
    console.log('Google Sheets API not configured yet');
    return [];
    
    // const rows = response.data.values;
    // if (!rows || rows.length === 0) {
    //   throw new Error('No data found');
    // }

    // // Assuming first row contains headers
    // const headers = rows[0];
    // const data = rows.slice(1).map((row: any[]) => {
    //   const item: any = {};
    //   headers.forEach((header: string, index: number) => {
    //     item[header] = row[index];
    //   });
    //   return item;
    // });

    // return data;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
};

export const loadWorkoutTemplates = async (): Promise<WorkoutTemplate[]> => {
  try {
    const rawData = await fetchWorkoutData();
    
    // Transform the data to match your app's structure
    return rawData.map((row: any) => ({
      name: row['Workout Name'] || row['name'] || '',
      exercises: (row['Exercises'] || row['exercises'] || '').split(',').map((ex: string) => ex.trim()).filter(Boolean),
      sets: parseInt(row['Sets'] || row['sets'] || '3'),
      reps: row['Reps'] || row['reps'] || '8-12'
    }));
  } catch (error) {
    console.error('Failed to load workout templates:', error);
    return [];
  }
};

// Alternative method using Google Apps Script
export const fetchDataFromAppsScript = async (scriptUrl?: string) => {
  try {
    const url = scriptUrl || APPS_SCRIPT_URL;
    // Uncomment when axios is installed
    // const response = await axios.get(url);
    // const data = response.data;
    // return data;
    
    console.log('Apps Script method not configured yet');
    return [];
  } catch (error) {
    console.error('Error fetching data from Apps Script:', error);
    throw error;
  }
};

// CSV method (if you export Google Sheets as CSV)
export const fetchCSVData = async (csvUrl?: string) => {
  try {
    const url = csvUrl || CSV_URL;
    // Uncomment when axios is installed
    // const response = await axios.get(url);
    // const csvData = response.data;
    
    // // Simple CSV parsing (you might want to use papaparse for more complex CSV)
    // const lines = csvData.split('\n');
    // const headers = lines[0].split(',').map((h: string) => h.trim());
    // const data = lines.slice(1).map((line: string) => {
    //   const values = line.split(',').map((v: string) => v.trim());
    //   const item: any = {};
    //   headers.forEach((header: string, index: number) => {
    //     item[header] = values[index];
    //   });
    //   return item;
    // });
    
    // return data;
    
    console.log('CSV method not configured yet');
    return [];
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    throw error;
  }
}; 