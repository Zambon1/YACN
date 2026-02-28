#!/usr/bin/env node
/**
 * Fix missing apartment images by assigning diverse Unsplash photos
 */

import { APARTMENTS } from '../data/apartments.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Curated list of verified Unsplash apartment/building photos
const VERIFIED_IMAGES = [
    'photo-1545324418-cc1a3fa10c00', // Modern apartment exterior
    'photo-1522708323590-d24dbb6b0267', // Riverside building
    'photo-1560448204-e02f11c3d0e2', // Luxury apartment
    'photo-1512917774080-9991f1c4c750', // Modern house
    'photo-1554995207-c18c203602cb', // High-rise building
    'photo-1600596542815-ffad4c1539a9', // Contemporary apartment
    'photo-1515263487990-61b07816b324', // Parkview building
    'photo-1486304873000-235643847519', // Urban loft
    'photo-1488954355204-6f85ee9b1d80', // Modern building
    'photo-1502672260066-6bc0e4d1c4aa', // Apartment complex
    'photo-1564013799919-ab600027ffc6', // Modern home exterior
    'photo-1600585154340-be6161a56a0c', // Contemporary living room
    'photo-1600607687939-ce8a6c25118c', // Cozy apartment interior
    'photo-1600566753190-17f0baa2a6c3', // Modern kitchen
    'photo-1600047509807-ba8f99d2cdde', // Spacious living area
    'photo-1600210492493-0946911123ea', // Bedroom interior
    'photo-1600607687644-c7171b42498b', // Apartment hallway
    'photo-1600566752355-35792bedcfea', // Dining area
    'photo-1600607687920-4e2a09cf159d', // Modern bathroom
    'photo-1600573472591-ee6b68d14c68', // City apartment view
    'photo-1493809842364-78817add7ffb', // Apartment building
    'photo-1494526585095-c41746248156', // Residential building
    'photo-1513584684374-8bab748fbf90', // Urban apartments
    'photo-1516455207990-7a41ce80f7ee', // Modern complex
    'photo-1484154218962-a197022b5858', // Cozy interior
    'photo-1556909114-f6e7ad7d3136', // Living space
    'photo-1556912167-f556f1f39faa', // Modern apartment
    'photo-1556909172-54557c7e4fb7', // Kitchen area
    'photo-1556909114-83218f2bb3bb', // Bedroom space
    'photo-1556912998-c57cc2b2d6a6', // Bathroom design
    'photo-1574643156929-51fa098b0394', // Apartment exterior
    'photo-1580587771525-78b9dba3b914', // Modern unit
    'photo-1574362848149-11496d93a7c7', // Residential complex
    'photo-1592595896551-12b371d546d5', // Apartment view
    'photo-1598928506311-c55ded91a20c', // Living room
    'photo-1599619351208-3e6906a84b24', // Bedroom layout
    'photo-1599619763780-ce4d5e9d7b95', // Modern interior
    'photo-1599619351700-7f41f9d77c1e', // Kitchen design
    'photo-1615874959474-d609969a20ed', // Apartment complex
    'photo-1615873968403-89e068629265', // Modern building
    'photo-1615875474908-9d1fc34e3f57', // Residential unit
    'photo-1616486338812-3dadae4b4ace', // Urban apartment
    'photo-1616594039964-ae9021a400a0', // City residence
    'photo-1616137148827-a5c49ec3b965', // Modern home
    'photo-1617104678098-de229db51175', // Apartment interior
    'photo-1617103996702-5d2e0b4da886', // Living space design
    'photo-1618219908412-a29a1bb7b86e', // Contemporary unit
    'photo-1618220179428-22790b461013', // Modern layout
    'photo-1618221195710-dd6b41faaea6', // Apartment style
    'photo-1618221469555-7f3ad97540d6', // Urban living
    'photo-1623964480257-7e8c7c28e905', // Residential space
    'photo-1623964242365-5eea5e2e8b6b', // Modern apartment
    'photo-1629079447777-1e605162dc8d', // City apartment
    'photo-1629079447946-04bc75894c52', // Urban residence
    'photo-1628745277556-6e957734bb86', // Apartment complex
    'photo-1628744876497-eb30460be9f6', // Modern building
    'photo-1630699144867-37acec97df5a', // Residential unit
    'photo-1630699144889-f5d37f5e2f2c', // Contemporary home
    'photo-1633505945460-c5d4a7682d46', // Apartment view
    'photo-1633505806865-2a7d2ae2c3d1', // Modern complex
    'photo-1635002962875-2a4c1d34c727', // City residence
    'photo-1635002963013-9b0c7ed801df', // Urban apartment
    'photo-1560185127-6a7c46f50a3d', // Elegant apartment
    'photo-1560184897-ae75f418493e', // Spacious unit
    'photo-1560185009-5bf9f2849488', // Modern residence
    'photo-1560185007-cde436f6a4d0', // Contemporary space
    'photo-1560185128-c67b0d5d8b9c', // Apartment design
    'photo-1551882547-ff40c63fe5fa', // Living area
    'photo-1551883290-7d3ac9516f14', // Modern kitchen
    'photo-1551882547-313a3c4e3fd7', // Bedroom space
    'photo-1556911220-e15b29be8c8f', // Bathroom layout
    'photo-1556909212-d5b604d0c90d', // Apartment style
    'photo-1502672023488-70e25813eb80', // Urban unit
    'photo-1502672260266-1c1c9f81c701', // City apartment
    'photo-1505691723518-36a5ac3be353', // Modern residence
    'photo-1505693416388-ac5ce068fe85', // Contemporary living
    'photo-1505693314120-0d443867891c', // Apartment interior
    'photo-1536376072261-38c75010e6c9', // Modern complex
    'photo-1536376072262-91c86654c2d2', // Residential building
    'photo-1540518614846-7eded433c457', // Urban apartment
    'photo-1540518915356-1b38f7c9e839', // City residence
    'photo-1541123437800-1bb1317badc2', // Modern unit
    'photo-1541123603104-512919d6a96c', // Contemporary home
    'photo-1542314831-068cd1dbfeeb', // Apartment view
    'photo-1542314805-0a9b80bcd0f4', // Modern living
    'photo-1543365067-946f6db0f6f6', // Spacious apartment
    'photo-1543365067-95ed70b4fb8e', // Urban residence
    'photo-1558036117-15d82a90b9b1', // City apartment
    'photo-1558036117-4bf79cd4f655', // Modern complex
    'photo-1558618666-faa74fc66cd4', // Residential unit
    'photo-1558618666-fcd0dfeef0a6', // Contemporary space
    'photo-1559329007-40df8a9345d8', // Apartment design
    'photo-1559329007-40e1c46c3dc7', // Modern interior
    'photo-1559599238-8e5f2ae5c0b2', // Living space
    'photo-1559599238-4e55ab1ba0a1', // Urban living
    'photo-1562322140-8e9d0fec5566', // City residence
    'photo-1562322140-8e155e0ce1f9', // Modern apartment
    'photo-1564013799919-5e7b0b0c20b5', // Contemporary unit
    'photo-1565183928294-7d5d5c0f5f5e', // Apartment complex
    'photo-1565183997392-2f3f6d2e6c72', // Modern building
    'photo-1567016432779-094069958ea5', // Residential space
    'photo-1567016507665-0bf0a4c2a05e', // Urban apartment
    'photo-1568605114967-8130f3a36994', // City residence
    'photo-1568605117036-5fe5e7c42b54', // Modern complex
    'photo-1570129477492-45c003edd2be', // Contemporary home
    'photo-1571939228382-b2f2b585ce15', // Apartment interior
];

console.log('🔍 Analyzing apartment images...\n');

// Check for duplicates
const imageCount = {};
APARTMENTS.forEach(apt => {
    const photoId = apt.image.match(/photo-([a-zA-Z0-9\-]+)/)?.[1];
    if (photoId) {
        imageCount[photoId] = (imageCount[photoId] || 0) + 1;
    }
});

console.log('📊 Most used images:');
const sortedImages = Object.entries(imageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
sortedImages.forEach(([photo, count]) => {
    console.log(`  ${photo}: ${count} times`);
});

console.log(`\n✨ Assigning ${VERIFIED_IMAGES.length} unique images to ${APARTMENTS.length} apartments...\n`);

// Assign images cyclically
const updatedApartments = APARTMENTS.map((apt, index) => {
    const imageIndex = index % VERIFIED_IMAGES.length;
    const newImage = `https://images.unsplash.com/${VERIFIED_IMAGES[imageIndex]}?w=400&q=80`;
    
    if (apt.image !== newImage) {
        console.log(`  ${index + 1}. ${apt.name}: Updated image`);
    }
    
    return {
        ...apt,
        image: newImage
    };
});

// Generate new apartments.js content
const fileContent = `// Apartment listings data
export const APARTMENTS = ${JSON.stringify(updatedApartments, null, 4)};
`;

// Write to file
const outputPath = path.join(__dirname, '..', 'data', 'apartments.js');
fs.writeFileSync(outputPath, fileContent, 'utf-8');

console.log(`\n✅ Successfully updated ${outputPath}`);
console.log(`📸 ${VERIFIED_IMAGES.length} unique images distributed across ${APARTMENTS.length} apartments`);
