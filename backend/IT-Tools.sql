CREATE TABLE "category" (
  "category_id" serial PRIMARY KEY,
  "name" varchar(30) UNIQUE NOT NULL
);
COMMENT ON TABLE "category" IS 'Bảng lưu trữ các danh mục công cụ';
COMMENT ON COLUMN "category"."category_id" IS 'ID định danh duy nhất cho mỗi danh mục';
COMMENT ON COLUMN "category"."name" IS 'Tên của danh mục, phải là duy nhất';

CREATE TABLE "tool" (
  "tool_id" serial PRIMARY KEY,
  "name" varchar(50) NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "category_id" int,
  "is_enabled" bool NOT NULL DEFAULT true,
  "is_premium" bool NOT NULL DEFAULT false,
  "component_url" VARCHAR(100) NOT NULL UNIQUE, -- Đường dẫn đến component ReactJS
  "icon" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "slug" VARCHAR(100) NOT NULL UNIQUE -- Đường dẫn thân thiện với SEO
);
COMMENT ON TABLE "tool" IS 'Bảng lưu trữ thông tin về các công cụ IT';
COMMENT ON COLUMN "tool"."tool_id" IS 'ID định danh duy nhất cho mỗi công cụ';
COMMENT ON COLUMN "tool"."name" IS 'Tên của công cụ, phải là duy nhất';
COMMENT ON COLUMN "tool"."description" IS 'Mô tả chi tiết về công cụ';
COMMENT ON COLUMN "tool"."category_id" IS 'Khóa ngoại liên kết đến bảng category';
COMMENT ON COLUMN "tool"."is_enabled" IS 'Trạng thái kích hoạt của công cụ (true: hoạt động, false: không hoạt động)';
COMMENT ON COLUMN "tool"."is_premium" IS 'Đánh dấu công cụ có phải là premium hay không (true: premium, false: miễn phí)';
COMMENT ON COLUMN "tool"."component_url" IS 'Đường dẫn tới component ReactJS tương ứng với công cụ, phải là duy nhất';
COMMENT ON COLUMN "tool"."icon" IS 'Tên hoặc đường dẫn đến icon của công cụ';
COMMENT ON COLUMN "tool"."created_at" IS 'Thời gian tạo công cụ';
COMMENT ON COLUMN "tool"."slug" IS 'Đường dẫn thân thiện với SEO, phải là duy nhất';

CREATE TABLE "user" (
  "user_id" serial PRIMARY KEY,
  "username" varchar(100) NOT NULL UNIQUE,
  "password" VARCHAR(72) NOT NULL, -- hashed password by bcrypt
  "role" varchar(10) NOT NULL DEFAULT 'User', -- User, Premium, Admin
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "user" IS 'Bảng lưu trữ thông tin người dùng';
COMMENT ON COLUMN "user"."user_id" IS 'ID định danh duy nhất cho mỗi người dùng';
COMMENT ON COLUMN "user"."username" IS 'Tên đăng nhập của người dùng, phải là duy nhất';
COMMENT ON COLUMN "user"."password" IS 'Mật khẩu đã được mã hóa của người dùng';
COMMENT ON COLUMN "user"."role" IS 'Vai trò của người dùng (User, Premium, Admin)';
COMMENT ON COLUMN "user"."created_at" IS 'Thời gian tạo tài khoản người dùng';

CREATE TABLE "favorite_tool" (
  "favorite_id" serial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "tool_id" integer NOT NULL
);
COMMENT ON TABLE "favorite_tool" IS 'Bảng lưu trữ các công cụ yêu thích của người dùng';
COMMENT ON COLUMN "favorite_tool"."favorite_id" IS 'ID định danh duy nhất cho mỗi mục yêu thích';
COMMENT ON COLUMN "favorite_tool"."user_id" IS 'Khóa ngoại liên kết đến bảng user';
COMMENT ON COLUMN "favorite_tool"."tool_id" IS 'Khóa ngoại liên kết đến bảng tool';

CREATE TABLE "upgrade_request" (
  "request_id" serial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
  "requested_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "upgrade_request" IS 'Bảng lưu trữ các yêu cầu nâng cấp tài khoản lên Premium';
COMMENT ON COLUMN "upgrade_request"."request_id" IS 'ID định danh duy nhất cho mỗi yêu cầu';
COMMENT ON COLUMN "upgrade_request"."user_id" IS 'Khóa ngoại liên kết đến bảng user';
COMMENT ON COLUMN "upgrade_request"."status" IS 'Trạng thái của yêu cầu (Pending, Approved, Rejected)';
COMMENT ON COLUMN "upgrade_request"."requested_at" IS 'Thời gian gửi yêu cầu';

ALTER TABLE "tool" ADD FOREIGN KEY ("category_id") REFERENCES "category" ("category_id");

ALTER TABLE "favorite_tool" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("user_id");

ALTER TABLE "favorite_tool" ADD FOREIGN KEY ("tool_id") REFERENCES "tool" ("tool_id");

ALTER TABLE "upgrade_request" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("user_id");

-- Index cần thiết
CREATE INDEX idx_users_role ON "user"(role);
COMMENT ON INDEX idx_users_role IS 'Index trên cột role của bảng user để tăng tốc độ truy vấn theo vai trò';
CREATE INDEX idx_tools_is_enabled ON tool(is_enabled);
COMMENT ON INDEX idx_tools_is_enabled IS 'Index trên cột is_enabled của bảng tool để tăng tốc độ lọc công cụ theo trạng thái';
CREATE UNIQUE INDEX idx_tool_slug ON "tool"(slug);
COMMENT ON INDEX idx_tool_slug IS 'Index trên cột slug của bảng tool để tăng tốc độ truy vấn theo đường dẫn thân thiện với SEO';
CREATE INDEX idx_userfavoritetools_user ON favorite_tool(user_id);
COMMENT ON INDEX idx_userfavoritetools_user IS 'Index trên cột user_id của bảng favorite_tool để tăng tốc độ truy vấn công cụ yêu thích của người dùng';

-- Seed data for categories
INSERT INTO "category" ("category_id", "name") VALUES
(1, 'Converter'),
(2, 'Crypto'),
(3, 'Data'),
(4, 'Development'),
(5, 'Images & Videos'),
(6, 'Math'),
(7, 'Measurement'),
(8, 'Network'),
(9, 'Text'),
(10, 'Web')
ON CONFLICT ("category_id") DO NOTHING;

-- Reset sequence for category
SELECT setval(pg_get_serial_sequence('category', 'category_id'), COALESCE(MAX(category_id), 1)) FROM "category";

-- Seed data for tools
INSERT INTO "tool" ("name", "description", "category_id", "is_enabled", "is_premium", "component_url", "icon", "slug") VALUES
('Case Converter', 'Convert string between camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, etc.', 1, true, false, 'tools/converter/CaseConverter.jsx', 'case-converter.svg', 'case-converter'),
('Color Converter', 'Convert color formats between HEX, RGB, HSL, and HSV.', 1, true, false, 'tools/converter/ColorConverter.jsx', 'color-converter.svg', 'color-converter'),
('Integer Base Converter', 'Convert numbers between binary, octal, decimal, hexadecimal, and custom bases.', 1, true, false, 'tools/converter/IntegerBaseConverter.jsx', 'integer-base-converter.svg', 'integer-base-converter'),
('Hash Text', 'Hash text using MD5, SHA-1, SHA-256, SHA-512, and other cryptographic hash algorithms.', 2, true, false, 'tools/cryto/HashText.jsx', 'hash-text.svg', 'hash-text'),
('Password Strength Analyser', 'Analyze password strength, crack time estimation, entropy, and complexity.', 2, true, false, 'tools/cryto/PasswordStrengthAnalyser.jsx', 'password-strength-analyser.svg', 'password-strength-analyser'),
('ULID Generator', 'Generate Universally Unique Lexicographically Sortable Identifiers (ULID).', 2, true, false, 'tools/cryto/ULIDGenerator.jsx', 'ulid-generator.svg', 'ulid-generator'),
('IBAN Validator & Parser', 'Validate and parse International Bank Account Numbers (IBAN).', 3, true, false, 'tools/data/IbanValidatorParser.jsx', 'iban-validator-parser.svg', 'iban-validator-parser'),
('Phone Parser & Formatter', 'Parse, validate, and format international telephone numbers.', 3, true, false, 'tools/data/PhoneParserFormatter.jsx', 'phone-parser-formatter.svg', 'phone-parser-formatter'),
('JSON Minify', 'Minify JSON text by removing whitespace and comments.', 4, true, false, 'tools/development/JsonMinify.jsx', 'json-minify.svg', 'json-minify'),
('JSON Prettify', 'Prettify and format JSON data with customizable indentation.', 4, true, false, 'tools/development/JsonPrettify.jsx', 'json-minify.svg', 'json-prettify'),
('Random Port Generator', 'Generate random non-standard ports outside typical reserved ranges.', 4, true, false, 'tools/development/RandomPortGenerator.jsx', 'random-port-generator.svg', 'random-port-generator'),
('QR Code Generator', 'Generate customizable QR codes for text, URLs, and contacts.', 5, true, false, 'tools/images & videos/QrCodeGenerator.jsx', 'qrcode.svg', 'qr-code-generator'),
('SVG Placeholder Generator', 'Generate SVG placeholder images with custom dimensions and colors.', 5, true, false, 'tools/images & videos/SvgPlaceholderGenerator.jsx', 'svg-placeholder-generator.svg', 'svg-placeholder-generator'),
('WiFi QR Code Generator', 'Generate QR codes to quickly connect mobile devices to WiFi networks.', 5, true, false, 'tools/images & videos/WifiQrCodeGenerator.jsx', 'qrcode.svg', 'wifi-qr-code-generator'),
('ETA Calculator', 'Calculate estimated completion time and progress rate.', 6, true, false, 'tools/math/EtaCalculator.jsx', 'eta-calculator.svg', 'eta-calculator'),
('Math Evaluator', 'Evaluate complex mathematical expressions and formulas.', 6, true, false, 'tools/math/MathEvaluator.jsx', 'math-evaluator.svg', 'math-evaluator'),
('Percentage Calculator', 'Calculate percentage increases, decreases, fractions, and proportions.', 6, true, false, 'tools/math/PercentageCalculator.jsx', 'percentage-calculator.svg', 'percentage-calculator'),
('Chronometer', 'Accurate digital stopwatch with lap recording and split times.', 7, true, false, 'tools/measurement/Chronometer.jsx', 'chronometer.svg', 'chronometer'),
('Data Size Converter', 'Convert data storage units between bytes, KB, MB, GB, TB, and petabytes.', 7, true, false, 'tools/measurement/DataSize.jsx', 'data-size.svg', 'data-size'),
('Temperature Converter', 'Convert temperatures between Celsius, Fahrenheit, Kelvin, and Rankine.', 7, true, false, 'tools/measurement/Temperature.jsx', 'temperature.svg', 'temperature'),
('IPv4 Address Converter', 'Convert IPv4 addresses between decimal, binary, octal, and hexadecimal.', 8, true, false, 'tools/network/Ipv4AddressConverter.jsx', 'ipv4-address-converter.svg', 'ipv4-address-converter'),
('IPv4 Range Expander', 'Expand CIDR subnets and calculate IP address ranges, masks, and hosts.', 8, true, false, 'tools/network/Ipv4RangeExpander.jsx', 'ipv4-range-expander.svg', 'ipv4-range-expander'),
('MAC Address Lookup', 'Lookup vendor and manufacturer information from MAC addresses (OUI).', 8, true, false, 'tools/network/MacAddressLookup.jsx', 'mac-address-lookup.svg', 'mac-address-lookup'),
('Lorem Ipsum Generator', 'Generate placeholder text with paragraphs, sentences, and words.', 9, true, false, 'tools/text/LoremIpsumGenerator.jsx', 'lorem-ipsum-generator.svg', 'lorem-ipsum-generator'),
('String Obfuscator', 'Obfuscate text strings into encoded representations.', 9, true, false, 'tools/text/StringObfuscator.jsx', 'text-statistics.svg', 'string-obfuscator'),
('Text Statistics', 'Analyze text character count, word count, lines, paragraphs, and reading time.', 9, true, false, 'tools/text/TextStatistics.jsx', 'text-statistics.svg', 'text-statistics'),
('HTML Entities Encoder/Decoder', 'Encode and decode special HTML characters and entities.', 10, true, false, 'tools/web/HtmlEntitiesEncoder.jsx', 'html-entities-encoder.svg', 'html-entities-encoder'),
('Keycode Info', 'Inspect JavaScript event key codes, keys, and event properties on press.', 10, true, false, 'tools/web/KeycodeInfo.jsx', 'keycode-info.svg', 'keycode-info'),
('Slugify String', 'Convert strings into clean, SEO-friendly URL slugs.', 10, true, false, 'tools/web/SlugifyString.jsx', 'slugify-string.svg', 'slugify-string'),
('URL Encoder/Decoder', 'Encode and decode URLs and query parameters.', 10, true, false, 'tools/web/UrlEncoderDecoder.jsx', 'url-encoder-decoder.svg', 'url-encoder-decoder')
ON CONFLICT ("slug") DO NOTHING;

-- Reset sequence for tool
SELECT setval(pg_get_serial_sequence('tool', 'tool_id'), COALESCE(MAX(tool_id), 1)) FROM "tool";

-- Seed default admin account (username: admin, password: AdminPassword123!)
INSERT INTO "user" ("username", "password", "role") VALUES
('admin', '$2a$11$lQjDMLdJOdMmDbrVtrEAUuJD8KNns9sE1Vy8GHy85FIPYVW1Wape2', 'Admin')
ON CONFLICT ("username") DO NOTHING;

-- Reset sequence for user
SELECT setval(pg_get_serial_sequence('user', 'user_id'), COALESCE(MAX(user_id), 1)) FROM "user";