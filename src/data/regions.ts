import { BossRole, FactionId } from '../core/GameState';

export interface RoadNode {
  id: string;
  x: number;
  y: number;
}

export type RoadEdge = readonly [string, string];

export interface AmbushDef {
  id: string;
  x: number;
  y: number;
  radius: number;
  name: string;
  bossRole?: BossRole;
}

export interface MapPickupDef {
  id: string;
  x: number;
  y: number;
}

export interface RegionPalette {
  ground: number;
  groundAlt: number;
  road: number;
  roadBorder: number;
  propDark: number;
  propLight: number;
  gridColor: number;
}

export interface RegionConfig {
  index: number;
  code: string;
  name: string;
  era: string;
  faction: FactionId;
  factionLabel: string;
  mapWidth: number;
  mapHeight: number;
  startX: number;
  startY: number;
  destinationX: number;
  destinationY: number;
  destinationRadius: number;
  destinationLabel: string;
  roadHalfWidth: number;
  roadNodes: RoadNode[];
  roadEdges: RoadEdge[];
  hasIndependencePalaceGate: boolean;
  palette: RegionPalette;
  ambushes: AmbushDef[];
  pickups: MapPickupDef[];
}

export const REGIONS: readonly RegionConfig[] = [
  // CHẶNG I: Chiến khu Việt Bắc (sau chốt t1, nhánh Tây w1->w2->w3->d sạch hoàn toàn)
  {
    index: 0,
    code: 'CHẶNG I',
    name: 'Chiến Khu Việt Bắc',
    era: '1945–1949',
    faction: 'phap',
    factionLabel: 'Quân Pháp',
    mapWidth: 2300,
    mapHeight: 1850,
    startX: 280,
    startY: 1620,
    destinationX: 2020,
    destinationY: 260,
    destinationRadius: 68,
    destinationLabel: 'CỤM MẬT MÃ BẮC KẠN',
    roadHalfWidth: 56,
    roadNodes: [
      { id: 's', x: 280, y: 1620 },
      { id: 't1', x: 600, y: 1460 },
      { id: 'w1', x: 380, y: 1020 },
      { id: 'w2', x: 520, y: 520 },
      { id: 'w3', x: 1120, y: 310 },
      { id: 'm1', x: 1080, y: 1220 },
      { id: 'm2', x: 1240, y: 780 },
      { id: 'e1', x: 1180, y: 1580 },
      { id: 'e2', x: 1760, y: 1380 },
      { id: 'e3', x: 1920, y: 840 },
      { id: 'd', x: 2020, y: 260 }
    ],
    roadEdges: [
      ['s', 't1'],
      ['t1', 'w1'],
      ['w1', 'w2'],
      ['w2', 'w3'],
      ['w3', 'd'],
      ['t1', 'm1'],
      ['m1', 'm2'],
      ['m2', 'w3'],
      ['m2', 'e3'],
      ['w1', 'm1'],
      ['t1', 'e1'],
      ['e1', 'e2'],
      ['e2', 'e3'],
      ['e3', 'd'],
      ['m1', 'e2']
    ],
    hasIndependencePalaceGate: false,
    palette: {
      ground: 0xa8c694,
      groundAlt: 0x95b880,
      road: 0xe0cea4,
      roadBorder: 0xb09866,
      propDark: 0x4b7742,
      propLight: 0x6b9a5c,
      gridColor: 0x5c7350
    },
    ambushes: [
      { id: 'v1_tutorial', x: 600, y: 1460, radius: 74, name: 'Ổ Phục Kích Đầu Tiên', bossRole: 'tutorial' },
      { id: 'v1_a2', x: 1080, y: 1220, radius: 76, name: 'Chốt Đèo Khế' },
      { id: 'v1_a3', x: 1240, y: 780, radius: 78, name: 'Đồn Sông Lô' },
      { id: 'v1_a4', x: 1180, y: 1580, radius: 74, name: 'Trạm Chặn Phía Đông' },
      { id: 'v1_a5', x: 1760, y: 1380, radius: 74, name: 'Biệt Kích Đường Số 3' }
    ],
    pickups: [
      { id: 'v1_p1', x: 440, y: 1540 },
      { id: 'v1_p2', x: 520, y: 520 },
      { id: 'v1_p3', x: 1920, y: 840 }
    ]
  },

  // CHẶNG II: Điện Biên Phủ (nhánh Nam s->j1->s1->s2->s3->d sạch hoàn toàn)
  {
    index: 1,
    code: 'CHẶNG II',
    name: 'Điện Biên Phủ',
    era: '1950–1954',
    faction: 'phap_plus',
    factionLabel: 'Quân Pháp · Pháo & Không quân',
    mapWidth: 2300,
    mapHeight: 1850,
    startX: 2020,
    startY: 1620,
    destinationX: 280,
    destinationY: 270,
    destinationRadius: 68,
    destinationLabel: 'SỞ CHỈ HUY MƯỜNG PHĂNG',
    roadHalfWidth: 56,
    roadNodes: [
      { id: 's', x: 2020, y: 1620 },
      { id: 'j1', x: 1680, y: 1460 },
      { id: 'n1', x: 1860, y: 940 },
      { id: 'n2', x: 1620, y: 420 },
      { id: 'n3', x: 960, y: 310 },
      { id: 'c1', x: 1240, y: 1180 },
      { id: 'c2', x: 1040, y: 740 },
      { id: 's1', x: 1140, y: 1600 },
      { id: 's2', x: 560, y: 1420 },
      { id: 's3', x: 390, y: 860 },
      { id: 'd', x: 280, y: 270 }
    ],
    roadEdges: [
      ['s', 'j1'],
      ['j1', 'n1'],
      ['n1', 'n2'],
      ['n2', 'n3'],
      ['n3', 'd'],
      ['j1', 'c1'],
      ['c1', 'c2'],
      ['c2', 'n3'],
      ['c2', 's3'],
      ['n1', 'c2'],
      ['j1', 's1'],
      ['s1', 's2'],
      ['s2', 's3'],
      ['s3', 'd'],
      ['c1', 's2']
    ],
    hasIndependencePalaceGate: false,
    palette: {
      ground: 0xc9bc94,
      groundAlt: 0xb8a97e,
      road: 0xe6d9b8,
      roadBorder: 0xa69163,
      propDark: 0x7a6c49,
      propLight: 0x9b8c63,
      gridColor: 0x857550
    },
    ambushes: [
      { id: 'v2_a1', x: 1240, y: 1180, radius: 76, name: 'Cứ Điểm Him Lam' },
      { id: 'v2_a2', x: 1860, y: 940, radius: 76, name: 'Phi Đội B-26 · Pha Đin' },
      { id: 'v2_a3', x: 1040, y: 740, radius: 78, name: 'Đồi Độc Lập' },
      { id: 'v2_a4', x: 1620, y: 420, radius: 74, name: 'Pháo Phân Khu Bắc' },
      { id: 'v2_a5', x: 960, y: 310, radius: 76, name: 'Đồi A1 · Mường Thanh' }
    ],
    pickups: [
      { id: 'v2_p1', x: 1680, y: 1460 },
      { id: 'v2_p2', x: 1620, y: 420 },
      { id: 'v2_p3', x: 390, y: 860 }
    ]
  },

  // CHẶNG III: Liên Khu Miền Nam (nhánh Đông Bắc s->j1->n1->n2->n3->d sạch hoàn toàn)
  {
    index: 2,
    code: 'CHẶNG III',
    name: 'Liên Khu Miền Nam',
    era: '1955–1964',
    faction: 'nguy',
    factionLabel: 'Quân đội Sài Gòn',
    mapWidth: 2350,
    mapHeight: 1900,
    startX: 280,
    startY: 280,
    destinationX: 2060,
    destinationY: 1640,
    destinationRadius: 70,
    destinationLabel: 'CHIẾN KHU Đ',
    roadHalfWidth: 56,
    roadNodes: [
      { id: 's', x: 280, y: 280 },
      { id: 'j1', x: 640, y: 420 },
      { id: 'n1', x: 1240, y: 280 },
      { id: 'n2', x: 1860, y: 440 },
      { id: 'n3', x: 2020, y: 1020 },
      { id: 'c1', x: 1040, y: 820 },
      { id: 'c2', x: 1440, y: 1160 },
      { id: 'w1', x: 380, y: 920 },
      { id: 'w2', x: 680, y: 1480 },
      { id: 'w3', x: 1360, y: 1660 },
      { id: 'd', x: 2060, y: 1640 }
    ],
    roadEdges: [
      ['s', 'j1'],
      ['j1', 'n1'],
      ['n1', 'n2'],
      ['n2', 'n3'],
      ['n3', 'd'],
      ['j1', 'c1'],
      ['c1', 'c2'],
      ['c2', 'n3'],
      ['c2', 'w3'],
      ['n1', 'c1'],
      ['j1', 'w1'],
      ['w1', 'w2'],
      ['w2', 'w3'],
      ['w3', 'd'],
      ['w1', 'c1'],
      ['w2', 'c2']
    ],
    hasIndependencePalaceGate: false,
    palette: {
      ground: 0x9ec4b0,
      groundAlt: 0x8ab59e,
      road: 0xe2d8b8,
      roadBorder: 0xa89b74,
      propDark: 0x3b735a,
      propLight: 0x579678,
      gridColor: 0x4f7866
    },
    ambushes: [
      { id: 'v3_a1', x: 1040, y: 820, radius: 78, name: 'Trạm Chặn Sóng' },
      { id: 'v3_a2', x: 1440, y: 1160, radius: 78, name: 'Thiết Giáp M113' },
      { id: 'v3_a3', x: 380, y: 920, radius: 76, name: 'Chốt Ấp Chiến Lược' },
      { id: 'v3_a4', x: 680, y: 1480, radius: 76, name: 'Đội Càn Quét Đồng Bằng' },
      { id: 'v3_a5', x: 1360, y: 1660, radius: 76, name: 'Chốt Bến Sông' }
    ],
    pickups: [
      { id: 'v3_p1', x: 640, y: 420 },
      { id: 'v3_p2', x: 680, y: 1480 },
      { id: 'v3_p3', x: 1710, y: 1650 }
    ]
  },

  // CHẶNG IV: Tuyến Lửa Trường Sơn (nhánh Đông Nam s->j1->e1->e2->e3 sạch tuần tra, chốt cuối tái đấu B-52 tại d)
  {
    index: 3,
    code: 'CHẶNG IV',
    name: 'Tuyến Lửa Trường Sơn',
    era: '1965–1972',
    faction: 'my',
    factionLabel: 'Quân Mỹ · Không quân',
    mapWidth: 2400,
    mapHeight: 1950,
    startX: 2100,
    startY: 280,
    destinationX: 300,
    destinationY: 1680,
    destinationRadius: 72,
    destinationLabel: 'CỬA NGÕ ĐÔNG NAM BỘ',
    roadHalfWidth: 58,
    roadNodes: [
      { id: 's', x: 2100, y: 280 },
      { id: 'j1', x: 1740, y: 420 },
      { id: 'n1', x: 1160, y: 290 },
      { id: 'n2', x: 520, y: 390 },
      { id: 'n3', x: 330, y: 980 },
      { id: 'c1', x: 1380, y: 840 },
      { id: 'c2', x: 960, y: 1140 },
      { id: 'e1', x: 2020, y: 960 },
      { id: 'e2', x: 1680, y: 1520 },
      { id: 'e3', x: 1020, y: 1680 },
      { id: 'd', x: 300, y: 1680 }
    ],
    roadEdges: [
      ['s', 'j1'],
      ['j1', 'n1'],
      ['n1', 'n2'],
      ['n2', 'n3'],
      ['n3', 'd'],
      ['j1', 'c1'],
      ['c1', 'c2'],
      ['c2', 'n3'],
      ['c2', 'e3'],
      ['n1', 'c1'],
      ['n2', 'c2'],
      ['j1', 'e1'],
      ['e1', 'e2'],
      ['e2', 'e3'],
      ['e3', 'd'],
      ['c1', 'e2']
    ],
    hasIndependencePalaceGate: false,
    palette: {
      ground: 0xd0a888,
      groundAlt: 0xc09574,
      road: 0xe8ccae,
      roadBorder: 0xa37654,
      propDark: 0x7c523c,
      propLight: 0xa67054,
      gridColor: 0x8a6149
    },
    ambushes: [
      { id: 'v4_a1', x: 1160, y: 290, radius: 78, name: 'Biên Đội F-4 · Đèo Đá' },
      { id: 'v4_a2', x: 520, y: 390, radius: 78, name: 'Cảm Biến Điện Tử Tuyến Tây' },
      { id: 'v4_a3', x: 330, y: 980, radius: 78, name: 'Pháo Bầy & Biệt Kích' },
      { id: 'v4_a4', x: 1380, y: 840, radius: 80, name: 'F-4 Phantom · Tuyến 559' },
      { id: 'v4_a5', x: 960, y: 1140, radius: 82, name: 'Tọa Độ B-52' },
      {
        id: 'v4_rematch',
        x: 300,
        y: 1680,
        radius: 112,
        name: 'Tái Đấu · Biên Đội B-52 Cửa Ngõ',
        bossRole: 'rematch'
      }
    ],
    pickups: [
      { id: 'v4_p1', x: 1740, y: 420 },
      { id: 'v4_p2', x: 740, y: 765 },
      { id: 'v4_p3', x: 1360, y: 1600 }
    ]
  },

  // CHẶNG V: Tiến vào Sài Gòn (nhánh Đông s->j1->e1->e2->m->d sạch hoàn toàn)
  {
    index: 4,
    code: 'CHẶNG V',
    name: 'Tiến Vào Sài Gòn',
    era: '30/4/1975',
    faction: 'nguy_minus',
    factionLabel: 'Tàn quân Sài Gòn',
    mapWidth: 2200,
    mapHeight: 2200,
    startX: 1100,
    startY: 2000,
    destinationX: 1100,
    destinationY: 270,
    destinationRadius: 96,
    destinationLabel: 'CỔNG DINH ĐỘC LẬP',
    roadHalfWidth: 68,
    roadNodes: [
      { id: 's', x: 1100, y: 2000 },
      { id: 'j1', x: 1100, y: 1740 },
      { id: 'w1', x: 560, y: 1500 },
      { id: 'w2', x: 580, y: 1060 },
      { id: 'c1', x: 1100, y: 1300 },
      { id: 'e1', x: 1640, y: 1500 },
      { id: 'e2', x: 1620, y: 1060 },
      { id: 'm', x: 1100, y: 840 },
      { id: 'd', x: 1100, y: 270 }
    ],
    roadEdges: [
      ['s', 'j1'],
      ['j1', 'w1'],
      ['w1', 'w2'],
      ['w2', 'm'],
      ['j1', 'c1'],
      ['c1', 'm'],
      ['j1', 'e1'],
      ['e1', 'e2'],
      ['e2', 'm'],
      ['w1', 'c1'],
      ['e1', 'c1'],
      ['m', 'd']
    ],
    hasIndependencePalaceGate: true,
    palette: {
      ground: 0x9ec08d,
      groundAlt: 0x8fb37d,
      road: 0xcfd3d6,
      roadBorder: 0x8c9399,
      propDark: 0x3b6e3f,
      propLight: 0x5c965f,
      gridColor: 0x67756a
    },
    ambushes: [
      { id: 'v5_a1', x: 1100, y: 1300, radius: 74, name: 'Chốt Ngoại Ô Vỡ Trận' },
      { id: 'v5_a2', x: 560, y: 1500, radius: 72, name: 'Chốt Cầu Thị Nghè' },
      { id: 'v5_a3', x: 580, y: 1060, radius: 72, name: 'Chốt Cản Phía Tây' }
    ],
    pickups: [
      { id: 'v5_p1', x: 1100, y: 1740 },
      { id: 'v5_p2', x: 560, y: 1500 },
      { id: 'v5_p3', x: 1100, y: 840 }
    ]
  }
];

export function getRegionConfig(index: number): RegionConfig {
  const clamped = Math.max(0, Math.min(REGIONS.length - 1, index));
  return REGIONS[clamped];
}
