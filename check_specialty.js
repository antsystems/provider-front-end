// Quick script to check if NEURO MEDICINE exists in the specialty collection
const API_BASE_URL = 'https://provider-476791140012.asia-south1.run.app/api';

// You'll need to get a valid token from your browser's developer tools
// Go to Application > Local Storage > http://localhost:3001 > and copy the token
const TOKEN = 'YOUR_TOKEN_HERE'; // Replace with actual token

async function checkSpecialty(specialtyName) {
  try {
    const response = await fetch(`${API_BASE_URL}/specialty-affiliations/available-specialties`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const specialties = data.specialties || [];
    
    console.log(`\n🔍 Checking for specialty: "${specialtyName}"`);
    console.log(`📊 Total specialties available: ${specialties.length}`);
    
    // Search for exact match
    const exactMatch = specialties.find(s => 
      s.specialty_name?.toLowerCase() === specialtyName.toLowerCase()
    );
    
    // Search for partial matches
    const partialMatches = specialties.filter(s => 
      s.specialty_name?.toLowerCase().includes(specialtyName.toLowerCase())
    );
    
    if (exactMatch) {
      console.log(`✅ EXACT MATCH FOUND:`);
      console.log(`   Name: ${exactMatch.specialty_name}`);
      console.log(`   Code: ${exactMatch.specialty_code}`);
      console.log(`   ID: ${exactMatch.id}`);
    } else {
      console.log(`❌ No exact match found for "${specialtyName}"`);
    }
    
    if (partialMatches.length > 0) {
      console.log(`\n🔍 Similar specialties found:`);
      partialMatches.forEach(match => {
        console.log(`   - ${match.specialty_name} (Code: ${match.specialty_code})`);
      });
    }
    
    // Show all specialties containing "neuro"
    const neuroSpecialties = specialties.filter(s => 
      s.specialty_name?.toLowerCase().includes('neuro')
    );
    
    if (neuroSpecialties.length > 0) {
      console.log(`\n🧠 All specialties containing "neuro":`);
      neuroSpecialties.forEach(specialty => {
        console.log(`   - ${specialty.specialty_name} (Code: ${specialty.specialty_code})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking specialty:', error.message);
  }
}

// Check NEURO MEDICINE
checkSpecialty('NEURO MEDICINE');
