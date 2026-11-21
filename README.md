# Mật Điện Cơ Yếu (1945–1975)

Web-game hành quân & né đạn lấy chủ đề **lực lượng Cơ yếu Quân đội nhân dân Việt Nam** qua 30 năm kháng chiến — từ Chiến khu Việt Bắc năm 1945 tới cổng Dinh Độc Lập ngày 30/4/1975 và chặng đường số hóa sau thống nhất.

Xây dựng bằng `Vite` + `TypeScript` + `PixiJS` (WebGL) và Web Audio thuần, chơi mượt trên cả máy tính lẫn điện thoại.

---

## Cách chơi & Điều khiển

| Thiết bị | Thao tác |
| :--- | :--- |
| **Máy tính** | `WASD` hoặc phím mũi tên để di chuyển · `Space` bật/tắt tự ngắm bắn |
| **Điện thoại** | Chạm & kéo trực tiếp trên màn hình (ngón tay không che xe & đạn) |

Nút **DEV · CÀI ĐẶT** mở bảng nhà phát triển và tạm dừng trò chơi. Bật **Bất tử** để không nhận sát thương, hoặc chuyển thẳng đến một trong 5 chặng. Chuyển chặng bắt đầu lượt mới với xe/kỹ năng tương ứng, xóa tiến trình cũ và giữ lựa chọn bất tử. Bắt đầu lượt chơi bình thường tắt bất tử.

Trúng địch có tia lửa vàng, nháy sáng và âm thanh phản hồi ngay. Sân giao tranh trải rộng theo màn hình, bên dưới thanh điều khiển.

### Cơ chế cốt lõi
1. **Bản đồ mở theo đường mòn (5 chặng, 1945–1975)**: Xe chạy bám theo mạng lưới đường mòn phân nhánh tới trạm đích. Các ổ phục kích ẩn kín trên đường; mỗi chặng chỉ có **đúng 1 nhánh sạch** để lách qua nếu đọc tốt tín hiệu Cơ yếu.
2. **Cải tiến Cơ yếu theo cột mốc lịch sử**: Rời mỗi chặng được đọc hồ sơ chiến trường, tự động nâng cấp phương tiện (`Xe đạp` → `Xe đạp thồ` → `Xe bốn bánh` → `Xe tải Trường Sơn` → `Xe tăng T-54B`) và chọn 1 trong 3 cải tiến Cơ yếu (radar quét vùng bẫy, tín hiệu viền màn hình + nhịp Morse, gợi ý mật mã địa hình, giải mã nhánh an toàn).
3. **Giao tranh khắc nghiệt & Tư liệu lịch sử**:
   - Dính phục kích buộc phải đấu boss (giới hạn tối đa `2` trận chốt tuần tra mỗi chặng; riêng Chặng I có trận mở màn và Chặng IV có trận **tái đấu B-52** ở cửa ngõ).
   - Màn đạn kết hợp lưới đạn dày, đạn lơ lửng và vùng tròn nổ bom diện rộng; vũ khí quân ta có giai đoạn nạp chuẩn bị rồi bắn liên thanh tự ngắm.
   - **20 hồ sơ lịch sử** nối chung một dòng thời gian liên tục (hiển thị dạng hộp thoại ở đáy màn hình, không khóa di chuyển): lượm trên bản đồ tặng **Giáp hồi sinh (`🛡`)**, lượm giữa trận trừ **25% máu hiện tại của địch**.
4. **Kết thúc & Nhạc nền**: Chặng V tại Sài Gòn hợp nhất toàn mạng Cơ yếu tối đa cùng Xe tăng T-54B húc thẳng qua cổng Dinh Độc Lập, nối sang phần sau 1975. Nhạc nền hành khúc 4 chương sinh trực tiếp bằng Web Audio API tự đổi nhịp theo từng cảnh.

---

## Cài đặt & Chạy local

Yêu cầu: [`pnpm`](https://pnpm.io/) (Node runtime đã được khai báo tự quản lý qua `devEngines` trong `package.json`).

```bash
pnpm install    # Cài dependencies
pnpm dev        # Chạy dev server tại http://localhost:5173/
pnpm typecheck  # Kiểm tra lỗi TypeScript
pnpm build      # Build production vào thư mục dist/
pnpm preview    # Chạy thử bản build production
```

---

## Cấu trúc dự án

```text
src/
├── main.ts                  # Khởi tạo PixiJS, đăng ký các cảnh & chuyển nhạc nền
├── styles.css               # Giao diện tông giấy bản đồ sáng, hộp thoại & HUD
├── core/
│   ├── GameState.ts         # Tiến trình chặng, xe, kĩ năng, giáp hồi sinh & thống kê
│   ├── SceneManager.ts      # Quản lý chuyển cảnh
│   ├── InputManager.ts      # Phím WASD/Mũi tên & kéo cảm ứng tương đối
│   └── AudioEngine.ts       # Web Audio: hành khúc 4 chương, Morse & SFX
├── data/
│   ├── regions.ts           # 5 bản đồ đường mòn mở, chốt phục kích & điểm rơi hồ sơ
│   ├── vehicles.ts          # 5 phương tiện (kích thước, vùng va chạm, độ bền, hỏa lực)
│   ├── skills.ts            # 6 cải tiến Cơ yếu gắn mốc lịch sử
│   └── loreTimeline.ts      # 20 hồ sơ lịch sử 1945–1975 & kịch bản các cắt cảnh
├── render/
│   └── SpriteFactory.ts     # Đồ họa top-down (5 xe, máy bay B-26/F-4/B-52, Dinh Độc Lập)
├── systems/
│   ├── BulletEngine.ts      # Đạn lơ lửng, bom vòng tròn diện rộng & đạn tự ngắm
│   ├── CryptoSkillSystem.ts # Bộ đếm chu kỳ Cơ yếu, viền cảnh báo, Morse & giải mã
│   └── LoreToastUI.ts       # Hộp thoại hồ sơ lịch sử không chặn điều khiển
└── scenes/
    ├── TitleScene.ts        # Màn hình chính bản đồ địa hình & tuyến điện mật Bắc–Nam
    ├── CutsceneScene.ts     # Cắt cảnh Mở đầu, Toàn thắng 30/4 & Chặng sau 1975
    ├── OverworldScene.ts    # Bản đồ đường mòn, bản đồ thu nhỏ & cảnh húc cổng Dinh Độc Lập
    ├── CombatScene.ts       # Màn giao tranh phục kích, trận mở màn & tái đấu Trường Sơn
    └── RegionExitOverlay.ts # Cửa sổ rời chặng: hồ sơ chiến trường, nâng xe & chọn 1/3 cải tiến
```

Tài liệu phát triển nội bộ: [STATUS.md](./STATUS.md) · [docs/GAME_SPEC.md](./docs/GAME_SPEC.md) · [docs/ROADMAP.md](./docs/ROADMAP.md).

---

## Nguồn tư liệu lịch sử

- *Lịch sử ngành Cơ yếu Quân đội nhân dân Việt Nam (1945–1975)*, NXB Quân đội nhân dân (1990) / bản dịch *Essential Matters* (David W. Gaddy).
- Hồi ký *Điện Biên Phủ – Điểm hẹn lịch sử* — Đại tướng Võ Nguyên Giáp.
- Nghiên cứu kỹ thuật mật mã 1946 — Phan Dương Hiệu & Neal Koblitz.
- Tư liệu lịch sử ngành Cơ yếu Việt Nam — Ban Cơ yếu Chính phủ.
