
import { Book, CourseLevel, Language, MedicalField } from './types';

export const MOCK_BOOKS: Book[] = [
  {
    id: 'charaka-1',
    title: 'Charaka Samhita (Sutra Sthana)',
    author: 'Acharya Charaka',
    subject: 'Kaya Chikitsa (BAMS)',
    level: CourseLevel.UG1,
    language: Language.GUJARATI,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'cs-s1',
        title: 'Sutra Sthana (સૂત્ર સ્થાન)',
        adhyayas: [
          {
            id: 'cs-a1',
            number: 1,
            title: 'Deerghanjivitiya Adhyaya (દીર્ઘનજીવિતીય)',
            content: {
              [Language.GUJARATI]: `અધ્યાય ૧: દીર્ઘનજીવિતીય અધ્યાય\nઆયુર્વેદ એ દીર્ઘ આયુષ્ય અને આરોગ્ય માટેનું પવિત્ર જ્ઞાન છે. ભરદ્વાજ મુનિએ ઇન્દ્ર પાસેથી આ જ્ઞાન પ્રાપ્ત કર્યું હતું.\nઆયુર્વેદની વ્યાખ્યા: 'હિતાહિતં સુખં દુઃખમાયુસ્તસ્ય હિતાહિતમ્ । માનં ચ તચ્ચ યત્રોક્તમાયુર્વેદઃ સ ઉચ્યતે ॥'`,
              [Language.ENGLISH]: `Chapter 1: Quest for Longevity\nAyurveda is defined as the science that describes the nature of life (Ayu) including its beneficial (Hita) and harmful (Ahita) aspects, as well as happy (Sukha) and unhappy (Dukha) states.`
            }
          },
          {
            id: 'cs-a2',
            number: 2,
            title: 'Apamarga Tanduliya (અપામાર્ગ તંડુલીય)',
            content: {
              [Language.GUJARATI]: `અધ્યાય ૨: અપામાર્ગ તંડુલીય અધ્યાય\nઆ અધ્યાયમાં પંચકર્મ અને વમન-વિરેચન માટેના દ્રવ્યોનું વર્ણન છે. ૨૮ પ્રકારની યવાગૂનું સવિસ્તાર વર્ણન અહી જોવા મળે છે.`,
              [Language.ENGLISH]: `Chapter 2: Seed of Apamarga\nFocuses on drugs used for bio-purification (Panchakarma). Detailed description of 28 types of medicinal gruels (Yavagu).`
            }
          }
        ]
      }
    ]
  },
  {
    id: 'mbbs-anatomy',
    title: 'Gray\'s Anatomy: The Anatomical Basis of Clinical Practice',
    author: 'Henry Gray',
    subject: 'Modern Anatomy (MBBS)',
    level: CourseLevel.UG1,
    language: Language.ENGLISH,
    coverImage: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'mbbs-s1',
        title: 'Introduction to Human Anatomy',
        adhyayas: [
          {
            id: 'mbbs-a1',
            number: 1,
            title: 'Anatomical Nomenclature & Positions',
            content: {
              [Language.ENGLISH]: `Chapter 1: Anatomical Fundamentals\nDetailed coverage from A to Z of anatomical terminology. Superior vs Inferior, Medial vs Lateral. The Anatomical Position: Standing erect, eyes forward, palms facing forward.`,
              [Language.GUJARATI]: `અધ્યાય ૧: એનાટોમિકલ ફંડામેન્ટલ્સ\nએનાટોમિકલ ટર્મિનોલોજીનું A to Z કવરેજ. સુપિરિયર વિરુદ્ધ ઇન્ફિરિયર. એનાટોમિકલ પોઝિશન: ટટ્ટાર ઊભા રહેવું, આંખો સામે, હથેળીઓ આગળની તરફ.`
            }
          },
          {
            id: 'mbbs-a2',
            number: 2,
            title: 'Osteology: The Skeletal System',
            content: {
              [Language.ENGLISH]: `Chapter 2: Osteology\nComplete guide to 206 bones. Axial vs Appendicular skeleton. Structure of a long bone: Diaphysis, Epiphysis, and Metaphysis.`,
              [Language.GUJARATI]: `અધ્યાય ૨: ઓસ્ટિઓલોજી\n૨૦૬ હાડકાંની સંપૂર્ણ માર્ગદર્શિકા. અક્ષીય વિરુદ્ધ એપેન્ડીક્યુલર હાડપિંજર. લાંબા હાડકાની રચના: ડાયાફિસિસ, એપિફિસિસ અને મેટાફિસિસ.`
            }
          }
        ]
      }
    ]
  },
  {
    id: 'bds-patho',
    title: 'Textbook of Oral Pathology',
    author: 'Shafer, Hine, Levy',
    subject: 'Dentistry (BDS)',
    level: CourseLevel.UG2,
    language: Language.ENGLISH,
    coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'bds-s1',
        title: 'Developmental Disturbances',
        adhyayas: [
          {
            id: 'bds-a1',
            number: 1,
            title: 'Developmental Defects of Teeth',
            content: {
              [Language.ENGLISH]: `Chapter 1: Tooth Development Abnormalities\nComprehensive study of Enamel Hypoplasia, Dentinogenesis Imperfecta, and Gemination. Detailed A-Z breakdown of genetic markers.`,
              [Language.GUJARATI]: `અધ્યાય ૧: દાંતના વિકાસમાં અસાધારણતા\nઇનેમલ હાઇપોપ્લાસિયા અને ડેન્ટિનોજેનેસિસ ઇમ્પરફેક્ટાનો વ્યાપક અભ્યાસ. આનુવંશિક માર્કર્સનું A-Z વિશ્લેષણ.`
            }
          }
        ]
      }
    ]
  },
  {
    id: 'bhms-organon',
    title: 'Organon of Medicine',
    author: 'Samuel Hahnemann',
    subject: 'Homeopathy (BHMS)',
    level: CourseLevel.UG1,
    language: Language.ENGLISH,
    coverImage: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'bhms-s1',
        title: 'Aphorisms of Hahnemann',
        adhyayas: [
          {
            id: 'bhms-a1',
            number: 1,
            title: 'The High Mission of Physician',
            content: {
              [Language.ENGLISH]: `Aphorism 1: The physician's high and only mission is to restore the sick to health, to cure, as it is termed.\nFull A-Z philosophy of Similia Similibus Curentur.`,
              [Language.GUJARATI]: `એફોરિઝમ ૧: ચિકિત્સકનું ઉચ્ચ અને એકમાત્ર મિશન બીમારને સ્વાસ્થ્ય પાછું આપવાનું છે. હોમિયોપેથીનો પાયો 'સિમિલિયા સિમિલિબસ ક્યુરેન્ટુર' ના સિદ્ધાંત પર છે.`
            }
          }
        ]
      }
    ]
  },
  {
    id: 'nursing-fund',
    title: 'Potter & Perry\'s Fundamentals of Nursing',
    author: 'Patricia A. Potter',
    subject: 'Nursing Care',
    level: CourseLevel.UG1,
    language: Language.ENGLISH,
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'nrs-s1',
        title: 'Clinical Patient Care',
        adhyayas: [
          {
            id: 'nrs-a1',
            number: 1,
            title: 'Patient Safety & Quality',
            content: {
              [Language.ENGLISH]: `Chapter 1: A-Z Guidelines for Patient Safety\nHandling infection control, fall prevention, and medical error reduction. Proper documentation standards.`,
              [Language.GUJARATI]: `અધ્યાય ૧: દર્દીની સલામતી માટેની A-Z માર્ગદર્શિકા\nચેપ નિયંત્રણ, પડતા અટકાવવા અને તબીબી ભૂલ ઘટાડવા માટેના પ્રોટોકોલ્સ.`
            }
          }
        ]
      }
    ]
  },
  {
    id: 'pt-kine',
    title: 'Clinical Kinesiology & Biomechanics',
    author: 'Laura K. Smith',
    subject: 'Physiotherapy (PT)',
    level: CourseLevel.UG2,
    language: Language.ENGLISH,
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'pt-s1',
        title: 'Joint Mechanics',
        adhyayas: [
          {
            id: 'pt-a1',
            number: 1,
            title: 'The Knee Complex',
            content: {
              [Language.ENGLISH]: `Chapter 1: Biomechanics of the Knee\nFull analysis of ACL/PCL mechanics, Meniscal loading, and Q-angle significance in gait.`,
              [Language.GUJARATI]: `અધ્યાય ૧: ઘૂંટણનું બાયોમેકેનિક્સ\nACL/PCL મિકેનિક્સ અને ગેઇટમાં Q-એંગલના મહત્વનું સંપૂર્ણ વિશ્લેષણ.`
            }
          }
        ]
      }
    ]
  },
  {
    id: 'pharmacy-pcol',
    title: 'Essentials of Medical Pharmacology',
    author: 'K.D. Tripathi',
    subject: 'Pharmacy',
    level: CourseLevel.UG2,
    language: Language.ENGLISH,
    coverImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'ph-s1',
        title: 'Pharmacokinetics & Dynamics',
        adhyayas: [
          {
            id: 'ph-a1',
            number: 1,
            title: 'Drug Absorption & Metabolism',
            content: {
              [Language.ENGLISH]: `Chapter 1: A-Z of Drug Life Cycle\nAbsorption mechanisms, First-pass metabolism, and Cytochrome P450 interactions. Clearance and Half-life equations.`,
              [Language.GUJARATI]: `અધ્યાય ૧: ડ્રગ લાઇફ સાયકલનું A-Z\nદવાનું શોષણ, ફર્સ્ટ-પાસ મેટાબોલિઝમ અને સાયટોક્રોમ P450 ની પ્રતિક્રિયાઓ.`
            }
          }
        ]
      }
    ]
  },
  {
    id: 'health-1',
    title: 'Yoga & Healthy Living',
    author: 'Health Dept.',
    subject: 'General Wellness',
    level: 'General',
    language: Language.GUJARATI,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400',
    sthanas: [
      {
        id: 'h-s1',
        title: 'Asana & Pranayama',
        adhyayas: [
          {
            id: 'h-a1',
            number: 1,
            title: 'Modern Yoga Therapy',
            content: {
              [Language.GUJARATI]: `આસન અને પ્રાણાયામ દ્વારા શારીરિક અને માનસિક સ્વાસ્થ્યનું સંચાલન. સૂર્ય નમસ્કારના ૧૨ પગલાં અને તેના શારીરિક ફાયદા.`,
              [Language.ENGLISH]: `Management of physical and mental health through Asana and Pranayama. The 12 steps of Surya Namaskar.`
            }
          }
        ]
      }
    ]
  }
];
