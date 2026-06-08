const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');
const navLinks = document.querySelectorAll('.main-nav a');

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

const sections = [...document.querySelectorAll('section[id]')];

function setActiveLink() {
  const scrollPosition = window.scrollY + 130;

  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPosition >= top && scrollPosition < bottom) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', setActiveLink);
setActiveLink();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const terminalLines = document.querySelectorAll('.terminal-card p');
terminalLines.forEach((line, index) => {
  line.style.opacity = '0';
  line.style.transform = 'translateX(-8px)';
  setTimeout(() => {
    line.style.transition = 'opacity .35s ease, transform .35s ease';
    line.style.opacity = '1';
    line.style.transform = 'translateX(0)';
  }, 350 + index * 230);
});


/* ===== Dados dinâmicos via JSON seguro ===== */
async function carregarDadosDoSite() {
  try {
    const [clientesResponse, depoimentosResponse] = await Promise.all([
      fetch('./dados/clientes.json'),
      fetch('./dados/depoimentos.json')
    ]);

    if (!clientesResponse.ok) {
      throw new Error(`Erro ao carregar clientes.json: ${clientesResponse.status}`);
    }

    if (!depoimentosResponse.ok) {
      throw new Error(`Erro ao carregar depoimentos.json: ${depoimentosResponse.status}`);
    }

    const clientes = await clientesResponse.json();
    const depoimentos = await depoimentosResponse.json();

    renderClientes(clientes);
    renderDepoimentos(depoimentos);

    iniciarCarrosselClientes();
    iniciarCarrosselDepoimentos();
  } catch (error) {
    console.error('Falha ao carregar dados dinâmicos:', error);
  }
}

function quebrarNomeCliente(nome) {
  const partes = String(nome || '').trim().split(' ');

  if (partes.length <= 1) {
    return [String(nome || '')];
  }

  const primeiraLinha = partes.slice(0, -1).join(' ');
  const segundaLinha = partes[partes.length - 1];

  return [primeiraLinha, segundaLinha];
}

function renderClientes(clientes) {
  const track = document.getElementById('clientsTrack');
  if (!track) return;

  track.replaceChildren();

  clientes.forEach(cliente => {
    const card = document.createElement('div');
    card.className = 'client-card';

    if (cliente.logo) {
      const logo = document.createElement('img');
      logo.src = cliente.logo;
      logo.alt = cliente.nome || 'Cliente';
      logo.className = 'client-logo';
      card.appendChild(logo);
    } else {
      const icon = document.createElement('i');
      icon.className = cliente.icone || 'fa-solid fa-building';
      card.appendChild(icon);
    }

    const span = document.createElement('span');
    const linhas = quebrarNomeCliente(cliente.nome);

    linhas.forEach((linha, index) => {
      if (index > 0) {
        span.appendChild(document.createElement('br'));
      }

      span.appendChild(document.createTextNode(linha));
    });

    card.appendChild(span);
    track.appendChild(card);
  });
}

function renderDepoimentos(depoimentos) {
  const track = document.getElementById('testimonialTrack');
  if (!track) return;

  track.replaceChildren();

  depoimentos.forEach(item => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-quote-left';

    const texto = document.createElement('p');
    texto.textContent = item.texto || '';

    const autor = document.createElement('strong');
    autor.textContent = `— ${item.autor || 'Cliente Data Bridge TI'}`;

    card.appendChild(icon);
    card.appendChild(texto);
    card.appendChild(autor);

    track.appendChild(card);
  });
}

/* ===== Carrossel de Clientes ===== */
function iniciarCarrosselClientes() {
  const clientsTrack = document.querySelector('.clients-track');
  const clientsCards = document.querySelectorAll('.clients-track .client-card');
  const clientsDots = document.querySelector('.clients-dots');
  const clientsPrev = document.querySelector('.clients-prev');
  const clientsNext = document.querySelector('.clients-next');

  if (!clientsTrack || !clientsCards.length) return;

  let clientsIndex = 0;
  let clientsTimer;

  function getClientsPerView() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 1080) return 2;
    return 5;
  }

  function getClientsMaxIndex() {
    return Math.max(0, clientsCards.length - getClientsPerView());
  }

  function buildClientDots() {
    if (!clientsDots) return;

    clientsDots.replaceChildren();
    const total = getClientsMaxIndex() + 1;

    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ir para grupo de clientes ${i + 1}`);

      dot.addEventListener('click', () => {
        clientsIndex = i;
        updateClientsCarousel();
        restartClientsTimer();
      });

      clientsDots.appendChild(dot);
    }
  }

  function updateClientsCarousel() {
    const cardWidth = clientsCards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(clientsTrack).gap) || 0;
    const maxIndex = getClientsMaxIndex();

    if (clientsIndex > maxIndex) clientsIndex = 0;
    if (clientsIndex < 0) clientsIndex = maxIndex;

    clientsTrack.style.transform = `translateX(-${clientsIndex * (cardWidth + gap)}px)`;

    document.querySelectorAll('.clients-dots button').forEach((dot, index) => {
      dot.classList.toggle('active', index === clientsIndex);
    });
  }

  function nextClients() {
    clientsIndex++;
    if (clientsIndex > getClientsMaxIndex()) clientsIndex = 0;
    updateClientsCarousel();
  }

  function prevClients() {
    clientsIndex--;
    if (clientsIndex < 0) clientsIndex = getClientsMaxIndex();
    updateClientsCarousel();
  }

  function restartClientsTimer() {
    clearInterval(clientsTimer);
    clientsTimer = setInterval(nextClients, 3500);
  }

  buildClientDots();
  updateClientsCarousel();
  restartClientsTimer();

  clientsNext?.addEventListener('click', () => {
    nextClients();
    restartClientsTimer();
  });

  clientsPrev?.addEventListener('click', () => {
    prevClients();
    restartClientsTimer();
  });

  window.addEventListener('resize', () => {
    buildClientDots();
    updateClientsCarousel();
  });
}

/* ===== Carrossel de Depoimentos ===== */
function iniciarCarrosselDepoimentos() {
  const testimonialTrack = document.querySelector('.testimonial-track');
  const testimonialCards = document.querySelectorAll('.testimonial-track .testimonial-card');
  const testimonialPrev = document.querySelector('.testimonial-prev');
  const testimonialNext = document.querySelector('.testimonial-next');

  if (!testimonialTrack || !testimonialCards.length) return;

  let testimonialIndex = 0;
  let testimonialTimer;

  function getTestimonialsPerView() {
    return window.innerWidth <= 820 ? 1 : 2;
  }

  function getTestimonialsMaxIndex() {
    return Math.max(0, testimonialCards.length - getTestimonialsPerView());
  }

  function updateTestimonialsCarousel() {
    const cardWidth = testimonialCards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(testimonialTrack).gap) || 0;
    const maxIndex = getTestimonialsMaxIndex();

    if (testimonialIndex > maxIndex) testimonialIndex = 0;
    if (testimonialIndex < 0) testimonialIndex = maxIndex;

    testimonialTrack.style.transform = `translateX(-${testimonialIndex * (cardWidth + gap)}px)`;
  }

  function nextTestimonial() {
    testimonialIndex++;
    if (testimonialIndex > getTestimonialsMaxIndex()) testimonialIndex = 0;
    updateTestimonialsCarousel();
  }

  function prevTestimonial() {
    testimonialIndex--;
    if (testimonialIndex < 0) testimonialIndex = getTestimonialsMaxIndex();
    updateTestimonialsCarousel();
  }

  function restartTestimonialsTimer() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(nextTestimonial, 5000);
  }

  updateTestimonialsCarousel();
  restartTestimonialsTimer();

  testimonialNext?.addEventListener('click', () => {
    nextTestimonial();
    restartTestimonialsTimer();
  });

  testimonialPrev?.addEventListener('click', () => {
    prevTestimonial();
    restartTestimonialsTimer();
  });

  window.addEventListener('resize', updateTestimonialsCarousel);
}

carregarDadosDoSite();
