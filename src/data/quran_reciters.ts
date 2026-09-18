export interface QuranReciter {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  tag: string;
  riwayah: string;
  url: string;
  fallbackUrl: string;
}

export const QURAN_RECITERS: QuranReciter[] = [
  // أئمة الحرم المكي والمسجد النبوي وكبار قراء المملكة العربية السعودية
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    nameEn: 'Abdul Rahman Al-Sudais',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/sds/',
    fallbackUrl: 'https://server11.mp3quran.net/sds/'
  },
  {
    id: 'shuraym',
    name: 'سعود بن إبراهيم الشريم',
    nameEn: 'Saud Al-Shuraim',
    country: 'السعودية (إمام الحرم المكي السابق)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/shur/',
    fallbackUrl: 'https://server7.mp3quran.net/shur/'
  },
  {
    id: 'maher',
    name: 'ماهر بن حمد المعيقلي',
    nameEn: 'Maher Al-Muaiqly',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server12.mp3quran.net/maher/',
    fallbackUrl: 'https://server12.mp3quran.net/maher/'
  },
  {
    id: 'dossari',
    name: 'ياسر بن راشد الدوسري',
    nameEn: 'Yasser Al-Dosari',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/yasser/',
    fallbackUrl: 'https://server11.mp3quran.net/yasser/'
  },
  {
    id: 'juhany',
    name: 'عبد الله بن عواد الجهني',
    nameEn: 'Abdullah Awad Al-Juhany',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server13.mp3quran.net/jhn/',
    fallbackUrl: 'https://server13.mp3quran.net/jhn/'
  },
  {
    id: 'baleela',
    name: 'بندر بن عبد العزيز بليلة',
    nameEn: 'Bandar Balila',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/balilah/',
    fallbackUrl: 'https://server6.mp3quran.net/balilah/'
  },
  {
    id: 'ali_jaber',
    name: 'علي بن عبد الله جابر (رحمه الله)',
    nameEn: 'Ali Jaber',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/a_jbr/',
    fallbackUrl: 'https://server11.mp3quran.net/a_jbr/'
  },
  {
    id: 'ayyoub',
    name: 'محمد أيوب (رحمه الله)',
    nameEn: 'Muhammad Ayyub',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/ayyub/',
    fallbackUrl: 'https://server8.mp3quran.net/ayyub/'
  },
  {
    id: 'hudhaify',
    name: 'علي بن عبد الرحمن الحذيفي',
    nameEn: 'Ali Al-Hudhaify',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server9.mp3quran.net/hthfi/',
    fallbackUrl: 'https://server9.mp3quran.net/hthfi/'
  },
  {
    id: 'budair',
    name: 'صلاح بن محمد البدير',
    nameEn: 'Salah Al-Budair',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/s_bud/',
    fallbackUrl: 'https://server6.mp3quran.net/s_bud/'
  },
  {
    id: 'ahmad_hudhaify',
    name: 'أحمد بن علي الحذيفي',
    nameEn: 'Ahmad Al-Hudhaify',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/ahmad_huth/',
    fallbackUrl: 'https://server8.mp3quran.net/ahmad_huth/'
  },
  {
    id: 'muhanna',
    name: 'خالد بن سليمان المهنا',
    nameEn: 'Khalid Al-Muhanna',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/mohna/',
    fallbackUrl: 'https://server11.mp3quran.net/mohna/'
  },
  {
    id: 'baijan',
    name: 'عبد الله بن عبد الرحمن البعيجان',
    nameEn: 'Abdullah Al-Baijan',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/buajan/',
    fallbackUrl: 'https://server8.mp3quran.net/buajan/'
  },
  {
    id: 'ajamy',
    name: 'أحمد بن علي العجمي',
    nameEn: 'Ahmed Al-Ajmy',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server10.mp3quran.net/ajm/',
    fallbackUrl: 'https://server10.mp3quran.net/ajm/'
  },
  {
    id: 'ghamdi',
    name: 'سعد بن سعيد الغامدي',
    nameEn: 'Saad Al-Ghamdi',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/s_gmd/',
    fallbackUrl: 'https://server7.mp3quran.net/s_gmd/'
  },
  {
    id: 'qatami',
    name: 'ناصر بن علي القطامي',
    nameEn: 'Nasser Al-Qatami',
    country: 'المملكة العربية السعودية (الرياض)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/qtm/',
    fallbackUrl: 'https://server6.mp3quran.net/qtm/'
  },
  {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    nameEn: 'Abu Bakr Al-Shatri',
    country: 'المملكة العربية السعودية (جدة)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/shatri/',
    fallbackUrl: 'https://server11.mp3quran.net/shatri/'
  },
  {
    id: 'jaleel',
    name: 'خالد بن فهد الجليل',
    nameEn: 'Khalid Al-Jalil',
    country: 'المملكة العربية السعودية (الرياض)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server10.mp3quran.net/jleel/',
    fallbackUrl: 'https://server10.mp3quran.net/jleel/'
  },
  {
    id: 'abkar',
    name: 'إدريس بن محمد أبكر',
    nameEn: 'Idrees Abkar',
    country: 'المملكة العربية السعودية (جدة)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/abkr/',
    fallbackUrl: 'https://server6.mp3quran.net/abkr/'
  },
  {
    id: 'mansoor_salimi',
    name: 'منصور السالمي',
    nameEn: 'Mansoor Al-Salimi',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server14.mp3quran.net/mansor/',
    fallbackUrl: 'https://server14.mp3quran.net/mansor/'
  },
  {
    id: 'sayegh',
    name: 'توفيق بن سعيد الصايغ',
    nameEn: 'Tawfeeq Al-Sayegh',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/twfeeq/',
    fallbackUrl: 'https://server6.mp3quran.net/twfeeq/'
  },
  {
    id: 'alafasy',
    name: 'مشاري بن راشد العفاسي',
    nameEn: 'Mishary Rashid Alafasy',
    country: 'دولة الكويت',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/afs/',
    fallbackUrl: 'https://server8.mp3quran.net/afs/'
  },
  {
    id: 'abbad',
    name: 'فارس بن عبد ربه عباد',
    nameEn: 'Fares Abbad',
    country: 'اليمن',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/frs_a/',
    fallbackUrl: 'https://server8.mp3quran.net/frs_a/'
  },
  {
    id: 'bu_khatir',
    name: 'صلاح بن عبد الرحمن بو خاطر',
    nameEn: 'Salah Bu Khatir',
    country: 'الإمارات العربية المتحدة',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/bu_khtr/',
    fallbackUrl: 'https://server8.mp3quran.net/bu_khtr/'
  },
  {
    id: 'balushi',
    name: 'هزاع بن عبد الله البلوشي',
    nameEn: 'Hazza Al-Balushi',
    country: 'سلطنة عمان',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/hazza/',
    fallbackUrl: 'https://server11.mp3quran.net/hazza/'
  },
  {
    id: 'wadi_yamani',
    name: 'وديع بن حمادي اليمني',
    nameEn: 'Wadi Al-Yamani',
    country: 'اليمن',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/wdee3/',
    fallbackUrl: 'https://server6.mp3quran.net/wdee3/'
  },
  // عمالقة التلاوة الكلاسيكية
  {
    id: 'basit_murattal',
    name: 'عبد الباسط عبد الصمد (مرتل)',
    nameEn: 'Abdul Basit (Murattal)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/basit/',
    fallbackUrl: 'https://server7.mp3quran.net/basit/'
  },
  {
    id: 'basit_mujawwad',
    name: 'عبد الباسط عبد الصمد (مجوّد)',
    nameEn: 'Abdul Basit (Mujawwad)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/',
    fallbackUrl: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/'
  },
  {
    id: 'minshawi_murattal',
    name: 'محمد صديق المنشاوي (مرتل)',
    nameEn: 'Minshawi (Murattal)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server10.mp3quran.net/minsh/',
    fallbackUrl: 'https://server10.mp3quran.net/minsh/'
  },
  {
    id: 'minshawi_mujawwad',
    name: 'محمد صديق المنشاوي (مجوّد)',
    nameEn: 'Minshawi (Mujawwad)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/',
    fallbackUrl: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/'
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري (مرتل)',
    nameEn: 'Mahmoud Khalil Al-Husary',
    country: 'مصر (شيخ المقارئ)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server13.mp3quran.net/husr/',
    fallbackUrl: 'https://server13.mp3quran.net/husr/'
  }
];
