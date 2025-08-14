import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { addParticipants } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('Processing file:', file.name, 'Size:', file.size);
    
    // Read the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Parsed data:', data);
    
    if (data.length < 2) {
      return NextResponse.json({ error: 'File must contain at least a header row and one data row' }, { status: 400 });
    }
    
    // Get headers
    const headers = data[0] as string[];
    console.log('Headers:', headers);
    
    // Find Email and Role column indices
    const emailIndex = headers.findIndex(header => 
      header && header.toLowerCase().trim() === 'email'
    );
    const roleIndex = headers.findIndex(header => 
      header && header.toLowerCase().trim() === 'role'
    );
    
    if (emailIndex === -1) {
      return NextResponse.json({ error: 'Email column not found. Please ensure your Excel file has an "Email" column.' }, { status: 400 });
    }
    
    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role column not found. Please ensure your Excel file has a "Role" column.' }, { status: 400 });
    }
    
    // Extract participants with email and role
    const participants: { email: string; role: string }[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      const email = row[emailIndex];
      const role = row[roleIndex];
      
      if (email && typeof email === 'string' && email.includes('@') && role && typeof role === 'string') {
        participants.push({
          email: email.trim(),
          role: role.trim()
        });
      }
    }
    
    console.log('Extracted participants:', participants);
    
    if (participants.length === 0) {
      return NextResponse.json({ error: 'No valid participants found in the file. Please check that both Email and Role columns have data.' }, { status: 400 });
    }
    
    // Add participants to store
    addParticipants(participants);
    console.log('Added participants to store');
    
    return NextResponse.json({ 
      success: true, 
      count: participants.length,
      message: `Successfully uploaded ${participants.length} participants`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}