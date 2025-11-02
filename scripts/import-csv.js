const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://uucqvtpywisiqtxvamzj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Y3F2dHB5d2lzaXF0eHZhbXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODQ1MzMsImV4cCI6MjA3NjI2MDUzM30.pZ7plNNyreAZhGJsJ1M67sbJRdcCHJsPJ64wRGFrENc'

const supabase = createClient(supabaseUrl, supabaseKey)

// CSV data from your file
const csvData = [
  {
    project_number: 'MJ2501',
    project_name: '9 wood st, Randwick',
    client: 'Holly Parry',
    project_address: '9 wood st, Randwick',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 19500
  },
  {
    project_number: 'MJ2502',
    project_name: '13 wood st, Randwick',
    client: 'Mark Cook',
    project_address: '13 wood st, Randwick',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 10500
  },
  {
    project_number: 'MJ2525',
    project_name: 'CHOPT Microvellum implementation',
    client: 'CHOPT',
    project_address: 'Caringbah',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 23000
  },
  {
    project_number: 'MJ2531',
    project_name: 'Unit 1 - 842 Military Rd',
    client: 'Planbuild',
    project_address: '82 Military Rd, Mosman',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 9700
  },
  {
    project_number: 'MJ2535',
    project_name: 'Putney Residence',
    client: 'Planbuild',
    project_address: 'Putney',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 9998
  },
  {
    project_number: 'MJ2548',
    project_name: 'Blacktown Workers club',
    client: 'Planbuild',
    project_address: 'Blacktown',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 25500
  },
  {
    project_number: 'MJ2549',
    project_name: 'Balgowlah fireplace shelf',
    client: 'Planbuild',
    project_address: 'Balgowlah',
    project_status: 'in_progress',
    install_commencement_date: '2025-10-16',
    overall_project_budget: 1450
  },
  {
    project_number: 'MJ2550',
    project_name: 'Australian Eggs',
    client: 'Nickaz',
    project_address: 'North Sydney',
    project_status: 'completed',
    install_commencement_date: '2025-09-25',
    overall_project_budget: 11278
  },
  {
    project_number: 'MJ2551',
    project_name: 'Alice - Randwick Joinery',
    client: 'Alice',
    project_address: '116 Carrington Rd, Randwick',
    project_status: 'completed',
    install_commencement_date: '2025-10-11',
    overall_project_budget: 6050
  },
  {
    project_number: 'MJ2552',
    project_name: '2 x Hailo Euro Cargo Bins',
    client: 'Nickaz',
    project_address: 'QLD',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 1350
  },
  {
    project_number: 'MJ2553',
    project_name: 'Outdoor Laundry Sebastien',
    client: 'Sebastien',
    project_address: '',
    project_status: 'completed',
    install_commencement_date: null,
    overall_project_budget: 1738
  },
  {
    project_number: 'MJ2554',
    project_name: 'M2 Office fitout',
    client: 'Mark Cook - M2 Carpentry',
    project_address: 'Matraville',
    project_status: 'planning',
    install_commencement_date: '2025-09-23',
    overall_project_budget: 3465
  },
  {
    project_number: 'MJ2556',
    project_name: "Wayne's residence",
    client: 'Wayne',
    project_address: '11 Shackel Ave, Gladesville',
    project_status: 'in_progress',
    install_commencement_date: '2025-10-10',
    overall_project_budget: 11957
  },
  {
    project_number: 'MJ2557',
    project_name: 'Laundry - Austral - 2PAC',
    client: 'Glenstone',
    project_address: '11 Sebright st Austral',
    project_status: 'in_progress',
    install_commencement_date: '2025-10-15',
    overall_project_budget: 10050
  },
  {
    project_number: 'MJ2558',
    project_name: '14 Norwood Lindfield. Mostly white carcass',
    client: 'Glenstone',
    project_address: '14 Norwood Ave, Lindfield',
    project_status: 'completed',
    install_commencement_date: '2025-10-09',
    overall_project_budget: 8277
  },
  {
    project_number: 'MJ2559',
    project_name: 'Denistone TV unit - Oyster Grey',
    client: 'Glenstone',
    project_address: '12 Elston Ave, Denistone',
    project_status: 'in_progress',
    install_commencement_date: '2025-10-16',
    overall_project_budget: 7551
  },
  {
    project_number: 'MJ2560',
    project_name: '3 Dulwich, Chatswood - Fireplace joinery',
    client: 'Glenstone',
    project_address: '3 Dulwich Rd, Chatswood',
    project_status: 'in_progress',
    install_commencement_date: '2025-10-21',
    overall_project_budget: 5978
  }
]

// Function to map CSV status to database status
function mapStatus(csvStatus) {
  switch (csvStatus) {
    case 'Y_FINISHED':
    case 'Z_Invoiced':
      return 'completed'
    case 'B_Assembly':
    case 'A_Installing':
    case 'With PD (Manufacturing)':
      return 'in_progress'
    case 'D_Design':
      return 'planning'
    default:
      return 'planning'
  }
}

// Function to parse date from DD/MM/YYYY format
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null
  
  // Handle DD/MM/YYYY format
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    return `${year}-${month}-${day}`
  }
  
  return null
}

async function importProjects() {
  console.log('Starting CSV import...')
  
  try {
    // Process each project
    for (const project of csvData) {
      console.log(`Importing project: ${project.project_number} - ${project.project_name}`)
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          project_number: project.project_number,
          client: project.client,
          project_name: project.project_name,
          project_address: project.project_address,
          date_created: new Date().toISOString().split('T')[0],
          project_status: project.project_status,
          install_commencement_date: project.install_commencement_date,
          install_duration: 0,
          overall_project_budget: project.overall_project_budget,
          priority_level: 'medium'
        }])
        .select()
      
      if (error) {
        console.error(`Error importing ${project.project_number}:`, error)
      } else {
        console.log(`✅ Successfully imported ${project.project_number}`)
      }
    }
    
    console.log('✅ CSV import completed!')
    
  } catch (error) {
    console.error('Import failed:', error)
  }
}

// Run the import
importProjects()

