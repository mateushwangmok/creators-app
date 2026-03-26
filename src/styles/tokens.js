export const C = {
  bg:        '#001621',
  bgD:       '#00101A',
  surf:      '#001E2B',
  card:      '#002333',
  cardH:     '#002C40',
  border:    '#0A3040',
  borderM:   '#0D4A60',
  limen:     '#E6FF2A',
  limenFade: '#E6FF2A14',
  ice:       '#C8E8F5',
  iceS:      '#5A8090',
  iceM:      '#2A4A58',
  ok:        '#28C98A',
  warn:      '#F0A030',
  rose:      '#E05070',
  violet:    '#7A8FE8',
  teal:      '#30BFA8',
  text:      '#E8F0F5',
  textS:     '#5A8090',
  textM:     '#1E3A48',
};

export const NICHES = [
  'Moda','Moda Fitness','Beleza','Gastronomia','Maternidade','Lifestyle',
  'Humor','Esportes','Automotivo','Tecnologia','Saúde e Bem-estar','Eventos',
  'Turismo','Casa e Decoração','Negócios','Música/Entretenimento',
  'Infantil/Família','Moda Praia','Moda Íntima','Sensual Comercial',
  'Sex Shop / Bem-estar Íntimo','Outro',
];

export const CONTENT_TYPES = [
  'Reels','Stories','Foto','Vídeo Falado','Trend','Review','Unboxing',
  'Presença em Evento','Presença em Loja','Campanha Externa','Publis Recorrentes',
  'Captação com Celular','Conteúdo com Roteiro','Conteúdo Espontâneo',
  'Conteúdo para Marca (depoimento)','Moda Praia','Moda Íntima',
  'Conteúdo Promocional Visual Chamativo',
];

export const NO_RECORD = [
  'Bebidas Alcoólicas','Política','Religioso','Sex Shop','Moda Íntima',
  'Moda Praia','Apostas','Infantil','Outro',
];

export const EVENT_TYPES = [
  'Presença em Evento','Recepção','Ações Promocionais','Stands',
  'Interação com Público','Gravação em Evento','Presença VIP',
];

export const FIGURINO_OPTIONS = [
  'Aceito utilizar roupas, uniformes ou figurinos definidos pela proposta do evento',
  'Aceito apenas dentro do meu estilo pessoal',
  'Não aceito utilizar figurinos definidos por terceiros',
];

export const CAMPANHA_TYPES = [
  'Conteúdo Discreto',
  'Campanhas Promocionais',
  'Campanhas Chamativas',
  'Campanhas com looks chamativos e/ou ousados',
];

export const STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

export const AGE_RANGES    = ['18–20','20–25','25–30','30–35','35–40','40–45','45+'];
export const FOLLOWER_RANGES = ['Até 10k','10k–20k','20k–50k','50k–80k','80k–200k','200k+'];
export const DIST_OPTIONS  = ['Apenas minha cidade','Até 20 km','Até 50 km','Até 100 km','Até 200 km','Acima de 200 km'];
export const FREQ_OPTIONS  = ['Diária','3x/semana','2x/semana','1x/semana','Quinzenal','Mensal','Eventual'];
export const DEADLINE_OPT  = ['24 horas','2 dias','3 dias','5 dias','7 dias','15 dias'];
export const PERIODS       = ['Manhã','Tarde','Noite','Fim de semana'];
export const GENDER_OPT    = ['feminino','masculino','outro','prefiro não informar'];

export const FEMININE_KEYWORDS = [
  'mulher','feminina','feminino','trans mulher','transexual mulher',
  'não-binário','não binário','nb','travesti','transgênero','trans',
  'she','her','ela',
];

export function isFeminineProfile(gender, genderOther = '') {
  if (gender === 'feminino') return true;
  if (gender === 'outro') {
    const lower = (genderOther || '').toLowerCase();
    return FEMININE_KEYWORDS.some(k => lower.includes(k));
  }
  return false;
}
