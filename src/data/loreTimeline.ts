export interface LoreItem {
  index: number;
  date: string;
  speaker: string;
  title: string;
  body: string;
}

export interface RegionTransitionStory {
  fromRegionIndex: number;
  headline: string;
  eraTransition: string;
  storyText: string;
}

export interface CutsceneSlide {
  era: string;
  title: string;
  text: string;
  visualKey:
    | 'founding_1945'
    | 'two_dispatches_1954'
    | 'mission_start'
    | 'victory_1975'
    | 'silent_front'
    | 'credits_sources'
    | 'after_1978'
    | 'after_cyber';
  cyberTheme?: boolean;
  showStats?: boolean;
}

export const LORE_TIMELINE: readonly LoreItem[] = [
  {
    index: 1,
    date: '12/9/1945',
    speaker: 'Bộ Tổng Tham mưu',
    title: 'Ban Mật mã quân sự',
    body: 'Ban Mật mã quân sự ra đời dưới quyền Hoàng Đạo Thúy. Tạ Quang Đệ và Đinh Loan Thuyên (Hoàng Thành) là những người đầu tiên cầm bảng mã.'
  },
  {
    index: 2,
    date: '10/1945',
    speaker: 'Đường dây Nam Bộ',
    title: 'Chuyển bảng mã bằng đường bộ',
    body: 'Mẫu mật mã theo Hoàng Quốc Việt vào Nam Bộ; đầu 1946 Đinh Loan Thuyên mang bảng mã từ Phủ Lý vào Bình Định. Lệch ngày đổi bảng là hai đầu không đọc được điện của nhau.'
  },
  {
    index: 3,
    date: '01/1946',
    speaker: 'Bộ Tổng Tham mưu',
    title: 'Tách khỏi thông tin liên lạc',
    body: 'Bộ phận mật mã tách riêng, đặt trực tiếp dưới Tổng Tham mưu trưởng. Từ Khu 1, Khu 4, Khu 5 đến từng trung đoàn đều có tổ mật mã đi sát người chỉ huy.'
  },
  {
    index: 4,
    date: '10/4/1946',
    speaker: 'Kỹ thuật mật mã',
    title: 'Bảng cộng 5 chữ số bỏ nhớ',
    body: 'Đổi chữ thành số, chia nhóm 5 chữ số rồi cộng khóa bỏ nhớ: 47216 + 58194 = 95300. Nhanh nhưng dãy 211 dễ đọc nhầm giữa 2-11 với 21-1, còn khóa lặp ngắn dễ bị phá.'
  },
  {
    index: 5,
    date: 'Thu–Đông 1947',
    speaker: 'Chiến khu Việt Bắc',
    title: 'Tách đôi Định Hóa – Bắc Kạn',
    body: 'Quân Pháp đánh lên Việt Bắc, cơ quan chỉ huy cơ động phân tán. Một cụm mật mã ở Định Hóa nối Trung – Nam Bộ, cụm còn lại lên Bắc Kạn giữ liên lạc Bắc Bộ và Khu 4.'
  },
  {
    index: 6,
    date: '1948–03/1949',
    speaker: 'Hoàng Thành',
    title: 'Mật mã đại cương',
    body: 'Hai cuốn "Mật mã đại cương" (1948) và "Cách dùng luật mật mã" (3/1949) ra đời, thống nhất thao tác để mọi đầu mối mã hóa và giải mã theo cùng một quy chuẩn.'
  },
  {
    index: 7,
    date: '1949',
    speaker: 'Bộ Quốc phòng',
    title: '1.200 bức điện mỗi tháng',
    body: 'Mỗi tháng cơ quan mật mã xử lý khoảng 1.200 bức điện chính thức. Hệ nào quá rắc rối bị bỏ không — giải quá chậm thì tin tới nơi đã vô dụng.'
  },
  {
    index: 8,
    date: '1949',
    speaker: 'Đại đoàn 308',
    title: 'Mạng mật mã chủ lực đầu tiên',
    body: 'Cấp trên lập bộ phận mật mã cho Đại đoàn 308 và các tổ tại Trung đoàn 36, 88, 102 — lần đầu đơn vị chủ lực có mạng mật mã cơ động đi cùng đội hình.'
  },
  {
    index: 9,
    date: '07/1950–05/1951',
    speaker: 'Bộ Tổng Tham mưu',
    title: 'Đổi tên Cơ yếu & mở trường',
    body: 'Tháng 7/1950 tách riêng Phòng Mật mã; tháng 2/1951 chính thức mang tên Cơ yếu. Tháng 5/1951 Nguyễn Chí Thanh giao nhiệm vụ mở Trường Mật mã quân đội.'
  },
  {
    index: 10,
    date: '12/1951–1952',
    speaker: 'Đầu mối Đại đoàn 308',
    title: 'Thử nghiệm KTB, Sông Đà & C.40',
    body: 'Hệ mã KTB chạy thử trước trên tuyến Bộ Tổng Chỉ huy – Đại đoàn 308 rồi mới mở rộng năm 1952 qua lớp Sông Đà và học viên lớp C.40 về từng đơn vị.'
  },
  {
    index: 11,
    date: '1954 · Điện Biên Phủ',
    speaker: 'Trung đoàn 102',
    title: 'Bức điện đổi đường đến muộn',
    body: 'Cách Điện Biên Phủ 8 km, lệnh quay lại đi đường khác tới quá muộn. Trung đoàn 102 đụng thẳng quân Pháp — mệnh lệnh đúng nhưng trễ nhịp vẫn thành vô tác dụng.'
  },
  {
    index: 12,
    date: '01–05/1954',
    speaker: 'Sở Chỉ huy Mường Phăng',
    title: 'Giữ kín lệnh kéo pháo',
    body: 'Suốt 56 ngày đêm tại Mường Phăng, tổ cơ yếu mã dịch toàn bộ lệnh đổi từ "đánh nhanh" sang "đánh chắc" qua sóng vô tuyến mà không để lộ hướng tấn công.'
  },
  {
    index: 13,
    date: '07/5/1954 · 19:00',
    speaker: 'Nguyễn Hữu Thuận',
    title: 'Hai mốc 17h30 và 19h00',
    body: 'Đại đoàn 312 bắt tướng De Castries lúc 17h30. Sau khi Lê Trọng Tấn xác nhận trực tiếp nhân dạng, 19h00 Tổ trưởng Nguyễn Hữu Thuận mã hóa điện báo tin về Trung ương.'
  },
  {
    index: 14,
    date: '21/7/1956',
    speaker: 'Hà Nội',
    title: 'Ban Cơ yếu Trung ương',
    body: 'Đất nước tạm chia hai miền. Ban Cơ yếu Trung ương ra đời theo Nghị quyết 10-NQ/TW để gom một đầu mối quản lý mật mã cho cả Đảng, chính quyền và quân đội.'
  },
  {
    index: 15,
    date: '19/5/1959',
    speaker: 'Đoàn 559 · Trường Sơn',
    title: 'Đi không dấu, nói không tiếng',
    body: 'Tổ cơ yếu theo chân Đoàn 559 mở tuyến Trường Sơn ngay từ ngày đầu, bám từng binh trạm giữ liên lạc bí mật giữa Hà Nội và chiến trường miền Nam.'
  },
  {
    index: 16,
    date: '08/1961',
    speaker: 'Chiến khu Đ',
    title: 'Ban Cơ yếu Trung ương Cục',
    body: 'Đầu mối cơ yếu thống nhất miền Nam lập tại Chiến khu Đ, nối thẳng đường dây mã hóa từ Trung ương Cục xuống các khu ủy, tỉnh ủy và mặt trận.'
  },
  {
    index: 17,
    date: '1965–1972',
    speaker: 'Kỹ thuật mật mã',
    title: 'Khóa dùng một lần (OTP)',
    body: 'Trước máy dò tần số và giải mã điện tử Mỹ, ngành đẩy mạnh hệ khóa dùng một lần tối ưu cho tiếng Việt và siết kỷ luật hủy khóa sau mỗi phiên điện.'
  },
  {
    index: 18,
    date: '1965–1972',
    speaker: 'Tuyến lửa Trường Sơn',
    title: '500 cán bộ cơ yếu hy sinh',
    body: 'Gần 500 cán bộ cơ yếu quân đội — gần 10% quân số trực chiến tính đến năm 1972 — đã ngã xuống dưới bom B-52 và phục kích để tài liệu không rơi vào tay địch.'
  },
  {
    index: 19,
    date: 'Mùa Xuân 1975',
    speaker: 'Tổng hành dinh',
    title: 'Mã dịch song song',
    body: 'Phần điện viết xong được mã hóa chuyển ngay sang đài vô tuyến trong khi phần sau còn đang soạn — xóa thời gian chờ giữa các khâu khi mặt trận đổi theo từng giờ.'
  },
  {
    index: 20,
    date: '30/4/1975 · 11:30',
    speaker: 'Sài Gòn',
    title: 'Cổng Dinh Độc Lập',
    body: 'Năm cánh quân hợp vây Sài Gòn đúng hẹn. Trưa 30/4, xe tăng T-54B húc đổ cánh cổng sắt Dinh Độc Lập — khép lại 30 năm giữ điện mật thời chiến.'
  }
];

export const REGION_TRANSITIONS: readonly RegionTransitionStory[] = [
  {
    fromRegionIndex: 0,
    headline: 'Rời Việt Bắc — Lên Tây Bắc',
    eraTransition: '1945–1949 → 1950–1954 · Điện Biên Phủ',
    storyText:
      'Từ bảng cộng 5 số thủ công năm 1946 đến áp lực 1.200 bức điện mỗi tháng năm 1949, bộ phận mật mã đã tách thành lực lượng riêng đứng sát các đại đoàn chủ lực.\n\nPhía trước là Điện Biên Phủ với pháo binh và máy bay ném bom B-26 của Pháp. Xe đạp thồ chịu đạn tốt hơn xe đạp thường, nhưng tránh được ổ phục kích vẫn nhờ tín hiệu cơ yếu.'
  },
  {
    fromRegionIndex: 1,
    headline: 'Qua Điện Biên Phủ — Vào Miền Nam',
    eraTransition: '1950–1954 → 1955–1964 · Liên Khu Miền Nam',
    storyText:
      'Hệ mã KTB, lớp Sông Đà và bức điện 19 giờ chiều 7/5/1954 đã chứng minh năng lực vận hành ở quy mô chiến dịch lớn.\n\nTừ 1956 đến 1961, Ban Cơ yếu Trung ương và đầu mối Chiến khu Đ lần lượt ra đời. Chặng tới đi xe bốn bánh qua đồng bằng với chốt kiểm soát và trạm định vị vô tuyến dày đặc.'
  },
  {
    fromRegionIndex: 2,
    headline: 'Rời Chiến Khu Đ — Vào Tuyến Lửa Trường Sơn',
    eraTransition: '1955–1964 → 1965–1972 · Trường Sơn',
    storyText:
      'Mạng liên lạc đã nối thông Bắc – Nam dọc tuyến Đoàn 559, nhưng chặng khó nhất mới bắt đầu: quân Mỹ đổ bộ với phản lực F-4, bom rải thảm B-52 và cảm biến điện tử.\n\nXe tải Trường Sơn bền hơn nhưng hỏa lực phía trước rất dày — đặc biệt ở cửa ngõ rời tuyến lửa, nơi trận tái đấu quyết định đang chờ.'
  },
  {
    fromRegionIndex: 3,
    headline: 'Vượt Trường Sơn — Tiến Vào Sài Gòn',
    eraTransition: '1965–1972 → 30/4/1975 · Sài Gòn',
    storyText:
      'Bạn đã phá xong vòng vây khốc liệt nhất dọc Trường Sơn. Tại Tổng hành dinh 1975, mã dịch song song vận hành hết tốc lực, nối liền năm cánh quân áp sát Sài Gòn.\n\nXe tăng T-54B xuất kích cùng toàn bộ hệ thống cơ yếu ở mức mạnh nhất. Hỏa lực địch đã vỡ — bám đường tiến thẳng vào cổng Dinh Độc Lập.'
  }
];

export const INTRO_SLIDES: readonly CutsceneSlide[] = [
  {
    era: '1954 · CÁCH ĐIỆN BIÊN PHỦ 8 KM',
    title: 'Bức Điện Chậm Một Nhịp',
    text: 'Trung đoàn 102 nhận lệnh đổi đường quá muộn và đi thẳng vào quân Pháp.\nChiều 7/5/1954, ở chiều ngược lại, tin bắt tướng De Castries được xác minh tận gốc rồi mã hóa gửi về Trung ương lúc 19 giờ.',
    visualKey: 'two_dispatches_1954'
  },
  {
    era: 'BỐN KHÂU KHÔNG ĐƯỢC ĐỨT',
    title: 'Mật Mã Và Cơ Yếu',
    text: 'Chỉ huy ra lệnh. Cơ yếu mã dịch. Thông tin phát sóng. Đơn vị thực thi.\nMật mã là bảng khóa và phép tính; Cơ yếu là con người và kỷ luật giữ cho mệnh lệnh tới đúng lúc mà không lọt vào tay địch.',
    visualKey: 'founding_1945'
  },
  {
    era: '1945 → 1975',
    title: 'Đi Giữa Vùng Thiếu Thông Tin',
    text: 'Các ổ phục kích ẩn kín dọc ngã rẽ đường mòn; mỗi chặng chỉ có một nhánh sạch.\nLượm hồ sơ trên đường để tích Giáp hồi sinh, nâng cấp Cơ yếu để phát hiện bẫy từ xa — và tiến tới Sài Gòn.',
    visualKey: 'mission_start'
  }
];

export const END_GAME_SLIDES: readonly CutsceneSlide[] = [
  {
    era: '30/4/1975 · 11:30',
    title: 'Dinh Độc Lập',
    text: 'Hai cánh cổng sắt bật tung dưới xích xe tăng T-54B.\nLá cờ giải phóng kéo lên giữa nắng trưa Sài Gòn.',
    visualKey: 'victory_1975'
  },
  {
    era: '1945 — 1975',
    title: 'Ba Mươi Năm Điện Mật',
    text: 'Từ bảng số cộng tay năm 1946 đến những bức điện mã dịch song song mùa Xuân 1975.\nGần 500 cán bộ cơ yếu đã nằm lại dọc đường để từng mệnh lệnh đến đúng giờ.',
    visualKey: 'silent_front',
    showStats: true
  }
];

export const CREDITS_AND_AFTER_SLIDES: readonly CutsceneSlide[] = [
  {
    era: 'NGUỒN TƯ LIỆU',
    title: 'Mật Điện Cơ Yếu',
    text: '• Lịch sử ngành Cơ yếu QĐNDVN (1945–1975) / Essential Matters (David W. Gaddy)\n• Hồi ký "Điện Biên Phủ – Điểm hẹn lịch sử" — Võ Nguyên Giáp\n• Nghiên cứu mật mã 1946 — Phan Dương Hiệu & Neal Koblitz\n• Tư liệu Ban Cơ yếu Chính phủ',
    visualKey: 'credits_sources'
  },
  {
    era: 'SAU 1975 · 1976 – 1995',
    title: 'Từ Sổ Mã Giấy Sang Điện Tử',
    text: 'Hòa bình không khép lại bài toán bảo mật.\nNgành lập Trường Cán bộ Cơ yếu (1976), Viện Nghiên cứu Mật mã (1980), rồi Học viện Kỹ thuật Mật mã (1995) — chuyển từ sổ mã thủ công sang thiết bị điện tử và thuật toán hiện đại.',
    visualKey: 'after_1978',
    cyberTheme: true
  },
  {
    era: 'TỪ 2011 ĐẾN NAY',
    title: 'Bảo Mật Kỷ Nguyên Số',
    text: 'Luật Cơ yếu 2011 đặt Ban Cơ yếu Chính phủ làm cơ quan mật mã quốc gia.\nTừ những nhóm 5 chữ số viết tay năm 1946, ngành hôm nay vận hành chữ ký số, hạ tầng khóa công khai (PKI) và bảo vệ mạng thông tin trọng yếu quốc gia.',
    visualKey: 'after_cyber',
    cyberTheme: true
  }
];
