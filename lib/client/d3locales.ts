'use strict';

// https://github.com/mbostock/d3/wiki/Localization
// https://github.com/mbostock/d3/wiki/Time-Formatting#format
// some are in node_modules/d3/src/locale


var d3locales = { };

// @ts-expect-error TS(2339): Property 'cs_CZ' does not exist on type '{}'.
d3locales.cs_CZ = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', 'CZK'],
  dateTime: '%A %e %b %Y %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
  shortDays: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
  months: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
  shortMonths: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro']
};

// @ts-expect-error TS(2339): Property 'de_DE' does not exist on type '{}'.
d3locales.de_DE = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', ' €'],
  dateTime: '%A, der %e. %B %Y, %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'], // unused
  days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
};

// @ts-expect-error TS(2339): Property 'en_US' does not exist on type '{}'.
d3locales.en_US = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['$', ''],
  dateTime: '%a %b %e %X %Y',
  date: '%m/%d/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

// @ts-expect-error TS(2339): Property 'nb_NO' does not exist on type '{}'.
d3locales.nb_NO = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['', 'NOK'],
  dateTime: '%a %b %e %X %Y',
  date: '%d/%m-%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
  shortDays: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
  months: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des']
};

// @ts-expect-error TS(2339): Property 'es_ES' does not exist on type '{}'.
d3locales.es_ES = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', ' €'],
  dateTime: '%A, %e de %B de %Y, %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
};

// @ts-expect-error TS(2339): Property 'fi_FI' does not exist on type '{}'.
d3locales.fi_FI = {
  decimal: ',',
  thousands: '\xa0',
  grouping: [3],
  currency: ['', '\xa0€'],
  dateTime: '%A, %-d. %Bta %Y klo %X',
  date: '%-d.%-m.%Y',
  time: '%H:%M:%S',
  periods: ['a.m.', 'p.m.'],
  days: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
  shortDays: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
  months: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],
  shortMonths: ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu']
};

// @ts-expect-error TS(2339): Property 'fr_FR' does not exist on type '{}'.
d3locales.fr_FR = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', ' €'],
  dateTime: '%A, le %e %B %Y, %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'], // unused
  days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
};

// @ts-expect-error TS(2339): Property 'he_IL' does not exist on type '{}'.
d3locales.he_IL = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['₪', ''],
  dateTime: '%A, %e ב%B %Y %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  shortDays: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
  months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  shortMonths: ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳']
};

// @ts-expect-error TS(2339): Property 'it_IT' does not exist on type '{}'.
d3locales.it_IT = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['€', ''],
  dateTime: '%A %e %B %Y, %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'], // unused
  days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  shortDays: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  shortMonths: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
};

// @ts-expect-error TS(2339): Property 'pl_PL' does not exist on type '{}'.
d3locales.pl_PL = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['', 'zł'],
  dateTime: '%a %b %e %X %Y',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'], // unused
  days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
  shortDays: ['Nie', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So'],
  months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
  shortMonths: ['Sty', 'Lu', 'Mar', 'Kw', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Pa', 'Lis', 'Gru']
};

// @ts-expect-error TS(2339): Property 'pt_BR' does not exist on type '{}'.
d3locales.pt_BR = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['R$', ''],
  dateTime: '%A, %e de %B de %Y. %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
};

// @ts-expect-error TS(2339): Property 'ro_RO' does not exist on type '{}'.
d3locales.ro_RO = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['', 'RON'],
  dateTime: '%A %e %b %Y %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'],
  shortDays: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
  months: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'],
  shortMonths: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec']
};

// @ts-expect-error TS(2339): Property 'ru_RU' does not exist on type '{}'.
d3locales.ru_RU = {
  decimal: ',',
  thousands: '\xa0',
  grouping: [3],
  currency: ['', ' руб.'],
  dateTime: '%A, %e %B %Y г. %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  shortDays: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};
// @ts-expect-error TS(2339): Property 'bg_BG' does not exist on type '{}'.
d3locales.bg_BG = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['', 'лев'],
  dateTime: '%A, %e %B %Y г. %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'],
  shortDays: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  months: ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септмври', 'Октомври', 'Ноември', 'Декември'],
  shortMonths: ['Ян', 'Февр', 'Март', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Септ', 'Окт', 'Ноем', 'Дек']
};

// @ts-expect-error TS(2339): Property 'locale' does not exist on type '{}'.
d3locales.locale = function locale (language: any) {
  // map locale until we switch to full en_US
  var mapper = {
      cs: 'cs_CZ'
    , de: 'de_DE'
    , en: 'en_US'
    , es: 'es_ES'
    , fi: 'fi_FI'
    , fr: 'fr_FR'
    , he: 'he_IL'
    , it: 'it_IT'
    , pl: 'pl_PL'
    , pt: 'pt_BR'
    , ro: 'ro_RO'
    , ru: 'ru_RU'
    ,bg: 'bg_BG'
  };
  var loc = 'en_US';

  // validate the eventType input before getting the reasons list
  if (Object.prototype.hasOwnProperty.call(mapper, language)) {
    /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    loc = mapper[language];
  }

  /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return d3locales[loc];
};

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = d3locales;
