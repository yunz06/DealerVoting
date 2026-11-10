# DEALERS VOTING — deploy-ready Next.js app

Hệ thống bình chọn nội bộ chạy online. Sau khi triển khai, website, xử lý đăng nhập và database đều chạy trên hạ tầng cloud; máy cá nhân không cần bật để người khác sử dụng.

## Công nghệ

- Next.js 15 App Router + TypeScript + React 19
- Netlify Functions thông qua Next.js adapter
- PostgreSQL managed database trên Netlify
- Prisma ORM 6 + Prisma Migrate
- Auth.js Credentials + bcryptjs
- Logo gốc giữ nguyên tại `public/dealers-logo.png`

## Phân quyền

- **OWNER**: quản lý Admin, Member, cuộc vote, xem kết quả tổng hợp và danh tính/lựa chọn từng phiếu, xem nhật ký.
- **ADMIN**: quản lý Member và cuộc vote, xem kết quả; không được quản lý Admin hoặc Owner.
- **MEMBER**: tham gia bình chọn, chỉ xem trạng thái đã/chưa tham gia; không có API/trang hiển thị kết quả.

Mỗi tài khoản chỉ bỏ được một phiếu cho mỗi cuộc bình chọn. Cơ sở dữ liệu có unique constraint `Vote(pollId, userId)` và ràng buộc để lựa chọn thuộc đúng cuộc vote. Phiếu không ẩn danh với Owner/Admin; giao diện thông báo điều này trước khi gửi phiếu.

## Triển khai production trên Netlify

### 1. Đưa source lên GitHub

1. Giải nén project.
2. Tạo repository GitHub mới và upload toàn bộ nội dung thư mục project lên repository (không upload `.env`, `node_modules` hoặc `.next`).
3. Giữ nguyên `netlify.toml`; Netlify sẽ nhận diện Next.js và dùng adapter chính thức.

### 2. Tạo PostgreSQL trên Netlify

1. Trong Netlify, mở site/team cần triển khai.
2. Vào **Data & Storage → Database** và tạo Netlify Database (PostgreSQL). Tính năng này phụ thuộc loại gói/credits của Netlify.
3. Lấy connection string PostgreSQL của database.
4. Trong **Site configuration → Environment variables**, tạo biến `DATABASE_URL` và dán connection string đó vào. Bật SSL theo connection string do Netlify cung cấp; không tự sửa host, port hay mật khẩu.

> Project hiện dùng Prisma 6 và đọc `DATABASE_URL`. Vì vậy, hãy đưa connection string PostgreSQL của Netlify vào đúng biến `DATABASE_URL`. Không commit connection string vào GitHub.

### 3. Cấu hình Environment Variables

Trong Netlify → Site configuration → Environment variables, thêm:

| Key | Value |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL lấy từ Netlify Database |
| `AUTH_SECRET` | Chuỗi ngẫu nhiên mạnh, tối thiểu 32 bytes |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | URL HTTPS chính thức của site Netlify |
| `OWNER_USERNAME` | `dealeradm` |
| `OWNER_PASSWORD` | Mật khẩu riêng, tối thiểu 12 ký tự |
| `OWNER_DISPLAY_NAME` | `RK` |

**Lưu ý về mật khẩu Owner:** mật khẩu được cung cấp trong yêu cầu ban đầu ngắn hơn mức tối thiểu 12 ký tự nên seed sẽ từ chối tạo tài khoản bằng mật khẩu đó. Hãy đặt một mật khẩu dài hơn, riêng biệt và khó đoán trong Netlify Environment Variables. Mật khẩu không được ghi vào source code, README hoặc GitHub.

Có thể tạo `AUTH_SECRET` bằng trình tạo mật khẩu ngẫu nhiên đáng tin cậy hoặc lệnh `openssl rand -base64 48`; chỉ lưu kết quả trong Netlify Environment Variables.

### 4. Kết nối repository và deploy

1. Netlify → **Add new site → Import an existing project**.
2. Chọn GitHub và repository vừa upload.
3. Build command: `npm run build`. Netlify config đã đặt sẵn lệnh này trong `netlify.toml`.
4. Chọn Node.js 20 (đã khai báo trong `netlify.toml`).
5. Deploy.

Trong lần build đầu, project tự chạy `prisma migrate deploy`, sau đó seed tài khoản Owner nếu database chưa có Owner, rồi build Next.js. Khi đã tạo Owner thành công, có thể xóa `OWNER_PASSWORD` khỏi Netlify Environment Variables; các lần build sau sẽ tự bỏ qua bước tạo Owner nếu Owner đã tồn tại. Không xóa `DATABASE_URL` hoặc `AUTH_SECRET`.

### 5. Đăng nhập và sử dụng

- Mở URL HTTPS của site Netlify.
- Đăng nhập bằng username `dealeradm` và mật khẩu Owner đã đặt ở bước 3.
- Owner vào **Admin accounts** để tạo Admin phụ.
- Admin tạo Member và cuộc bình chọn.

## Chạy thử trên máy (không bắt buộc khi website đã deploy)

Chỉ dùng khi muốn phát triển hoặc kiểm tra source. Cần Node.js 20+, PostgreSQL và file `.env` cục bộ.

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Database và migration

- Schema: `prisma/schema.prisma`
- Migration ban đầu: `prisma/migrations/20261110000000_init/migration.sql`
- Mỗi thay đổi schema sau này cần tạo migration mới bằng `npx prisma migrate dev --name ten_thay_doi`, commit thư mục migration lên Git; production tự áp dụng migration bằng `prisma migrate deploy` khi build.
- Không dùng `prisma db push` cho database production.

## Bảo mật và giới hạn hiện tại

- `.env` và `.env.*` bị loại khỏi Git; chỉ `.env.example` được commit.
- Password được hash bằng bcrypt; không lưu mật khẩu dạng rõ trong database.
- Kiểm tra quyền được thực hiện phía server cho các trang và Server Actions. Tài khoản bị vô hiệu hóa sẽ bị chặn khi truy cập tiếp theo.
- Audit log ghi các hành động quản trị quan trọng và lần truy cập kết quả có danh tính.
- Cần bật backup/retention cho PostgreSQL và giữ quyền truy cập Netlify/GitHub an toàn.
- Chưa có đổi mật khẩu trong giao diện, quên mật khẩu, CAPTCHA hoặc hệ thống rate-limit đăng nhập chuyên dụng. Vì vậy chỉ chia sẻ URL với thành viên dự kiến, dùng mật khẩu mạnh và không coi bản này là hệ thống bỏ phiếu ẩn danh hoặc hệ thống bầu cử chính thức.
- Source đã được rà soát và sửa các lỗi đã phát hiện, nhưng môi trường hiện tại không có `node_modules`/không thực hiện được build production với dịch vụ PostgreSQL thật. Cần xem deploy Netlify đầu tiên là bước xác minh thực tế; nếu build báo lỗi, gửi log build để xử lý trước khi sử dụng thật.

## Cấu trúc

- `src/app`: giao diện và route pages
- `src/actions`: Server Actions
- `src/auth.ts`: xác thực Credentials
- `src/lib`: Prisma client và kiểm tra quyền
- `prisma/schema.prisma`: 5 bảng dữ liệu
- `prisma/migrations`: migration production
- `public/dealers-logo.png`: logo gốc, giữ nguyên


## V1.3 patch (Netlify build fixes)

- Fixed the malformed `findUnique` call in `src/app/layout.tsx`.
- Fixed the multiline JSX placeholder in `src/app/admin/polls/new/page.tsx`.
- Kept the existing PostgreSQL schema, migration, and Owner bootstrap behavior unchanged.
- This patch addresses the two syntax errors reported by the Netlify build log. A full production build still needs to be confirmed by Netlify after upload.
