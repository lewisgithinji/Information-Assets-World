-- ============================================================================
-- APPLY GLOBAL COUNTRIES EXPANSION
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/editor
-- ============================================================================
-- This expands countries from 5 to 195 countries worldwide
-- ============================================================================

-- Step 1: Add phone_code column to countries_config
ALTER TABLE public.countries_config
ADD COLUMN IF NOT EXISTS phone_code TEXT;

-- Step 2: Update existing countries with phone codes
UPDATE public.countries_config SET phone_code = '+254' WHERE code = 'KE'; -- Kenya
UPDATE public.countries_config SET phone_code = '+256' WHERE code = 'UG'; -- Uganda
UPDATE public.countries_config SET phone_code = '+255' WHERE code = 'TZ'; -- Tanzania
UPDATE public.countries_config SET phone_code = '+250' WHERE code = 'RW'; -- Rwanda

-- Step 3: Delete "Other" placeholder
DELETE FROM public.countries_config WHERE code = 'XX';

-- Step 4: Insert all 195 countries with phone codes
-- Organized by region for easier management

-- AFRICA (51 countries)
INSERT INTO public.countries_config (name, code, phone_code, display_order, is_active) VALUES
  ('Algeria', 'DZ', '+213', 10, true),
  ('Angola', 'AO', '+244', 11, true),
  ('Benin', 'BJ', '+229', 12, true),
  ('Botswana', 'BW', '+267', 13, true),
  ('Burkina Faso', 'BF', '+226', 14, true),
  ('Burundi', 'BI', '+257', 15, true),
  ('Cabo Verde', 'CV', '+238', 16, true),
  ('Cameroon', 'CM', '+237', 17, true),
  ('Central African Republic', 'CF', '+236', 18, true),
  ('Chad', 'TD', '+235', 19, true),
  ('Comoros', 'KM', '+269', 20, true),
  ('Congo (Brazzaville)', 'CG', '+242', 21, true),
  ('Congo (Kinshasa)', 'CD', '+243', 22, true),
  ('Djibouti', 'DJ', '+253', 23, true),
  ('Egypt', 'EG', '+20', 24, true),
  ('Equatorial Guinea', 'GQ', '+240', 25, true),
  ('Eritrea', 'ER', '+291', 26, true),
  ('Eswatini', 'SZ', '+268', 27, true),
  ('Ethiopia', 'ET', '+251', 28, true),
  ('Gabon', 'GA', '+241', 29, true),
  ('Gambia', 'GM', '+220', 30, true),
  ('Ghana', 'GH', '+233', 31, true),
  ('Guinea', 'GN', '+224', 32, true),
  ('Guinea-Bissau', 'GW', '+245', 33, true),
  ('Ivory Coast', 'CI', '+225', 34, true),
  ('Lesotho', 'LS', '+266', 35, true),
  ('Liberia', 'LR', '+231', 36, true),
  ('Libya', 'LY', '+218', 37, true),
  ('Madagascar', 'MG', '+261', 38, true),
  ('Malawi', 'MW', '+265', 39, true),
  ('Mali', 'ML', '+223', 40, true),
  ('Mauritania', 'MR', '+222', 41, true),
  ('Mauritius', 'MU', '+230', 42, true),
  ('Morocco', 'MA', '+212', 43, true),
  ('Mozambique', 'MZ', '+258', 44, true),
  ('Namibia', 'NA', '+264', 45, true),
  ('Niger', 'NE', '+227', 46, true),
  ('Nigeria', 'NG', '+234', 47, true),
  ('Réunion', 'RE', '+262', 48, true),
  ('São Tomé and Príncipe', 'ST', '+239', 50, true),
  ('Senegal', 'SN', '+221', 51, true),
  ('Seychelles', 'SC', '+248', 52, true),
  ('Sierra Leone', 'SL', '+232', 53, true),
  ('Somalia', 'SO', '+252', 54, true),
  ('South Africa', 'ZA', '+27', 55, true),
  ('South Sudan', 'SS', '+211', 56, true),
  ('Sudan', 'SD', '+249', 57, true),
  ('Togo', 'TG', '+228', 58, true),
  ('Tunisia', 'TN', '+216', 59, true),
  ('Zambia', 'ZM', '+260', 60, true),
  ('Zimbabwe', 'ZW', '+263', 61, true)
ON CONFLICT (name) DO NOTHING;

-- ASIA (50 countries)
INSERT INTO public.countries_config (name, code, phone_code, display_order, is_active) VALUES
  ('Afghanistan', 'AF', '+93', 100, true),
  ('Armenia', 'AM', '+374', 101, true),
  ('Azerbaijan', 'AZ', '+994', 102, true),
  ('Bahrain', 'BH', '+973', 103, true),
  ('Bangladesh', 'BD', '+880', 104, true),
  ('Bhutan', 'BT', '+975', 105, true),
  ('Brunei', 'BN', '+673', 106, true),
  ('Cambodia', 'KH', '+855', 107, true),
  ('China', 'CN', '+86', 108, true),
  ('Georgia', 'GE', '+995', 109, true),
  ('Hong Kong', 'HK', '+852', 110, true),
  ('India', 'IN', '+91', 111, true),
  ('Indonesia', 'ID', '+62', 112, true),
  ('Iran', 'IR', '+98', 113, true),
  ('Iraq', 'IQ', '+964', 114, true),
  ('Israel', 'IL', '+972', 115, true),
  ('Japan', 'JP', '+81', 116, true),
  ('Jordan', 'JO', '+962', 117, true),
  ('Kazakhstan', 'KZ', '+7', 118, true),
  ('Kuwait', 'KW', '+965', 119, true),
  ('Kyrgyzstan', 'KG', '+996', 120, true),
  ('Laos', 'LA', '+856', 121, true),
  ('Lebanon', 'LB', '+961', 122, true),
  ('Macao', 'MO', '+853', 123, true),
  ('Malaysia', 'MY', '+60', 124, true),
  ('Maldives', 'MV', '+960', 125, true),
  ('Mongolia', 'MN', '+976', 126, true),
  ('Myanmar', 'MM', '+95', 127, true),
  ('Nepal', 'NP', '+977', 128, true),
  ('North Korea', 'KP', '+850', 129, true),
  ('Oman', 'OM', '+968', 130, true),
  ('Pakistan', 'PK', '+92', 131, true),
  ('Palestine', 'PS', '+970', 132, true),
  ('Philippines', 'PH', '+63', 133, true),
  ('Qatar', 'QA', '+974', 134, true),
  ('Saudi Arabia', 'SA', '+966', 135, true),
  ('Singapore', 'SG', '+65', 136, true),
  ('South Korea', 'KR', '+82', 137, true),
  ('Sri Lanka', 'LK', '+94', 138, true),
  ('Syria', 'SY', '+963', 139, true),
  ('Taiwan', 'TW', '+886', 140, true),
  ('Tajikistan', 'TJ', '+992', 141, true),
  ('Thailand', 'TH', '+66', 142, true),
  ('Timor-Leste', 'TL', '+670', 143, true),
  ('Turkey', 'TR', '+90', 144, true),
  ('Turkmenistan', 'TM', '+993', 145, true),
  ('United Arab Emirates', 'AE', '+971', 146, true),
  ('Uzbekistan', 'UZ', '+998', 147, true),
  ('Vietnam', 'VN', '+84', 148, true),
  ('Yemen', 'YE', '+967', 149, true)
ON CONFLICT (name) DO NOTHING;

-- EUROPE (46 countries)
INSERT INTO public.countries_config (name, code, phone_code, display_order, is_active) VALUES
  ('Albania', 'AL', '+355', 200, true),
  ('Andorra', 'AD', '+376', 201, true),
  ('Austria', 'AT', '+43', 202, true),
  ('Belarus', 'BY', '+375', 203, true),
  ('Belgium', 'BE', '+32', 204, true),
  ('Bosnia and Herzegovina', 'BA', '+387', 205, true),
  ('Bulgaria', 'BG', '+359', 206, true),
  ('Croatia', 'HR', '+385', 207, true),
  ('Cyprus', 'CY', '+357', 208, true),
  ('Czech Republic', 'CZ', '+420', 209, true),
  ('Denmark', 'DK', '+45', 210, true),
  ('Estonia', 'EE', '+372', 211, true),
  ('Finland', 'FI', '+358', 212, true),
  ('France', 'FR', '+33', 213, true),
  ('Germany', 'DE', '+49', 214, true),
  ('Greece', 'GR', '+30', 215, true),
  ('Hungary', 'HU', '+36', 216, true),
  ('Iceland', 'IS', '+354', 217, true),
  ('Ireland', 'IE', '+353', 218, true),
  ('Italy', 'IT', '+39', 219, true),
  ('Kosovo', 'XK', '+383', 220, true),
  ('Latvia', 'LV', '+371', 221, true),
  ('Liechtenstein', 'LI', '+423', 222, true),
  ('Lithuania', 'LT', '+370', 223, true),
  ('Luxembourg', 'LU', '+352', 224, true),
  ('Malta', 'MT', '+356', 225, true),
  ('Moldova', 'MD', '+373', 226, true),
  ('Monaco', 'MC', '+377', 227, true),
  ('Montenegro', 'ME', '+382', 228, true),
  ('Netherlands', 'NL', '+31', 229, true),
  ('North Macedonia', 'MK', '+389', 230, true),
  ('Norway', 'NO', '+47', 231, true),
  ('Poland', 'PL', '+48', 232, true),
  ('Portugal', 'PT', '+351', 233, true),
  ('Romania', 'RO', '+40', 234, true),
  ('Russia', 'RU', '+7', 235, true),
  ('San Marino', 'SM', '+378', 236, true),
  ('Serbia', 'RS', '+381', 237, true),
  ('Slovakia', 'SK', '+421', 238, true),
  ('Slovenia', 'SI', '+386', 239, true),
  ('Spain', 'ES', '+34', 240, true),
  ('Sweden', 'SE', '+46', 241, true),
  ('Switzerland', 'CH', '+41', 242, true),
  ('Ukraine', 'UA', '+380', 243, true),
  ('United Kingdom', 'GB', '+44', 244, true),
  ('Vatican City', 'VA', '+379', 245, true)
ON CONFLICT (name) DO NOTHING;

-- NORTH AMERICA (23 countries)
INSERT INTO public.countries_config (name, code, phone_code, display_order, is_active) VALUES
  ('Antigua and Barbuda', 'AG', '+1-268', 300, true),
  ('Bahamas', 'BS', '+1-242', 301, true),
  ('Barbados', 'BB', '+1-246', 302, true),
  ('Belize', 'BZ', '+501', 303, true),
  ('Canada', 'CA', '+1', 304, true),
  ('Costa Rica', 'CR', '+506', 305, true),
  ('Cuba', 'CU', '+53', 306, true),
  ('Dominica', 'DM', '+1-767', 307, true),
  ('Dominican Republic', 'DO', '+1-809', 308, true),
  ('El Salvador', 'SV', '+503', 309, true),
  ('Grenada', 'GD', '+1-473', 310, true),
  ('Guatemala', 'GT', '+502', 311, true),
  ('Haiti', 'HT', '+509', 312, true),
  ('Honduras', 'HN', '+504', 313, true),
  ('Jamaica', 'JM', '+1-876', 314, true),
  ('Mexico', 'MX', '+52', 315, true),
  ('Nicaragua', 'NI', '+505', 316, true),
  ('Panama', 'PA', '+507', 317, true),
  ('Saint Kitts and Nevis', 'KN', '+1-869', 318, true),
  ('Saint Lucia', 'LC', '+1-758', 319, true),
  ('Saint Vincent and the Grenadines', 'VC', '+1-784', 320, true),
  ('Trinidad and Tobago', 'TT', '+1-868', 321, true),
  ('United States', 'US', '+1', 322, true)
ON CONFLICT (name) DO NOTHING;

-- SOUTH AMERICA (12 countries)
INSERT INTO public.countries_config (name, code, phone_code, display_order, is_active) VALUES
  ('Argentina', 'AR', '+54', 400, true),
  ('Bolivia', 'BO', '+591', 401, true),
  ('Brazil', 'BR', '+55', 402, true),
  ('Chile', 'CL', '+56', 403, true),
  ('Colombia', 'CO', '+57', 404, true),
  ('Ecuador', 'EC', '+593', 405, true),
  ('Guyana', 'GY', '+592', 406, true),
  ('Paraguay', 'PY', '+595', 407, true),
  ('Peru', 'PE', '+51', 408, true),
  ('Suriname', 'SR', '+597', 409, true),
  ('Uruguay', 'UY', '+598', 410, true),
  ('Venezuela', 'VE', '+58', 411, true)
ON CONFLICT (name) DO NOTHING;

-- OCEANIA (14 countries)
INSERT INTO public.countries_config (name, code, phone_code, display_order, is_active) VALUES
  ('Australia', 'AU', '+61', 500, true),
  ('Fiji', 'FJ', '+679', 501, true),
  ('Kiribati', 'KI', '+686', 502, true),
  ('Marshall Islands', 'MH', '+692', 503, true),
  ('Micronesia', 'FM', '+691', 504, true),
  ('Nauru', 'NR', '+674', 505, true),
  ('New Zealand', 'NZ', '+64', 506, true),
  ('Palau', 'PW', '+680', 507, true),
  ('Papua New Guinea', 'PG', '+675', 508, true),
  ('Samoa', 'WS', '+685', 509, true),
  ('Solomon Islands', 'SB', '+677', 510, true),
  ('Tonga', 'TO', '+676', 511, true),
  ('Tuvalu', 'TV', '+688', 512, true),
  ('Vanuatu', 'VU', '+678', 513, true)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Add comment to phone_code column
COMMENT ON COLUMN public.countries_config.phone_code IS 'International phone dialing code for the country (e.g., +1, +254, +44)';

-- Step 6: Create index on name for faster searching
CREATE INDEX IF NOT EXISTS idx_countries_config_name ON public.countries_config(name);

-- Verification: Count total countries
SELECT COUNT(*) as total_countries FROM public.countries_config WHERE is_active = true;

-- Expected result: ~199 countries (4 existing + 195 new)
