const menuItems = [
  { section: 'Core Management', items: [
    { icon: 'fas fa-home', text: 'Home', href: '#' },
    { icon: 'fas fa-car', text: 'My Cars', href: '#' },
    { icon: 'fas fa-truck', text: 'Trips', href: '#' },
    { icon: 'fas fa-gas-pump', text: 'Refuels', href: '#' }
  ]},
  { section: 'Financials', items: [
    { icon: 'fas fa-money-bill', text: 'Taxes', href: '#' },
    { icon: 'fas fa-dollar-sign', text: 'Incomes', href: '#' },
    { icon: 'fas fa-wrench', text: 'Repairs', href: '#' }
  ]},
  { section: 'Operations', items: [
    { icon: 'fas fa-calendar-alt', text: 'Reminders', href: '#' },
    { icon: 'fas fa-list-check', text: 'Checklists', href: '#' },
    { icon: 'fas fa-tasks', text: 'Tasks', href: '#' },
    { icon: 'fas fa-box', text: 'Storage Parts', href: '#' },
    { icon: 'fas fa-burn', text: 'Fuel consumption', href: '#' }
  ]},
  { section: 'Analytics', items: [
    { icon: 'fas fa-star', text: 'Plans', href: '#' },
    { icon: 'fas fa-download', text: 'Exports', href: '#' },
    { icon: 'fas fa-chart-bar', text: 'Reports', href: '#' },
    { icon: 'fas fa-history', text: 'Records History', href: '#' }
  ]},
  { section: 'Team & Tools', items: [
    { icon: 'fas fa-users', text: 'Employees', href: '#' },
    { icon: 'fas fa-search', text: 'Check VIN', href: '#' }
  ]}
];

function generateSidebar() {
  let html = '<h4 class="text-white">Dashboard</h4>';
  menuItems.forEach(group => {
    html += `<div class="menu-section"><h6 class="text-muted">${group.section}</h6>`;
    html += group.items.map(item => `<a href="${item.href}"><i class="${item.icon}"></i> ${item.text}</a>`).join('');
    html += '</div>';
  });
  return html;
}

function generateMobileSidebar() {
  let html = '';
  menuItems.forEach(group => {
    html += `<div class="menu-section"><h6 class="text-muted">${group.section}</h6>`;
    html += group.items.map(item => `<a href="${item.href}" class="list-group-item list-group-item-action bg-dark text-white"><i class="${item.icon}"></i> ${item.text}</a>`).join('');
    html += '</div>';
  });
  return html;
}

export { generateSidebar, generateMobileSidebar };