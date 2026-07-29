// ============================================================
// AutoWash Pro — Comprehensive Vietnam Car Database & Classifier
// ============================================================

export type VehicleSize = 'SMALL' | 'MEDIUM' | 'LARGE'

export interface CarModelInfo {
  name: string
  size: VehicleSize
  categoryText: string
  description?: string
}

export interface CarBrandInfo {
  id: string
  name: string
  country?: string
  logoUrl?: string
  logoText?: string
  models: CarModelInfo[]
}

export interface SearchResultItem {
  brandName: string
  modelName: string
  size: VehicleSize
  categoryText: string
  confidencePct: number
  reason: string
}

export const CAR_DATABASE: Record<string, CarBrandInfo> = {
  vinfast: {
    id: "vinfast",
    name: "VinFast",
    country: "Việt Nam",
    logoUrl: "/images/car-logos/vinfast.svg",
    models: [
      {name: "VF3", size: "SMALL", categoryText: "Mini EV / Ô tô điện cỡ nhỏ" },
      { name: "VF5", size: "SMALL", categoryText: "CUV cỡ A / Xe nhỏ đô thị" },
      { name: "Fadil", size: "SMALL", categoryText: "Hatchback hạng A" },
      { name: "VF e34", size: "MEDIUM", categoryText: "CUV cỡ C phổ thông" },
      { name: "VF6", size: "MEDIUM", categoryText: "CUV cỡ B đô thị" },
      { name: "VF7", size: "MEDIUM", categoryText: "CUV cỡ C thể thao" },
      { name: "VF8", size: "MEDIUM", categoryText: "SUV cỡ D 5 chỗ cao cấp" },
      { name: "Lux A2.0", size: "MEDIUM", categoryText: "Sedan hạng D sang trọng" },
      { name: "VF9", size: "LARGE", categoryText: "SUV cỡ E 7 chỗ cỡ lớn" },
      { name: "Lux SA2.0", size: "LARGE", categoryText: "SUV cỡ E 7 chỗ" },
      { name: "President", size: "LARGE", categoryText: "SUV cỡ E hạng sang" },
      { name: "VF Wild", size: "LARGE", categoryText: "Xe bán tải điện (Pickup EV)" },
    ]
  },
  toyota: {
    id: "toyota",
    name: "Toyota",
    country: "Nhật Bản",
    logoUrl: "https://cdn.simpleicons.org/toyota/eb0a1e",
    models: [
      { name: "Wigo", size: "SMALL", categoryText: "Hatchback hạng A" },
      { name: "Vios", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "Raize", size: "SMALL", categoryText: "CUV cỡ A" },
      { name: "Yaris", size: "SMALL", categoryText: "Hatchback hạng B" },
      { name: "Camry", size: "MEDIUM", categoryText: "Sedan hạng D" },
      { name: "Corolla Altis", size: "MEDIUM", categoryText: "Sedan hạng C" },
      { name: "Corolla Cross", size: "MEDIUM", categoryText: "CUV cỡ C" },
      { name: "Yaris Cross", size: "MEDIUM", categoryText: "CUV cỡ B" },
      { name: "Veloz Cross", size: "MEDIUM", categoryText: "MPV 7 chỗ cỡ vừa" },
      { name: "Avanza Premio", size: "MEDIUM", categoryText: "MPV 7 chỗ" },
      { name: "Rush", size: "MEDIUM", categoryText: "CUV/SUV 7 chỗ cỡ vừa" },
      { name: "Fortuner", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Innova / Cross", size: "LARGE", categoryText: "MPV 7-8 chỗ" },
      { name: "Land Cruiser", size: "LARGE", categoryText: "SUV cỡ lớn hạng sang" },
      { name: "Land Cruiser Prado", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Alphard", size: "LARGE", categoryText: "MPV thương gia cỡ lớn" },
      { name: "Hilux", size: "LARGE", categoryText: "Xe bán tải (Pickup)" },
    ]
  },
  honda: {
    id: "honda",
    name: "Honda",
    country: "Nhật Bản",
    logoUrl: "https://cdn.simpleicons.org/honda/e60012",
    models: [
      { name: "Brio", size: "SMALL", categoryText: "Hatchback hạng A" },
      { name: "Jazz", size: "SMALL", categoryText: "Hatchback hạng B" },
      { name: "City", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "Civic", size: "MEDIUM", categoryText: "Sedan hạng C thể thao" },
      { name: "Civic Type R", size: "MEDIUM", categoryText: "Hatchback thể thao hiệu năng cao" },
      { name: "HR-V", size: "MEDIUM", categoryText: "CUV cỡ B" },
      { name: "CR-V", size: "MEDIUM", categoryText: "CUV/SUV cỡ C 5-7 chỗ" },
      { name: "BR-V", size: "MEDIUM", categoryText: "MPV 7 chỗ cỡ vừa" },
      { name: "Accord", size: "MEDIUM", categoryText: "Sedan hạng D cao cấp" },
      { name: "Odyssey", size: "LARGE", categoryText: "MPV cỡ lớn gia đình" },
    ]
  },
  hyundai: {
    id: "hyundai",
    name: "Hyundai",
    country: "Hàn Quốc",
    logoUrl: "https://cdn.simpleicons.org/hyundai/002c6c",
    models: [
      { name: "Grand i10", size: "SMALL", categoryText: "Hatchback/Sedan hạng A" },
      { name: "Accent", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "Venue", size: "SMALL", categoryText: "CUV cỡ A đô thị" },
      { name: "Kona", size: "MEDIUM", categoryText: "CUV cỡ B phong cách" },
      { name: "Elantra", size: "MEDIUM", categoryText: "Sedan hạng C" },
      { name: "Creta", size: "MEDIUM", categoryText: "CUV cỡ B" },
      { name: "Tucson", size: "MEDIUM", categoryText: "CUV cỡ C" },
      { name: "Custin", size: "MEDIUM", categoryText: "MPV 7 chỗ cỡ trung" },
      { name: "Stargazer", size: "MEDIUM", categoryText: "MPV 7 chỗ" },
      { name: "Santa Fe", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Palisade", size: "LARGE", categoryText: "SUV 7-8 chỗ cỡ lớn" },
      { name: "Staria", size: "LARGE", categoryText: "MPV cỡ lớn gia đình" },
    ]
  },
  kia: {
    id: "kia",
    name: "Kia",
    country: "Hàn Quốc",
    logoUrl: "https://cdn.simpleicons.org/kia/05141f",
    models: [
      { name: "Morning", size: "SMALL", categoryText: "Hatchback hạng A" },
      { name: "Soluto", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "Sonet", size: "SMALL", categoryText: "CUV cỡ A" },
      { name: "K3 / Cerato", size: "MEDIUM", categoryText: "Sedan hạng C" },
      { name: "K5 / Optima", size: "MEDIUM", categoryText: "Sedan hạng D" },
      { name: "Seltos", size: "MEDIUM", categoryText: "CUV cỡ B" },
      { name: "Sportage", size: "MEDIUM", categoryText: "CUV cỡ C" },
      { name: "Carens / Rondo", size: "MEDIUM", categoryText: "MPV 7 chỗ" },
      { name: "Sorento", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Carnival / Sedona", size: "LARGE", categoryText: "MPV cỡ đại 7-8 chỗ" },
      { name: "EV6", size: "MEDIUM", categoryText: "CUV điện cỡ trung" },
    ]
  },
  ford: {
    id: "ford",
    name: "Ford",
    country: "Mỹ",
    logoUrl: "https://cdn.simpleicons.org/ford/003478",
    models: [
      { name: "Fiesta", size: "SMALL", categoryText: "Hatchback hạng B" },
      { name: "EcoSport", size: "SMALL", categoryText: "CUV cỡ B nhỏ gọn" },
      { name: "Focus", size: "MEDIUM", categoryText: "Hatchback/Sedan hạng C" },
      { name: "Mustang", size: "MEDIUM", categoryText: "Xe thể thao cơ bắp 2 cửa" },
      { name: "Territory", size: "MEDIUM", categoryText: "CUV cỡ C rộng rãi" },
      { name: "Ranger / Raptor", size: "LARGE", categoryText: "Xe bán tải (Pickup)" },
      { name: "Everest", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Explorer", size: "LARGE", categoryText: "SUV 7 chỗ cỡ đại" },
    ]
  },
  mazda: {
    id: "mazda",
    name: "Mazda",
    country: "Nhật Bản",
    logoUrl: "https://cdn.simpleicons.org/mazda/101010",
    models: [
      { name: "Mazda2", size: "SMALL", categoryText: "Hatchback/Sedan hạng B" },
      { name: "Mazda3", size: "MEDIUM", categoryText: "Sedan/Hatchback hạng C" },
      { name: "Mazda6", size: "MEDIUM", categoryText: "Sedan hạng D" },
      { name: "CX-3", size: "MEDIUM", categoryText: "CUV cỡ B" },
      { name: "CX-30", size: "MEDIUM", categoryText: "CUV cỡ B+" },
      { name: "CX-5", size: "MEDIUM", categoryText: "CUV cỡ C" },
      { name: "CX-8", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "BT-50", size: "LARGE", categoryText: "Xe bán tải (Pickup)" },
    ]
  },
  mercedes: {
    id: "mercedes",
    name: "Mercedes-Benz",
    country: "Đức",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/archive/4/48/20220619140935%21Mercedes-Benz_logo.svg",
    models: [
      { name: "A-Class / CLA", size: "SMALL", categoryText: "Hatchback/Coupe hạng sang nhỏ gọn" },
      { name: "C-Class (C200, C300, C63 AMG)", size: "MEDIUM", categoryText: "Sedan hạng sang cỡ vừa" },
      { name: "E-Class (E180, E200, E300)", size: "MEDIUM", categoryText: "Sedan hạng sang cỡ trung" },
      { name: "CLE / CLS Coupe", size: "MEDIUM", categoryText: "Coupe thể thao 4 cửa sang trọng" },
      { name: "GLA / GLB", size: "MEDIUM", categoryText: "SUV 5+2 chỗ cỡ vừa hạng sang" },
      { name: "GLC (GLC200, GLC300, GLC43 AMG)", size: "MEDIUM", categoryText: "SUV cỡ C hạng sang" },
      { name: "S-Class (S450, S500)", size: "LARGE", categoryText: "Sedan hạng sang cỡ đại" },
      { name: "Maybach S-Class (S580, S680)", size: "LARGE", categoryText: "Siêu sedan siêu sang" },
      { name: "GLE / GLE Coupe", size: "LARGE", categoryText: "SUV 7 chỗ hạng sang" },
      { name: "GLS (GLS450, GLS600 Maybach)", size: "LARGE", categoryText: "SUV cỡ đại 7 chỗ" },
      { name: "G-Class (G500, G63 AMG)", size: "LARGE", categoryText: "SUV địa hình huyền thoại" },
      { name: "Mercedes-AMG GT (GT 53, GT 63)", size: "MEDIUM", categoryText: "Siêu xe thể thao hiệu năng cao" },
      { name: "EQB / EQE / EQE SUV", size: "MEDIUM", categoryText: "SUV điện hạng sang" },
      { name: "EQS / EQS SUV", size: "LARGE", categoryText: "Sedan / SUV điện cỡ đại siêu sang" },
      { name: "V-Class / Vito", size: "LARGE", categoryText: "MPV thương gia cỡ lớn" },
    ]
  },
  bmw: {
    id: "bmw",
    name: "BMW",
    country: "Đức",
    logoUrl: "https://cdn.simpleicons.org/bmw/0066b1",
    models: [
      { name: "1 Series / 2 Series", size: "SMALL", categoryText: "Sedan/Hatchback cỡ nhỏ" },
      { name: "3 Series (320i, 330i)", size: "MEDIUM", categoryText: "Sedan hạng sang cỡ vừa" },
      { name: "4 Series Gran Coupe", size: "MEDIUM", categoryText: "Coupe 4 cửa thể thao" },
      { name: "5 Series (520i, 530i)", size: "MEDIUM", categoryText: "Sedan hạng sang cỡ trung" },
      { name: "X1 / X2", size: "MEDIUM", categoryText: "CUV cỡ B hạng sang" },
      { name: "X3 / X4", size: "MEDIUM", categoryText: "SUV cỡ C thể thao" },
      { name: "7 Series (735i, 740i)", size: "LARGE", categoryText: "Sedan hạng sang cỡ đại" },
      { name: "X5 / X6", size: "LARGE", categoryText: "SUV cỡ trung 5-7 chỗ" },
      { name: "X7", size: "LARGE", categoryText: "SUV 7 chỗ cỡ đại" },
      { name: "XM", size: "LARGE", categoryText: "SUV siêu hiệu năng" },
    ]
  },
  audi: {
    id: "audi",
    name: "Audi",
    country: "Đức",
    logoUrl: "https://cdn.simpleicons.org/audi/bb0a30",
    models: [
      { name: "A1 / A3", size: "SMALL", categoryText: "Sedan/Hatchback cỡ nhỏ" },
      { name: "A4 / A5", size: "MEDIUM", categoryText: "Sedan/Coupe cỡ vừa" },
      { name: "A6 / A7", size: "MEDIUM", categoryText: "Sedan/Sportback cỡ trung" },
      { name: "Q2 / Q3", size: "MEDIUM", categoryText: "CUV cỡ B/C hạng sang" },
      { name: "Q5", size: "MEDIUM", categoryText: "SUV cỡ C hạng sang" },
      { name: "A8L", size: "LARGE", categoryText: "Sedan hạng sang cỡ đại" },
      { name: "Q7 / Q8", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "e-tron GT", size: "MEDIUM", categoryText: "Sedan điện thể thao" },
    ]
  },
  porsche: {
    id: "porsche",
    name: "Porsche",
    country: "Đức",
    logoUrl: "https://cdn.simpleicons.org/porsche/d4af37",
    models: [
      { name: "718 Cayman / Boxster", size: "SMALL", categoryText: "Xe thể thao 2 chỗ" },
      { name: "911 Carrera / Turbo S", size: "SMALL", categoryText: "Huyền thoại xe thể thao" },
      { name: "Macan / Macan EV", size: "MEDIUM", categoryText: "SUV cỡ nhỏ thể thao" },
      { name: "Taycan", size: "MEDIUM", categoryText: "Sedan điện hiệu năng cao" },
      { name: "Panamera", size: "MEDIUM", categoryText: "Sedan thể thao 4 cửa" },
      { name: "Cayenne / Coupe", size: "LARGE", categoryText: "SUV cỡ trung hạng sang" },
    ]
  },
  ferrari: {
    id: "ferrari",
    name: "Ferrari",
    country: "Ý",
    logoUrl: "https://cdn.simpleicons.org/ferrari/ff2800",
    models: [
      { name: "488 GTB / Spider", size: "SMALL", categoryText: "Siêu xe thể thao động cơ V8" },
      { name: "F8 Tributo", size: "SMALL", categoryText: "Siêu xe thể thao thế hệ mới" },
      { name: "SF90 Stradale", size: "MEDIUM", categoryText: "Siêu xe Hybrid 1000 mã lực" },
      { name: "Roma / Roma Spider", size: "MEDIUM", categoryText: "Siêu xe Coupe 2+2 phong cách Ý" },
      { name: "296 GTB / GTS", size: "SMALL", categoryText: "Siêu xe V6 Hybrid" },
      { name: "812 Superfast / GTS", size: "MEDIUM", categoryText: "Siêu xe V12 động cơ trước" },
      { name: "Purosangue", size: "LARGE", categoryText: "Siêu SUV V12 4 cửa" },
    ]
  },
  lamborghini: {
    id: "lamborghini",
    name: "Lamborghini",
    country: "Ý",
    logoUrl: "https://cdn.simpleicons.org/lamborghini/d4af37",
    models: [
      { name: "Huracán (EVO, STO, Tecnica)", size: "SMALL", categoryText: "Siêu xe thể thao V10" },
      { name: "Aventador (S, SVJ)", size: "MEDIUM", categoryText: "Siêu xe V12 cửa cắt kéo" },
      { name: "Revuelto", size: "MEDIUM", categoryText: "Siêu xe V12 Hybrid" },
      { name: "Urus / Urus Performante", size: "LARGE", categoryText: "Siêu SUV thể thao cỡ lớn" },
    ]
  },
  mclaren: {
    id: "mclaren",
    name: "McLaren",
    country: "Anh",
    logoUrl: "https://cdn.simpleicons.org/mclaren/ff9800",
    models: [
      { name: "720S / 765LT", size: "SMALL", categoryText: "Siêu xe khung carbon" },
      { name: "Artura", size: "SMALL", categoryText: "Siêu xe V6 Hybrid" },
      { name: "GT", size: "MEDIUM", categoryText: "Siêu xe Grand Tourer" },
      { name: "650S / 570S", size: "SMALL", categoryText: "Siêu xe thể thao" },
      { name: "Senna", size: "SMALL", categoryText: "Hypercar đua đường phố" },
    ]
  },
  rollsroyce: {
    id: "rollsroyce",
    name: "Rolls-Royce",
    country: "Anh",
    logoUrl: "https://cdn.simpleicons.org/rollsroyce/000000",
    models: [
      { name: "Ghost / Ghost Extended", size: "LARGE", categoryText: "Siêu sedan siêu sang" },
      { name: "Phantom VIII / LWB", size: "LARGE", categoryText: "Biểu tượng siêu xe sang cỡ đại" },
      { name: "Wraith / Dawn", size: "MEDIUM", categoryText: "Siêu xe Coupe/Mui trần siêu sang" },
      { name: "Cullinan / Black Badge", size: "LARGE", categoryText: "Siêu SUV siêu sang cỡ đại" },
      { name: "Spectre", size: "LARGE", categoryText: "Siêu xe coupe điện siêu sang" },
    ]
  },
  tesla: {
    id: "tesla",
    name: "Tesla",
    country: "Mỹ",
    logoUrl: "https://cdn.simpleicons.org/tesla/cc0000",
    models: [
      { name: "Model 3", size: "SMALL", categoryText: "Sedan điện đô thị" },
      { name: "Model Y", size: "MEDIUM", categoryText: "CUV điện 5 chỗ" },
      { name: "Model S / Plaid", size: "MEDIUM", categoryText: "Sedan điện hiệu năng cao" },
      { name: "Model X / Plaid", size: "LARGE", categoryText: "SUV điện cửa cánh chim" },
      { name: "Cybertruck", size: "LARGE", categoryText: "Bán tải điện chống đạn" },
    ]
  },
  lexus: {
    id: "lexus",
    name: "Lexus",
    country: "Nhật Bản",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/42/Lexus-cars-logo-emblem.jpg",
    models: [
      { name: "IS 300", size: "MEDIUM", categoryText: "Sedan thể thao cỡ vừa" },
      { name: "ES 250 / ES 300h", size: "MEDIUM", categoryText: "Sedan hạng sang cỡ trung" },
      { name: "NX 350", size: "MEDIUM", categoryText: "SUV cỡ C hạng sang" },
      { name: "RX 350 / RX 500h", size: "MEDIUM", categoryText: "SUV 5 chỗ cỡ trung" },
      { name: "LS 500", size: "LARGE", categoryText: "Sedan hạng sang cỡ đại" },
      { name: "GX 460 / GX 550", size: "LARGE", categoryText: "SUV 7 chỗ địa hình" },
      { name: "LX 570 / LX 600", size: "LARGE", categoryText: "SUV cỡ đại 7 chỗ" },
      { name: "LM 350 / LM 500h", size: "LARGE", categoryText: "MPV siêu sang 4-7 chỗ" },
    ]
  },
  mitsubishi: {
    id: "mitsubishi",
    name: "Mitsubishi",
    country: "Nhật Bản",
    logoUrl: "https://cdn.simpleicons.org/mitsubishi/e60012",
    models: [
      { name: "Attrage", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "Mirage", size: "SMALL", categoryText: "Hatchback hạng A" },
      { name: "Xforce", size: "MEDIUM", categoryText: "CUV cỡ B thế hệ mới" },
      { name: "Xpander / Cross", size: "MEDIUM", categoryText: "MPV 7 chỗ cỡ vừa" },
      { name: "Outlander", size: "MEDIUM", categoryText: "CUV 5+2 chỗ" },
      { name: "Pajero Sport", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Triton", size: "LARGE", categoryText: "Xe bán tải (Pickup)" },
    ]
  },
  nissan: {
    id: "nissan",
    name: "Nissan",
    country: "Nhật Bản",
    logoUrl: "https://cdn.simpleicons.org/nissan/c31432",
    models: [
      { name: "Sunny / Almera", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "Kicks e-POWER", size: "MEDIUM", categoryText: "CUV cỡ B công nghệ Hybrid" },
      { name: "X-Trail", size: "MEDIUM", categoryText: "CUV 5+2 chỗ" },
      { name: "Navara", size: "LARGE", categoryText: "Xe bán tải (Pickup)" },
      { name: "Terra", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
    ]
  },
  suzuki: {
    id: "suzuki",
    name: "Suzuki",
    country: "Nhật Bản",
    logoUrl: "https://cdn.simpleicons.org/suzuki/e60012",
    models: [
      { name: "Celerio", size: "SMALL", categoryText: "Hatchback hạng A" },
      { name: "Swift", size: "SMALL", categoryText: "Hatchback hạng B" },
      { name: "Ciaz", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "Jimny", size: "SMALL", categoryText: "SUV địa hình nhỏ gọn" },
      { name: "Ertiga", size: "MEDIUM", categoryText: "MPV 7 chỗ" },
      { name: "XL7", size: "MEDIUM", categoryText: "SUV 7 chỗ cỡ nhỏ" },
    ]
  },
  subaru: {
    id: "subaru",
    name: "Subaru",
    country: "Nhật Bản",
    logoUrl: "https://cdn.simpleicons.org/subaru/013397",
    models: [
      { name: "BRZ", size: "SMALL", categoryText: "Coupe thể thao 2 cửa" },
      { name: "WRX", size: "MEDIUM", categoryText: "Sedan thể thao dẫn động 4 bánh" },
      { name: "Forester", size: "MEDIUM", categoryText: "CUV cỡ C việt dại" },
      { name: "Outback", size: "LARGE", categoryText: "Wagon 5 chỗ việt dại cỡ lớn" },
    ]
  },
  peugeot: {
    id: "peugeot",
    name: "Peugeot",
    country: "Pháp",
    logoUrl: "https://cdn.simpleicons.org/peugeot/00205b",
    models: [
      { name: "2008", size: "MEDIUM", categoryText: "CUV cỡ B châu Âu" },
      { name: "3008", size: "MEDIUM", categoryText: "CUV cỡ C phong cách Pháp" },
      { name: "408", size: "MEDIUM", categoryText: "Crossover Coupe phong cách" },
      { name: "5008", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Traveller", size: "LARGE", categoryText: "MPV cỡ đại 7-8 chỗ" },
    ]
  },
  mg: {
    id: "mg",
    name: "MG (Morris Garages)",
    country: "Anh / Trung Quốc",
    logoUrl: "https://cdn.simpleicons.org/mg/e60012",
    models: [
      { name: "MG3", size: "SMALL", categoryText: "Hatchback hạng B" },
      { name: "MG5", size: "MEDIUM", categoryText: "Sedan hạng C giá tốt" },
      { name: "ZS", size: "MEDIUM", categoryText: "CUV cỡ B" },
      { name: "HS", size: "MEDIUM", categoryText: "CUV cỡ C" },
      { name: "RX5", size: "MEDIUM", categoryText: "CUV cỡ C phong cách" },
      { name: "Cyberster", size: "SMALL", categoryText: "Xe mui trần thể thao điện" },
    ]
  },
  wuling: {
    id: "wuling",
    name: "Wuling",
    country: "Trung Quốc",
    logoUrl: "/images/car-logos/wuling.svg",
    models: [
      { name: "HongGuang Mini EV", size: "SMALL", categoryText: "Mini EV siêu nhỏ gọn" },
      { name: "Bingo", size: "SMALL", categoryText: "Hatchback điện cỡ nhỏ" },
    ]
  },
  byd: {
    id: "byd",
    name: "BYD",
    country: "Trung Quốc",
    logoUrl: "/images/car-logos/byd.svg",
    models: [
      { name: "Dolphin", size: "SMALL", categoryText: "Hatchback điện cỡ B" },
      { name: "Atto 3", size: "MEDIUM", categoryText: "CUV điện cỡ C" },
      { name: "Seal", size: "MEDIUM", categoryText: "Sedan điện thể thao" },
      { name: "Han", size: "MEDIUM", categoryText: "Sedan điện cao cấp" },
      { name: "Tang", size: "LARGE", categoryText: "SUV điện 7 chỗ cỡ lớn" },
    ]
  },
  volvo: {
    id: "volvo",
    name: "Volvo",
    country: "Thụy Điển",
    logoUrl: "https://cdn.simpleicons.org/volvo/00205b",
    models: [
      { name: "XC40 / EX30", size: "MEDIUM", categoryText: "CUV cỡ B/C an toàn" },
      { name: "S60 / V60", size: "MEDIUM", categoryText: "Sedan/Wagon hạng sang" },
      { name: "S90 Recharge", size: "MEDIUM", categoryText: "Sedan hạng sang cỡ trung" },
      { name: "XC60 Recharge", size: "MEDIUM", categoryText: "SUV cỡ C an toàn" },
      { name: "XC90 Recharge", size: "LARGE", categoryText: "SUV 7 chỗ cỡ đại sang trọng" },
    ]
  },
  volkswagen: {
    id: "volkswagen",
    name: "Volkswagen",
    country: "Đức",
    logoUrl: "https://cdn.simpleicons.org/volkswagen/001e50",
    models: [
      { name: "Polo", size: "SMALL", categoryText: "Hatchback hạng B" },
      { name: "Virtus", size: "SMALL", categoryText: "Sedan hạng B" },
      { name: "T-Cross", size: "MEDIUM", categoryText: "CUV cỡ B" },
      { name: "Tiguan Allspace", size: "MEDIUM", categoryText: "SUV 5+2 chỗ" },
      { name: "Teramont / X", size: "LARGE", categoryText: "SUV 7 chỗ cỡ đại" },
      { name: "Touareg", size: "LARGE", categoryText: "SUV hạng sang cỡ trung" },
      { name: "Viloran", size: "LARGE", categoryText: "MPV thương gia cỡ đại" },
    ]
  },
  skoda: {
    id: "skoda",
    name: "Skoda",
    country: "Cộng hòa Séc",
    logoUrl: "https://cdn.simpleicons.org/skoda/4ba829",
    models: [
      { name: "Karoq", size: "MEDIUM", categoryText: "CUV cỡ C nhập khẩu" },
      { name: "Kodiaq", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
      { name: "Octavia", size: "MEDIUM", categoryText: "Sedan hạng C" },
      { name: "Superb", size: "MEDIUM", categoryText: "Sedan hạng D" },
    ]
  },
  isuzu: {
    id: "isuzu",
    name: "Isuzu",
    country: "Nhật Bản",
    logoUrl: "/images/car-logos/isuzu.svg",
    models: [
      { name: "D-Max", size: "LARGE", categoryText: "Xe bán tải (Pickup)" },
      { name: "mu-X", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
    ]
  },
  landrover: {
    id: "landrover",
    name: "Land Rover",
    country: "Anh",
    logoUrl: "/images/car-logos/landrover.svg",
    models: [
      { name: "Range Rover Evoque", size: "MEDIUM", categoryText: "SUV cỡ nhỏ hạng sang" },
      { name: "Range Rover Velar", size: "MEDIUM", categoryText: "SUV thể thao phong cách" },
      { name: "Discovery Sport", size: "MEDIUM", categoryText: "SUV 5+2 chỗ" },
      { name: "Defender 90 / 110 / 130", size: "LARGE", categoryText: "SUV địa hình huyền thoại" },
      { name: "Range Rover Sport", size: "LARGE", categoryText: "SUV cỡ lớn thể thao" },
      { name: "Range Rover Autobiography", size: "LARGE", categoryText: "SUV siêu sang cỡ đại" },
    ]
  },
  jeep: {
    id: "jeep",
    name: "Jeep",
    country: "Mỹ",
    logoUrl: "https://cdn.simpleicons.org/jeep/4b5320",
    models: [
      { name: "Wrangler Rubicon / Sahara", size: "MEDIUM", categoryText: "SUV việt dã huyền thoại" },
      { name: "Gladiator", size: "LARGE", categoryText: "Xe bán tải việt dã" },
      { name: "Grand Cherokee L", size: "LARGE", categoryText: "SUV 7 chỗ cỡ đại" },
    ]
  },
  maserati: {
    id: "maserati",
    name: "Maserati",
    country: "Ý",
    logoUrl: "https://cdn.simpleicons.org/maserati/0c2340",
    models: [
      { name: "Grecale", size: "MEDIUM", categoryText: "SUV thể thao cỡ vừa" },
      { name: "Ghibli", size: "MEDIUM", categoryText: "Sedan thể thao phong cách Ý" },
      { name: "Levante", size: "LARGE", categoryText: "SUV cỡ lớn thể thao" },
      { name: "Quattroporte", size: "LARGE", categoryText: "Sedan cỡ đại hạng sang" },
    ]
  },
  astonmartin: {
    id: "astonmartin",
    name: "Aston Martin",
    country: "Anh",
    logoUrl: "https://cdn.simpleicons.org/astonmartin/005944",
    models: [
      { name: "Vantage", size: "SMALL", categoryText: "Siêu xe thể thao 2 cửa" },
      { name: "DB11 / DB12", size: "MEDIUM", categoryText: "Siêu xe Grand Tourer" },
      { name: "DBX / DBX707", size: "LARGE", categoryText: "Siêu SUV hiệu năng cao" },
    ]
  },
  bentley: {
    id: "bentley",
    name: "Bentley",
    country: "Anh",
    logoUrl: "https://cdn.simpleicons.org/bentley/000000",
    models: [
      { name: "Continental GT", size: "MEDIUM", categoryText: "Siêu xe coupe 2 cửa siêu sang" },
      { name: "Flying Spur", size: "LARGE", categoryText: "Sedan siêu sang cỡ đại" },
      { name: "Bentayga / EWB", size: "LARGE", categoryText: "Siêu SUV cỡ lớn" },
    ]
  },
  chevrolet: {
    id: "chevrolet",
    name: "Chevrolet",
    country: "Mỹ",
    logoUrl: "https://cdn.simpleicons.org/chevrolet/cd9834",
    models: [
      { name: "Spark", size: "SMALL", categoryText: "Hatchback hạng A" },
      { name: "Aveo / Cruze", size: "MEDIUM", categoryText: "Sedan hạng B/C" },
      { name: "Captiva / Orlando", size: "MEDIUM", categoryText: "CUV/MPV 7 chỗ" },
      { name: "Colorado", size: "LARGE", categoryText: "Xe bán tải (Pickup)" },
      { name: "Trailblazer", size: "LARGE", categoryText: "SUV 7 chỗ cỡ lớn" },
    ]
  },
  bugatti: {
    id: "bugatti",
    name: "Bugatti",
    country: "Pháp",
    logoUrl: "https://cdn.simpleicons.org/bugatti/e30613",
    models: [
      { name: "Chiron / Chiron Sport", size: "MEDIUM", categoryText: "Hypercar 1500 mã lực" },
      { name: "Veyron 16.4", size: "MEDIUM", categoryText: "Huyền thoại Hypercar W16" },
      { name: "Tourbillon", size: "MEDIUM", categoryText: "Hypercar thế hệ mới V16 Hybrid" },
    ]
  },
  ram: {
    id: "ram",
    name: "RAM Trucks",
    country: "Mỹ",
    logoUrl: "https://cdn.simpleicons.org/ram/000000",
    models: [
      { name: "1500 Rebel / TRX", size: "LARGE", categoryText: "Siêu bán tải cỡ đại (Full-size Pickup)" },
    ]
  }
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

export function getAllBrands(): CarBrandInfo[] {
  return Object.values(CAR_DATABASE)
}

export function searchCars(query: string): SearchResultItem[] {
  const clean = query.trim().toLowerCase()
  if (!clean) return []

  const results: SearchResultItem[] = []

  Object.values(CAR_DATABASE).forEach((brand) => {
    brand.models.forEach((m) => {
      const full = `${brand.name} ${m.name}`.toLowerCase()
      const matchBrand = brand.name.toLowerCase().includes(clean)
      const matchModel = m.name.toLowerCase().includes(clean)

      if (full.includes(clean) || matchBrand || matchModel) {
        let confidence = 85
        if (m.name.toLowerCase() === clean) confidence = 98
        else if (full === clean) confidence = 100
        else if (matchModel) confidence = 92

        let reason = `${brand.name} ${m.name} thuộc phân khúc ${m.categoryText.toLowerCase()}.`
        if (m.size === 'SMALL') {
          reason += " Kích thước gọn nhẹ (Sedan A/B, Hatchback, Siêu xe 2 chỗ, Mini EV)."
        } else if (m.size === 'MEDIUM') {
          reason += " Kích thước trung bình (Sedan C/D, CUV 5 chỗ, MPV cỡ vừa, Siêu xe Coupe)."
        } else {
          reason += " Kích thước cỡ lớn (SUV 7 chỗ, Siêu SUV, Bán tải, MPV cỡ đại)."
        }

        results.push({
          brandName: brand.name,
          modelName: m.name,
          size: m.size,
          categoryText: m.categoryText,
          confidencePct: confidence,
          reason,
        })
      }
    })
  })

  return results.sort((a, b) => b.confidencePct - a.confidencePct)
}

export function detectVehicleSize(brand: string, model: string): {
  size: VehicleSize
  categoryText: string
  confidencePct: number
  reason: string
  matchedModelName?: string
} {
  const cleanBrand = brand.trim().toLowerCase()
  const cleanModel = model.trim().toLowerCase()

  if (!cleanModel && !cleanBrand) {
    return {
      size: 'MEDIUM',
      categoryText: 'Dạng xe trung (CUV, SUV 5 chỗ, Sedan C/D)',
      confidencePct: 50,
      reason: 'Chưa đủ thông tin, hệ thống chọn mốc MEDIUM mặc định.',
    }
  }

  // Find exact or partial brand
  const brandKey = Object.keys(CAR_DATABASE).find(
    (k) =>
      k === cleanBrand ||
      CAR_DATABASE[k].name.toLowerCase() === cleanBrand ||
      cleanBrand.includes(k) ||
      k.includes(cleanBrand)
  )

  if (brandKey) {
    const brandInfo = CAR_DATABASE[brandKey]
    const matchedModel = brandInfo.models.find(
      (m) =>
        m.name.toLowerCase() === cleanModel ||
        cleanModel.includes(m.name.toLowerCase()) ||
        m.name.toLowerCase().includes(cleanModel)
    )

    if (matchedModel) {
      return {
        size: matchedModel.size,
        categoryText: matchedModel.categoryText,
        confidencePct: 95,
        reason: `${brandInfo.name} ${matchedModel.name} thuộc phân khúc ${matchedModel.categoryText.toLowerCase()}.`,
        matchedModelName: matchedModel.name,
      }
    }
  }

  // Global model search if brand not matched exactly
  const globalMatches = searchCars(cleanModel)
  if (globalMatches.length > 0) {
    const top = globalMatches[0]
    return {
      size: top.size,
      categoryText: top.categoryText,
      confidencePct: top.confidencePct,
      reason: top.reason,
      matchedModelName: top.modelName,
    }
  }

  // Heuristic rule fallback by keywords
  const fullText = `${cleanBrand} ${cleanModel}`
  if (/small|hatchback|morning|fadil|i10|wigo|vios|accent|city|swift|yaris|vf3|vf5|rio|soluto|attrage|spark|c3|venue|jazz|488|f8|296|huracan|artura/i.test(fullText)) {
    return {
      size: 'SMALL',
      categoryText: 'Xe cỡ nhỏ (Sedan A/B, Hatchback, Siêu xe 2 chỗ)',
      confidencePct: 80,
      reason: 'Nhận diện qua từ khóa phân khúc xe nhỏ gọn.',
    }
  }

  if (/ranger|everest|fortuner|santa|palisade|carnival|vf9|wild|prado|land|gls|g63|g-class|g500|alphard|viloran|triton|hilux|bt-50|navara|patrol|discovery|defender|teramont|staria|suburban|escalade|ram|1500|urus|purosangue|cullinan|cybertruck/i.test(fullText)) {
    return {
      size: 'LARGE',
      categoryText: 'Xe cỡ lớn (SUV 7 chỗ, Siêu SUV, MPV cỡ đại, Bán tải)',
      confidencePct: 85,
      reason: 'Nhận diện qua từ khóa SUV 7 chỗ / Bán tải / Siêu SUV.',
    }
  }

  return {
    size: 'MEDIUM',
    categoryText: 'Dạng xe trung (CUV, SUV 5 chỗ, Sedan C/D)',
    confidencePct: 70,
    reason: 'Phân loại tự động vào nhóm xe phổ thông cỡ vừa.',
  }
}

export function getModelsForBrand(brandName: string): CarModelInfo[] {
  const clean = brandName.trim().toLowerCase()
  if (!clean) return []
  const brandKey = Object.keys(CAR_DATABASE).find(
    (k) =>
      k === clean ||
      CAR_DATABASE[k].name.toLowerCase() === clean ||
      clean.includes(k) ||
      k.includes(clean)
  )
  return brandKey ? CAR_DATABASE[brandKey].models : []
}
