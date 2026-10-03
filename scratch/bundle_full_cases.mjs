import fs from 'fs';
import path from 'path';

const casesDir = path.resolve('../case-generator/cases');

const caseDefs = [
  {
    id: 'dar-al-alfy',
    title: 'قصر الألفي (سر الغرفة المغلقة)',
    filename: 'CASE_FILES_DAR_AL_ALFY.md',
    category: 'غرفة مغلقة وسرقة مخطوطة',
    difficulty: 'صعب جداً (Hard / Very Hard)',
    duration: '150 دقيقة',
    suspectsCount: '7 مشتبهين',
    envelopesCount: '4 أظرف + الأسود',
  },
  {
    id: 'royal-ruby',
    title: 'ياقوتة سنوسرت (سطو قاصة الزمالك)',
    filename: 'CASE_FILES_ROYAL_RUBY_HEIST.md',
    category: 'سطو ليزري عالي التقنية',
    difficulty: 'صعب جداً (Hard / Very Hard)',
    duration: '150 دقيقة',
    suspectsCount: '7 مشتبهين',
    envelopesCount: '4 أظرف + الأسود',
  },
  {
    id: 'zayed-kidnap',
    title: 'شفرة أوريون (اختطاف مهندس زايد)',
    filename: 'CASE_FILES_ZAYED_KIDNAPPING.md',
    category: 'اختطاف وفدية وتجسس رقمي',
    difficulty: 'صعب جداً (Hard / Very Hard)',
    duration: '150 دقيقة',
    suspectsCount: '7 مشتبهين',
    envelopesCount: '4 أظرف + الأسود',
  },
  {
    id: 'luxor-papyrus',
    title: 'ظل حورمحب (تزوير بردية الأقصر)',
    filename: 'CASE_FILES_LUXOR_PAPYRUS_FORGERY.md',
    category: 'تزوير أثري وسرقة كبرى',
    difficulty: 'صعب جداً (Hard / Very Hard)',
    duration: '150 دقيقة',
    suspectsCount: '7 مشتبهين',
    envelopesCount: '4 أظرف + الأسود',
  },
  {
    id: 'sukhna-sabotage',
    title: 'نبض السخنة (تخريب قاعة السيرفرات)',
    filename: 'CASE_FILES_SUKHNA_CYBER_SABOTAGE.md',
    category: 'اغتيال بغاز خانق وتخريب سيبراني',
    difficulty: 'صعب جداً (Hard / Very Hard)',
    duration: '150 دقيقة',
    suspectsCount: '7 مشتبهين',
    envelopesCount: '4 أظرف + الأسود',
  },
  {
    id: 'iconic-tower',
    title: 'شبح الأيقوني (اغتيال قمة البرج)',
    filename: 'CASE_FILES_ICONIC_TOWER_HOMICIDE.md',
    category: 'اغتيال شاهق وتحويل مالي مشفر',
    difficulty: 'أسطوري / ماستركلاس (Masterclass 9.9/10)',
    duration: '180 دقيقة',
    suspectsCount: '7 مشتبهين + 6 شهود',
    envelopesCount: '4 أظرف + الأسود',
  },
];

const fullCases = caseDefs.map(def => {
  const filePath = path.join(casesDir, def.filename);
  const rawText = fs.readFileSync(filePath, 'utf-8');
  console.log(`Loaded ${def.filename}: ${rawText.length} characters (${Buffer.byteLength(rawText, 'utf8')} bytes)`);
  return {
    ...def,
    content: rawText,
    rawMarkdown: rawText
  };
});

const outputContent = `// Preloaded tournament-grade detective cases - Full untruncated content
export const PRELOADED_CASES = ${JSON.stringify(fullCases, null, 2)};
`;

const outputPath = path.resolve('./src/data/preloadedCases.js');
fs.writeFileSync(outputPath, outputContent, 'utf-8');
console.log(`\nSuccessfully wrote ${outputPath} (${Buffer.byteLength(outputContent, 'utf8')} bytes)`);
