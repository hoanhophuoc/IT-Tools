-- Active: 1744906768140@@it-tools-it-tools-software-design.j.aivencloud.com@24400@defaultdb@public
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
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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