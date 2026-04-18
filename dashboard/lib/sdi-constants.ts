// SDI Dashboard constants and data
// Data source: IHME GBD 2023 SDI dataset

export const SDI_YEARS = Array.from({ length: 34 }, (_, i) => 1990 + i);

export const SDI_COLORS = {
  global: "#60a5fa", // sky blue
  highIncome: "#f0c040", // amber
  asean: "#7dd3b0", // teal
  nonAsean: "#c084fc", // purple
  accent: "#38bdf8", // cyan
  high: "#4ade80", // green
  highMiddle: "#60a5fa", // blue
  lowMiddle: "#f0c040", // amber
  low: "#ef5a5a", // red
} as const;

// APAC country SDI time series (1990-2023, 34 values each)
export const APAC_SDI: Record<string, number[]> = {
  Bangladesh: [0.24, 0.2491, 0.2573, 0.2643, 0.2717, 0.2782, 0.284, 0.291, 0.298, 0.3042, 0.3101, 0.3153, 0.3199, 0.3246, 0.3309, 0.3381, 0.3456, 0.3537, 0.3622, 0.3711, 0.3804, 0.3908, 0.4031, 0.4163, 0.4294, 0.4415, 0.4525, 0.4629, 0.4731, 0.4825, 0.491, 0.4994, 0.5083, 0.5171],
  "Brunei Darussalam": [0.6771, 0.6827, 0.6884, 0.6941, 0.6997, 0.7053, 0.711, 0.7167, 0.7227, 0.729, 0.7355, 0.7422, 0.7491, 0.7558, 0.7622, 0.768, 0.7731, 0.7779, 0.7822, 0.7864, 0.7903, 0.7939, 0.7978, 0.8017, 0.8056, 0.8094, 0.813, 0.8163, 0.8193, 0.822, 0.8247, 0.8273, 0.8299, 0.8324],
  Cambodia: [0.2979, 0.3017, 0.3065, 0.3114, 0.3157, 0.3207, 0.3257, 0.3305, 0.3349, 0.3402, 0.346, 0.3524, 0.3592, 0.3666, 0.3747, 0.3834, 0.3923, 0.4012, 0.4097, 0.4172, 0.424, 0.4307, 0.4373, 0.4436, 0.4497, 0.4559, 0.4619, 0.468, 0.4741, 0.4802, 0.4852, 0.49, 0.495, 0.5],
  China: [0.4653, 0.4734, 0.4815, 0.4896, 0.4976, 0.5067, 0.517, 0.5271, 0.5359, 0.5445, 0.5523, 0.5589, 0.5656, 0.5725, 0.5806, 0.59, 0.6006, 0.611, 0.6208, 0.6302, 0.6422, 0.6521, 0.6571, 0.6613, 0.6651, 0.6671, 0.6702, 0.6781, 0.6871, 0.6963, 0.7057, 0.7139, 0.721, 0.7276],
  India: [0.3416, 0.3471, 0.3526, 0.3582, 0.3642, 0.3707, 0.3775, 0.384, 0.3908, 0.3976, 0.4042, 0.4104, 0.4163, 0.4224, 0.4289, 0.4358, 0.4432, 0.4511, 0.4589, 0.4673, 0.4765, 0.4862, 0.4968, 0.5081, 0.5198, 0.5318, 0.5437, 0.5549, 0.5655, 0.5752, 0.583, 0.5911, 0.599, 0.607],
  Indonesia: [0.4603, 0.4691, 0.4779, 0.4865, 0.4949, 0.503, 0.5108, 0.5185, 0.5243, 0.5293, 0.5336, 0.5377, 0.5421, 0.5466, 0.551, 0.5556, 0.5605, 0.5661, 0.5727, 0.5796, 0.5869, 0.5947, 0.6023, 0.6096, 0.6165, 0.6231, 0.6293, 0.6353, 0.641, 0.6466, 0.6514, 0.6561, 0.6609, 0.6657],
  Japan: [0.7957, 0.8, 0.8044, 0.8081, 0.8116, 0.8153, 0.8185, 0.821, 0.8231, 0.8249, 0.8265, 0.8281, 0.8301, 0.8324, 0.8348, 0.8369, 0.8386, 0.8404, 0.8423, 0.8438, 0.8459, 0.8482, 0.8502, 0.8523, 0.8545, 0.8567, 0.8589, 0.8613, 0.8639, 0.8665, 0.869, 0.8719, 0.874, 0.8759],
  "Lao People's Democratic Republic": [0.279, 0.2834, 0.2878, 0.2924, 0.2974, 0.3026, 0.3082, 0.3143, 0.3208, 0.3282, 0.3364, 0.3457, 0.3555, 0.3654, 0.375, 0.3846, 0.3945, 0.4045, 0.4139, 0.4231, 0.4318, 0.44, 0.4479, 0.4555, 0.4628, 0.4697, 0.4764, 0.4829, 0.489, 0.495, 0.5003, 0.5054, 0.5103, 0.515],
  Malaysia: [0.5689, 0.5744, 0.5808, 0.5889, 0.5978, 0.6067, 0.6162, 0.6267, 0.6367, 0.6458, 0.6549, 0.663, 0.6701, 0.6763, 0.6822, 0.6877, 0.6929, 0.6977, 0.7023, 0.7069, 0.7119, 0.7168, 0.7222, 0.7273, 0.7322, 0.7369, 0.7412, 0.7458, 0.7507, 0.7558, 0.7601, 0.7637, 0.7671, 0.7704],
  Myanmar: [0.3258, 0.3285, 0.332, 0.3359, 0.3405, 0.3457, 0.3512, 0.3569, 0.3627, 0.369, 0.3762, 0.3839, 0.3921, 0.4011, 0.4105, 0.4203, 0.43, 0.4394, 0.4479, 0.4559, 0.4634, 0.4703, 0.4758, 0.4823, 0.4887, 0.4948, 0.5006, 0.5063, 0.5122, 0.518, 0.5229, 0.526, 0.5291, 0.532],
  Philippines: [0.516, 0.5197, 0.5233, 0.527, 0.5311, 0.5354, 0.5396, 0.5433, 0.5461, 0.5486, 0.5512, 0.5533, 0.5552, 0.557, 0.5587, 0.5602, 0.562, 0.5642, 0.567, 0.57, 0.5743, 0.5797, 0.5866, 0.594, 0.602, 0.6103, 0.619, 0.6278, 0.6366, 0.6452, 0.6517, 0.6579, 0.6639, 0.6694],
  "Republic of Korea": [0.7012, 0.7112, 0.7206, 0.73, 0.7395, 0.7488, 0.758, 0.7666, 0.7739, 0.782, 0.7902, 0.7978, 0.8049, 0.8112, 0.8168, 0.8219, 0.8266, 0.8313, 0.8358, 0.8397, 0.8438, 0.8479, 0.8518, 0.8556, 0.8595, 0.8633, 0.8674, 0.8714, 0.8753, 0.879, 0.8822, 0.8856, 0.8886, 0.8917],
  Singapore: [0.6976, 0.7064, 0.7147, 0.7235, 0.7323, 0.741, 0.75, 0.7585, 0.7658, 0.7708, 0.7776, 0.7846, 0.7901, 0.7949, 0.8005, 0.8071, 0.8141, 0.8214, 0.829, 0.8344, 0.8383, 0.8416, 0.8452, 0.8486, 0.8513, 0.8542, 0.8569, 0.859, 0.8611, 0.863, 0.8649, 0.8667, 0.8683, 0.87],
  Thailand: [0.4994, 0.5083, 0.5173, 0.5263, 0.5351, 0.5441, 0.5527, 0.5598, 0.5651, 0.5699, 0.5742, 0.5781, 0.582, 0.5862, 0.5905, 0.5948, 0.5994, 0.6043, 0.6098, 0.6158, 0.6211, 0.6249, 0.6299, 0.6356, 0.6413, 0.647, 0.6529, 0.6588, 0.6648, 0.6705, 0.6751, 0.6794, 0.6835, 0.6872],
  "Viet Nam": [0.4142, 0.4196, 0.4261, 0.4336, 0.4419, 0.4507, 0.46, 0.4701, 0.4804, 0.4896, 0.4976, 0.5051, 0.5128, 0.5211, 0.5295, 0.5374, 0.5448, 0.5519, 0.5586, 0.5646, 0.5703, 0.5757, 0.5811, 0.5864, 0.5918, 0.5973, 0.6027, 0.6084, 0.6143, 0.6203, 0.6261, 0.6315, 0.6373, 0.643],
};

export const IS_ASEAN: Record<string, boolean> = {
  Bangladesh: false,
  "Brunei Darussalam": true,
  Cambodia: true,
  China: false,
  India: false,
  Indonesia: true,
  Japan: false,
  "Lao People's Democratic Republic": true,
  Malaysia: true,
  Myanmar: true,
  Philippines: true,
  "Republic of Korea": false,
  Singapore: true,
  Thailand: true,
  "Viet Nam": true,
};

export const SDI_SHORT_NAMES: Record<string, string> = {
  Bangladesh: "Bangladesh",
  "Brunei Darussalam": "Brunei",
  Cambodia: "Cambodia",
  China: "China",
  India: "India",
  Indonesia: "Indonesia",
  Japan: "Japan",
  "Lao People's Democratic Republic": "Lao PDR",
  Malaysia: "Malaysia",
  Myanmar: "Myanmar",
  Philippines: "Philippines",
  "Republic of Korea": "Korea",
  Singapore: "Singapore",
  Thailand: "Thailand",
  "Viet Nam": "Viet Nam",
};

export const SDI_COUNTRY_COLORS: Record<string, string> = {
  Bangladesh: "#ef4444",
  "Brunei Darussalam": "#f59e0b",
  Cambodia: "#84cc16",
  China: "#eab308",
  India: "#f97316",
  Indonesia: "#22d3a5",
  Japan: "#14b8a6",
  "Lao People's Democratic Republic": "#6ee7b7",
  Malaysia: "#38bdf8",
  Myanmar: "#a78bfa",
  Philippines: "#e879f9",
  "Republic of Korea": "#06b6d4",
  Singapore: "#818cf8",
  Thailand: "#fb923c",
  "Viet Nam": "#34d399",
};

// World region SDI series 1990-2023
export const WORLD_SDI: Record<string, number[]> = {
  Global: [0.5665, 0.5722, 0.5776, 0.5831, 0.5884, 0.5935, 0.5985, 0.6029, 0.6073, 0.6117, 0.6162, 0.6209, 0.6256, 0.6302, 0.6349, 0.6393, 0.6438, 0.6483, 0.6527, 0.6569, 0.6609, 0.6648, 0.6686, 0.672, 0.6754, 0.679, 0.6834, 0.6876, 0.691, 0.694, 0.6656, 0.6707, 0.6756, 0.6804],
  "High-income": [0.7975, 0.8012, 0.8048, 0.8081, 0.8115, 0.8148, 0.8179, 0.8205, 0.8228, 0.8253, 0.8277, 0.8304, 0.8332, 0.836, 0.839, 0.8419, 0.8444, 0.8469, 0.8493, 0.8514, 0.8537, 0.8561, 0.8584, 0.8606, 0.8628, 0.8649, 0.8669, 0.8692, 0.8712, 0.8731, 0.8584, 0.8614, 0.8641, 0.8665],
  "East Asia": [0.4653, 0.475, 0.4848, 0.4946, 0.5043, 0.5147, 0.5262, 0.5374, 0.5471, 0.5558, 0.564, 0.5712, 0.5779, 0.5847, 0.5929, 0.6023, 0.6136, 0.6247, 0.6352, 0.6451, 0.6575, 0.6666, 0.6712, 0.6751, 0.679, 0.6813, 0.6849, 0.6934, 0.702, 0.7108, 0.7091, 0.7172, 0.7241, 0.7306],
  "Southeast Asia": [0.4893, 0.497, 0.5049, 0.5133, 0.5213, 0.5298, 0.5388, 0.5476, 0.5542, 0.5603, 0.566, 0.5716, 0.5772, 0.5829, 0.5887, 0.5946, 0.6008, 0.6073, 0.6142, 0.6212, 0.6276, 0.6329, 0.6383, 0.6436, 0.6487, 0.6539, 0.6594, 0.6648, 0.6702, 0.6754, 0.6473, 0.652, 0.6567, 0.6613],
  "South Asia": [0.3477, 0.3535, 0.3593, 0.3652, 0.3713, 0.378, 0.3851, 0.3919, 0.399, 0.4061, 0.4131, 0.4199, 0.4266, 0.4335, 0.4409, 0.4487, 0.457, 0.4659, 0.4745, 0.4836, 0.4934, 0.5037, 0.5148, 0.5267, 0.539, 0.5514, 0.5634, 0.5744, 0.5847, 0.5939, 0.5624, 0.5702, 0.5778, 0.5855],
  "Sub-Saharan Africa": [0.3395, 0.3428, 0.3459, 0.3487, 0.3514, 0.354, 0.3568, 0.3595, 0.3618, 0.3638, 0.3657, 0.3678, 0.37, 0.3724, 0.375, 0.3779, 0.3813, 0.3851, 0.3892, 0.3937, 0.3986, 0.4041, 0.4099, 0.4161, 0.4222, 0.4286, 0.4353, 0.4421, 0.4491, 0.4559, 0.4549, 0.4613, 0.4678, 0.4741],
  "Latin America": [0.5883, 0.5928, 0.5977, 0.6024, 0.6071, 0.612, 0.617, 0.6219, 0.6257, 0.6295, 0.6334, 0.6373, 0.6415, 0.6457, 0.6499, 0.654, 0.6582, 0.6623, 0.666, 0.6696, 0.673, 0.676, 0.6793, 0.6826, 0.6858, 0.6888, 0.6918, 0.6948, 0.6975, 0.7001, 0.658, 0.6661, 0.6702, 0.6744],
  MENA: [0.519, 0.5238, 0.5283, 0.5329, 0.5377, 0.543, 0.5484, 0.5541, 0.5596, 0.5653, 0.5711, 0.5769, 0.5829, 0.5889, 0.595, 0.6012, 0.6073, 0.6133, 0.6191, 0.6248, 0.6302, 0.6354, 0.6404, 0.6456, 0.6509, 0.656, 0.6614, 0.6668, 0.6723, 0.6776, 0.6625, 0.6693, 0.6764, 0.6842],
};

export const WORLD_REGION_COLORS: Record<string, string> = {
  Global: "#60a5fa",
  "High-income": "#f0c040",
  "East Asia": "#22d3a5",
  "Southeast Asia": "#7dd3b0",
  "South Asia": "#fb923c",
  "Sub-Saharan Africa": "#ef5a5a",
  "Latin America": "#c084fc",
  MENA: "#fbbf24",
};

// Global ranking data for 2023 (sampled)
export const GLOBAL_RANKS_2023 = [
  { name: "Switzerland", sdi: 0.946, rank: 1, isAPAC: false },
  { name: "Norway", sdi: 0.917, rank: 2, isAPAC: false },
  { name: "Denmark", sdi: 0.916, rank: 3, isAPAC: false },
  { name: "Sweden", sdi: 0.911, rank: 4, isAPAC: false },
  { name: "Netherlands", sdi: 0.908, rank: 5, isAPAC: false },
  { name: "Ireland", sdi: 0.907, rank: 6, isAPAC: false },
  { name: "Iceland", sdi: 0.889, rank: 7, isAPAC: false },
  { name: "Republic of Korea", sdi: 0.892, rank: 8, isAPAC: true },
  { name: "Finland", sdi: 0.891, rank: 9, isAPAC: false },
  { name: "Luxembourg", sdi: 0.895, rank: 10, isAPAC: false },
  { name: "Canada", sdi: 0.887, rank: 12, isAPAC: false },
  { name: "Germany", sdi: 0.879, rank: 15, isAPAC: false },
  { name: "United States", sdi: 0.876, rank: 18, isAPAC: false },
  { name: "Japan", sdi: 0.876, rank: 19, isAPAC: true },
  { name: "Singapore", sdi: 0.87, rank: 20, isAPAC: true },
  { name: "Australia", sdi: 0.853, rank: 28, isAPAC: false },
  { name: "Brunei Darussalam", sdi: 0.832, rank: 35, isAPAC: true },
  { name: "Malaysia", sdi: 0.77, rank: 56, isAPAC: true },
  { name: "China", sdi: 0.728, rank: 71, isAPAC: true },
  { name: "Thailand", sdi: 0.687, rank: 90, isAPAC: true },
  { name: "Philippines", sdi: 0.669, rank: 100, isAPAC: true },
  { name: "Indonesia", sdi: 0.666, rank: 101, isAPAC: true },
  { name: "Viet Nam", sdi: 0.643, rank: 110, isAPAC: true },
  { name: "India", sdi: 0.607, rank: 121, isAPAC: true },
  { name: "Myanmar", sdi: 0.532, rank: 137, isAPAC: true },
  { name: "Bangladesh", sdi: 0.517, rank: 142, isAPAC: true },
  { name: "Lao PDR", sdi: 0.515, rank: 143, isAPAC: true },
  { name: "Cambodia", sdi: 0.5, rank: 148, isAPAC: true },
  { name: "Haiti", sdi: 0.464, rank: 158, isAPAC: false },
  { name: "Ethiopia", sdi: 0.394, rank: 172, isAPAC: false },
  { name: "Chad", sdi: 0.239, rank: 186, isAPAC: false },
];

// Global rank lookup for APAC countries
export const APAC_GLOBAL_RANKS: Record<string, number> = {
  "Republic of Korea": 8,
  Japan: 19,
  Singapore: 20,
  "Brunei Darussalam": 35,
  Malaysia: 56,
  China: 71,
  Thailand: 90,
  Philippines: 100,
  Indonesia: 101,
  "Viet Nam": 110,
  India: 121,
  Myanmar: 137,
  Bangladesh: 142,
  "Lao People's Democratic Republic": 143,
  Cambodia: 148,
};

// Distribution bins and counts
export const SDI_DIST_BINS = ["<0.30", "0.30-0.40", "0.40-0.50", "0.50-0.60", "0.60-0.70", "0.70-0.80", "0.80-0.90", ">0.90"];
export const SDI_DIST_COUNTS = [5, 12, 27, 33, 38, 34, 28, 9];

// Tier counts
export const SDI_TIER_DATA = [
  { label: "High (>0.80)", count: 45, color: "#4ade80", bgColor: "#0f2a1a" },
  { label: "High-Middle (0.62-0.80)", count: 74, color: "#60a5fa", bgColor: "#0a1f2e" },
  { label: "Low-Middle (0.45-0.62)", count: 45, color: "#f0c040", bgColor: "#2a1e00" },
  { label: "Low (<0.45)", count: 22, color: "#ef5a5a", bgColor: "#2a0f0f" },
];

// Helper function to get SDI tier
export function getSDITier(value: number): { label: string; className: string } {
  if (value >= 0.8) return { label: "High", className: "bg-green-900/50 text-green-400 border-green-700" };
  if (value >= 0.62) return { label: "High-Middle", className: "bg-blue-900/50 text-blue-400 border-blue-700" };
  if (value >= 0.45) return { label: "Low-Middle", className: "bg-yellow-900/50 text-yellow-400 border-yellow-700" };
  return { label: "Low", className: "bg-red-900/50 text-red-400 border-red-700" };
}

// Helper to calculate average
export function avg(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// Get APAC country keys
export const APAC_KEYS = Object.keys(APAC_SDI);
export const ASEAN_KEYS = APAC_KEYS.filter((k) => IS_ASEAN[k]);
export const NON_ASEAN_KEYS = APAC_KEYS.filter((k) => !IS_ASEAN[k]);
