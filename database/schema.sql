DROP TABLE IF EXISTS alerts CASCADE;

DROP TABLE IF EXISTS measurements CASCADE;

DROP TABLE IF EXISTS pollutants CASCADE;

DROP TABLE IF EXISTS locations CASCADE;

DROP TABLE IF EXISTS etl_logs CASCADE;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pollutants (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    description TEXT
);

CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations (id) ON DELETE CASCADE,
    pollutant_id INTEGER NOT NULL REFERENCES pollutants (id) ON DELETE CASCADE,
    value DECIMAL(10, 2) NOT NULL,
    measured_at TIMESTAMP NOT NULL,
    source VARCHAR(100) DEFAULT 'Simulated Data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_measurement UNIQUE (
        location_id,
        pollutant_id,
        measured_at
    )
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations (id) ON DELETE CASCADE,
    measurement_id INTEGER REFERENCES measurements (id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE etl_logs (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100),
    status VARCHAR(50),
    records_processed INTEGER DEFAULT 0,
    message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_measurements_location_time ON measurements (location_id, measured_at);

CREATE INDEX idx_measurements_pollutant_time ON measurements (pollutant_id, measured_at);

CREATE INDEX idx_measurements_time ON measurements (measured_at);

INSERT INTO
    locations (
        city,
        state,
        country,
        latitude,
        longitude
    )
VALUES (
        'Delhi',
        'Delhi',
        'India',
        28.6139,
        77.2090
    ),
    (
        'Mumbai',
        'Maharashtra',
        'India',
        19.0760,
        72.8777
    ),
    (
        'Bengaluru',
        'Karnataka',
        'India',
        12.9716,
        77.5946
    ),
    (
        'Guwahati',
        'Assam',
        'India',
        26.1445,
        91.7362
    ),
    (
        'Kolkata',
        'West Bengal',
        'India',
        22.5726,
        88.3639
    );

INSERT INTO
    pollutants (code, name, unit, description)
VALUES (
        'AQI',
        'Air Quality Index',
        'index',
        'Overall air quality index'
    ),
    (
        'PM2.5',
        'Particulate Matter 2.5',
        'µg/m³',
        'Fine particulate matter'
    ),
    (
        'PM10',
        'Particulate Matter 10',
        'µg/m³',
        'Coarse particulate matter'
    ),
    (
        'CO',
        'Carbon Monoxide',
        'mg/m³',
        'Carbon monoxide concentration'
    ),
    (
        'NO2',
        'Nitrogen Dioxide',
        'µg/m³',
        'Nitrogen dioxide concentration'
    ),
    (
        'SO2',
        'Sulfur Dioxide',
        'µg/m³',
        'Sulfur dioxide concentration'
    ),
    (
        'O3',
        'Ozone',
        'µg/m³',
        'Ground-level ozone concentration'
    ),
    (
        'TEMP',
        'Temperature',
        '°C',
        'Temperature reading'
    ),
    (
        'HUMIDITY',
        'Humidity',
        '%',
        'Relative humidity'
    );