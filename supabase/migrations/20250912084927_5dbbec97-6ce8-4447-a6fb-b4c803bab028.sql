-- Add sample office data to populate the system
INSERT INTO public.offices (region, city, country, address, email, phone, latitude, longitude, status) VALUES 
  -- North America
  ('North America', 'New York', 'United States', '123 Wall Street, New York, NY 10005', 'ny@example.com', '+1-212-555-0100', 40.7074, -74.0113, 'active'),
  ('North America', 'San Francisco', 'United States', '456 Market Street, San Francisco, CA 94102', 'sf@example.com', '+1-415-555-0200', 37.7749, -122.4194, 'active'),
  ('North America', 'Toronto', 'Canada', '789 Bay Street, Toronto, ON M5G 2C8', 'toronto@example.com', '+1-416-555-0300', 43.6532, -79.3832, 'active'),
  
  -- Europe
  ('Europe', 'London', 'United Kingdom', '10 Downing Street, London SW1A 2AA', 'london@example.com', '+44-20-7946-0958', 51.5074, -0.1278, 'active'),
  ('Europe', 'Paris', 'France', '1 Place Vendôme, 75001 Paris', 'paris@example.com', '+33-1-42-86-87-88', 48.8566, 2.3522, 'active'),
  ('Europe', 'Berlin', 'Germany', 'Unter den Linden 77, 10117 Berlin', 'berlin@example.com', '+49-30-227-755-0', 52.5200, 13.4050, 'active'),
  
  -- Asia Pacific
  ('Asia Pacific', 'Tokyo', 'Japan', '1-1-1 Kasumigaseki, Chiyoda City, Tokyo 100-8926', 'tokyo@example.com', '+81-3-3581-5471', 35.6762, 139.6503, 'active'),
  ('Asia Pacific', 'Singapore', 'Singapore', '1 Raffles Place, Singapore 048616', 'singapore@example.com', '+65-6225-5632', 1.2844, 103.8607, 'active'),
  ('Asia Pacific', 'Sydney', 'Australia', '1 Martin Place, Sydney NSW 2000', 'sydney@example.com', '+61-2-9373-9000', -33.8688, 151.2093, 'active'),
  
  -- Latin America
  ('Latin America', 'São Paulo', 'Brazil', 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100', 'saopaulo@example.com', '+55-11-3251-2222', -23.5558, -46.6396, 'active'),
  ('Latin America', 'Mexico City', 'Mexico', 'Paseo de la Reforma 222, Juárez, 06600 Ciudad de México', 'mexicocity@example.com', '+52-55-5080-2000', 19.4326, -99.1332, 'active')
ON CONFLICT DO NOTHING;