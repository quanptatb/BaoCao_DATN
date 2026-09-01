# 🎓 Hướng Dẫn Sử Dụng Bộ Slide Thuyết Trình Báo Cáo DATN (FPT Polytechnic)

Bộ slide HTML 16:9 chuẩn học đường FPT Polytechnic (Theme cam `#F37021` + trắng) phục vụ báo cáo bảo vệ dự án tốt nghiệp 30 phút cho **Nhóm VietMach (7 thành viên)**.

---

## 🚀 Cách mở và trình chiếu

1. **Mở trực tiếp:**
   - Nhấp đúp chuột vào file `index.html` hoặc chuột phải chọn mở bằng **Google Chrome**, **Microsoft Edge**, hoặc **Brave**.
   - Không cần cài đặt web server (chạy hoàn toàn offline).

2. **Chế độ trình chiếu toàn màn hình:**
   - Nhấn phím `F` để bật/tắt chế độ toàn màn hình (Fullscreen).
   - Tỷ lệ khung hình hiển thị chuẩn 16:9 (1920x1080) và tự động co giãn theo kích thước màn hình máy chiếu/laptop.

---

## ⌨️ Bảng phím tắt điều khiển

| Phím tắt | Chức năng |
|---|---|
| `→` hoặc `Space` | Chuyển sang slide tiếp theo |
| `←` | Quay lại slide trước |
| `Home` | Về slide trang bìa đầu tiên |
| `End` | Nhảy đến slide cảm ơn cuối cùng |
| `F` | Bật / Tắt chế độ Fullscreen |
| `T` | Tạm dừng (Pause) / Tiếp tục (Resume) đồng hồ đếm ngược |
| `R` | Đặt lại đồng hồ đếm ngược về `30:00` |
| `N` | Bật / Tắt gợi ý kịch bản nói (Presenter Notes) ở góc dưới màn hình |
| `V` | Phát (Play) / Tạm dừng (Pause) video demo (tại slide Video) |
| `H` hoặc `?` | Hiển thị bảng trợ giúp phím tắt |
| `Esc` | Đóng bảng trợ giúp phím tắt |

---

## 👥 Phân chia thứ tự trình bày (7 thành viên - 30 phút)

| Phần | Nội dung | Thành viên phụ trách | Slide |
|---|---|---|---|
| **Phần 1: Mở đầu** (~5 phút) | Đề tài, thành viên, mục lục, thực trạng, yêu cầu, hướng giải quyết, mục tiêu, sứ mệnh, định hướng | **Phạm Trần Anh Quân** (Leader / AI) | Slide 1 → 8 |
| **Phần 2: AI Nổi bật** (~5 phút) | Kiến trúc AI-Native, so sánh trước/sau, AI Chat, Gợi ý KPI, Goal Planning, Check-in Evaluator, Smart Alerts, RAG Pipeline | **Phạm Trần Anh Quân** & **Trần Thanh Phong** | Slide 9 → 15 |
| **Phần 3: KPI / OKR** (~6 phút) | Giao diện OKR đa cấp, Dashboard KPI, Check-in & Review Queue, Đánh giá 7 bậc, So sánh trước/sau, State Machine, RBAC & RLS SQL | **Bùi Nguyễn Anh Như** (Frontend) & **Phạm Trần An An** (Backend) | Slide 16 → 22 |
| **Phần 4: Vận hành** (~5 phút) | Giao diện Kanban 6 cột, Quản lý dự án, So sánh trước/sau, Liên kết Task ↔ KPI/OKR, Bình luận & History Log | **Vũ Hoàng Huy Nhật** (Frontend) & **Nguyễn Thế Bảo** (Backend) | Slide 23 → 27 |
| **Phần 5: Danh mục & SEO** (~3 phút) | Quản lý danh mục động, Multi-tenant SaaS, Cá nhân hóa branding, Tối ưu SEO On-page, Sitemap & Robots | **Trần Thanh Phong** (Fullstack) | Slide 28 → 30 |
| **Phần 6: Kiểm thử** (~3 phút) | Quy trình test, Thống kê 84 test suites, Ma trận kiểm thử, Đường dẫn Test Plan & Test Case | **Đoàn Quốc Khánh** (Tester) | Slide 31 → 34 |
| **Phần 7: Tổng kết** (~3 phút) | Kiến trúc MVC + AI Service, Kết quả đạt được, Hạn chế & Bài học, Video Demo, Cảm ơn & Hỏi đáp | **Phạm Trần Anh Quân** (Leader) | Slide 35 → 39 |

---

## 🎬 Video Demo & Link tùy chỉnh

1. **Video Demo:**
   - Copy file video demo của bạn vào thư mục `docs/datn-slides/assets/demo.mp4`.
   - Hoặc khi đang trình chiếu tại Slide 38, bấm nút **"📂 Import Video Demo"** để chọn file video trực tiếp từ máy tính.
2. **Link Test Plan & Test Cases (Google Sheets):**
   - Mở file `index.html`, tìm kiếm `{{GOOGLE_SHEETS_TEST_PLAN_URL}}` và `{{GOOGLE_SHEETS_TESTCASE_URL}}` để dán link tài liệu online của bạn vào.
3. **Thư mục chứa file test offline:**
   - Đặt file test plan/testcase vào thư mục `docs/datn-slides/test-artifacts/`.
# BaoCao_DATN
