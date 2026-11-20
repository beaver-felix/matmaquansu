# ROADMAP — Checklist Chi Tiết Từng Bước (Chống Quên Context)

> **Cách dùng cho não cá vàng:**
> - Chỉ làm **đúng 1 task tại một thời điểm** theo thứ tự từ trên xuống.
> - Mỗi task đã ghi rõ: **File cần đụng**, **Phụ thuộc**, và **Cách tự test (Verify)**.
> - Xong task nào: đổi `[ ]` → `[x]`, rồi cập nhật mục `2` & `3` trong [../STATUS.md](../STATUS.md).
> - Cần nhớ lại chi tiết thiết kế? Tra [./GAME_SPEC.md](./GAME_SPEC.md).

---

## Phase 0: Khởi tạo dự án & Khung chạy (Project Bootstrap)

- [x] **T0.1 — Init `Vite + TypeScript + PixiJS` bằng `pnpm`**
  - **File:** `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `pnpm-workspace.yaml`
  - **Phụ thuộc:** Không
  - **Verify:** `pnpm typecheck && pnpm build` exit `0`; `pnpm dev` chạy ở `http://localhost:5173/`.

- [x] **T0.2 — Dựng khung `GameState` & `SceneManager`**
  - **File:** `src/core/GameState.ts`, `src/core/SceneManager.ts`, `src/main.ts`
  - **Phụ thuộc:** `T0.1`
  - **Verify:** State machine quản lý sạch 7 scene ID (bao phủ Scene 0–8), tự hủy container khi đổi cảnh.

- [x] **T0.3 — Dựng `InputManager` (PC `WASD` + Mobile Relative Touch Drag)**
  - **File:** `src/core/InputManager.ts`
  - **Phụ thuộc:** `T0.1`
  - **Verify:** Chuẩn hóa vector `WASD`/Arrow keys, relative touch drag không che xe, `Space` bật/tắt auto-fire, reset khi `blur`.

- [x] **T0.4 — Dựng `AudioEngine` (Web Audio Synth + Morse)**
  - **File:** `src/core/AudioEngine.ts`
  - **Phụ thuộc:** `T0.1`
  - **Verify:** Sinh đầy đủ SFX Morse gần/xa, radar ping, bắn, trúng đạn, báo động mai phục, fanfare dopamine, vỡ cổng Dinh Độc Lập.

---

## Phase 1: Dữ liệu Cốt Lõi & Đồ Họa Procedural (`data/` + `render/`)

- [x] **T1.1 — Dữ liệu 5 Phương Tiện**
  - **File:** `src/data/vehicles.ts`
  - **Phụ thuộc:** `T0.2`
  - **Verify:** Đủ 5 xe tăng dần kích thước/hitbox (`18×28` → `44×64`) và HP (`3 → 5 → 7 → 10 → 15`).

- [x] **T1.2 — Dữ liệu 4 Kĩ Năng Cơ Yếu**
  - **File:** `src/data/skills.ts`
  - **Phụ thuộc:** `T0.2`
  - **Verify:** Đủ 4 kĩ năng gắn mốc lịch sử 1948/1951/1959/1975 với chu kỳ chuẩn & MAX.

- [x] **T1.3 — Dữ liệu 5 Vùng & Bố Cục Bẫy Mai Phục**
  - **File:** `src/data/regions.ts`
  - **Phụ thuộc:** `T1.1`
  - **Verify:** Đủ 5 vùng (`Pháp → Pháp++ → Ngụy → Mỹ → Ngụy--`), 30 ổ mai phục (gồm Tutorial V1), 15 điểm rơi vật phẩm, cờ Dinh Độc Lập ở V5.

- [x] **T1.4 — Dữ liệu 15 Mốc Lịch Sử & Kịch Bản Cutscenes**
  - **File:** `src/data/loreTimeline.ts`
  - **Phụ thuộc:** `T0.2`
  - **Verify:** 15 mốc lịch sử liên tục 1945–1975, 4 văn bản chuyển vùng, `intro_cutscene`, `end_game`, `credits + after_credit`.

- [x] **T1.5 — Dựng `SpriteFactory` (Đồ họa Procedural Top-down)**
  - **File:** `src/render/SpriteFactory.ts`
  - **Phụ thuộc:** `T1.1`, `T1.3`
  - **Verify:** Vẽ procedural PixiJS v8 cho 5 xe đúng kích thước hitbox, 5 phe địch, mật thư, Cổng sắt Dinh Độc Lập vỡ 2 cánh + cờ giải phóng.

---

## Phase 2: Scene 0 (Title) & Scene 1/7/8 (Cutscene Engine)

- [x] **T2.1 — Xây `TitleScene` (Scene 0)**
  - **File:** `src/scenes/TitleScene.ts`
  - **Phụ thuộc:** `T0.2`, `T0.4`, `T1.5`
  - **Verify:** Bản đồ lưới mod-10 + sóng radar, nút Bắt đầu, nút âm thanh, hướng dẫn PC/Mobile.

- [x] **T2.2 — Xây `CutsceneScene` tái sử dụng (Scene 1, 7, 8)**
  - **File:** `src/scenes/CutsceneScene.ts`
  - **Phụ thuộc:** `T0.2`, `T1.4`
  - **Verify:** Typewriter text, minh họa canvas động từng khung, nút Bỏ qua, bảng thống kê cuối game, tông cyber số hóa cho `after_credit`.

---

## Phase 3: Scene 2 (Overworld Map) + Fog of War + Non-blocking Lore Dialog

- [x] **T3.1 — Xây `OverworldScene` (Di chuyển 2D Top-down & Camera)**
  - **File:** `src/scenes/OverworldScene.ts`
  - **Phụ thuộc:** `T0.3`, `T1.3`, `T1.5`
  - **Verify:** Di chuyển tự do 2D, camera follow clamp biên, 5 địa hình thời kì, vạch ranh giới cuối vùng.

- [x] **T3.2 — Thêm Fog of War & Ổ Mai Phục Ẩn**
  - **File:** `src/scenes/OverworldScene.ts`
  - **Phụ thuộc:** `T3.1`
  - **Verify:** Vignette sương mù mượt quanh xe, ổ bẫy ẩn, va chạm hitbox thật của xe lưu tọa độ và chuyển `COMBAT`.

- [x] **T3.3 — Xây `LoreToastUI` (Dialog lịch sử không chắn tầm nhìn)**
  - **File:** `src/systems/LoreToastUI.ts`, `src/scenes/OverworldScene.ts`
  - **Phụ thuộc:** `T1.4`, `T3.1`
  - **Verify:** `pointer-events: none`, neo gọn ngoài vùng chơi trên PC và mép dưới trên mobile, xếp hàng đợi nối tiếp timeline chung.

---

## Phase 4: Hệ Thống 4 Kĩ Năng Cơ Yếu (Interval + Off-map Clues)

- [x] **T4.1 — Xây `CryptoSkillSystem` (Bộ đếm Interval + Skill HUD)**
  - **File:** `src/systems/CryptoSkillSystem.ts`
  - **Phụ thuộc:** `T1.2`, `T3.2`
  - **Verify:** 4 timer chu kỳ độc lập + thanh progress nháy sáng góc dưới trái.

- [x] **T4.2 — Hiện thực hiệu ứng 4 Kĩ Năng + Off-map Clues**
  - **File:** `src/systems/CryptoSkillSystem.ts`, `src/scenes/OverworldScene.ts`
  - **Phụ thuộc:** `T0.4`, `T4.1`
  - **Verify:** `vision_1948` radar mở sương; `ktb_1951` viền màn hình + Morse; `truongson_1959` số `95300` + thu nhỏ bẫy 25%; `pipeline_1975` ticker mod-10 + mũi tên hành lang an toàn + giảm 20% tốc độ đạn đầu trận.

- [x] **T4.3 — Chế độ MAX Toàn Mạng Hợp Nhất tại Vùng 5**
  - **File:** `src/systems/CryptoSkillSystem.ts`, `src/core/GameState.ts`
  - **Phụ thuộc:** `T4.2`
  - **Verify:** Mở đủ 4/4 kĩ năng tự bật `maxSkillsActive = true` rút ngắn interval ~30%.

---

## Phase 5: Scene 3 (Tutorial Souls-like) & Scene 4 (Danmaku Combat)

- [x] **T5.1 — Xây `BulletEngine` (Object Pool + 5 Bộ Pattern Phe Địch)**
  - **File:** `src/systems/BulletEngine.ts`
  - **Phụ thuộc:** `T1.1`, `T1.5`
  - **Verify:** Object pool 480 viên đạn, 5 bộ họa tiết phe địch (gồm tia không kích Mỹ + giảm mạnh ở `Ngụy--`), va chạm AABB khớp thân xe.

- [x] **T5.2 — Xây `CombatScene` (Đấu trường + Thắng/Thua + Vật Phẩm Giữa Trận)**
  - **File:** `src/scenes/CombatScene.ts`
  - **Phụ thuộc:** `T0.3`, `T0.4`, `T3.3`, `T5.1`
  - **Verify:** Bắt buộc bắn cạn HP địch mới thắng, i-frames `0.85s`, vật phẩm rơi giữa trận nối tiếp timeline chung, thắng quay lại đúng tọa độ map.

- [x] **T5.3 — Nhánh Tutorial Souls-like (Scene 3)**
  - **File:** `src/scenes/CombatScene.ts`, `src/core/GameState.ts`
  - **Phụ thuộc:** `T5.2`
  - **Verify:** Thua → hồi tưởng TrĐ 102 & đi tiếp (không Game Over); thắng → hiệu ứng dopamine + `+1 Max HP` vĩnh viễn + huy hiệu vàng.

- [x] **T5.4 — Game Over Overlay cho Màn Thường**
  - **File:** `src/scenes/CombatScene.ts`
  - **Phụ thuộc:** `T5.2`
  - **Verify:** `HP = 0` hiện Game Over + nút chơi lại đầu vùng hiện tại, giữ nguyên xe & kĩ năng đã mở trước vùng đó.

---

## Phase 6: Scene 5 (Modal Rời Vùng 2 Cột & Nâng Cấp Xe)

- [x] **T6.1 — Xây `RegionExitOverlay` (Layout 2 Cột + Card Nâng Cấp Xe)**
  - **File:** `src/scenes/RegionExitOverlay.ts`
  - **Phụ thuộc:** `T1.1`, `T1.2`, `T1.4`
  - **Verify:** Trái: cốt truyện vùng + bảng so sánh nâng cấp xe; Phải: chọn 1 kĩ năng cơ yếu chưa mở; banner MAX khi vào V5.

- [x] **T6.2 — Nối trọn vòng lặp V1 → V2 → V3 → V4 → V5**
  - **File:** `src/scenes/OverworldScene.ts`, `src/scenes/RegionExitOverlay.ts`, `src/core/GameState.ts`
  - **Phụ thuộc:** `T4.3`, `T5.4`, `T6.1`
  - **Verify:** Xuyên suốt `Xe đạp → Xe đạp thồ → Bốn bánh → Xe tải → Xe tăng (MAX 4 kĩ năng)`.

---

## Phase 7: Scene 6 (Dinh Độc Lập) + Scene 7 (`end_game`) + Scene 8 (`after_credit`)

- [x] **T7.1 — Xây Cao Trào Scene 6 (Tiến Vào Sài Gòn & Húc Đổ Cổng Dinh Độc Lập)**
  - **File:** `src/scenes/OverworldScene.ts`, `src/render/SpriteFactory.ts`
  - **Phụ thuộc:** `T0.4`, `T5.1`, `T6.2`
  - **Verify:** Đại lộ Sài Gòn có loạt đạn `Ngụy--` nhẹ vẫn cần né; xe tăng tông cổng → rung màn hình, gãy 2 cánh cổng, mảnh vỡ, cờ giải phóng → chuyển `END_GAME`.

- [x] **T7.2 — Hoàn Thiện Scene 7 (`end_game`) & Scene 8 (`credits` + `after_credit`)**
  - **File:** `src/scenes/CutsceneScene.ts`, `src/data/loreTimeline.ts`
  - **Phụ thuộc:** `T2.2`, `T7.1`
  - **Verify:** Bảng thống kê chiến dịch ở Scene 7, Credits + After-Credit kỷ nguyên số ở Scene 8, nút quay về Title sạch state.

---

## Phase 8: Kiểm Thử Toàn Diện, Cân Bằng & Polish

- [x] **T8.1 — Playtest Full Run PC & Mobile Viewport**
  - **File:** Toàn project
  - **Phụ thuộc:** `T7.2`
  - **Verify:** Duma đã playtest trọn vẹn V1 → V5 → Dinh Độc Lập, hoàn tất toàn bộ vòng chỉnh sửa gameplay, cân bằng, nội dung, âm nhạc và fix lỗi treo trước cổng Dinh Độc Lập.

- [x] **T8.2 — Cân Bằng Số Liệu, Kiểm Định Invariants & Build Production Sạch**
  - **File:** `src/data/regions.ts`, `src/systems/BulletEngine.ts`
  - **Phụ thuộc:** `T7.2`
  - **Verify:** `pnpm typecheck && pnpm build` exit `0` (`dist/` built in 8.49s) + kiểm định tự động 5 xe / 5 vùng / 4 kĩ năng / 15 mốc lore / 30 ổ bẫy pass 100%.
