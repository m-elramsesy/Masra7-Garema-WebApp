// Robust Case Parser for Detective Investigation Game
// Accurately extracts all 6 cases: Metadata, Suspects, Watchers (Witnesses), Evidence Clues, Envelopes 1-4, Timeline, and Deduction Matrix

export function parseCaseMarkdown(markdownText, filename = 'case.md') {
  if (!markdownText || typeof markdownText !== 'string') {
    throw new Error('الملف فارغ أو غير صالح للقراءة');
  }

  // 1. Extract Title and Metadata
  const titleMatch = markdownText.match(/^#\s+([^\n]+)/m);
  const title = titleMatch 
    ? titleMatch[1].replace(/#+/g, '').replace(/^(?:قضية|ملف القضية)\s*:\s*/, '').trim() 
    : 'تحقيق جنائي غامض';

  const codeMatch = markdownText.match(/\*\*كود القضية:\*\*\s*([^\n]+)/);
  const code = codeMatch ? codeMatch[1].trim() : 'ق/2026/001';

  const categoryMatch = markdownText.match(/\*\*التصنيف(?:\s*الجنائي)?:\*\*\s*([^\n]+)/);
  const category = categoryMatch ? categoryMatch[1].trim() : 'تحقيق جنائي واغتيال غامض';

  const difficultyMatch = markdownText.match(/\*\*مستوى الصعوبة:\*\*\s*([^\n]+)/);
  const difficulty = difficultyMatch ? difficultyMatch[1].trim() : 'صعب جداً (Hard / Very Hard)';

  const durationMatch = markdownText.match(/\*\*زمن اللعب المقدر:\*\*\s*([^\n]+)/);
  const duration = durationMatch ? durationMatch[1].trim() : 'ساعتان ونصف (≥ 2.5 Hours)';

  // Extract GM Secret Setup: Culprit, Victim, Weapon, Motive
  let gmSetup = '';
  let victim = '';
  let culprit = '';
  let weapon = '';
  let motive = '';
  let location = '';

  const gmMatch = markdownText.match(/#+\s*(?:[^\n]*?)دليل موجه اللعبة[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
  if (gmMatch) {
    gmSetup = gmMatch[1].trim();
    const vicM = gmSetup.match(/\*\s*\*\*الضحية:\*\*\s*([^\n]+)/);
    if (vicM) victim = vicM[1].replace(/\([^)]*\)/g, '').trim();

    const culM = gmSetup.match(/\*\s*\*\*الجاني الحقيقي:\*\*\s*([^\n]+)/);
    if (culM) culprit = culM[1].replace(/[*_]/g, '').replace(/\([^)]*\)/g, '').trim();

    const wpnM = gmSetup.match(/\*\s*\*\*(?:أداة الجريمة|السلاح المستعمل|أداة القتل|المسروقات):\*\*\s*([^\n]+)/);
    if (wpnM) weapon = wpnM[1].trim();

    const motM = gmSetup.match(/\*\s*\*\*الدافع الحقيقي:\*\*\s*([^\n]+)/);
    if (motM) motive = motM[1].trim();
  }

  // 2. Extract Case Brief (Section 2) & Location
  let brief = '';
  const briefMatch = markdownText.match(/#+\s*(?:[^\n]*?)ملف الإحاطة الأولية[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
  if (briefMatch) {
    brief = briefMatch[1].trim();
    const locM = brief.match(/\*\s*\*\*المكان:\*\*\s*([^\n]+)/);
    if (locM) location = locM[1].trim();
    if (!victim) {
      const vM = brief.match(/(?:العثور على جثة|مقتل|وفاة|اختطاف|سرقة)\s+([^\n,.]+)/);
      if (vM) victim = vM[1].replace(/[*_]/g, '').trim();
    }
  }

  // Fallback victim & location if not extracted yet
  if (!victim) {
    if (title.includes('الألفي')) victim = 'د. رفيق الألفي';
    else if (title.includes('سنوسرت')) victim = 'ياقوتة الملك سنوسرت (عهدة ملكية)';
    else if (title.includes('زايد')) victim = 'م. طارق رشوان';
    else if (title.includes('الأقصر')) victim = 'بردية الملك حورمحب';
    else if (title.includes('السخنة')) victim = 'م. طارق عبد الحميد';
    else if (title.includes('الأيقوني')) victim = 'رجل الأعمال فؤاد النجار';
  }
  if (!location) {
    if (title.includes('الألفي')) location = 'قصر الألفي، الزمالك، القاهرة';
    else if (title.includes('سنوسرت')) location = 'غاليري أوستراكا، الزمالك، القاهرة';
    else if (title.includes('زايد')) location = 'فيلا رويال 12، الشيخ زايد، الجيزة';
    else if (title.includes('الأقصر')) location = 'معهد الدراسات البردية، الأقصر';
    else if (title.includes('السخنة')) location = 'مجمع أوبال للبتروكيماويات، العين السخنة';
    else if (title.includes('الأيقوني')) location = 'الطابق 74، البرج الأيقوني، العاصمة الإدارية';
  }

  // 3. Extract Suspect Dossiers (Section 3)
  const suspects = [];
  const suspectsSectionMatch = markdownText.match(/#+\s*(?:[^\n]*?)ملفات المشتبه بهم[^\n]*\n([\s\S]*?)(?=\n#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الأول|$)/i);
  if (suspectsSectionMatch) {
    const suspectBlocks = suspectsSectionMatch[1].split(/(?=###\s*(?:الملف|المشتبه))/);
    suspectBlocks.forEach((block, idx) => {
      const nameMatch = block.match(/###\s*(?:الملف\s*\d+|المشتبه\s*(?:به|بها|فيه)?\s*\d*)\s*[:—\-]\s*([^\n]+)/);
      if (nameMatch) {
        const name = nameMatch[1].replace(/\([^)]*\)/g, '').trim();
        const bioMatch = block.match(/\*\s*\*\*البيانات الشخصية:\*\*\s*([^\n]+)/);
        const relMatch = block.match(/\*\s*\*\*صلت[هـ]ا?(?:\s*بالضحية|\s*بالقضية)?:\*\*\s*([^\n]+)/);
        const motiveMatch = block.match(/\*\s*\*\*الدوافع المحتملة:\*\*\s*([^\n]+)/);
        const alibiMatch = block.match(/\*\s*\*\*حجة الغياب(?:\s*الأولية)?:\*\*\s*([^\n]+)/);
        const notesMatch = block.match(/\*\s*\*\*ملاحظات المحقق:\*\*\s*([^\n]+)/);

        // Preliminary Q&A in Suspect Profile
        const qMatches = [...block.matchAll(/(?:[\*\-]\s*)?(?:\*\*)?س:\s*([^\n*]+)(?:\*\*)?\s*\n\s*(?:[\*\-]\s*)?(?:\*\*)?ج:\s*["«']?([^"»'\n]+)["»']?/g)];
        const initialQA = qMatches.map(m => ({ question: m[1].trim(), answer: m[2].trim(), contradiction: false }));

        suspects.push({
          id: `suspect-${idx + 1}`,
          name,
          role: bioMatch ? (bioMatch[1].match(/المهنة:\s*([^|,\n]+)/) || ['', 'طرف مشتبه'])[1].trim() : 'طرف مشتبه',
          bio: bioMatch ? bioMatch[1].trim() : '',
          relation: relMatch ? relMatch[1].trim() : '',
          relationship: relMatch ? relMatch[1].trim() : '',
          motive: motiveMatch ? motiveMatch[1].trim() : '',
          alibi: alibiMatch ? alibiMatch[1].trim() : '',
          investigatorNotes: notesMatch ? notesMatch[1].trim() : '',
          type: 'SUSPECT',
          initialQA,
          questions: initialQA,
          status: 'UNDER_INVESTIGATION'
        });
      }
    });
  }

  // 4. Extract Envelope 1 (Scene & Clues)
  const env1Docs = [];
  const evidenceClues = [];
  const env1Match = markdownText.match(/#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الأول[^\n]*\n([\s\S]*?)(?=\n#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الثاني|$)/i);
  if (env1Match) {
    const rawEnv1 = env1Match[1];
    // Split by documents or numbered sections
    const docSplitsA = rawEnv1.split(/(?=###\s*(?:\[?وثيقة\s*1-\d+\]?|مخطط|تقرير|استمارة|محتو)|\n\d+\.\s*\*\*[^*]+\*\*:?)/);
    docSplitsA.forEach((db, i) => {
      const trimmed = db.trim();
      if (!trimmed || trimmed.length < 20) return;
      const titleM = trimmed.match(/^###\s*([^\n]+)|^\d+\.\s*\*\*([^*]+)\*\*:?/m);
      const titleText = titleM ? (titleM[1] || titleM[2]).replace(/^[#\[\]\s*]+/, '').trim() : `حرز ومعاينة رقم ${i + 1}`;
      const docType = trimmed.includes('تشريح') || trimmed.includes('طبيب شرعي') ? 'autopsy' : trimmed.includes('حرز') ? 'evidence' : 'report';
      
      env1Docs.push({
        id: `doc-1-${i + 1}`,
        title: titleText,
        content: trimmed.replace(/^###\s*[^\n]+\n|^\d+\.\s*\*\*[^*]+\*\*:?\s*/m, '').trim(),
        type: docType
      });

      // Add to evidence board clues
      evidenceClues.push({
        id: `clue-1-${i + 1}`,
        title: titleText.slice(0, 32),
        subtitle: docType === 'autopsy' ? 'تقرير طبي شرعي' : docType === 'evidence' ? 'حرز مادي محرز' : 'معاينة ميدانية',
        type: 'CLUE',
        envelope: 1,
        color: docType === 'autopsy' ? '#ef4444' : docType === 'evidence' ? '#3b82f6' : '#d4af37'
      });
    });

    if (env1Docs.length === 0) {
      env1Docs.push({
        id: 'doc-1-main',
        title: 'ملف معاينة مسرح الجريمة والأحراز المرفوعة',
        content: rawEnv1.trim(),
        type: 'report'
      });
    }
  }

  // 5. Extract Envelope 2 (Interrogations, Witnesses, Logs)
  const env2Docs = [];
  const interrogations = [];
  const witnesses = [];
  const env2Match = markdownText.match(/#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الثاني[^\n]*\n([\s\S]*?)(?=\n#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الثالث|$)/i);
  if (env2Match) {
    const rawEnv2 = env2Match[1];

    // Interrogations
    const interrogBlocks = rawEnv2.split(/(?=####?\s*(?:\d+\.\s*)?(?:محضر استجواب|استجواب))/);
    interrogBlocks.forEach((ib, idx) => {
      const headerM = ib.match(/####?\s*(?:\d+\.\s*)?(?:محضر استجواب|استجواب)\s*(?:\(\d+\)|\d+)?\s*[:—\-]\s*([^\n(]+)/);
      if (headerM) {
        const suspectName = headerM[1].trim();
        const qaList = [];
        const qaRegex = /(?:[\*\-]\s*)?(?:\*\*)?(?:س|سؤال)\s*(?:[/:]|\*\*:?)\s*([^\n*]+)(?:\*\*)?\s*\n\s*(?:[\*\-]\s*)?(?:\*\*)?(?:ج|جواب)\s*(?:[/:]|\*\*:?)\s*["«']?([^"»'\n]+)["»']?/g;
        const matches = [...ib.matchAll(qaRegex)];
        matches.forEach((qm, qIdx) => {
          qaList.push({
            id: `q-${idx}-${qIdx + 1}`,
            question: qm[1].trim(),
            answer: qm[2].trim(),
            contradiction: qm[2].includes('خفت') || qm[2].includes('كذبت') || qm[2].includes('مشيت') || qm[2].includes('تراجعت') || qm[2].includes('المفتاح')
          });
        });

        if (qaList.length > 0) {
          interrogations.push({
            id: `interrog-${idx + 1}`,
            suspectName,
            name: suspectName,
            questions: qaList
          });

          // Link to suspect in roster
          const target = suspects.find(s => s.name.includes(suspectName) || suspectName.includes(s.name));
          if (target) {
            target.questions = qaList;
          }
        }
      }
    });

    // Witnesses (Watchers)
    const witnessBlocks = rawEnv2.split(/(?=####?\s*(?:\d+\.\s*)?(?:الشاهد|الشاهدة|نموذج إفادة شاهد|إفادة الشاهد))/);
    witnessBlocks.forEach((wb, wIdx) => {
      const wHeaderM = wb.match(/####?\s*(?:\d+\.\s*)?(?:الشاهد|الشاهدة|نموذج إفادة شاهد|إفادة الشاهد)\s*(?:\(\d+\)|\d+)?\s*[:—\-]\s*([^\n(]+)/);
      if (wHeaderM) {
        const witnessName = wHeaderM[1].trim();
        const wQAs = [];
        const matches = [...wb.matchAll(/(?:[\*\-]\s*)?(?:\*\*)?(?:س|سؤال)\s*(?:[/:]|\*\*:?)\s*([^\n*]+)(?:\*\*)?\s*\n\s*(?:[\*\-]\s*)?(?:\*\*)?(?:ج|جواب)\s*(?:[/:]|\*\*:?)\s*["«']?([^"»'\n]+)["»']?/g)];
        matches.forEach((wm, qIdx) => {
          wQAs.push({
            id: `wq-${wIdx}-${qIdx + 1}`,
            question: wm[1].trim(),
            answer: wm[2].trim(),
            contradiction: false
          });
        });

        const witnessObj = {
          id: `witness-${wIdx + 1}`,
          name: witnessName,
          role: 'شاهد إثبات مستقل',
          relation: 'شاهد في محيط الحادث',
          relationship: 'شاهد في محيط الحادث',
          bio: 'أدلى بأقوال رسمية تحت القسم بمحضر الضبط',
          motive: 'لا يوجد دافع شخصي مباشر (شهادة إثبات)',
          alibi: 'تطابقت أقواله مع التواجد الميداني',
          questions: wQAs,
          initialQA: wQAs,
          type: 'WITNESS',
          status: 'NEUTRAL'
        };

        witnesses.push(witnessObj);
      }
    });

    // Documents in Envelope 2
    const docSplits2 = rawEnv2.split(/(?=###\s*\[?وثيقة\s*2-\d+\]?|####?\s*(?:\d+\.\s*)?(?:سجل|تفريغ|تقرير|استمارة)|\n\d+\.\s*\*\*[^*]+\*\*:?)/);
    docSplits2.forEach((db, i) => {
      const trimmed = db.trim();
      if (!trimmed || trimmed.includes('محضر استجواب') || trimmed.includes('إفادة شاهد') || trimmed.length < 25) return;
      const titleM = trimmed.match(/^###\s*([^\n]+)|^####?\s*([^\n]+)|^\d+\.\s*\*\*([^*]+)\*\*:?/m);
      if (titleM) {
        const titleText = (titleM[1] || titleM[2] || titleM[3]).replace(/^[#\[\]\s*]+/, '').trim();
        env2Docs.push({
          id: `doc-2-${i + 1}`,
          title: titleText,
          content: trimmed.trim(),
          type: 'tech_log'
        });

        evidenceClues.push({
          id: `clue-2-${i + 1}`,
          title: titleText.slice(0, 32),
          subtitle: 'سجل تقني / كاميرات',
          type: 'CLUE',
          envelope: 2,
          color: '#10b981'
        });
      }
    });

    if (env2Docs.length === 0) {
      env2Docs.push({
        id: 'doc-2-main',
        title: 'محاضر الاستجوابات الفورية وإفادات الشهود الفنية',
        content: rawEnv2.trim(),
        type: 'report'
      });
    }
  }

  // 6. Extract Envelope 3 (Forensics & Convergence)
  const env3Docs = [];
  const env3Match = markdownText.match(/#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الثالث[^\n]*\n([\s\S]*?)(?=\n#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الرابع|$)/i);
  if (env3Match) {
    const rawEnv3 = env3Match[1];
    const docSplits3 = rawEnv3.split(/(?=###\s*\[?وثيقة\s*3-\d+\]?|###\s*(?:أولاً|ثانياً|ثالثاً|رابعاً|خامساً)|####?\s*(?:\d+\.\s*)?تقرير)/);
    docSplits3.forEach((db, i) => {
      const trimmed = db.trim();
      if (!trimmed || trimmed.length < 20) return;
      const titleM = trimmed.match(/^###\s*([^\n]+)|^####?\s*([^\n]+)/m);
      if (titleM) {
        const titleText = (titleM[1] || titleM[2]).replace(/^[#\[\]\s*]+/, '').trim();
        env3Docs.push({
          id: `doc-3-${i + 1}`,
          title: titleText,
          content: trimmed.trim(),
          type: 'forensic'
        });

        evidenceClues.push({
          id: `clue-3-${i + 1}`,
          title: titleText.slice(0, 32),
          subtitle: 'تقرير معملي تخصصي',
          type: 'CLUE',
          envelope: 3,
          color: '#ec4899'
        });
      }
    });

    if (env3Docs.length === 0) {
      env3Docs.push({
        id: 'doc-3-main',
        title: 'التقارير المعملية والجنائية التخصصية',
        content: rawEnv3.trim(),
        type: 'forensic'
      });
    }
  }

  // 7. Extract Envelope 4 (Black Envelope: Confession & Indictment)
  const env4Docs = [];
  let indictmentText = '';
  let confessionText = '';
  const env4Match = markdownText.match(/#+\s*(?:[^\n]*?)(?:الظرف|المظروف)\s*الرابع[^\n]*\n([\s\S]*?)(?=\n#+\s*(?:[^\n]*?)(?:الحل الشامل|مصفوفة الأدلة|ملخص مسار الاستنتاج)|$)/i);
  if (env4Match) {
    const rawEnv4 = env4Match[1];
    const indictM = rawEnv4.match(/(?:قرار\s*(?:النيابة|الإحالة|الاتهام)[\s\S]*?)(?=###\s*نص الاعتراف|###\s*\[?وثيقة|\Z)/);
    if (indictM) indictmentText = indictM[0].trim();

    const confessM = rawEnv4.match(/(?:نص الاعتراف[\s\S]*?)(?=\Z|---\s*\n\s*#)/);
    if (confessM) confessionText = confessM[0].trim();

    env4Docs.push({
      id: 'doc-4-indictment',
      title: 'قرار الاتهام النهائي الصادر من النيابة العامة',
      content: indictmentText || rawEnv4.slice(0, 1000),
      type: 'indictment'
    });

    if (confessionText) {
      env4Docs.push({
        id: 'doc-4-confession',
        title: 'نص الاعتراف الكامل والتفصيلي للجاني',
        content: confessionText,
        type: 'confession'
      });
    }
  }

  // 8. Extract Deduction Matrix
  const deductionMatrix = [];
  const matrixMatch = markdownText.match(/#+\s*(?:[^\n]*?)(?:مصفوفة الأدلة|ملخص مسار الاستنتاج)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
  if (matrixMatch) {
    const lines = matrixMatch[1].split('\n').filter(l => l.includes('|') && !l.includes('---'));
    lines.slice(1).forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) {
        const isCulpritRow = culprit && (cols[2].includes(culprit) || (cols[3] && cols[3].includes(culprit)));
        deductionMatrix.push({
          clue: cols[0].replace(/[*_]/g, ''),
          redHerring: cols[1],
          truth: cols[2],
          reason: cols[2],
          suspect: cols[3] || (cols[2].split(/[:—\-]/)[0] || ''),
          status: isCulpritRow ? 'GUILTY' : 'EXONERATED'
        });
      }
    });
  }

  // 9. Extract Master Chronological Timeline (Both Markdown Table & Bullet Lists)
  const masterTimeline = [];
  const timelineMatch = markdownText.match(/#+\s*(?:[^\n]*?)(?:الجدول الزمني|الخط الزمني)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
  if (timelineMatch) {
    const rawTimeline = timelineMatch[1];
    const lines = rawTimeline.split('\n');
    lines.forEach(line => {
      const l = line.trim();
      if (l.startsWith('*') && l.includes('**')) {
        const m = l.match(/\*\s*\*\*([^*]+)\*\*(?:[:—\-\s]*)(.+)/);
        if (m) {
          const time = m[1].replace(/[:—\-]$/, '').trim();
          const event = m[2].trim();
          masterTimeline.push({
            time,
            event,
            person: '',
            actor: '',
            isKey: event.includes('وفاة') || event.includes('قتل') || event.includes('سرقة') || event.includes('اقتحام') || event.includes('سم')
          });
        }
      } else if (l.includes('|') && !l.includes('---') && !l.includes('الوقت') && !l.includes('التوقيت')) {
        const cols = l.split('|').map(x => x.trim()).filter(Boolean);
        if (cols.length >= 2) {
          masterTimeline.push({
            time: cols[0].replace(/[*_]/g, ''),
            event: cols[1],
            person: cols[2] || '',
            actor: cols[2] || '',
            isKey: cols[1].includes('وفاة') || cols[1].includes('قتل') || cols[1].includes('سرقة') || cols[1].includes('اقتحام') || cols[1].includes('سم')
          });
        }
      }
    });
  }

  // Combine suspects and witnesses into a master unified people roster
  const allPeople = [...suspects, ...witnesses];

  // Normalize Envelopes: support BOTH number/id and sections/documents
  const envelopes = [
    {
      number: 1,
      id: 1,
      title: 'المعاينة الأولية ومسرح الجريمة',
      name: 'الظرف الأول: المعاينة الميدانية والأحراز',
      description: 'افحص مسرح الجريمة، حرز أداة الحادث، وتقرير المعاينة الطبية الأولية.',
      sections: env1Docs,
      documents: env1Docs,
      rawContent: env1Match ? env1Match[1] : ''
    },
    {
      number: 2,
      id: 2,
      title: 'محاضر الاستجواب وإفادات الشهود',
      name: 'الظرف الثاني: الاستجوابات والسجلات التقنية',
      description: 'واجه المشتبه بهم بالأسئلة المباشرة، واكتشف التناقضات بين أقوالهم وتفريغ الكاميرات.',
      sections: env2Docs,
      documents: env2Docs,
      interrogations,
      witnesses,
      rawContent: env2Match ? env2Match[1] : ''
    },
    {
      number: 3,
      id: 3,
      title: 'التقارير الجنائية التخصصية وحسم اللغز',
      name: 'الظرف الثالث: الأدلة العلمية والمختبر',
      description: 'تحاليل السموم، الألياف المجهرية، فحص البصمة الوراثية، والتطابق الفيزيائي الحاسم.',
      sections: env3Docs,
      documents: env3Docs,
      rawContent: env3Match ? env3Match[1] : ''
    },
    {
      number: 4,
      id: 4,
      title: 'المظروف الأسود: الحل الكامل واعتراف الجاني',
      name: 'الظرف الرابع: قرار الاتهام واعترافات القاتل',
      description: 'كشف لغز القضية، إعادة بناء مسرح الجريمة دقيقة بدقيقة، ومصفوفة الاستبعاد الشاملة.',
      sections: env4Docs,
      documents: env4Docs,
      indictment: indictmentText,
      confession: confessionText,
      rawContent: env4Match ? env4Match[1] : ''
    }
  ];

  return {
    filename,
    title,
    code,
    category,
    difficulty,
    duration,
    metadata: {
      id: filename.replace(/\.md$/, ''),
      title,
      code,
      category,
      difficulty,
      duration,
      victim,
      location,
      killer: culprit
    },
    gmSetup,
    brief,
    suspects: allPeople, // Contains both suspects and witnesses ("watchers")
    rawSuspectsOnly: suspects,
    witnesses,
    watchers: witnesses,
    evidenceClues,
    interrogations,
    envelopes,
    deductionMatrix,
    masterTimeline,
    timeline: masterTimeline,
    solution: {
      culprit,
      motive,
      weapon,
      confession: confessionText,
      indictment: indictmentText
    },
    rawContent: markdownText
  };
}

export default parseCaseMarkdown;
