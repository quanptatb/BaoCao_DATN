# 📁 Thư Mục Tài Liệu Kiểm Thử (Test Artifacts)

Thư mục này dùng để lưu trữ các tài liệu kiểm thử dự án tốt nghiệp của thành viên **Đoàn Quốc Khánh (TB01544 - Tester)**.

---

## 📂 Danh mục tài liệu khuyến nghị đặt tại đây:

1. **`KeHoachKiemThu_TestPlan.xlsx` / `.pdf`**: 
   - Kế hoạch kiểm thử tổng thể, phạm vi kiểm thử (Scope), môi trường test (Environment).
   - Lịch trình kiểm thử (Schedule), phân bổ nhân sự và tiêu chí chấp nhận (Pass/Fail criteria).

2. **`DanhSach_TestCase_ChiTiet.xlsx`**:
   - Ma trận test case chi tiết theo từng module:
     - `TC_AUTH`: Xác thực, phân quyền, bảo mật tài khoản.
     - `TC_OKR`: Thiết lập OKR 3 cấp, Key Results, tính % rollup tự động.
     - `TC_KPI`: Vòng đời KPI, phân bổ trọng số, check-in, review queue, xếp hạng S-D.
     - `TC_KANBAN`: Quản lý dự án, kéo thả 6 cột, liên kết KPI/OKR.
     - `TC_AI`: AI Chat, Gợi ý KPI, Goal Planning, Check-in Evaluator, Smart Alerts.
     - `TC_SECURITY`: Row-Level Security SQL Server, Multi-tenancy isolation, chống leo thang quyền.
     - `TC_PERF_UI`: Responsive, tốc độ tải trang, export Excel.

3. **`BaoCao_BugLog_DefectReport.xlsx`**:
   - Bảng theo dõi lỗi phát hiện, phân loại mức độ (Critical, High, Medium, Low), trạng thái xử lý (Fixed / Verified / Closed).

---

## 🔗 Liên kết trực tuyến (Google Sheets)

Nếu bạn sử dụng Google Sheets trực tuyến để hội đồng hoặc GVHD xem trực tiếp:
- Mở file `docs/datn-slides/index.html`
- Tìm và thay thế `{{GOOGLE_SHEETS_TEST_PLAN_URL}}` bằng đường link Test Plan Google Sheets.
- Tìm và thay thế `{{GOOGLE_SHEETS_TESTCASE_URL}}` bằng đường link Test Case Google Sheets.
