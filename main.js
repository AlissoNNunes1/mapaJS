import {
    locais_progamação,
    coordenadas_programação,
    estacionamentos,
    coordenadas_estacionamentos,
    outros_locais,
    coordenadas_outros,
    eventos
} from './infos.js';

const key = 'Vn2jwrU9FTKM0l0aWaqA';
const map = L.map('map', {
    center: [-11.01378936107402, -37.205408351941834],
    zoom: 20,
    maxZoom: 25,
    minZoom: 16,
    maxBounds: [
        [-10.982770195163901, -37.20741698848289],
        [-11.013675017467532, -37.23927400303676],
        [-11.013816708183606, -37.16565579329953],
        [-11.043570246347313, -37.204918838492716]
    ],
    zoomAnimation: true,
});

const mtLayer = L.maptilerLayer({
    apiKey: key,
    style: "ddcb6ffe-8ec4-47cb-a992-abaf87e10306",
}).addTo(map);

// Create layer groups
const fascGroup = L.layerGroup().addTo(map);
const estacionamentosGroup = L.layerGroup();
const outrosGroup = L.layerGroup();

// Eventos


// Function to add markers to the map
function addMarkers(locations, coordinates, iconUrl, iconSize, iconAnchor, popupAnchor, layerGroup) {
    coordinates.forEach((coord, index) => {
        const [lat, lng] = coord.split(',').map(Number);
        const icon = L.icon({
            iconUrl: iconUrl,
            iconSize: iconSize,
            iconAnchor: iconAnchor,
            popupAnchor: popupAnchor
        });

        const eventosNoLocal = eventos.filter(evento => evento.local === locations[index])
            .sort((a, b) => {
                const dataHoraA = parseDateTime(a.data, a.hora_inicio);
                const dataHoraB = parseDateTime(b.data, b.hora_inicio);
                return dataHoraA - dataHoraB;
            });

        let popupContent = `
            <h4>${locations[index]}</h4>
            <p>Local: ${locations[index]}</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank">Ir</a>
        `;

        if (eventosNoLocal.length > 0) {
            popupContent += `<h5>Eventos:</h5>`;
            eventosNoLocal.forEach(evento => {
                popupContent += `
                    <div class="evento">
                        <h4>${evento.nome}</h4>
                        <p>Artista: ${evento.artista}</p>
                        <p>Data: ${evento.data}</p>
                        <p>Hora: ${evento.hora_inicio} - ${evento.hora_fim}</p>
                        <p>Categoria: ${evento.categoria}</p>
                        <button class="compartilharFacebook" data-evento='${JSON.stringify(evento)}'><i class="fab fa-facebook-f"></i></button>
                        <button class="compartilharTwitter" data-evento='${JSON.stringify(evento)}'><i class="fab fa-twitter"></i></button>
                        <button class="compartilharWhatsapp" data-evento='${JSON.stringify(evento)}'><i class="fab fa-whatsapp"></i></button>
                    </div>
                `;
            });
        }

        const marker = L.marker([lat, lng], { icon: icon }).addTo(layerGroup)
            .bindPopup(popupContent);

        marker.on('popupopen', () => {
            configurarEventosDeCompartilhamento();
        });
    });
}

// Add markers for programação
addMarkers(locais_progamação, coordenadas_programação, 'icons/Perfil.png', [70, 70], [25, 50], [0, -50], fascGroup);

// Add markers for estacionamentos
addMarkers(estacionamentos, coordenadas_estacionamentos, 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', [25, 41], [12, 41], [1, -34], estacionamentosGroup);

// Add markers for outros locais (if coordinates are available)
if (coordenadas_outros.length > 0) {
    addMarkers(outros_locais, coordenadas_outros, 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', [25, 41], [12, 41], [1, -34], outrosGroup);
}

// Add locate control
L.control.locate({
    position: 'topright',
    strings: {
        title: "Onde Estou?",
        popup: "Você está aqui"
    },
    drawCircle: true,
    drawMarker: true,
    markerStyle: {
        color: "white",
        fillColor: 'black'
    }
}).addTo(map);

// Add layer control
const overlayMaps = {
    'FASC': fascGroup,
    'Estacionamentos': estacionamentosGroup,
    'Outros Locais': outrosGroup
};

L.control.layers(null, overlayMaps).addTo(map);

// Function to parse date and time
function parseDateTime(date, time) {
    const [day, month, year] = date.split('/');
    const [hours, minutes] = time.split(':');
    return new Date(year, month - 1, day, hours, minutes);
}

// Function to check if an event is happening now
function isHappeningNow(evento) {
    const now = new Date();
    const inicio = parseDateTime(evento.data, evento.hora_inicio);
    const fim = parseDateTime(evento.data, evento.hora_fim);
    return now >= inicio && now <= fim;
}

// Função para compartilhar no Facebook
function compartilharFacebook(evento) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Venha participar do evento "${evento.nome}" com ${evento.artista} no ${evento.local}! Não perca!`)}`;
    window.open(url, '_blank');
}

// Função para compartilhar no Twitter
function compartilharTwitter(evento) {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Venha participar do evento "${evento.nome}" com ${evento.artista} no ${evento.local}! Não perca!`)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

// Função para compartilhar no WhatsApp
function compartilharWhatsapp(evento) {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Venha participar do evento "${evento.nome}" com ${evento.artista} no ${evento.local}! Não perca!`)} - ${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

// Funções de compartilhamento para a div #compartilhamento
function compartilharFacebookMapa() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent('Acompanhe o Festival de Artes de São Cristóvão pelo nosso mapa interativo! Não perca nenhum evento!')}`;
    window.open(url, '_blank');
}

function compartilharTwitterMapa() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Acompanhe o Festival de Artes de São Cristóvão pelo nosso mapa interativo! Não perca nenhum evento!')}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function compartilharWhatsappMapa() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent('Acompanhe o Festival de Artes de São Cristóvão pelo nosso mapa interativo! Não perca nenhum evento!')} - ${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

// Adicione um evento de mudança para os filtros de data e hora
L.DomUtil.get('dataFiltro').addEventListener('change', () => {
    mostrarEventos(L.DomUtil.get('categoriaFiltro').value);
});
L.DomUtil.get('horaFiltro').addEventListener('change', () => {
    mostrarEventos(L.DomUtil.get('categoriaFiltro').value);
});

// Modifique a função mostrarEventos para considerar os filtros de data e hora
function mostrarEventos(categoria) {
    const listaEventos = L.DomUtil.get('listaEventos');
    L.DomUtil.empty(listaEventos);

    const dataFiltro = L.DomUtil.get('dataFiltro').value;
    const horaFiltro = L.DomUtil.get('horaFiltro').value;

    const eventosFiltrados = eventos
        .filter(evento => (!categoria || evento.categoria === categoria) &&
            (!dataFiltro || evento.data === dataFiltro) &&
            (!horaFiltro || evento.hora_inicio <= horaFiltro && evento.hora_fim >= horaFiltro))
        .sort((a, b) => {
            const dataHoraA = parseDateTime(a.data, a.hora_inicio);
            const dataHoraB = parseDateTime(b.data, b.hora_inicio);
            return dataHoraA - dataHoraB;
        });

    eventosFiltrados.forEach(evento => {
        const eventoDiv = L.DomUtil.create('div', 'evento', listaEventos);
        if (isHappeningNow(evento)) {
            L.DomUtil.addClass(eventoDiv, 'happening-now');
        }
        eventoDiv.innerHTML = `
            <h4>${evento.nome}</h4>
            <p>Artista: ${evento.artista}</p>
            <p>Local: ${evento.local}</p>
            <p>Data: ${evento.data}</p>
            <p>Hora: ${evento.hora_inicio} - ${evento.hora_fim}</p>
            <p>Categoria: ${evento.categoria}</p>
            <button class="compartilharFacebook" data-evento='${JSON.stringify(evento)}'><i class="fab fa-facebook-f"></i></button>
            <button class="compartilharTwitter" data-evento='${JSON.stringify(evento)}'><i class="fab fa-twitter"></i></button>
            <button class="compartilharWhatsapp" data-evento='${JSON.stringify(evento)}'><i class="fab fa-whatsapp"></i></button>
        `;
    });

    // Configurar eventos de compartilhamento após adicionar os eventos ao DOM
    configurarEventosDeCompartilhamento();
}

// Função para configurar eventos de clique nos botões de compartilhamento
function configurarEventosDeCompartilhamento() {
    document.querySelectorAll('.compartilharFacebook').forEach(button => {
        button.addEventListener('click', (e) => {
            const evento = JSON.parse(e.target.closest('button').getAttribute('data-evento'));
            compartilharFacebook(evento);
        });
    });

    document.querySelectorAll('.compartilharTwitter').forEach(button => {
        button.addEventListener('click', (e) => {
            const evento = JSON.parse(e.target.closest('button').getAttribute('data-evento'));
            compartilharTwitter(evento);
        });
    });

    document.querySelectorAll('.compartilharWhatsapp').forEach(button => {
        button.addEventListener('click', (e) => {
            const evento = JSON.parse(e.target.closest('button').getAttribute('data-evento'));
            compartilharWhatsapp(evento);
        });
    });
}

// Adicione eventos de clique para os botões de compartilhamento na div #compartilhamento
document.getElementById('compartilharFacebook').addEventListener('click', () => {
    compartilharFacebookMapa();
});

document.getElementById('compartilharTwitter').addEventListener('click', () => {
    compartilharTwitterMapa();
});

document.getElementById('compartilharWhatsapp').addEventListener('click', () => {
    compartilharWhatsappMapa();
});

L.DomUtil.get('categoriaFiltro').addEventListener('change', (e) => {
    mostrarEventos(e.target.value);
});

document.getElementById('toggleEventos').addEventListener('click', () => {
    const eventosDiv = document.getElementById('eventos');
    if (eventosDiv.style.display === 'none') {
        eventosDiv.style.display = 'block';
        document.getElementById('toggleEventos').textContent = 'Esconder Eventos';
    } else {
        eventosDiv.style.display = 'none';
        document.getElementById('toggleEventos').textContent = 'Mostrar Eventos';
    }
});

// Função para agendar notificações de eventos
function agendarNotificacoes() {
    eventos.forEach(evento => {
        const inicio = parseDateTime(evento.data, evento.hora_inicio);
        const agora = new Date();
        const tempoRestante = inicio - agora;

        if (tempoRestante > 0) {
            setTimeout(() => {
                alert(`O evento "${evento.nome}" está prestes a começar!`);
            }, tempoRestante);
        }
    });
}

agendarNotificacoes();
mostrarEventos();