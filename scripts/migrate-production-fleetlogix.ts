/**
 * Create Fleet Logix tables and seed data in production database
 * 
 * Usage: Set PRODUCTION_DATABASE_URL environment variable and run:
 *   npx tsx scripts/migrate-production-fleetlogix.ts
 */

import { Pool } from 'pg';

const PRODUCTION_DATABASE_URL = process.env.PRODUCTION_DATABASE_URL;

if (!PRODUCTION_DATABASE_URL) {
  console.error('Error: PRODUCTION_DATABASE_URL environment variable is required');
  process.exit(1);
}

// Disable SSL certificate validation for DigitalOcean managed database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: PRODUCTION_DATABASE_URL,
  ssl: true
});

async function migrateAndSeed() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to production database...');
    
    // Create tenant_config table if not exists
    console.log('Creating tenant_config table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenant_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        company_logo VARCHAR(500),
        primary_color VARCHAR(50) DEFAULT '#f97316',
        secondary_color VARCHAR(50) DEFAULT '#1e293b',
        email_domain VARCHAR(255),
        features JSONB DEFAULT '{}',
        enabled_modules JSONB DEFAULT '["recruitment", "integrity", "onboarding", "hr"]',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create Fleet Logix tables
    console.log('Creating fleetlogix_routes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fleetlogix_routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        origin VARCHAR(255),
        destination VARCHAR(255),
        distance NUMERIC(10,2),
        estimated_duration VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating fleetlogix_vehicles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fleetlogix_vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        registration VARCHAR(50) NOT NULL,
        make VARCHAR(100),
        model VARCHAR(100),
        year INTEGER,
        vin VARCHAR(100),
        fleet_number VARCHAR(50),
        type VARCHAR(50),
        capacity NUMERIC(10,2),
        fuel_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        purchase_date DATE,
        last_service_date DATE,
        next_service_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating fleetlogix_drivers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fleetlogix_drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        id_number VARCHAR(50),
        license_number VARCHAR(50),
        license_type VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        emergency_contact VARCHAR(255),
        emergency_phone VARCHAR(20),
        hire_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        basic_salary NUMERIC(10,2),
        salary_period VARCHAR(20) DEFAULT 'monthly',
        bonus_per_load NUMERIC(10,2)
      )
    `);

    console.log('Creating fleetlogix_loads table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fleetlogix_loads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        load_number VARCHAR(50) NOT NULL,
        driver_id UUID,
        vehicle_id UUID,
        route_id UUID,
        load_date DATE,
        delivery_date DATE,
        cargo_description TEXT,
        weight NUMERIC(10,2),
        revenue NUMERIC(10,2),
        expenses NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating fleetlogix_driver_salaries table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fleetlogix_driver_salaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        driver_id UUID NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        basic_salary NUMERIC(10,2),
        load_bonus NUMERIC(10,2),
        deductions NUMERIC(10,2),
        net_salary NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Creating fleetlogix_load_reconciliation table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fleetlogix_load_reconciliation (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        load_id UUID NOT NULL,
        reconciled_by VARCHAR(255),
        reconciliation_date DATE,
        expected_revenue NUMERIC(10,2),
        actual_revenue NUMERIC(10,2),
        variance NUMERIC(10,2),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Check if Fleet Logix tenant exists
    const existingTenant = await client.query(`
      SELECT id FROM tenant_config WHERE company_name ILIKE '%fleet%' OR company_name ILIKE '%logix%'
    `);

    let tenantId: string;
    
    if (existingTenant.rows.length === 0) {
      console.log('Creating Fleet Logix tenant...');
      const newTenant = await client.query(`
        INSERT INTO tenant_config (company_name, primary_color, enabled_modules, active)
        VALUES ('Fleet Logix', '#f97316', '["fleet"]', true)
        RETURNING id
      `);
      tenantId = newTenant.rows[0].id;
      console.log(`Created Fleet Logix tenant with ID: ${tenantId}`);
    } else {
      tenantId = existingTenant.rows[0].id;
      console.log(`Found existing Fleet Logix tenant with ID: ${tenantId}`);
    }

    // Seed routes
    const routes = [
      { name: 'Exxaro Leeuwpan - Sasol Bosjesspruit', origin: 'Exxaro Leeuwpan', destination: 'Sasol Bosjesspruit', distance: 102 },
      { name: 'Exxaro Leeuwpan - Sasol Site 1', origin: 'Exxaro Leeuwpan', destination: 'Sasol Site 1', distance: 85 },
      { name: 'Kleinfontein - Arnot', origin: 'Kleinfontein', destination: 'Arnot', distance: 145 },
      { name: 'Leeuwport Mine - Lk Tlou', origin: 'Leeuwport Mine', destination: 'Lk Tlou', distance: 29 },
      { name: 'Lk Tlou - Middelbult', origin: 'Lk Tlou', destination: 'Middelbult', distance: 70 },
      { name: 'Lk Tlou - Sasol Bosjesspruit', origin: 'Lk Tlou', destination: 'Sasol Bosjesspruit', distance: 85 },
      { name: 'Lk Tlou - Sasol Impumelelo', origin: 'Lk Tlou', destination: 'Sasol Impumelelo', distance: 73 },
      { name: 'Lk Tlou - Shondoni', origin: 'Lk Tlou', destination: 'Shondoni', distance: 58 },
      { name: 'LK Tlou - Arnot', origin: 'LK Tlou', destination: 'Arnot', distance: 145 },
      { name: 'LK Tlou - Kleinfontein', origin: 'LK Tlou', destination: 'Kleinfontein', distance: 110 },
      { name: 'LK Tlou - Hendrina', origin: 'LK Tlou', destination: 'Hendrina', distance: 136 },
      { name: 'Matsambisa Kriel - Arnot', origin: 'Matsambisa Kriel', destination: 'Arnot', distance: 126 },
      { name: 'Matsambisa Kriel - Hendrina Power', origin: 'Matsambisa Kriel', destination: 'Hendrina Power', distance: 122 },
      { name: 'Matsambisa Kriel - Resinga', origin: 'Matsambisa Kriel', destination: 'Resinga', distance: 96 },
      { name: 'Mavungwani - Duvha Power Station', origin: 'Mavungwani', destination: 'Duvha Power Station', distance: 82 },
      { name: 'Mavungwani - Hendrina Power', origin: 'Mavungwani', destination: 'Hendrina Power', distance: 47 },
      { name: 'Mavungwani - Matla Power', origin: 'Mavungwani', destination: 'Matla Power', distance: 108 },
      { name: 'Resinga Mine - Arnot', origin: 'Resinga Mine', destination: 'Arnot', distance: 52 },
      { name: 'Resinga Mine - Camden', origin: 'Resinga Mine', destination: 'Camden', distance: 62 },
      { name: 'Resinga Mine - Matla', origin: 'Resinga Mine', destination: 'Matla', distance: 105 },
    ];

    console.log('Seeding routes...');
    let routeCount = 0;
    for (const route of routes) {
      const existing = await client.query('SELECT id FROM fleetlogix_routes WHERE tenant_id = $1 AND name = $2', [tenantId, route.name]);
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO fleetlogix_routes (tenant_id, name, origin, destination, distance, status)
          VALUES ($1, $2, $3, $4, $5, 'active')
        `, [tenantId, route.name, route.origin, route.destination, route.distance]);
        routeCount++;
      }
    }
    console.log(`Inserted ${routeCount} routes`);

    // Seed vehicles
    const vehicles = [
      { registration: 'KX31ZLGP - FL04', fleetNumber: 'FL04' },
      { registration: 'KX31ZNGP - FL09', fleetNumber: 'FL09' },
      { registration: 'KX31ZSGP - FL25', fleetNumber: 'FL25' },
      { registration: 'KX32BVGP - FL23', fleetNumber: 'FL23' },
      { registration: 'KX32CMGP - FL10', fleetNumber: 'FL10' },
      { registration: 'KX32CXGP - FL14', fleetNumber: 'FL14' },
      { registration: 'KX32DBGP - FL12', fleetNumber: 'FL12' },
      { registration: 'LC18JZGP - FL29', fleetNumber: 'FL29' },
      { registration: 'LC18KGGP - FL27', fleetNumber: 'FL27' },
      { registration: 'LC18KPGP - FL05', fleetNumber: 'FL05' },
      { registration: 'LC18KWGP - FL06', fleetNumber: 'FL06' },
      { registration: 'LC18KZGP - FL17', fleetNumber: 'FL17' },
      { registration: 'LC18LFGP - FL08', fleetNumber: 'FL08' },
      { registration: 'LC18LKGP - FL02', fleetNumber: 'FL02' },
      { registration: 'LC18LTGP - FL30', fleetNumber: 'FL30' },
      { registration: 'LG23HJGP - FL19', fleetNumber: 'FL19' },
      { registration: 'LG23HTGP - FL15', fleetNumber: 'FL15' },
      { registration: 'LG23KSGP - FL28', fleetNumber: 'FL28' },
      { registration: 'LG23MCGP - FL26', fleetNumber: 'FL26' },
      { registration: 'LG24BKGP - FL24', fleetNumber: 'FL24' },
      { registration: 'LG24BXGP - FL16', fleetNumber: 'FL16' },
      { registration: 'LG24CDGP - FL22', fleetNumber: 'FL22' },
      { registration: 'LG24CKGP - FL21', fleetNumber: 'FL21' },
      { registration: 'LG24GBGP - FL20', fleetNumber: 'FL20' },
      { registration: 'LG24GGGP - FL03', fleetNumber: 'FL03' },
      { registration: 'LG24GMGP - FL01', fleetNumber: 'FL01' },
      { registration: 'LG24GXGP - FL11', fleetNumber: 'FL11' },
      { registration: 'LG24HFGP - FL07', fleetNumber: 'FL07' },
      { registration: 'LG24HKGP - FL31', fleetNumber: 'FL31' },
      { registration: 'LG29CZGP - FL18', fleetNumber: 'FL18' },
      { registration: 'KX31ZJGP - FL13', fleetNumber: 'FL13' },
    ];

    console.log('Seeding vehicles...');
    let vehicleCount = 0;
    for (const vehicle of vehicles) {
      const existing = await client.query('SELECT id FROM fleetlogix_vehicles WHERE tenant_id = $1 AND registration = $2', [tenantId, vehicle.registration]);
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO fleetlogix_vehicles (tenant_id, registration, fleet_number, type, capacity, status)
          VALUES ($1, $2, $3, 'Truck', 34, 'active')
        `, [tenantId, vehicle.registration, vehicle.fleetNumber]);
        vehicleCount++;
      }
    }
    console.log(`Inserted ${vehicleCount} vehicles`);

    // Seed drivers
    const drivers = [
      'Ayanda Tembe', 'Meshack Khathide', 'Sihle Thabo Nkosi', 'Sandile Peter Nzimande',
      'Witness Nkosi', 'Themba Simelane', 'Welcome Mashaya', 'Production Mthethwa',
      'Bhekinkozi Ismael Zwane', 'Siphesihle Xaba', 'Albert Mduduzi Zikalala', 'Sandiso Siyaya',
      'Nkosenhle Ndlovu', 'Lennox Banele Ncanazo', 'Sammy Mahlangu', 'Xolani Ngcobo',
      'Melizwe Siyaya', 'Nkosivumile Luphuzi', 'Dumusani Masilela', 'Khanyisani Lembethe',
      'Vincent Nkosi', 'Mlungisi Nkambula', 'Zamani Buthelezi', 'Wonder Innocent Kubheka',
      'Thabani Mpungose', 'Phumlani Simo Mthethwa', 'Jabulani Buthelezi', 'Mandla Frans Khumalo',
      'Sbusiso Samson Kubheka', 'Happy Mashilwane', 'Bongani Mnisi', 'Thulani Victor Magagula',
      'Nhlanhla Mafutha Myeni', 'Wonderful Sandile Qwabe', 'Bheki Zulu', 'Siswe Zwane',
      'Sakhile Freedom Mabaso', 'Thulani Sabelo Simelane', 'Musa Zwane', 'Sipho Nkosi'
    ];

    console.log('Seeding drivers...');
    let driverCount = 0;
    for (const name of drivers) {
      const existing = await client.query('SELECT id FROM fleetlogix_drivers WHERE tenant_id = $1 AND name = $2', [tenantId, name]);
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO fleetlogix_drivers (tenant_id, name, status, salary_period)
          VALUES ($1, $2, 'active', 'monthly')
        `, [tenantId, name]);
        driverCount++;
      }
    }
    console.log(`Inserted ${driverCount} drivers`);

    // Seed sample loads
    const allDrivers = await client.query('SELECT id FROM fleetlogix_drivers WHERE tenant_id = $1', [tenantId]);
    const allVehicles = await client.query('SELECT id FROM fleetlogix_vehicles WHERE tenant_id = $1', [tenantId]);
    const allRoutes = await client.query('SELECT id FROM fleetlogix_routes WHERE tenant_id = $1', [tenantId]);

    if (allDrivers.rows.length > 0 && allVehicles.rows.length > 0 && allRoutes.rows.length > 0) {
      console.log('Seeding loads...');
      let loadCount = 0;
      for (let i = 0; i < Math.min(30, allDrivers.rows.length); i++) {
        const loadDate = new Date();
        loadDate.setDate(loadDate.getDate() - i);
        const dateStr = loadDate.toISOString().split('T')[0];
        const loadNumber = `LOAD-${dateStr}-${i + 1}`;
        
        const existing = await client.query('SELECT id FROM fleetlogix_loads WHERE tenant_id = $1 AND load_number = $2', [tenantId, loadNumber]);
        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO fleetlogix_loads (tenant_id, load_number, driver_id, vehicle_id, route_id, load_date, weight, revenue, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'delivered')
          `, [
            tenantId,
            loadNumber,
            allDrivers.rows[i % allDrivers.rows.length].id,
            allVehicles.rows[i % allVehicles.rows.length].id,
            allRoutes.rows[i % allRoutes.rows.length].id,
            dateStr,
            (30 + Math.random() * 10).toFixed(2),
            (80 + Math.random() * 150).toFixed(2)
          ]);
          loadCount++;
        }
      }
      console.log(`Inserted ${loadCount} loads`);
    }

    // Show final counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM fleetlogix_routes WHERE tenant_id = $1) as routes,
        (SELECT COUNT(*) FROM fleetlogix_vehicles WHERE tenant_id = $1) as vehicles,
        (SELECT COUNT(*) FROM fleetlogix_drivers WHERE tenant_id = $1) as drivers,
        (SELECT COUNT(*) FROM fleetlogix_loads WHERE tenant_id = $1) as loads
    `, [tenantId]);

    console.log('\n=== Migration and Seeding Complete ===');
    console.log(`Tenant ID: ${tenantId}`);
    console.log(`Routes: ${counts.rows[0].routes}`);
    console.log(`Vehicles: ${counts.rows[0].vehicles}`);
    console.log(`Drivers: ${counts.rows[0].drivers}`);
    console.log(`Loads: ${counts.rows[0].loads}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateAndSeed();
