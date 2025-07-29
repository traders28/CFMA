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
  // Preview Invoice
  const invoiceText = `
Фактура
Оригинал
Номер: 0000000${invoiceNumber}
Дата: ${new Date().toLocaleDateString('bg-BG')}
Получател: ${document.getElementById('buyer').value}
Доставчик: ${companyData.name}
Идент. № 206091247
Град Адрес: с. Рибново ул. Петнадесета 17
Град Адрес: ${companyData.address}
МОЛ: ${companyData.mol}
Телефон: ${companyData.phone}
№ 1
Код:
Наименование на стоката/услугата: ${document.getElementById('description').value}
Мярка: бр.
Количество: 1.00
Цена: ${document.getElementById('priceInvoice').value}
Сума: ${document.getElementById('priceInvoice').value}
Данъчна основа: ${document.getElementById('priceInvoice').value}
ДДС: 0.00
Сума за плащане: ${document.getElementById('priceInvoice').value}
Словом: четири хиляди и двеста лв.
Дата на данъчно събитие: ${new Date().toLocaleDateString('bg-BG')}
Плащане: По сметка
Основание за нулева ставка: Съгл. чл.143, ал.1 от ЗДДС
IBAN: ${companyData.iban}
Описание на сделката: Доставка на стоки
Банка: ${companyData.bank}
Място на сделката: София
Банков код: ${companyData.bankCode}
Получил: ${document.getElementById('buyer').value}
Съставил: Иван Данаилов
  `;
  const invoicePreviewModal = new bootstrap.Modal(document.getElementById('previewModal'));
  document.getElementById('previewContent').innerText = invoiceText;
  document.getElementById('confirmGenerate').onclick = () => {
    generateInvoicePDF();
    invoicePreviewModal.hide();
    if (document.getElementById('genAppendix').checked) {
      // Preview Appendix
      const appendixText = `
Приложение № 12
към чл. 11, ал. 1, т. 1
ДЕКЛАРАЦИЯ
от
Лице, което пуска на пазара МПС, или лице, което внася и/или въвежда МПС на територията на Република България за лична употреба:
„Ай Си Трейд Груп“ ЕООД, БУЛСТАТ: 206091247,
(фирмено наименование по регистрация, ЕИК/трите имена на лицето, което въвежда МПС, ЕГН)
представлявано от:
Иван Георгиев Данаилов, ЕГН: 8409280042
(трите имена на представляващия по регистрация/упълномощено лице, ЕГН)
Седалище и адрес на управление по регистрация/постоянен адрес по лична карта:
гр. София, п.к. 1111, ул. Шипченски проход № 61
ДЕКЛАРИРАМ:
1. Задълженията на „Ай Си Трейд Груп“ ЕООД,
(физическото лице/едноличния търговец/юридическото лице, пускащо на пазара моторно превозно средство (МПС) или придобиващо го за лична употреба)
по чл. 14, ал. 1 от Закона за управление на отпадъците задължения за разделно събиране и третиране, както и за постигане на съответните цели за повторна употреба и рециклиране и повторна употреба и оползотворяване на излезли от употреба моторни превозни средства (ИУМПС) се изпълняват:
□ 1.1. чрез колективна система, представлявана от................................................................................,
(организация по оползотворяване на ИУМПС)
за което е сключен договор № …….............…. от ……….....…. г., валиден до …………..….. г.
□ 1.2. индивидуално съгласно разрешение № ……….............................……………………... г.;
□ 1.3. чрез заплащане на продуктова такса в Предприятието за управление на дейностите по опазване на околната среда (ПУДООС) към Министерството на околна среда и водите.
2. Моторно превозно средство:
марка БМВ
модел 530 Д
възраст (година на производство) 2012г
□ нови
□ до 5 години
□ от 6 до 10 години
□ над 10 години
категория ............................…………………….…………………………………..............………….
тегло ............................…………………….……….......................................................…..………….
идентификационни номера WBAFW51030C513727
(№ на двигател и № на рама)
други данни ............................…………………….………................................................………….
2.7.1. е закупено от: АЙ СИ ТРЕЙД ГРУП ЕООД, ЕИК 206091247
(трите имена и ЕГН на купувача или наименование и ЕИК на едноличния търговец/юридическото лице)
2.7.2. е придобито за лична употреба от: ГЕРМАНИЯ
(наименование на държава – членка на ЕС, или на трета страна)
ПРИЛАГАМ:
Копие на удостоверение по приложение № 13 от Наредбата за определяне на реда и размера за заплащане на продуктовата такса, издадено от:
............................…………………….…….............…………………………………………..............
(организация по оползотворяване на ИУМПС)
или
□ Копие от платежно нареждане за заплатена продуктова такса по банков път към ПУДООС.
Декларацията се издава, за да послужи пред органите на Министерството на вътрешните работи за регистрация на посоченото МПС по реда на Наредба № I-45 от 2000 г. за регистриране, отчет, пускане в движение и спиране от движение на моторните превозни средства и ремаркета, теглени от тях, и реда за предоставяне на данни за регистрираните пътни превозни средства.
Известна ми е отговорността, която нося по чл. 313 от Наказателния кодекс за попълване на неверни данни.
Дата:  27.06.2025
Декларатор:
(трите имена и подпис, длъжност и печат)
  `;
      const appendixPreviewModal = new bootstrap.Modal(document.getElementById('previewModal'));
      document.getElementById('previewContent').innerText = appendixText;
      document.getElementById('confirmGenerate').onclick = () => {
        generateAppendixPDF();
        appendixPreviewModal.hide();
      };
      appendixPreviewModal.show();
    } else if (document.getElementById('genContract').checked) {
      // Preview Contract
      const contractText = `
ДОГОВОР
ЗА ПОКУПКО-ПРОДАЖБА НА МПС
Днес 27.06.2025 г. гр. София, между:

1. „АЙ СИ ТРЕЙД ГРУП“ ЕООД, БУЛСТАТ: 206091247 със седалище и адрес на управление: гр. София, п.к. 1434, ул. Босилек № 21, представлявано от Иван Георгиев Данаилов, наричано за краткост ПРОДАВАЧ, 
от една страна и от друга:

2. Ахмед Къдриев Уламов, притежаващ л.к. No.648243455, издадена на 13.06.2019 г. от МВР - Благоевград, ЕГН: 9211030042, с постоянен/настоящ адрес: с. Рибново, ул. Петнадесета 17, наричан за краткост КУПУВАЧ,
се сключи настоящия договор за покупко-продажба на следното МПС:
Вид: Лек, Марка: БМВ, Модел: 530, с рама Nо.: WBAFW51030C513727. С година на производство: 19/07/2012
при следните условия:
1. ПРОДАВАЧЪТ продава на КУПУВАЧА описаното по-горе МПС, в състоянието в което се намира в момента на продажбата, ведно с всичките му принадлежности, за сумата от 19 000 лв. /пет хиляди лева/.

2. КУПУВАЧЪТ заяви, че купува описаното по-горе МПС при посочените условия и за посочената цена, изплатена изцяло на ПРОДАВАЧА.
3. Разноските по прехвърлянето са за сметка на КУПУВАЧА.
4. При сключването на договора бяха представени следните документи:

- ф-ра 006/27.06.2025 г.

	ПРОДАВАЧ: ___________________                 
	                                                        КУПУВАЧ: __________________ 
  `;
      const contractPreviewModal = new bootstrap.Modal(document.getElementById('previewModal'));
      document.getElementById('previewContent').innerText = contractText;
      document.getElementById('confirmGenerate').onclick = () => {
        generateContractPDF();
        contractPreviewModal.hide();
      };
      contractPreviewModal.show();
    }
  };
  invoicePreviewModal.show();
});

function generateInvoicePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text('Фактура', 105, 10, { align: 'center' });
  doc.text('Оригинал', 105, 20, { align: 'center' });
  doc.text(`Номер: 0000000${invoiceNumber}`, 10, 30);
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
}

function generateAppendixPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  // Similar to previous, fill with content from template
  doc.save('appendix12.pdf');
}

function generateContractPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  // Similar to previous, fill with content from template
  doc.save('contract.pdf');
}