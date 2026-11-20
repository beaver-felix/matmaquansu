# STATUS — ĐỌC FILE NÀY ĐẦU TIÊN KHI MỞ MÁY

> **Mục đích:** Giúp người code (dù hôm qua quên sạch mọi thứ) biết trong **30 giây**:
> 1. Game này làm cái gì?
> 2. Đã làm tới đâu rồi?
> 3. Bây giờ mở file nào và gõ cái gì tiếp?

---

## 1. Tóm tắt siêu ngắn (Context 10 giây)
- **Game:** Web-game `Touhou-like (danmaku)` + `Stealth/Navigation` chủ đề **Cơ yếu quân sự Việt Nam (1945–1975)**.
- **Tech stack đã chốt:** `Vite` + `TypeScript` + `PixiJS` (WebGL), dùng **`pnpm`** (KHÔNG dùng `npm`). Node runtime (`26.13.1`) đã tự cấu hình trong `package.json -> devEngines`.
- **Luật cốt lõi đã chốt:**
  1. Map `2D top-down` đi tự do né mai phục dưới mù thông tin; dính bẫy → màn giao tranh siêu khó (Tutorial kiểu Souls-like thua vẫn đi tiếp, thắng +1 Max HP vĩnh viễn; màn thường thua = Game Over chơi lại vùng; thắng = **bắt buộc bắn cạn HP địch**).
  2. 5 Vùng & 5 Xe nâng cấp tự động: `V1 Pháp (Xe đạp)` → `V2 Pháp++ (Xe đạp thồ)` → `V3 Ngụy (Bốn bánh)` → `V4 Mỹ (Xe tải)` → `V5 Ngụy-- Sài Gòn (Max Xe tăng + Max 4 kĩ năng)`.
  3. **Hitbox khớp đúng kích thước thân xe** (xe to lên → né khó hơn, bù bằng HP + hỏa lực + kĩ năng cơ yếu).
  4. Rời mỗi vùng hiện modal 2 cột (cốt truyện + chọn 1 kĩ năng cơ yếu chạy theo `interval`); vật phẩm lịch sử rơi trên cả map lẫn combat hiện dialog **không chắn tầm nhìn, không khóa điều khiển** theo **1 timeline chung 1945–1975**.
  5. Kết thúc: Xe tăng húc đổ cổng Dinh Độc Lập → `end_game` cutscene → `after_credit` (Cơ yếu thời đại số).
- **Chi tiết đầy đủ:** Xem [docs/GAME_SPEC.md](./docs/GAME_SPEC.md).

---

## 2. Trạng thái hiện tại (ĐANG Ở ĐÂY)

- **Giai đoạn hiện tại:** `Phase 8 — Hoàn tất toàn bộ mã nguồn & build sạch; còn playtest trực tiếp trên trình duyệt`
- **Tiến độ tổng thể:** `26 / 27 tasks` (`96%`)
- **Đã hoàn thành:**
  - [x] Toàn bộ Phase 0 (`T0.1–T0.4`): Khởi tạo `Vite + TypeScript + PixiJS` (`pnpm` + Node `26.13.1`), `GameState`, `SceneManager`, `InputManager` (`WASD` + Mobile relative touch drag), `AudioEngine` (Web Audio synth + Morse).
  - [x] Toàn bộ Phase 1 (`T1.1–T1.5`): `vehicles.ts` (5 xe), `skills.ts` (4 kĩ năng), `regions.ts` (5 vùng, 30 ổ bẫy, 15 điểm rơi), `loreTimeline.ts` (15 mốc + toàn bộ cutscenes), `SpriteFactory.ts` (5 xe, địch 5 phe, Cổng Dinh Độc Lập vỡ được).
  - [x] Toàn bộ Phase 2 (`T2.1–T2.2`): `TitleScene` (Scene 0) & `CutsceneScene` tái sử dụng (Scene 1 `INTRO`, Scene 7 `END_GAME`, Scene 8 `AFTER_CREDIT`).
  - [x] Toàn bộ Phase 3 & 4 (`T3.1–T4.3`): `OverworldScene` (5 vùng + Fog of War mượt), `LoreToastUI` (non-blocking), `CryptoSkillSystem` (4 kĩ năng theo `interval` + viền sáng ngoài map + Morse + mod-10 ticker + chế độ MAX ở V5).
  - [x] Toàn bộ Phase 5, 6, 7 (`T5.1–T7.2`): `BulletEngine` (object pool + 5 bộ pattern + laser Mỹ), `CombatScene` (Tutorial Souls-like 2 nhánh + Game Over màn thường), `RegionExitOverlay` (modal 2 cột), cao trào húc đổ cổng Dinh Độc Lập.
  - [x] `T8.2` Build & Invariants: `pnpm typecheck && pnpm build` xanh 0 lỗi (`dist/` built in 8.49s); vượt qua toàn bộ kiểm tra logic tự động qua Vite SSR (`ALL_GAME_INVARIANTS_OK`).
- **Đang làm dở:** `T8.1` — Chưa test bằng Chrome tự động do Chrome DevTools MCP chưa kết nối.

---

## 3. VIỆC TIẾP THEO LÀM NGAY (Next Atomic Step)

> **Task còn lại duy nhất: `T8.1` trong [docs/ROADMAP.md](./docs/ROADMAP.md#phase-8-kiểm-thử-toàn-diện-cân-bằng--polish)**

1. **Làm gì:** Mở trình duyệt tại `http://localhost:5173/` (chạy `pnpm dev` nếu chưa bật) và chơi thử trọn vẹn Scene 0 → Scene 8 trên PC (`WASD`) và chế độ Mobile DevTools (`390×844` touch).
2. **Kiểm tra cảm giác chơi:**
   - Độ khó Tutorial Souls-like (có đủ khó nhưng vẫn né được?) & đường cong `Pháp < Pháp++ < Ngụy < Mỹ >> Ngụy--`.
   - Cảm giác kéo cảm ứng mobile + độ rõ của dialog lịch sử `LoreToastUI`.
   - Hiệu ứng húc cổng Dinh Độc Lập & nhịp chuyển `end_game` → `after_credit`.
3. **Nếu cần tinh chỉnh số liệu:**
   - Độ khó đạn & tần suất bắn: `src/systems/BulletEngine.ts`, `src/scenes/CombatScene.ts`.
   - Vị trí bẫy & tầm nhìn: `src/data/regions.ts`.
   - Tốc độ/HP/hitbox xe: `src/data/vehicles.ts`.
4. **Xong `T8.1`:** Tick `[x] T8.1` trong [docs/ROADMAP.md](./docs/ROADMAP.md), đổi tiến độ file này thành `27 / 27 tasks (100%)`.

---

## 4. Lệnh chạy nhanh

```bash
pnpm dev        # Chạy local dev server (http://localhost:5173/)
pnpm typecheck  # Kiểm tra lỗi TypeScript (tsc --noEmit)
pnpm build      # Build production kiểm tra bundle
pnpm preview    # Xem thử bản build production
```

---

## 5. Nhật ký phiên làm việc (Session Handoff Log)

> **Quy tắc:** Trước khi nghỉ tay, thêm 1 dòng mới lên đầu bảng. Người mở máy hôm sau chỉ cần đọc dòng trên cùng là nhớ ngay ngữ cảnh.

| Ngày | Đã hoàn thành | Đang dang dở / Lưu ý quan trọng | Việc đầu tiên phiên sau |
| :--- | :--- | :--- | :--- |
| 2026-11-21 (Phiên 14) | Thiết kế lại toàn diện màn hình chính (`src/scenes/TitleScene.ts`, `src/styles.css`): bỏ sạch khung hướng dẫn dài dòng, giữ đúng con dấu đỏ-vàng, tiêu đề serif lớn `MẬT ĐIỆN CƠ YẾU`, nút `BẮT ĐẦU` và 1 dòng phím tắt tối giản trên nền bản đồ địa hình cổ có la bàn xoay & tuyến sóng điện mật Bắc→Nam (`Việt Bắc 1945 → Sài Gòn 1975`) | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest xác nhận cuối cho `T8.1` | Mở `http://localhost:5173/` nghiệm thu màn hình chính & chốt `[x] T8.1` |
| 2026-11-21 (Phiên 13) | Chuẩn hóa kích thước va chạm (`hitboxWidth × hitboxHeight`) cho các xe `V1–V4` (`Xe đạp`, `Xe đạp thồ`, `Bốn bánh`, `Xe tải`) đồng nhất gọn `18×28` như xe đầu game (kèm viền vùng lõi xanh mờ trong combat để dễ canh né), riêng `Xe tăng T-54B` giữ trọn kích thước `44×64` | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest xác nhận cuối cho `T8.1` | Chơi thử độ mượt khi né đạn bằng xe bốn bánh & xe tải tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 12) | Giữ nguyên boss mở màn siêu khó ở đầu Chặng I (`v1_tutorial`, thua đi tiếp, thắng teleport sát đích +1 độ bền) **VÀ đặt trận TÁI ĐẤU (`v4_rematch`, tạo hình B-52 chiến lược, chung bộ đạn siêu khó + 2 bom rải thảm AoE lớn) ngay cuối map Tuyến lửa Trường Sơn (Chặng IV)** — bắt buộc đánh thắng trận tái đấu với đội hình đã nâng cấp để mở đường vào Sài Gòn 1975 | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử cung bậc mở màn (`v1_tutorial`) → tái đấu (`v4_rematch`) cuối Trường Sơn tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 12) | Giữ nguyên boss mở màn siêu khó ở đầu Chặng I (`v1_tutorial`, thua đi tiếp, thắng teleport sát đích +1 độ bền) **VÀ đặt trận TÁI ĐẤU (`v4_rematch`, tạo hình B-52 chiến lược, chung bộ đạn siêu khó + 2 bom rải thảm AoE lớn) ngay cuối map Tuyến lửa Trường Sơn (Chặng IV)** — bắt buộc đánh thắng trận tái đấu với đội hình đã nâng cấp để mở đường vào Sài Gòn 1975 | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử cung bậc mở màn (`v1_tutorial`) → tái đấu (`v4_rematch`) cuối Trường Sơn tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 11) | Biên tập & nâng tầm toàn bộ nội dung lịch sử học thuật (không còn bản MVP): mở rộng dòng tư liệu lên **20 hồ sơ chuẩn xác (1945–1975)** bám sát bài luận gốc (`Essential Matters`, Đại tướng Võ Nguyên Giáp, Phan Dương Hiệu & Neal Koblitz, Christopher Goscha, Ban Cơ yếu Chính phủ), viết lại toàn bộ cắt cảnh Mở đầu / Toàn thắng / Hậu 1975 (Trường Cán bộ Cơ yếu 1976, Học viện KTMM 1995, Luật Cơ yếu 2011), 4 hồ sơ tổng kết chặng, tên địa danh/chốt chặn chuẩn sử liệu, và thời lượng đọc Visual Novel thích ứng theo độ dài chữ (`8.5–13.5s`) | Dev server đang chạy tại `http://localhost:5173/`; chờ Duma đọc kiểm duyệt toàn bộ nội dung | Rà soát văn phong & chốt `[x] T8.1` tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 10) | Thêm thẻ tên map lớn giữa màn hình hiện rõ rồi fade-out mượt (`3.6s`, không chặn điều khiển) mỗi khi đặt chân vào một vùng mới | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử cảm giác hoàn chỉnh từ V1→V5 tại `http://localhost:5173/` rồi chốt `[x] T8.1` |
| 2026-11-21 (Phiên 9) | Thắng con boss đầu tiên siêu khó (`v1_tutorial`) tự động dịch chuyển xe tới ngay sát cạnh đích Trạm Cơ Yếu Bắc Kạn (`x = destX - 116`) để người chơi chỉ việc tiến vào đích | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử cảm giác hoàn chỉnh tại `http://localhost:5173/` rồi chốt `[x] T8.1` |
| 2026-11-21 (Phiên 9) | Thắng con boss đầu tiên siêu khó (`v1_tutorial`) tự động dịch chuyển xe tới ngay sát cạnh đích Trạm Cơ Yếu Bắc Kạn (`x = destX - 116`) để người chơi chỉ việc tiến vào đích | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử cảm giác hoàn chỉnh tại `http://localhost:5173/` rồi chốt `[x] T8.1` |
| 2026-11-21 (Phiên 8) | Chỉnh lại bố trí ổ phục kích ở cả 5 vùng đảm bảo mỗi vùng luôn có **đúng 1 tuyến đường mòn hoàn toàn không có mai phục** (đổi hướng từng vùng: V1 Tây, V2 Nam, V3 Đông Bắc, V4 Đông Nam, V5 Đông), kiểm chứng tự động bằng DFS đếm đường an toàn | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử dò tuyến đường sạch mai phục bằng kĩ năng Cơ yếu tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 8) | Chỉnh lại bố trí ổ phục kích ở cả 5 vùng đảm bảo mỗi vùng luôn có **đúng 1 tuyến đường mòn hoàn toàn không có mai phục** (đổi hướng từng vùng: V1 Tây, V2 Nam, V3 Đông Bắc, V4 Đông Nam, V5 Đông), kiểm chứng tự động bằng DFS đếm đường an toàn | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử dò tuyến đường sạch mai phục bằng kĩ năng Cơ yếu tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 7) | Tư liệu rơi ngẫu nhiên trong màn đánh boss nay **đứng yên tại chỗ** (không trôi khỏi màn); lượm tư liệu trên bản đồ mở cộng thêm **1 Giáp hồi sinh (`🛡×N`)** tự chặn chết, quét sạch đạn địch & hồi đầy độ bền khi đánh boss | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest xác nhận cuối cho `T8.1` | Chơi thử tư liệu đứng yên trong combat & giáp hồi sinh từ bản đồ tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 6) | Thêm thanh loading **"Đang chuẩn bị vũ khí"** trong `4.5s` đầu trận; đổi đạn ta sang **auto-aim bay thẳng** (không uốn homing) + tăng tốc độ bắn liên thanh (`10.5–13.3 viên/s`) giữ nguyên DPS thấp (~65–74s/boss); giới hạn tối đa **2 lần gặp boss mỗi vùng** (`MAX_BOSSES_PER_REGION = 2`) | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest xác nhận cuối cho `T8.1` | Chơi thử cảm giác thanh nạp vũ khí, bắn liên thanh auto-aim và giới hạn 2 boss/vùng tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 5) | Bổ sung cơ chế lượm tư liệu trong màn giao tranh trừ ngay **25% máu hiện tại của boss** + khựng nhịp bắn boss `1.4s` & tia vàng đánh dấu để người chơi dễ đọc hộp thoại Visual Novel | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest chốt `T8.1` | Chơi thử cảm giác lượm tư liệu -25% HP boss tại `http://localhost:5173/` |
| 2026-11-21 (Phiên 4) | Áp dụng 3 nâng cấp lớn theo playtest Duma: (1) Open-map 2D rộng (`2300×1850`) với mạng lưới đường mòn phân nhánh + xe bám đường mòn + bản đồ nhỏ góc phải; (2) Cân bằng combat khó chuẩn ~60–72s/boss, độ trễ 4.5s phủ màn đạn trước khi ta bắn, 1 luồng đạn dẫn đường damage nhỏ (không AoE), giảm máu toàn bộ xe (`2/3/4/5/7`); (3) Vẽ lại máy bay ném bom Pháp++ (B-26) & phản lực Mỹ (F-4) rõ dáng + bổ sung vùng tròn nổ bom AoE lớn có vòng đếm ngược | Dev server đang chạy tại `http://localhost:5173/`; chờ playtest xác nhận độ khó 60s & cảm giác lái trên đường mòn | Test lại mạng đường mòn open-map & combat 60s + bom tròn AoE tại `http://localhost:5173/` rồi chốt `[x] T8.1` |
| 2026-11-21 (Phiên 3) | Áp dụng trọn bộ 7 góp ý playtest của Duma: bối cảnh **ban ngày sáng** (bỏ sương đêm tối, giữ ổ phục kích ẩn cho kĩ năng Cơ yếu phát hiện), **xe xoay đầu mượt theo hướng phím/kéo tay** trên map mở, **Visual Novel Dialog** đáy màn hình cho lore, làm lại **đạn boss chậm chằng chịt + đạn lơ lửng**, xóa sạch thuật ngữ dev khỏi UI, **Modal nâng cấp tập trung Lore + 3 skill chỉ hiện tên**, **theme sáng giấy quân sự** | Đang mở dev server tại `http://localhost:5173/`; còn playtest xác nhận lại 7 điểm trên | Chơi thử lại bản sáng ban ngày tại `http://localhost:5173/`, chốt cân bằng cuối rồi tick `[x] T8.1` |
| 2026-11-21 (Phiên 2) | Code trọn bộ game (`T0.1–T7.2` + `T8.2`), cài `pnpm` + Node `26.13.1` + `pixi.js 8.23.0`, `pnpm typecheck && pnpm build` xanh 0 lỗi, pass toàn bộ invariant test (`ALL_GAME_INVARIANTS_OK`) | `T8.1` chưa chạy auto-browser vì Chrome DevTools MCP chưa kết nối; dev server đã mở ở `http://localhost:5173/` | Mở `http://localhost:5173/` chơi thử PC + Mobile, tinh chỉnh cân bằng nếu cần rồi tick `[x] T8.1` |
| 2026-11-21 (Phiên 1) | Chốt toàn bộ spec (`docs/GAME_SPEC.md`), chia 27 tasks (`docs/ROADMAP.md`), tạo hệ thống chống quên context (`STATUS.md`, `README.md`) | Chưa khởi tạo `package.json` / `PixiJS` | Chạy `T0.1`: khởi tạo `Vite + TypeScript + PixiJS` bằng `pnpm` |
