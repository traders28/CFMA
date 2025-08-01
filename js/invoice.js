// js/invoice.js
const companyData = {
  name: 'АЙ СИ ТРЕЙД ГРУП ЕООД',
  address: '1434 София ул. Босилек № 21',
  mol: 'Иван Данаилов',
  phone: '0894220307',
  iban: 'BG76FINV91501017744389',
  bank: 'ПИБ',
  bankCode: 'FINVBGSF'
};

document.getElementById('invoiceFor').addEventListener('change', () => {
  const forWhat = document.getElementById('invoiceFor').value;
  const carGroup = document.getElementById('carSelectGroup');
  carGroup.style.display = forWhat === 'Inventory Cars' ? 'block' : 'none';
  if (forWhat === 'Inventory Cars') {
    const carSelect = document.getElementById('invoiceCar');
    carSelect.innerHTML = '';
    // Simulate loading from dashboard
    const inventory = [
      { id: 'audi', brand: 'Audi', model: 'A4', year: '2020', fuel: 'Diesel', vin: '123', reg: 'AB123', price: '7500' },
      { id: 'bmw', brand: 'BMW', model: '3 Series', year: '2019', fuel: 'Gasoline', vin: '456', reg: 'CD456', price: '8800' }
    ];
    inventory.forEach(car => {
      const option = document.createElement('option');
      option.value = car.id;
      option.text = `${car.brand} ${car.model}`;
      carSelect.add(option);
    });
  }
});

document.getElementById('invoiceCar').addEventListener('change', () => {
  const carId = document.getElementById('invoiceCar').value;
  const cars = {
    audi: { brand: 'Audi', model: 'A4', year: '2020', fuel: 'Diesel', vin: '123', reg: 'AB123', price: '7500' },
    bmw: { brand: 'BMW', model: '3 Series', year: '2019', fuel: 'Gasoline', vin: '456', reg: 'CD456', price: '8800' }
  };
  const car = cars[carId];
  if (car) {
    document.getElementById('description').value = `Употребяван лек автомобил ${car.brand} ${car.model}, рама: ${car.vin}, год. ${car.year}`;
    document.getElementById('vinInvoice').value = car.vin;
    document.getElementById('regInvoice').value = car.reg;
    document.getElementById('priceInvoice').value = car.price;
  }
});

let invoiceNumber = 6;

document.getElementById('generateInvoice').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text('Фактура', 105, 10, { align: 'center' });
  doc.text('Оригинал', 105, 20, { align: 'center' });
  doc.text(`Номер: 0000000${invoiceNumber++}`, 10, 30);
  doc.text(`Дата: ${new Date().toLocaleDateString('bg-BG')}`, 10, 40);
  doc.text('Получател', 10, 50);
  doc.text(document.getElementById('buyer').value, 10, 60);
  doc.text('Доставчик', 105, 50);
  doc.text(companyData.name, 105, 60);
  doc.text('Идент. № 206091247', 105, 70);
  doc.text('Град Адрес', 10, 80);
  doc.text('с. Рибново ул. Петнадесета 17', 10, 90);
  doc.text('Град Адрес', 105, 80);
  doc.text(companyData.address, 105, 90);
  doc.text('МОЛ', 105, 100);
  doc.text(companyData.mol, 105, 110);
  doc.text('Телефон', 105, 120);
  doc.text(companyData.phone, 105, 130);
  doc.autoTable({
    startY: 140,
    head: [['№', 'Код', 'Наименование на стоката/услугата', 'Мярка', 'Количество', 'Цена', 'Сума']],
    body: [
      ['1', '', document.getElementById('description').value, 'бр.', '1.00', document.getElementById('priceInvoice').value, document.getElementById('priceInvoice').value]
    ]
  });
  doc.text(`Данъчна основа: ${document.getElementById('priceInvoice').value}`, 10, doc.lastAutoTable.finalY + 10);
  doc.text('ДДС: 0.00', 10, doc.lastAutoTable.finalY + 20);
  doc.text(`Сума за плащане: ${document.getElementById('priceInvoice').value}`, 10, doc.lastAutoTable.finalY + 30);
  doc.text('Словом: четири хиляди и двеста лв.', 10, doc.lastAutoTable.finalY + 40);
  doc.text(`Дата на данъчно събитие: ${new Date().toLocaleDateString('bg-BG')}`, 10, doc.lastAutoTable.finalY + 50);
  doc.text('Плащане: По сметка', 10, doc.lastAutoTable.finalY + 60);
  doc.text('Основание за нулева ставка: Съгл. чл.143, ал.1 от ЗДДС', 10, doc.lastAutoTable.finalY + 70);
  doc.text(`IBAN: ${companyData.iban}`, 10, doc.lastAutoTable.finalY + 80);
  doc.text('Описание на сделката: Доставка на стоки', 10, doc.lastAutoTable.finalY + 90);
  doc.text(`Банка: ${companyData.bank}`, 10, doc.lastAutoTable.finalY + 100);
  doc.text('Място на сделката: София', 10, doc.lastAutoTable.finalY + 110);
  doc.text(`Банков код: ${companyData.bankCode}`, 10, doc.lastAutoTable.finalY + 120);
  doc.text('Получил:', 10, doc.lastAutoTable.finalY + 130);
  doc.text(document.getElementById('buyer').value, 10, doc.lastAutoTable.finalY + 140);
  doc.text('Съставил: Иван Данаилов', 105, doc.lastAutoTable.finalY + 140);
  doc.save('invoice.pdf');
  window.open(doc.output('bloburl'), '_blank');

  // For Bulgaria only
  if (document.getElementById('genAppendix').checked) {
    const appDoc = new jsPDF();
    appDoc.setFontSize(12);
    appDoc.text('Приложение № 12', 10, 10);
    appDoc.text('към чл. 11, ал. 1, т. 1', 10, 20);
    appDoc.text('ДЕКЛАРАЦИЯ', 10, 30);
    appDoc.text('от', 10, 40);
    appDoc.text('Лице, което пуска на пазара МПС, или лице, което внася и/или въвежда МПС на територията на Република България за лична употреба:', 10, 50);
    appDoc.text(companyData.name, 10, 60);
    appDoc.text('(фирмено наименование по регистрация, ЕИК/трите имена на лицето, което въвежда МПС, ЕГН)', 10, 70);
    appDoc.text('представлявано от:', 10, 80);
    appDoc.text('Иван Георгиев Данаилов, ЕГН: 8409289320', 10, 90);
    appDoc.text('Седалище и адрес на управление по регистрация/постоянен адрес по лична карта:', 10, 100);
    appDoc.text('гр. София, п.к. 1111, ул. Шипченски проход № 61', 10, 110);
    appDoc.text('ДЕКЛАРИРАМ:', 10, 120);
    appDoc.text('1. Задълженията на „Ай Си Трейд Груп“ ЕООД,', 10, 130);
    appDoc.text('(физическото лице/едноличния търговец/юридическото лице, пускащо на пазара моторно превозно средство (МПС) или придобиващо го за лична употреба)', 10, 140);
    appDoc.text('по чл. 14, ал. 1 от Закона за управление на отпадъците задължения за разделно събиране и третиране, както и за постигане на съответните цели за повторна употреба и рециклиране и повторна употреба и оползотворяване на излезли от употреба моторни превозни средства (ИУМПС) се изпълняват:', 10, 150);
    appDoc.text('□ 1.1. чрез колективна система, представлявана от................................................................................,', 10, 160);
    appDoc.text('(организация по оползотворяване на ИУМПС)', 10, 170);
    appDoc.text('за което е сключен договор № …….............…. от ……….....…. г., валиден до …………..….. г.', 10, 180);
    appDoc.text('□ 1.2. индивидуално съгласно разрешение № ……….............................……………………... г.;', 10, 190);
    appDoc.text('□ 1.3. чрез заплащане на продуктова такса в Предприятието за управление на дейностите по опазване на околната среда (ПУДООС) към Министерството на околна среда и водите.', 10, 200);
    appDoc.text('2. Моторно превозно средство:', 10, 210);
    appDoc.text('марка БМВ', 10, 220);
    appDoc.text('модел 530 Д', 10, 230);
    appDoc.text('възраст (година на производство) 2012г', 10, 240);
    appDoc.text('□ нови', 10, 250);
    appDoc.text('□ до 5 години', 10, 260);
    appDoc.text('□ от 6 до 10 години', 10, 270);
    appDoc.text('□ над 10 години', 10, 280);
    appDoc.text('категория ............................…………………….…………………………………..............………….', 10, 290);
    appDoc.save('appendix12.pdf');
  }

  if (document.getElementById('genContract').checked) {
    const conDoc = new jsPDF();
    conDoc.setFontSize(12);
    conDoc.text('ДОГОВОР', 10, 10);
    conDoc.text('ЗА ПОКУПКО-ПРОДАЖБА НА МПС', 10, 20);
    conDoc.text(`Днес ${new Date().toLocaleDateString('bg-BG')} г. гр. София, между:`, 10, 30);
    conDoc.text(`1. „АЙ СИ ТРЕЙД ГРУП“ ЕООД, БУЛСТАТ: 206091247 със седалище и адрес на управление: гр. София, п.к. 1434, ул. Босилек № 21, представлявано от Иван Георгиев Данаилов, наричано за краткост ПРОДАВАЧ,`, 10, 40);
    conDoc.text('от една страна и от друга:', 10, 50);
    conDoc.text('2. Ахмед Къдриев Уламов, притежаващ л.к. No.648243455, издадена на 13.06.2019 г. от МВР - Благоевград, ЕГН: 9211030042, с постоянен/настоящ адрес: с. Рибново, ул. Петнадесета 17, наричан за краткост КУПУВАЧ,', 10, 60);
    conDoc.text('се сключи настоящия договор за покупко-продажба на следното МПС:', 10, 70);
    conDoc.text('Вид: Лек, Марка: БМВ, Модел: 530, с рама Nо.: WBAFW51030C513727. С година на производство: 19/07/2012', 10, 80);
    conDoc.text('при следните условия:', 10, 90);
    conDoc.text('1. ПРОДАВАЧЪТ продава на КУПУВАЧА описаното по-горе МПС, в състоянието в което се намира в момента на продажбата, ведно с всичките му принадлежности, за сумата от 19 000 лв. /пет хиляди лева/.', 10, 100);
    conDoc.text('2. КУПУВАЧЪТ заяви, че купува описаното по-горе МПС при посочените условия и за посочената цена, изплатена изцяло на ПРОДАВАЧА.', 10, 110);
    conDoc.text('3. Разноските по пререференс прехвърлянето са за сметка на прехвърляне на КУПУВАЧА.', 10, 120);
    conDoc.text('4. При сключването на договора бяха представени следните документи:', 10, 130);
    conDoc.text('- ф-ра 006/27.06.2025 г.', 10, 140);
    conDoc.text('ПРОДАВАЧ: ___________________', 10, 150);
    conDoc.text('КУПУВАЧ: __________________', 105, 150);
    conDoc.save('contract.pdf');
  }
});