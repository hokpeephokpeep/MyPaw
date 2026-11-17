export const initialPets = [
  {
    "id": "pet-1",
    "name": "ชายน้อย",
    "gender": "male",
    "neutered": true,
    "birthDate": "2013-11-30",
    "status": "deceased",
    "deceasedDate": "2020-10-04",
    "note": "พี่ใหญ่สุดผู้น่ารัก เดินทางข้ามสะพานสายรุ้งเมื่อ 4 ต.ค. 2020 อยู่ในความทรงจำตลอดไป 🌈",
    "avatar": "/avatars/chainoi.png",
    "photos": [
      "/avatars/chainoi.png",
      "/photos/chainoi/1.jpg",
      "/photos/chainoi/2.jpg",
      "/photos/chainoi/3.jpg"
    ],
    "relationships": [
      { "targetPetId": "pet-2", "type": "child", "label": "ลูกสาว" }
    ]
  },
  {
    "id": "pet-2",
    "name": "ตังค์ทอน",
    "gender": "female",
    "neutered": true,
    "birthDate": "2018-05-02",
    "status": "alive",
    "deceasedDate": "",
    "note": "",
    "avatar": "/avatars/tangthon.png",
    "photos": [
      "/avatars/tangthon.png",
      "/photos/tangthon/1.jpg"
    ],
    "relationships": [
      { "targetPetId": "pet-1", "type": "parent", "label": "พ่อ" },
      { "targetPetId": "pet-3", "type": "partner", "label": "แฟน (ตัวผู้)" },
      { "targetPetId": "pet-4", "type": "child", "label": "ลูกชาย" },
      { "targetPetId": "pet-5", "type": "child", "label": "ลูกชาย" },
      { "targetPetId": "pet-6", "type": "child", "label": "ลูกชาย" },
      { "targetPetId": "pet-7", "type": "child", "label": "ลูกชาย" }
    ]
  },
  {
    "id": "pet-3",
    "name": "ไข่ต้ม",
    "gender": "male",
    "neutered": true,
    "birthDate": "2020-10-22",
    "status": "alive",
    "deceasedDate": "",
    "note": "",
    "avatar": "/avatars/khaitom.png",
    "photos": [
      "/avatars/khaitom.png",
      "/photos/khaitom/1.jpg",
      "/photos/khaitom/2.jpg",
      "/photos/khaitom/3.jpg"
    ],
    "relationships": [
      { "targetPetId": "pet-2", "type": "partner", "label": "แฟน (ตัวเมีย)" },
      { "targetPetId": "pet-4", "type": "child", "label": "ลูกชาย" },
      { "targetPetId": "pet-5", "type": "child", "label": "ลูกชาย" },
      { "targetPetId": "pet-6", "type": "child", "label": "ลูกชาย" },
      { "targetPetId": "pet-7", "type": "child", "label": "ลูกชาย" }
    ]
  },
  {
    "id": "pet-4",
    "name": "พวยพวย",
    "gender": "male",
    "neutered": true,
    "birthDate": "2021-08-14",
    "status": "alive",
    "deceasedDate": "",
    "note": "ลูกชุดแรก • พี่น้องฝาแฝดกับทัศนัยภูวดล",
    "avatar": "/avatars/phuayphuay.png",
    "photos": [
      "/avatars/phuayphuay.png",
      "/photos/phuayphuay/1.jpg",
      "/photos/phuayphuay/2.jpg",
      "/photos/phuayphuay/3.jpg",
      "/photos/phuayphuay/4.jpg",
      "/photos/phuayphuay/5.jpg"
    ],
    "relationships": [
      { "targetPetId": "pet-2", "type": "parent", "label": "แม่" },
      { "targetPetId": "pet-3", "type": "parent", "label": "พ่อ" },
      { "targetPetId": "pet-5", "type": "twin", "label": "ฝาแฝด" }
    ]
  },
  {
    "id": "pet-5",
    "name": "ทัศนัยภูวดล",
    "gender": "male",
    "neutered": true,
    "birthDate": "2021-08-14",
    "status": "alive",
    "deceasedDate": "",
    "note": "ลูกชุดแรก • พี่น้องฝาแฝดกับพวยพวย",
    "avatar": "/avatars/tassanai.png",
    "photos": [
      "/avatars/tassanai.png",
      "/photos/tassanai/1.jpg",
      "/photos/tassanai/2.jpg",
      "/photos/tassanai/3.jpg"
    ],
    "relationships": [
      { "targetPetId": "pet-2", "type": "parent", "label": "แม่" },
      { "targetPetId": "pet-3", "type": "parent", "label": "พ่อ" },
      { "targetPetId": "pet-4", "type": "twin", "label": "ฝาแฝด" }
    ]
  },
  {
    "id": "pet-6",
    "name": "ทองจิ๋ว",
    "gender": "male",
    "neutered": true,
    "birthDate": "2021-12-01",
    "status": "alive",
    "deceasedDate": "",
    "note": "ลูกชุดสอง • หนุ่มน้อยเรียบร้อย ตาแป๋ว",
    "avatar": "/avatars/thongjiew.png",
    "photos": [
      "/avatars/thongjiew.png",
      "/photos/thongjiew/1.jpg",
      "/photos/thongjiew/2.jpg"
    ],
    "relationships": [
      { "targetPetId": "pet-2", "type": "parent", "label": "แม่" },
      { "targetPetId": "pet-3", "type": "parent", "label": "พ่อ" }
    ]
  },
  {
    "id": "pet-7",
    "name": "ก๋วยเตี๋ยว",
    "gender": "male",
    "neutered": true,
    "birthDate": "2023-07-03",
    "status": "alive",
    "deceasedDate": "",
    "note": "ลูกชุดสาม • น้องเล็กสุดประจำบ้าน ซนที่สุด",
    "avatar": "/avatars/kuaytiew.png",
    "photos": [
      "/avatars/kuaytiew.png",
      "/photos/kuaytiew/1.jpg"
    ],
    "relationships": [
      { "targetPetId": "pet-2", "type": "parent", "label": "แม่" },
      { "targetPetId": "pet-3", "type": "parent", "label": "พ่อ" }
    ]
  }
];
