export type SkillId =
  | 'vision_1948'
  | 'ktb_1951'
  | 'truongson_1959'
  | 'pipeline_1975'
  | 'split_1946'
  | 'school_1951';

export interface CryptoSkillConfig {
  id: SkillId;
  name: string;
  intervalSec: number;
  maxIntervalSec: number;
  activeDurationSec: number;
  maxDurationSec: number;
  isPeriodic: boolean;
}

export const CRYPTO_SKILLS: readonly CryptoSkillConfig[] = [
  {
    id: 'vision_1948',
    name: 'Mật Mã Đại Cương (1948)',
    intervalSec: 4.5,
    maxIntervalSec: 3.0,
    activeDurationSec: 2.4,
    maxDurationSec: 3.2,
    isPeriodic: true
  },
  {
    id: 'ktb_1951',
    name: 'Hệ Mã KTB (1951)',
    intervalSec: 5.0,
    maxIntervalSec: 3.2,
    activeDurationSec: 2.2,
    maxDurationSec: 2.8,
    isPeriodic: true
  },
  {
    id: 'truongson_1959',
    name: 'Kỷ Luật Trường Sơn (1959)',
    intervalSec: 5.8,
    maxIntervalSec: 3.8,
    activeDurationSec: 2.6,
    maxDurationSec: 3.6,
    isPeriodic: true
  },
  {
    id: 'pipeline_1975',
    name: 'Mã Dịch Song Song (1975)',
    intervalSec: 5.2,
    maxIntervalSec: 3.4,
    activeDurationSec: 3.0,
    maxDurationSec: 3.8,
    isPeriodic: true
  },
  {
    id: 'split_1946',
    name: 'Tách Đầu Mối Liên Khu (1946)',
    intervalSec: 0,
    maxIntervalSec: 0,
    activeDurationSec: 0,
    maxDurationSec: 0,
    isPeriodic: false
  },
  {
    id: 'school_1951',
    name: 'Trường Mật Mã Quân Đội (1951)',
    intervalSec: 0,
    maxIntervalSec: 0,
    activeDurationSec: 0,
    maxDurationSec: 0,
    isPeriodic: false
  }
];

export function getSkillConfig(id: SkillId): CryptoSkillConfig {
  const found = CRYPTO_SKILLS.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Unknown skill id: ${id}`);
  }
  return found;
}
